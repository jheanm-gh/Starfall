/* §6 — status effects. Every value here is tuning data, not logic. */

import type { StatusDefinition, StatusId } from '../engine/types';

export const STATUSES: Record<StatusId, StatusDefinition> = {
  burn: {
    id: 'burn', name: 'Burn', kind: 'debuff', duration: 3, maxStacks: 2,
    tickPercentMaxHull: 0.05, tickDamageType: 'thermal',
    description: 'Loses 5% max HULL per turn as thermal damage.',
  },
  corrode: {
    id: 'corrode', name: 'Corrode', kind: 'debuff', duration: 3, maxStacks: 2,
    description: 'DEF reduced 25% per stack.',
  },
  hemorrhage: {
    id: 'hemorrhage', name: 'Hemorrhage', kind: 'debuff', duration: 2, maxStacks: 1,
    tickPercentMaxHull: 0.07, tickIgnoresDef: true,
    description: 'Loses 7% max HULL per turn, ignoring DEF.',
  },
  irradiate: {
    id: 'irradiate', name: 'Irradiate', kind: 'debuff', duration: 4, maxStacks: 1,
    tickPercentMaxHull: 0.02, tickRampPercent: 0.02,
    description: 'Loses 2% max HULL per turn, growing 2% each turn.',
  },
  stun: {
    id: 'stun', name: 'Stun', kind: 'debuff', duration: 1, maxStacks: 1,
    description: 'Loses the next turn.',
  },
  jam: {
    id: 'jam', name: 'Jam', kind: 'debuff', duration: 2, maxStacks: 1,
    description: 'Highest-cooldown skill is locked.',
  },
  blind: {
    id: 'blind', name: 'Blind', kind: 'debuff', duration: 2, maxStacks: 1,
    description: 'Accuracy reduced 30%.',
  },
  suppress: {
    id: 'suppress', name: 'Suppress', kind: 'debuff', duration: 3, maxStacks: 1,
    description: 'Cannot gain buffs.',
  },
  mark: {
    id: 'mark', name: 'Mark', kind: 'debuff', duration: 2, maxStacks: 1,
    description: 'Takes 20% more damage.',
  },
  static: {
    id: 'static', name: 'Static', kind: 'debuff', duration: 3, maxStacks: 1,
    description: '25% chance to lose each turn.',
  },
  overclock: {
    id: 'overclock', name: 'Overclock', kind: 'self-buff', duration: 3, maxStacks: 1,
    tickPercentMaxHull: 0.04, tickIgnoresDef: true,
    description: 'SPD +40%, loses 4% max HULL per turn.',
  },
  bulwark: {
    id: 'bulwark', name: 'Bulwark', kind: 'self-buff', duration: 3, maxStacks: 1,
    description: 'DEF +30%, SPD -15%.',
  },
};

/** Stat consequences of statuses, read by stat resolution. */
export const STATUS_STAT_EFFECTS: Partial<Record<StatusId, { stat: 'def' | 'spd'; perStack: number }[]>> = {
  corrode: [{ stat: 'def', perStack: -0.25 }],
  overclock: [{ stat: 'spd', perStack: 0.4 }],
  bulwark: [{ stat: 'def', perStack: 0.3 }, { stat: 'spd', perStack: -0.15 }],
};

export const BLIND_ACCURACY_PENALTY = 0.3;
export const MARK_DAMAGE_BONUS = 0.2;
export const STATIC_SKIP_CHANCE = 0.25;

export const STATUS_LIST: StatusDefinition[] = Object.values(STATUSES);

export function isDebuff(id: StatusId): boolean {
  return STATUSES[id].kind === 'debuff';
}
