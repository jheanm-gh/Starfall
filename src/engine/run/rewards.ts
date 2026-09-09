/* Reward computation for a cleared floor (§9.5, §11, §12). */

import type { Difficulty, FloorNode, RunRewards } from '../types';
import { COMMANDER, DIFFICULTY, GEAR, SCALING } from '../../data/balance';
import { RUNE_LIST } from '../../data/runes';
import { deriveSeed, pickWeighted, rollChance, rollInt } from '../rng';

export interface RewardContext {
  runSeed: number;
  difficulty: Difficulty;
  /** Commander multipliers, already clamped to their caps by the caller. */
  expMult: number;
  scripMult: number;
}

export function rewardsForFloor(node: FloorNode, ctx: RewardContext): RunRewards {
  const seed = deriveSeed(ctx.runSeed, node.floor, 0x2ee0);
  const diff = DIFFICULTY[ctx.difficulty];

  const kindMult =
    node.kind === 'apex' ? SCALING.APEX_REWARD_MULT
      : node.kind === 'boss' ? SCALING.BOSS_REWARD_MULT
        : node.kind === 'elite' ? 1.5
          : 1;

  const exp = Math.round(SCALING.expPerFloor(node.floor) * kindMult * Math.min(COMMANDER.EXP_MULT_CAP, ctx.expMult));
  const scrip = Math.round(SCALING.scripPerFloor(node.floor) * kindMult * Math.min(COMMANDER.SCRIP_MULT_CAP, ctx.scripMult));
  const salvage = Math.round(SCALING.salvagePerFloor(node.floor) * kindMult * diff.salvageMult);

  const runes: string[] = [];
  const runeChance = node.kind === 'boss' || node.kind === 'apex' ? 1 : node.kind === 'elite' ? 0.45 : 0.16;
  const gotRune = rollChance(deriveSeed(seed, 11), 0, runeChance);
  if (gotRune.value) {
    const rarities = Object.keys(GEAR.RUNE_DROP_WEIGHTS) as (keyof typeof GEAR.RUNE_DROP_WEIGHTS)[];
    // Depth raises the ceiling: late floors weight the top of the table.
    const depthBias = 1 + node.floor / 150;
    const weights = rarities.map((r, i) => GEAR.RUNE_DROP_WEIGHTS[r] * Math.pow(depthBias, i));
    const rarity = pickWeighted(deriveSeed(seed, 12), 0, rarities, weights);
    const pool = RUNE_LIST.filter((r) => r.rarity === rarity.value);
    if (pool.length > 0) {
      const idx = rollInt(deriveSeed(seed, 13), 0, 0, pool.length - 1);
      runes.push(pool[idx.value].id);
    }
  }

  const summonChance = node.kind === 'apex' ? 1 : node.kind === 'boss' ? 0.3 : 0.04;
  const gotSummon = rollChance(deriveSeed(seed, 14), 0, summonChance);

  return {
    exp,
    scrip,
    salvage,
    runes,
    fragments: [],
    summonItems: gotSummon.value ? 1 : 0,
  };
}

export function emptyRewards(): RunRewards {
  return { exp: 0, scrip: 0, salvage: 0, runes: [], fragments: [], summonItems: 0 };
}

export function mergeRewards(a: RunRewards, b: RunRewards): RunRewards {
  return {
    exp: a.exp + b.exp,
    scrip: a.scrip + b.scrip,
    salvage: a.salvage + b.salvage,
    runes: [...a.runes, ...b.runes],
    fragments: [...a.fragments, ...b.fragments],
    summonItems: a.summonItems + b.summonItems,
  };
}
