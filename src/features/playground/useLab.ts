import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { DemoStore } from '@/features/demo-store/useDemoStore';
import { buildCatalog } from '@/features/demo-store/catalog';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { randomSeed } from '@/simulation/rng';
import {
  applyPreset,
  generateChaosConfig,
  randomConfig,
  type Preset,
} from '@/simulation/scenarios';
import type { ChaosLevel } from '@/simulation/types';

/** Rapid clicks hit Add to cart this often (interaction spec). */
export const CLICK_INTERVAL_MS = 28;
export const RESET_NOTE_MS = 2_800;
const CLICK_TARGETS = 6;

/**
 * Lab-level actions: everything the controls do that is more than setting a value. All timers
 * go through the engine, so Reset cancels them together with the requests.
 */
export function useLab(store: DemoStore) {
  const engine = useEngine();
  const generation = useSimulation((s) => s.generation);
  const { repeat, repeatEveryMs } = useSimulation((s) => s.config.stress);
  const [resetNote, setResetNote] = useState(false);

  // The latest store callbacks, for timers that outlive a render.
  const storeRef = useRef(store);
  useLayoutEffect(() => {
    storeRef.current = store;
  });

  const runClicks = useCallback(
    (count?: number) => {
      const s = storeRef.current;
      const total = count ?? engine.getConfig().stress.clickCount;
      const visible = s.products.slice(0, CLICK_TARGETS);
      const targets = visible.length > 0 ? visible : buildCatalog(CLICK_TARGETS);
      const run = engine.runActions(total, CLICK_INTERVAL_MS, (i) => {
        const p = targets[i % targets.length]!;
        storeRef.current.addToCart(p.id, p.name);
      });
      const simulated = run.requested - run.executed;
      s.notify(
        'info',
        `Simulating ${total.toLocaleString('en')} clicks`,
        simulated > 0
          ? `${run.executed} executed, ${simulated.toLocaleString('en')} counted as simulated`
          : `Add to cart, about ${((run.executed * CLICK_INTERVAL_MS) / 1000).toFixed(1)} s of rapid tapping`,
      );
    },
    [engine],
  );

  // "Repeat last action": an engine-owned chain of timers, restarted whenever its settings change.
  useEffect(() => {
    if (!repeat) return;
    return engine.every(() => storeRef.current.replayLastAction(), repeatEveryMs);
  }, [engine, repeat, repeatEveryMs, generation]);

  const resetAll = useCallback(() => {
    engine.reset();
    setResetNote(true);
    engine.schedule(() => setResetNote(false), RESET_NOTE_MS);
  }, [engine]);

  const engageChaos = useCallback(
    (level?: ChaosLevel) => {
      const c = engine.getConfig();
      const next = generateChaosConfig(c.chaos.seed, level ?? c.chaos.level);
      engine.replaceConfig(next);
      setResetNote(false);
      storeRef.current.retry();
      runClicks(next.stress.clickCount);
    },
    [engine, runClicks],
  );

  /** Leaves chaos: same clean slate as Reset, without the "Fresh start" note. */
  const calmDown = useCallback(() => engine.reset(), [engine]);

  const randomize = useCallback(() => {
    engine.replaceConfig(randomConfig(randomSeed(), engine.getConfig().chaos.level));
    setResetNote(false);
    storeRef.current.retry();
  }, [engine]);

  const pickPreset = useCallback(
    (preset: Preset) => {
      engine.replaceConfig(applyPreset(engine.getConfig(), preset));
      setResetNote(false);
      storeRef.current.retry();
    },
    [engine],
  );

  return { runClicks, resetAll, engageChaos, calmDown, randomize, pickPreset, resetNote };
}

export type Lab = ReturnType<typeof useLab>;
