import { describe, expect, it } from 'vitest';
import { activeConditions, clearCondition, isGroupModified, levels } from './conditions';
import { DEFAULT_CONFIG, LIMITS, mergeConfig } from './config';
import { appendFiller, expandText, MAX_FILLER_SENTENCES } from './mutation';
import { createRng, hashSeed } from './rng';
import {
  applyPreset,
  CHAOS_LEVELS,
  CHAOS_PROFILES,
  generateChaosConfig,
  matchPreset,
  PRESETS,
  randomConfig,
} from './scenarios';

describe('rng', () => {
  it('is deterministic per seed and spreads values across [0, 1)', () => {
    const a = createRng(5);
    const b = createRng(5);
    const seqA = Array.from({ length: 50 }, () => a.next());
    expect(seqA).toEqual(Array.from({ length: 50 }, () => b.next()));
    expect(seqA.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(new Set(seqA).size).toBe(50);
  });

  it('hashSeed differs for different inputs', () => {
    expect(hashSeed(1, 2)).not.toBe(hashSeed(2, 1));
  });
});

describe('chaos generation', () => {
  it('the same seed and level always produce the same configuration', () => {
    for (const level of CHAOS_LEVELS) {
      expect(generateChaosConfig(1234, level)).toEqual(generateChaosConfig(1234, level));
    }
  });

  it('different seeds produce different configurations', () => {
    expect(generateChaosConfig(1, 'heavy')).not.toEqual(generateChaosConfig(2, 'heavy'));
  });

  it('stays inside each level profile and the engine limits', () => {
    for (const level of CHAOS_LEVELS) {
      const p = CHAOS_PROFILES[level];
      for (let seed = 1; seed <= 50; seed++) {
        const c = generateChaosConfig(seed, level);
        expect(c.chaos).toMatchObject({ enabled: true, level, seed });
        expect(c.network.latencyMs).toBeGreaterThanOrEqual(p.latencyMs[0]);
        expect(c.network.latencyMs).toBeLessThanOrEqual(
          Math.min(p.latencyMs[1], LIMITS.latencyMs.max),
        );
        expect(c.network.failurePercent).toBeGreaterThanOrEqual(p.failurePercent[0]);
        expect(c.network.failurePercent).toBeLessThanOrEqual(p.failurePercent[1]);
        expect(c.stress.burst).toBeGreaterThanOrEqual(p.burst[0]);
        expect(c.stress.burst).toBeLessThanOrEqual(p.burst[1]);
        expect(c.mutation.itemCount).toBeLessThanOrEqual(LIMITS.itemCount.max);
      }
    }
  });

  it('levels escalate: each level is at least as harsh as the previous one', () => {
    const minLatency = CHAOS_LEVELS.map((l) => CHAOS_PROFILES[l].latencyMs[0]);
    expect([...minLatency].sort((a, b) => a - b)).toEqual(minLatency);
    const clicks = CHAOS_LEVELS.map((l) => CHAOS_PROFILES[l].clickCount);
    expect([...clicks].sort((a, b) => a - b)).toEqual(clicks);
  });

  it('randomize is seeded and never engages chaos mode', () => {
    expect(randomConfig(9, 'mild')).toEqual(randomConfig(9, 'mild'));
    expect(randomConfig(9, 'mild').chaos.enabled).toBe(false);
  });
});

describe('presets', () => {
  it('replace conditions instead of stacking, and keep the seed', () => {
    const messy = mergeConfig(DEFAULT_CONFIG, {
      network: { offline: true },
      mutation: { itemCount: 200 },
      chaos: { seed: 77 },
    });
    const slow = applyPreset(
      messy,
      PRESETS.find((p) => p.key === 'slow')!,
    );
    expect(slow.network).toEqual({ latencyMs: 6_000, offline: false, failurePercent: 0 });
    expect(slow.mutation.itemCount).toBe(12);
    expect(slow.chaos.seed).toBe(77);
  });

  it('matchPreset recognises an applied preset and nothing else', () => {
    for (const p of PRESETS) expect(matchPreset(applyPreset(DEFAULT_CONFIG, p))).toBe(p.key);
    expect(matchPreset(mergeConfig(DEFAULT_CONFIG, { network: { latencyMs: 500 } }))).toBeNull();
  });
});

describe('conditions', () => {
  it('lists nothing for the default config', () => {
    expect(activeConditions(DEFAULT_CONFIG)).toEqual([]);
    expect(isGroupModified(DEFAULT_CONFIG, 'network')).toBe(false);
  });

  it('lists every stacked condition and clears them one by one', () => {
    let c = mergeConfig(DEFAULT_CONFIG, {
      network: { offline: true, latencyMs: 12_000, failurePercent: 35 },
      stress: { burst: 40, repeat: true, repeatEveryMs: 500 },
      mutation: { itemCount: 160, contentLength: 70, textExpansion: 85 },
    });
    const conds = activeConditions(c);
    expect(conds.map((x) => x.label)).toEqual([
      'offline',
      'latency 12 s',
      'fail 35%',
      'burst ×40',
      'repeat 0.5 s',
      '160 items',
      'copy +70%',
      'text +85%',
    ]);
    for (const x of conds) c = mergeConfig(c, clearCondition(x.key));
    expect(activeConditions(c)).toEqual([]);
  });

  it('grades values with the spec thresholds', () => {
    const c = mergeConfig(DEFAULT_CONFIG, {
      network: { latencyMs: 3_000, failurePercent: 50 },
      mutation: { itemCount: 100 },
    });
    expect(levels(c)).toMatchObject({ latency: 'warn', failure: 'hot', items: 'hot', burst: 'ok' });
  });
});

describe('mutation transforms', () => {
  it('leaves text untouched at 0%', () => {
    expect(expandText('Desk Lamp', 0)).toBe('Desk Lamp');
    expect(appendFiller('Warm light.', 0)).toBe('Warm light.');
  });

  it('expands words up to 3.2× with accents at 100%', () => {
    const out = expandText('Lamp', 100);
    expect(out.length).toBe(Math.round(4 * 3.2));
    expect(out).toMatch(/å/);
  });

  it('appends 14 filler sentences at 100%', () => {
    const out = appendFiller('Base.', 100);
    expect(out.split('. ').length).toBeGreaterThanOrEqual(MAX_FILLER_SENTENCES);
  });
});
