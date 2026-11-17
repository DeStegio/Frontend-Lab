import { useSyncExternalStore } from 'react';

export type Device = 'mobile' | 'tablet' | 'desktop';

/** Playground breakpoints from the interaction spec: mobile < 640 ≤ tablet < 1100 ≤ desktop. */
const MOBILE = '(max-width: 639.98px)';
const TABLET = '(max-width: 1099.98px)';

function read(): Device {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
  if (window.matchMedia(MOBILE).matches) return 'mobile';
  if (window.matchMedia(TABLET).matches) return 'tablet';
  return 'desktop';
}

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const queries = [MOBILE, TABLET].map((q) => window.matchMedia(q));
  queries.forEach((q) => q.addEventListener('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener('change', onChange));
}

export function useDevice(): Device {
  return useSyncExternalStore(subscribe, read, () => 'desktop');
}
