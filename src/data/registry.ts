/* The content registry. Race files register their heroes and skills here,
   so the engine has one lookup surface and content can be added by
   dropping in a file. */

import type { HeroDefinition, RaceId, SkillDefinition, SkillId } from '../engine/types';
import { TERRAN_HEROES, TERRAN_SKILLS } from './races/terran';
import { VANTARI_HEROES, VANTARI_SKILLS } from './races/vantari';
import { KELSHAR_HEROES, KELSHAR_SKILLS } from './races/kelshar';
import { RECLAIMED_HEROES, RECLAIMED_SKILLS } from './races/reclaimed';
import { ITHKA_HEROES, ITHKA_SKILLS } from './races/ithka';
import { MERIDIAN_HEROES, MERIDIAN_SKILLS } from './races/meridian';
import { PYROCLAST_HEROES, PYROCLAST_SKILLS } from './races/pyroclast';
import { UMBRAL_HEROES, UMBRAL_SKILLS } from './races/umbral';
import { SIGNAL_HEROES, SIGNAL_SKILLS } from './races/signal';
import { DRENN_HEROES, DRENN_SKILLS } from './races/drenn';

export const HERO_LIST: HeroDefinition[] = [
  ...TERRAN_HEROES, ...VANTARI_HEROES, ...KELSHAR_HEROES, ...RECLAIMED_HEROES, ...ITHKA_HEROES,
  ...MERIDIAN_HEROES, ...PYROCLAST_HEROES, ...UMBRAL_HEROES, ...SIGNAL_HEROES, ...DRENN_HEROES,
];

const ALL_SKILLS: SkillDefinition[] = [
  ...TERRAN_SKILLS, ...VANTARI_SKILLS, ...KELSHAR_SKILLS, ...RECLAIMED_SKILLS, ...ITHKA_SKILLS,
  ...MERIDIAN_SKILLS, ...PYROCLAST_SKILLS, ...UMBRAL_SKILLS, ...SIGNAL_SKILLS, ...DRENN_SKILLS,
];

export const HEROES: Record<string, HeroDefinition> = Object.fromEntries(
  HERO_LIST.map((h) => [h.id, h]),
);

export const SKILLS: Record<SkillId, SkillDefinition> = Object.fromEntries(
  ALL_SKILLS.map((s) => [s.id, s]),
);

export function getHero(id: string): HeroDefinition {
  const hero = HEROES[id];
  if (!hero) throw new Error(`Unknown hero definition: ${id}`);
  return hero;
}

export function getSkill(id: SkillId): SkillDefinition {
  const skill = SKILLS[id];
  if (!skill) throw new Error(`Unknown skill: ${id}`);
  return skill;
}

export function heroesByRace(race: RaceId): HeroDefinition[] {
  return HERO_LIST.filter((h) => h.race === race);
}

export const SKILL_LIST = ALL_SKILLS;
