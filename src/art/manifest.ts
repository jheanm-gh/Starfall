/* §3.2 — asset resolution with graceful fallback.

   Every asset class the game can use is resolved here, from a manifest
   built at COMPILE time by globbing the public asset tree. That makes
   every lookup a synchronous map read rather than a network probe, and it
   means dropping files into the right folder lights them up with no code
   change at all.

   Nothing here can break a screen. A missing hero portrait falls back to
   the procedural silhouette; every other missing asset resolves to null,
   and the UI renders the text or CSS treatment it uses today. That is the
   §0.4 guarantee: the game is fully playable before any art exists, and
   stays playable while art arrives one folder at a time.

   The paths below are the contract the P9 asset manifest is written
   against — see docs/P9_ASSET_MANIFEST.md. */

import type {
  DamageType, FieldId, HeroDefinition, RaceId, Rarity, StatusId,
} from '../engine/types';
import { generatePlaceholder } from './placeholder';

/* Vite resolves these at build time. Each pattern must be a literal. */
const GLOBS: Record<string, Record<string, unknown>> = {
  heroes: import.meta.glob('/public/assets/heroes/**/*.webp', { eager: true }),
  races: import.meta.glob('/public/assets/races/*.{webp,svg}', { eager: true }),
  sectors: import.meta.glob('/public/assets/sectors/*.webp', { eager: true }),
  fields: import.meta.glob('/public/assets/fields/*.{webp,png}', { eager: true }),
  statuses: import.meta.glob('/public/assets/icons/statuses/*.svg', { eager: true }),
  types: import.meta.glob('/public/assets/icons/types/*.svg', { eager: true }),
  gear: import.meta.glob('/public/assets/icons/gear/*.svg', { eager: true }),
  runes: import.meta.glob('/public/assets/icons/runes/*.svg', { eager: true }),
  items: import.meta.glob('/public/assets/icons/items/*.svg', { eager: true }),
  ui: import.meta.glob('/public/assets/ui/**/*.{svg,webp,png}', { eager: true }),
  effects: import.meta.glob('/public/assets/effects/*.{webp,png}', { eager: true }),
  music: import.meta.glob('/public/assets/audio/music/*.{ogg,mp3}', { eager: true }),
  sfx: import.meta.glob('/public/assets/audio/sfx/*.{ogg,mp3}', { eager: true }),
};

/** Public paths of everything that actually shipped, by asset class. */
const AVAILABLE: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(GLOBS).map(([kind, map]) => [
    kind,
    new Set(Object.keys(map).map((key) => key.replace(/^\/public/, ''))),
  ]),
);

export function assetExists(path: string): boolean {
  for (const set of Object.values(AVAILABLE)) if (set.has(path)) return true;
  return false;
}

/** Returns the first candidate extension that shipped, or null. */
function resolve(kind: string, base: string, exts: string[]): string | null {
  const set = AVAILABLE[kind];
  if (!set) return null;
  for (const ext of exts) {
    const path = `${base}.${ext}`;
    if (set.has(path)) return path;
  }
  return null;
}

/* ---------- heroes (the one class with a procedural fallback) ---------- */

export function heroPortrait(hero: HeroDefinition): string {
  return resolve('heroes', `/assets/heroes/${hero.race}/${hero.slug}`, ['webp'])
    ?? generatePlaceholder(hero.id, hero.race, hero.rarity);
}

export function hasRealPortrait(hero: HeroDefinition): boolean {
  return resolve('heroes', `/assets/heroes/${hero.race}/${hero.slug}`, ['webp']) !== null;
}

/* ---------- everything else: null means "use the built-in treatment" ---------- */

export function raceEmblem(race: RaceId): string | null {
  return resolve('races', `/assets/races/${race}`, ['svg', 'webp']);
}

export function sectorBackdrop(sectorId: string): string | null {
  return resolve('sectors', `/assets/sectors/${sectorId}`, ['webp']);
}

/** Full-bleed overlay for an environmental condition (§11). */
export function fieldOverlay(field: FieldId): string | null {
  return resolve('fields', `/assets/fields/${field}`, ['webp', 'png']);
}

export function statusIcon(status: StatusId): string | null {
  return resolve('statuses', `/assets/icons/statuses/${status}`, ['svg']);
}

export function damageTypeIcon(type: DamageType): string | null {
  return resolve('types', `/assets/icons/types/${type}`, ['svg']);
}

export function chassisIcon(chassisId: string): string | null {
  return resolve('gear', `/assets/icons/gear/${chassisId}`, ['svg']);
}

export function runeIcon(runeId: string): string | null {
  return resolve('runes', `/assets/icons/runes/${runeId}`, ['svg']);
}

export function itemIcon(itemId: string): string | null {
  return resolve('items', `/assets/icons/items/${itemId}`, ['svg']);
}

/** Frames, plates, rules and marks. `name` is a path under /assets/ui. */
export function uiAsset(name: string): string | null {
  return resolve('ui', `/assets/ui/${name}`, ['svg', 'webp', 'png']);
}

/** Rarity frame art, if supplied. Otherwise §2.3's CSS construction stands. */
export function rarityFrame(rarity: Rarity): string | null {
  return uiAsset(`frames/${rarity}`);
}

/**
 * Sprite sheet for an attack or combat event. Named by damage type
 * (`kinetic`) or by event (`crit`, `heal`, `shield`, `dodge`, `death`).
 */
export function effectSheet(name: DamageType | string): string | null {
  return resolve('effects', `/assets/effects/${name}`, ['webp', 'png']);
}

export function musicTrack(name: string): string | null {
  return resolve('music', `/assets/audio/music/${name}`, ['ogg', 'mp3']);
}

export function sfx(name: string): string | null {
  return resolve('sfx', `/assets/audio/sfx/${name}`, ['ogg', 'mp3']);
}

/* ---------- P9 progress readout ---------- */

export interface CoverageEntry {
  kind: string;
  shipped: number;
  expected: number;
}

/**
 * How much of the asset manifest has actually landed. Expected counts come
 * from the data, so they stay correct as content changes.
 */
export function assetCoverage(expected: Record<string, number>): CoverageEntry[] {
  return Object.entries(expected).map(([kind, count]) => ({
    kind,
    shipped: AVAILABLE[kind]?.size ?? 0,
    expected: count,
  }));
}

export function portraitCoverage(heroes: HeroDefinition[]): { real: number; total: number } {
  return { real: heroes.filter(hasRealPortrait).length, total: heroes.length };
}
