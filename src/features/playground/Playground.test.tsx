import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTDOWN_STEP_MS } from './useLab';
import { PlaygroundPage } from './PlaygroundPage';

function setup() {
  const router = createMemoryRouter([{ path: '/', element: <PlaygroundPage /> }]);
  render(<RouterProvider router={router} />);
  return userEvent.setup({ delay: null });
}

const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const status = () => screen.getAllByRole('status')[0]!;
const conditionsList = () => screen.getByRole('list', { name: 'Active conditions' });
const stickers = () =>
  within(conditionsList())
    .queryAllByRole('listitem')
    .map((li) => li.textContent)
    .filter((t) => t !== 'ALL CONDITIONS NORMAL');
const incidentLog = () => screen.getByRole('log');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Playground', () => {
  it('starts idle with every control at default and a happy server', async () => {
    setup();
    await advance(300);
    expect(status()).toHaveTextContent('Idle · normal conditions');
    expect(stickers()).toEqual([]);
    expect(screen.getByRole('button', { name: 'Calm' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('img', { name: 'Server mood: happy' })).toBeInTheDocument();
    expect(within(incidentLog()).getByText(/Lab online\. Seed \d+/)).toBeInTheDocument();
  });

  it('applies a preset, shows a sticker, narrates it, and removes it from the screen', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Slow network' }));
    expect(status()).toHaveTextContent('1 condition active');
    expect(stickers()).toEqual(['latency 6 s']);
    expect(screen.getByRole('slider', { name: 'Latency' })).toHaveAttribute(
      'aria-valuetext',
      '6 s',
    );
    expect(screen.getByRole('img', { name: 'Server mood: snoozing' })).toBeInTheDocument();
    await advance(1); // the log is fed by an engine subscription, one tick behind
    expect(within(incidentLog()).getAllByRole('listitem')[0]).toHaveTextContent('(6 s)');

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
    expect(stickers()).toEqual(['offline']);
    expect(screen.getByRole('img', { name: 'Server mood: unplugged' })).toBeInTheDocument();
  });

  it('counts down, engages chaos reproducibly from the seed, and calms down', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Engage chaos' }));
    expect(screen.getByText('3')).toBeInTheDocument();
    await advance(COUNTDOWN_STEP_MS * 3 + 50);
    expect(status()).toHaveTextContent(/^Chaos mode/);
    expect(screen.getByRole('img', { name: 'Server mood: losing it' })).toBeInTheDocument();
    const first = stickers();
    expect(first.length).toBeGreaterThan(3);

    await user.click(screen.getByRole('button', { name: 'Calm it down' }));
    expect(status()).toHaveTextContent('Idle');

    await user.click(screen.getByRole('button', { name: 'Engage chaos' }));
    await advance(COUNTDOWN_STEP_MS * 3 + 50);
    expect(stickers()).toEqual(first);
    await user.click(screen.getByRole('button', { name: 'Calm it down' }));
  });

  it('reset during the countdown cancels chaos', async () => {
    const user = setup();
    await advance(300);
    await user.click(screen.getByRole('button', { name: 'Engage chaos' }));
    await user.click(screen.getByRole('button', { name: 'Reset all conditions' }));
    await advance(COUNTDOWN_STEP_MS * 4);
    expect(status()).toHaveTextContent('Idle · normal conditions');
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
    expect(stickers()).toEqual([]);
    await advance(1);
    expect(
      within(incidentLog()).getByText(/Extinguisher deployed|Fresh start\. Smells/),
    ).toBeInTheDocument();

    // Neither the rest of the click run nor the pending requests may touch the fresh state.
    await advance(10_000);
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
    expect(screen.queryByText(/Fresh start\. Conditions/)).not.toBeInTheDocument();
  });

  it('expands the store to fill the stage and shrinks it back', async () => {
    const user = setup();
    await advance(300);
    expect(screen.getByRole('region', { name: 'Control deck' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand store' }));
    expect(screen.queryByRole('region', { name: 'Control deck' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shrink store' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // Quick modes and condition stickers stay usable while expanded.
    await user.click(screen.getByRole('button', { name: 'Flaky API' }));
    expect(stickers()).toContain('fail 40%');

    await user.keyboard('{Escape}');
    expect(screen.getByRole('region', { name: 'Control deck' })).toBeInTheDocument();
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
