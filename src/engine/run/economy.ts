/* §9.5 — Scrip economy and merchant stock.

   Scrip is run-scoped and fully lost at run end, so the merchant exists
   to be emptied. Prices scale with depth to keep late-run Scrip from
   becoming meaningless. */

import type { Difficulty, Rarity } from '../types';
import { GEAR } from '../../data/balance';
import { ITEM_LIST, type ItemDefinition } from '../../data/items';
import { RUNE_LIST } from '../../data/runes';
import { deriveSeed, pickWeighted, rollInt, shuffle } from '../rng';

export interface StockedRune {
  runeId: string;
  price: number;
}

export interface StockedItem {
  itemId: string;
  price: number;
}

export interface MerchantStock {
  runes: StockedRune[];
  items: StockedItem[];
  /** Rerolls remaining, from Commander logistics. */
  rerolls: number;
}

/** Prices drift upward with depth so that Scrip keeps its bite. */
export function depthPriceMultiplier(floor: number): number {
  return 1 + floor / 220;
}

export function generateStock(
  runSeed: number,
  floor: number,
  opts: { shopTier?: number; rerolls?: number; rerollIndex?: number } = {},
): MerchantStock {
  const shopTier = opts.shopTier ?? 0;
  const seed = deriveSeed(runSeed, floor, 0x5709, opts.rerollIndex ?? 0);
  const priceMult = depthPriceMultiplier(floor);

  const rarities = Object.keys(GEAR.RUNE_DROP_WEIGHTS) as Rarity[];
  // Shop tier is bought with Salvage and shifts the table upward — an
  // access upgrade, not a power upgrade (§0.3).
  const bias = 1 + shopTier * 0.35 + floor / 200;

  const runes: StockedRune[] = [];
  const runeCount = 3 + Math.min(2, shopTier);
  for (let i = 0; i < runeCount; i++) {
    const rarity = pickWeighted(
      deriveSeed(seed, i, 1), 0, rarities,
      rarities.map((r, idx) => GEAR.RUNE_DROP_WEIGHTS[r] * Math.pow(bias, idx)),
    );
    const pool = RUNE_LIST.filter((r) => r.rarity === rarity.value);
    if (pool.length === 0) continue;
    const idx = rollInt(deriveSeed(seed, i, 2), 0, 0, pool.length - 1);
    const rune = pool[idx.value];
    runes.push({
      runeId: rune.id,
      price: Math.round(GEAR.RUNE_SHOP_PRICE[rune.rarity] * priceMult),
    });
  }

  const shuffled = shuffle(deriveSeed(seed, 90), 0, ITEM_LIST);
  const items: StockedItem[] = shuffled.value.slice(0, 3 + Math.min(2, shopTier)).map((item: ItemDefinition) => ({
    itemId: item.id,
    price: Math.round(item.price * priceMult),
  }));

  return { runes, items, rerolls: opts.rerolls ?? 1 };
}

export function startingScrip(difficulty: Difficulty, logisticsBonus = 0): number {
  const base = difficulty === 'attrition' ? 180 : difficulty === 'hardened' ? 150 : 120;
  return base + logisticsBonus;
}
