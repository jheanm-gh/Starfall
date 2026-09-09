/* §8 Status primitives. */

import type { SkillEffect } from '../../types';
import { STATUSES, isDebuff } from '../../../data/statuses';
import type { EffectContext } from './context';
import { actor, dealDamage, target } from './context';
import { removeStatus, tryApplyStatus } from '../statuses';

export function runStatusPrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  const state = ctx.state;

  switch (effect.kind) {
    case 'APPLY_STATUS': {
      const toSelf = effect.target === 'self' || STATUSES[effect.status].kind === 'self-buff';
      tryApplyStatus(
        state,
        ctx.actorSide,
        toSelf ? ctx.actorSide : ctx.targetSide,
        effect.status,
        effect.baseChance,
        { stacks: effect.stacks, duration: effect.duration, guaranteed: toSelf },
      );
      return true;
    }

    case 'CLEANSE_SELF': {
      const a = actor(ctx);
      const debuffs = a.statuses.filter((s) => isDebuff(s.id));
      const count = effect.count ?? debuffs.length;
      for (const st of debuffs.slice(0, count)) {
        removeStatus(state, ctx.actorSide, st.id);
        state.log.push({
          kind: 'status_expired', round: state.round, side: ctx.actorSide, statusId: st.id,
          text: `${a.name} purges ${STATUSES[st.id].name}.`,
        });
      }
      return true;
    }

    case 'TRANSFER_STATUS': {
      const a = actor(ctx);
      const debuffs = a.statuses.filter((s) => isDebuff(s.id));
      const count = effect.count ?? 1;
      for (const st of debuffs.slice(0, count)) {
        removeStatus(state, ctx.actorSide, st.id);
        tryApplyStatus(state, ctx.actorSide, ctx.targetSide, st.id, 1, {
          stacks: st.stacks, duration: st.turnsLeft, guaranteed: true,
        });
        state.log.push({
          kind: 'note', round: state.round, side: ctx.actorSide, targetSide: ctx.targetSide, statusId: st.id,
          text: `${a.name} vents ${STATUSES[st.id].name} onto ${target(ctx).name}.`,
        });
      }
      return true;
    }

    case 'EXTEND_STATUS': {
      const side = effect.target === 'self' ? ctx.actorSide : ctx.targetSide;
      const c = state[side];
      // Extending your own states means buffs; extending theirs means debuffs.
      const wanted = side === ctx.actorSide ? (id: typeof c.statuses[number]['id']) => !isDebuff(id) : (id: typeof c.statuses[number]['id']) => isDebuff(id);
      let extended = 0;
      for (const st of c.statuses) {
        if (wanted(st.id)) {
          st.turnsLeft += effect.turns;
          extended++;
        }
      }
      if (extended > 0) {
        state.log.push({
          kind: 'note', round: state.round, side: ctx.actorSide, targetSide: side,
          text: `${c.name}: ${extended} state${extended > 1 ? 's' : ''} held for ${effect.turns} more turn${effect.turns > 1 ? 's' : ''}.`,
        });
      }
      return true;
    }

    case 'CONSUME_STATUS': {
      const t = target(ctx);
      const st = t.statuses.find((s) => s.id === effect.status);
      if (!st) return true;
      const stacks = st.stacks;
      removeStatus(state, ctx.targetSide, effect.status);
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide, targetSide: ctx.targetSide, statusId: effect.status,
        text: `${STATUSES[effect.status].name} detonates on ${t.name}.`,
      });
      dealDamage(ctx, effect.damagePerStack * stacks, { guaranteed: true });
      return true;
    }

    default:
      return false;
  }
}
