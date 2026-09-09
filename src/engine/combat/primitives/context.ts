/* Shared execution context for every skill primitive.

   Primitives never read combat rules directly — they call the helpers
   here, so hit checks, dodges, triggers, counters, reflect and death all
   behave identically no matter which primitive dealt the damage. */

import type { CombatState, DamageType, Side, SkillDefinition, SkillEffect } from '../../types';
import { applyDamage, computeDamage, rollHit } from '../damage';
import { healMultiplier } from '../field';
import { killCombatant, tryApplyStatus } from '../statuses';
import { fieldAppliesBurnOnThermal } from '../field';
import { rollChance } from '../../rng';

export interface EffectContext {
  state: CombatState;
  actorSide: Side;
  targetSide: Side;
  skill: SkillDefinition;
  /** Accumulated ARMOR_PIERCE for the current skill. */
  pierce: number;
  /** Multiplier from CHARGE / SPEND_CHARGE, applied to every power in the skill. */
  powerMult: number;
  totalDamage: number;
  anyHit: boolean;
  killedTarget: boolean;
  /** Recursion guard for trigger-spawned effects. */
  depth: number;
}

/* Late binding: triggers need to run nested effect lists, but the
   dispatcher imports every family. This breaks the cycle. */
type Runner = (ctx: EffectContext, effects: SkillEffect[]) => void;
let runner: Runner | null = null;
export function registerRunner(fn: Runner): void {
  runner = fn;
}
export function runEffects(ctx: EffectContext, effects: SkillEffect[]): void {
  if (!runner) throw new Error('effect runner not registered');
  runner(ctx, effects);
}

export function actor(ctx: EffectContext) {
  return ctx.state[ctx.actorSide];
}
export function target(ctx: EffectContext) {
  return ctx.state[ctx.targetSide];
}
export function other(side: Side): Side {
  return side === 'player' ? 'enemy' : 'player';
}

export interface DealOptions {
  /** Skip the accuracy roll — DoT detonations and fixed damage always land. */
  guaranteed?: boolean;
  ignoresShield?: boolean;
  ignoresDef?: boolean;
  canCrit?: boolean;
  /** Pre-mitigation flat number instead of a power scalar. */
  flat?: number;
  type?: DamageType;
  /** Suppresses ON_HIT / counter / reflect — used by recoil and self-damage. */
  silentHooks?: boolean;
  toSide?: Side;
}

/**
 * The single path by which one combatant damages another.
 * Returns the HULL actually removed (0 on a miss or dodge).
 */
export function dealDamage(ctx: EffectContext, power: number, opts: DealOptions = {}): number {
  const state = ctx.state;
  const defenderSide = opts.toSide ?? ctx.targetSide;
  const attackerSide = defenderSide === ctx.actorSide ? other(ctx.actorSide) : ctx.actorSide;
  const attacker = state[ctx.actorSide];
  const defender = state[defenderSide];
  const type = opts.type ?? ctx.skill.type;

  if (!defender.alive) return 0;

  const selfInflicted = defenderSide === ctx.actorSide;

  if (!selfInflicted && !opts.guaranteed) {
    if (defender.dodgeNext) {
      defender.dodgeNext = false;
      state.log.push({
        kind: 'dodge', round: state.round, side: attackerSide, targetSide: defenderSide,
        text: `${defender.name} phases clear of ${ctx.skill.name}.`,
      });
      return 0;
    }
    if (!rollHit(state, attacker, defender, ctx.skill.accuracy ?? 1)) {
      state.log.push({
        kind: 'miss', round: state.round, side: attackerSide, targetSide: defenderSide, skillId: ctx.skill.id,
        text: `${ctx.skill.name} misses ${defender.name}.`,
      });
      return 0;
    }
  }

  const computed = computeDamage({
    attacker: selfInflicted ? attacker : attacker,
    defender,
    power: power * ctx.powerMult,
    type,
    field: state.field,
    pierce: ctx.pierce,
    flat: opts.flat,
    ignoresDef: opts.ignoresDef,
    canCrit: opts.canCrit !== false && !selfInflicted,
    seed: state.seed,
    cursor: state.cursor,
  });
  state.cursor = computed.cursor;

  const applied = applyDamage(state, defenderSide, computed.amount, { ignoresShield: opts.ignoresShield });

  state.log.push({
    kind: computed.crit ? 'crit' : 'damage',
    round: state.round,
    side: selfInflicted ? defenderSide : attackerSide,
    targetSide: defenderSide,
    skillId: ctx.skill.id,
    amount: applied.dealt,
    crit: computed.crit,
    text: selfInflicted
      ? `${defender.name} takes ${applied.dealt} recoil.`
      : `${ctx.skill.name} hits ${defender.name} for ${applied.dealt}${computed.crit ? ' — critical' : ''}.`,
  });

  if (!selfInflicted) {
    ctx.totalDamage += applied.dealt;
    ctx.anyHit = true;
  }

  // Thermal Bloom: every thermal hit applies Burn.
  if (!selfInflicted && type === 'thermal' && fieldAppliesBurnOnThermal(state, attackerSide)) {
    tryApplyStatus(state, attackerSide, defenderSide, 'burn', 1, { guaranteed: true });
  }

  if (!opts.silentHooks && !selfInflicted && applied.dealt > 0) {
    fireTriggers(ctx, attackerSide, 'ON_HIT');
    if (defender.alive && defender.hull > 0) {
      fireTriggers(ctx, defenderSide, 'ON_TAKE_DAMAGE');
      applyReflectAndCounter(ctx, defenderSide, attackerSide, applied.dealt);
    }
  }

  if (applied.killed) {
    handleDeath(ctx, defenderSide, attackerSide);
  }

  return applied.dealt;
}

function applyReflectAndCounter(ctx: EffectContext, defenderSide: Side, attackerSide: Side, dealt: number): void {
  const state = ctx.state;
  const defender = state[defenderSide];

  if (defender.reflect && defender.reflect.turnsLeft > 0) {
    const back = Math.max(1, Math.round(dealt * defender.reflect.percent));
    const res = applyDamage(state, attackerSide, back, { isTick: true });
    state.log.push({
      kind: 'reflect', round: state.round, side: defenderSide, targetSide: attackerSide, amount: res.dealt,
      text: `${defender.name} reflects ${res.dealt} back.`,
    });
    if (res.killed) killCombatant(state, attackerSide, `${state[attackerSide].name} falls to reflected damage.`);
  }

  if (defender.counterStance && defender.counterStance.turnsLeft > 0 && state[attackerSide].alive) {
    const counterCtx: EffectContext = {
      ...ctx,
      actorSide: defenderSide,
      targetSide: attackerSide,
      pierce: 0,
      depth: ctx.depth + 1,
    };
    if (counterCtx.depth < 4) {
      const dmg = dealDamage(counterCtx, defender.counterStance.percent, {
        guaranteed: true, silentHooks: true, type: defender.damageType, canCrit: false,
      });
      state.log.push({
        kind: 'counter', round: state.round, side: defenderSide, targetSide: attackerSide, amount: dmg,
        text: `${defender.name} counters for ${dmg}.`,
      });
    }
  }
}

export function handleDeath(ctx: EffectContext, deadSide: Side, killerSide: Side): void {
  const state = ctx.state;
  const dead = state[deadSide];

  // REVIVE_SELF is registered as a one-shot on the combatant, not a status.
  if (dead.usedReviveSelf === false && dead.reviveOnDeath !== undefined && dead.reviveOnDeath > 0) {
    dead.usedReviveSelf = true;
    dead.hull = Math.max(1, Math.round(dead.maxHull * dead.reviveOnDeath));
    dead.statuses = [];
    state.log.push({
      kind: 'revive', round: state.round, side: deadSide, amount: dead.hull,
      text: `${dead.name} reboots at ${dead.hull} HULL.`,
    });
    return;
  }

  killCombatant(state, deadSide, `${dead.name} is destroyed.`);
  if (deadSide === ctx.targetSide) ctx.killedTarget = true;

  if (state[killerSide].alive) {
    fireTriggers(ctx, killerSide, 'ON_KILL');
    // T3 Refit chassis: regain one cooldown on kill.
    if (state[killerSide].traits.includes('cooldown_on_kill')) {
      const killer = state[killerSide];
      for (const id of killer.skills) {
        if (killer.cooldowns[id] > 0) {
          killer.cooldowns[id] = 0;
          state.log.push({
            kind: 'cooldown_reset', round: state.round, side: killerSide, skillId: id,
            text: `${killer.name} recycles a system on the kill.`,
          });
          break;
        }
      }
    }
  }
}

export function fireTriggers(ctx: EffectContext, side: Side, on: 'ON_KILL' | 'ON_HIT' | 'ON_TAKE_DAMAGE'): void {
  if (ctx.depth >= 3) return;
  const state = ctx.state;
  const c = state[side];
  for (const hook of c.triggers) {
    if (hook.on !== on) continue;
    if (hook.chance < 1) {
      const r = rollChance(state.seed, state.cursor, hook.chance);
      state.cursor = r.cursor;
      if (!r.value) continue;
    }
    const hookCtx: EffectContext = {
      state,
      actorSide: side,
      targetSide: other(side),
      skill: { id: hook.sourceSkill, name: hook.sourceSkill, type: c.damageType, cooldown: 0, priority: 0, effects: [], description: '' },
      pierce: 0,
      powerMult: 1,
      totalDamage: 0,
      anyHit: false,
      killedTarget: false,
      depth: ctx.depth + 1,
    };
    runEffects(hookCtx, hook.effects);
  }
}

export function healSide(ctx: EffectContext, side: Side, amount: number, label: string): number {
  const state = ctx.state;
  const c = state[side];
  if (!c.alive) return 0;
  const mult = healMultiplier(state, side);
  const healed = Math.round(amount * mult);
  if (healed <= 0) {
    state.log.push({
      kind: 'note', round: state.round, side,
      text: `${label} does nothing — repair is impossible here.`,
    });
    return 0;
  }
  const before = c.hull;
  c.hull = Math.min(c.maxHull, c.hull + healed);
  const gained = c.hull - before;
  state.log.push({
    kind: 'heal', round: state.round, side, amount: gained,
    text: `${c.name} repairs ${gained} HULL.`,
  });
  return gained;
}

export function shieldSide(ctx: EffectContext, side: Side, amount: number): number {
  const state = ctx.state;
  const c = state[side];
  if (!c.alive || amount <= 0) return 0;
  c.shield += Math.round(amount);
  state.log.push({
    kind: 'shield', round: state.round, side, amount: Math.round(amount),
    text: `${c.name} raises ${Math.round(amount)} shielding.`,
  });
  return Math.round(amount);
}
