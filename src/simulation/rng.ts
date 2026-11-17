/** Small, fast, seedable PRNG. Same seed, same sequence, on every engine. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Mixes several integers into one well-distributed 32-bit seed. */
export function hashSeed(...parts: number[]): number {
  let h = 0x811c9dc5;
  for (const p of parts) {
    h = Math.imul(h ^ (p >>> 0), 0x01000193);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return h >>> 0;
}

export type Rng = {
  next(): number;
  /** Integer in [min, max]. */
  int(min: number, max: number): number;
  /** Number in [min, max], snapped to `step`. */
  range(min: number, max: number, step?: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
};

export function createRng(seed: number): Rng {
  const next = mulberry32(seed);
  const range = (min: number, max: number, step = 0) => {
    const v = min + next() * (max - min);
    if (!step) return v;
    return Math.min(max, Math.round(v / step) * step);
  };
  return {
    next,
    range,
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (items) => {
      if (items.length === 0) throw new Error('pick() needs at least one item');
      return items[Math.floor(next() * items.length)] as (typeof items)[number];
    },
  };
}

/** A fresh seed for "Randomize". Determinism comes from showing and reusing it, not from this. */
export function randomSeed(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return (buf[0] ?? 1) || 1;
}
