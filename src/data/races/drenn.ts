/* ============================================================
   Drenn Hullborn — §7.
   Industrial brutes: armour-pierce, recoil, self-damage. Resist kinetic,
   vulnerable to psionic. Their damage is the highest in the game and so
   is their cost of doing business — nearly every Drenn kit spends its own
   HULL, which makes healing and lifesteal load-bearing rather than
   optional.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const DRENN_SKILLS: SkillDefinition[] = [
  {
    id: 'drenn_ripper', name: 'Ripper Bar', type: 'kinetic', cooldown: 0, priority: 0,
    description: 'Industrial demolition tooling. Goes through plating.',
    effects: [{ kind: 'ARMOR_PIERCE', pierce: 0.2 }, { kind: 'DIRECT_DAMAGE', power: 1.1 }],
  },
  {
    id: 'drenn_hammerfall', name: 'Hammerfall', type: 'kinetic', cooldown: 1, priority: -1,
    description: 'Enormous swing. A quarter of what it deals comes back.',
    effects: [{ kind: 'PRIORITY', tier: -1 }, { kind: 'RECOIL', power: 1.75, recoilPercent: 0.25 }],
  },
  {
    id: 'drenn_breachbolt', name: 'Breach Bolt', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Ignores 55% of their plating outright.',
    effects: [{ kind: 'ARMOR_PIERCE', pierce: 0.55 }, { kind: 'DIRECT_DAMAGE', power: 1.35 }],
  },
  {
    id: 'drenn_bloodprice', name: 'Blood Price', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Burns 20% of its own HULL for a devastating strike.',
    effects: [{ kind: 'SELF_SACRIFICE', percentMaxHull: 0.2, power: 2.15 }],
  },
  {
    id: 'drenn_feedgrind', name: 'Feed the Grinder', type: 'kinetic', cooldown: 1, priority: 0,
    description: 'Takes 40% of the damage dealt straight back into the frame.',
    effects: [{ kind: 'LIFESTEAL', power: 1.05, leechPercent: 0.4 }],
  },
  {
    id: 'drenn_furnace', name: 'Furnace State', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Overclocked, and ATK +25% on top.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'overclock', baseChance: 1 },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.25, duration: 3, target: 'self' },
    ],
  },
  {
    id: 'drenn_scrapstorm', name: 'Scrapstorm', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Five heavy fragments through half their plating.',
    effects: [{ kind: 'ARMOR_PIERCE', pierce: 0.3 }, { kind: 'MULTI_HIT', power: 0.42, hits: 5 }],
  },
  {
    id: 'drenn_hullbite', name: 'Hull Bite', type: 'corrosive', cooldown: 2, priority: 0,
    description: 'Chews the plating open and keeps chewing.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 1.0 },
      { kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.7, stacks: 2 },
    ],
  },
  {
    id: 'drenn_setjaw', name: 'Set Jaw', type: 'kinetic', cooldown: 3, priority: 1,
    description: 'Repairs 22%, and refuses interference for two turns.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'HEAL_PERCENT', percent: 0.22 },
      { kind: 'DEBUFF_IMMUNITY', duration: 2 },
    ],
  },
  {
    id: 'drenn_workharden', name: 'Work Harden', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Bulwark and a counter stance. The Drenn version of caution.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'bulwark', baseChance: 1 },
      { kind: 'COUNTER_STANCE', percent: 0.4, duration: 3 },
    ],
  },
  {
    id: 'drenn_overdrive', name: 'Overdrive', type: 'kinetic', cooldown: 0, priority: 0,
    description: 'A grinding sequence that grows while it is maintained.',
    effects: [{ kind: 'RAMPING', power: 0.9, increment: 0.28, maxStacks: 5 }],
  },
  {
    id: 'drenn_scrapline', name: 'Scrap Line', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Finishes the job. Doubles below 40% HULL.',
    effects: [
      { kind: 'ARMOR_PIERCE', pierce: 0.35 },
      { kind: 'EXECUTE', power: 1.25, threshold: 0.4, bonusMult: 2.1 },
    ],
  },
  {
    id: 'drenn_gravity_slam', name: 'Deckplate Slam', type: 'kinetic', cooldown: 3, priority: -1,
    description: 'Sets High Gravity, which is where the Drenn prefer to work.',
    effects: [
      { kind: 'PRIORITY', tier: -1 },
      { kind: 'SET_FIELD', field: 'high_gravity' },
      { kind: 'SCALE_WITH_FIELD', power: 1.25, field: 'high_gravity', scaledPower: 1.95 },
    ],
  },
  {
    id: 'drenn_lastshift', name: 'Last Shift', type: 'kinetic', cooldown: 4, priority: -1,
    description: 'Charges one turn, then lands at two and three quarters weight.',
    effects: [
      { kind: 'PRIORITY', tier: -1 },
      { kind: 'CHARGE', multiplier: 2.75 },
      { kind: 'ARMOR_PIERCE', pierce: 0.45 },
      { kind: 'DIRECT_DAMAGE', power: 1.4 },
    ],
  },
  {
    id: 'drenn_hullborn', name: 'Hullborn', type: 'kinetic', cooldown: 5, priority: 0,
    description: 'Everything the frame has left: overclock, pierce, and recoil.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'overclock', baseChance: 1 },
      { kind: 'ARMOR_PIERCE', pierce: 0.5 },
      { kind: 'RECOIL', power: 2.3, recoilPercent: 0.3 },
    ],
  },

  {
    id: 'drenn_awk_grind', name: 'Grinding Through', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. ATK +18%, and being hit makes it worse for them.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.18 },
      { kind: 'ON_TAKE_DAMAGE', chance: 0.3, effects: [{ kind: 'STAT_MODIFY', stat: 'atk', percent: 0.14, duration: 3, target: 'self' }] },
    ],
  },
  {
    id: 'drenn_awk_feed', name: 'The Grinder Feeds', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill repairs a third of the frame and resets the tooling.',
    effects: [{ kind: 'ON_KILL', effects: [{ kind: 'HEAL_PERCENT', percent: 0.33 }, { kind: 'COOLDOWN_RESET', count: 2 }] }],
  },
  {
    id: 'drenn_awk_plate', name: 'Hullborn Plate', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. DEF +16% and a permanent light repair cycle.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'def', percent: 0.16 },
      { kind: 'REGEN', percent: 0.04, duration: 99 },
    ],
  },
  {
    id: 'drenn_awk_pierce', name: 'Nothing Holds', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit chews their plating open.',
    effects: [{ kind: 'ON_HIT', chance: 0.35, effects: [{ kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.9 }] }],
  },
  {
    id: 'drenn_awk_stand', name: 'Still Standing', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Comes back once at 35% HULL — the shift is not over.',
    effects: [{ kind: 'REVIVE_SELF', healPercent: 0.35 }],
  },
];

export const DRENN_HEROES: HeroDefinition[] = [
  {
    id: 'drenn_ripperhand', slug: 'ripper-hand', name: 'Ripper Hand', race: 'drenn',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Armour breaker',
    baseStats: { hull: 114, atk: 50, def: 36, spd: 35, foc: 34, res: 28 },
    growth: { hull: 9.6, atk: 4.8, def: 2.8, spd: 1.1, foc: 2, res: 1.7 },
    skills: ['drenn_ripper', 'drenn_hammerfall', 'drenn_setjaw', 'drenn_hullbite'],
    awakenedPassive: 'drenn_awk_pierce',
  },
  {
    id: 'drenn_grindhand', slug: 'grinder-hand', name: 'Grinder Hand', race: 'drenn',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Lifesteal bruiser',
    baseStats: { hull: 115, atk: 44, def: 36, spd: 33, foc: 31, res: 28 },
    growth: { hull: 10.1, atk: 4.2, def: 3, spd: 1.1, foc: 1.8, res: 1.6 },
    skills: ['drenn_feedgrind', 'drenn_ripper', 'drenn_setjaw', 'drenn_workharden'],
    awakenedPassive: 'drenn_awk_feed',
  },
  {
    id: 'drenn_breacher', slug: 'bolt-breacher', name: 'Bolt Breacher', race: 'drenn',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Pierce',
    baseStats: { hull: 89, atk: 44, def: 29, spd: 30, foc: 30, res: 22 },
    growth: { hull: 7.2, atk: 4.3, def: 2.2, spd: 0.9, foc: 1.9, res: 1.5 },
    skills: ['drenn_breachbolt', 'drenn_ripper', 'drenn_scrapstorm', 'drenn_setjaw'],
    awakenedPassive: 'drenn_awk_pierce',
  },
  {
    id: 'drenn_furnaceman', slug: 'furnace-hand', name: 'Furnace Hand', race: 'drenn',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Overclock',
    baseStats: { hull: 109, atk: 51, def: 35, spd: 38, foc: 35, res: 24 },
    growth: { hull: 9.4, atk: 5, def: 2.7, spd: 1.1, foc: 2, res: 1.3 },
    skills: ['drenn_furnace', 'drenn_overdrive', 'drenn_feedgrind', 'drenn_hammerfall'],
    awakenedPassive: 'drenn_awk_grind',
  },
  {
    id: 'drenn_deckhand', slug: 'deck-breaker', name: 'Deck Breaker', race: 'drenn',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Field brute',
    baseStats: { hull: 114, atk: 43, def: 36, spd: 30, foc: 30, res: 28 },
    growth: { hull: 9.7, atk: 4.2, def: 3, spd: 1, foc: 1.8, res: 1.6 },
    skills: ['drenn_gravity_slam', 'drenn_ripper', 'drenn_workharden', 'drenn_hammerfall'],
    awakenedPassive: 'drenn_awk_plate',
  },
  {
    id: 'drenn_slagjaw', slug: 'slagjaw', name: 'Slagjaw Oren', race: 'drenn',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Heavy bruiser',
    baseStats: { hull: 134, atk: 57, def: 43, spd: 35, foc: 38, res: 31 },
    growth: { hull: 11.8, atk: 5.5, def: 3.2, spd: 1.1, foc: 2.3, res: 1.9 },
    skills: ['drenn_hammerfall', 'drenn_bloodprice', 'drenn_setjaw', 'drenn_breachbolt'],
    awakenedPassive: 'drenn_awk_grind',
  },
  {
    id: 'drenn_scrapwright', slug: 'scrapwright', name: 'Scrapwright Hald', race: 'drenn',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Multi-hit pierce',
    baseStats: { hull: 104, atk: 50, def: 32, spd: 32, foc: 36, res: 25 },
    growth: { hull: 8.9, atk: 4.8, def: 2.5, spd: 1, foc: 2.2, res: 1.5 },
    skills: ['drenn_scrapstorm', 'drenn_breachbolt', 'drenn_overdrive', 'drenn_setjaw'],
    awakenedPassive: 'drenn_awk_pierce',
  },
  {
    id: 'drenn_ironjaw', slug: 'ironjaw', name: 'Ironjaw Vess', race: 'drenn',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Sustain brute',
    baseStats: { hull: 131, atk: 51, def: 41, spd: 33, foc: 35, res: 33 },
    growth: { hull: 11.7, atk: 4.8, def: 3.3, spd: 1.1, foc: 2.2, res: 2 },
    skills: ['drenn_feedgrind', 'drenn_overdrive', 'drenn_setjaw', 'drenn_hullbite'],
    awakenedPassive: 'drenn_awk_plate',
  },
  {
    id: 'drenn_bloodpriced', slug: 'blood-priced', name: 'Blood-Priced Kar', race: 'drenn',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'High risk',
    baseStats: { hull: 139, atk: 64, def: 40, spd: 38, foc: 40, res: 29 },
    growth: { hull: 11.9, atk: 6.1, def: 3.1, spd: 1.1, foc: 2.4, res: 1.8 },
    skills: ['drenn_bloodprice', 'drenn_hammerfall', 'drenn_feedgrind', 'drenn_furnace'],
    awakenedPassive: 'drenn_awk_feed',
  },
  {
    id: 'drenn_hullbreaker', slug: 'hull-breaker', name: 'Hull Breaker Sund', race: 'drenn',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Pierce specialist',
    baseStats: { hull: 116, atk: 58, def: 39, spd: 32, foc: 39, res: 29 },
    growth: { hull: 10.5, atk: 5.1, def: 2.9, spd: 0.9, foc: 2.3, res: 1.6 },
    skills: ['drenn_breachbolt', 'drenn_scrapline', 'drenn_scrapstorm', 'drenn_overdrive'],
    awakenedPassive: 'drenn_awk_pierce',
  },
  {
    id: 'drenn_furnacelord', slug: 'furnace-lord', name: 'Furnace Lord Bek', race: 'drenn',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Ramping brute',
    baseStats: { hull: 153, atk: 79, def: 47, spd: 47, foc: 50, res: 34 },
    growth: { hull: 13, atk: 7.2, def: 3.5, spd: 1.4, foc: 3, res: 2 },
    skills: ['drenn_overdrive', 'drenn_furnace', 'drenn_bloodprice', 'drenn_feedgrind'],
    awakenedPassive: 'drenn_awk_grind',
  },
  {
    id: 'drenn_anvil', slug: 'the-anvil', name: 'The Anvil', race: 'drenn',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Counter brute',
    baseStats: { hull: 142, atk: 53, def: 48, spd: 30, foc: 36, res: 34 },
    growth: { hull: 12.9, atk: 4.9, def: 3.4, spd: 1, foc: 2.3, res: 2.3 },
    skills: ['drenn_overdrive', 'drenn_gravity_slam', 'drenn_hammerfall', 'drenn_setjaw'],
    awakenedPassive: 'drenn_awk_plate',
  },
  {
    id: 'drenn_lastshiftman', slug: 'last-shift', name: 'Last Shift Dorn', race: 'drenn',
    rarity: 'epic', rosterCost: 7, damageType: 'kinetic', role: 'Charged breaker',
    baseStats: { hull: 160, atk: 81, def: 52, spd: 41, foc: 52, res: 37 },
    growth: { hull: 13.7, atk: 7.4, def: 3.6, spd: 1.1, foc: 2.9, res: 2.3 },
    skills: ['drenn_lastshift', 'drenn_breachbolt', 'drenn_scrapline', 'drenn_overdrive'],
    awakenedPassive: 'drenn_awk_stand',
  },
  {
    id: 'drenn_grinderprime', slug: 'grinder-prime', name: 'Grinder Prime', race: 'drenn',
    rarity: 'epic', rosterCost: 7, damageType: 'kinetic', role: 'Sustained brute',
    baseStats: { hull: 185, atk: 81, def: 58, spd: 44, foc: 50, res: 44 },
    growth: { hull: 15.9, atk: 7.5, def: 4.1, spd: 1.3, foc: 3, res: 2.8 },
    skills: ['drenn_overdrive', 'drenn_feedgrind', 'drenn_bloodprice', 'drenn_workharden'],
    awakenedPassive: 'drenn_awk_feed',
  },
  {
    id: 'drenn_hullbornone', slug: 'the-hullborn', name: 'The Hullborn', race: 'drenn',
    rarity: 'legendary', rosterCost: 12, damageType: 'kinetic', role: 'Total demolition',
    baseStats: { hull: 199, atk: 94, def: 64, spd: 51, foc: 59, res: 47 },
    growth: { hull: 17.4, atk: 8.4, def: 4.2, spd: 1.6, foc: 3.5, res: 2.9 },
    skills: ['drenn_hullborn', 'drenn_lastshift', 'drenn_scrapline', 'drenn_feedgrind'],
    awakenedPassive: 'drenn_awk_stand',
  },
];
