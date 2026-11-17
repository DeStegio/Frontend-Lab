import { createContext } from 'react';
import type { SimulationEngine } from '../engine';

export const EngineContext = createContext<SimulationEngine | null>(null);
