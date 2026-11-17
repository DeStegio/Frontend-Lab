import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimulationEngine } from '../engine';
import { useSimulation } from './hooks';
import { SimulationProvider } from './SimulationProvider';

function Latency() {
  const latency = useSimulation((s) => s.config.network.latencyMs);
  return <output>{latency}</output>;
}

describe('React adapter', () => {
  it('re-renders subscribers when the engine changes', async () => {
    const engine = new SimulationEngine();
    render(
      <SimulationProvider engine={engine}>
        <Latency />
      </SimulationProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('0');
    await act(async () => {
      engine.setConfig({ network: { latencyMs: 4_500 } });
    });
    expect(screen.getByRole('status')).toHaveTextContent('4500');
  });

  it('disposes the engine on unmount, cancelling pending requests', async () => {
    const engine = new SimulationEngine();
    const { unmount } = render(
      <SimulationProvider engine={engine}>
        <Latency />
      </SimulationProvider>,
    );
    engine.setConfig({ network: { latencyMs: 60_000 } });
    const pending = engine.request({ method: 'GET', path: '/x', respond: () => 1 });
    unmount();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
