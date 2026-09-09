/* §5.3 damage formula, plus everything that sits between a computed
   number and a combatant's HULL: shields, Mark, damage reduction, the
   Derelict Hulk opener, reflect, counters and death. */

import type { Combatant, CombatState, DamageType, FieldId, Side } from '../types';
import { DAMAGE } from '../../data/balance';
import { FIELDS } from '../../data/fields';
import { RACES } from '../../data/races';
import { BLIND_ACCURACY_PENALTY, MARK_DAMAGE_BONUS } from '../../data/statuses';
import { roll, rollChance, rollRange } from '../rng';
import { effectiveStat } from './stats';

/** §5.4 — vulnerability is a property of the defender's race. */
export function typeMultiplier(defender: Combatant, type: DamageType): number {
  const race = RACES[defender.race];
  if (race.resists === type) return DAMAGE.TYPE_RESIST_MULT;
  if (race.vulnerable === type) return DAMAGE.TYPE_VULNERABLE_MULT;
  return 1;
}

export function fieldDamageMultiplier(field: FieldId | null, type: DamageType, attacker: Combatant): number {
  if (!field || attacker.fieldImmuneTurns > 0) return 1;
  return FIELDS[field].damageMult?.[type] ?? 1;
}

export function critChance(attacker: Combatant, field: FieldId | null): number {
  const foc = effectiveStat(attacker, 'foc', field);
  let chance = foc / DAMAGE.CRIT_FOC_DIVISOR / 100;
  if (field && attacker.fieldImmuneTurns <= 0) {
    chance += FIELDS[field].critChanceDelta ?? 0;
  }
  return Math.max(0, Math.min(DAMAGE.CRIT_CHANCE_CAP, chance));
}

export function critMultiplier(defender: Combatant, field: FieldId | null): number {
  const res = effectiveStat(defender, 'res', field);
  return Math.max(DAMAGE.CRIT_MULT_FLOOR, DAMAGE.CRIT_MULT_BASE - res / DAMAGE.CRIT_RES_DIVISOR);
}

/** Chance for an attack to land at all. Accuracy is a skill/field/status concern. */
export function hitChance(
  attacker: Combatant,
  defender: Combatant,
  field: FieldId | null,
  skillAccuracy: number,
): number {
  let acc = DAMAGE.BASE_ACCURACY * skillAccuracy;
  if (attacker.statuses.some((s) => s.id === 'blind')) acc -= BLIND_ACCURACY_PENALTY;
  if (field) {
    const def = FIELDS[field];
    if (attacker.fieldImmuneTurns <= 0) acc += def.accuracyDelta ?? 0;
    if (defender.fieldImmuneTurns <= 0) acc -= def.evasionDelta ?? 0;
  }
  return Math.max(DAMAGE.ACCURACY_FLOOR, Math.min(1, acc));
}

export interface DamageInput {
  attacker: Combatant;
  defender: Combatant;
  /** Skill power scalar. 1.0 is "one full ATK-weighted hit". */
  power: number;
  type: DamageType;
  field: FieldId | null;
  /** Fraction of DEF ignored, 0..1. */
  pierce: number;
  /** Skips DEF and type/field multipliers entirely (fixed and bleed damage). */
  flat?: number;
  ignoresDef?: boolean;
  canCrit?: boolean;
  seed: number;
  cursor: number;
}

export interface DamageResult {
  amount: number;
  crit: boolean;
  cursor: number;
}

/** The raw number before the defender's situational reductions. */
export function computeDamage(input: DamageInput): DamageResult {
  const { attacker, defender, field, seed } = input;
  let cursor = input.cursor;

  let base: number;
  if (input.flat !== undefined) {
    base = input.flat;
  } else {
    const def = effectiveStat(defender, 'def', field);
    const effectiveDef = input.ignoresDef ? 0 : def * (1 - Math.max(0, Math.min(1, input.pierce)));
    const mitigation = DAMAGE.MITIGATION_K / (DAMAGE.MITIGATION_K + effectiveDef);
    const atk = effectiveStat(attacker, 'atk', field);
    base = input.power * atk * mitigation;
  }

  if (input.flat === undefined) {
    base *= typeMultiplier(defender, input.type);
    base *= fieldDamageMultiplier(field, input.type, attacker);
  }

  let crit = false;
  if (input.canCrit !== false && input.flat === undefined) {
    const c = rollChance(seed, cursor, critChance(attacker, field));
    cursor = c.cursor;
    crit = c.value;
    if (crit) base *= critMultiplier(defender, field);
  }

  const v = rollRange(seed, cursor, DAMAGE.VARIANCE_MIN, DAMAGE.VARIANCE_MAX);
  cursor = v.cursor;
  base *= v.value;

  return { amount: Math.max(DAMAGE.MIN_DAMAGE, Math.round(base)), crit, cursor };
}

export interface ApplyDamageResult {
  dealt: number;
  absorbed: number;
  killed: boolean;
  cursor: number;
}

/**
 * Puts a computed number onto a combatant, running every defensive layer
 * in a fixed order: Mark, damage reduction, Derelict Hulk opener, shield,
 * then HULL. Reflect and counter hooks are raised by the caller.
 */
export function applyDamage(
  state: CombatState,
  defenderSide: Side,
  amount: number,
  opts: { ignoresShield?: boolean; isTick?: boolean } = {},
): ApplyDamageResult {
  const defender = state[defenderSide];
  let value = amount;

  if (defender.statuses.some((s) => s.id === 'mark')) value *= 1 + MARK_DAMAGE_BONUS;
  if (defender.damageReduction && defender.damageReduction.turnsLeft > 0) {
    value *= 1 - defender.damageReduction.percent;
  }

  // Derelict Hulk: the first incoming hit each combat is halved.
  if (!opts.isTick && !defender.tookFirstHit && state.field && defender.fieldImmuneTurns <= 0) {
    const reduction = FIELDS[state.field].firstHitReduction;
    if (reduction) value *= 1 - reduction;
  }
  if (!opts.isTick) defender.tookFirstHit = true;

  value = Math.max(DAMAGE.MIN_DAMAGE, Math.round(value));

  let absorbed = 0;
  if (!opts.ignoresShield && defender.shield > 0) {
    absorbed = Math.min(defender.shield, value);
    defender.shield -= absorbed;
    value -= absorbed;
  }

  const before = defender.hull;
  defender.hull = Math.max(0, defender.hull - value);
  const dealt = before - defender.hull;

  let killed = false;
  if (defender.hull <= 0) {
    // T4 Prototype chassis: survive one lethal hit at 1 HULL, once per combat.
    if (defender.traits.includes('survive_lethal') && !defender.usedSurviveLethal) {
      defender.usedSurviveLethal = true;
      defender.hull = 1;
      state.log.push({
        kind: 'note', round: state.round, side: defenderSide,
        text: `${defender.name} holds at 1 HULL — prototype chassis integrity.`,
      });
    } else {
      killed = true;
    }
  }

  return { dealt: dealt + absorbed, absorbed, killed, cursor: state.cursor };
}

/** Rolls a hit check and advances the cursor. */
export function rollHit(
  state: CombatState,
  attacker: Combatant,
  defender: Combatant,
  skillAccuracy: number,
): boolean {
  const chance = hitChance(attacker, defender, state.field, skillAccuracy);
  const r = roll(state.seed, state.cursor);
  state.cursor = r.cursor;
  return r.value < chance;
}
