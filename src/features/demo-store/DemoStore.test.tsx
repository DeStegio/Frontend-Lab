import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SimulationProvider } from '@/simulation/adapters/SimulationProvider';
import { DEFAULT_CONFIG, mergeConfig } from '@/simulation/config';
import { SimulationEngine } from '@/simulation/engine';
import type { DeepPartial, SimulationConfig } from '@/simulation/types';
import { DemoStore } from './components/DemoStore';
import { useDemoStore } from './useDemoStore';

function Harness() {
  const store = useDemoStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollRef} style={{ height: 720, overflow: 'auto', position: 'relative' }}>
      <DemoStore store={store} scrollRef={scrollRef} />
      <ul aria-label="Notifications">
        {store.state.toasts.map((t) => (
          <li key={t.id}>
            {t.title}: {t.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function setup(patch: DeepPartial<SimulationConfig> = {}) {
  const engine = new SimulationEngine({ config: mergeConfig(DEFAULT_CONFIG, patch) });
  const user = userEvent.setup({ delay: null });
  render(
    <SimulationProvider engine={engine}>
      <Harness />
    </SimulationProvider>,
  );
  return { engine, user };
}

const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const cards = () => screen.queryAllByRole('article');
const names = () => cards().map((c) => within(c).getByRole('heading').textContent);

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Demo Store', () => {
  it('shows skeletons while loading, then the catalog', async () => {
    setup();
    expect(cards()).toHaveLength(0);
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    await advance(300);
    expect(cards()).toHaveLength(12);
    expect(screen.getByText('12 products')).toBeInTheDocument();
  });

  it('searches after the debounce and only shows matches once the server answers', async () => {
    const { user } = setup({ network: { latencyMs: 1_000 } });
    await advance(1_300);
    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'lamp');
    expect(cards()).toHaveLength(12); // debouncing: previous results stay
    await advance(400);
    expect(cards()).toHaveLength(0); // loading: request is in flight
    await advance(1_300);
    expect(names()).toEqual(['Desk Lamp']);
  });

  it('shows an empty state and clears the search', async () => {
    const { user } = setup();
    await advance(300);
    await user.type(screen.getByRole('searchbox'), 'teapot');
    await advance(700);
    expect(screen.getByRole('heading', { name: 'Nothing matches “teapot”' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    await advance(300);
    expect(cards()).toHaveLength(12);
  });

  it('filters by category', async () => {
    const { user } = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Kitchen' }));
    expect(screen.getByRole('button', { name: 'Kitchen' })).toHaveAttribute('aria-pressed', 'true');
    await advance(300);
    expect(names()).toEqual(['Ceramic Mug', 'Glass Carafe', 'Salad Bowl']);
  });

  it('adds to cart with pending and success feedback', async () => {
    const { user } = setup({ network: { latencyMs: 500 } });
    await advance(800);
    await user.click(screen.getByRole('button', { name: 'Add Ceramic Mug to cart' }));
    expect(screen.getByText('Adding…')).toBeInTheDocument();
    await advance(800);
    expect(screen.getByRole('button', { name: 'Cart, 1 item' })).toBeInTheDocument();
    expect(screen.getByText('Added to cart: Ceramic Mug')).toBeInTheDocument();
    await advance(1_500);
    expect(within(cards()[0]!).getByText('Add to cart')).toBeInTheDocument();
  });

  it('shows a failed add with Retry and an error toast', async () => {
    const { engine, user } = setup();
    await advance(300);
    act(() => engine.setConfig({ network: { failurePercent: 100 } }));
    await user.click(screen.getByRole('button', { name: 'Add Desk Lamp to cart' }));
    await advance(300);
    expect(
      screen.getByRole('button', { name: 'Retry adding Desk Lamp to cart' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Couldn’t add item: Desk Lamp · server error 50[03]/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
  });

  it('shows the error state and recovers on retry', async () => {
    const { engine, user } = setup({ network: { failurePercent: 100 } });
    await advance(300);
    expect(screen.getByRole('alert')).toHaveTextContent('Products didn’t load');
    act(() => engine.setConfig({ network: { failurePercent: 0 } }));
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await advance(300);
    expect(cards()).toHaveLength(12);
  });

  it('shows the offline banner and the no-connection state', async () => {
    setup({ network: { offline: true } });
    expect(screen.getByRole('status')).toHaveTextContent('You’re offline');
    await advance(150);
    expect(screen.getByRole('alert')).toHaveTextContent('No connection');
  });

  it('gives up after the client timeout', async () => {
    setup({ network: { latencyMs: 45_000 } });
    await advance(30_000);
    expect(screen.getByRole('alert')).toHaveTextContent('The server took too long');
  });

  it('latest request wins: switching filters cancels the older fetch', async () => {
    const { engine, user } = setup({ network: { latencyMs: 2_000 } });
    await advance(2_300);
    await user.click(screen.getByRole('button', { name: 'Kitchen' }));
    await user.click(screen.getByRole('button', { name: 'Desk' }));
    await advance(2_300);
    expect(names()).toEqual(['Desk Lamp', 'Notebook Set', 'Pen Set']);
    expect(engine.getSnapshot().stats.cancelled).toBe(1);
  });

  it('reset empties the cart and ignores responses that arrive afterwards', async () => {
    const { engine, user } = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Add Ceramic Mug to cart' }));
    await advance(300);
    expect(screen.getByRole('button', { name: 'Cart, 1 item' })).toBeInTheDocument();

    act(() => engine.setConfig({ network: { latencyMs: 3_000 } }));
    await user.click(screen.getByRole('button', { name: 'Add Linen Tote to cart' }));
    act(() => engine.reset());
    await advance(5_000);
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
    expect(screen.queryByText('Adding…')).not.toBeInTheDocument();
  });

  it('applies text mutations as plain text', async () => {
    setup({ mutation: { textExpansion: 100 } });
    await advance(300);
    expect(names()[0]).toMatch(/^Céråmîç/);
  });

  it('virtualizes large catalogs instead of rendering every card', async () => {
    setup({ mutation: { itemCount: 240 } });
    await advance(300);
    expect(screen.getByText('240 products')).toBeInTheDocument();
    expect(cards().length).toBeGreaterThan(0);
    expect(cards().length).toBeLessThan(30);
  });
});
