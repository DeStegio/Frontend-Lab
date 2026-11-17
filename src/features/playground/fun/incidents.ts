import { formatSeconds } from '@/simulation/conditions';
import { createRng, hashSeed } from '@/simulation/rng';
import type { LogEntry, SimulationConfig } from '@/simulation/types';

export type IncidentTone = 'ok' | 'info' | 'warn' | 'bad';
export type Incident = { id: number; at: number; tone: IncidentTone; text: string };

type LineKey = keyof typeof LINES;
export type IncidentEvent = { key: LineKey; v?: string; n?: number };

/** Every line has variants; which one shows is decided by the seed, so a replay reads the same. */
export const LINES = {
  online: ['Lab online. Seed {v}. Everything works, for now.'],
  latencyOn: [
    'Requests now take the scenic route ({v}).',
    'Someone swapped the fibre for a garden hose ({v}).',
    'The server is answering by postcard ({v}).',
  ],
  latencyHot: [
    'The server is now powered by one hamster ({v}).',
    'Latency {v}. Make a coffee. Make two.',
  ],
  latencyOff: ['Latency back to instant. The hamster rests.'],
  offlineOn: [
    'Someone tripped over the router cable.',
    'The Wi-Fi went off to find itself.',
    'Offline. The store is talking to a wall.',
  ],
  offlineOff: ['Cable plugged back in. Hello again, internet.'],
  failOn: [
    'The server started flipping coins ({v} fail).',
    'The API now fails {v} of the time, on purpose.',
  ],
  failHot: ['More requests fail than succeed ({v}). Bold strategy.'],
  failOff: ['Failures off. The server is on its best behaviour.'],
  burstOn: [
    'Every action now sends {v} copies. The server sighs.',
    '{v} parallel calls per click. Overkill, lovingly.',
  ],
  itemsMany: ['The warehouse delivered {v} items. The shelves creak.'],
  itemsFew: ['Only {v} items in stock. Very minimalist.'],
  expandOn: [
    'Product names are learning very long words ({v}).',
    'Pseudo-localisation on. Wörds gröw ({v}).',
  ],
  contentOn: ['The copywriter had too much coffee ({v} more text).'],
  repeatOn: ['The last action is now on repeat every {v}.'],
  chaosOn: [
    'CHAOS ENGAGED · {v}. Hold on to your cart.',
    'CHAOS ENGAGED · {v}. Nobody panic. Everybody panic.',
  ],
  chaosOff: ['Chaos off. Things are calmer. Mostly.'],
  failed: [
    '{n} requests faceplanted with a 500 or 503.',
    'The server sneezed. {n} requests lost.',
    '{n} requests bounced off the server.',
  ],
  cartsLost: ['{n} carts vanished into the void.', '{n} add-to-carts never made it home.'],
  offlineHits: ['{n} requests hit the wall. No network, no luck.'],
  timeouts: ['{n} requests gave up waiting after 30 s.'],
  throttled: ['Client queue is full. {n} requests got a 429.'],
  cancelled: ['{n} requests abandoned mid-air.'],
  reset: ['Extinguisher deployed. The lab is calm again.', 'Fresh start. Smells like foam.'],
} as const;

const TONE: Record<LineKey, IncidentTone> = {
  online: 'ok',
  latencyOn: 'warn',
  latencyHot: 'bad',
  latencyOff: 'ok',
  offlineOn: 'bad',
  offlineOff: 'ok',
  failOn: 'warn',
  failHot: 'bad',
  failOff: 'ok',
  burstOn: 'warn',
  itemsMany: 'info',
  itemsFew: 'info',
  expandOn: 'info',
  contentOn: 'info',
  repeatOn: 'info',
  chaosOn: 'bad',
  chaosOff: 'ok',
  failed: 'bad',
  cartsLost: 'bad',
  offlineHits: 'bad',
  timeouts: 'bad',
  throttled: 'bad',
  cancelled: 'info',
  reset: 'ok',
};

/** At most this many config lines per change, so a preset doesn't flood the log. */
const MAX_CONFIG_LINES = 2;

/** What changed in the configuration, as story beats. */
export function configEvents(prev: SimulationConfig, next: SimulationConfig): IncidentEvent[] {
  if (!prev.chaos.enabled && next.chaos.enabled) {
    return [{ key: 'chaosOn', v: next.chaos.level.toUpperCase() }];
  }
  if (prev.chaos.enabled && !next.chaos.enabled) return [{ key: 'chaosOff' }];

  const out: IncidentEvent[] = [];
  const a = prev.network;
  const b = next.network;
  if (!a.offline && b.offline) out.push({ key: 'offlineOn' });
  if (a.offline && !b.offline) out.push({ key: 'offlineOff' });
  if (a.latencyMs < 10_000 && b.latencyMs >= 10_000)
    out.push({ key: 'latencyHot', v: formatSeconds(b.latencyMs) });
  else if (a.latencyMs === 0 && b.latencyMs > 0)
    out.push({ key: 'latencyOn', v: formatSeconds(b.latencyMs) });
  else if (a.latencyMs > 0 && b.latencyMs === 0) out.push({ key: 'latencyOff' });
  if (a.failurePercent < 50 && b.failurePercent >= 50)
    out.push({ key: 'failHot', v: `${b.failurePercent}%` });
  else if (a.failurePercent === 0 && b.failurePercent > 0)
    out.push({ key: 'failOn', v: `${b.failurePercent}%` });
  else if (a.failurePercent > 0 && b.failurePercent === 0) out.push({ key: 'failOff' });

  if (prev.stress.burst < 10 && next.stress.burst >= 10)
    out.push({ key: 'burstOn', v: `×${next.stress.burst}` });
  if (!prev.stress.repeat && next.stress.repeat)
    out.push({ key: 'repeatOn', v: formatSeconds(next.stress.repeatEveryMs) });

  const m = prev.mutation;
  const n = next.mutation;
  if (m.itemCount < 100 && n.itemCount >= 100)
    out.push({ key: 'itemsMany', v: String(n.itemCount) });
  if (m.itemCount > 3 && n.itemCount <= 3) out.push({ key: 'itemsFew', v: String(n.itemCount) });
  if (m.textExpansion < 50 && n.textExpansion >= 50)
    out.push({ key: 'expandOn', v: `+${n.textExpansion}%` });
  if (m.contentLength < 50 && n.contentLength >= 50)
    out.push({ key: 'contentOn', v: `+${n.contentLength}%` });

  return out.slice(0, MAX_CONFIG_LINES);
}

export type TrafficCounts = {
  failed: number;
  cartsLost: number;
  offlineHits: number;
  timeouts: number;
  throttled: number;
  cancelled: number;
};

export const emptyCounts = (): TrafficCounts => ({
  failed: 0,
  cartsLost: 0,
  offlineHits: 0,
  timeouts: 0,
  throttled: 0,
  cancelled: 0,
});

/** Counts noteworthy outcomes among log entries newer than `sinceId` (burst summary rows skipped). */
export function countTraffic(log: readonly LogEntry[], sinceId: number, into = emptyCounts()) {
  for (const e of log) {
    if (e.id <= sinceId) break; // log is newest first
    if (e.path.includes(' burst')) continue;
    const cart = e.path === '/api/cart';
    if (e.status === '500' || e.status === '503') into.failed++;
    else if (e.status === 'ERR offline') into.offlineHits++;
    else if (e.status === 'ERR timeout') into.timeouts++;
    else if (e.status === '429 throttled') into.throttled++;
    else if (e.status === 'cancelled') into.cancelled++;
    if (cart && e.kind !== 'ok' && e.kind !== 'cancel') into.cartsLost++;
  }
  return into;
}

/** Turns accumulated counts into at most two lines, most dramatic first. */
export function trafficEvents(c: TrafficCounts): IncidentEvent[] {
  const order: [keyof TrafficCounts, LineKey][] = [
    ['cartsLost', 'cartsLost'],
    ['offlineHits', 'offlineHits'],
    ['throttled', 'throttled'],
    ['timeouts', 'timeouts'],
    ['failed', 'failed'],
    ['cancelled', 'cancelled'],
  ];
  return order
    .filter(([k]) => c[k] > 0)
    .slice(0, 2)
    .map(([k, key]) => ({ key, n: c[k] }));
}

/** Renders an event with a seeded variant. `seq` is the incident's position in this run. */
export function phrase(event: IncidentEvent, seed: number, seq: number): string {
  const variants = LINES[event.key];
  const line = createRng(hashSeed(seed, seq)).pick(variants);
  return line
    .replace('{v}', event.v ?? '')
    .replace('{n}', event.n !== undefined ? event.n.toLocaleString('en') : '');
}

export function toneOf(event: IncidentEvent): IncidentTone {
  return TONE[event.key];
}
