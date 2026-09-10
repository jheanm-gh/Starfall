/* ============================================================
   The Reclaimed — §7.
   Salvaged cybernetics: self-repair, revival, staying power. Resist EM,
   vulnerable to corrosive. They are the answer to a burst roster and the
   worst possible pick into a Kel'Shar sector.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const RECLAIMED_SKILLS: SkillDefinition[] = [
  {
    id: 'reclaimed_scrap_gun', name: 'Scrap Gun', type: 'kinetic', cooldown: 0, priority: 0,
    description: 'Whatever was loose and heavy, fired at speed.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 1.05 }],
  },
  {
    id: 'reclaimed_arc_welder', name: 'Arc Welder', type: 'em', cooldown: 1, priority: 0,
    description: 'A repair tool used as a weapon, and vice versa.',
    effects: [{ kind: 'LIFESTEAL', power: 1.0, leechPercent: 0.35 }],
  },
  {
    id: 'reclaimed_patch', name: 'Field Patch', type: 'em', cooldown: 3, priority: 2,
    description: 'Repairs 24% of maximum HULL before anything else lands.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'HEAL_PERCENT', percent: 0.24 }],
  },
  {
    id: 'reclaimed_reboot', name: 'Reboot Protocol', type: 'em', cooldown: 5, priority: 0,
    description: 'Arms a single reboot: comes back at 45% HULL instead of dying.',
    effects: [{ kind: 'REVIVE_SELF', healPercent: 0.45 }],
  },
  {
    id: 'reclaimed_regen_loop', name: 'Repair Loop', type: 'em', cooldown: 3, priority: 0,
    description: 'Repairs 8% per turn for four turns.',
    effects: [{ kind: 'REGEN', percent: 0.08, duration: 4 }],
  },
  {
    id: 'reclaimed_grafted', name: 'Grafted Plating', type: 'em', cooldown: 3, priority: 1,
    description: 'Bolts on a shield worth 22% of maximum HULL.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'SHIELD_PERCENT_MAX', percent: 0.22 }],
  },
  {
    id: 'reclaimed_purge', name: 'Purge Routine', type: 'em', cooldown: 3, priority: 1,
    description: 'Flushes every affliction and hardens for two turns.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'CLEANSE_SELF' },
      { kind: 'DEBUFF_IMMUNITY', duration: 2 },
    ],
  },
  {
    id: 'reclaimed_overclock', name: 'Overclock Bus', type: 'em', cooldown: 3, priority: 0,
    description: 'Overclocked: SPD +40% and 4% HULL a turn. Worth it while it lasts.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'overclock', baseChance: 1 },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.2, duration: 3, target: 'self' },
    ],
  },
  {
    id: 'reclaimed_emp', name: 'EM Lance', type: 'em', cooldown: 2, priority: 0,
    description: 'Cuts through plating and often seizes their systems.',
    effects: [
      { kind: 'ARMOR_PIERCE', pierce: 0.3 },
      { kind: 'DIRECT_DAMAGE', power: 1.3 },
      { kind: 'APPLY_STATUS', status: 'static', baseChance: 0.4 },
    ],
  },
  {
    id: 'reclaimed_cannibalise', name: 'Cannibalise', type: 'em', cooldown: 3, priority: 0,
    description: 'Strips their systems and welds the parts on.',
    effects: [
      { kind: 'STAT_STEAL', stat: 'def', percent: 0.28, duration: 3 },
      { kind: 'BUFF_STRIP', count: 2 },
      { kind: 'DIRECT_DAMAGE', power: 0.8 },
    ],
  },
  {
    id: 'reclaimed_junk_wall', name: 'Junk Wall', type: 'kinetic', cooldown: 3, priority: 2,
    description: 'Incoming damage -38% for three turns.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'DAMAGE_REDUCTION', percent: 0.38, duration: 3 }],
  },
  {
    id: 'reclaimed_salvage_strike', name: 'Salvage Strike', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Hits far harder into something already coming apart.',
    effects: [{ kind: 'CONDITIONAL_DAMAGE', power: 1.2, condition: { targetHullBelow: 0.5 }, bonusMult: 1.7 }],
  },
  {
    id: 'reclaimed_redundancy', name: 'Redundant Systems', type: 'em', cooldown: 4, priority: 0,
    description: 'Clears every cooldown and banks charge for the next push.',
    effects: [{ kind: 'COOLDOWN_RESET' }, { kind: 'GAIN_CHARGE', amount: 3 }],
  },
  {
    id: 'reclaimed_capacitor', name: 'Capacitor Bank', type: 'em', cooldown: 0, priority: 0,
    description: 'A light shot that banks two charge.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 0.9 }, { kind: 'GAIN_CHARGE', amount: 2 }],
  },
  {
    id: 'reclaimed_discharge', name: 'Full Discharge', type: 'em', cooldown: 1, priority: 0,
    description: 'Dumps the bank. Half the power is free; the rest is bought with charge.',
    effects: [{ kind: 'SPEND_CHARGE', amount: 4, power: 2.4 }],
  },

  {
    id: 'reclaimed_awk_persist', name: 'Nothing Is Discarded', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Reboots once at 40% HULL and repairs slowly throughout.',
    effects: [
      { kind: 'REVIVE_SELF', healPercent: 0.4 },
      { kind: 'REGEN', percent: 0.03, duration: 99 },
    ],
  },
  {
    id: 'reclaimed_awk_repair', name: 'Continuous Repair', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Being hit triggers a repair cycle.',
    effects: [{ kind: 'ON_TAKE_DAMAGE', chance: 0.35, effects: [{ kind: 'HEAL_PERCENT', percent: 0.06 }] }],
  },
  {
    id: 'reclaimed_awk_graft', name: 'Field Graft', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill welds on fresh plating and clears the board.',
    effects: [{ kind: 'ON_KILL', effects: [{ kind: 'SHIELD_PERCENT_MAX', percent: 0.25 }, { kind: 'CLEANSE_SELF' }] }],
  },
  {
    id: 'reclaimed_awk_surge', name: 'Surge Capacity', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every exchange banks charge, and FOC runs 15% higher.',
    effects: [
      { kind: 'ON_TAKE_DAMAGE', chance: 1, effects: [{ kind: 'GAIN_CHARGE', amount: 1 }] },
      { kind: 'PASSIVE_AURA', stat: 'foc', percent: 0.15 },
    ],
  },
  {
    id: 'reclaimed_awk_hardened', name: 'Hardened Bus', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. RES +22% and permanent light damage reduction.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'res', percent: 0.22 },
      { kind: 'DAMAGE_REDUCTION', percent: 0.12, duration: 99 },
    ],
  },
];

export const RECLAIMED_HEROES: HeroDefinition[] = [
  {
    id: 'reclaimed_hand', slug: 'salvage-hand', name: 'Salvage Hand', race: 'reclaimed',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Sustain',
    baseStats: { hull: 129, atk: 44, def: 44, spd: 42, foc: 37, res: 42 },
    growth: { hull: 11.4, atk: 4.2, def: 3.5, spd: 1.4, foc: 2.3, res: 2.8 },
    skills: ['reclaimed_scrap_gun', 'reclaimed_arc_welder', 'reclaimed_patch', 'reclaimed_regen_loop'],
    awakenedPassive: 'reclaimed_awk_repair',
  },
  {
    id: 'reclaimed_welder', slug: 'arc-welder', name: 'Arc Welder', race: 'reclaimed',
    rarity: 'common', rosterCost: 1, damageType: 'em', role: 'Lifesteal',
    baseStats: { hull: 116, atk: 47, def: 39, spd: 45, foc: 41, res: 39 },
    growth: { hull: 9.5, atk: 4.5, def: 2.9, spd: 1.5, foc: 2.5, res: 2.5 },
    skills: ['reclaimed_arc_welder', 'reclaimed_emp', 'reclaimed_capacitor', 'reclaimed_patch'],
    awakenedPassive: 'reclaimed_awk_repair',
  },
  {
    id: 'reclaimed_bolted', slug: 'bolted-together', name: 'Bolted Together', race: 'reclaimed',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Wall',
    baseStats: { hull: 152, atk: 45, def: 52, spd: 40, foc: 36, res: 46 },
    growth: { hull: 13.2, atk: 4.3, def: 4.1, spd: 1.3, foc: 2.1, res: 3 },
    skills: ['reclaimed_scrap_gun', 'reclaimed_capacitor', 'reclaimed_patch', 'reclaimed_grafted'],
    awakenedPassive: 'reclaimed_awk_hardened',
  },
  {
    id: 'reclaimed_scavenger', slug: 'wreck-scavenger', name: 'Wreck Scavenger', race: 'reclaimed',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Opportunist',
    baseStats: { hull: 116, atk: 50, def: 37, spd: 46, foc: 42, res: 35 },
    growth: { hull: 9.6, atk: 4.8, def: 2.7, spd: 1.6, foc: 2.5, res: 2.3 },
    skills: ['reclaimed_salvage_strike', 'reclaimed_scrap_gun', 'reclaimed_cannibalise', 'reclaimed_patch'],
    awakenedPassive: 'reclaimed_awk_graft',
  },
  {
    id: 'reclaimed_capacitor_rig', slug: 'capacitor-rig', name: 'Capacitor Rig', race: 'reclaimed',
    rarity: 'common', rosterCost: 1, damageType: 'em', role: 'Charge burst',
    baseStats: { hull: 115, atk: 51, def: 37, spd: 49, foc: 49, res: 37 },
    growth: { hull: 9.8, atk: 4.9, def: 2.8, spd: 1.6, foc: 3, res: 2.4 },
    skills: ['reclaimed_capacitor', 'reclaimed_discharge', 'reclaimed_grafted', 'reclaimed_purge'],
    awakenedPassive: 'reclaimed_awk_surge',
  },
  {
    id: 'reclaimed_reconstructor', slug: 'reconstructor', name: 'Reconstructor Vell', race: 'reclaimed',
    rarity: 'uncommon', rosterCost: 2, damageType: 'em', role: 'Sustain anchor',
    baseStats: { hull: 162, atk: 53, def: 53, spd: 49, foc: 49, res: 53 },
    growth: { hull: 14.6, atk: 5.1, def: 4.2, spd: 1.7, foc: 3.1, res: 3.5 },
    skills: ['reclaimed_arc_welder', 'reclaimed_capacitor', 'reclaimed_purge', 'reclaimed_junk_wall'],
    awakenedPassive: 'reclaimed_awk_repair',
  },
  {
    id: 'reclaimed_lancer', slug: 'em-lancer', name: 'EM Lancer', race: 'reclaimed',
    rarity: 'uncommon', rosterCost: 2, damageType: 'em', role: 'Armour breaker',
    baseStats: { hull: 130, atk: 58, def: 43, spd: 49, foc: 51, res: 42 },
    growth: { hull: 11.4, atk: 5.5, def: 3.4, spd: 1.7, foc: 3.4, res: 2.7 },
    skills: ['reclaimed_emp', 'reclaimed_cannibalise', 'reclaimed_capacitor', 'reclaimed_overclock'],
    awakenedPassive: 'reclaimed_awk_surge',
  },
  {
    id: 'reclaimed_revenant', slug: 'lesser-revenant', name: 'Lesser Revenant', race: 'reclaimed',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Undying',
    baseStats: { hull: 155, atk: 51, def: 47, spd: 42, foc: 42, res: 47 },
    growth: { hull: 13.2, atk: 4.9, def: 3.6, spd: 1.4, foc: 2.6, res: 3 },
    skills: ['reclaimed_scrap_gun', 'reclaimed_reboot', 'reclaimed_regen_loop', 'reclaimed_salvage_strike'],
    awakenedPassive: 'reclaimed_awk_persist',
  },
  {
    id: 'reclaimed_overclocker', slug: 'overclocker', name: 'Overclocker Dace', race: 'reclaimed',
    rarity: 'uncommon', rosterCost: 2, damageType: 'em', role: 'Tempo',
    baseStats: { hull: 130, atk: 57, def: 40, spd: 53, foc: 49, res: 38 },
    growth: { hull: 11.4, atk: 5.5, def: 2.9, spd: 1.9, foc: 2.9, res: 2.5 },
    skills: ['reclaimed_capacitor', 'reclaimed_emp', 'reclaimed_arc_welder', 'reclaimed_overclock'],
    awakenedPassive: 'reclaimed_awk_surge',
  },
  {
    id: 'reclaimed_ossuary', slug: 'ossuary-frame', name: 'Ossuary Frame', race: 'reclaimed',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Immortal wall',
    baseStats: { hull: 192, atk: 63, def: 65, spd: 46, foc: 50, res: 61 },
    growth: { hull: 16.7, atk: 5.9, def: 4.8, spd: 1.6, foc: 3.1, res: 4 },
    skills: ['reclaimed_scrap_gun', 'reclaimed_capacitor', 'reclaimed_regen_loop', 'reclaimed_purge'],
    awakenedPassive: 'reclaimed_awk_persist',
  },
  {
    id: 'reclaimed_dynamo', slug: 'dynamo-core', name: 'Dynamo Core', race: 'reclaimed',
    rarity: 'rare', rosterCost: 4, damageType: 'em', role: 'Charge engine',
    baseStats: { hull: 139, atk: 64, def: 45, spd: 52, foc: 56, res: 43 },
    growth: { hull: 11.6, atk: 6, def: 3.2, spd: 1.8, foc: 3.3, res: 2.7 },
    skills: ['reclaimed_capacitor', 'reclaimed_discharge', 'reclaimed_redundancy', 'reclaimed_emp'],
    awakenedPassive: 'reclaimed_awk_surge',
  },
  {
    id: 'reclaimed_carrion', slug: 'carrion-rig', name: 'Carrion Rig', race: 'reclaimed',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Executioner',
    baseStats: { hull: 146, atk: 66, def: 49, spd: 49, foc: 53, res: 44 },
    growth: { hull: 12.6, atk: 6.2, def: 3.6, spd: 1.7, foc: 3.1, res: 2.7 },
    skills: ['reclaimed_salvage_strike', 'reclaimed_scrap_gun', 'reclaimed_arc_welder', 'reclaimed_junk_wall'],
    awakenedPassive: 'reclaimed_awk_graft',
  },
  {
    id: 'reclaimed_archivist', slug: 'the-archivist', name: 'The Archivist', race: 'reclaimed',
    rarity: 'epic', rosterCost: 7, damageType: 'em', role: 'Attrition anchor',
    baseStats: { hull: 175, atk: 68, def: 56, spd: 50, foc: 58, res: 55 },
    growth: { hull: 15.5, atk: 6.4, def: 4.2, spd: 1.6, foc: 3.5, res: 3.5 },
    skills: ['reclaimed_regen_loop', 'reclaimed_emp', 'reclaimed_capacitor', 'reclaimed_purge'],
    awakenedPassive: 'reclaimed_awk_persist',
  },
  {
    id: 'reclaimed_totality', slug: 'totality-frame', name: 'Totality Frame', race: 'reclaimed',
    rarity: 'epic', rosterCost: 7, damageType: 'em', role: 'Burst',
    baseStats: { hull: 161, atk: 78, def: 51, spd: 56, foc: 64, res: 46 },
    growth: { hull: 13.6, atk: 7.2, def: 3.8, spd: 1.9, foc: 3.6, res: 3 },
    skills: ['reclaimed_discharge', 'reclaimed_capacitor', 'reclaimed_redundancy', 'reclaimed_overclock'],
    awakenedPassive: 'reclaimed_awk_surge',
  },
  {
    id: 'reclaimed_first', slug: 'the-first-reclaimed', name: 'The First Reclaimed', race: 'reclaimed',
    rarity: 'legendary', rosterCost: 12, damageType: 'em', role: 'Refuses to end',
    baseStats: { hull: 188, atk: 77, def: 61, spd: 55, foc: 63, res: 59 },
    growth: { hull: 16.5, atk: 7.1, def: 4.4, spd: 1.9, foc: 3.6, res: 3.6 },
    skills: ['reclaimed_emp', 'reclaimed_capacitor', 'reclaimed_regen_loop', 'reclaimed_cannibalise'],
    awakenedPassive: 'reclaimed_awk_persist',
  },
];
