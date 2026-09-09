/* §5.2 — turn order.

   Recomputed every round from *current* effective SPD, so a slow or a
   buff re-sorts the round instead of being snapshotted at combat start.
   A SPD advantage never grants a second turn at any gap; it only decides
   who acts first. */

import type { CombatAction, CombatState, Side, SkillDefinition } from '../types';
import { TURN } from '../../data/balance';
import { effectiveStat } from './stats';

/**
 * A skill's tier comes from its `priority` field, which is authoritative.
 * The PRIORITY primitive is the same value expressed compositionally, so
 * the two must never be summed — a content test asserts they agree.
 */
export function skillPriority(skill: SkillDefinition | null): number {
  if (!skill) return 0;
  return Math.max(TURN.PRIORITY_MIN, Math.min(TURN.PRIORITY_MAX, skill.priority));
}

/** Chassis and rune priority, kept separate from the skill's own tier. */
export function itemPriority(state: CombatState, side: Side): number {
  const c = state[side];
  // T-tier "opening" trait: acts first on the opening round only.
  if (c.traits.includes('opening_priority') && state.round === 1) return 1;
  return 0;
}

export interface OrderInput {
  player: { action: CombatAction; skill: SkillDefinition | null };
  enemy: { action: CombatAction; skill: SkillDefinition | null };
}

export function computeOrder(state: CombatState, input: OrderInput): Side[] {
  const sides: Side[] = ['player', 'enemy'];

  const key = (side: Side) => {
    const entry = input[side];
    return {
      priority: skillPriority(entry.skill) + itemPriority(state, side),
      spd: effectiveStat(state[side], 'spd', state.field),
      baseSpd: state[side].stats.spd,
      id: state[side].defId,
      side,
    };
  };

  const keys = sides.map(key);

  keys.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (a.spd !== b.spd) return b.spd - a.spd;
    if (a.baseSpd !== b.baseSpd) return b.baseSpd - a.baseSpd;
    if (a.id !== b.id) return a.id < b.id ? -1 : 1;
    // Final deterministic tiebreak so replays and daily seeds reproduce.
    return a.side < b.side ? -1 : 1;
  });

  return keys.map((k) => k.side);
}
