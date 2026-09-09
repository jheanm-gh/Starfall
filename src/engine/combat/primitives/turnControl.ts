/* §8 Turn-control primitives.

   Note the spec's hard rule (§5.2): a SPD advantage never grants a second
   turn. EXTRA_ACTION is the only source of one, and it is deliberately
   rare and cooldown-gated at the data layer. */

import type { SkillEffect } from '../../types';
import { applyStatMod } from './stats';
import type { EffectContext } from './context';
import { actor, target } from './context';

export function runTurnControlPrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  const state = ctx.state;
  const a = actor(ctx);

  switch (effect.kind) {
    case 'PRIORITY':
      // Declarative: read at order resolution, no runtime work here.
      return true;

    case 'SPEED_SWAP': {
      const t = target(ctx);
      const mine = a.stats.spd;
      a.stats.spd = t.stats.spd;
      t.stats.spd = mine;
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide, targetSide: ctx.targetSide,
        text: `${a.name} inverts the tempo — SPD exchanged.`,
      });
      return true;
    }

    case 'DELAY_TARGET':
      applyStatMod(ctx, ctx.targetSide, 'spd', -effect.percent, effect.duration);
      return true;

    case 'EXTRA_ACTION':
      a.extraActionPending = true;
      state.log.push({
        kind: 'extra_action', round: state.round, side: ctx.actorSide,
        text: `${a.name} cycles for an immediate second action.`,
      });
      return true;

    case 'COOLDOWN_RESET': {
      const count = effect.count ?? 99;
      let reset = 0;
      for (const id of a.skills) {
        if (reset >= count) break;
        if (a.cooldowns[id] > 0) {
          a.cooldowns[id] = 0;
          reset++;
        }
      }
      state.log.push({
        kind: 'cooldown_reset', round: state.round, side: ctx.actorSide, amount: reset,
        text: reset > 0 ? `${a.name} flushes ${reset} cooldown${reset > 1 ? 's' : ''}.` : `${a.name} has nothing to reset.`,
      });
      return true;
    }

    case 'CHARGE':
      // Skip this turn; the next use of this skill lands amplified.
      a.charging = { skillId: ctx.skill.id, multiplier: effect.multiplier };
      state.log.push({
        kind: 'charge', round: state.round, side: ctx.actorSide,
        text: `${a.name} charges ${ctx.skill.name}.`,
      });
      return true;

    default:
      return false;
  }
}
