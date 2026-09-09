/* ============================================================
   Seeded RNG — §1, §13.
   mulberry32, but exposed as a *pure indexed* draw: at(seed, cursor)
   returns the same value the sequential generator would produce on its
   cursor-th call, without replaying history. That is what lets combat
   state carry a plain integer cursor and still replay exactly.
   ============================================================ */

const STEP = 0x6d2b79f5;

/** One mulberry32 mixing round over an already-advanced state word. */
function mix(state: number): number {
  let t = state | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Classic sequential generator. Kept for scripts and simulations. */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + STEP) | 0;
    return mix(a);
  };
}

/** Pure indexed draw. at(seed, n) === the (n+1)-th call of mulberry32(seed). */
export function at(seed: number, cursor: number): number {
  return mix((seed + Math.imul(cursor + 1, STEP)) | 0);
}

/** A cursor-carrying handle. Every draw returns the next cursor explicitly. */
export interface Roll {
  value: number;
  cursor: number;
}

export function roll(seed: number, cursor: number): Roll {
  return { value: at(seed, cursor), cursor: cursor + 1 };
}

/** Integer in [min, max] inclusive. */
export function rollInt(seed: number, cursor: number, min: number, max: number): Roll {
  const r = roll(seed, cursor);
  return { value: min + Math.floor(r.value * (max - min + 1)), cursor: r.cursor };
}

/** Float in [min, max). */
export function rollRange(seed: number, cursor: number, min: number, max: number): Roll {
  const r = roll(seed, cursor);
  return { value: min + r.value * (max - min), cursor: r.cursor };
}

/** True with probability p. */
export function rollChance(seed: number, cursor: number, p: number): { value: boolean; cursor: number } {
  const r = roll(seed, cursor);
  return { value: r.value < p, cursor: r.cursor };
}

export function pick<T>(seed: number, cursor: number, items: readonly T[]): { value: T; cursor: number } {
  const r = rollInt(seed, cursor, 0, items.length - 1);
  return { value: items[r.value], cursor: r.cursor };
}

/** Weighted pick. Weights need not sum to 1. */
export function pickWeighted<T>(
  seed: number,
  cursor: number,
  items: readonly T[],
  weights: readonly number[],
): { value: T; cursor: number } {
  const total = weights.reduce((a, b) => a + b, 0);
  const r = roll(seed, cursor);
  let acc = 0;
  const target = r.value * total;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (target < acc) return { value: items[i], cursor: r.cursor };
  }
  return { value: items[items.length - 1], cursor: r.cursor };
}

/** Fisher-Yates using indexed draws. Returns a new array. */
export function shuffle<T>(seed: number, cursor: number, items: readonly T[]): { value: T[]; cursor: number } {
  const out = items.slice();
  let c = cursor;
  for (let i = out.length - 1; i > 0; i--) {
    const r = rollInt(seed, c, 0, i);
    c = r.cursor;
    const tmp = out[i];
    out[i] = out[r.value];
    out[r.value] = tmp;
  }
  return { value: out, cursor: c };
}

/**
 * §13: all in-run randomness derives from the run seed plus coordinates,
 * never from a shared mutable generator, so a floor generates identically
 * regardless of what happened before it.
 */
export function deriveSeed(seed: number, ...parts: number[]): number {
  let h = seed | 0;
  for (const part of parts) {
    h = Math.imul(h ^ (part | 0), 0x9e3779b1) | 0;
    h = (h ^ (h >>> 16)) | 0;
  }
  return h | 0;
}

/** Stable 32-bit hash of a string, for deterministic art and id-derived seeds. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
