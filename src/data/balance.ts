/* ============================================================
   EVERY tuning constant in the game lives here (§1). If a number
   that affects play appears anywhere else in src/, it is a bug.
   ============================================================ */

import type { DamageType, Rarity, StatKey } from '../engine/types';

/* ---------- §5.3 damage ---------- */

export const DAMAGE = {
  /** mitigation = MITIGATION_K / (MITIGATION_K + effectiveDef) */
  MITIGATION_K: 100,
  VARIANCE_MIN: 0.95,
  VARIANCE_MAX: 1.05,
  CRIT_MULT_BASE: 1.5,
  /** critMult is reduced by target.RES / CRIT_RES_DIVISOR, floored. */
  CRIT_RES_DIVISOR: 400,
  CRIT_MULT_FLOOR: 1.15,
  /** critChance = FOC / CRIT_FOC_DIVISOR, as a percentage. */
  CRIT_FOC_DIVISOR: 10,
  CRIT_CHANCE_CAP: 0.5,
  MIN_DAMAGE: 1,
  /** §5.4 — deliberately mild, because 1v1 has no switching. */
  TYPE_RESIST_MULT: 0.75,
  TYPE_VULNERABLE_MULT: 1.25,
  BASE_ACCURACY: 1.0,
  ACCURACY_FLOOR: 0.35,
} as const;

/* ---------- §6 status application ---------- */

export const STATUS = {
  /** chance = baseChance * (1 + FOC/FOC_DIVISOR) * (1 - RES/RES_DIVISOR) */
  FOC_DIVISOR: 200,
  RES_DIVISOR: 250,
  CHANCE_CAP: 0.95,
  CHANCE_FLOOR: 0.05,
} as const;

/* ---------- §5.2 turn order ---------- */

export const TURN = {
  PRIORITY_MIN: -2,
  PRIORITY_MAX: 3,
  /** Hard stall-breaker. A 1v1 that reaches this is a draw. */
  ROUND_LIMIT: 60,
} as const;

/* ---------- §9.2 levelling ---------- */

export const LEVELLING = {
  MAX_LEVEL: 60,
  /** EXP to advance from `level` to `level + 1`. */
  expCurve: (level: number): number => Math.round(100 * Math.pow(level, 1.5)),
  /** Ascension tier -> in-run level cap. */
  ASCENSION_LEVEL_CAP: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 60 } as Record<number, number>,
  /** T4 unlocks the fourth skill, T6 the awakened passive (§9.2). */
  FOURTH_SKILL_TIER: 4,
  AWAKENED_TIER: 6,
} as const;

/** Ascension cost in fragments, by rarity, for tier N -> N+1. */
export const ASCENSION_FRAGMENT_COST: Record<Rarity, number[]> = {
  common: [10, 20, 30, 50, 80],
  uncommon: [15, 25, 40, 65, 100],
  rare: [20, 35, 55, 85, 130],
  epic: [25, 45, 70, 110, 170],
  legendary: [30, 55, 85, 140, 220],
};

export const ASCENSION_SALVAGE_COST: number[] = [50, 120, 260, 520, 1000];

/* ---------- §7 roster ---------- */

export const ROSTER = {
  COST: { common: 1, uncommon: 2, rare: 4, epic: 7, legendary: 12 } as Record<Rarity, number>,
  BASE_BUDGET: 15,
  MAX_BUDGET: 30,
  MAX_HEROES: 5,
} as const;

/* ---------- §10 gacha ---------- */

export const GACHA = {
  BASE_RATES: { common: 0.55, uncommon: 0.27, rare: 0.13, epic: 0.044, legendary: 0.006 } as Record<Rarity, number>,
  /** Full summons (summon-item pulls) skew upward. */
  PREMIUM_RATES: { common: 0.35, uncommon: 0.31, rare: 0.22, epic: 0.1, legendary: 0.02 } as Record<Rarity, number>,
  SOFT_PITY_START: 75,
  SOFT_PITY_STEP: 0.06,
  HARD_PITY: 90,
  /** §10 — duplicate conversion thresholds by rarity. */
  FRAGMENT_THRESHOLD: { common: 20, uncommon: 40, rare: 60, epic: 100, legendary: 200 } as Record<Rarity, number>,
  /** Duplicates convert to this many fragments of the same hero. */
  DUPLICATE_FRAGMENTS: { common: 5, uncommon: 8, rare: 12, epic: 20, legendary: 40 } as Record<Rarity, number>,
  PULL_SALVAGE_COST: 120,
} as const;

/* ---------- §9.4 Commander ---------- */

export const COMMANDER = {
  MAX_RANK: 40,
  rankCost: (rank: number): number => Math.round(150 * Math.pow(rank, 1.35)),
  /** §9.4: hard-capped. This is the one deliberate exception to §0.3. */
  AURA_CAP: 0.05,
  AURA_PER_RANK: 0.00125,
  EXP_MULT_CAP: 1.5,
  SCRIP_MULT_CAP: 1.5,
  SKILL_SLOTS: 2,
  DOCTRINE_CHOICES: 3,
} as const;

/* ---------- §11 run structure ---------- */

export const RUN = {
  TOTAL_FLOORS: 300,
  SECTOR_SIZE: 30,
  SECTOR_COUNT: 10,
  APEX_FLOORS: [100, 200, 300] as readonly number[],
  STARTING_SCRIP: 120,
  /** HULL restored between floors on Standard/Hardened (§12). */
  BETWEEN_FLOOR_HEAL: 0.25,
  BASE_REVIVES: { standard: 2, hardened: 1, attrition: 0 } as Record<string, number>,
} as const;

/* ---------- §12 difficulty ---------- */

export const DIFFICULTY = {
  standard: { enemyStatMult: 1.0, salvageMult: 1.0, revives: 2, bossPhases: 1, healBetweenFloors: true },
  hardened: { enemyStatMult: 1.25, salvageMult: 1.5, revives: 1, bossPhases: 2, healBetweenFloors: true },
  attrition: { enemyStatMult: 1.5, salvageMult: 2.25, revives: 0, bossPhases: 2, healBetweenFloors: false },
} as const;

/* ---------- enemy and reward scaling ---------- */

export const SCALING = {
  /** Enemy level tracks floor depth. */
  enemyLevel: (floor: number): number =>
    Math.max(1, Math.min(LEVELLING.MAX_LEVEL, Math.round(1 + floor * 0.2))),
  /** Flat stat multiplier applied on top of level, by node kind. */
  NODE_STAT_MULT: { combat: 1.0, elite: 1.18, boss: 1.35, apex: 1.6, event: 1.0, merchant: 1.0, rest: 1.0 } as Record<string, number>,
  /** Rewards per cleared floor before difficulty multipliers. */
  expPerFloor: (floor: number): number => Math.round(40 + floor * 7.5),
  scripPerFloor: (floor: number): number => Math.round(18 + floor * 1.6),
  salvagePerFloor: (floor: number): number => Math.round(2 + floor * 0.35),
  BOSS_REWARD_MULT: 3,
  APEX_REWARD_MULT: 6,
} as const;

/* ---------- §9.3 gear and runes ---------- */

export const GEAR = {
  SOCKETS_BY_TIER: { 1: 1, 2: 2, 3: 3, 4: 4 } as Record<number, number>,
  CHASSIS_SALVAGE_COST: { 1: 80, 2: 240, 3: 600, 4: 1400 } as Record<number, number>,
  /** Rune drop weights by rarity at a normal floor. */
  RUNE_DROP_WEIGHTS: { common: 50, uncommon: 28, rare: 15, epic: 6, legendary: 1 } as Record<Rarity, number>,
  RUNE_SHOP_PRICE: { common: 40, uncommon: 80, rare: 160, epic: 320, legendary: 640 } as Record<Rarity, number>,
} as const;

/* ---------- hero stat budgets by rarity ---------- */

/** Total base-stat budget a hero of each rarity is authored against. */
export const RARITY_STAT_BUDGET: Record<Rarity, number> = {
  common: 100,
  uncommon: 112,
  rare: 126,
  epic: 142,
  legendary: 160,
};

/** HULL is authored on a different scale to the other five stats. */
export const HULL_SCALE = 1.5;

export const STAT_SOFT_CAPS: Record<StatKey, number> = {
  hull: 20000,
  atk: 1200,
  def: 900,
  spd: 400,
  foc: 500,
  res: 500,
};

/* ---------- field tuning lives with field definitions ---------- */

export const FIELD = {
  DEFAULT_DOT_MULT: 1,
  DEFAULT_HEAL_MULT: 1,
} as const;

export const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  kinetic: 'Kinetic',
  thermal: 'Thermal',
  corrosive: 'Corrosive',
  em: 'EM',
  psionic: 'Psionic',
};
