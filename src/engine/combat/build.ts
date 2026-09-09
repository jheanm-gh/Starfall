/* Combatant construction. Everything that turns persistent and run data
   into the flat structure the engine works on happens here, so resolve.ts
   never has to know about ascension, gear or the Commander. */

import type {
  ChassisTraitId, Combatant, HeroDefinition, RuneEffect, Side, SkillId, StatKey,
} from '../types';
import { COMMANDER, HULL_SCALE, LEVELLING, STAT_SOFT_CAPS } from '../../data/balance';
import { getHero } from '../../data/registry';

export interface CombatantSpec {
  defId: string;
  level: number;
  /** Node and difficulty scaling (§12). */
  statMult?: number;
  /** Carried-over HULL between floors; omit for a full frame. */
  currentHull?: number;
  /** Skills actually available, after ascension gating. */
  skills?: SkillId[];
  traits?: ChassisTraitId[];
  runeEffects?: RuneEffect[];
  /** §9.4 Command aura. Hard-capped by the caller and again here. */
  auraPercent?: number;
  nameOverride?: string;
}

/** §9.2 — which skills a hero can actually bring at a given ascension. */
export function skillsForAscension(def: HeroDefinition, ascension: number): SkillId[] {
  const skills = def.skills.slice(0, ascension >= LEVELLING.FOURTH_SKILL_TIER ? 4 : 3);
  if (ascension >= LEVELLING.AWAKENED_TIER) skills.push(def.awakenedPassive);
  return skills;
}

export function statAtLevel(def: HeroDefinition, stat: StatKey, level: number): number {
  return def.baseStats[stat] + def.growth[stat] * (level - 1);
}

export function buildCombatant(spec: CombatantSpec, side: Side): Combatant {
  const def = getHero(spec.defId);
  const level = Math.max(1, Math.min(LEVELLING.MAX_LEVEL, spec.level));
  const statMult = spec.statMult ?? 1;
  const aura = Math.min(COMMANDER.AURA_CAP, Math.max(0, spec.auraPercent ?? 0));

  // Runes are the only stat-granting layer in the game (§9.3), and they
  // are destroyed at run end.
  const runeFlat: Partial<Record<StatKey, number>> = {};
  const runePercent: Partial<Record<StatKey, number>> = {};
  for (const effect of spec.runeEffects ?? []) {
    if (effect.kind === 'STAT_FLAT') runeFlat[effect.stat] = (runeFlat[effect.stat] ?? 0) + effect.amount;
    if (effect.kind === 'STAT_PERCENT') runePercent[effect.stat] = (runePercent[effect.stat] ?? 0) + effect.percent;
  }

  const stats = {} as Record<StatKey, number>;
  for (const key of ['hull', 'atk', 'def', 'spd', 'foc', 'res'] as StatKey[]) {
    const raw = statAtLevel(def, key, level);
    const scaled = (raw + (runeFlat[key] ?? 0)) * (1 + (runePercent[key] ?? 0)) * (1 + aura) * statMult;
    stats[key] = Math.max(0, Math.min(STAT_SOFT_CAPS[key], Math.round(scaled)));
  }

  const maxHull = Math.max(1, Math.round(stats.hull * HULL_SCALE));
  const skills = spec.skills ?? def.skills.slice(0, 3);

  return {
    side,
    defId: def.id,
    name: spec.nameOverride ?? def.name,
    race: def.race,
    rarity: def.rarity,
    level,
    damageType: def.damageType,
    stats,
    maxHull,
    hull: spec.currentHull !== undefined ? Math.max(1, Math.min(maxHull, Math.round(spec.currentHull))) : maxHull,
    shield: 0,
    statuses: [],
    mods: [],
    skills,
    cooldowns: Object.fromEntries(skills.map((id) => [id, 0])),
    charge: 0,
    charging: null,
    ramp: {},
    lastSkillId: null,
    regen: null,
    damageReduction: null,
    counterStance: null,
    reflect: null,
    debuffImmuneTurns: 0,
    fieldImmuneTurns: 0,
    dodgeNext: false,
    triggers: [],
    traits: spec.traits ?? [],
    usedSurviveLethal: false,
    usedReviveSelf: false,
    usedFirstStatus: false,
    tookFirstHit: false,
    extraActionPending: false,
    alive: true,
  };
}
