export type ChaosLevel = 'mild' | 'heavy' | 'extreme' | 'absurd';

/** Every knob the lab exposes. One object, so all experiments can stack. */
export type SimulationConfig = {
  network: {
    /** Added to every request before it settles. 0 to 60 000 ms. */
    latencyMs: number;
    /** Requests fail fast without reaching the "server". */
    offline: boolean;
    /** Probability, in percent, that a request answers 500 or 503. */
    failurePercent: number;
  };
  stress: {
    /** Parallel calls fired per action. Only the first one drives the UI. */
    burst: number;
    /** Size of a rapid-click run. Above the execution cap the rest is counted, not executed. */
    clickCount: number;
    /** Re-fire the last store action on an interval. */
    repeat: boolean;
    repeatEveryMs: number;
  };
  mutation: {
    /** 0 to 100: how much filler copy is appended to descriptions. */
    contentLength: number;
    /** How many catalog items the store renders. */
    itemCount: number;
    /** 0 to 100: pseudo-localisation strength (accents, longer words). */
    textExpansion: number;
  };
  chaos: {
    enabled: boolean;
    level: ChaosLevel;
    /** Drives every random decision, so a run can be replayed. */
    seed: number;
  };
};

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export type HttpMethod = 'GET' | 'POST';

/** How a request ended, independent of the HTTP status code. */
export type RequestOutcome = 'ok' | 'error' | 'offline' | 'timeout' | 'throttled';

export type SimResponse<T> = {
  id: number;
  /** 200, 500, 503, 429. 0 when no server answered (offline, timeout). */
  status: number;
  ok: boolean;
  outcome: RequestOutcome;
  data: T | null;
  durationMs: number;
  /** Shadow calls fired alongside the primary one (burst > 1). */
  burst: { count: number; succeeded: number };
};

export type LogKind = 'ok' | 'bad' | 'off' | 'cancel';

export type LogEntry = {
  id: number;
  at: number;
  method: HttpMethod;
  path: string;
  status: string;
  kind: LogKind;
  durationMs: number;
};

export type SimulationStats = {
  /** Calls sent, counting every burst duplicate. */
  sent: number;
  succeeded: number;
  failed: number;
  cancelled: number;
  inFlight: number;
  /** Sum of durations of settled calls, for the average. */
  totalDurationMs: number;
  /** Stress actions requested vs. physically executed (the rest is simulated). */
  requestedActions: number;
  executedActions: number;
};

export type SimulationSnapshot = {
  config: SimulationConfig;
  /** Bumped by reset. Anything started in an older generation is stale. */
  generation: number;
  stats: SimulationStats;
  /** Newest first, bounded. */
  log: readonly LogEntry[];
};
