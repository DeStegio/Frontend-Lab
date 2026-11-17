import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG, DEFAULT_SEED, mergeConfig } from './config';
import { ENGINE_LIMITS, isAbortError, JITTER, SimulationEngine } from './engine';
import type { DeepPartial, SimResponse, SimulationConfig } from './types';

function engineWith(patch: DeepPartial<SimulationConfig> = {}) {
  return new SimulationEngine({ config: mergeConfig(DEFAULT_CONFIG, patch) });
}

function get(engine: SimulationEngine, signal?: AbortSignal, timeoutMs?: number) {
  return engine.request({
    method: 'GET',
    path: '/api/test',
    respond: () => 'body',
    signal,
    timeoutMs,
  });
}

/** Tracks a promise without awaiting it, so tests can assert "not settled yet". */
function track<T>(p: Promise<T>) {
  const state: { done: boolean; value?: T; error?: unknown } = { done: false };
  p.then(
    (value) => Object.assign(state, { done: true, value }),
    (error) => Object.assign(state, { done: true, error }),
  );
  return state;
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('latency', () => {
  it('settles no earlier than latency + minimum jitter and no later than the max jitter', async () => {
    const engine = engineWith({ network: { latencyMs: 5_000 } });
    const r = track(get(engine));

    await vi.advanceTimersByTimeAsync(5_000 + JITTER.minMs - 1);
    expect(r.done).toBe(false);
    await vi.advanceTimersByTimeAsync(JITTER.spanMs + 1);
    expect(r.done).toBe(true);
    expect((r.value as SimResponse<string>).data).toBe('body');
  });

  it('captures latency at request start: later changes do not rewrite pending requests', async () => {
    const engine = engineWith({ network: { latencyMs: 10_000 } });
    const slow = track(get(engine));
    engine.setConfig({ network: { latencyMs: 0 } });
    const fast = track(get(engine));

    await vi.advanceTimersByTimeAsync(500);
    expect(fast.done).toBe(true);
    expect(slow.done).toBe(false);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(slow.done).toBe(true);
  });

  it('clamps latency to the 60 s ceiling', () => {
    const engine = engineWith({ network: { latencyMs: 999_999 } });
    expect(engine.getConfig().network.latencyMs).toBe(60_000);
  });
});

describe('offline', () => {
  it('fails fast without producing a body', async () => {
    const engine = engineWith({ network: { offline: true, latencyMs: 30_000 } });
    const respond = vi.fn(() => 'never');
    const r = track(engine.request({ method: 'GET', path: '/x', respond }));
    await vi.advanceTimersByTimeAsync(100);
    expect(r.done).toBe(true);
    expect(r.value).toMatchObject({ ok: false, status: 0, outcome: 'offline', data: null });
    expect(respond).not.toHaveBeenCalled();
    expect(engine.getSnapshot().log[0]).toMatchObject({ status: 'ERR offline', kind: 'off' });
  });
});

describe('failure probability', () => {
  async function outcomes(failurePercent: number, n = 200) {
    const engine = engineWith({ network: { failurePercent } });
    const all = Array.from({ length: n }, () => get(engine));
    await vi.advanceTimersByTimeAsync(1_000);
    return Promise.all(all);
  }

  it('0% never fails', async () => {
    const res = await outcomes(0);
    expect(res.every((r) => r.ok)).toBe(true);
  });

  it('100% always fails with 500 or 503', async () => {
    const res = await outcomes(100);
    expect(res.every((r) => !r.ok && (r.status === 500 || r.status === 503))).toBe(true);
  });

  it('50% lands near half over many requests', async () => {
    const res = await outcomes(50, 400);
    const failed = res.filter((r) => !r.ok).length;
    expect(failed).toBeGreaterThan(150);
    expect(failed).toBeLessThan(250);
  });
});

describe('seed reproducibility', () => {
  async function run(seed: number) {
    const engine = engineWith({ network: { failurePercent: 50 }, chaos: { seed } });
    const all = Array.from({ length: 30 }, () => get(engine));
    await vi.advanceTimersByTimeAsync(1_000);
    return (await Promise.all(all)).map((r) => `${r.status}:${r.durationMs}`);
  }

  it('the same seed replays the same statuses and durations', async () => {
    expect(await run(42)).toEqual(await run(42));
  });

  it('a different seed produces a different run', async () => {
    expect(await run(42)).not.toEqual(await run(43));
  });

  it('reset restarts the sequence, so a run replays after reset', async () => {
    const engine = engineWith({ network: { failurePercent: 50 }, chaos: { seed: 7 } });
    const first = Array.from({ length: 10 }, () => get(engine));
    await vi.advanceTimersByTimeAsync(1_000);
    const a = (await Promise.all(first)).map((r) => r.status);

    engine.reset();
    engine.setConfig({ network: { failurePercent: 50 } });
    const second = Array.from({ length: 10 }, () => get(engine));
    await vi.advanceTimersByTimeAsync(1_000);
    const b = (await Promise.all(second)).map((r) => r.status);
    expect(b).toEqual(a);
  });
});

describe('cancellation', () => {
  it('aborting rejects with AbortError, frees the slot and never builds a body', async () => {
    const engine = engineWith({ network: { latencyMs: 2_000 } });
    const controller = new AbortController();
    const respond = vi.fn(() => 'x');
    const r = track(
      engine.request({ method: 'GET', path: '/x', respond, signal: controller.signal }),
    );
    expect(engine.getSnapshot().stats.inFlight).toBe(1);

    controller.abort();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(isAbortError(r.error)).toBe(true);
    expect(respond).not.toHaveBeenCalled();
    expect(engine.getSnapshot().stats).toMatchObject({ inFlight: 0, cancelled: 1, succeeded: 0 });
  });

  it('an already-aborted signal rejects immediately', async () => {
    const engine = engineWith();
    const controller = new AbortController();
    controller.abort();
    await expect(get(engine, controller.signal)).rejects.toSatisfy(isAbortError);
    expect(engine.getSnapshot().stats.sent).toBe(0);
  });
});

describe('timeout', () => {
  it('settles as timeout at the client deadline when latency exceeds it', async () => {
    const engine = engineWith({ network: { latencyMs: 20_000 } });
    const r = track(get(engine, undefined, 3_000));
    await vi.advanceTimersByTimeAsync(2_999);
    expect(r.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(r.value).toMatchObject({ outcome: 'timeout', status: 0, durationMs: 3_000 });
  });
});

describe('reset', () => {
  it('rejects pending work, clears timers, stats and log, and restores defaults but keeps the seed', async () => {
    const engine = engineWith({
      network: { latencyMs: 4_000, failurePercent: 30 },
      mutation: { itemCount: 200 },
      chaos: { seed: 99 },
    });
    const pending = track(get(engine));
    const task = vi.fn();
    engine.schedule(task, 1_000);
    const generation = engine.getGeneration();

    engine.reset();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(isAbortError(pending.error)).toBe(true);
    expect(task).not.toHaveBeenCalled();
    const snap = engine.getSnapshot();
    expect(snap.generation).toBe(generation + 1);
    expect(snap.stats).toMatchObject({ sent: 0, inFlight: 0, failed: 0 });
    expect(snap.log).toHaveLength(0);
    expect(snap.config.network).toEqual(DEFAULT_CONFIG.network);
    expect(snap.config.mutation).toEqual(DEFAULT_CONFIG.mutation);
    expect(snap.config.chaos.seed).toBe(99);
  });

  it('stale callbacks from an old generation cannot fire', async () => {
    const engine = engineWith();
    const generation = engine.getGeneration();
    engine.reset();
    expect(engine.isCurrent(generation)).toBe(false);
    expect(engine.isCurrent(engine.getGeneration())).toBe(true);
  });
});

describe('request burst', () => {
  it('counts every duplicate while only the primary call carries the body', async () => {
    const engine = engineWith({ stress: { burst: 10 } });
    const r = track(get(engine));
    expect(engine.getSnapshot().stats).toMatchObject({ sent: 10, inFlight: 10 });

    await vi.advanceTimersByTimeAsync(1_000);
    expect(r.value).toMatchObject({ ok: true, data: 'body', burst: { count: 9, succeeded: 9 } });
    const s = engine.getSnapshot();
    expect(s.stats).toMatchObject({ sent: 10, inFlight: 0, succeeded: 10, failed: 0 });
    expect(s.log.some((e) => e.path.includes('×9 burst'))).toBe(true);
  });
});

describe('combined conditions', () => {
  it('offline overrides latency and failures for the whole burst', async () => {
    const engine = engineWith({
      network: { offline: true, latencyMs: 40_000, failurePercent: 80 },
      stress: { burst: 25 },
      mutation: { itemCount: 240, textExpansion: 100 },
    });
    const r = track(get(engine));
    await vi.advanceTimersByTimeAsync(100);
    expect(r.value).toMatchObject({ outcome: 'offline' });
    expect(engine.getSnapshot().stats).toMatchObject({ sent: 25, failed: 25, inFlight: 0 });
  });

  it('latency, failures and bursts apply together', async () => {
    const engine = engineWith({
      network: { latencyMs: 2_000, failurePercent: 100 },
      stress: { burst: 5 },
    });
    const r = track(get(engine));
    await vi.advanceTimersByTimeAsync(2_000);
    expect(r.done).toBe(false);
    await vi.advanceTimersByTimeAsync(JITTER.minMs + JITTER.spanMs);
    expect(r.value).toMatchObject({ ok: false, burst: { count: 4, succeeded: 0 } });
    expect(engine.getSnapshot().stats.failed).toBe(5);
  });
});

describe('request ordering', () => {
  it('requests settle by their own captured latency, not by start order', async () => {
    const engine = engineWith({ network: { latencyMs: 3_000 } });
    const order: string[] = [];
    void get(engine).then(() => order.push('first'));
    engine.setConfig({ network: { latencyMs: 0 } });
    void get(engine).then(() => order.push('second'));
    await vi.advanceTimersByTimeAsync(4_000);
    expect(order).toEqual(['second', 'first']);
  });
});

describe('safety limits', () => {
  it('answers 429 instead of creating more than the pending ceiling', async () => {
    const engine = engineWith({ network: { latencyMs: 60_000 } });
    const all = Array.from({ length: ENGINE_LIMITS.maxPendingRequests + 5 }, () => get(engine));
    const extra = await all[all.length - 1]!;
    expect(extra).toMatchObject({ status: 429, outcome: 'throttled' });
    engine.reset();
    await Promise.allSettled(all);
  });

  it('runActions executes at most the cap and reports the rest as simulated', async () => {
    const engine = engineWith();
    const action = vi.fn();
    const run = engine.runActions(10_000, 28, action);
    expect(run).toMatchObject({ requested: 10_000, executed: ENGINE_LIMITS.maxExecutedActions });

    await vi.advanceTimersByTimeAsync(28 * 10);
    expect(action).toHaveBeenCalledTimes(10);
    await vi.advanceTimersByTimeAsync(28 * 1_000);
    expect(action).toHaveBeenCalledTimes(ENGINE_LIMITS.maxExecutedActions);
    expect(engine.getSnapshot().stats).toMatchObject({
      requestedActions: 10_000,
      executedActions: ENGINE_LIMITS.maxExecutedActions,
      simulatedActions: 10_000 - ENGINE_LIMITS.maxExecutedActions,
    });
  });

  it('reset stops an action run and a repeating task mid-flight', async () => {
    const engine = engineWith();
    const action = vi.fn();
    const tick = vi.fn();
    engine.runActions(100, 28, action);
    engine.every(tick, 500);
    await vi.advanceTimersByTimeAsync(1_000);
    const actionsSoFar = action.mock.calls.length;
    const ticksSoFar = tick.mock.calls.length;
    expect(ticksSoFar).toBe(2);

    engine.reset();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(action).toHaveBeenCalledTimes(actionsSoFar);
    expect(tick).toHaveBeenCalledTimes(ticksSoFar);
  });
});

describe('observation', () => {
  it('batches notifications per microtask and keeps snapshots stable between changes', async () => {
    const engine = engineWith();
    const listener = vi.fn();
    engine.subscribe(listener);
    engine.setConfig({ network: { latencyMs: 100 } });
    engine.setConfig({ network: { latencyMs: 200 } });
    engine.setConfig({ network: { latencyMs: 300 } });
    expect(listener).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(listener).toHaveBeenCalledTimes(1);

    const a = engine.getSnapshot();
    expect(engine.getSnapshot()).toBe(a);
    engine.setConfig({ network: { latencyMs: 400 } });
    expect(engine.getSnapshot()).not.toBe(a);
  });

  it('uses the default seed out of the box', () => {
    expect(new SimulationEngine().getConfig().chaos.seed).toBe(DEFAULT_SEED);
  });
});
