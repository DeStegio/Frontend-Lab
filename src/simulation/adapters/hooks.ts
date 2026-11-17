import { useContext, useSyncExternalStore } from 'react';
import type { SimulationEngine } from '../engine';
import type { SimulationSnapshot } from '../types';
import { EngineContext } from './context';

export function useEngine(): SimulationEngine {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error('useEngine must be used inside <SimulationProvider>');
  return engine;
}

/**
 * Subscribes to a slice of the engine snapshot. The selector must return a primitive or a
 * reference taken from the snapshot (both stay stable until the engine changes).
 */
export function useSimulation<T>(selector: (snapshot: SimulationSnapshot) => T): T {
  const engine = useEngine();
  return useSyncExternalStore(engine.subscribe, () => selector(engine.getSnapshot()));
}
