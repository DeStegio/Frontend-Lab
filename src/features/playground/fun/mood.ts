import type { SimulationConfig, SimulationStats } from '@/simulation/types';

export type Mood = 'happy' | 'sleepy' | 'sweaty' | 'stressed' | 'offline' | 'chaos';

export const MOOD_LABEL: Record<Mood, string> = {
  happy: 'happy',
  sleepy: 'snoozing',
  sweaty: 'sweating',
  stressed: 'overwhelmed',
  offline: 'unplugged',
  chaos: 'losing it',
};

/** The server mascot's face, from the current conditions and load. Most dramatic wins. */
export function serverMood(config: SimulationConfig, stats: SimulationStats): Mood {
  if (config.network.offline) return 'offline';
  if (config.chaos.enabled) return 'chaos';
  if (stats.inFlight > 40 || config.network.failurePercent >= 50) return 'stressed';
  if (config.network.failurePercent > 0) return 'sweaty';
  if (config.network.latencyMs >= 3_000) return 'sleepy';
  return 'happy';
}

/** How hard the store screen shakes: 0 (still) to 3, from requests in flight. */
export function loadLevel(inFlight: number): 0 | 1 | 2 | 3 {
  if (inFlight > 80) return 3;
  if (inFlight > 25) return 2;
  if (inFlight > 6) return 1;
  return 0;
}
