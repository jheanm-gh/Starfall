/* §8 Damage primitives. */

import type { SkillEffect } from '../../types';
import { hullFraction } from '../stats';
import { matchesField } from '../field';
import { hasStatus } from '../statuses';
import type { EffectContext } from './context';
import { actor, dealDamage, healSide, target } from './context';

export function runDamagePrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  switch (effect.kind) {
    case 'DIRECT_DAMAGE': {
      dealDamage(ctx, effect.power, {
        ignoresShield: effect.ignoresShield,
        toSide: effect.target === 'self' ? ctx.actorSide : ctx.targetSide,
      });
      return true;
    }

    case 'MULTI_HIT': {
      // Each hit rolls accuracy and crit independently — that is the point
      // of the primitive, and it is why multi-hit pairs well with Mark.
      for (let i = 0; i < effect.hits; i++) {
        if (!target(ctx).alive) break;
        dealDamage(ctx, effect.power);
      }
      return true;
    }

    case 'EXECUTE': {
      const below = hullFraction(target(ctx)) < effect.threshold;
      dealDamage(ctx, effect.power * (below ? effect.bonusMult : 1));
      return true;
    }

    case 'RAMPING': {
      const a = actor(ctx);
      const stacks = Math.min(effect.maxStacks, a.ramp[ctx.skill.id] ?? 0);
      dealDamage(ctx, effect.power + effect.increment * stacks);
      // The ramp counter is advanced by the resolver, which knows whether
      // this skill was used consecutively.
      return true;
    }

    case 'RECOIL': {
      const dealt = dealDamage(ctx, effect.power);
      if (dealt > 0) {
        const recoil = Math.max(1, Math.round(dealt * effect.recoilPercent));
        dealDamage(ctx, 0, {
          flat: recoil, guaranteed: true, silentHooks: true,
          ignoresDef: true, canCrit: false, toSide: ctx.actorSide,
        });
      }
      return true;
    }

    case 'LIFESTEAL': {
      const dealt = dealDamage(ctx, effect.power);
      if (dealt > 0) healSide(ctx, ctx.actorSide, dealt * effect.leechPercent, 'Lifesteal');
      return true;
    }

    case 'FIXED_DAMAGE': {
      dealDamage(ctx, 0, { flat: effect.amount, ignoresDef: true, canCrit: false });
      return true;
    }

    case 'PERCENT_MAX_HULL': {
      const ref = effect.ofTarget === false ? actor(ctx) : target(ctx);
      dealDamage(ctx, 0, {
        flat: Math.max(1, Math.round(ref.maxHull * effect.percent)),
        ignoresDef: true, canCrit: false,
      });
      return true;
    }

    case 'ARMOR_PIERCE': {
      // Modifies the rest of the skill rather than dealing damage itself.
      ctx.pierce = Math.min(1, ctx.pierce + effect.pierce);
      return true;
    }

    case 'CONDITIONAL_DAMAGE': {
      const met = conditionMet(ctx, effect.condition);
      dealDamage(ctx, effect.power * (met ? effect.bonusMult : 1));
      return true;
    }

    default:
      return false;
  }
}

/** Shared gate evaluation for CONDITIONAL_DAMAGE and any future gated effect. */
export function conditionMet(ctx: EffectContext, cond: NonNullable<Extract<SkillEffect, { kind: 'CONDITIONAL_DAMAGE' }>['condition']>): boolean {
  if (cond.targetHasStatus && !hasStatus(ctx.state, ctx.targetSide, cond.targetHasStatus)) return false;
  if (cond.selfHasStatus && !hasStatus(ctx.state, ctx.actorSide, cond.selfHasStatus)) return false;
  if (cond.field && !matchesField(ctx.state, cond.field)) return false;
  if (cond.targetHullBelow !== undefined && hullFraction(target(ctx)) >= cond.targetHullBelow) return false;
  if (cond.selfHullBelow !== undefined && hullFraction(actor(ctx)) >= cond.selfHullBelow) return false;
  if (cond.selfHullAbove !== undefined && hullFraction(actor(ctx)) <= cond.selfHullAbove) return false;
  if (cond.chargeAtLeast !== undefined && actor(ctx).charge < cond.chargeAtLeast) return false;
  return true;
}
