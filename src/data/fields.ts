/* §11 — environmental conditions. One per sector, alterable by SET_FIELD. */

import type { FieldDefinition, FieldId } from '../engine/types';

export const FIELDS: Record<FieldId, FieldDefinition> = {
  ion_storm: {
    id: 'ion_storm', name: 'Ion Storm',
    description: 'EM damage x1.25. Accuracy -15% for both sides.',
    damageMult: { em: 1.25 }, accuracyDelta: -0.15,
  },
  hard_vacuum: {
    id: 'hard_vacuum', name: 'Hard Vacuum',
    description: 'Damage over time doubled. Healing halved.',
    dotMult: 2, healMult: 0.5,
  },
  high_gravity: {
    id: 'high_gravity', name: 'High Gravity',
    description: 'All SPD -20%. Kinetic damage x1.2.',
    statMult: { spd: 0.8 }, damageMult: { kinetic: 1.2 },
  },
  nebula_haze: {
    id: 'nebula_haze', name: 'Nebula Haze',
    description: 'Evasion +15%. FOC -20%.',
    evasionDelta: 0.15, statMult: { foc: 0.8 },
  },
  radiation_belt: {
    id: 'radiation_belt', name: 'Radiation Belt',
    description: 'Both combatants lose 3% max HULL per turn.',
    attritionPercent: 0.03,
  },
  null_field: {
    id: 'null_field', name: 'Null Field',
    description: 'No buffs or debuffs can be applied by anyone.',
    blocksStatuses: true,
  },
  magnetar_wake: {
    id: 'magnetar_wake', name: 'Magnetar Wake',
    description: 'Critical chance +15%. DEF -15%.',
    critChanceDelta: 0.15, statMult: { def: 0.85 },
  },
  thermal_bloom: {
    id: 'thermal_bloom', name: 'Thermal Bloom',
    description: 'Every thermal hit applies Burn.',
    thermalAppliesBurn: true,
  },
  derelict_hulk: {
    id: 'derelict_hulk', name: 'Derelict Hulk',
    description: 'The first incoming hit each combat is reduced 50%.',
    firstHitReduction: 0.5,
  },
  solar_flare: {
    id: 'solar_flare', name: 'Solar Flare',
    description: 'Healing disabled. Thermal damage x1.3.',
    healMult: 0, damageMult: { thermal: 1.3 },
  },
};

export const FIELD_LIST: FieldDefinition[] = Object.values(FIELDS);
