/* §8 Field primitives. */

import type { SkillEffect } from '../../types';
import { FIELDS } from '../../../data/fields';
import { matchesField, setField } from '../field';
import type { EffectContext } from './context';
import { actor, dealDamage } from './context';

export function runFieldPrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  const state = ctx.state;

  switch (effect.kind) {
    case 'SET_FIELD':
      setField(state, effect.field, ctx.actorSide);
      return true;

    case 'CLEAR_FIELD':
      setField(state, null, ctx.actorSide);
      return true;

    case 'FIELD_IMMUNITY': {
      const a = actor(ctx);
      a.fieldImmuneTurns = Math.max(a.fieldImmuneTurns, effect.duration);
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${a.name} seals against ${state.field ? FIELDS[state.field].name : 'ambient conditions'} for ${effect.duration}.`,
      });
      return true;
    }

    case 'SCALE_WITH_FIELD':
      dealDamage(ctx, matchesField(state, effect.field) ? effect.scaledPower : effect.power);
      return true;

    default:
      return false;
  }
}
