/* ============================================================
   The Signal — §7.
   A psionic collective: control, turn manipulation, confusion. Resist EM,
   vulnerable to kinetic. They are the only race whose kits routinely take
   a turn away from the other frame, which is the strongest effect in a
   1v1 and is priced accordingly in cooldowns and application chances.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const SIGNAL_SKILLS: SkillDefinition[] = [
  {
    id: 'signal_whisper', name: 'Whisper', type: 'psionic', cooldown: 0, priority: 0,
    description: 'A thought that was not theirs, delivered hard.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 1.0 }],
  },
  {
    id: 'signal_carrier_wave', name: 'Carrier Wave', type: 'em', cooldown: 0, priority: 0,
    description: 'Base attack. The collective, transmitting at volume.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 0.95 }],
  },
  {
    id: 'signal_seize', name: 'Seize', type: 'psionic', cooldown: 3, priority: 2,
    description: 'Takes their next turn outright, about half the time.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'DIRECT_DAMAGE', power: 0.6 },
      { kind: 'APPLY_STATUS', status: 'stun', baseChance: 0.55 },
    ],
  },
  {
    id: 'signal_interference', name: 'Interference', type: 'em', cooldown: 2, priority: 1,
    description: 'Static across their whole command band.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'APPLY_STATUS', status: 'static', baseChance: 0.7 },
      { kind: 'DIRECT_DAMAGE', power: 0.75 },
    ],
  },
  {
    id: 'signal_dissonance', name: 'Dissonance', type: 'psionic', cooldown: 2, priority: 0,
    description: 'Degrades their focus and takes it for itself.',
    effects: [{ kind: 'STAT_STEAL', stat: 'foc', percent: 0.3, duration: 3 }, { kind: 'DIRECT_DAMAGE', power: 0.75 }],
  },
  {
    id: 'signal_lockstep', name: 'Lockstep', type: 'psionic', cooldown: 3, priority: 2,
    description: 'Slows them 35% and jams their heaviest system.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'DELAY_TARGET', percent: 0.35, duration: 3 },
      { kind: 'APPLY_STATUS', status: 'jam', baseChance: 0.6 },
    ],
  },
  {
    id: 'signal_chorus', name: 'Chorus', type: 'psionic', cooldown: 2, priority: 0,
    description: 'Five overlapping voices.',
    effects: [{ kind: 'MULTI_HIT', power: 0.36, hits: 5 }],
  },
  {
    id: 'signal_silence', name: 'Silence', type: 'psionic', cooldown: 3, priority: 1,
    description: 'They cannot be reinforced for three turns, and lose what they had.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'APPLY_STATUS', status: 'suppress', baseChance: 0.8 },
      { kind: 'BUFF_STRIP' },
    ],
  },
  {
    id: 'signal_inversion', name: 'Inversion', type: 'psionic', cooldown: 5, priority: 3,
    description: 'Exchanges SPD outright.',
    effects: [{ kind: 'PRIORITY', tier: 3 }, { kind: 'SPEED_SWAP' }],
  },
  {
    id: 'signal_shared_pain', name: 'Shared Pain', type: 'psionic', cooldown: 3, priority: 0,
    description: 'Reflects 50% of incoming damage for three turns.',
    effects: [{ kind: 'REFLECT', percent: 0.5, duration: 3 }],
  },
  {
    id: 'signal_calm', name: 'Imposed Calm', type: 'psionic', cooldown: 4, priority: 1,
    description: 'Clears afflictions, repairs 18%, and refuses interference.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'CLEANSE_SELF' },
      { kind: 'HEAL_PERCENT', percent: 0.18 },
      { kind: 'DEBUFF_IMMUNITY', duration: 2 },
    ],
  },
  {
    id: 'signal_ion_call', name: 'Call the Storm', type: 'em', cooldown: 3, priority: 0,
    description: 'Sets Ion Storm, where EM lands 25% harder and nobody aims well.',
    effects: [
      { kind: 'SET_FIELD', field: 'ion_storm' },
      { kind: 'SCALE_WITH_FIELD', power: 1.0, field: 'ion_storm', scaledPower: 1.75 },
    ],
  },
  {
    id: 'signal_null_call', name: 'Impose the Hush', type: 'psionic', cooldown: 4, priority: 1,
    description: 'Sets a Null Field. Nothing can be applied by anyone, including them.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'SET_FIELD', field: 'null_field' }, { kind: 'DIRECT_DAMAGE', power: 1.1 }],
  },
  {
    id: 'signal_recursion', name: 'Recursion', type: 'psionic', cooldown: 5, priority: 1,
    description: 'Acts again immediately.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'EXTRA_ACTION' }],
  },
  {
    id: 'signal_unmind', name: 'Unmind', type: 'psionic', cooldown: 3, priority: 0,
    description: 'Devastating against something already seized or jammed.',
    effects: [{ kind: 'CONDITIONAL_DAMAGE', power: 1.2, condition: { targetHasStatus: 'static' }, bonusMult: 1.9 }],
  },
  {
    id: 'signal_collective', name: 'The Collective Speaks', type: 'psionic', cooldown: 4, priority: 2,
    description: 'Stun, suppress and slow, in one transmission.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'APPLY_STATUS', status: 'stun', baseChance: 0.45 },
      { kind: 'APPLY_STATUS', status: 'suppress', baseChance: 0.7 },
      { kind: 'DELAY_TARGET', percent: 0.3, duration: 3 },
    ],
  },

  {
    id: 'signal_awk_seize', name: 'Standing Order', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit risks seizing their systems.',
    effects: [{ kind: 'ON_HIT', chance: 0.3, effects: [{ kind: 'APPLY_STATUS', status: 'static', baseChance: 0.85 }] }],
  },
  {
    id: 'signal_awk_share', name: 'Shared Burden', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Permanently reflects 25% of incoming damage.',
    effects: [{ kind: 'REFLECT', percent: 0.25, duration: 99 }],
  },
  {
    id: 'signal_awk_focus', name: 'Coherent Signal', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. FOC +24% — every control effect lands more often.',
    effects: [{ kind: 'PASSIVE_AURA', stat: 'foc', percent: 0.24 }],
  },
  {
    id: 'signal_awk_relay', name: 'Relay', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill clears every cooldown and restores the frame.',
    effects: [{ kind: 'ON_KILL', effects: [{ kind: 'COOLDOWN_RESET' }, { kind: 'HEAL_PERCENT', percent: 0.22 }] }],
  },
  {
    id: 'signal_awk_still', name: 'Unmoved Mind', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. RES +25%, and being hit sharpens the transmission.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'res', percent: 0.25 },
      { kind: 'ON_TAKE_DAMAGE', chance: 0.3, effects: [{ kind: 'STAT_MODIFY', stat: 'foc', percent: 0.15, duration: 3, target: 'self' }] },
    ],
  },
];

export const SIGNAL_HEROES: HeroDefinition[] = [
  {
    id: 'signal_voice', slug: 'lesser-voice', name: 'Lesser Voice', race: 'signal',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Controller',
    baseStats: { hull: 131, atk: 56, def: 42, spd: 60, foc: 61, res: 48 },
    growth: { hull: 11.2, atk: 5.1, def: 3.2, spd: 2.3, foc: 3.7, res: 3.2 },
    skills: ['signal_whisper', 'signal_interference', 'signal_dissonance', 'signal_seize'],
    awakenedPassive: 'signal_awk_seize',
  },
  {
    id: 'signal_static', slug: 'static-choir', name: 'Static Choir', race: 'signal',
    rarity: 'common', rosterCost: 1, damageType: 'em', role: 'Disruptor',
    baseStats: { hull: 105, atk: 46, def: 32, spd: 51, foc: 53, res: 37 },
    growth: { hull: 8.5, atk: 4.5, def: 2.5, spd: 2, foc: 3, res: 2.5 },
    skills: ['signal_interference', 'signal_unmind', 'signal_carrier_wave', 'signal_ion_call'],
    awakenedPassive: 'signal_awk_seize',
  },
  {
    id: 'signal_echo', slug: 'echo-node', name: 'Echo Node', race: 'signal',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Reflector',
    baseStats: { hull: 120, atk: 43, def: 40, spd: 49, foc: 50, res: 48 },
    growth: { hull: 11, atk: 4, def: 3.2, spd: 1.8, foc: 3, res: 3 },
    skills: ['signal_whisper', 'signal_shared_pain', 'signal_calm', 'signal_chorus'],
    awakenedPassive: 'signal_awk_share',
  },
  {
    id: 'signal_chorister', slug: 'chorister', name: 'Chorister', race: 'signal',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Multi-hit',
    baseStats: { hull: 109, atk: 54, def: 34, spd: 56, foc: 54, res: 38 },
    growth: { hull: 8.8, atk: 5.2, def: 2.7, spd: 2.2, foc: 3, res: 2.5 },
    skills: ['signal_chorus', 'signal_whisper', 'signal_dissonance', 'signal_lockstep'],
    awakenedPassive: 'signal_awk_focus',
  },
  {
    id: 'signal_hushbearer', slug: 'hush-bearer', name: 'Hush Bearer', race: 'signal',
    rarity: 'common', rosterCost: 1, damageType: 'psionic', role: 'Field denial',
    baseStats: { hull: 124, atk: 52, def: 40, spd: 55, foc: 57, res: 52 },
    growth: { hull: 10.4, atk: 4.8, def: 3.1, spd: 2, foc: 3.3, res: 3.3 },
    skills: ['signal_null_call', 'signal_whisper', 'signal_silence', 'signal_calm'],
    awakenedPassive: 'signal_awk_still',
  },
  {
    id: 'signal_lockwarden', slug: 'lock-warden', name: 'Lock Warden', race: 'signal',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Tempo control',
    baseStats: { hull: 125, atk: 54, def: 41, spd: 58, foc: 60, res: 48 },
    growth: { hull: 11.3, atk: 5.2, def: 3, spd: 2.1, foc: 3.4, res: 3 },
    skills: ['signal_whisper', 'signal_seize', 'signal_chorus', 'signal_dissonance'],
    awakenedPassive: 'signal_awk_focus',
  },
  {
    id: 'signal_silencer', slug: 'silencer', name: 'Silencer Ohm', race: 'signal',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Buff denial',
    baseStats: { hull: 145, atk: 68, def: 46, spd: 68, foc: 72, res: 57 },
    growth: { hull: 13.2, atk: 6.3, def: 3.5, spd: 2.5, foc: 3.9, res: 3.5 },
    skills: ['signal_silence', 'signal_whisper', 'signal_dissonance', 'signal_calm'],
    awakenedPassive: 'signal_awk_focus',
  },
  {
    id: 'signal_stormcall', slug: 'storm-caller', name: 'Storm Caller', race: 'signal',
    rarity: 'uncommon', rosterCost: 2, damageType: 'em', role: 'Field synergy',
    baseStats: { hull: 116, atk: 56, def: 38, spd: 55, foc: 56, res: 39 },
    growth: { hull: 9.5, atk: 5.3, def: 2.9, spd: 2.1, foc: 3.3, res: 2.7 },
    skills: ['signal_carrier_wave', 'signal_interference', 'signal_unmind', 'signal_chorus'],
    awakenedPassive: 'signal_awk_seize',
  },
  {
    id: 'signal_burden', slug: 'burden-bearer', name: 'Burden Bearer', race: 'signal',
    rarity: 'uncommon', rosterCost: 2, damageType: 'psionic', role: 'Punisher',
    baseStats: { hull: 141, atk: 51, def: 49, spd: 51, foc: 54, res: 53 },
    growth: { hull: 12, atk: 4.9, def: 3.6, spd: 1.9, foc: 3.3, res: 3.3 },
    skills: ['signal_shared_pain', 'signal_chorus', 'signal_whisper', 'signal_lockstep'],
    awakenedPassive: 'signal_awk_share',
  },
  {
    id: 'signal_seizer', slug: 'the-seizer', name: 'The Seizer', race: 'signal',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Turn denial',
    baseStats: { hull: 151, atk: 70, def: 52, spd: 72, foc: 78, res: 55 },
    growth: { hull: 13.5, atk: 6.6, def: 3.4, spd: 2.6, foc: 4.1, res: 3.4 },
    skills: ['signal_seize', 'signal_whisper', 'signal_unmind', 'signal_lockstep'],
    awakenedPassive: 'signal_awk_seize',
  },
  {
    id: 'signal_inverter', slug: 'the-inverter', name: 'The Inverter', race: 'signal',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Tempo swap',
    baseStats: { hull: 146, atk: 66, def: 50, spd: 66, foc: 69, res: 56 },
    growth: { hull: 12.3, atk: 6.2, def: 3.6, spd: 2.3, foc: 3.8, res: 3.6 },
    skills: ['signal_whisper', 'signal_chorus', 'signal_silence', 'signal_inversion'],
    awakenedPassive: 'signal_awk_focus',
  },
  {
    id: 'signal_hush', slug: 'the-long-hush', name: 'The Long Hush', race: 'signal',
    rarity: 'rare', rosterCost: 4, damageType: 'psionic', role: 'Null control',
    baseStats: { hull: 159, atk: 65, def: 56, spd: 63, foc: 69, res: 63 },
    growth: { hull: 14.4, atk: 6.1, def: 4, spd: 2.3, foc: 4, res: 4 },
    skills: ['signal_whisper', 'signal_silence', 'signal_shared_pain', 'signal_null_call'],
    awakenedPassive: 'signal_awk_still',
  },
  {
    id: 'signal_conductor', slug: 'the-conductor', name: 'The Conductor', race: 'signal',
    rarity: 'epic', rosterCost: 7, damageType: 'psionic', role: 'Total control',
    baseStats: { hull: 177, atk: 86, def: 63, spd: 84, foc: 93, res: 68 },
    growth: { hull: 16.3, atk: 7.9, def: 4.3, spd: 2.8, foc: 4.8, res: 4.1 },
    skills: ['signal_collective', 'signal_seize', 'signal_whisper', 'signal_silence'],
    awakenedPassive: 'signal_awk_relay',
  },
  {
    id: 'signal_unheard', slug: 'the-unheard', name: 'The Unheard', race: 'signal',
    rarity: 'epic', rosterCost: 7, damageType: 'psionic', role: 'Reflect anchor',
    baseStats: { hull: 198, atk: 75, def: 69, spd: 71, foc: 79, res: 75 },
    growth: { hull: 16.6, atk: 7.1, def: 4.7, spd: 2.5, foc: 4.5, res: 4.5 },
    skills: ['signal_shared_pain', 'signal_null_call', 'signal_whisper', 'signal_collective'],
    awakenedPassive: 'signal_awk_share',
  },
  {
    id: 'signal_first', slug: 'the-first-signal', name: 'The First Signal', race: 'signal',
    rarity: 'legendary', rosterCost: 12, damageType: 'psionic', role: 'Recursion',
    baseStats: { hull: 202, atk: 96, def: 69, spd: 92, foc: 96, res: 71 },
    growth: { hull: 17.2, atk: 8.5, def: 4.8, spd: 3.1, foc: 5.3, res: 4.6 },
    skills: ['signal_whisper', 'signal_seize', 'signal_collective', 'signal_recursion'],
    awakenedPassive: 'signal_awk_relay',
  },
];
