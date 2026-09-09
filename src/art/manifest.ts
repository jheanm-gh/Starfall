/* §3.2 — asset resolution with graceful fallback.

   The manifest is built at compile time from the public asset tree, so
   `assetExists` is a synchronous map lookup rather than a network probe.
   Dropping 15 WebP files into a race folder lights them up with no code
   change; a missing file degrades to a procedural portrait rather than a
   broken image. */

import type { HeroDefinition } from '../engine/types';
import { generatePlaceholder } from './placeholder';

// import.meta.glob is resolved at build time by Vite, so this is a static
// map of every portrait that actually shipped — no network probing.
const heroAssets: Record<string, unknown> = import.meta.glob(
  '/public/assets/heroes/**/*.webp',
  { eager: true },
);

const AVAILABLE = new Set(
  Object.keys(heroAssets).map((key) => key.replace(/^\/public/, '')),
);

export function assetExists(path: string): boolean {
  return AVAILABLE.has(path);
}

export function heroPortrait(hero: HeroDefinition): string {
  const path = `/assets/heroes/${hero.race}/${hero.slug}.webp`;
  return assetExists(path) ? path : generatePlaceholder(hero.id, hero.race, hero.rarity);
}

/** True when a hero is showing real art rather than a placeholder. */
export function hasRealPortrait(hero: HeroDefinition): boolean {
  return assetExists(`/assets/heroes/${hero.race}/${hero.slug}.webp`);
}

export function portraitCoverage(heroes: HeroDefinition[]): { real: number; total: number } {
  return { real: heroes.filter(hasRealPortrait).length, total: heroes.length };
}
