/* Deterministic opponent policy.

   The AI is scored, not random, so a given (seed, state) always yields the
   same enemy action — which is what makes a whole combat replayable from
   its seed and a daily challenge meaningful. */

import type { CombatState, Side, SkillDefinition, SkillId } from '../types';
import { getSkill } from '../../data/registry';
import { roll } from '../rng';
import { hullFraction } from './stats';
import { usableSkills } from './rules';

/** A crude but stable value estimate for one skill in the current position. */
export function scoreSkill(state: CombatState, side: Side, skill: SkillDefinition): number {
  const self = state[side];
  const foe = state[side === 'player' ? 'enemy' : 'player'];
  const selfHp = hullFraction(self);
  const foeHp = hullFraction(foe);
  let score = 0;

  for (const e of skill.effects) {
    switch (e.kind) {
      case 'DIRECT_DAMAGE': score += e.power * 100; break;
      case 'MULTI_HIT': score += e.power * e.hits * 92; break;
      case 'EXECUTE': score += e.power * 100 * (foeHp < e.threshold ? e.bonusMult : 1); break;
      case 'RAMPING': score += (e.power + e.increment * (self.ramp[skill.id] ?? 0)) * 100; break;
      case 'RECOIL': score += e.power * 100 - e.recoilPercent * 60 * (1 - selfHp); break;
      case 'LIFESTEAL': score += e.power * 100 + (1 - selfHp) * 60; break;
      case 'FIXED_DAMAGE': score += (e.amount / Math.max(1, foe.maxHull)) * 900; break;
      case 'PERCENT_MAX_HULL': score += e.percent * 700; break;
      case 'CONDITIONAL_DAMAGE': score += e.power * 100; break;
      case 'SCALE_WITH_FIELD': score += e.power * 100; break;
      case 'SPEND_CHARGE': score += e.power * 100 * (0.5 + 0.5 * Math.min(1, self.charge / Math.max(1, e.amount))); break;
      case 'SELF_SACRIFICE': score += e.power * 100 - (selfHp < 0.4 ? 260 : 40); break;
      case 'CONSUME_STATUS':
        score += foe.statuses.some((s) => s.id === e.status) ? e.damagePerStack * 130 : -35;
        break;
      case 'APPLY_STATUS':
        score += foe.statuses.some((s) => s.id === e.status) ? 8 : e.baseChance * 55;
        break;
      case 'HEAL_PERCENT': score += e.percent * 320 * (1 - selfHp) * 2; break;
      case 'HEAL_FLAT': score += (e.amount / Math.max(1, self.maxHull)) * 640 * (1 - selfHp); break;
      case 'REGEN': score += e.percent * e.duration * 260 * (1 - selfHp); break;
      case 'SHIELD_FLAT': score += (e.amount / Math.max(1, self.maxHull)) * 260; break;
      case 'SHIELD_PERCENT_MAX': score += e.percent * 260; break;
      case 'DAMAGE_REDUCTION': score += e.percent * e.duration * 45; break;
      case 'COUNTER_STANCE': score += e.percent * 70; break;
      case 'DODGE_NEXT': score += 45; break;
      case 'STAT_MODIFY': score += Math.abs(e.percent) * e.duration * 30; break;
      case 'STAT_STEAL': score += e.percent * e.duration * 45; break;
      case 'BUFF_STRIP': score += foe.mods.some((m) => m.positive) ? 70 : -25; break;
      case 'CLEANSE_SELF': score += self.statuses.length * 45 - 25; break;
      case 'TRANSFER_STATUS': score += self.statuses.length * 50 - 25; break;
      case 'EXTEND_STATUS': score += foe.statuses.length * 30 - 15; break;
      case 'DEBUFF_IMMUNITY': score += 40; break;
      case 'REFLECT': score += e.percent * 60; break;
      case 'DELAY_TARGET': score += e.percent * 60; break;
      case 'SPEED_SWAP': score += self.stats.spd < foe.stats.spd ? 80 : -60; break;
      case 'EXTRA_ACTION': score += 120; break;
      case 'COOLDOWN_RESET': score += 55; break;
      case 'CHARGE': score += e.multiplier * 40; break;
      case 'GAIN_CHARGE': score += e.amount * 18; break;
      case 'SET_FIELD': score += 40; break;
      case 'CLEAR_FIELD': score += 30; break;
      case 'FIELD_IMMUNITY': score += state.field ? 45 : 5; break;
      case 'REVIVE_SELF': score += 90; break;
      case 'ARMOR_PIERCE': score += e.pierce * 45; break;
      case 'PRIORITY': score += e.tier * 12; break;
      default: break;
    }
  }

  // Prefer holding a long cooldown when the position is not urgent.
  if (skill.cooldown > 0 && foeHp > 0.7 && selfHp > 0.7) score -= skill.cooldown * 6;
  return score;
}

export function chooseAction(state: CombatState, side: Side): SkillId | null {
  const options = usableSkills(state, side).map(getSkill);
  if (options.length === 0) return null;

  let best: { id: SkillId; score: number } | null = null;
  for (let i = 0; i < options.length; i++) {
    const skill = options[i];
    // A small seeded jitter breaks score ties without breaking determinism.
    const r = roll(state.seed, state.cursor + i * 7 + state.round * 13);
    const score = scoreSkill(state, side, skill) * (0.94 + r.value * 0.12);
    if (!best || score > best.score) best = { id: skill.id, score };
  }
  return best ? best.id : options[0].id;
}
