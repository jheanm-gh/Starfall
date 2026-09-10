/* ============================================================
   Umbral Drift — §7.
   Phase-shifters: evasion, debuff, avoidance over armour. Resist psionic,
   vulnerable to thermal. They win by not being hit and by making the
   other frame worse, which makes a Null Field sector genuinely hostile
   to them — half their kit stops functioning there.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const UMBRAL_SKILLS: SkillDefinition[] = [
  {
    id: 'umbral_shiv', name: 'Phase Shiv', type: 'psionic', cooldown: 0, priority: 1,
    description: 'Lands somewhere between where they were and where they are.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'DIRECT_DAMAGE', power: 0.95 }],
  },
  {
    id: 'umbral_fade', name: 'Fade', type: 'psionic', cooldown: 2, priority: 3,
    description: 'Slips the next attack entirely.',
    effects: [{ kind: 'PRIORITY', tier: 3 }, { kind: 'DODGE_NEXT' }],
  },
  {
    id: 'umbral_static_shiv', name: 'Static Shiv', type: 'em', cooldown: 0, priority: 0,
    description: 'Base attack. A charge held in the hand until something touches it.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 0.9 }],
  },
  {
    id: 'umbral_haze', name: 'Draw the Haze', type: 'psionic', cooldown: 3, priority: 0,
    description: 'Sets Nebula Haze: evasion up, everyone’s aim degraded.',
    effects: [
      { kind: 'SET_FIELD', field: 'nebula_haze' },
      { kind: 'FIELD_IMMUNITY', duration: 4 },
    ],
  },
  {
    id: 'umbral_unmake', name: 'Unmake', type: 'psionic', cooldown: 2, priority: 0,
    description: 'Degrades their ATK and DEF together.',
    effects: [
      { kind: 'STAT_MODIFY', stat: 'atk', percent: -0.22, duration: 3 },
      { kind: 'STAT_MODIFY', stat: 'def', percent: -0.22, duration: 3 },
    ],
  },
  {
    id: 'umbral_blindfold', name: 'Blindfold', type: 'psionic', cooldown: 2, priority: 2,
    description: 'Takes their aim away and marks them.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.8 },
      { kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.5 },
    ],
  },
  {
    id: 'umbral_hollow', name: 'Hollow Out', type: 'psionic', cooldown: 3, priority: 0,
    description: 'Strips their enhancements and suppresses new ones.',
    effects: [
      { kind: 'BUFF_STRIP' },
      { kind: 'APPLY_STATUS', status: 'suppress', baseChance: 0.7 },
    ],
  },
  {
    id: 'umbral_drift_step', name: 'Drift Step', type: 'psionic', cooldown: 3, priority: 3,
    description: 'Dodges, and takes 25% of their SPD on the way past.',
    effects: [
      { kind: 'PRIORITY', tier: 3 },
      { kind: 'DODGE_NEXT' },
      { kind: 'STAT_STEAL', stat: 'spd', percent: 0.25, duration: 3 },
    ],
  },
  {
    id: 'umbral_ghostmark', name: 'Ghost Mark', type: 'psionic', cooldown: 2, priority: 0,
    description: 'Hits far harder into something already Marked.',
    effects: [{ kind: 'CONDITIONAL_DAMAGE', power: 1.15, condition: { targetHasStatus: 'mark' }, bonusMult: 1.75 }],
  },
  {
    id: 'umbral_severance', name: 'Severance', type: 'psionic', cooldown: 3, priority: 0,
    description: 'Cuts the link. Doubles below 35% HULL.',
    effects: [{ kind: 'EXECUTE', power: 1.2, threshold: 0.35, bonusMult: 2.1 }],
  },
  {
    id: 'umbral_dispersal', name: 'Dispersal', type: 'psionic', cooldown: 3, priority: 2,
    description: 'Scatters the frame: incoming damage -40% for two turns.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'DAMAGE_REDUCTION', percent: 0.4, duration: 2 }],
  },
  {
    id: 'umbral_shadowbleed', name: 'Shadowbleed', type: 'psionic', cooldown: 2, priority: 0,
    description: 'Six thin cuts from nowhere in particular.',
    effects: [{ kind: 'MULTI_HIT', power: 0.3, hits: 6 }],
  },
  {
    id: 'umbral_null_step', name: 'Null Step', type: 'psionic', cooldown: 4, priority: 1,
    description: 'Clears everything and refuses interference for three turns.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'CLEANSE_SELF' },
      { kind: 'DEBUFF_IMMUNITY', duration: 3 },
    ],
  },
  {
    id: 'umbral_static_field', name: 'Static Bloom', type: 'em', cooldown: 3, priority: 0,
    description: 'Seizes their systems and jams the heaviest one.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'static', baseChance: 0.65 },
      { kind: 'APPLY_STATUS', status: 'jam', baseChance: 0.55 },
      { kind: 'DIRECT_DAMAGE', power: 0.7 },
    ],
  },
  {
    id: 'umbral_eclipse', name: 'Eclipse', type: 'psionic', cooldown: 4, priority: 2,
    description: 'Everything at once: blind, suppress, mark, and a dodge held ready.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.85 },
      { kind: 'APPLY_STATUS', status: 'suppress', baseChance: 0.75 },
      { kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.75 },
      { kind: 'DODGE_NEXT' },
    ],
  },
  {
    id: 'umbral_nothing', name: 'Become Nothing', type: 'psionic', cooldown: 5, priority: 3,
    description: 'Two dodges, a full cleanse, and a return at full tempo.',
    effects: [
      { kind: 'PRIORITY', tier: 3 },
      { kind: 'CLEANSE_SELF' },
      { kind: 'DODGE_NEXT' },
      { kind: 'STAT_MODIFY', stat: 'spd', percent: 0.4, duration: 3, target: 'self' },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.3, duration: 3, target: 'self' },
    ],
  },

  {
    id: 'umbral_awk_untouched', name: 'Never Quite There', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Being hit prepares an immediate evasion.',
    effects: [{ kind: 'ON_TAKE_DAMAGE', chance: 0.32, effects: [{ kind: 'DODGE_NEXT' }] }],
  },
  {
    id: 'umbral_awk_erode', name: 'Erosion', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit degrades their aim.',
    effects: [{ kind: 'ON_HIT', chance: 0.32, effects: [{ kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.9 }] }],
  },
  {
    id: 'umbral_awk_drift', name: 'Drifting', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. SPD +18% and RES +14%.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'spd', percent: 0.18 },
      { kind: 'PASSIVE_AURA', stat: 'res', percent: 0.14 },
    ],
  },
  {
    id: 'umbral_awk_vanish', name: 'Vanishing Act', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill clears the board and hides the frame again.',
    effects: [{ kind: 'ON_KILL', effects: [{ kind: 'DODGE_NEXT' }, { kind: 'CLEANSE_SELF' }, { kind: 'COOLDOWN_RESET', count: 2 }] }],
  },
  {
    id: 'umbral_awk_haze', name: 'Native to the Haze', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Ignores ambient conditions and lands 16% harder.',
    effects: [
      { kind: 'FIELD_IMMUNITY', duration: 99 },
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.16 },
    ],
  },
];

export const UMBRAL_HEROES: HeroDefinition[] = [
  {
    id: 'umbral_stray', slug: 'drift-stray', name: 'Drift Stray', race: 'umbral',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Evasion',
    baseStats: { hull: 109, atk: 50, def: 35, spd: 64, foc: 50, res: 43 },
    growth: { hull: 9.4, atk: 4.8, def: 2.3, spd: 2.2, foc: 3.1, res: 3 },
    skills: ['umbral_shiv', 'umbral_fade', 'umbral_blindfold', 'umbral_shadowbleed'],
    awakenedPassive: 'umbral_awk_untouched',
  },
  {
    id: 'umbral_unmaker', slug: 'lesser-unmaker', name: 'Lesser Unmaker', race: 'umbral',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Debuffer',
    baseStats: { hull: 125, atk: 51, def: 41, spd: 64, foc: 59, res: 46 },
    growth: { hull: 10.3, atk: 4.9, def: 3.2, spd: 2.4, foc: 3.7, res: 3.2 },
    skills: ['umbral_ghostmark', 'umbral_shiv', 'umbral_blindfold', 'umbral_fade'],
    awakenedPassive: 'umbral_awk_erode',
  },
  {
    id: 'umbral_hazewalker', slug: 'haze-walker', name: 'Haze Walker', race: 'umbral',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Field control',
    baseStats: { hull: 116, atk: 55, def: 41, spd: 66, foc: 56, res: 48 },
    growth: { hull: 10, atk: 5.3, def: 2.5, spd: 2.3, foc: 3.7, res: 3.2 },
    skills: ['umbral_haze', 'umbral_shiv', 'umbral_fade', 'umbral_ghostmark'],
    awakenedPassive: 'umbral_awk_haze',
  },
  {
    id: 'umbral_cutpurse', slug: 'drift-cutpurse', name: 'Drift Cutpurse', race: 'umbral',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Tempo thief',
    baseStats: { hull: 102, atk: 51, def: 32, spd: 65, foc: 51, res: 38 },
    growth: { hull: 8.8, atk: 4.9, def: 2.2, spd: 2.2, foc: 3.2, res: 2.3 },
    skills: ['umbral_drift_step', 'umbral_shiv', 'umbral_shadowbleed', 'umbral_blindfold'],
    awakenedPassive: 'umbral_awk_drift',
  },
  {
    id: 'umbral_quiet', slug: 'the-quiet', name: 'The Quiet', race: 'umbral',
    rarity: 'common', rosterCost: 1, damageType: 'em', role: 'Disruptor',
    baseStats: { hull: 126, atk: 55, def: 41, spd: 68, foc: 64, res: 50 },
    growth: { hull: 10.7, atk: 5.3, def: 3.3, spd: 2.2, foc: 3.9, res: 3.3 },
    skills: ['umbral_static_field', 'umbral_static_shiv', 'umbral_hollow', 'umbral_fade'],
    awakenedPassive: 'umbral_awk_erode',
  },
  {
    id: 'umbral_severer', slug: 'severer', name: 'Severer Ain', race: 'umbral',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Executioner',
    baseStats: { hull: 122, atk: 63, def: 42, spd: 70, foc: 60, res: 44 },
    growth: { hull: 10.4, atk: 6, def: 3.2, spd: 2.3, foc: 3.5, res: 3 },
    skills: ['umbral_severance', 'umbral_ghostmark', 'umbral_shiv', 'umbral_fade'],
    awakenedPassive: 'umbral_awk_vanish',
  },
  {
    id: 'umbral_dispersed', slug: 'the-dispersed', name: 'The Dispersed', race: 'umbral',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Avoidance',
    baseStats: { hull: 129, atk: 52, def: 43, spd: 63, foc: 54, res: 49 },
    growth: { hull: 10.9, atk: 5, def: 3.2, spd: 2.2, foc: 3.4, res: 3.2 },
    skills: ['umbral_shiv', 'umbral_shadowbleed', 'umbral_dispersal', 'umbral_null_step'],
    awakenedPassive: 'umbral_awk_untouched',
  },
  {
    id: 'umbral_hollower', slug: 'hollower', name: 'Hollower Sev', race: 'umbral',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Buff denial',
    baseStats: { hull: 136, atk: 61, def: 46, spd: 67, foc: 64, res: 48 },
    growth: { hull: 11.5, atk: 5.7, def: 3.4, spd: 2.3, foc: 4, res: 3.4 },
    skills: ['umbral_shiv', 'umbral_unmake', 'umbral_ghostmark', 'umbral_drift_step'],
    awakenedPassive: 'umbral_awk_erode',
  },
  {
    id: 'umbral_nebulist', slug: 'nebulist', name: 'Nebulist Oro', race: 'umbral',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Field evasion',
    baseStats: { hull: 121, atk: 57, def: 44, spd: 65, foc: 57, res: 49 },
    growth: { hull: 10.2, atk: 5.3, def: 3, spd: 2, foc: 3.4, res: 3 },
    skills: ['umbral_shiv', 'umbral_shadowbleed', 'umbral_dispersal', 'umbral_blindfold'],
    awakenedPassive: 'umbral_awk_haze',
  },
  {
    id: 'umbral_eclipsed', slug: 'the-eclipsed', name: 'The Eclipsed', race: 'umbral',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Total debuff',
    baseStats: { hull: 147, atk: 73, def: 50, spd: 79, foc: 73, res: 57 },
    growth: { hull: 11.8, atk: 7.1, def: 3.5, spd: 2.6, foc: 4.5, res: 3.8 },
    skills: ['umbral_shiv', 'umbral_ghostmark', 'umbral_hollow', 'umbral_fade'],
    awakenedPassive: 'umbral_awk_erode',
  },
  {
    id: 'umbral_ghostwalk', slug: 'ghost-walk', name: 'Ghost Walk', race: 'umbral',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Untouchable',
    baseStats: { hull: 136, atk: 63, def: 46, spd: 76, foc: 63, res: 54 },
    growth: { hull: 11.4, atk: 5.9, def: 3.5, spd: 2.9, foc: 3.8, res: 3.6 },
    skills: ['umbral_drift_step', 'umbral_dispersal', 'umbral_shiv', 'umbral_shadowbleed'],
    awakenedPassive: 'umbral_awk_untouched',
  },
  {
    id: 'umbral_severance_lord', slug: 'severance-lord', name: 'Severance Lord', race: 'umbral',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Assassin',
    baseStats: { hull: 141, atk: 79, def: 48, spd: 79, foc: 68, res: 49 },
    growth: { hull: 11.5, atk: 7, def: 3.6, spd: 2.5, foc: 4.1, res: 3.2 },
    skills: ['umbral_shiv', 'umbral_ghostmark', 'umbral_blindfold', 'umbral_severance'],
    awakenedPassive: 'umbral_awk_vanish',
  },
  {
    id: 'umbral_absence', slug: 'the-absence', name: 'The Absence', race: 'umbral',
    rarity: 'epic', rosterCost: 7, damageType: 'psionic', role: 'Denial',
    baseStats: { hull: 148, atk: 81, def: 51, spd: 86, foc: 71, res: 57 },
    growth: { hull: 13.1, atk: 6.9, def: 3.6, spd: 3.1, foc: 4.2, res: 3.8 },
    skills: ['umbral_eclipse', 'umbral_shiv', 'umbral_severance', 'umbral_hollow'],
    awakenedPassive: 'umbral_awk_vanish',
  },
  {
    id: 'umbral_veilbreaker', slug: 'veil-breaker', name: 'Veil Breaker', race: 'umbral',
    rarity: 'epic', rosterCost: 7, damageType: 'psionic', role: 'Field assassin',
    baseStats: { hull: 141, atk: 81, def: 47, spd: 83, foc: 73, res: 52 },
    growth: { hull: 11.7, atk: 6.9, def: 3.1, spd: 3, foc: 4, res: 3.4 },
    skills: ['umbral_shiv', 'umbral_shadowbleed', 'umbral_severance', 'umbral_haze'],
    awakenedPassive: 'umbral_awk_haze',
  },
  {
    id: 'umbral_nameless', slug: 'the-nameless-drift', name: 'The Nameless Drift', race: 'umbral',
    rarity: 'legendary', rosterCost: 12, damageType: 'psionic', role: 'Never there',
    baseStats: { hull: 159, atk: 89, def: 55, spd: 96, foc: 85, res: 62 },
    growth: { hull: 13.5, atk: 8.3, def: 3.9, spd: 3.4, foc: 4.4, res: 4.1 },
    skills: ['umbral_shiv', 'umbral_severance', 'umbral_eclipse', 'umbral_nothing'],
    awakenedPassive: 'umbral_awk_untouched',
  },
];
