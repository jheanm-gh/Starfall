/* ============================================================
   Vantari Hegemony — §7.
   High-gravity bulwarks: enormous DEF, punishing SPD. Resist kinetic,
   vulnerable to EM. Their kits win by refusing to lose: damage reduction,
   counters, reflect and Bulwark, with the drawback that they act last
   almost every round and can be pulled apart by status pressure.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const VANTARI_SKILLS: SkillDefinition[] = [
  {
    id: 'vantari_mass_driver', name: 'Mass Driver', type: 'kinetic', cooldown: 0, priority: -1,
    description: 'Slow, heavy, inevitable.',
    effects: [{ kind: 'PRIORITY', tier: -1 }, { kind: 'DIRECT_DAMAGE', power: 1.22 }],
  },
  {
    id: 'vantari_gravitic_slam', name: 'Gravitic Slam', type: 'kinetic', cooldown: 2, priority: -2,
    description: 'Drops a local gravity well on them. Slows and hurts.',
    effects: [
      { kind: 'PRIORITY', tier: -2 },
      { kind: 'DIRECT_DAMAGE', power: 1.5 },
      { kind: 'DELAY_TARGET', percent: 0.25, duration: 3 },
    ],
  },
  {
    id: 'vantari_setstance', name: 'Set Stance', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Bulwark: DEF +30%, SPD -15%. Plus a shield worth 15% of HULL.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'bulwark', baseChance: 1 },
      { kind: 'SHIELD_PERCENT_MAX', percent: 0.15 },
    ],
  },
  {
    id: 'vantari_deadweight', name: 'Deadweight', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Incoming damage -35% and 40% returned, for three turns.',
    effects: [
      { kind: 'DAMAGE_REDUCTION', percent: 0.35, duration: 3 },
      { kind: 'COUNTER_STANCE', percent: 0.4, duration: 3 },
    ],
  },
  {
    id: 'vantari_ballast', name: 'Ballast Shift', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Trades what is left of their speed for structure.',
    effects: [
      { kind: 'STAT_STEAL', stat: 'def', percent: 0.25, duration: 3 },
      { kind: 'DIRECT_DAMAGE', power: 0.7 },
    ],
  },
  {
    id: 'vantari_crush', name: 'Crush Depth', type: 'kinetic', cooldown: 3, priority: -2,
    description: 'Enormously heavy. Far worse against something already slowed.',
    effects: [
      { kind: 'PRIORITY', tier: -2 },
      { kind: 'ARMOR_PIERCE', pierce: 0.35 },
      { kind: 'CONDITIONAL_DAMAGE', power: 1.6, condition: { targetHasStatus: 'bulwark' }, bonusMult: 1.4 },
    ],
  },
  {
    id: 'vantari_anchor', name: 'Anchor Line', type: 'kinetic', cooldown: 4, priority: 1,
    description: 'Fixes both frames in place. Nothing outruns this.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'DELAY_TARGET', percent: 0.4, duration: 3 },
      { kind: 'APPLY_STATUS', status: 'jam', baseChance: 0.55 },
    ],
  },
  {
    id: 'vantari_bulk_repair', name: 'Bulk Repair', type: 'kinetic', cooldown: 4, priority: 0,
    description: 'Repairs 25% of maximum HULL and clears one affliction.',
    effects: [{ kind: 'HEAL_PERCENT', percent: 0.25 }, { kind: 'CLEANSE_SELF', count: 1 }],
  },
  {
    id: 'vantari_shield_wall', name: 'Hegemony Wall', type: 'kinetic', cooldown: 3, priority: 2,
    description: 'A shield worth 28% of maximum HULL, raised before anything lands.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'SHIELD_PERCENT_MAX', percent: 0.28 }],
  },
  {
    id: 'vantari_reflector', name: 'Reflector Plate', type: 'em', cooldown: 4, priority: 0,
    description: 'Reflects 50% of incoming damage for three turns.',
    effects: [{ kind: 'REFLECT', percent: 0.5, duration: 3 }],
  },
  {
    id: 'vantari_pressure', name: 'Pressure Casing', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Hardens against interference and strips their enhancements.',
    effects: [{ kind: 'DEBUFF_IMMUNITY', duration: 3 }, { kind: 'BUFF_STRIP', count: 2 }],
  },
  {
    id: 'vantari_siegework', name: 'Siegework', type: 'kinetic', cooldown: 0, priority: -1,
    description: 'A grinding sequence that grows while it is maintained.',
    effects: [{ kind: 'PRIORITY', tier: -1 }, { kind: 'RAMPING', power: 0.85, increment: 0.26, maxStacks: 5 }],
  },
  {
    id: 'vantari_tectonic', name: 'Tectonic Shear', type: 'kinetic', cooldown: 3, priority: -2,
    description: 'Sets High Gravity and hits enormously under it.',
    effects: [
      { kind: 'PRIORITY', tier: -2 },
      { kind: 'SET_FIELD', field: 'high_gravity' },
      { kind: 'SCALE_WITH_FIELD', power: 1.3, field: 'high_gravity', scaledPower: 2.05 },
    ],
  },
  {
    id: 'vantari_immovable', name: 'Immovable', type: 'kinetic', cooldown: 5, priority: 3,
    description: 'Incoming damage -60% for two turns. Nothing gets through.',
    effects: [
      { kind: 'PRIORITY', tier: 3 },
      { kind: 'DAMAGE_REDUCTION', percent: 0.6, duration: 2 },
      { kind: 'CLEANSE_SELF' },
    ],
  },
  {
    id: 'vantari_worldbreaker', name: 'Worldbreaker', type: 'kinetic', cooldown: 4, priority: -2,
    description: 'Charges one turn, then lands at triple weight.',
    effects: [
      { kind: 'PRIORITY', tier: -2 },
      { kind: 'CHARGE', multiplier: 3.0 },
      { kind: 'ARMOR_PIERCE', pierce: 0.4 },
      { kind: 'DIRECT_DAMAGE', power: 1.35 },
    ],
  },

  /* --- awakened passives --- */
  {
    id: 'vantari_awk_bulwark', name: 'Standing Weight', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. DEF +18%, and being hit raises fresh shielding.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'def', percent: 0.18 },
      { kind: 'ON_TAKE_DAMAGE', chance: 0.3, effects: [{ kind: 'SHIELD_PERCENT_MAX', percent: 0.08 }] },
    ],
  },
  {
    id: 'vantari_awk_grind', name: 'Grinding Advance', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit slows them further.',
    effects: [{ kind: 'ON_HIT', chance: 0.35, effects: [{ kind: 'DELAY_TARGET', percent: 0.12, duration: 2 }] }],
  },
  {
    id: 'vantari_awk_return', name: 'Returned in Kind', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Permanently counters for 30% of damage taken.',
    effects: [{ kind: 'COUNTER_STANCE', percent: 0.3, duration: 99 }],
  },
  {
    id: 'vantari_awk_hold', name: 'The Line Holds', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. RES +20%, and a kill restores a quarter of the frame.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'res', percent: 0.2 },
      { kind: 'ON_KILL', effects: [{ kind: 'HEAL_PERCENT', percent: 0.25 }] },
    ],
  },
  {
    id: 'vantari_awk_gravity', name: 'Local Gravity', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Ignores ambient conditions and hits 14% harder.',
    effects: [
      { kind: 'FIELD_IMMUNITY', duration: 99 },
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.14 },
    ],
  },
];

export const VANTARI_HEROES: HeroDefinition[] = [
  {
    id: 'vantari_ratings', slug: 'deck-ratings', name: 'Deck Ratings', race: 'vantari',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Frontline',
    baseStats: { hull: 132, atk: 40, def: 54, spd: 23, foc: 26, res: 36 },
    growth: { hull: 11.7, atk: 3.8, def: 4, spd: 0.8, foc: 1.8, res: 2.3 },
    skills: ['vantari_mass_driver', 'vantari_setstance', 'vantari_shield_wall', 'vantari_ballast'],
    awakenedPassive: 'vantari_awk_bulwark',
  },
  {
    id: 'vantari_pressman', slug: 'pressure-hand', name: 'Pressure Hand', race: 'vantari',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Slower',
    baseStats: { hull: 119, atk: 40, def: 47, spd: 23, foc: 29, res: 33 },
    growth: { hull: 10.8, atk: 3.8, def: 3.5, spd: 0.9, foc: 1.8, res: 2.2 },
    skills: ['vantari_mass_driver', 'vantari_gravitic_slam', 'vantari_deadweight', 'vantari_bulk_repair'],
    awakenedPassive: 'vantari_awk_grind',
  },
  {
    id: 'vantari_holdfast', slug: 'holdfast', name: 'Holdfast', race: 'vantari',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Wall',
    baseStats: { hull: 141, atk: 37, def: 58, spd: 23, foc: 23, res: 41 },
    growth: { hull: 12.3, atk: 3.5, def: 4.3, spd: 0.8, foc: 1.6, res: 2.4 },
    skills: ['vantari_mass_driver', 'vantari_ballast', 'vantari_deadweight', 'vantari_setstance'],
    awakenedPassive: 'vantari_awk_return',
  },
  {
    id: 'vantari_ballastman', slug: 'ballast-crew', name: 'Ballast Crew', race: 'vantari',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Attrition',
    baseStats: { hull: 124, atk: 42, def: 46, spd: 25, foc: 27, res: 30 },
    growth: { hull: 10.1, atk: 4, def: 3.2, spd: 1, foc: 1.9, res: 2.2 },
    skills: ['vantari_siegework', 'vantari_ballast', 'vantari_bulk_repair', 'vantari_setstance'],
    awakenedPassive: 'vantari_awk_bulwark',
  },
  {
    id: 'vantari_anchorhand', slug: 'anchor-hand', name: 'Anchor Hand', race: 'vantari',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Controller',
    baseStats: { hull: 128, atk: 43, def: 48, spd: 28, foc: 34, res: 32 },
    growth: { hull: 10.7, atk: 4.1, def: 3.2, spd: 1.1, foc: 2.2, res: 2.2 },
    skills: ['vantari_mass_driver', 'vantari_anchor', 'vantari_shield_wall', 'vantari_gravitic_slam'],
    awakenedPassive: 'vantari_awk_grind',
  },
  {
    id: 'vantari_siegemaster', slug: 'siege-master', name: 'Siege Master Odh', race: 'vantari',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Ramping siege',
    baseStats: { hull: 132, atk: 45, def: 49, spd: 25, foc: 30, res: 35 },
    growth: { hull: 11.9, atk: 4.3, def: 3.5, spd: 1, foc: 2.1, res: 2.3 },
    skills: ['vantari_siegework', 'vantari_crush', 'vantari_setstance', 'vantari_deadweight'],
    awakenedPassive: 'vantari_awk_grind',
  },
  {
    id: 'vantari_platewright', slug: 'platewright', name: 'Platewright Ceth', race: 'vantari',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Reflector',
    baseStats: { hull: 146, atk: 44, def: 57, spd: 23, foc: 31, res: 44 },
    growth: { hull: 13.2, atk: 4.3, def: 4.3, spd: 0.9, foc: 2, res: 2.6 },
    skills: ['vantari_mass_driver', 'vantari_siegework', 'vantari_shield_wall', 'vantari_bulk_repair'],
    awakenedPassive: 'vantari_awk_return',
  },
  {
    id: 'vantari_wellkeeper', slug: 'well-keeper', name: 'Well Keeper Brahn', race: 'vantari',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Field control',
    baseStats: { hull: 124, atk: 48, def: 46, spd: 24, foc: 34, res: 34 },
    growth: { hull: 10.6, atk: 4.6, def: 3.4, spd: 0.9, foc: 2.2, res: 2.2 },
    skills: ['vantari_mass_driver', 'vantari_gravitic_slam', 'vantari_setstance', 'vantari_tectonic'],
    awakenedPassive: 'vantari_awk_gravity',
  },
  {
    id: 'vantari_ironwright', slug: 'ironwright', name: 'Ironwright Sull', race: 'vantari',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Sustain wall',
    baseStats: { hull: 162, atk: 44, def: 59, spd: 25, foc: 30, res: 44 },
    growth: { hull: 14.1, atk: 4.3, def: 4.3, spd: 0.9, foc: 2.1, res: 2.8 },
    skills: ['vantari_mass_driver', 'vantari_siegework', 'vantari_deadweight', 'vantari_pressure'],
    awakenedPassive: 'vantari_awk_hold',
  },
  {
    id: 'vantari_kolvar', slug: 'kolvar-of-the-deep', name: 'Kolvar of the Deep', race: 'vantari',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Crusher',
    baseStats: { hull: 144, atk: 54, def: 54, spd: 26, foc: 33, res: 40 },
    growth: { hull: 13.1, atk: 5.1, def: 3.8, spd: 0.9, foc: 2, res: 2.4 },
    skills: ['vantari_crush', 'vantari_gravitic_slam', 'vantari_mass_driver', 'vantari_setstance'],
    awakenedPassive: 'vantari_awk_bulwark',
  },
  {
    id: 'vantari_thessa', slug: 'thessa-unmoved', name: 'Thessa Unmoved', race: 'vantari',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Immovable',
    baseStats: { hull: 168, atk: 48, def: 66, spd: 25, foc: 32, res: 48 },
    growth: { hull: 15.4, atk: 4.6, def: 4.4, spd: 0.9, foc: 2.3, res: 3 },
    skills: ['vantari_mass_driver', 'vantari_siegework', 'vantari_reflector', 'vantari_bulk_repair'],
    awakenedPassive: 'vantari_awk_return',
  },
  {
    id: 'vantari_gravemaker', slug: 'gravemaker-ust', name: 'Gravemaker Ust', race: 'vantari',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Field siege',
    baseStats: { hull: 136, atk: 57, def: 48, spd: 26, foc: 37, res: 36 },
    growth: { hull: 12, atk: 5.3, def: 3.4, spd: 0.9, foc: 2.3, res: 2.3 },
    skills: ['vantari_tectonic', 'vantari_siegework', 'vantari_crush', 'vantari_anchor'],
    awakenedPassive: 'vantari_awk_gravity',
  },
  {
    id: 'vantari_marshal', slug: 'marshal-veyd', name: 'Marshal Veyd', race: 'vantari',
    rarity: 'epic', rosterCost: 7, damageType: 'kinetic', role: 'Anchor',
    baseStats: { hull: 161, atk: 61, def: 62, spd: 28, foc: 39, res: 48 },
    growth: { hull: 14.7, atk: 5.5, def: 4.2, spd: 1, foc: 2.3, res: 3 },
    skills: ['vantari_siegework', 'vantari_immovable', 'vantari_crush', 'vantari_pressure'],
    awakenedPassive: 'vantari_awk_hold',
  },
  {
    id: 'vantari_bastion', slug: 'the-bastion', name: 'The Bastion', race: 'vantari',
    rarity: 'epic', rosterCost: 7, damageType: 'kinetic', role: 'Punisher',
    baseStats: { hull: 178, atk: 58, def: 69, spd: 26, foc: 38, res: 54 },
    growth: { hull: 16.3, atk: 5.6, def: 5, spd: 1, foc: 2.3, res: 3.2 },
    skills: ['vantari_mass_driver', 'vantari_reflector', 'vantari_deadweight', 'vantari_siegework'],
    awakenedPassive: 'vantari_awk_return',
  },
  {
    id: 'vantari_hegemon', slug: 'hegemon-vaskal', name: 'Hegemon Vaskal', race: 'vantari',
    rarity: 'legendary', rosterCost: 12, damageType: 'kinetic', role: 'Worldbreaker',
    baseStats: { hull: 176, atk: 66, def: 62, spd: 30, foc: 45, res: 53 },
    growth: { hull: 15.4, atk: 6.1, def: 4.7, spd: 1.1, foc: 2.6, res: 3.1 },
    skills: ['vantari_worldbreaker', 'vantari_tectonic', 'vantari_mass_driver', 'vantari_crush'],
    awakenedPassive: 'vantari_awk_gravity',
  },
];
