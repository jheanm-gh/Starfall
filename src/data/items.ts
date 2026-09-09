/* Run-scoped consumables (§9.1). Bought with Scrip, found on floors,
   destroyed at run end along with everything else run-scoped. */

import type { Rarity, SkillEffect } from '../engine/types';

export type ItemId = string;

export interface ItemDefinition {
  id: ItemId;
  name: string;
  rarity: Rarity;
  description: string;
  price: number;
  /** Applied out of combat to the selected hero, or at combat start. */
  kind: 'repair' | 'revive' | 'buff' | 'summon' | 'utility';
  effects?: SkillEffect[];
  /** For repair/revive: fraction of maximum HULL restored. */
  percent?: number;
}

export const ITEM_LIST: ItemDefinition[] = [
  { id: 'item_patch', name: 'Hull Patch', rarity: 'common', kind: 'repair', percent: 0.3, price: 45, description: 'Repairs 30% of one hero’s maximum HULL.' },
  { id: 'item_weld', name: 'Structural Weld', rarity: 'uncommon', kind: 'repair', percent: 0.6, price: 95, description: 'Repairs 60% of one hero’s maximum HULL.' },
  { id: 'item_drydock', name: 'Field Drydock', rarity: 'rare', kind: 'repair', percent: 1, price: 190, description: 'Restores one hero to full HULL.' },
  { id: 'item_revive', name: 'Resuscitation Rig', rarity: 'epic', kind: 'revive', percent: 0.5, price: 320, description: 'Returns one fallen hero to the roster at 50% HULL.' },
  { id: 'item_stim', name: 'Combat Stimulant', rarity: 'uncommon', kind: 'buff', price: 110, description: 'Next combat begins with ATK +25% for four turns.', effects: [{ kind: 'STAT_MODIFY', stat: 'atk', percent: 0.25, duration: 4, target: 'self' }] },
  { id: 'item_plate', name: 'Strap-On Plating', rarity: 'uncommon', kind: 'buff', price: 110, description: 'Next combat begins with a shield worth 20% of maximum HULL.', effects: [{ kind: 'SHIELD_PERCENT_MAX', percent: 0.2 }] },
  { id: 'item_scrambler', name: 'Signal Scrambler', rarity: 'rare', kind: 'buff', price: 175, description: 'Next combat begins with the enemy Blinded and Marked.', effects: [{ kind: 'APPLY_STATUS', status: 'blind', baseChance: 1 }, { kind: 'APPLY_STATUS', status: 'mark', baseChance: 1 }] },
  { id: 'item_summon', name: 'Summon Beacon', rarity: 'rare', kind: 'summon', price: 260, description: 'One full summon at the improved rate table.' },
  { id: 'item_reroll', name: 'Merchant Ledger', rarity: 'common', kind: 'utility', price: 60, description: 'Rerolls the current merchant stock.' },
];

export const ITEMS: Record<ItemId, ItemDefinition> = Object.fromEntries(
  ITEM_LIST.map((i) => [i.id, i]),
);

export function getItem(id: ItemId): ItemDefinition {
  const item = ITEMS[id];
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}
