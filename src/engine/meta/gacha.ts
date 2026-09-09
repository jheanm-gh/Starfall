/* §10 — acquisition.

   Heroes are never captured from defeated enemies, so the enemy roster
   carries no rarity economy at all. Four channels feed the collection;
   this module implements the two random ones and the duplicate sink.

   The pity counter lives in the account save and persists across
   sessions — that is a hard requirement, not a nicety. */

import type { HeroDefinition, Rarity } from '../types';
import { GACHA } from '../../data/balance';
import { HERO_LIST } from '../../data/registry';
import { deriveSeed, pickWeighted, rollInt } from '../rng';

export interface PityState {
  /** Pulls since the last Epic-or-better. */
  sinceEpic: number;
  /** Lifetime pulls, for statistics. */
  total: number;
}

export interface PullResult {
  hero: HeroDefinition;
  rarity: Rarity;
  /** True when the hero was already owned and converted to fragments. */
  duplicate: boolean;
  fragments: number;
  pity: PityState;
  /** True when hard pity forced the outcome, for honest UI. */
  pityTriggered: boolean;
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

/**
 * The live rate table for one pull, after soft and hard pity.
 * Exported so the UI can show the player their actual odds.
 */
export function ratesFor(pity: PityState, premium: boolean): Record<Rarity, number> {
  const base = premium ? GACHA.PREMIUM_RATES : GACHA.BASE_RATES;

  if (pity.sinceEpic >= GACHA.HARD_PITY - 1) {
    // Hard pity: an Epic-or-better is guaranteed, split by their relative weights.
    const epicWeight = base.epic;
    const legWeight = base.legendary;
    const total = epicWeight + legWeight;
    return { common: 0, uncommon: 0, rare: 0, epic: epicWeight / total, legendary: legWeight / total };
  }

  const over = pity.sinceEpic - (GACHA.SOFT_PITY_START - 1);
  if (over <= 0) return { ...base };

  // Soft pity scales the combined Epic+ rate, and the rest of the table
  // is renormalised to keep the distribution honest.
  const epicPlus = base.epic + base.legendary;
  const boosted = Math.min(0.95, epicPlus * (1 + GACHA.SOFT_PITY_STEP * over));
  const scale = boosted / epicPlus;
  const remainder = 1 - boosted;
  const lowTotal = base.common + base.uncommon + base.rare;

  return {
    common: (base.common / lowTotal) * remainder,
    uncommon: (base.uncommon / lowTotal) * remainder,
    rare: (base.rare / lowTotal) * remainder,
    epic: base.epic * scale,
    legendary: base.legendary * scale,
  };
}

export interface PullOptions {
  premium?: boolean;
  /** Ids the account already owns; drives duplicate conversion. */
  owned?: Set<string>;
  /** Restrict the pool, e.g. a race-banner event (§10 channel 4). */
  pool?: HeroDefinition[];
}

export function pull(seed: number, index: number, pity: PityState, opts: PullOptions = {}): PullResult {
  const premium = opts.premium ?? false;
  const rates = ratesFor(pity, premium);
  const s = deriveSeed(seed, index, 0x6acc);

  const drawn = pickWeighted(s, 0, RARITY_ORDER, RARITY_ORDER.map((r) => rates[r]));
  let rarity = drawn.value;

  const source = opts.pool ?? HERO_LIST;
  let pool = source.filter((h) => h.rarity === rarity);
  if (pool.length === 0) {
    // Fall back down the table rather than failing a pull outright, which
    // matters while a race is still being authored.
    for (let i = RARITY_ORDER.indexOf(rarity) - 1; i >= 0; i--) {
      pool = source.filter((h) => h.rarity === RARITY_ORDER[i]);
      if (pool.length > 0) { rarity = RARITY_ORDER[i]; break; }
    }
  }
  if (pool.length === 0) throw new Error('gacha pool is empty');

  const idx = rollInt(deriveSeed(s, 1), 0, 0, pool.length - 1);
  const hero = pool[idx.value];

  const isEpicPlus = rarity === 'epic' || rarity === 'legendary';
  const nextPity: PityState = {
    sinceEpic: isEpicPlus ? 0 : pity.sinceEpic + 1,
    total: pity.total + 1,
  };

  const duplicate = opts.owned?.has(hero.id) ?? false;

  return {
    hero,
    rarity,
    duplicate,
    fragments: duplicate ? GACHA.DUPLICATE_FRAGMENTS[rarity] : 0,
    pity: nextPity,
    pityTriggered: pity.sinceEpic >= GACHA.HARD_PITY - 1,
  };
}

/** A ten-pull, threaded so each pull sees the pity state the last one left. */
export function pullMany(seed: number, startIndex: number, pity: PityState, count: number, opts: PullOptions = {}): PullResult[] {
  const results: PullResult[] = [];
  let current = pity;
  const owned = new Set(opts.owned ?? []);
  for (let i = 0; i < count; i++) {
    const result = pull(seed, startIndex + i, current, { ...opts, owned });
    results.push(result);
    current = result.pity;
    owned.add(result.hero.id);
  }
  return results;
}

/** §10 — fragments needed to summon a hero outright at each rarity. */
export function fragmentThreshold(rarity: Rarity): number {
  return GACHA.FRAGMENT_THRESHOLD[rarity];
}

export function emptyPity(): PityState {
  return { sinceEpic: 0, total: 0 };
}
