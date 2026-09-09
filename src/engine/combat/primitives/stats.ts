/* §8 Stat primitives. */

import type { SkillEffect, Side, StatKey } from '../../types';
import { fieldBlocksStatuses } from '../field';
import type { EffectContext } from './context';
import { actor, target } from './context';

const STAT_LABEL: Record<StatKey, string> = {
  hull: 'HULL', atk: 'ATK', def: 'DEF', spd: 'SPD', foc: 'FOC', res: 'RES',
};

/** Buffs are blocked by Suppress and by the Null Field, exactly like statuses. */
function canGainBuff(ctx: EffectContext, side: Side): boolean {
  if (fieldBlocksStatuses(ctx.state)) return false;
  return !ctx.state[side].statuses.some((s) => s.id === 'suppress');
}

function canReceiveDebuff(ctx: EffectContext, side: Side): boolean {
  if (fieldBlocksStatuses(ctx.state)) return false;
  return ctx.state[side].debuffImmuneTurns <= 0;
}

export function applyStatMod(ctx: EffectContext, side: Side, stat: StatKey, percent: number, duration: number): boolean {
  const positive = percent >= 0;
  if (positive && !canGainBuff(ctx, side)) {
    ctx.state.log.push({
      kind: 'status_resisted', round: ctx.state.round, targetSide: side,
      text: `${ctx.state[side].name} cannot be reinforced here.`,
    });
    return false;
  }
  if (!positive && !canReceiveDebuff(ctx, side)) {
    ctx.state.log.push({
      kind: 'status_resisted', round: ctx.state.round, targetSide: side,
      text: `${ctx.state[side].name} shrugs off the degradation.`,
    });
    return false;
  }
  ctx.state[side].mods.push({ stat, percent, turnsLeft: duration, positive });
  ctx.state.log.push({
    kind: 'stat_modified', round: ctx.state.round, side: ctx.actorSide, targetSide: side, amount: percent,
    text: `${ctx.state[side].name} ${STAT_LABEL[stat]} ${percent >= 0 ? '+' : ''}${Math.round(percent * 100)}% for ${duration}.`,
  });
  return true;
}

export function runStatsPrimitive(ctx: EffectContext, effect: SkillEffect): boolean {
  const state = ctx.state;

  switch (effect.kind) {
    case 'STAT_MODIFY': {
      const side = effect.target === 'self' ? ctx.actorSide : ctx.targetSide;
      applyStatMod(ctx, side, effect.stat, effect.percent, effect.duration);
      return true;
    }

    case 'STAT_STEAL': {
      // Symmetric: the target loses what the actor gains, for the same duration.
      const took = applyStatMod(ctx, ctx.targetSide, effect.stat, -effect.percent, effect.duration);
      if (took) applyStatMod(ctx, ctx.actorSide, effect.stat, effect.percent, effect.duration);
      return true;
    }

    case 'BUFF_STRIP': {
      const t = target(ctx);
      const count = effect.count ?? 99;
      let stripped = 0;
      t.mods = t.mods.filter((m) => {
        if (m.positive && stripped < count) {
          stripped++;
          return false;
        }
        return true;
      });
      // Self-buff statuses count as buffs for stripping purposes.
      t.statuses = t.statuses.filter((s) => {
        if ((s.id === 'overclock' || s.id === 'bulwark') && stripped < count) {
          stripped++;
          return false;
        }
        return true;
      });
      state.log.push({
        kind: 'buff_stripped', round: state.round, side: ctx.actorSide, targetSide: ctx.targetSide, amount: stripped,
        text: stripped > 0 ? `${t.name} loses ${stripped} enhancement${stripped > 1 ? 's' : ''}.` : `${t.name} has nothing to strip.`,
      });
      return true;
    }

    case 'DEBUFF_IMMUNITY': {
      actor(ctx).debuffImmuneTurns = Math.max(actor(ctx).debuffImmuneTurns, effect.duration);
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${actor(ctx).name} hardens against interference for ${effect.duration}.`,
      });
      return true;
    }

    case 'REFLECT': {
      actor(ctx).reflect = { percent: effect.percent, turnsLeft: effect.duration };
      state.log.push({
        kind: 'note', round: state.round, side: ctx.actorSide,
        text: `${actor(ctx).name} raises a reflective lattice (${Math.round(effect.percent * 100)}%).`,
      });
      return true;
    }

    default:
      return false;
  }
}
