/* ============================================================
   Kel'Shar Brood — §7.
   Eusocial arthropoids: damage over time, sacrifice, attrition. Resist
   corrosive, vulnerable to thermal. Their whole plan is to still be
   applying pressure two turns after they should have died, which makes
   them brutal in Hard Vacuum and nearly inert in a Null Field.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const KELSHAR_SKILLS: SkillDefinition[] = [
  {
    id: 'kelshar_mandible', name: 'Mandible Strike', type: 'corrosive', cooldown: 0, priority: 0,
    description: 'A working bite. Often leaves something behind.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.95 },
      { kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.4 },
    ],
  },
  {
    id: 'kelshar_spit', name: 'Digestive Spit', type: 'corrosive', cooldown: 1, priority: 0,
    description: 'Dissolves plating and keeps dissolving.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.8 },
      { kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.75, stacks: 2 },
    ],
  },
  {
    id: 'kelshar_rend', name: 'Rending Claw', type: 'corrosive', cooldown: 2, priority: 0,
    description: 'Opens a wound that ignores plating entirely.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 1.05 },
      { kind: 'APPLY_STATUS', status: 'hemorrhage', baseChance: 0.6 },
    ],
  },
  {
    id: 'kelshar_brood_swarm', name: 'Brood Swarm', type: 'corrosive', cooldown: 2, priority: 0,
    description: 'Four small bodies. Each one carries something.',
    effects: [
      { kind: 'MULTI_HIT', power: 0.38, hits: 4 },
      { kind: 'APPLY_STATUS', status: 'irradiate', baseChance: 0.35 },
    ],
  },
  {
    id: 'kelshar_moult', name: 'Moult', type: 'corrosive', cooldown: 4, priority: 1,
    description: 'Sheds the damaged shell: clears afflictions and repairs 20%.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'CLEANSE_SELF' },
      { kind: 'HEAL_PERCENT', percent: 0.2 },
    ],
  },
  {
    id: 'kelshar_transfer', name: 'Vector Transfer', type: 'corrosive', cooldown: 3, priority: 0,
    description: 'Pushes two of its own afflictions onto the target.',
    effects: [{ kind: 'TRANSFER_STATUS', count: 2 }, { kind: 'DIRECT_DAMAGE', power: 0.6 }],
  },
  {
    id: 'kelshar_hive_mind', name: 'Hive Signal', type: 'corrosive', cooldown: 3, priority: 0,
    description: 'Holds every affliction on the target two turns longer.',
    effects: [{ kind: 'EXTEND_STATUS', turns: 2 }, { kind: 'DIRECT_DAMAGE', power: 0.75 }],
  },
  {
    id: 'kelshar_consume', name: 'Consume the Weak', type: 'corrosive', cooldown: 2, priority: 0,
    description: 'Feeds on the wound. Repairs 40% of what it deals.',
    effects: [{ kind: 'LIFESTEAL', power: 1.15, leechPercent: 0.4 }],
  },
  {
    id: 'kelshar_burst', name: 'Enzyme Burst', type: 'corrosive', cooldown: 3, priority: 0,
    description: 'Detonates the corrosion already eating them.',
    effects: [{ kind: 'CONSUME_STATUS', status: 'corrode', damagePerStack: 1.15 }],
  },
  {
    id: 'kelshar_sacrifice', name: 'Brood Sacrifice', type: 'corrosive', cooldown: 3, priority: 0,
    description: 'Spends 18% of its own HULL for a devastating strike.',
    effects: [{ kind: 'SELF_SACRIFICE', percentMaxHull: 0.18, power: 2.1 }],
  },
  {
    id: 'kelshar_vacuum_seal', name: 'Vacuum Seal', type: 'corrosive', cooldown: 3, priority: 0,
    description: 'Sets Hard Vacuum, which doubles every affliction on the field.',
    effects: [
      { kind: 'SET_FIELD', field: 'hard_vacuum' },
      { kind: 'APPLY_STATUS', status: 'irradiate', baseChance: 0.6 },
    ],
  },
  {
    id: 'kelshar_carapace', name: 'Carapace Set', type: 'corrosive', cooldown: 3, priority: 0,
    description: 'Regenerates 7% per turn for three turns behind a hard shell.',
    effects: [
      { kind: 'REGEN', percent: 0.07, duration: 3 },
      { kind: 'DAMAGE_REDUCTION', percent: 0.25, duration: 3 },
    ],
  },
  {
    id: 'kelshar_paralytic', name: 'Paralytic Sting', type: 'corrosive', cooldown: 3, priority: 2,
    description: 'A fast sting that often takes their turn outright.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'DIRECT_DAMAGE', power: 0.6 },
      { kind: 'APPLY_STATUS', status: 'stun', baseChance: 0.5 },
    ],
  },
  {
    id: 'kelshar_plague', name: 'Brood Plague', type: 'corrosive', cooldown: 4, priority: 0,
    description: 'Everything at once: corrosion, bleeding and radiation.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.8, stacks: 2 },
      { kind: 'APPLY_STATUS', status: 'hemorrhage', baseChance: 0.7 },
      { kind: 'APPLY_STATUS', status: 'irradiate', baseChance: 0.7 },
    ],
  },
  {
    id: 'kelshar_devour', name: 'Devour', type: 'corrosive', cooldown: 3, priority: 0,
    description: 'Finishes a wounded frame and eats what is left.',
    effects: [
      { kind: 'EXECUTE', power: 1.25, threshold: 0.4, bonusMult: 2.2 },
      { kind: 'LIFESTEAL', power: 0.4, leechPercent: 0.6 },
    ],
  },

  {
    id: 'kelshar_awk_vector', name: 'Vector Load', type: 'corrosive', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit seeds corrosion.',
    effects: [{ kind: 'ON_HIT', chance: 0.4, effects: [{ kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.9 }] }],
  },
  {
    id: 'kelshar_awk_swarm', name: 'The Brood Replaces', type: 'corrosive', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Reboots once at 30% HULL when the body fails.',
    effects: [{ kind: 'REVIVE_SELF', healPercent: 0.3 }],
  },
  {
    id: 'kelshar_awk_feed', name: 'Feeding Frenzy', type: 'corrosive', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. ATK +15%, and a kill repairs a third of the frame.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.15 },
      { kind: 'ON_KILL', effects: [{ kind: 'HEAL_PERCENT', percent: 0.33 }] },
    ],
  },
  {
    id: 'kelshar_awk_endure', name: 'Attrition Is Patience', type: 'corrosive', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. RES +18% and a permanent slow repair cycle.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'res', percent: 0.18 },
      { kind: 'REGEN', percent: 0.04, duration: 99 },
    ],
  },
  {
    id: 'kelshar_awk_contagion', name: 'Contagion', type: 'corrosive', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Being hit vents an affliction back onto the attacker.',
    effects: [{ kind: 'ON_TAKE_DAMAGE', chance: 0.35, effects: [{ kind: 'TRANSFER_STATUS', count: 1 }] }],
  },
];

export const KELSHAR_HEROES: HeroDefinition[] = [
  {
    id: 'kelshar_worker', slug: 'brood-worker', name: 'Brood Worker', race: 'kelshar',
    rarity: 'common', rosterCost: 1, damageType: 'corrosive', role: 'Damage over time',
    baseStats: { hull: 119, atk: 48, def: 39, spd: 48, foc: 46, res: 36 },
    growth: { hull: 10.6, atk: 4.6, def: 3.1, spd: 1.5, foc: 3, res: 2.2 },
    skills: ['kelshar_mandible', 'kelshar_spit', 'kelshar_moult', 'kelshar_burst'],
    awakenedPassive: 'kelshar_awk_vector',
  },
  {
    id: 'kelshar_drone', slug: 'brood-drone', name: 'Brood Drone', race: 'kelshar',
    rarity: 'common', rosterCost: 1, damageType: 'corrosive', role: 'Swarm',
    baseStats: { hull: 115, atk: 53, def: 35, spd: 55, foc: 49, res: 29 },
    growth: { hull: 9.2, atk: 5.1, def: 2.5, spd: 1.8, foc: 2.7, res: 2 },
    skills: ['kelshar_brood_swarm', 'kelshar_mandible', 'kelshar_spit', 'kelshar_sacrifice'],
    awakenedPassive: 'kelshar_awk_swarm',
  },
  {
    id: 'kelshar_render', slug: 'render', name: 'Render', race: 'kelshar',
    rarity: 'common', rosterCost: 1, damageType: 'corrosive', role: 'Bleed',
    baseStats: { hull: 112, atk: 50, def: 35, spd: 46, foc: 40, res: 29 },
    growth: { hull: 9.8, atk: 4.8, def: 2.7, spd: 1.5, foc: 2.5, res: 1.9 },
    skills: ['kelshar_rend', 'kelshar_mandible', 'kelshar_consume', 'kelshar_hive_mind'],
    awakenedPassive: 'kelshar_awk_feed',
  },
  {
    id: 'kelshar_tender', slug: 'hive-tender', name: 'Hive Tender', race: 'kelshar',
    rarity: 'common', rosterCost: 1, damageType: 'corrosive', role: 'Sustain',
    baseStats: { hull: 131, atk: 43, def: 45, spd: 43, foc: 40, res: 40 },
    growth: { hull: 11.3, atk: 4, def: 3.4, spd: 1.4, foc: 2.4, res: 2.6 },
    skills: ['kelshar_mandible', 'kelshar_carapace', 'kelshar_moult', 'kelshar_consume'],
    awakenedPassive: 'kelshar_awk_endure',
  },
  {
    id: 'kelshar_stinger', slug: 'paralytic-stinger', name: 'Paralytic Stinger', race: 'kelshar',
    rarity: 'common', rosterCost: 1, damageType: 'corrosive', role: 'Disruptor',
    baseStats: { hull: 129, atk: 52, def: 37, spd: 67, foc: 57, res: 33 },
    growth: { hull: 10.3, atk: 5, def: 2.8, spd: 2.3, foc: 3.3, res: 2.3 },
    skills: ['kelshar_paralytic', 'kelshar_mandible', 'kelshar_spit', 'kelshar_transfer'],
    awakenedPassive: 'kelshar_awk_vector',
  },
  {
    id: 'kelshar_carver', slug: 'chitin-carver', name: 'Chitin Carver', race: 'kelshar',
    rarity: 'uncommon', rosterCost: 2, damageType: 'corrosive', role: 'Armour breaker',
    baseStats: { hull: 130, atk: 58, def: 43, spd: 49, foc: 49, res: 35 },
    growth: { hull: 11.4, atk: 5.4, def: 3.2, spd: 1.8, foc: 3, res: 2.3 },
    skills: ['kelshar_spit', 'kelshar_mandible', 'kelshar_rend', 'kelshar_moult'],
    awakenedPassive: 'kelshar_awk_vector',
  },
  {
    id: 'kelshar_vector', slug: 'vector-carrier', name: 'Vector Carrier', race: 'kelshar',
    rarity: 'uncommon', rosterCost: 2, damageType: 'corrosive', role: 'Affliction control',
    baseStats: { hull: 144, atk: 55, def: 49, spd: 49, foc: 57, res: 41 },
    growth: { hull: 13, atk: 5.3, def: 3.5, spd: 1.6, foc: 3.4, res: 2.8 },
    skills: ['kelshar_mandible', 'kelshar_hive_mind', 'kelshar_spit', 'kelshar_carapace'],
    awakenedPassive: 'kelshar_awk_contagion',
  },
  {
    id: 'kelshar_vacuumborn', slug: 'vacuum-born', name: 'Vacuum-Born', race: 'kelshar',
    rarity: 'uncommon', rosterCost: 2, damageType: 'corrosive', role: 'Field synergy',
    baseStats: { hull: 126, atk: 54, def: 39, spd: 50, foc: 50, res: 35 },
    growth: { hull: 11.1, atk: 5.2, def: 3, spd: 1.7, foc: 3.2, res: 2.5 },
    skills: ['kelshar_mandible', 'kelshar_brood_swarm', 'kelshar_rend', 'kelshar_vacuum_seal'],
    awakenedPassive: 'kelshar_awk_endure',
  },
  {
    id: 'kelshar_devourer', slug: 'young-devourer', name: 'Young Devourer', race: 'kelshar',
    rarity: 'uncommon', rosterCost: 2, damageType: 'corrosive', role: 'Executioner',
    baseStats: { hull: 134, atk: 61, def: 41, spd: 51, foc: 50, res: 34 },
    growth: { hull: 11.4, atk: 5.6, def: 3, spd: 1.7, foc: 2.8, res: 2.2 },
    skills: ['kelshar_consume', 'kelshar_mandible', 'kelshar_rend', 'kelshar_sacrifice'],
    awakenedPassive: 'kelshar_awk_feed',
  },
  {
    id: 'kelshar_plaguebearer', slug: 'plaguebearer', name: 'Plaguebearer Yss', race: 'kelshar',
    rarity: 'rare', rosterCost: 4, damageType: 'corrosive', role: 'Affliction stack',
    baseStats: { hull: 156, atk: 73, def: 53, spd: 60, foc: 67, res: 49 },
    growth: { hull: 13.4, atk: 6.7, def: 3.7, spd: 2, foc: 3.9, res: 3 },
    skills: ['kelshar_mandible', 'kelshar_burst', 'kelshar_hive_mind', 'kelshar_vacuum_seal'],
    awakenedPassive: 'kelshar_awk_vector',
  },
  {
    id: 'kelshar_broodmother', slug: 'lesser-broodmother', name: 'Lesser Broodmother', race: 'kelshar',
    rarity: 'rare', rosterCost: 4, damageType: 'corrosive', role: 'Attrition anchor',
    baseStats: { hull: 158, atk: 56, def: 55, spd: 45, foc: 53, res: 51 },
    growth: { hull: 13.9, atk: 5.3, def: 3.7, spd: 1.5, foc: 2.9, res: 3.1 },
    skills: ['kelshar_carapace', 'kelshar_brood_swarm', 'kelshar_mandible', 'kelshar_transfer'],
    awakenedPassive: 'kelshar_awk_swarm',
  },
  {
    id: 'kelshar_reaper', slug: 'chitin-reaper', name: 'Chitin Reaper', race: 'kelshar',
    rarity: 'rare', rosterCost: 4, damageType: 'corrosive', role: 'Assassin',
    baseStats: { hull: 144, atk: 76, def: 45, spd: 67, foc: 63, res: 40 },
    growth: { hull: 11.7, atk: 7.1, def: 3.3, spd: 2.4, foc: 3.6, res: 2.7 },
    skills: ['kelshar_mandible', 'kelshar_paralytic', 'kelshar_rend', 'kelshar_sacrifice'],
    awakenedPassive: 'kelshar_awk_feed',
  },
  {
    id: 'kelshar_prime', slug: 'brood-prime', name: 'Brood Prime Ithex', race: 'kelshar',
    rarity: 'epic', rosterCost: 7, damageType: 'corrosive', role: 'Plague engine',
    baseStats: { hull: 157, atk: 71, def: 52, spd: 55, foc: 63, res: 48 },
    growth: { hull: 13.7, atk: 6.5, def: 3.7, spd: 1.9, foc: 3.5, res: 3.1 },
    skills: ['kelshar_mandible', 'kelshar_burst', 'kelshar_devour', 'kelshar_plague'],
    awakenedPassive: 'kelshar_awk_contagion',
  },
  {
    id: 'kelshar_hollow', slug: 'the-hollow-queen', name: 'The Hollow Queen', race: 'kelshar',
    rarity: 'epic', rosterCost: 7, damageType: 'corrosive', role: 'Undying',
    baseStats: { hull: 177, atk: 66, def: 57, spd: 49, foc: 60, res: 57 },
    growth: { hull: 15.4, atk: 6.2, def: 4.1, spd: 1.5, foc: 3.3, res: 3.5 },
    skills: ['kelshar_carapace', 'kelshar_consume', 'kelshar_mandible', 'kelshar_moult'],
    awakenedPassive: 'kelshar_awk_swarm',
  },
  {
    id: 'kelshar_ninth', slug: 'the-ninth-instar', name: 'The Ninth Instar', race: 'kelshar',
    rarity: 'legendary', rosterCost: 12, damageType: 'corrosive', role: 'Total attrition',
    baseStats: { hull: 179, atk: 77, def: 56, spd: 59, foc: 66, res: 54 },
    growth: { hull: 15.4, atk: 7.3, def: 4.2, spd: 2, foc: 3.7, res: 3.2 },
    skills: ['kelshar_mandible', 'kelshar_devour', 'kelshar_burst', 'kelshar_plague'],
    awakenedPassive: 'kelshar_awk_endure',
  },
];
