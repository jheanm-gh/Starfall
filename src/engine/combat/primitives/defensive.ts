/* §8 Defensive primitives. */

import type { SkillEffect } from '../../types';
import type { EffectContext } from './context';
import { actor, healSide, shieldSide } from './context';

export function runDefensivePrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  const state = ctx.state;
  const a = actor(ctx);

  switch (effect.kind) {
    case 'SHIELD_FLAT':
      shieldSide(ctx, ctx.actorSide, effect.amount);
      return true;

    case 'SHIELD_PERCENT_MAX':
      shieldSide(ctx, ctx.actorSide, a.maxHull * effect.percent);
      return true;

    case 'HEAL_FLAT':
      healSide(ctx, ctx.actorSide, effect.amount, 'Repair');
      return true;

    case 'HEAL_PERCENT':
      healSide(ctx, ctx.actorSide, a.maxHull * effect.percent, 'Repair');
      return true;

    case 'REGEN':
      a.regen = { percent: effect.percent, turnsLeft: effect.duration };
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${a.name} runs a repair cycle: ${Math.round(effect.percent * 100)}% per turn for ${effect.duration}.`,
      });
      return true;

    case 'DAMAGE_REDUCTION':
      a.damageReduction = { percent: effect.percent, turnsLeft: effect.duration };
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${a.name} braces: incoming damage -${Math.round(effect.percent * 100)}% for ${effect.duration}.`,
      });
      return true;

    case 'COUNTER_STANCE':
      a.counterStance = { percent: effect.percent, turnsLeft: effect.duration };
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${a.name} sets a counter stance for ${effect.duration}.`,
      });
      return true;

    case 'DODGE_NEXT':
      a.dodgeNext = true;
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${a.name} prepares to slip the next attack.`,
      });
      return true;

    default:
      return false;
  }
}
