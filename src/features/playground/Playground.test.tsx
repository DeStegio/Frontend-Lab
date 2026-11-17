import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaygroundPage } from './PlaygroundPage';

function setup() {
  const router = createMemoryRouter([{ path: '/', element: <PlaygroundPage /> }]);
  render(<RouterProvider router={router} />);
  return userEvent.setup({ delay: null });
}

const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const status = () => screen.getAllByRole('status')[0]!;
const activeList = () => screen.getByRole('list', { name: 'Active' });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Playground', () => {
  it('starts idle with every control at default', async () => {
    setup();
    await advance(300);
    expect(status()).toHaveTextContent('Idle · normal conditions');
    expect(within(activeList()).getByText(/Nothing modified/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calm' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies a preset, lists its condition and removes it from the dock', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Slow network' }));
    expect(status()).toHaveTextContent('1 condition active');
    expect(within(activeList()).getByText('latency 6 s')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Latency' })).toHaveAttribute(
      'aria-valuetext',
      '6 s',
    );

    await user.click(screen.getByRole('button', { name: 'Remove latency' }));
    expect(screen.getByRole('slider', { name: 'Latency' })).toHaveAttribute(
      'aria-valuetext',
      'instant',
    );
  });

  it('changes parameters from the keyboard', async () => {
    const user = setup();
    await advance(300);
    const offline = screen.getByRole('switch', { name: /Offline/ });
    offline.focus();
    await user.keyboard(' ');
    expect(offline).toBeChecked();
    expect(within(activeList()).getByText('offline')).toBeInTheDocument();
  });

  it('engages chaos reproducibly from the seed and calms down to a clean slate', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Engage chaos' }));
    expect(status()).toHaveTextContent(/^Chaos mode/);
    const first = within(activeList())
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(first.length).toBeGreaterThan(3);

    await user.click(screen.getByRole('button', { name: 'Calm it down' }));
    expect(status()).toHaveTextContent('Idle');

    await user.click(screen.getByRole('button', { name: 'Engage chaos' }));
    const second = within(activeList())
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(second).toEqual(first);
    await user.click(screen.getByRole('button', { name: 'Calm it down' }));
  });

  it('runs rapid clicks through the cart', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: '×10' }));
    await user.click(screen.getByRole('button', { name: /Simulate 10 rapid clicks/ }));
    await advance(28 * 10 + 400);
    expect(screen.getByRole('button', { name: 'Cart, 10 items' })).toBeInTheDocument();
  });

  it('repeats the last action until switched off', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Technical details' }));
    const sent = () =>
      Number(
        within(screen.getByRole('region', { name: 'Technical details' })).getByText('Sent')
          .nextSibling?.textContent,
      );
    const before = sent();
    await user.click(screen.getByRole('switch', { name: /Repeat last action/ }));
    await advance(2_000 * 3 + 300);
    expect(sent()).toBe(before + 3);
    await user.click(screen.getByRole('switch', { name: /Repeat last action/ }));
    await advance(10_000);
    expect(sent()).toBe(before + 3);
  });

  it('reset all cancels work, clears conditions and empties the cart', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Rush hour' }));
    await advance(2_000);
    // ×100 clicks at 28 ms with 1.5 s latency: some adds land, many are pending, most not yet fired.
    await user.click(screen.getByRole('button', { name: /Simulate 100 rapid clicks/ }));
    await advance(2_000);
    expect(screen.getByRole('button', { name: /^Cart, [1-9]\d* items?$/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset all conditions' }));
    expect(screen.getByText(/Fresh start\./)).toBeInTheDocument();
    expect(status()).toHaveTextContent('Idle · normal conditions');
    expect(within(activeList()).getByText(/Nothing modified/)).toBeInTheDocument();

    // Neither the rest of the click run nor the pending requests may touch the fresh state.
    await advance(10_000);
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
    expect(screen.queryByText(/Fresh start\./)).not.toBeInTheDocument();
  });

  it('opens technical details and closes them with Escape', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Technical details' }));
    const panel = screen.getByRole('region', { name: 'Technical details' });
    expect(within(panel).getByRole('table', { name: /Request log/ })).toBeInTheDocument();
    expect(within(panel).getByText('/api/products?category=all&limit=12')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: 'Technical details' })).not.toBeInTheDocument();
  });
});
