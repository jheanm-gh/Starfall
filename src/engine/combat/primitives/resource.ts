/* §8 Resource primitives. Charge is a per-combat resource that some kits
   build and spend; it resets at combat start like everything else. */

import type { SkillEffect } from '../../types';
import type { EffectContext } from './context';
import { actor, dealDamage, handleDeath } from './context';

export const MAX_CHARGE = 10;

export function runResourcePrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  const state = ctx.state;
  const a = actor(ctx);

  switch (effect.kind) {
    case 'GAIN_CHARGE':
      a.charge = Math.min(MAX_CHARGE, a.charge + effect.amount);
      state.log.push({
        kind: 'charge', round: state.round, side: ctx.actorSide, amount: a.charge,
        text: `${a.name} banks charge (${a.charge}).`,
      });
      return true;

    case 'SPEND_CHARGE': {
      const spent = Math.min(a.charge, effect.amount);
      a.charge -= spent;
      // Half the power is unconditional and half is bought with charge, so
      // an empty bank still does something rather than fizzling.
      const ratio = spent / Math.max(1, effect.amount);
      dealDamage(ctx, effect.power * (0.5 + 0.5 * ratio));
      return true;
    }

    case 'SELF_SACRIFICE': {
      const cost = Math.max(1, Math.round(a.maxHull * effect.percentMaxHull));
      const survives = a.hull > cost;
      a.hull = Math.max(0, a.hull - cost);
      state.log.push({
        kind: 'damage', round: state.round, side: ctx.actorSide, amount: cost,
        text: `${a.name} burns ${cost} HULL to power ${ctx.skill.name}.`,
      });
      dealDamage(ctx, effect.power);
      if (!survives && a.hull <= 0) handleDeath(ctx, ctx.actorSide, ctx.targetSide);
      return true;
    }

    case 'REVIVE_SELF':
      // Registered as a standing one-shot; consumed by handleDeath.
      a.reviveOnDeath = effect.healPercent;
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${a.name} arms a reboot protocol.`,
      });
      return true;

    default:
      return false;
  }
}
