/* §9.3 — runes.

   Runes are the ONLY layer in the game that grants raw stats, and they
   are destroyed at run end. That is the whole reason the design can
   afford flat numbers here: they never accumulate across runs.

   They are deliberately chunky and situational rather than incremental —
   socket count peaks at four so this stays a decision, not arithmetic. */

import type { RuneDefinition } from '../engine/types';

export const RUNE_LIST: RuneDefinition[] = [
  /* --- common: single blunt stat --- */
  { id: 'rune_slug', name: 'Slug Weight', rarity: 'common', description: 'ATK +12%.', effects: [{ kind: 'STAT_PERCENT', stat: 'atk', percent: 0.12 }] },
  { id: 'rune_lamellar', name: 'Lamellar Shim', rarity: 'common', description: 'DEF +14%.', effects: [{ kind: 'STAT_PERCENT', stat: 'def', percent: 0.14 }] },
  { id: 'rune_ballast', name: 'Ballast Purge', rarity: 'common', description: 'SPD +10%.', effects: [{ kind: 'STAT_PERCENT', stat: 'spd', percent: 0.1 }] },
  { id: 'rune_optic', name: 'Optic Shim', rarity: 'common', description: 'FOC +14%.', effects: [{ kind: 'STAT_PERCENT', stat: 'foc', percent: 0.14 }] },
  { id: 'rune_dampener', name: 'Dampener Coil', rarity: 'common', description: 'RES +14%.', effects: [{ kind: 'STAT_PERCENT', stat: 'res', percent: 0.14 }] },
  { id: 'rune_bulk', name: 'Bulk Frame', rarity: 'common', description: 'HULL +12%.', effects: [{ kind: 'STAT_PERCENT', stat: 'hull', percent: 0.12 }] },

  /* --- uncommon: a trade, not an upgrade --- */
  { id: 'rune_overpressure', name: 'Overpressure Feed', rarity: 'uncommon', description: 'ATK +24%, DEF -10%.', effects: [{ kind: 'STAT_PERCENT', stat: 'atk', percent: 0.24 }, { kind: 'STAT_PERCENT', stat: 'def', percent: -0.1 }] },
  { id: 'rune_anchor', name: 'Anchor Bolts', rarity: 'uncommon', description: 'DEF +26%, SPD -12%.', effects: [{ kind: 'STAT_PERCENT', stat: 'def', percent: 0.26 }, { kind: 'STAT_PERCENT', stat: 'spd', percent: -0.12 }] },
  { id: 'rune_stripped', name: 'Stripped Frame', rarity: 'uncommon', description: 'SPD +22%, HULL -10%.', effects: [{ kind: 'STAT_PERCENT', stat: 'spd', percent: 0.22 }, { kind: 'STAT_PERCENT', stat: 'hull', percent: -0.1 }] },
  { id: 'rune_gunsight', name: 'Gunsight Array', rarity: 'uncommon', description: 'FOC +26%, RES -10%.', effects: [{ kind: 'STAT_PERCENT', stat: 'foc', percent: 0.26 }, { kind: 'STAT_PERCENT', stat: 'res', percent: -0.1 }] },
  { id: 'rune_sealed', name: 'Sealed Cabling', rarity: 'uncommon', description: 'RES +26%, FOC -10%.', effects: [{ kind: 'STAT_PERCENT', stat: 'res', percent: 0.26 }, { kind: 'STAT_PERCENT', stat: 'foc', percent: -0.1 }] },

  /* --- rare: opening effects, not numbers --- */
  { id: 'rune_ablative', name: 'Ablative Wrap', rarity: 'rare', description: 'Enter combat with a shield worth 18% of maximum HULL.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'SHIELD_PERCENT_MAX', percent: 0.18 }] }] },
  { id: 'rune_primer', name: 'Combat Primer', rarity: 'rare', description: 'Enter combat with ATK +20% for three turns.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'STAT_MODIFY', stat: 'atk', percent: 0.2, duration: 3, target: 'self' }] }] },
  { id: 'rune_ward', name: 'Interference Ward', rarity: 'rare', description: 'Enter combat immune to debuffs for two turns.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'DEBUFF_IMMUNITY', duration: 2 }] }] },
  { id: 'rune_hairtrigger', name: 'Hair Trigger', rarity: 'rare', description: 'ATK +16% and SPD +14%.', effects: [{ kind: 'STAT_PERCENT', stat: 'atk', percent: 0.16 }, { kind: 'STAT_PERCENT', stat: 'spd', percent: 0.14 }] },
  { id: 'rune_regenerator', name: 'Field Regenerator', rarity: 'rare', description: 'Repair 5% of maximum HULL per turn for the first four turns.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'REGEN', percent: 0.05, duration: 4 }] }] },

  /* --- epic: rule changes --- */
  { id: 'rune_riposte', name: 'Riposte Lattice', rarity: 'epic', description: 'Counter for 35% of damage taken, for the whole combat.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'COUNTER_STANCE', percent: 0.35, duration: 99 }] }] },
  { id: 'rune_venom', name: 'Venom Sink', rarity: 'epic', description: 'Enter combat having Marked the enemy, and with FOC +25%.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'APPLY_STATUS', status: 'mark', baseChance: 1 }, { kind: 'STAT_MODIFY', stat: 'foc', percent: 0.25, duration: 99, target: 'self' }] }] },
  { id: 'rune_reactor', name: 'Overclocked Reactor', rarity: 'epic', description: 'Enter combat Overclocked: SPD +40%, 4% HULL per turn.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'APPLY_STATUS', status: 'overclock', baseChance: 1 }] }] },
  { id: 'rune_mirror', name: 'Mirror Plate', rarity: 'epic', description: 'Reflect 30% of incoming damage for the whole combat.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'REFLECT', percent: 0.3, duration: 99 }] }] },

  /* --- legendary: run-defining --- */
  { id: 'rune_phoenix', name: 'Reboot Cell', rarity: 'legendary', description: 'Once per combat, reboot at 40% HULL instead of dying.', effects: [{ kind: 'ON_COMBAT_START', effects: [{ kind: 'REVIVE_SELF', healPercent: 0.4 }] }] },
  { id: 'rune_apex', name: 'Apex Calibration', rarity: 'legendary', description: 'ATK, FOC and SPD +20% each.', effects: [{ kind: 'STAT_PERCENT', stat: 'atk', percent: 0.2 }, { kind: 'STAT_PERCENT', stat: 'foc', percent: 0.2 }, { kind: 'STAT_PERCENT', stat: 'spd', percent: 0.2 }] },
  { id: 'rune_bastion', name: 'Bastion Protocol', rarity: 'legendary', description: 'Enter combat braced: incoming damage -30% for four turns, and DEF +25%.', effects: [{ kind: 'STAT_PERCENT', stat: 'def', percent: 0.25 }, { kind: 'ON_COMBAT_START', effects: [{ kind: 'DAMAGE_REDUCTION', percent: 0.3, duration: 4 }] }] },
];

export const RUNES: Record<string, RuneDefinition> = Object.fromEntries(
  RUNE_LIST.map((r) => [r.id, r]),
);

export function getRune(id: string): RuneDefinition {
  const rune = RUNES[id];
  if (!rune) throw new Error(`Unknown rune: ${id}`);
  return rune;
}
