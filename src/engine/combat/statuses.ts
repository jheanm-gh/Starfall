/* §6 — status application, ticking and expiry. */

import type { ActiveStatus, CombatState, Side, StatusId } from '../types';
import { STATUS } from '../../data/balance';
import { FIELDS } from '../../data/fields';
import { STATUSES, isDebuff } from '../../data/statuses';
import { rollChance } from '../rng';
import { applyDamage } from './damage';
import { effectiveStat } from './stats';

export interface ApplyStatusOptions {
  stacks?: number;
  duration?: number;
  /** Skips the contested check — used by self-buffs and forced applications. */
  guaranteed?: boolean;
}

/**
 * Contested application (§6). Returns true if the status landed.
 * Self-buffs bypass the RES check entirely, as specified.
 */
export function tryApplyStatus(
  state: CombatState,
  sourceSide: Side,
  targetSide: Side,
  statusId: StatusId,
  baseChance: number,
  opts: ApplyStatusOptions = {},
): boolean {
  const def = STATUSES[statusId];
  const target = state[targetSide];
  const source = state[sourceSide];

  // Null Field: nothing may be applied by anyone.
  if (state.field && FIELDS[state.field].blocksStatuses) {
    state.log.push({
      kind: 'status_resisted', round: state.round, side: sourceSide, targetSide, statusId,
      text: `${def.name} fails — the null field permits no states.`,
    });
    return false;
  }

  const debuff = isDebuff(statusId);

  if (debuff && target.debuffImmuneTurns > 0) {
    state.log.push({
      kind: 'status_resisted', round: state.round, side: sourceSide, targetSide, statusId,
      text: `${target.name} is immune to ${def.name}.`,
    });
    return false;
  }

  // Suppress blocks incoming buffs, including self-applied ones.
  if (!debuff && target.statuses.some((s) => s.id === 'suppress')) {
    state.log.push({
      kind: 'status_resisted', round: state.round, side: sourceSide, targetSide, statusId,
      text: `${target.name} is suppressed and cannot gain ${def.name}.`,
    });
    return false;
  }

  let landed = opts.guaranteed || !debuff;

  // T2 Standard chassis: the first status applied each combat cannot be resisted.
  if (!landed && source.traits.includes('first_status_unresistable') && !source.usedFirstStatus) {
    source.usedFirstStatus = true;
    landed = true;
  }

  if (!landed) {
    const foc = effectiveStat(source, 'foc', state.field);
    const res = effectiveStat(target, 'res', state.field);
    const chance = Math.max(
      STATUS.CHANCE_FLOOR,
      Math.min(STATUS.CHANCE_CAP, baseChance * (1 + foc / STATUS.FOC_DIVISOR) * (1 - res / STATUS.RES_DIVISOR)),
    );
    const r = rollChance(state.seed, state.cursor, chance);
    state.cursor = r.cursor;
    landed = r.value;
  }

  if (!landed) {
    state.log.push({
      kind: 'status_resisted', round: state.round, side: sourceSide, targetSide, statusId,
      text: `${target.name} resists ${def.name}.`,
    });
    return false;
  }

  const stacks = opts.stacks ?? 1;
  const duration = opts.duration ?? def.duration;
  const existing = target.statuses.find((s) => s.id === statusId);

  if (existing) {
    existing.stacks = Math.min(def.maxStacks, existing.stacks + stacks);
    existing.turnsLeft = Math.max(existing.turnsLeft, duration);
  } else {
    target.statuses.push({
      id: statusId,
      stacks: Math.min(def.maxStacks, stacks),
      turnsLeft: duration,
      ticks: 0,
      source: sourceSide,
    });
  }

  state.log.push({
    kind: 'status_applied', round: state.round, side: sourceSide, targetSide, statusId,
    text: `${target.name} gains ${def.name}${def.maxStacks > 1 ? ` (${target.statuses.find((s) => s.id === statusId)!.stacks})` : ''}.`,
  });
  return true;
}

export function removeStatus(state: CombatState, side: Side, statusId: StatusId): ActiveStatus | null {
  const c = state[side];
  const idx = c.statuses.findIndex((s) => s.id === statusId);
  if (idx === -1) return null;
  const [removed] = c.statuses.splice(idx, 1);
  return removed;
}

export function hasStatus(state: CombatState, side: Side, statusId: StatusId): boolean {
  return state[side].statuses.some((s) => s.id === statusId);
}

/**
 * End-of-turn tick for one combatant (§6: ticks at the end of the
 * afflicted hero's own turn). Handles DoT, ramping, regen, field
 * attrition and expiry, in that order.
 */
export function tickEndOfTurn(state: CombatState, side: Side): void {
  const c = state[side];
  if (!c.alive) return;

  const fieldDef = state.field && c.fieldImmuneTurns <= 0 ? FIELDS[state.field] : null;
  const dotMult = fieldDef?.dotMult ?? 1;
  const healMult = fieldDef?.healMult ?? 1;

  for (const st of [...c.statuses]) {
    const def = STATUSES[st.id];
    if (def.tickPercentMaxHull) {
      const ramp = def.tickRampPercent ? def.tickRampPercent * st.ticks : 0;
      const pct = (def.tickPercentMaxHull + ramp) * st.stacks;
      const raw = Math.max(1, Math.round(c.maxHull * pct * dotMult));
      const res = applyDamage(state, side, raw, { isTick: true, ignoresShield: def.tickIgnoresDef });
      state.log.push({
        kind: 'status_tick', round: state.round, side, statusId: st.id, amount: res.dealt,
        text: `${c.name} takes ${res.dealt} from ${def.name}.`,
      });
      if (res.killed) {
        killCombatant(state, side, `${def.name} finishes ${c.name}.`);
        return;
      }
    }
    st.ticks += 1;
  }

  // Regen resolves after DoT so a hero can out-heal a light burn.
  if (c.regen && c.regen.turnsLeft > 0) {
    const heal = Math.round(c.maxHull * c.regen.percent * healMult);
    if (heal > 0) {
      const before = c.hull;
      c.hull = Math.min(c.maxHull, c.hull + heal);
      state.log.push({
        kind: 'heal', round: state.round, side, amount: c.hull - before,
        text: `${c.name} repairs ${c.hull - before} HULL.`,
      });
    }
    c.regen.turnsLeft -= 1;
    if (c.regen.turnsLeft <= 0) c.regen = null;
  }

  // Radiation Belt and friends: field attrition, unaffected by shields.
  if (fieldDef?.attritionPercent) {
    const raw = Math.max(1, Math.round(c.maxHull * fieldDef.attritionPercent));
    const res = applyDamage(state, side, raw, { isTick: true, ignoresShield: true });
    state.log.push({
      kind: 'status_tick', round: state.round, side, amount: res.dealt,
      text: `${c.name} loses ${res.dealt} to ${fieldDef.name}.`,
    });
    if (res.killed) {
      killCombatant(state, side, `${fieldDef.name} claims ${c.name}.`);
      return;
    }
  }

  expireTimers(state, side);
}

/** Decrements every duration attached to a combatant and logs expiries. */
export function expireTimers(state: CombatState, side: Side): void {
  const c = state[side];

  c.statuses = c.statuses.filter((st) => {
    st.turnsLeft -= 1;
    if (st.turnsLeft <= 0) {
      state.log.push({
        kind: 'status_expired', round: state.round, side, statusId: st.id,
        text: `${STATUSES[st.id].name} fades from ${c.name}.`,
      });
      return false;
    }
    return true;
  });

  c.mods = c.mods.filter((m) => {
    m.turnsLeft -= 1;
    return m.turnsLeft > 0;
  });

  if (c.damageReduction) {
    c.damageReduction.turnsLeft -= 1;
    if (c.damageReduction.turnsLeft <= 0) c.damageReduction = null;
  }
  if (c.counterStance) {
    c.counterStance.turnsLeft -= 1;
    if (c.counterStance.turnsLeft <= 0) c.counterStance = null;
  }
  if (c.reflect) {
    c.reflect.turnsLeft -= 1;
    if (c.reflect.turnsLeft <= 0) c.reflect = null;
  }
  if (c.debuffImmuneTurns > 0) c.debuffImmuneTurns -= 1;
  if (c.fieldImmuneTurns > 0) c.fieldImmuneTurns -= 1;

  for (const id of Object.keys(c.cooldowns)) {
    if (c.cooldowns[id] > 0) c.cooldowns[id] -= 1;
  }
}

export function killCombatant(state: CombatState, side: Side, text: string): void {
  const c = state[side];
  if (!c.alive) return;
  c.alive = false;
  c.hull = 0;
  state.log.push({ kind: 'death', round: state.round, side, text });
  state.outcome = side === 'player' ? 'defeat' : 'victory';
}
