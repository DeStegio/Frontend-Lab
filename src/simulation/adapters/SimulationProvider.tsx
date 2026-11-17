import { useEffect, useState } from 'react';
import { SimulationEngine } from '../engine';
import { EngineContext } from './context';

/**
 * Owns one engine for the subtree. Mounted by the playground only, so simulation state never
 * leaks into the marketing pages; unmounting cancels every pending request and timer.
 */
export function SimulationProvider({
  engine: provided,
  children,
}: {
  engine?: SimulationEngine;
  children: React.ReactNode;
}) {
  const [engine] = useState(() => provided ?? new SimulationEngine());
  useEffect(() => () => engine.dispose(), [engine]);
  return <EngineContext value={engine}>{children}</EngineContext>;
}
