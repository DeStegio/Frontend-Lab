import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, mergeConfig } from '@/simulation/config';
import { generateChaosConfig } from '@/simulation/scenarios';
import type { LogEntry, SimulationStats } from '@/simulation/types';
import { configEvents, countTraffic, LINES, phrase, trafficEvents } from './incidents';
import { loadLevel, serverMood } from './mood';

const stats = (patch: Partial<SimulationStats> = {}): SimulationStats => ({
  sent: 0,
  succeeded: 0,
  failed: 0,
  cancelled: 0,
  inFlight: 0,
  totalDurationMs: 0,
  requestedActions: 0,
  executedActions: 0,
  simulatedActions: 0,
  ...patch,
});

const entry = (id: number, path: string, status: string, kind: LogEntry['kind']): LogEntry => ({
  id,
  at: 0,
  method: path === '/api/cart' ? 'POST' : 'GET',
  path,
  status,
  kind,
  durationMs: 100,
});

describe('server mood', () => {
  it('picks the most dramatic face', () => {
    expect(serverMood(DEFAULT_CONFIG, stats())).toBe('happy');
    expect(
      serverMood(mergeConfig(DEFAULT_CONFIG, { network: { latencyMs: 5_000 } }), stats()),
    ).toBe('sleepy');
    expect(
      serverMood(mergeConfig(DEFAULT_CONFIG, { network: { failurePercent: 20 } }), stats()),
    ).toBe('sweaty');
    expect(serverMood(DEFAULT_CONFIG, stats({ inFlight: 50 }))).toBe('stressed');
    expect(serverMood(generateChaosConfig(1, 'extreme'), stats())).toBe('chaos');
    expect(
      serverMood(
        mergeConfig(generateChaosConfig(1, 'extreme'), { network: { offline: true } }),
        stats(),
      ),
    ).toBe('offline');
  });

  it('grades load for the screen wobble', () => {
    expect([0, 7, 26, 81].map(loadLevel)).toEqual([0, 1, 2, 3]);
  });
});

describe('incident narration', () => {
  it('narrates config changes, at most two per change', () => {
    const next = mergeConfig(DEFAULT_CONFIG, {
      network: { latencyMs: 12_000, failurePercent: 60, offline: true },
      mutation: { itemCount: 200 },
    });
    const events = configEvents(DEFAULT_CONFIG, next);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ key: 'offlineOn' });
    expect(events[1]).toMatchObject({ key: 'latencyHot', v: '12 s' });
  });

  it('collapses chaos into a single line', () => {
    expect(configEvents(DEFAULT_CONFIG, generateChaosConfig(3, 'absurd'))).toEqual([
      { key: 'chaosOn', v: 'ABSURD' },
    ]);
  });

  it('counts only new primary rows and recognises lost carts', () => {
    const log = [
      entry(9, '/api/cart', '503', 'bad'),
      entry(8, '/api/cart  ×4 burst', '1/4 ok', 'bad'),
      entry(7, '/api/products?category=all', 'ERR offline', 'off'),
      entry(6, '/api/cart', 'cancelled', 'cancel'),
      entry(5, '/api/cart', '500', 'bad'),
    ];
    const c = countTraffic(log, 5);
    expect(c).toMatchObject({ failed: 1, offlineHits: 1, cancelled: 1, cartsLost: 1 });
    expect(trafficEvents(c)).toEqual([
      { key: 'cartsLost', n: 1 },
      { key: 'offlineHits', n: 1 },
    ]);
  });

  it('phrases deterministically from the seed and fills placeholders', () => {
    const a = phrase({ key: 'failed', n: 1234 }, 42, 7);
    expect(phrase({ key: 'failed', n: 1234 }, 42, 7)).toBe(a);
    expect(a).toContain('1,234');
    expect(a).not.toMatch(/[{}]/);
    const variants = new Set(
      Array.from({ length: 20 }, (_, i) => phrase({ key: 'failed', n: 1 }, i, 0)),
    );
    expect(variants.size).toBe(LINES.failed.length);
  });
});
