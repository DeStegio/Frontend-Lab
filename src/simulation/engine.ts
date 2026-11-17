import { DEFAULT_CONFIG, mergeConfig, sanitizeConfig } from './config';
import { createRng, hashSeed } from './rng';
import type {
  DeepPartial,
  HttpMethod,
  LogEntry,
  LogKind,
  RequestOutcome,
  SimResponse,
  SimulationConfig,
  SimulationSnapshot,
  SimulationStats,
} from './types';

/** Time source. Injected so tests (and replays) control it; defaults to the real one. */
export type Clock = {
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
};

/** Resolves globals at call time, so fake timers installed after construction still apply. */
export const systemClock: Clock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/** Hard ceilings that keep the host page safe whatever the controls say. */
export const ENGINE_LIMITS = {
  /** Real pending requests (each owns one timer). Beyond this the client answers 429. */
  maxPendingRequests: 400,
  maxLogEntries: 80,
  /** Stress actions physically executed per run; the remainder is counted as simulated. */
  maxExecutedActions: 250,
} as const;

/** Network jitter added on top of the configured latency (from the interaction spec). */
export const JITTER = { minMs: 90, spanMs: 170 } as const;
export const OFFLINE_FAIL = { minMs: 40, spanMs: 60 } as const;

export type RequestOptions<T> = {
  method: HttpMethod;
  path: string;
  /** Produces the response body. Runs only if the request succeeds, at settle time. */
  respond: () => T;
  signal?: AbortSignal;
  /** Client-side timeout. Requests slower than this settle as `timeout` at exactly this time. */
  timeoutMs?: number;
};

export type ActionRun = {
  requested: number;
  executed: number;
  cancel(): void;
};

export function abortError(): DOMException {
  return new DOMException('The simulated request was aborted.', 'AbortError');
}

export function isAbortError(error: unknown): boolean {
  return (error as { name?: unknown } | null)?.name === 'AbortError';
}

const emptyStats = (): SimulationStats => ({
  sent: 0,
  succeeded: 0,
  failed: 0,
  cancelled: 0,
  inFlight: 0,
  totalDurationMs: 0,
  requestedActions: 0,
  executedActions: 0,
  simulatedActions: 0,
});

type Pending = { handle: unknown; fail: (error: unknown) => void };

const STATUS_LABEL: Record<RequestOutcome, (status: number) => string> = {
  ok: (s) => String(s),
  error: (s) => String(s),
  offline: () => 'ERR offline',
  timeout: () => 'ERR timeout',
  throttled: () => '429 throttled',
};

const LOG_KIND: Record<RequestOutcome, LogKind> = {
  ok: 'ok',
  error: 'bad',
  offline: 'off',
  timeout: 'bad',
  throttled: 'bad',
};

/**
 * Framework-agnostic simulation core.
 *
 * - Every request captures the configuration at the moment it starts.
 * - Outcomes come from a RNG derived from (seed, request index), so a run replays exactly.
 * - Burst duplicates are logical: they share the primary call's timer and are only counted.
 * - All timers belong to the engine; `reset()` cancels every one of them and rejects pending
 *   requests with an AbortError, so stale callbacks can never touch fresh state.
 * - Subscribers are notified at most once per microtask (cheap for React's useSyncExternalStore).
 */
export class SimulationEngine {
  readonly clock: Clock;
  private config: SimulationConfig;
  private generation = 0;
  private requestIndex = 0;
  private nextId = 1;
  private stats = emptyStats();
  private log: LogEntry[] = [];
  private pending = new Map<number, Pending>();
  private tasks = new Map<number, unknown>();
  private listeners = new Set<() => void>();
  private snapshot: SimulationSnapshot | null = null;
  private notifyQueued = false;

  constructor(options: { config?: SimulationConfig; clock?: Clock } = {}) {
    this.config = sanitizeConfig(options.config ?? DEFAULT_CONFIG);
    this.clock = options.clock ?? systemClock;
  }

  // ---------- observation ----------

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): SimulationSnapshot => {
    this.snapshot ??= {
      config: this.config,
      generation: this.generation,
      stats: { ...this.stats },
      log: this.log,
    };
    return this.snapshot;
  };

  getConfig(): SimulationConfig {
    return this.config;
  }

  getGeneration(): number {
    return this.generation;
  }

  isCurrent(generation: number): boolean {
    return generation === this.generation;
  }

  // ---------- configuration ----------

  setConfig(
    patch: DeepPartial<SimulationConfig> | ((c: SimulationConfig) => DeepPartial<SimulationConfig>),
  ): void {
    const p = typeof patch === 'function' ? patch(this.config) : patch;
    this.config = mergeConfig(this.config, p);
    this.changed();
  }

  replaceConfig(config: SimulationConfig): void {
    this.config = sanitizeConfig(config);
    this.changed();
  }

  // ---------- requests ----------

  request<T>(options: RequestOptions<T>): Promise<SimResponse<T>> {
    const { method, path, signal, timeoutMs } = options;
    if (signal?.aborted) return Promise.reject(abortError());

    const id = this.nextId++;
    const cfg = this.config; // captured: later config changes never rewrite this request
    const calls = cfg.stress.burst;
    const startedAt = this.clock.now();

    if (this.pending.size >= ENGINE_LIMITS.maxPendingRequests) {
      this.bump({ sent: calls, failed: calls });
      this.pushLog(method, path, 'throttled', 429, 0, calls, 0);
      return Promise.resolve({
        id,
        status: 429,
        ok: false,
        outcome: 'throttled',
        data: null,
        durationMs: 0,
        burst: { count: calls - 1, succeeded: 0 },
      });
    }

    // Draw order is fixed (jitter, primary, shadows) so a seed always yields the same run.
    const rng = createRng(hashSeed(cfg.chaos.seed, this.requestIndex++));
    const { offline, latencyMs, failurePercent } = cfg.network;
    const failP = failurePercent / 100;

    let durationMs = Math.round(
      offline
        ? OFFLINE_FAIL.minMs + rng.next() * OFFLINE_FAIL.spanMs
        : latencyMs + JITTER.minMs + rng.next() * JITTER.spanMs,
    );
    let outcome: RequestOutcome;
    let status: number;
    if (offline) {
      outcome = 'offline';
      status = 0;
    } else if (timeoutMs !== undefined && durationMs > timeoutMs) {
      outcome = 'timeout';
      status = 0;
      durationMs = timeoutMs;
    } else if (rng.chance(failP)) {
      outcome = 'error';
      status = rng.chance(0.5) ? 500 : 503;
    } else {
      outcome = 'ok';
      status = 200;
    }

    let shadowOk = 0;
    if (outcome === 'ok' || outcome === 'error') {
      for (let i = 1; i < calls; i++) if (!rng.chance(failP)) shadowOk++;
    }

    this.bump({ sent: calls, inFlight: calls });

    return new Promise<SimResponse<T>>((resolve, reject) => {
      const onAbort = () => {
        const p = this.pending.get(id);
        if (!p) return;
        this.clock.clearTimeout(p.handle);
        this.pending.delete(id);
        this.bump({ inFlight: -calls, cancelled: calls });
        this.pushLogRow(method, path, 'cancelled', 'cancel', this.clock.now() - startedAt);
        reject(abortError());
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      const detach = () => signal?.removeEventListener('abort', onAbort);

      const handle = this.clock.setTimeout(() => {
        this.pending.delete(id);
        detach();
        const okCalls = (outcome === 'ok' ? 1 : 0) + shadowOk;
        this.bump({
          inFlight: -calls,
          succeeded: okCalls,
          failed: calls - okCalls,
          totalDurationMs: durationMs * calls,
        });
        this.pushLog(method, path, outcome, status, durationMs, calls, shadowOk);

        let data: T | null = null;
        if (outcome === 'ok') {
          try {
            data = options.respond();
          } catch (error) {
            reject(error);
            return;
          }
        }
        resolve({
          id,
          status,
          ok: outcome === 'ok',
          outcome,
          data,
          durationMs,
          burst: { count: calls - 1, succeeded: shadowOk },
        });
      }, durationMs);

      this.pending.set(id, {
        handle,
        fail: (error) => {
          detach();
          reject(error);
        },
      });
    });
  }

  // ---------- scheduling ----------

  /** One-shot timer owned by the engine: cancelled by reset, ignored if it outlives its generation. */
  schedule(fn: () => void, ms: number): () => void {
    const generation = this.generation;
    const key = this.nextId++;
    const handle = this.clock.setTimeout(() => {
      this.tasks.delete(key);
      if (generation === this.generation) fn();
    }, ms);
    this.tasks.set(key, handle);
    return () => {
      if (!this.tasks.has(key)) return;
      this.clock.clearTimeout(handle);
      this.tasks.delete(key);
    };
  }

  /** Repeats `fn` every `ms` as a chain of one-shot timers (never setInterval). */
  every(fn: () => void, ms: number): () => void {
    let cancelNext = () => {};
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      fn();
      cancelNext = this.schedule(tick, ms);
    };
    cancelNext = this.schedule(tick, ms);
    return () => {
      stopped = true;
      cancelNext();
    };
  }

  /**
   * Runs a stress burst of `total` logical actions. At most `maxExecutedActions` are executed,
   * one per `intervalMs`, so the main thread never sees a flood; the rest is reported as simulated.
   */
  runActions(total: number, intervalMs: number, action: (index: number) => void): ActionRun {
    const requested = Math.max(0, Math.floor(total));
    const executed = Math.min(requested, ENGINE_LIMITS.maxExecutedActions);
    this.bump({ requestedActions: requested, simulatedActions: requested - executed });

    let index = 0;
    let cancelNext = () => {};
    const step = () => {
      if (index >= executed) return;
      action(index++);
      this.bump({ executedActions: 1 });
      if (index < executed) cancelNext = this.schedule(step, intervalMs);
    };
    if (executed > 0) cancelNext = this.schedule(step, intervalMs);
    return { requested, executed, cancel: () => cancelNext() };
  }

  // ---------- reset ----------

  /**
   * Back to a clean lab: every pending request rejects with AbortError, every timer is cleared,
   * stats and log are emptied, config returns to defaults. The seed and chaos level are kept so
   * the same run can be replayed.
   */
  reset(): void {
    const pending = [...this.pending.values()];
    this.pending.clear();
    for (const handle of this.tasks.values()) this.clock.clearTimeout(handle);
    this.tasks.clear();

    this.generation++;
    this.requestIndex = 0;
    this.stats = emptyStats();
    this.log = [];
    this.config = mergeConfig(DEFAULT_CONFIG, {
      chaos: { seed: this.config.chaos.seed, level: this.config.chaos.level },
    });
    this.changed();

    for (const p of pending) {
      this.clock.clearTimeout(p.handle);
      p.fail(abortError());
    }
  }

  /**
   * Cancels all in-flight work without touching config or stats. Used when the host unmounts.
   * The engine stays usable afterwards (React StrictMode unmounts and remounts in development),
   * and subscribers remove themselves through the function `subscribe` returned.
   */
  dispose(): void {
    const pending = [...this.pending.values()];
    this.pending.clear();
    for (const handle of this.tasks.values()) this.clock.clearTimeout(handle);
    this.tasks.clear();
    for (const p of pending) {
      this.clock.clearTimeout(p.handle);
      p.fail(abortError());
    }
    if (pending.length > 0) this.bump({ inFlight: -this.stats.inFlight });
  }

  // ---------- internals ----------

  private bump(delta: Partial<SimulationStats>): void {
    const s = { ...this.stats };
    for (const key of Object.keys(delta) as (keyof SimulationStats)[]) {
      s[key] += delta[key] ?? 0;
    }
    this.stats = s;
    this.changed();
  }

  private pushLog(
    method: HttpMethod,
    path: string,
    outcome: RequestOutcome,
    status: number,
    durationMs: number,
    calls: number,
    shadowOk: number,
  ): void {
    if (calls > 1 && outcome !== 'throttled') {
      const shadows = calls - 1;
      this.pushLogRow(
        method,
        `${path}  ×${shadows} burst`,
        `${shadowOk}/${shadows} ok`,
        outcome === 'offline' || outcome === 'timeout'
          ? LOG_KIND[outcome]
          : shadowOk === shadows
            ? 'ok'
            : 'bad',
        durationMs,
      );
    }
    this.pushLogRow(method, path, STATUS_LABEL[outcome](status), LOG_KIND[outcome], durationMs);
  }

  private pushLogRow(
    method: HttpMethod,
    path: string,
    status: string,
    kind: LogKind,
    durationMs: number,
  ): void {
    const entry: LogEntry = {
      id: this.nextId++,
      at: this.clock.now(),
      method,
      path,
      status,
      kind,
      durationMs: Math.round(durationMs),
    };
    this.log = [entry, ...this.log].slice(0, ENGINE_LIMITS.maxLogEntries);
    this.changed();
  }

  private changed(): void {
    this.snapshot = null;
    if (this.notifyQueued) return;
    this.notifyQueued = true;
    queueMicrotask(() => {
      this.notifyQueued = false;
      for (const listener of this.listeners) listener();
    });
  }
}
