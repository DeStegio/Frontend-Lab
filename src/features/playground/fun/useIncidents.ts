import { useEffect, useState } from 'react';
import { useEngine } from '@/simulation/adapters/hooks';
import {
  configEvents,
  countTraffic,
  emptyCounts,
  phrase,
  toneOf,
  trafficEvents,
  type Incident,
  type IncidentEvent,
} from './incidents';

export const MAX_INCIDENTS = 30;
/** Traffic outcomes are summarised at most this often, so chaos reads as a story, not a flood. */
export const TRAFFIC_SUMMARY_MS = 1_200;

/** Watches the engine and narrates notable changes as a short, seeded incident log. */
export function useIncidents(): Incident[] {
  const engine = useEngine();
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const seed = engine.getConfig().chaos.seed;
    const first: IncidentEvent = { key: 'online', v: String(seed) };
    return [{ id: 0, at: engine.clock.now(), tone: toneOf(first), text: phrase(first, seed, 0) }];
  });

  useEffect(() => {
    let prev = engine.getSnapshot();
    let seq = 1;
    let nextId = 1;
    let counts = emptyCounts();
    let cancelFlush: (() => void) | null = null;

    const emit = (events: IncidentEvent[], replace = false) => {
      if (events.length === 0) return;
      const seed = engine.getConfig().chaos.seed;
      const at = engine.clock.now();
      const lines = events.map((e) => ({
        id: nextId++,
        at,
        tone: toneOf(e),
        text: phrase(e, seed, seq++),
      }));
      setIncidents((cur) => [...lines.reverse(), ...(replace ? [] : cur)].slice(0, MAX_INCIDENTS));
    };

    const flush = () => {
      cancelFlush = null;
      emit(trafficEvents(counts));
      counts = emptyCounts();
    };

    const unsubscribe = engine.subscribe(() => {
      const next = engine.getSnapshot();
      if (next.generation !== prev.generation) {
        // Reset: the engine already cancelled our pending flush timer.
        cancelFlush = null;
        counts = emptyCounts();
        seq = 0;
        prev = next;
        emit([{ key: 'reset' }], true);
        return;
      }
      if (next.config !== prev.config) emit(configEvents(prev.config, next.config));
      if (next.log !== prev.log) {
        countTraffic(next.log, prev.log[0]?.id ?? 0, counts);
        cancelFlush ??= engine.schedule(flush, TRAFFIC_SUMMARY_MS);
      }
      prev = next;
    });

    return () => {
      unsubscribe();
      cancelFlush?.();
    };
  }, [engine]);

  return incidents;
}
