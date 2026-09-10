/* ============================================================
   Meridian Combine — §7.
   Mercantile: scales with Scrip, runes and gear. Resist nothing,
   vulnerable to psionic.

   Note on the identity: the combat engine is pure and knows nothing about
   the run's wallet by design (§0.1), so "scales with capital" is expressed
   IN THE ENGINE as the charge resource — a per-combat bank the Combine
   builds and spends — and OUT OF COMBAT by kits that reward the socket
   and buff density gear and runes provide. No hero reads the Scrip
   balance directly; that would put run state inside the engine.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const MERIDIAN_SKILLS: SkillDefinition[] = [
  {
    id: 'meridian_sidearm', name: 'Contract Sidearm', type: 'kinetic', cooldown: 0, priority: 0,
    description: 'Company issue. Unremarkable, and it banks a little on the way out.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 0.95 }, { kind: 'GAIN_CHARGE', amount: 1 }],
  },
  {
    id: 'meridian_levy', name: 'Levy', type: 'kinetic', cooldown: 1, priority: 0,
    description: 'Takes payment in plating and banks two charge.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.85 },
      { kind: 'STAT_STEAL', stat: 'def', percent: 0.15, duration: 3 },
      { kind: 'GAIN_CHARGE', amount: 2 },
    ],
  },
  {
    id: 'meridian_ledger_bolt', name: 'Ledger Bolt', type: 'em', cooldown: 0, priority: 0,
    description: 'Base attack. Small, itemised, and banked against the next invoice.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 0.9 }, { kind: 'GAIN_CHARGE', amount: 1 }],
  },
  {
    id: 'meridian_liquidate', name: 'Liquidate', type: 'kinetic', cooldown: 1, priority: 0,
    description: 'Spends the whole bank at once. Half the power is free.',
    effects: [{ kind: 'SPEND_CHARGE', amount: 5, power: 2.6 }],
  },
  {
    id: 'meridian_hedge', name: 'Hedge Position', type: 'kinetic', cooldown: 3, priority: 2,
    description: 'A shield worth 20% of maximum HULL, and three charge banked.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'SHIELD_PERCENT_MAX', percent: 0.2 },
      { kind: 'GAIN_CHARGE', amount: 3 },
    ],
  },
  {
    id: 'meridian_audit', name: 'Audit', type: 'em', cooldown: 3, priority: 1,
    description: 'Strips their enhancements and writes them into its own column.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'BUFF_STRIP', count: 3 },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.22, duration: 3, target: 'self' },
    ],
  },
  {
    id: 'meridian_insured', name: 'Fully Insured', type: 'kinetic', cooldown: 4, priority: 1,
    description: 'Repairs 26% of maximum HULL and clears one affliction.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'HEAL_PERCENT', percent: 0.26 },
      { kind: 'CLEANSE_SELF', count: 1 },
    ],
  },
  {
    id: 'meridian_margin', name: 'Margin Call', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Devastating once the bank is full.',
    effects: [{ kind: 'CONDITIONAL_DAMAGE', power: 1.2, condition: { chargeAtLeast: 5 }, bonusMult: 1.85 }],
  },
  {
    id: 'meridian_escort', name: 'Escort Contract', type: 'kinetic', cooldown: 3, priority: 2,
    description: 'Incoming damage -32% and 35% returned, for three turns.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'DAMAGE_REDUCTION', percent: 0.32, duration: 3 },
      { kind: 'COUNTER_STANCE', percent: 0.35, duration: 3 },
    ],
  },
  {
    id: 'meridian_tariff', name: 'Tariff', type: 'em', cooldown: 2, priority: 0,
    description: 'Marks the target for collection: everything hits them 20% harder.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.85 },
      { kind: 'DIRECT_DAMAGE', power: 0.85 },
      { kind: 'GAIN_CHARGE', amount: 1 },
    ],
  },
  {
    id: 'meridian_foreclose', name: 'Foreclose', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Takes the remainder. Doubles below 38% HULL.',
    effects: [{ kind: 'EXECUTE', power: 1.25, threshold: 0.38, bonusMult: 2.0 }],
  },
  {
    id: 'meridian_arbitrage', name: 'Arbitrage', type: 'em', cooldown: 4, priority: 1,
    description: 'Clears every cooldown and fills the bank.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'COOLDOWN_RESET' },
      { kind: 'GAIN_CHARGE', amount: 4 },
    ],
  },
  {
    id: 'meridian_embargo', name: 'Embargo', type: 'em', cooldown: 3, priority: 1,
    description: 'They cannot be reinforced for three turns.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'APPLY_STATUS', status: 'suppress', baseChance: 0.7 },
      { kind: 'APPLY_STATUS', status: 'jam', baseChance: 0.5 },
    ],
  },
  {
    id: 'meridian_bulk_order', name: 'Bulk Order', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Four contracted strikes.',
    effects: [{ kind: 'MULTI_HIT', power: 0.44, hits: 4 }],
  },
  {
    id: 'meridian_leverage', name: 'Leverage', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Borrows against the frame: 15% HULL for an enormous strike.',
    effects: [{ kind: 'SELF_SACRIFICE', percentMaxHull: 0.15, power: 2.0 }],
  },
  {
    id: 'meridian_monopoly', name: 'Monopoly', type: 'em', cooldown: 5, priority: 2,
    description: 'ATK, DEF and FOC +25% for four turns, and the bank filled.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.25, duration: 4, target: 'self' },
      { kind: 'STAT_MODIFY', stat: 'def', percent: 0.25, duration: 4, target: 'self' },
      { kind: 'STAT_MODIFY', stat: 'foc', percent: 0.25, duration: 4, target: 'self' },
      { kind: 'GAIN_CHARGE', amount: 3 },
    ],
  },

  {
    id: 'meridian_awk_interest', name: 'Compound Interest', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every exchange banks charge.',
    effects: [
      { kind: 'ON_HIT', chance: 1, effects: [{ kind: 'GAIN_CHARGE', amount: 1 }] },
      { kind: 'ON_TAKE_DAMAGE', chance: 0.5, effects: [{ kind: 'GAIN_CHARGE', amount: 1 }] },
    ],
  },
  {
    id: 'meridian_awk_collateral', name: 'Collateral', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Enters every combat already shielded, and DEF +14%.',
    effects: [
      { kind: 'SHIELD_PERCENT_MAX', percent: 0.15 },
      { kind: 'PASSIVE_AURA', stat: 'def', percent: 0.14 },
    ],
  },
  {
    id: 'meridian_awk_collect', name: 'Debt Collection', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill clears the board and refills the bank.',
    effects: [{ kind: 'ON_KILL', effects: [{ kind: 'COOLDOWN_RESET' }, { kind: 'GAIN_CHARGE', amount: 4 }] }],
  },
  {
    id: 'meridian_awk_terms', name: 'Favourable Terms', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. FOC +18% and ATK +12%.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'foc', percent: 0.18 },
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.12 },
    ],
  },
  {
    id: 'meridian_awk_control', name: 'Controlling Stake', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every hit marks them for collection.',
    effects: [{ kind: 'ON_HIT', chance: 0.3, effects: [{ kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.9 }] }],
  },
];

export const MERIDIAN_HEROES: HeroDefinition[] = [
  {
    id: 'meridian_factor', slug: 'junior-factor', name: 'Junior Factor', race: 'meridian',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Charge builder',
    baseStats: { hull: 120, atk: 44, def: 40, spd: 46, foc: 40, res: 37 },
    growth: { hull: 10, atk: 4.2, def: 3.2, spd: 1.6, foc: 2.6, res: 2.4 },
    skills: ['meridian_sidearm', 'meridian_levy', 'meridian_liquidate', 'meridian_hedge'],
    awakenedPassive: 'meridian_awk_interest',
  },
  {
    id: 'meridian_assessor', slug: 'assessor', name: 'Combine Assessor', race: 'meridian',
    rarity: 'common', rosterCost: 1, damageType: 'em', role: 'Debuffer',
    baseStats: { hull: 116, atk: 49, def: 39, spd: 50, foc: 49, res: 36 },
    growth: { hull: 10.2, atk: 4.7, def: 3, spd: 1.7, foc: 3, res: 2.5 },
    skills: ['meridian_tariff', 'meridian_ledger_bolt', 'meridian_audit', 'meridian_liquidate'],
    awakenedPassive: 'meridian_awk_control',
  },
  {
    id: 'meridian_escortman', slug: 'contract-escort', name: 'Contract Escort', race: 'meridian',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Bruiser',
    baseStats: { hull: 119, atk: 43, def: 46, spd: 38, foc: 33, res: 36 },
    growth: { hull: 11.3, atk: 4.1, def: 3.3, spd: 1.3, foc: 2.1, res: 2.2 },
    skills: ['meridian_sidearm', 'meridian_escort', 'meridian_hedge', 'meridian_bulk_order'],
    awakenedPassive: 'meridian_awk_collateral',
  },
  {
    id: 'meridian_broker', slug: 'floor-broker', name: 'Floor Broker', race: 'meridian',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Burst',
    baseStats: { hull: 107, atk: 49, def: 34, spd: 49, foc: 44, res: 32 },
    growth: { hull: 9.6, atk: 4.7, def: 2.6, spd: 1.8, foc: 2.6, res: 2.1 },
    skills: ['meridian_levy', 'meridian_liquidate', 'meridian_sidearm', 'meridian_margin'],
    awakenedPassive: 'meridian_awk_interest',
  },
  {
    id: 'meridian_underwriter', slug: 'underwriter', name: 'Underwriter', race: 'meridian',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Sustain',
    baseStats: { hull: 134, atk: 47, def: 47, spd: 48, foc: 43, res: 47 },
    growth: { hull: 11.6, atk: 4.5, def: 3.4, spd: 1.6, foc: 2.5, res: 2.9 },
    skills: ['meridian_sidearm', 'meridian_levy', 'meridian_hedge', 'meridian_insured'],
    awakenedPassive: 'meridian_awk_collateral',
  },
  {
    id: 'meridian_arbitrageur', slug: 'arbitrageur', name: 'Arbitrageur Kesh', race: 'meridian',
    rarity: 'uncommon', rosterCost: 2, damageType: 'em', role: 'Tempo burst',
    baseStats: { hull: 121, atk: 58, def: 42, spd: 56, foc: 54, res: 39 },
    growth: { hull: 11, atk: 5.4, def: 3.3, spd: 1.9, foc: 3.3, res: 2.4 },
    skills: ['meridian_liquidate', 'meridian_ledger_bolt', 'meridian_levy', 'meridian_margin'],
    awakenedPassive: 'meridian_awk_interest',
  },
  {
    id: 'meridian_collector', slug: 'debt-collector', name: 'Debt Collector', race: 'meridian',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Executioner',
    baseStats: { hull: 124, atk: 58, def: 42, spd: 50, foc: 48, res: 36 },
    growth: { hull: 10.7, atk: 5.5, def: 3.2, spd: 1.9, foc: 2.9, res: 2.3 },
    skills: ['meridian_sidearm', 'meridian_tariff', 'meridian_bulk_order', 'meridian_levy'],
    awakenedPassive: 'meridian_awk_collect',
  },
  {
    id: 'meridian_auditor', slug: 'senior-auditor', name: 'Senior Auditor', race: 'meridian',
    rarity: 'uncommon', rosterCost: 2, damageType: 'em', role: 'Control',
    baseStats: { hull: 138, atk: 60, def: 48, spd: 60, foc: 64, res: 48 },
    growth: { hull: 12.3, atk: 5.8, def: 3.9, spd: 2, foc: 3.9, res: 3.3 },
    skills: ['meridian_ledger_bolt', 'meridian_embargo', 'meridian_tariff', 'meridian_hedge'],
    awakenedPassive: 'meridian_awk_control',
  },
  {
    id: 'meridian_speculator', slug: 'speculator', name: 'Speculator Oyen', race: 'meridian',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'High risk',
    baseStats: { hull: 124, atk: 66, def: 41, spd: 55, foc: 53, res: 37 },
    growth: { hull: 11.4, atk: 6.2, def: 3.3, spd: 1.8, foc: 3.5, res: 2.4 },
    skills: ['meridian_sidearm', 'meridian_margin', 'meridian_liquidate', 'meridian_leverage'],
    awakenedPassive: 'meridian_awk_terms',
  },
  {
    id: 'meridian_partner', slug: 'trading-partner', name: 'Trading Partner Vess', race: 'meridian',
    rarity: 'rare', rosterCost: 4, damageType: 'em', role: 'Scaling engine',
    baseStats: { hull: 149, atk: 72, def: 55, spd: 60, foc: 64, res: 51 },
    growth: { hull: 13.1, atk: 6.4, def: 3.8, spd: 1.9, foc: 3.8, res: 3 },
    skills: ['meridian_arbitrage', 'meridian_liquidate', 'meridian_ledger_bolt', 'meridian_margin'],
    awakenedPassive: 'meridian_awk_interest',
  },
  {
    id: 'meridian_enforcer', slug: 'combine-enforcer', name: 'Combine Enforcer', race: 'meridian',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Bruiser',
    baseStats: { hull: 148, atk: 60, def: 54, spd: 46, foc: 49, res: 46 },
    growth: { hull: 13.2, atk: 5.7, def: 3.9, spd: 1.6, foc: 3, res: 3 },
    skills: ['meridian_sidearm', 'meridian_bulk_order', 'meridian_foreclose', 'meridian_escort'],
    awakenedPassive: 'meridian_awk_collateral',
  },
  {
    id: 'meridian_registrar', slug: 'registrar', name: 'Registrar Mohl', race: 'meridian',
    rarity: 'rare', rosterCost: 4, damageType: 'em', role: 'Denial',
    baseStats: { hull: 166, atk: 71, def: 58, spd: 64, foc: 72, res: 58 },
    growth: { hull: 14.3, atk: 6.6, def: 4.2, spd: 2.2, foc: 4.2, res: 3.7 },
    skills: ['meridian_ledger_bolt', 'meridian_audit', 'meridian_tariff', 'meridian_escort'],
    awakenedPassive: 'meridian_awk_control',
  },
  {
    id: 'meridian_director', slug: 'combine-director', name: 'Combine Director', race: 'meridian',
    rarity: 'epic', rosterCost: 7, damageType: 'em', role: 'Total scaling',
    baseStats: { hull: 161, atk: 77, def: 58, spd: 59, foc: 68, res: 53 },
    growth: { hull: 13.7, atk: 7.2, def: 4, spd: 2.2, foc: 3.6, res: 3.2 },
    skills: ['meridian_ledger_bolt', 'meridian_liquidate', 'meridian_arbitrage', 'meridian_foreclose'],
    awakenedPassive: 'meridian_awk_collect',
  },
  {
    id: 'meridian_liquidator', slug: 'the-liquidator', name: 'The Liquidator', race: 'meridian',
    rarity: 'epic', rosterCost: 7, damageType: 'kinetic', role: 'Burst finisher',
    baseStats: { hull: 154, atk: 85, def: 53, spd: 67, foc: 69, res: 47 },
    growth: { hull: 12.7, atk: 7.7, def: 3.9, spd: 2.3, foc: 3.9, res: 3.2 },
    skills: ['meridian_sidearm', 'meridian_foreclose', 'meridian_margin', 'meridian_liquidate'],
    awakenedPassive: 'meridian_awk_terms',
  },
  {
    id: 'meridian_chairman', slug: 'the-chairman', name: 'The Chairman', race: 'meridian',
    rarity: 'legendary', rosterCost: 12, damageType: 'em', role: 'Controlling stake',
    baseStats: { hull: 177, atk: 87, def: 65, spd: 68, foc: 74, res: 59 },
    growth: { hull: 15.1, atk: 7.8, def: 4.5, spd: 2.2, foc: 4, res: 3.6 },
    skills: ['meridian_ledger_bolt', 'meridian_liquidate', 'meridian_embargo', 'meridian_monopoly'],
    awakenedPassive: 'meridian_awk_collect',
  },
];
