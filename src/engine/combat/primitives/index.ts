/* The primitive dispatcher. Every skill effect in the game routes
   through here. There is no path from a hero id to bespoke behaviour —
   §0.2 depends on that staying true. */

import type { SkillEffect } from '../../types';
import type { EffectContext } from './context';
import { registerRunner } from './context';
import { runDamagePrimitive } from './damage';
import { runDefensivePrimitive } from './defensive';
import { runFieldPrimitive } from './field';
import { runResourcePrimitive } from './resource';
import { runStatsPrimitive } from './stats';
import { runStatusPrimitive } from './status';
import { runTriggerPrimitive } from './triggers';
import { runTurnControlPrimitive } from './turnControl';

const FAMILIES = [
  runDamagePrimitive,
  runStatusPrimitive,
  runStatsPrimitive,
  runDefensivePrimitive,
  runTurnControlPrimitive,
  runFieldPrimitive,
  runResourcePrimitive,
  runTriggerPrimitive,
];

export function applyEffect(ctx: EffectContext, effect: SkillEffect): void {
  for (const family of FAMILIES) {
    if (family(ctx, effect)) return;
  }
  throw new Error(`Unhandled skill primitive: ${(effect as { kind: string }).kind}`);
}

export function runEffectList(ctx: EffectContext, effects: SkillEffect[]): void {
  // ARMOR_PIERCE and CHARGE-style modifiers must land before the damage
  // they modify, so modifier effects are hoisted ahead of the rest.
  const modifiers = effects.filter((e) => e.kind === 'ARMOR_PIERCE');
  const rest = effects.filter((e) => e.kind !== 'ARMOR_PIERCE');
  for (const e of modifiers) applyEffect(ctx, e);
  for (const e of rest) {
    if (ctx.state.outcome !== 'active') break;
    applyEffect(ctx, e);
  }
}

registerRunner(runEffectList);

export type { EffectContext } from './context';
