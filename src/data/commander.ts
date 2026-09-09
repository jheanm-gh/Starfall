/* §9.4 — the Commander.

   Everything here is capacity, options or access. The single exception is
   the command aura, which is a flat roster-wide bonus hard-capped at +5%
   (§9.4) — the one deliberate departure from §0.3, and the tunable to
   watch during balance. */

import type { SkillEffect, StatKey } from '../engine/types';

export interface CommanderSkillDefinition {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  /** Resolved as a free action at the start of a combat round. */
  effects: SkillEffect[];
  unlockRank: number;
}

export const COMMANDER_SKILLS: CommanderSkillDefinition[] = [
  { id: 'cmd_emergency_repair', name: 'Emergency Repair', cooldown: 4, unlockRank: 1, description: 'Repairs 30% of the active hero’s maximum HULL.', effects: [{ kind: 'HEAL_PERCENT', percent: 0.3 }] },
  { id: 'cmd_purge', name: 'Purge Order', cooldown: 3, unlockRank: 3, description: 'Clears every affliction on the active hero.', effects: [{ kind: 'CLEANSE_SELF' }] },
  { id: 'cmd_tempo', name: 'Tempo Override', cooldown: 5, unlockRank: 6, description: 'Swaps SPD with the enemy for the rest of the combat.', effects: [{ kind: 'SPEED_SWAP' }] },
  { id: 'cmd_barrier', name: 'Barrier Drop', cooldown: 4, unlockRank: 9, description: 'Shields the active hero for 25% of maximum HULL.', effects: [{ kind: 'SHIELD_PERCENT_MAX', percent: 0.25 }] },
  { id: 'cmd_target_lock', name: 'Target Lock', cooldown: 3, unlockRank: 12, description: 'Marks the enemy and strips their enhancements.', effects: [{ kind: 'APPLY_STATUS', status: 'mark', baseChance: 1 }, { kind: 'BUFF_STRIP' }] },
  { id: 'cmd_flush', name: 'System Flush', cooldown: 6, unlockRank: 16, description: 'Clears every cooldown on the active hero.', effects: [{ kind: 'COOLDOWN_RESET' }] },
];

export type DoctrineId =
  | 'persistent_afflictions' | 'shield_piercing_crits' | 'free_first_socket'
  | 'salvage_dividend' | 'opening_gambit' | 'field_scholar' | 'hard_currency' | 'triage_line';

export interface DoctrineDefinition {
  id: DoctrineId;
  name: string;
  /** A rule change, never a multiplier (§9.4). */
  description: string;
}

export const DOCTRINES: DoctrineDefinition[] = [
  { id: 'persistent_afflictions', name: 'Persistent Afflictions', description: 'Status effects you apply last one turn longer.' },
  { id: 'shield_piercing_crits', name: 'Shield-Piercing Crits', description: 'Critical hits ignore shields entirely.' },
  { id: 'free_first_socket', name: 'Requisition Slack', description: 'The first rune socketed each run costs nothing.' },
  { id: 'salvage_dividend', name: 'Salvage Dividend', description: 'Every milestone floor also pays out a rune.' },
  { id: 'opening_gambit', name: 'Opening Gambit', description: 'Your hero always acts first on the opening round of every combat.' },
  { id: 'field_scholar', name: 'Field Scholar', description: 'Your heroes ignore the environmental condition for the first two turns.' },
  { id: 'hard_currency', name: 'Hard Currency', description: 'Merchants stock one extra rune and one extra item.' },
  { id: 'triage_line', name: 'Triage Line', description: 'Heroes recover an extra 15% of maximum HULL between floors.' },
];

export interface LogisticsUpgrade {
  id: string;
  name: string;
  description: string;
  unlockRank: number;
}

export const LOGISTICS: LogisticsUpgrade[] = [
  { id: 'log_reroll', name: 'Merchant Contacts', description: 'One extra merchant reroll per stock.', unlockRank: 2 },
  { id: 'log_revive', name: 'Casualty Recovery', description: 'One extra revive per run.', unlockRank: 5 },
  { id: 'log_scrip', name: 'Advance Pay', description: 'Start each run with 80 additional Scrip.', unlockRank: 7 },
  { id: 'log_bench', name: 'Bench Berth', description: 'One additional roster slot beyond the five-hero cap.', unlockRank: 11 },
  { id: 'log_shop_tier', name: 'Preferred Buyer', description: 'Merchant stock is drawn from a better table.', unlockRank: 14 },
];

/** Roster budget unlocked by Salvage spend (§7): 15 at rank 1, 30 at rank 20. */
export function rosterBudgetForRank(rank: number): number {
  return Math.min(30, 15 + Math.floor(rank * 0.75));
}

export const AURA_STATS: StatKey[] = ['atk', 'def', 'hull', 'spd', 'foc', 'res'];
