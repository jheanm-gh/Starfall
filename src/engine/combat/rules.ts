/* Action legality. Shared by the player UI and the AI so they can never
   disagree about what is selectable. */

import type { CombatState, Side, SkillId } from '../types';
import { getSkill } from '../../data/registry';

/** Jam locks the highest-cost skill — read here as the longest cooldown. */
export function jammedSkill(state: CombatState, side: Side): SkillId | null {
  const c = state[side];
  if (!c.statuses.some((s) => s.id === 'jam')) return null;
  let worst: { id: SkillId; cd: number } | null = null;
  for (const id of c.skills) {
    const skill = getSkill(id);
    if (skill.passive) continue;
    if (!worst || skill.cooldown > worst.cd || (skill.cooldown === worst.cd && id > worst.id)) {
      worst = { id, cd: skill.cooldown };
    }
  }
  return worst?.id ?? null;
}

export function activeSkills(state: CombatState, side: Side): SkillId[] {
  return state[side].skills.filter((id) => !getSkill(id).passive);
}

export function usableSkills(state: CombatState, side: Side): SkillId[] {
  const c = state[side];
  const jammed = jammedSkill(state, side);
  return activeSkills(state, side).filter((id) => c.cooldowns[id] <= 0 && id !== jammed);
}

export function skillUnavailableReason(state: CombatState, side: Side, id: SkillId): string | null {
  const c = state[side];
  if (!c.skills.includes(id)) return 'Not equipped';
  if (getSkill(id).passive) return 'Passive';
  if (c.cooldowns[id] > 0) return `Cooling (${c.cooldowns[id]})`;
  if (jammedSkill(state, side) === id) return 'Jammed';
  return null;
}
