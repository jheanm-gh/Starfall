/* §9.2 — ascension.

   The only permanent power increase in the game, and it is gated behind
   the gacha rather than purchasable. It raises the in-run level ceiling,
   unlocks the fourth skill at T4 and the awakened passive at T6. It never
   grants raw stats directly.  */

import type { Ascension, HeroDefinition, HeroInstance } from '../types';
import { ASCENSION_FRAGMENT_COST, ASCENSION_SALVAGE_COST, LEVELLING } from '../../data/balance';

export interface AscensionCost {
  fragments: number;
  salvage: number;
}

export function ascensionCost(def: HeroDefinition, from: Ascension): AscensionCost | null {
  if (from >= 6) return null;
  return {
    fragments: ASCENSION_FRAGMENT_COST[def.rarity][from - 1],
    salvage: ASCENSION_SALVAGE_COST[from - 1],
  };
}

export function canAscend(def: HeroDefinition, instance: HeroInstance, salvage: number): boolean {
  const cost = ascensionCost(def, instance.ascension);
  if (!cost) return false;
  return instance.fragments >= cost.fragments && salvage >= cost.salvage;
}

export function levelCap(ascension: Ascension): number {
  return LEVELLING.ASCENSION_LEVEL_CAP[ascension];
}

export function unlocksAtTier(tier: Ascension): string | null {
  if (tier === LEVELLING.FOURTH_SKILL_TIER) return 'Fourth skill';
  if (tier === LEVELLING.AWAKENED_TIER) return 'Awakened passive';
  return null;
}

/** In-run EXP curve: what it takes to go from `level` to `level + 1`. */
export function expToNext(level: number): number {
  return LEVELLING.expCurve(level);
}

/** Applies EXP to a level, respecting the ascension-gated cap. */
export function applyExp(level: number, exp: number, gained: number, cap: number): { level: number; exp: number } {
  let l = level;
  let e = exp + gained;
  while (l < cap) {
    const need = expToNext(l);
    if (e < need) break;
    e -= need;
    l += 1;
  }
  if (l >= cap) e = 0;
  return { level: l, exp: e };
}
