/* §8 Trigger primitives. These register hooks rather than acting
   immediately; the context fires them at the right moment. */

import type { SkillEffect } from '../../types';
import type { EffectContext } from './context';
import { actor } from './context';

export function runTriggerPrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  const a = actor(ctx);

  switch (effect.kind) {
    case 'ON_KILL':
    case 'ON_HIT':
    case 'ON_TAKE_DAMAGE': {
      const chance = effect.kind === 'ON_KILL' ? 1 : effect.chance ?? 1;
      const already = a.triggers.some((t) => t.on === effect.kind && t.sourceSkill === ctx.skill.id);
      if (!already) {
        a.triggers.push({ on: effect.kind, chance, effects: effect.effects, sourceSkill: ctx.skill.id });
      }
      return true;
    }

    case 'PASSIVE_AURA':
      // Duration 0 is read as permanent by the timer sweep, which only
      // decrements entries it can expire.
      if (!a.mods.some((m) => m.stat === effect.stat && m.turnsLeft === Infinity)) {
        a.mods.push({ stat: effect.stat, percent: effect.percent, turnsLeft: Infinity, positive: effect.percent >= 0 });
      }
      return true;

    default:
      return false;
  }
}
