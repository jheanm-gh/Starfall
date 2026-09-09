/* Effective stat resolution. Every read of a combatant stat during
   combat goes through here, so buffs, statuses and the field can never
   be accidentally skipped by one call site. */

import type { Combatant, FieldId, StatKey } from '../types';
import { FIELDS } from '../../data/fields';
import { STATUS_STAT_EFFECTS } from '../../data/statuses';

export function effectiveStat(c: Combatant, stat: StatKey, field: FieldId | null): number {
  const base = c.stats[stat];

  // Timed STAT_MODIFY / STAT_STEAL entries stack additively.
  let percent = 0;
  for (const mod of c.mods) {
    if (mod.stat === stat) percent += mod.percent;
  }

  // Status-driven stat consequences (Corrode, Overclock, Bulwark).
  for (const st of c.statuses) {
    const entries = STATUS_STAT_EFFECTS[st.id];
    if (!entries) continue;
    for (const e of entries) {
      if (e.stat === stat) percent += e.perStack * st.stacks;
    }
  }

  let value = base * (1 + percent);

  // Field multipliers, unless this combatant is field-immune.
  if (field && c.fieldImmuneTurns <= 0) {
    const mult = FIELDS[field].statMult?.[stat];
    if (mult !== undefined) value *= mult;
  }

  return Math.max(0, value);
}

/** Max HULL is a base stat and is never modified mid-combat. */
export function maxHull(c: Combatant): number {
  return c.maxHull;
}

export function hullFraction(c: Combatant): number {
  return c.maxHull > 0 ? c.hull / c.maxHull : 0;
}
