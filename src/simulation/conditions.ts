import { DEFAULT_CONFIG } from './config';
import type { DeepPartial, SimulationConfig } from './types';

export type Level = 'ok' | 'warn' | 'hot';
export type ConditionTone = 'net' | 'err' | 'load' | 'ui';

export type ConditionKey =
  'offline' | 'latency' | 'failure' | 'burst' | 'repeat' | 'items' | 'content' | 'expansion';

export type ActiveCondition = {
  key: ConditionKey;
  label: string;
  /** Used for "Remove …" accessible names. */
  name: string;
  tone: ConditionTone;
};

/** Total stackable conditions shown in the Chaos meter ("N of 8"). */
export const CONDITION_COUNT = 8;

export function formatSeconds(ms: number): string {
  const s = ms / 1000;
  return `${Number.isInteger(s) ? s.toFixed(0) : s.toFixed(1)} s`;
}

/** Thresholds from the interaction spec. */
export function levels(c: SimulationConfig) {
  const { latencyMs, failurePercent } = c.network;
  const { burst } = c.stress;
  const { contentLength, itemCount, textExpansion } = c.mutation;
  const graded = (warn: boolean, hot: boolean): Level => (hot ? 'hot' : warn ? 'warn' : 'ok');
  return {
    latency: graded(latencyMs >= 3_000, latencyMs >= 10_000),
    failure: graded(failurePercent > 0, failurePercent >= 50),
    burst: graded(burst > 1, burst >= 30),
    content: graded(contentLength > 0, contentLength >= 60),
    items: graded(itemCount !== DEFAULT_CONFIG.mutation.itemCount, itemCount >= 100),
    expansion: graded(textExpansion > 0, textExpansion >= 60),
  };
}

export function activeConditions(c: SimulationConfig): ActiveCondition[] {
  const out: ActiveCondition[] = [];
  if (c.network.offline)
    out.push({ key: 'offline', label: 'offline', name: 'offline mode', tone: 'err' });
  if (c.network.latencyMs > 0)
    out.push({
      key: 'latency',
      label: `latency ${formatSeconds(c.network.latencyMs)}`,
      name: 'latency',
      tone: 'net',
    });
  if (c.network.failurePercent > 0)
    out.push({
      key: 'failure',
      label: `fail ${c.network.failurePercent}%`,
      name: 'request failure',
      tone: 'err',
    });
  if (c.stress.burst > 1)
    out.push({
      key: 'burst',
      label: `burst ×${c.stress.burst}`,
      name: 'request burst',
      tone: 'load',
    });
  if (c.stress.repeat)
    out.push({
      key: 'repeat',
      label: `repeat ${formatSeconds(c.stress.repeatEveryMs)}`,
      name: 'repeat',
      tone: 'load',
    });
  if (c.mutation.itemCount !== DEFAULT_CONFIG.mutation.itemCount)
    out.push({
      key: 'items',
      label: `${c.mutation.itemCount} items`,
      name: 'rendered items',
      tone: 'ui',
    });
  if (c.mutation.contentLength > 0)
    out.push({
      key: 'content',
      label: `copy +${c.mutation.contentLength}%`,
      name: 'content length',
      tone: 'ui',
    });
  if (c.mutation.textExpansion > 0)
    out.push({
      key: 'expansion',
      label: `text +${c.mutation.textExpansion}%`,
      name: 'text expansion',
      tone: 'ui',
    });
  return out;
}

/** Patch that returns one condition to its default. */
export function clearCondition(key: ConditionKey): DeepPartial<SimulationConfig> {
  const d = DEFAULT_CONFIG;
  switch (key) {
    case 'offline':
      return { network: { offline: d.network.offline } };
    case 'latency':
      return { network: { latencyMs: d.network.latencyMs } };
    case 'failure':
      return { network: { failurePercent: d.network.failurePercent } };
    case 'burst':
      return { stress: { burst: d.stress.burst } };
    case 'repeat':
      return { stress: { repeat: d.stress.repeat } };
    case 'items':
      return { mutation: { itemCount: d.mutation.itemCount } };
    case 'content':
      return { mutation: { contentLength: d.mutation.contentLength } };
    case 'expansion':
      return { mutation: { textExpansion: d.mutation.textExpansion } };
  }
}

export type ControlGroup = 'network' | 'stress' | 'mutation';

export const GROUP_DEFAULTS: Record<ControlGroup, DeepPartial<SimulationConfig>> = {
  network: { network: { ...DEFAULT_CONFIG.network } },
  stress: { stress: { ...DEFAULT_CONFIG.stress } },
  mutation: { mutation: { ...DEFAULT_CONFIG.mutation } },
};

export function isGroupModified(c: SimulationConfig, group: ControlGroup): boolean {
  const current = c[group] as Record<string, unknown>;
  const base = DEFAULT_CONFIG[group] as Record<string, unknown>;
  return Object.keys(base).some((k) => current[k] !== base[k]);
}
