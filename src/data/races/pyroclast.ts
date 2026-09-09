/* ============================================================
   Pyroclast Clans — §7.
   Silicate thermal-vent natives: burn stacking and field synergy. Resist
   thermal, vulnerable to corrosive. They want Thermal Bloom or Solar
   Flare on the board and will set it themselves if the sector will not.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const PYROCLAST_SKILLS: SkillDefinition[] = [
  {
    id: 'pyro_vent_burst', name: 'Vent Burst', type: 'thermal', cooldown: 0, priority: 0,
    description: 'A working discharge that usually catches.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.95 },
      { kind: 'APPLY_STATUS', status: 'burn', baseChance: 0.45 },
    ],
  },
  {
    id: 'pyro_ignite', name: 'Ignition Charge', type: 'thermal', cooldown: 1, priority: 0,
    description: 'Sets both burn stacks at once.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.75 },
      { kind: 'APPLY_STATUS', status: 'burn', baseChance: 0.85, stacks: 2 },
    ],
  },
  {
    id: 'pyro_flashover', name: 'Flashover', type: 'thermal', cooldown: 3, priority: 0,
    description: 'Detonates their burn stacks for enormous thermal damage.',
    effects: [{ kind: 'CONSUME_STATUS', status: 'burn', damagePerStack: 1.5 }],
  },
  {
    id: 'pyro_bloom', name: 'Call the Bloom', type: 'thermal', cooldown: 3, priority: 0,
    description: 'Sets Thermal Bloom, where every thermal hit ignites.',
    effects: [
      { kind: 'SET_FIELD', field: 'thermal_bloom' },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.2, duration: 3, target: 'self' },
    ],
  },
  {
    id: 'pyro_flare', name: 'Flare Protocol', type: 'thermal', cooldown: 4, priority: 0,
    description: 'Sets Solar Flare: no repairs for anyone, thermal ×1.3.',
    effects: [
      { kind: 'SET_FIELD', field: 'solar_flare' },
      { kind: 'DIRECT_DAMAGE', power: 1.0 },
    ],
  },
  {
    id: 'pyro_magma_skin', name: 'Magma Skin', type: 'thermal', cooldown: 3, priority: 1,
    description: 'Returns 45% of what lands, for three turns.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'COUNTER_STANCE', percent: 0.45, duration: 3 }],
  },
  {
    id: 'pyro_slag', name: 'Slag Pour', type: 'thermal', cooldown: 2, priority: -1,
    description: 'Pours through plating. Hits far harder into something burning.',
    effects: [
      { kind: 'PRIORITY', tier: -1 },
      { kind: 'ARMOR_PIERCE', pierce: 0.35 },
      { kind: 'CONDITIONAL_DAMAGE', power: 1.35, condition: { targetHasStatus: 'burn' }, bonusMult: 1.6 },
    ],
  },
  {
    id: 'pyro_silicate', name: 'Silicate Set', type: 'thermal', cooldown: 3, priority: 1,
    description: 'Hardens the shell: Bulwark plus a shield worth 16% of HULL.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'APPLY_STATUS', status: 'bulwark', baseChance: 1 },
      { kind: 'SHIELD_PERCENT_MAX', percent: 0.16 },
    ],
  },
  {
    id: 'pyro_stoke', name: 'Stoke the Vent', type: 'thermal', cooldown: 3, priority: 0,
    description: 'Overclocked, and every burn on the field held a turn longer.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'overclock', baseChance: 1 },
      { kind: 'EXTEND_STATUS', turns: 1 },
    ],
  },
  {
    id: 'pyro_pyroclastic', name: 'Pyroclastic Flow', type: 'thermal', cooldown: 2, priority: 0,
    description: 'Five surges of superheated grit.',
    effects: [{ kind: 'MULTI_HIT', power: 0.4, hits: 5 }],
  },
  {
    id: 'pyro_thermal_lance', name: 'Thermal Lance', type: 'thermal', cooldown: 2, priority: 0,
    description: 'Scales enormously under a heat condition.',
    effects: [{ kind: 'SCALE_WITH_FIELD', power: 1.2, field: ['thermal_bloom', 'solar_flare'], scaledPower: 2.0 }],
  },
  {
    id: 'pyro_cauterise', name: 'Cauterise', type: 'thermal', cooldown: 3, priority: 1,
    description: 'Burns the wound closed: repairs 22% and clears afflictions.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'HEAL_PERCENT', percent: 0.22 },
      { kind: 'CLEANSE_SELF' },
    ],
  },
  {
    id: 'pyro_meltdown', name: 'Meltdown', type: 'thermal', cooldown: 3, priority: -1,
    description: 'Burns 20% of its own HULL to melt them.',
    effects: [{ kind: 'PRIORITY', tier: -1 }, { kind: 'SELF_SACRIFICE', percentMaxHull: 0.2, power: 2.2 }],
  },
  {
    id: 'pyro_ashfall', name: 'Ashfall', type: 'thermal', cooldown: 3, priority: 0,
    description: 'Blinds them and sets everything alight.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.7 },
      { kind: 'APPLY_STATUS', status: 'burn', baseChance: 0.8, stacks: 2 },
      { kind: 'DIRECT_DAMAGE', power: 0.7 },
    ],
  },
  {
    id: 'pyro_caldera', name: 'Caldera', type: 'thermal', cooldown: 4, priority: -2,
    description: 'Charges one turn, then empties the vent at two and a half times weight.',
    effects: [
      { kind: 'PRIORITY', tier: -2 },
      { kind: 'CHARGE', multiplier: 2.5 },
      { kind: 'SET_FIELD', field: 'thermal_bloom' },
      { kind: 'DIRECT_DAMAGE', power: 1.5 },
    ],
  },

  {
    id: 'pyro_awk_kindle', name: 'Everything Kindles', type: 'thermal', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit sets a fire.',
    effects: [{ kind: 'ON_HIT', chance: 0.4, effects: [{ kind: 'APPLY_STATUS', status: 'burn', baseChance: 0.9 }] }],
  },
  {
    id: 'pyro_awk_shell', name: 'Cooled Shell', type: 'thermal', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. DEF +16% and a permanent counter stance.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'def', percent: 0.16 },
      { kind: 'COUNTER_STANCE', percent: 0.25, duration: 99 },
    ],
  },
  {
    id: 'pyro_awk_native', name: 'Vent Native', type: 'thermal', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Ignores every ambient condition and hits 16% harder.',
    effects: [
      { kind: 'FIELD_IMMUNITY', duration: 99 },
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.16 },
    ],
  },
  {
    id: 'pyro_awk_pressure', name: 'Building Pressure', type: 'thermal', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Being hit stokes the vent hotter.',
    effects: [{ kind: 'ON_TAKE_DAMAGE', chance: 0.35, effects: [{ kind: 'STAT_MODIFY', stat: 'atk', percent: 0.12, duration: 3, target: 'self' }] }],
  },
  {
    id: 'pyro_awk_eruption', name: 'Eruption Cycle', type: 'thermal', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill resets the vent and reignites the field.',
    effects: [{ kind: 'ON_KILL', effects: [{ kind: 'COOLDOWN_RESET' }, { kind: 'SET_FIELD', field: 'thermal_bloom' }] }],
  },
];

export const PYROCLAST_HEROES: HeroDefinition[] = [
  {
    id: 'pyro_venthand', slug: 'vent-hand', name: 'Vent Hand', race: 'pyroclast',
    rarity: 'common', rosterCost: 1, damageType: 'thermal', role: 'Burn',
    baseStats: { hull: 116, atk: 44, def: 37, spd: 39, foc: 39, res: 33 },
    growth: { hull: 9.5, atk: 4.2, def: 3, spd: 1.1, foc: 2.6, res: 2.2 },
    skills: ['pyro_vent_burst', 'pyro_ignite', 'pyro_flashover', 'pyro_silicate'],
    awakenedPassive: 'pyro_awk_kindle',
  },
  {
    id: 'pyro_slagger', slug: 'slagger', name: 'Slagger', race: 'pyroclast',
    rarity: 'common', rosterCost: 1, damageType: 'thermal', role: 'Armour breaker',
    baseStats: { hull: 112, atk: 43, def: 38, spd: 33, foc: 36, res: 32 },
    growth: { hull: 9.7, atk: 4.1, def: 3.1, spd: 1, foc: 2.3, res: 2.1 },
    skills: ['pyro_vent_burst', 'pyro_slag', 'pyro_ignite', 'pyro_magma_skin'],
    awakenedPassive: 'pyro_awk_kindle',
  },
  {
    id: 'pyro_shellborn', slug: 'shell-born', name: 'Shell-Born', race: 'pyroclast',
    rarity: 'common', rosterCost: 1, damageType: 'thermal', role: 'Counter wall',
    baseStats: { hull: 120, atk: 36, def: 45, spd: 30, foc: 31, res: 34 },
    growth: { hull: 10.3, atk: 3.4, def: 3.1, spd: 1, foc: 1.8, res: 2.2 },
    skills: ['pyro_vent_burst', 'pyro_ignite', 'pyro_silicate', 'pyro_cauterise'],
    awakenedPassive: 'pyro_awk_shell',
  },
  {
    id: 'pyro_ashbearer', slug: 'ash-bearer', name: 'Ash Bearer', race: 'pyroclast',
    rarity: 'common', rosterCost: 1, damageType: 'thermal', role: 'Debuffer',
    baseStats: { hull: 106, atk: 43, def: 34, spd: 41, foc: 43, res: 31 },
    growth: { hull: 8.8, atk: 4.1, def: 2.7, spd: 1.2, foc: 2.7, res: 1.9 },
    skills: ['pyro_ashfall', 'pyro_vent_burst', 'pyro_flashover', 'pyro_ignite'],
    awakenedPassive: 'pyro_awk_kindle',
  },
  {
    id: 'pyro_stoker', slug: 'vent-stoker', name: 'Vent Stoker', race: 'pyroclast',
    rarity: 'common', rosterCost: 1, damageType: 'thermal', role: 'Field synergy',
    baseStats: { hull: 123, atk: 50, def: 39, spd: 46, foc: 46, res: 35 },
    growth: { hull: 10.1, atk: 4.8, def: 3.1, spd: 1.4, foc: 2.9, res: 2.1 },
    skills: ['pyro_bloom', 'pyro_thermal_lance', 'pyro_vent_burst', 'pyro_stoke'],
    awakenedPassive: 'pyro_awk_native',
  },
  {
    id: 'pyro_flamewright', slug: 'flamewright', name: 'Flamewright Osk', race: 'pyroclast',
    rarity: 'uncommon', rosterCost: 2, damageType: 'thermal', role: 'Burn engine',
    baseStats: { hull: 116, atk: 51, def: 40, spd: 42, foc: 48, res: 32 },
    growth: { hull: 9.8, atk: 4.8, def: 3, spd: 1.2, foc: 2.8, res: 2.1 },
    skills: ['pyro_ignite', 'pyro_flashover', 'pyro_bloom', 'pyro_slag'],
    awakenedPassive: 'pyro_awk_kindle',
  },
  {
    id: 'pyro_basalt', slug: 'basalt-guard', name: 'Basalt Guard', race: 'pyroclast',
    rarity: 'uncommon', rosterCost: 2, damageType: 'thermal', role: 'Counter tank',
    baseStats: { hull: 132, atk: 45, def: 50, spd: 33, foc: 38, res: 40 },
    growth: { hull: 11.3, atk: 4.2, def: 3.6, spd: 1, foc: 2.3, res: 2.7 },
    skills: ['pyro_vent_burst', 'pyro_silicate', 'pyro_slag', 'pyro_cauterise'],
    awakenedPassive: 'pyro_awk_shell',
  },
  {
    id: 'pyro_flarecaller', slug: 'flare-caller', name: 'Flare Caller', race: 'pyroclast',
    rarity: 'uncommon', rosterCost: 2, damageType: 'thermal', role: 'Field denial',
    baseStats: { hull: 109, atk: 52, def: 36, spd: 43, foc: 47, res: 31 },
    growth: { hull: 9.4, atk: 4.9, def: 2.7, spd: 1.2, foc: 2.7, res: 1.9 },
    skills: ['pyro_flare', 'pyro_thermal_lance', 'pyro_ashfall', 'pyro_ignite'],
    awakenedPassive: 'pyro_awk_native',
  },
  {
    id: 'pyro_meltwright', slug: 'meltwright', name: 'Meltwright Hess', race: 'pyroclast',
    rarity: 'uncommon', rosterCost: 2, damageType: 'thermal', role: 'High risk',
    baseStats: { hull: 128, atk: 56, def: 42, spd: 37, foc: 46, res: 33 },
    growth: { hull: 11.2, atk: 5.2, def: 3.2, spd: 1, foc: 2.8, res: 2.2 },
    skills: ['pyro_meltdown', 'pyro_pyroclastic', 'pyro_vent_burst', 'pyro_cauterise'],
    awakenedPassive: 'pyro_awk_pressure',
  },
  {
    id: 'pyro_vulcanite', slug: 'vulcanite', name: 'Vulcanite Sarr', race: 'pyroclast',
    rarity: 'rare', rosterCost: 4, damageType: 'thermal', role: 'Burn burst',
    baseStats: { hull: 132, atk: 64, def: 48, spd: 46, foc: 55, res: 39 },
    growth: { hull: 11.7, atk: 5.6, def: 3.4, spd: 1.5, foc: 3.3, res: 2.6 },
    skills: ['pyro_ignite', 'pyro_flashover', 'pyro_thermal_lance', 'pyro_bloom'],
    awakenedPassive: 'pyro_awk_eruption',
  },
  {
    id: 'pyro_obsidian', slug: 'obsidian-warden', name: 'Obsidian Warden', race: 'pyroclast',
    rarity: 'rare', rosterCost: 4, damageType: 'thermal', role: 'Punisher',
    baseStats: { hull: 155, atk: 54, def: 56, spd: 38, foc: 50, res: 50 },
    growth: { hull: 13.9, atk: 5.3, def: 4, spd: 1, foc: 2.8, res: 3.2 },
    skills: ['pyro_vent_burst', 'pyro_silicate', 'pyro_slag', 'pyro_flashover'],
    awakenedPassive: 'pyro_awk_shell',
  },
  {
    id: 'pyro_cinderlord', slug: 'cinder-lord', name: 'Cinder Lord Vagh', race: 'pyroclast',
    rarity: 'rare', rosterCost: 4, damageType: 'thermal', role: 'Field lord',
    baseStats: { hull: 127, atk: 60, def: 42, spd: 44, foc: 49, res: 36 },
    growth: { hull: 11, atk: 5.4, def: 3.1, spd: 1.5, foc: 3.1, res: 2.4 },
    skills: ['pyro_flare', 'pyro_vent_burst', 'pyro_thermal_lance', 'pyro_ashfall'],
    awakenedPassive: 'pyro_awk_native',
  },
  {
    id: 'pyro_caldera_king', slug: 'caldera-king', name: 'Caldera King', race: 'pyroclast',
    rarity: 'epic', rosterCost: 7, damageType: 'thermal', role: 'Charged eruption',
    baseStats: { hull: 168, atk: 78, def: 57, spd: 49, foc: 62, res: 53 },
    growth: { hull: 14.8, atk: 7.4, def: 4, spd: 1.4, foc: 3.7, res: 3.4 },
    skills: ['pyro_caldera', 'pyro_flashover', 'pyro_ignite', 'pyro_meltdown'],
    awakenedPassive: 'pyro_awk_eruption',
  },
  {
    id: 'pyro_pyrewrought', slug: 'pyre-wrought', name: 'Pyre-Wrought', race: 'pyroclast',
    rarity: 'epic', rosterCost: 7, damageType: 'thermal', role: 'Attrition burn',
    baseStats: { hull: 147, atk: 60, def: 50, spd: 37, foc: 48, res: 46 },
    growth: { hull: 12.8, atk: 5.6, def: 3.4, spd: 1.1, foc: 3.1, res: 3.1 },
    skills: ['pyro_vent_burst', 'pyro_ashfall', 'pyro_slag', 'pyro_cauterise'],
    awakenedPassive: 'pyro_awk_pressure',
  },
  {
    id: 'pyro_firstvent', slug: 'the-first-vent', name: 'The First Vent', race: 'pyroclast',
    rarity: 'legendary', rosterCost: 12, damageType: 'thermal', role: 'Total heat',
    baseStats: { hull: 172, atk: 81, def: 56, spd: 50, foc: 65, res: 53 },
    growth: { hull: 14.9, atk: 7.5, def: 4.1, spd: 1.6, foc: 3.7, res: 3.5 },
    skills: ['pyro_vent_burst', 'pyro_flare', 'pyro_flashover', 'pyro_thermal_lance'],
    awakenedPassive: 'pyro_awk_eruption',
  },
];
