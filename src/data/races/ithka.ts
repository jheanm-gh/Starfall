/* ============================================================
   Ith'ka — §7.
   Vacuum-adapted: extreme SPD, fragile frames, priority skills. Resist
   psionic, vulnerable to kinetic. Because §5.2 forbids SPD from ever
   granting a second turn, their advantage is expressed through skill
   priority tiers and dodges instead — they choose the order of a round
   rather than taking two of them.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const ITHKA_SKILLS: SkillDefinition[] = [
  {
    id: 'ithka_quill', name: 'Quill Cast', type: 'kinetic', cooldown: 0, priority: 1,
    description: 'Thrown before they finish turning. Light, but always first.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'DIRECT_DAMAGE', power: 0.9 }],
  },
  {
    id: 'ithka_flurry', name: 'Vacuum Flurry', type: 'kinetic', cooldown: 1, priority: 2,
    description: 'Five fast strikes, each rolling separately.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'MULTI_HIT', power: 0.3, hits: 5 }],
  },
  {
    id: 'ithka_void_touch', name: 'Void Touch', type: 'psionic', cooldown: 0, priority: 1,
    description: 'Base attack. Barely contact at all, and always first.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'DIRECT_DAMAGE', power: 0.85 }],
  },
  {
    id: 'ithka_slip', name: 'Slipstream', type: 'psionic', cooldown: 2, priority: 3,
    description: 'Avoids the next attack outright and comes back faster.',
    effects: [
      { kind: 'PRIORITY', tier: 3 },
      { kind: 'DODGE_NEXT' },
      { kind: 'STAT_MODIFY', stat: 'spd', percent: 0.3, duration: 2, target: 'self' },
    ],
  },
  {
    id: 'ithka_pressure_cut', name: 'Pressure Cut', type: 'kinetic', cooldown: 2, priority: 1,
    description: 'Opens a wound the vacuum keeps opening.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'DIRECT_DAMAGE', power: 1.0 },
      { kind: 'APPLY_STATUS', status: 'hemorrhage', baseChance: 0.55 },
    ],
  },
  {
    id: 'ithka_blindside', name: 'Blindside', type: 'kinetic', cooldown: 2, priority: 2,
    description: 'Comes out of their blind arc and leaves them in one.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'DIRECT_DAMAGE', power: 1.1 },
      { kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.6 },
    ],
  },
  {
    id: 'ithka_tempo_break', name: 'Tempo Break', type: 'psionic', cooldown: 3, priority: 2,
    description: 'Takes 30% of their SPD and keeps it for three turns.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'STAT_STEAL', stat: 'spd', percent: 0.3, duration: 3 }],
  },
  {
    id: 'ithka_thin_air', name: 'Thin Air', type: 'psionic', cooldown: 3, priority: 0,
    description: 'Sets Hard Vacuum, where their bleeding runs twice as fast.',
    effects: [
      { kind: 'SET_FIELD', field: 'hard_vacuum' },
      { kind: 'FIELD_IMMUNITY', duration: 4 },
    ],
  },
  {
    id: 'ithka_needle', name: 'Needle Point', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Finds the seam. Ignores half their plating.',
    effects: [{ kind: 'ARMOR_PIERCE', pierce: 0.5 }, { kind: 'DIRECT_DAMAGE', power: 1.25 }],
  },
  {
    id: 'ithka_cull', name: 'Cull', type: 'kinetic', cooldown: 3, priority: 3,
    description: 'A finisher that goes before anything they could answer with.',
    effects: [{ kind: 'PRIORITY', tier: 3 }, { kind: 'EXECUTE', power: 1.1, threshold: 0.32, bonusMult: 2.4 }],
  },
  {
    id: 'ithka_mirage', name: 'Mirage Screen', type: 'psionic', cooldown: 3, priority: 2,
    description: 'Dodges the next attack and blinds whatever threw it.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'DODGE_NEXT' },
      { kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.75 },
    ],
  },
  {
    id: 'ithka_stillness', name: 'Vacuum Stillness', type: 'psionic', cooldown: 4, priority: 1,
    description: 'Clears afflictions and refuses new ones for two turns.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'CLEANSE_SELF' },
      { kind: 'DEBUFF_IMMUNITY', duration: 2 },
    ],
  },
  {
    id: 'ithka_hollow_strike', name: 'Hollow Strike', type: 'kinetic', cooldown: 0, priority: 0,
    description: 'A grinding sequence that grows while it is maintained.',
    effects: [{ kind: 'RAMPING', power: 0.72, increment: 0.3, maxStacks: 4 }],
  },
  {
    id: 'ithka_invert', name: 'Invert Tempo', type: 'psionic', cooldown: 5, priority: 3,
    description: 'Exchanges SPD outright. Devastating against something slow.',
    effects: [{ kind: 'PRIORITY', tier: 3 }, { kind: 'SPEED_SWAP' }],
  },
  {
    id: 'ithka_second_wind', name: 'Second Wind', type: 'psionic', cooldown: 5, priority: 1,
    description: 'Acts again immediately. Rare, and it should be.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'EXTRA_ACTION' }],
  },
  {
    id: 'ithka_thousand', name: 'Thousand Cuts', type: 'kinetic', cooldown: 3, priority: 2,
    description: 'Seven strikes. Nothing survives being Marked into this.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.7 },
      { kind: 'MULTI_HIT', power: 0.26, hits: 7 },
    ],
  },

  {
    id: 'ithka_awk_tempo', name: 'Never Second', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. SPD +20%, and a kill buys another disappearance.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'spd', percent: 0.2 },
      { kind: 'ON_KILL', effects: [{ kind: 'DODGE_NEXT' }] },
    ],
  },
  {
    id: 'ithka_awk_bleed', name: 'Vacuum Wounds', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit risks opening a bleed.',
    effects: [{ kind: 'ON_HIT', chance: 0.3, effects: [{ kind: 'APPLY_STATUS', status: 'hemorrhage', baseChance: 0.8 }] }],
  },
  {
    id: 'ithka_awk_evade', name: 'Untouched', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Being hit prepares an immediate evasion.',
    effects: [{ kind: 'ON_TAKE_DAMAGE', chance: 0.28, effects: [{ kind: 'DODGE_NEXT' }] }],
  },
  {
    id: 'ithka_awk_precision', name: 'Precision Adapted', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. FOC +22% and ATK +10%.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'foc', percent: 0.22 },
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.1 },
    ],
  },
  {
    id: 'ithka_awk_vacuum', name: 'Born to Vacuum', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Immune to ambient conditions, and permanently quick.',
    effects: [
      { kind: 'FIELD_IMMUNITY', duration: 99 },
      { kind: 'PASSIVE_AURA', stat: 'spd', percent: 0.15 },
    ],
  },
];

export const ITHKA_HEROES: HeroDefinition[] = [
  {
    id: 'ithka_skiffhand', slug: 'skiff-hand', name: 'Skiff Hand', race: 'ithka',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Skirmisher',
    baseStats: { hull: 97, atk: 53, def: 30, spd: 72, foc: 51, res: 31 },
    growth: { hull: 8.3, atk: 5.1, def: 2.4, spd: 2.8, foc: 3, res: 2.4 },
    skills: ['ithka_quill', 'ithka_flurry', 'ithka_slip', 'ithka_needle'],
    awakenedPassive: 'ithka_awk_tempo',
  },
  {
    id: 'ithka_cutter', slug: 'pressure-cutter', name: 'Pressure Cutter', race: 'ithka',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Bleed',
    baseStats: { hull: 119, atk: 62, def: 35, spd: 79, foc: 55, res: 33 },
    growth: { hull: 9.7, atk: 6.1, def: 2.7, spd: 2.9, foc: 3.1, res: 2.4 },
    skills: ['ithka_pressure_cut', 'ithka_quill', 'ithka_slip', 'ithka_hollow_strike'],
    awakenedPassive: 'ithka_awk_bleed',
  },
  {
    id: 'ithka_veilwatch', slug: 'veil-watcher', name: 'Veil Watcher', race: 'ithka',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Evasion',
    baseStats: { hull: 119, atk: 61, def: 34, spd: 96, foc: 68, res: 42 },
    growth: { hull: 10.1, atk: 5.8, def: 2.8, spd: 3.5, foc: 3.8, res: 3 },
    skills: ['ithka_void_touch', 'ithka_mirage', 'ithka_slip', 'ithka_blindside'],
    awakenedPassive: 'ithka_awk_evade',
  },
  {
    id: 'ithka_darter', slug: 'void-darter', name: 'Void Darter', race: 'ithka',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Multi-hit',
    baseStats: { hull: 91, atk: 58, def: 29, spd: 74, foc: 54, res: 29 },
    growth: { hull: 6.9, atk: 5.6, def: 2.4, spd: 2.9, foc: 3.3, res: 2.2 },
    skills: ['ithka_flurry', 'ithka_quill', 'ithka_needle', 'ithka_slip'],
    awakenedPassive: 'ithka_awk_precision',
  },
  {
    id: 'ithka_breathless', slug: 'the-breathless', name: 'The Breathless', race: 'ithka',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Field control',
    baseStats: { hull: 119, atk: 60, def: 35, spd: 84, foc: 63, res: 45 },
    growth: { hull: 10, atk: 5.6, def: 2.8, spd: 3.2, foc: 3.7, res: 3 },
    skills: ['ithka_void_touch', 'ithka_thin_air', 'ithka_pressure_cut', 'ithka_stillness'],
    awakenedPassive: 'ithka_awk_vacuum',
  },
  {
    id: 'ithka_tempohand', slug: 'tempo-hand', name: 'Tempo Hand Ss-Vel', race: 'ithka',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Tempo control',
    baseStats: { hull: 114, atk: 61, def: 35, spd: 88, foc: 61, res: 37 },
    growth: { hull: 9.4, atk: 5.9, def: 2.7, spd: 3.1, foc: 3.5, res: 2.5 },
    skills: ['ithka_void_touch', 'ithka_flurry', 'ithka_slip', 'ithka_blindside'],
    awakenedPassive: 'ithka_awk_tempo',
  },
  {
    id: 'ithka_needler', slug: 'needle-adept', name: 'Needle Adept', race: 'ithka',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Armour breaker',
    baseStats: { hull: 118, atk: 68, def: 35, spd: 85, foc: 62, res: 33 },
    growth: { hull: 10, atk: 6.5, def: 2.7, spd: 2.9, foc: 3.5, res: 2.4 },
    skills: ['ithka_needle', 'ithka_hollow_strike', 'ithka_slip', 'ithka_cull'],
    awakenedPassive: 'ithka_awk_precision',
  },
  {
    id: 'ithka_mirageborn', slug: 'mirage-born', name: 'Mirage-Born', race: 'ithka',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Avoidance',
    baseStats: { hull: 117, atk: 62, def: 35, spd: 92, foc: 70, res: 44 },
    growth: { hull: 10.1, atk: 6, def: 2.6, spd: 3.3, foc: 3.9, res: 3.1 },
    skills: ['ithka_mirage', 'ithka_void_touch', 'ithka_stillness', 'ithka_flurry'],
    awakenedPassive: 'ithka_awk_evade',
  },
  {
    id: 'ithka_bleeder', slug: 'hollow-bleeder', name: 'Hollow Bleeder', race: 'ithka',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Bleed pressure',
    baseStats: { hull: 121, atk: 66, def: 37, spd: 81, foc: 61, res: 35 },
    growth: { hull: 9.7, atk: 6.2, def: 2.9, spd: 2.9, foc: 3.5, res: 2.5 },
    skills: ['ithka_pressure_cut', 'ithka_thin_air', 'ithka_hollow_strike', 'ithka_needle'],
    awakenedPassive: 'ithka_awk_bleed',
  },
  {
    id: 'ithka_firstblade', slug: 'first-blade', name: 'First Blade Asheq', race: 'ithka',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Priority assassin',
    baseStats: { hull: 121, atk: 71, def: 36, spd: 94, foc: 65, res: 36 },
    growth: { hull: 10.3, atk: 6.6, def: 2.7, spd: 3.1, foc: 3.6, res: 2.5 },
    skills: ['ithka_cull', 'ithka_thousand', 'ithka_hollow_strike', 'ithka_needle'],
    awakenedPassive: 'ithka_awk_tempo',
  },
  {
    id: 'ithka_stillwalker', slug: 'still-walker', name: 'Still Walker', race: 'ithka',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Untouchable',
    baseStats: { hull: 132, atk: 69, def: 43, spd: 94, foc: 72, res: 53 },
    growth: { hull: 10.7, atk: 6.6, def: 3.1, spd: 3.2, foc: 4.3, res: 3.2 },
    skills: ['ithka_mirage', 'ithka_void_touch', 'ithka_tempo_break', 'ithka_flurry'],
    awakenedPassive: 'ithka_awk_evade',
  },
  {
    id: 'ithka_stormcaller', slug: 'vacuum-caller', name: 'Vacuum Caller', race: 'ithka',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Field bleed',
    baseStats: { hull: 125, atk: 71, def: 36, spd: 91, foc: 68, res: 42 },
    growth: { hull: 10.5, atk: 6.7, def: 2.9, spd: 3.2, foc: 3.8, res: 3.1 },
    skills: ['ithka_void_touch', 'ithka_pressure_cut', 'ithka_thousand', 'ithka_cull'],
    awakenedPassive: 'ithka_awk_vacuum',
  },
  {
    id: 'ithka_windless', slug: 'the-windless', name: 'The Windless', race: 'ithka',
    rarity: 'epic', rosterCost: 7, damageType: 'kinetic', role: 'Blade tempo',
    baseStats: { hull: 139, atk: 88, def: 42, spd: 104, foc: 77, res: 44 },
    growth: { hull: 11.7, atk: 8, def: 3.2, spd: 3.4, foc: 4.2, res: 3.1 },
    skills: ['ithka_hollow_strike', 'ithka_thousand', 'ithka_cull', 'ithka_invert'],
    awakenedPassive: 'ithka_awk_precision',
  },
  {
    id: 'ithka_hollowsong', slug: 'hollow-song', name: 'Hollow Song', race: 'ithka',
    rarity: 'epic', rosterCost: 7, damageType: 'psionic', role: 'Denial',
    baseStats: { hull: 142, atk: 73, def: 43, spd: 96, foc: 76, res: 53 },
    growth: { hull: 12.3, atk: 6.9, def: 3.1, spd: 3.2, foc: 4.1, res: 3.3 },
    skills: ['ithka_mirage', 'ithka_void_touch', 'ithka_stillness', 'ithka_thousand'],
    awakenedPassive: 'ithka_awk_evade',
  },
  {
    id: 'ithka_unbreathing', slug: 'the-unbreathing', name: 'The Unbreathing', race: 'ithka',
    rarity: 'legendary', rosterCost: 12, damageType: 'kinetic', role: 'Second action',
    baseStats: { hull: 152, atk: 94, def: 46, spd: 117, foc: 84, res: 53 },
    growth: { hull: 12.9, atk: 8.4, def: 3.4, spd: 3.6, foc: 4.4, res: 3.2 },
    skills: ['ithka_hollow_strike', 'ithka_thousand', 'ithka_cull', 'ithka_second_wind'],
    awakenedPassive: 'ithka_awk_tempo',
  },
];
