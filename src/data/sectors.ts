/* §11 — ten sectors of thirty floors. Each is a star system with a biased
   environmental condition and an enemy pool.

   Null Field sits at sector 7 deliberately: by then a player's roster has
   converged on buff and debuff strategies, and one system that invalidates
   them forces a real roster decision rather than a habitual one. */

import type { SectorDefinition } from '../engine/types';

export const SECTORS: SectorDefinition[] = [
  {
    index: 0, id: 'kepler_reach', name: 'Kepler Reach', field: 'derelict_hulk',
    enemyRaces: ['terran', 'reclaimed'],
    description: 'Abandoned shipping lanes. Salvage crews, and whatever grew in the wrecks.',
  },
  {
    index: 1, id: 'tannhauser_drift', name: 'Tannhauser Drift', field: 'ion_storm',
    enemyRaces: ['terran', 'signal', 'reclaimed'],
    description: 'Permanent charge storm. Nothing here holds a clean signal for long.',
  },
  {
    index: 2, id: 'brood_shoals', name: 'The Brood Shoals', field: 'hard_vacuum',
    enemyRaces: ['kelshar', 'ithka'],
    description: 'A vacuum reef. The Kel’Shar seeded it and never left.',
  },
  {
    index: 3, id: 'vantar_deep', name: 'Vantar Deep', field: 'high_gravity',
    enemyRaces: ['vantari', 'drenn'],
    description: 'Crushing gravity well. The Hegemony built here because nobody else could.',
  },
  {
    index: 4, id: 'meridian_span', name: 'Meridian Span', field: 'nebula_haze',
    enemyRaces: ['meridian', 'umbral', 'terran'],
    description: 'A trade span in a dust cloud. Everything is for sale, nothing is clearly seen.',
  },
  {
    index: 5, id: 'cinder_gate', name: 'Cinder Gate', field: 'thermal_bloom',
    enemyRaces: ['pyroclast', 'drenn'],
    description: 'Vent fields under a dying star. The Clans call the heat weather.',
  },
  {
    index: 6, id: 'the_hush', name: 'The Hush', field: 'null_field',
    enemyRaces: ['signal', 'umbral', 'ithka'],
    description: 'No state persists here. Buffs, debuffs and certainty all fail equally.',
  },
  {
    index: 7, id: 'oxide_belt', name: 'Oxide Belt', field: 'radiation_belt',
    enemyRaces: ['kelshar', 'reclaimed', 'drenn'],
    description: 'A decaying reactor belt. Attrition is the local physics.',
  },
  {
    index: 8, id: 'magnetar_wake', name: 'Magnetar Wake', field: 'magnetar_wake',
    enemyRaces: ['vantari', 'signal', 'pyroclast'],
    description: 'The wake of a dead star. Everything hits harder and nothing holds together.',
  },
  {
    index: 9, id: 'starfall', name: 'Starfall', field: 'solar_flare',
    enemyRaces: ['umbral', 'ithka', 'meridian', 'terran'],
    description: 'The last approach. Flare-washed, unshielded, and nothing repairs out here.',
  },
];

export function sectorForFloor(floor: number): SectorDefinition {
  const index = Math.min(SECTORS.length - 1, Math.floor((floor - 1) / 30));
  return SECTORS[index];
}
