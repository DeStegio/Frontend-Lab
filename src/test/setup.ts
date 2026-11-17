import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom has no layout; ScrollRestoration calls this on navigation.
window.scrollTo = () => {};

// jsdom has no ResizeObserver; the virtualizer and width hooks only need it to exist.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

/*
 * Minimal layout shim. jsdom reports every size as 0, which would make the virtualized grid
 * render nothing. Elements report the size set in their inline style, and virtualized rows
 * (data-index) report a realistic card-row height.
 */
export const TEST_ROW_HEIGHT = 330;
const inlineSize = (el: HTMLElement, prop: 'width' | 'height', fallback: number) =>
  parseFloat(el.style[prop]) || fallback;
const height = (el: HTMLElement) =>
  el.dataset.index !== undefined ? TEST_ROW_HEIGHT : inlineSize(el, 'height', 0);
for (const [prop, get] of [
  ['offsetHeight', height],
  ['clientHeight', height],
  ['offsetWidth', (el: HTMLElement) => inlineSize(el, 'width', 800)],
  ['clientWidth', (el: HTMLElement) => inlineSize(el, 'width', 800)],
] as const) {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    get(this: HTMLElement) {
      return get(this);
    },
  });
}

/*
 * Testing Library flushes async work with setTimeout(0) and only advances it under fake timers
 * when it finds a `jest` global. Point it at Vitest so userEvent works with vi.useFakeTimers().
 */
(globalThis as unknown as { jest: unknown }).jest = {
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
};
