import { DEFAULT_CONFIG, mergeConfig } from './config';
import { createRng, hashSeed } from './rng';
import type { ChaosLevel, DeepPartial, SimulationConfig } from './types';

export type PresetKey = 'calm' | 'slow' | 'flaky' | 'rush' | 'wordy';

export type Preset = {
  key: PresetKey;
  label: string;
  hint: string;
  patch: DeepPartial<SimulationConfig>;
};

export const PRESETS: readonly Preset[] = [
  { key: 'calm', label: 'Calm', hint: 'Normal conditions', patch: {} },
  {
    key: 'slow',
    label: 'Slow network',
    hint: '6 s latency on every request',
    patch: { network: { latencyMs: 6_000 } },
  },
  {
    key: 'flaky',
    label: 'Flaky API',
    hint: '40% of requests fail',
    patch: { network: { latencyMs: 1_000, failurePercent: 40 } },
  },
  {
    key: 'rush',
    label: 'Rush hour',
    hint: 'Bursts, rapid clicks and repeats',
    patch: {
      network: { latencyMs: 1_500 },
      stress: { burst: 25, repeat: true, repeatEveryMs: 1_000, clickCount: 100 },
    },
  },
  {
    key: 'wordy',
    label: 'Wordy',
    hint: 'Long copy, long words, many items',
    patch: { mutation: { itemCount: 36, textExpansion: 65, contentLength: 70 } },
  },
];

/** A preset replaces every condition (it does not stack on the current ones). Seed and level stay. */
export function applyPreset(current: SimulationConfig, preset: Preset): SimulationConfig {
  return mergeConfig(mergeConfig(DEFAULT_CONFIG, preset.patch), {
    chaos: { seed: current.chaos.seed, level: current.chaos.level, enabled: false },
  });
}

/** Which preset (if any) the config matches exactly. */
export function matchPreset(config: SimulationConfig): PresetKey | null {
  if (config.chaos.enabled) return null;
  const conditions = (c: SimulationConfig) => JSON.stringify([c.network, c.stress, c.mutation]);
  const current = conditions(config);
  return PRESETS.find((p) => conditions(applyPreset(config, p)) === current)?.key ?? null;
}

type Range = readonly [number, number];

type ChaosProfile = {
  label: string;
  latencyMs: Range;
  failurePercent: Range;
  burst: Range;
  itemCount: Range;
  textExpansion: Range;
  contentLength: Range;
  repeatChance: number;
  repeatEveryMs: readonly number[];
  offlineChance: number;
  /** Logical clicks per chaos run; above the engine cap the remainder is simulated. */
  clickCount: number;
};

export const CHAOS_LEVELS: readonly ChaosLevel[] = ['mild', 'heavy', 'extreme', 'absurd'];

export const CHAOS_PROFILES: Record<ChaosLevel, ChaosProfile> = {
  mild: {
    label: 'Mild',
    latencyMs: [500, 3_000],
    failurePercent: [5, 20],
    burst: [1, 5],
    itemCount: [12, 36],
    textExpansion: [0, 30],
    contentLength: [0, 30],
    repeatChance: 0.2,
    repeatEveryMs: [2_000, 5_000],
    offlineChance: 0,
    clickCount: 25,
  },
  heavy: {
    label: 'Heavy',
    latencyMs: [2_000, 10_000],
    failurePercent: [20, 45],
    burst: [5, 25],
    itemCount: [24, 96],
    textExpansion: [20, 60],
    contentLength: [20, 60],
    repeatChance: 0.5,
    repeatEveryMs: [1_000, 2_000],
    offlineChance: 0.05,
    clickCount: 100,
  },
  extreme: {
    label: 'Extreme',
    latencyMs: [10_000, 25_000],
    failurePercent: [45, 70],
    burst: [30, 60],
    itemCount: [100, 200],
    textExpansion: [60, 90],
    contentLength: [60, 95],
    repeatChance: 1,
    repeatEveryMs: [500],
    offlineChance: 0,
    clickCount: 250,
  },
  absurd: {
    label: 'Absurd',
    latencyMs: [30_000, 60_000],
    failurePercent: [70, 100],
    burst: [80, 100],
    itemCount: [240, 240],
    textExpansion: [90, 100],
    contentLength: [90, 100],
    repeatChance: 1,
    repeatEveryMs: [500],
    offlineChance: 0.25,
    clickCount: 10_000,
  },
};

/**
 * Seeded chaos: the same (seed, level) always yields the same configuration.
 * Values are snapped to the steps of the matching sliders.
 */
export function generateChaosConfig(seed: number, level: ChaosLevel): SimulationConfig {
  const p = CHAOS_PROFILES[level];
  const rng = createRng(hashSeed(seed, CHAOS_LEVELS.indexOf(level), 0xc4a05));
  return mergeConfig(DEFAULT_CONFIG, {
    network: {
      latencyMs: rng.range(p.latencyMs[0], p.latencyMs[1], 500),
      failurePercent: rng.range(p.failurePercent[0], p.failurePercent[1], 5),
      offline: rng.chance(p.offlineChance),
    },
    stress: {
      burst: rng.int(p.burst[0], p.burst[1]),
      repeat: rng.chance(p.repeatChance),
      repeatEveryMs: rng.pick(p.repeatEveryMs),
      clickCount: p.clickCount,
    },
    mutation: {
      itemCount: rng.int(p.itemCount[0], p.itemCount[1]),
      textExpansion: rng.range(p.textExpansion[0], p.textExpansion[1], 5),
      contentLength: rng.range(p.contentLength[0], p.contentLength[1], 5),
    },
    chaos: { enabled: true, level, seed },
  });
}

/** "Randomize": a broad seeded mix of every condition, without engaging chaos mode. */
export function randomConfig(
  seed: number,
  level: SimulationConfig['chaos']['level'],
): SimulationConfig {
  const rng = createRng(hashSeed(seed, 0x7a4d));
  return mergeConfig(DEFAULT_CONFIG, {
    network: {
      latencyMs: rng.range(0, 30_000, 500),
      failurePercent: rng.range(0, 80, 5),
      offline: rng.chance(0.15),
    },
    stress: { burst: rng.int(1, 40), repeat: rng.chance(0.35), repeatEveryMs: 2_000 },
    mutation: {
      itemCount: rng.int(4, 120),
      textExpansion: rng.range(0, 80, 5),
      contentLength: rng.range(0, 80, 5),
    },
    chaos: { enabled: false, level, seed },
  });
}
