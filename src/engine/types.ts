/* ============================================================
   STARFALL shared types — §4 of the master spec.
   Single source of truth. Nothing in src/ redefines these shapes.
   ============================================================ */

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type DamageType = 'kinetic' | 'thermal' | 'corrosive' | 'em' | 'psionic';
export type StatKey = 'hull' | 'atk' | 'def' | 'spd' | 'foc' | 'res';

export const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const DAMAGE_TYPES: DamageType[] = ['kinetic', 'thermal', 'corrosive', 'em', 'psionic'];
export const STAT_KEYS: StatKey[] = ['hull', 'atk', 'def', 'spd', 'foc', 'res'];

export type RaceId =
  | 'terran'
  | 'vantari'
  | 'kelshar'
  | 'reclaimed'
  | 'ithka'
  | 'meridian'
  | 'pyroclast'
  | 'umbral'
  | 'signal'
  | 'drenn';

export const RACE_IDS: RaceId[] = [
  'terran', 'vantari', 'kelshar', 'reclaimed', 'ithka',
  'meridian', 'pyroclast', 'umbral', 'signal', 'drenn',
];

export interface RaceDefinition {
  id: RaceId;
  name: string;
  identity: string;
  /** §5.4 — one type at x0.75, one at x1.25, the rest x1.0. Null for Terran. */
  resists: DamageType | null;
  vulnerable: DamageType | null;
  /** Two-colour placeholder palette (§3.1). Derived from the §2.1 six. */
  palette: [string, string];
}

/* ---------- statuses (§6) ---------- */

export type StatusId =
  | 'burn' | 'corrode' | 'hemorrhage' | 'irradiate' | 'stun' | 'jam'
  | 'blind' | 'suppress' | 'mark' | 'static' | 'overclock' | 'bulwark';

export interface StatusDefinition {
  id: StatusId;
  name: string;
  /** Debuffs are contested by RES; self-buffs are not (§6). */
  kind: 'debuff' | 'self-buff';
  duration: number;
  maxStacks: number;
  description: string;
  /** End-of-turn HULL drain as a fraction of max HULL, if any. */
  tickPercentMaxHull?: number;
  /** Irradiate ramps its tick each turn it persists. */
  tickRampPercent?: number;
  tickDamageType?: DamageType;
  /** Hemorrhage bypasses mitigation entirely. */
  tickIgnoresDef?: boolean;
}

export interface ActiveStatus {
  id: StatusId;
  stacks: number;
  turnsLeft: number;
  /** Turns this status has already ticked — Irradiate reads it to ramp. */
  ticks: number;
  /** Which side applied it; used for kill attribution on tick damage. */
  source: Side;
}

/* ---------- environmental conditions (§11) ---------- */

export type FieldId =
  | 'ion_storm' | 'hard_vacuum' | 'high_gravity' | 'nebula_haze' | 'radiation_belt'
  | 'null_field' | 'magnetar_wake' | 'thermal_bloom' | 'derelict_hulk' | 'solar_flare';

export interface FieldDefinition {
  id: FieldId;
  name: string;
  description: string;
  /** Per-damage-type multiplier applied to outgoing damage. */
  damageMult?: Partial<Record<DamageType, number>>;
  accuracyDelta?: number;
  evasionDelta?: number;
  /** Multiplicative modifiers on effective stats, e.g. { spd: 0.8 }. */
  statMult?: Partial<Record<StatKey, number>>;
  dotMult?: number;
  healMult?: number;
  /** Both combatants lose this fraction of max HULL each turn. */
  attritionPercent?: number;
  /** Null Field: no buff or debuff may be applied at all. */
  blocksStatuses?: boolean;
  critChanceDelta?: number;
  /** Thermal Bloom: every thermal hit applies Burn. */
  thermalAppliesBurn?: boolean;
  /** Derelict Hulk: first incoming hit each combat is halved. */
  firstHitReduction?: number;
}

/* ---------- skills (§8) ---------- */

export type SkillId = string;
export type EffectTarget = 'enemy' | 'self';

/** Gate for CONDITIONAL_DAMAGE and SCALE_WITH_FIELD style effects. */
export interface EffectCondition {
  /** Target carries this status. */
  targetHasStatus?: StatusId;
  selfHasStatus?: StatusId;
  field?: FieldId | FieldId[];
  /** Target HULL fraction below this value. */
  targetHullBelow?: number;
  selfHullBelow?: number;
  selfHullAbove?: number;
  /** Self holds at least this much charge. */
  chargeAtLeast?: number;
}

export type SkillEffect =
  /* --- damage --- */
  | { kind: 'DIRECT_DAMAGE'; power: number; target?: EffectTarget; ignoresShield?: boolean }
  | { kind: 'MULTI_HIT'; power: number; hits: number }
  | { kind: 'EXECUTE'; power: number; threshold: number; bonusMult: number }
  | { kind: 'RAMPING'; power: number; increment: number; maxStacks: number }
  | { kind: 'RECOIL'; power: number; recoilPercent: number }
  | { kind: 'LIFESTEAL'; power: number; leechPercent: number }
  | { kind: 'FIXED_DAMAGE'; amount: number }
  | { kind: 'PERCENT_MAX_HULL'; percent: number; ofTarget?: boolean }
  | { kind: 'ARMOR_PIERCE'; pierce: number }
  | { kind: 'CONDITIONAL_DAMAGE'; power: number; condition: EffectCondition; bonusMult: number }
  /* --- status --- */
  | { kind: 'APPLY_STATUS'; status: StatusId; baseChance: number; stacks?: number; target?: EffectTarget; duration?: number }
  | { kind: 'CLEANSE_SELF'; count?: number }
  | { kind: 'TRANSFER_STATUS'; count?: number }
  | { kind: 'EXTEND_STATUS'; turns: number; target?: EffectTarget }
  | { kind: 'CONSUME_STATUS'; status: StatusId; damagePerStack: number }
  /* --- stats --- */
  | { kind: 'STAT_MODIFY'; stat: StatKey; percent: number; duration: number; target?: EffectTarget }
  | { kind: 'STAT_STEAL'; stat: StatKey; percent: number; duration: number }
  | { kind: 'BUFF_STRIP'; count?: number }
  | { kind: 'DEBUFF_IMMUNITY'; duration: number }
  | { kind: 'REFLECT'; percent: number; duration: number }
  /* --- defensive --- */
  | { kind: 'SHIELD_FLAT'; amount: number }
  | { kind: 'SHIELD_PERCENT_MAX'; percent: number }
  | { kind: 'HEAL_FLAT'; amount: number }
  | { kind: 'HEAL_PERCENT'; percent: number }
  | { kind: 'REGEN'; percent: number; duration: number }
  | { kind: 'DAMAGE_REDUCTION'; percent: number; duration: number }
  | { kind: 'COUNTER_STANCE'; percent: number; duration: number }
  | { kind: 'DODGE_NEXT' }
  /* --- turn control --- */
  | { kind: 'PRIORITY'; tier: number }
  | { kind: 'SPEED_SWAP' }
  | { kind: 'DELAY_TARGET'; percent: number; duration: number }
  | { kind: 'EXTRA_ACTION' }
  | { kind: 'COOLDOWN_RESET'; count?: number }
  | { kind: 'CHARGE'; multiplier: number }
  /* --- field --- */
  | { kind: 'SET_FIELD'; field: FieldId }
  | { kind: 'CLEAR_FIELD' }
  | { kind: 'FIELD_IMMUNITY'; duration: number }
  | { kind: 'SCALE_WITH_FIELD'; power: number; field: FieldId | FieldId[]; scaledPower: number }
  /* --- resource --- */
  | { kind: 'GAIN_CHARGE'; amount: number }
  | { kind: 'SPEND_CHARGE'; amount: number; power: number }
  | { kind: 'SELF_SACRIFICE'; percentMaxHull: number; power: number }
  | { kind: 'REVIVE_SELF'; healPercent: number }
  /* --- triggers --- */
  | { kind: 'ON_KILL'; effects: SkillEffect[] }
  | { kind: 'ON_HIT'; chance?: number; effects: SkillEffect[] }
  | { kind: 'ON_TAKE_DAMAGE'; chance?: number; effects: SkillEffect[] }
  | { kind: 'PASSIVE_AURA'; stat: StatKey; percent: number };

export type EffectKind = SkillEffect['kind'];

export interface SkillDefinition {
  id: SkillId;
  name: string;
  type: DamageType;
  cooldown: number;
  priority: number;
  effects: SkillEffect[];
  description: string;
  /** Passive skills never appear as a selectable action; they register at combat start. */
  passive?: boolean;
  /** Accuracy floor for the whole skill; 1 unless the skill is inherently chancy. */
  accuracy?: number;
}

/* ---------- heroes (§4) ---------- */

export interface HeroDefinition {
  id: string;
  slug: string;
  name: string;
  race: RaceId;
  rarity: Rarity;
  rosterCost: number;
  baseStats: Record<StatKey, number>;
  growth: Record<StatKey, number>;
  /** 3 at base, the 4th unlocks at ascension 4. */
  skills: SkillId[];
  /** Unlocks at ascension 6. */
  awakenedPassive: SkillId;
  damageType: DamageType;
  role: string;
}

export type Ascension = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeroInstance {
  defId: string;
  ascension: Ascension;
  fragments: number;
  acquiredAt: number;
}

/* ---------- gear and runes (§9.3) ---------- */

export type GearSlot = 'weapon' | 'plating' | 'core' | 'auxiliary';
export const GEAR_SLOTS: GearSlot[] = ['weapon', 'plating', 'core', 'auxiliary'];

export type ChassisTier = 1 | 2 | 3 | 4;

export type ChassisTraitId =
  | 'crit_pierce' | 'first_status_unresistable' | 'cooldown_on_kill' | 'survive_lethal'
  | 'opening_priority' | 'dot_extend' | 'shield_on_entry' | 'counter_reflex';

export interface ChassisDefinition {
  id: string;
  name: string;
  slot: GearSlot;
  tier: ChassisTier;
  sockets: number;
  /** Non-numeric by design: chassis grant no stats whatsoever (§9.3). */
  trait: ChassisTraitId;
  traitText: string;
  salvageCost: number;
}

export interface RuneDefinition {
  id: string;
  name: string;
  rarity: Rarity;
  /** Runes are the only stat-granting layer, and they are destroyed at run end. */
  effects: RuneEffect[];
  description: string;
}

export type RuneEffect =
  | { kind: 'STAT_FLAT'; stat: StatKey; amount: number }
  | { kind: 'STAT_PERCENT'; stat: StatKey; percent: number }
  | { kind: 'ON_COMBAT_START'; effects: SkillEffect[] }
  | { kind: 'TRIGGER'; effects: SkillEffect[] };

export interface EquippedGear {
  chassisId: string;
  runes: (string | null)[];
}

/* ---------- run-scoped hero (§4) ---------- */

export interface RunHero {
  defId: string;
  level: number;
  exp: number;
  currentHull: number;
  statuses: ActiveStatus[];
  gear: Record<GearSlot, EquippedGear | null>;
  alive: boolean;
}

/* ---------- combat (§5) ---------- */

export type Side = 'player' | 'enemy';

export interface StatMod {
  stat: StatKey;
  percent: number;
  turnsLeft: number;
  /** Marks buffs so BUFF_STRIP and Suppress can find them. */
  positive: boolean;
}

export interface TimedFlag {
  percent: number;
  turnsLeft: number;
}

export interface TriggerHook {
  on: 'ON_KILL' | 'ON_HIT' | 'ON_TAKE_DAMAGE';
  chance: number;
  effects: SkillEffect[];
  sourceSkill: SkillId;
}

export interface Combatant {
  side: Side;
  defId: string;
  name: string;
  race: RaceId;
  rarity: Rarity;
  level: number;
  damageType: DamageType;
  /** Effective base stats for this combat, before in-combat modifiers. */
  stats: Record<StatKey, number>;
  maxHull: number;
  hull: number;
  shield: number;
  statuses: ActiveStatus[];
  mods: StatMod[];
  skills: SkillId[];
  cooldowns: Record<SkillId, number>;
  charge: number;
  /** Set by CHARGE; consumed by the next action. */
  charging: { skillId: SkillId; multiplier: number } | null;
  ramp: Record<SkillId, number>;
  lastSkillId: SkillId | null;
  regen: { percent: number; turnsLeft: number } | null;
  damageReduction: TimedFlag | null;
  counterStance: TimedFlag | null;
  reflect: TimedFlag | null;
  debuffImmuneTurns: number;
  fieldImmuneTurns: number;
  dodgeNext: boolean;
  triggers: TriggerHook[];
  traits: ChassisTraitId[];
  /** Set by a REVIVE_SELF passive: fraction of max HULL restored on death. */
  reviveOnDeath?: number;
  /** One-shot trait and primitive budgets, consumed during combat. */
  usedSurviveLethal: boolean;
  usedReviveSelf: boolean;
  usedFirstStatus: boolean;
  tookFirstHit: boolean;
  extraActionPending: boolean;
  alive: boolean;
}

export type CombatEventKind =
  | 'combat_start' | 'round_start' | 'turn_start' | 'skill_used' | 'damage' | 'heal'
  | 'shield' | 'status_applied' | 'status_resisted' | 'status_expired' | 'status_tick'
  | 'stat_modified' | 'buff_stripped' | 'miss' | 'dodge' | 'crit' | 'field_changed'
  | 'death' | 'revive' | 'extra_action' | 'charge' | 'counter' | 'reflect'
  | 'cooldown_reset' | 'skipped' | 'combat_end' | 'note';

export interface CombatEvent {
  kind: CombatEventKind;
  round: number;
  side?: Side;
  targetSide?: Side;
  skillId?: SkillId;
  statusId?: StatusId;
  fieldId?: FieldId | null;
  amount?: number;
  crit?: boolean;
  text: string;
}

export type CombatOutcome = 'active' | 'victory' | 'defeat' | 'draw';

export interface CombatState {
  seed: number;
  /** Pure RNG cursor. (seed, cursor) fully determines every draw. */
  cursor: number;
  round: number;
  /** Turn order for the current round, recomputed each round start (§5.2). */
  order: Side[];
  orderIndex: number;
  player: Combatant;
  enemy: Combatant;
  field: FieldId | null;
  log: CombatEvent[];
  outcome: CombatOutcome;
  /** Rounds elapsed; a hard cap prevents unwinnable stalls. */
  roundLimit: number;
  /** Set while the engine waits for the player to choose a skill. */
  awaiting: Side | null;
}

export type CombatAction =
  | { type: 'USE_SKILL'; skillId: SkillId }
  | { type: 'SKIP' };

/* ---------- run structure (§11) ---------- */

export type NodeKind = 'combat' | 'elite' | 'boss' | 'apex' | 'event' | 'merchant' | 'rest';
export type EventKind = 'merchant' | 'gacha_shrine' | 'derelict' | 'rescue' | 'gauntlet';
export type Difficulty = 'standard' | 'hardened' | 'attrition';
export type GameMode = 'story' | 'endless' | 'ironman' | 'draft';

export interface SectorDefinition {
  index: number;
  id: string;
  name: string;
  /** The sector's biased environmental condition (§11). */
  field: FieldId;
  enemyRaces: RaceId[];
  description: string;
}

export interface EnemyBlueprint {
  defId: string;
  level: number;
  statMult: number;
  isBoss: boolean;
  title?: string;
}

export interface FloorNode {
  floor: number;
  kind: NodeKind;
  sector: number;
  field: FieldId | null;
  enemies: EnemyBlueprint[];
  eventKind?: EventKind;
}

export interface RunRewards {
  exp: number;
  scrip: number;
  salvage: number;
  runes: string[];
  fragments: { defId: string; amount: number }[];
  summonItems: number;
}
