/* Environmental condition helpers (§11). The field is a single value on
   combat state; every consumer reads it through these predicates so a
   FIELD_IMMUNITY hero is never accidentally affected. */

import type { CombatState, FieldId, Side } from '../types';
import { FIELDS } from '../../data/fields';

export function setField(state: CombatState, field: FieldId | null, bySide: Side | null): void {
  if (state.field === field) return;
  state.field = field;
  state.log.push({
    kind: 'field_changed', round: state.round, side: bySide ?? undefined, fieldId: field,
    text: field ? `Conditions shift: ${FIELDS[field].name}.` : 'Conditions clear.',
  });
}

export function fieldBlocksHealing(state: CombatState, side: Side): boolean {
  if (!state.field || state[side].fieldImmuneTurns > 0) return false;
  return FIELDS[state.field].healMult === 0;
}

export function healMultiplier(state: CombatState, side: Side): number {
  if (!state.field || state[side].fieldImmuneTurns > 0) return 1;
  return FIELDS[state.field].healMult ?? 1;
}

export function fieldAppliesBurnOnThermal(state: CombatState, side: Side): boolean {
  if (!state.field || state[side].fieldImmuneTurns > 0) return false;
  return FIELDS[state.field].thermalAppliesBurn === true;
}

export function fieldBlocksStatuses(state: CombatState): boolean {
  return !!state.field && FIELDS[state.field].blocksStatuses === true;
}

export function matchesField(state: CombatState, want: FieldId | FieldId[]): boolean {
  if (!state.field) return false;
  return Array.isArray(want) ? want.includes(state.field) : state.field === want;
}
