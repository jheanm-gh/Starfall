/* §9.3 — gear chassis.

   Chassis grant NO STATS. Their value is socket capacity plus a single
   non-numeric trait that changes how combat plays. This is the mechanism
   that keeps §0.3 true while still making permanent progression feel like
   something. */

import type { ChassisDefinition, ChassisTraitId, GearSlot } from '../engine/types';
import { GEAR } from './balance';

const TRAIT_TEXT: Record<ChassisTraitId, string> = {
  crit_pierce: 'Critical hits ignore 10% of DEF.',
  first_status_unresistable: 'The first status you apply each combat cannot be resisted.',
  cooldown_on_kill: 'Regain one cooldown on a kill.',
  survive_lethal: 'Survive one lethal hit at 1 HULL, once per combat.',
  opening_priority: 'Act first on the opening round, whatever the SPD gap.',
  dot_extend: 'Damage-over-time you apply lasts one turn longer.',
  shield_on_entry: 'Enter every combat with a shield worth 10% of maximum HULL.',
  counter_reflex: 'Permanently counter for 25% of damage taken.',
};

function chassis(
  id: string, name: string, slot: GearSlot, tier: 1 | 2 | 3 | 4, trait: ChassisTraitId,
): ChassisDefinition {
  return {
    id, name, slot, tier,
    sockets: GEAR.SOCKETS_BY_TIER[tier],
    trait,
    traitText: TRAIT_TEXT[trait],
    salvageCost: GEAR.CHASSIS_SALVAGE_COST[tier],
  };
}

export const CHASSIS_LIST: ChassisDefinition[] = [
  chassis('weapon_t1', 'Scavenged Mount', 'weapon', 1, 'crit_pierce'),
  chassis('weapon_t2', 'Standard Mount', 'weapon', 2, 'first_status_unresistable'),
  chassis('weapon_t3', 'Refit Mount', 'weapon', 3, 'cooldown_on_kill'),
  chassis('weapon_t4', 'Prototype Mount', 'weapon', 4, 'dot_extend'),

  chassis('plating_t1', 'Scavenged Plating', 'plating', 1, 'counter_reflex'),
  chassis('plating_t2', 'Standard Plating', 'plating', 2, 'shield_on_entry'),
  chassis('plating_t3', 'Refit Plating', 'plating', 3, 'shield_on_entry'),
  chassis('plating_t4', 'Prototype Plating', 'plating', 4, 'survive_lethal'),

  chassis('core_t1', 'Scavenged Core', 'core', 1, 'opening_priority'),
  chassis('core_t2', 'Standard Core', 'core', 2, 'cooldown_on_kill'),
  chassis('core_t3', 'Refit Core', 'core', 3, 'opening_priority'),
  chassis('core_t4', 'Prototype Core', 'core', 4, 'survive_lethal'),

  chassis('aux_t1', 'Scavenged Auxiliary', 'auxiliary', 1, 'dot_extend'),
  chassis('aux_t2', 'Standard Auxiliary', 'auxiliary', 2, 'first_status_unresistable'),
  chassis('aux_t3', 'Refit Auxiliary', 'auxiliary', 3, 'crit_pierce'),
  chassis('aux_t4', 'Prototype Auxiliary', 'auxiliary', 4, 'counter_reflex'),
];

export const CHASSIS: Record<string, ChassisDefinition> = Object.fromEntries(
  CHASSIS_LIST.map((c) => [c.id, c]),
);

/** The starting kit. T1 in every slot, granted on a new account. */
export const STARTER_CHASSIS: string[] = ['weapon_t1', 'plating_t1', 'core_t1', 'aux_t1'];

export function chassisForSlot(slot: GearSlot): ChassisDefinition[] {
  return CHASSIS_LIST.filter((c) => c.slot === slot);
}
