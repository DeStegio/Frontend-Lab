import type { DeepPartial, SimulationConfig } from './types';

export const LIMITS = {
  latencyMs: { min: 0, max: 60_000 },
  failurePercent: { min: 0, max: 100 },
  burst: { min: 1, max: 100 },
  clickCount: { min: 1, max: 10_000 },
  repeatEveryMs: { min: 250, max: 60_000 },
  contentLength: { min: 0, max: 100 },
  itemCount: { min: 1, max: 240 },
  textExpansion: { min: 0, max: 100 },
} as const;

export const DEFAULT_SEED = 20_261_117;

export const DEFAULT_CONFIG: SimulationConfig = Object.freeze({
  network: { latencyMs: 0, offline: false, failurePercent: 0 },
  stress: { burst: 1, clickCount: 25, repeat: false, repeatEveryMs: 2_000 },
  mutation: { contentLength: 0, itemCount: 12, textExpansion: 0 },
  chaos: { enabled: false, level: 'extreme', seed: DEFAULT_SEED },
}) as SimulationConfig;

function clamp(value: number, { min, max }: { min: number; max: number }): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Forces every value into its legal range, so no caller can push the engine past its bounds. */
export function sanitizeConfig(c: SimulationConfig): SimulationConfig {
  return {
    network: {
      latencyMs: clamp(c.network.latencyMs, LIMITS.latencyMs),
      offline: Boolean(c.network.offline),
      failurePercent: clamp(c.network.failurePercent, LIMITS.failurePercent),
    },
    stress: {
      burst: Math.round(clamp(c.stress.burst, LIMITS.burst)),
      clickCount: Math.round(clamp(c.stress.clickCount, LIMITS.clickCount)),
      repeat: Boolean(c.stress.repeat),
      repeatEveryMs: clamp(c.stress.repeatEveryMs, LIMITS.repeatEveryMs),
    },
    mutation: {
      contentLength: clamp(c.mutation.contentLength, LIMITS.contentLength),
      itemCount: Math.round(clamp(c.mutation.itemCount, LIMITS.itemCount)),
      textExpansion: clamp(c.mutation.textExpansion, LIMITS.textExpansion),
    },
    chaos: {
      enabled: Boolean(c.chaos.enabled),
      level: c.chaos.level,
      seed: c.chaos.seed >>> 0,
    },
  };
}

export function mergeConfig(
  base: SimulationConfig,
  patch: DeepPartial<SimulationConfig>,
): SimulationConfig {
  return sanitizeConfig({
    network: { ...base.network, ...patch.network },
    stress: { ...base.stress, ...patch.stress },
    mutation: { ...base.mutation, ...patch.mutation },
    chaos: { ...base.chaos, ...patch.chaos },
  });
}
