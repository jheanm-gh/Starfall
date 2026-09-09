/* §7 — ten races. Resistance profiles are x0.75 / x1.25 (§5.4). */

import type { RaceDefinition, RaceId } from '../engine/types';

export const RACES: Record<RaceId, RaceDefinition> = {
  terran: {
    id: 'terran', name: 'Terran Directorate',
    identity: 'Versatile buff and utility. No bad matchup, and no free win either.',
    resists: null, vulnerable: null,
    palette: ['#5A5348', '#8E8577'],
  },
  vantari: {
    id: 'vantari', name: 'Vantari Hegemony',
    identity: 'High-gravity bulwarks. Enormous DEF, punishing SPD.',
    resists: 'kinetic', vulnerable: 'em',
    palette: ['#3E4A4E', '#6E7C7A'],
  },
  kelshar: {
    id: 'kelshar', name: "Kel'Shar Brood",
    identity: 'Eusocial arthropoids. Damage over time, sacrifice, attrition.',
    resists: 'corrosive', vulnerable: 'thermal',
    palette: ['#4A4326', '#7E7238'],
  },
  reclaimed: {
    id: 'reclaimed', name: 'The Reclaimed',
    identity: 'Salvaged cybernetics. Self-repair, revival, refusal to end.',
    resists: 'em', vulnerable: 'corrosive',
    palette: ['#3C3A38', '#7A6E5E'],
  },
  ithka: {
    id: 'ithka', name: "Ith'ka",
    identity: 'Vacuum-adapted. Extreme SPD, glass frames, priority strikes.',
    resists: 'psionic', vulnerable: 'kinetic',
    palette: ['#2F3A3E', '#5F7A80'],
  },
  meridian: {
    id: 'meridian', name: 'Meridian Combine',
    identity: 'Mercantile. Scales with Scrip, runes and gear.',
    resists: null, vulnerable: 'psionic',
    palette: ['#4E4326', '#9C8442'],
  },
  pyroclast: {
    id: 'pyroclast', name: 'Pyroclast Clans',
    identity: 'Silicate thermal-vent natives. Burn stacking, field synergy.',
    resists: 'thermal', vulnerable: 'corrosive',
    palette: ['#4A2A1E', '#94472A'],
  },
  umbral: {
    id: 'umbral', name: 'Umbral Drift',
    identity: 'Phase-shifters. Evasion, debuff, avoidance over armour.',
    resists: 'psionic', vulnerable: 'thermal',
    palette: ['#302E3A', '#5C566E'],
  },
  signal: {
    id: 'signal', name: 'The Signal',
    identity: 'Psionic collective. Control, turn manipulation, confusion.',
    resists: 'em', vulnerable: 'kinetic',
    palette: ['#3A3630', '#8C7A50'],
  },
  drenn: {
    id: 'drenn', name: 'Drenn Hullborn',
    identity: 'Industrial brutes. Armour-pierce, recoil, self-damage.',
    resists: 'kinetic', vulnerable: 'psionic',
    palette: ['#43362C', '#8A6244'],
  },
};

export const RACE_LIST: RaceDefinition[] = Object.values(RACES);
