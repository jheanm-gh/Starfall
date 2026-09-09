/* The core loop.

   `step(state, action)` takes the player's committed action, derives the
   opponent's, resolves the whole round in priority order, and returns a
   NEW state. The input state is never mutated. Given the same seed and
   the same action sequence, the log is byte-identical every time — that
   is the property daily seeds, replays and the balance report rely on. */

import type {
  CombatAction, CombatState, FieldId, Side, SkillDefinition, SkillId,
} from '../types';
import { TURN } from '../../data/balance';
import { FIELDS } from '../../data/fields';
import { getSkill } from '../../data/registry';
import { rollChance } from '../rng';
import { STATIC_SKIP_CHANCE } from '../../data/statuses';
import { buildCombatant, type CombatantSpec } from './build';
import { chooseAction } from './ai';
import { computeOrder } from './turnOrder';
import { runEffectList } from './primitives';
import type { EffectContext } from './primitives/context';
import { removeStatus, tickEndOfTurn } from './statuses';
import { usableSkills } from './rules';

export interface CombatSetup {
  seed: number;
  player: CombatantSpec;
  enemy: CombatantSpec;
  field: FieldId | null;
  roundLimit?: number;
  /** Doctrine: status effects last one turn longer (§9.4). */
  statusDurationBonus?: number;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function other(side: Side): Side {
  return side === 'player' ? 'enemy' : 'player';
}

function baseContext(state: CombatState, side: Side, skill: SkillDefinition): EffectContext {
  return {
    state,
    actorSide: side,
    targetSide: other(side),
    skill,
    pierce: 0,
    powerMult: 1,
    totalDamage: 0,
    anyHit: false,
    killedTarget: false,
    depth: 0,
  };
}

/** Registers passive skills, auras and triggers. Runs once, at combat start. */
function registerPassives(state: CombatState, side: Side): void {
  for (const id of state[side].skills) {
    const skill = getSkill(id);
    if (!skill.passive) continue;
    runEffectList(baseContext(state, side, skill), skill.effects);
  }
}

export function startCombat(setup: CombatSetup): CombatState {
  const player = buildCombatant(setup.player, 'player');
  const enemy = buildCombatant(setup.enemy, 'enemy');

  const state: CombatState = {
    seed: setup.seed | 0,
    cursor: 0,
    round: 1,
    order: ['player', 'enemy'],
    orderIndex: 0,
    player,
    enemy,
    field: setup.field,
    log: [],
    outcome: 'active',
    roundLimit: setup.roundLimit ?? TURN.ROUND_LIMIT,
    awaiting: null,
  };

  state.log.push({
    kind: 'combat_start', round: 1,
    text: `${player.name} engages ${enemy.name}${setup.field ? ` under ${FIELDS[setup.field].name}` : ''}.`,
    fieldId: setup.field,
  });

  registerPassives(state, 'player');
  registerPassives(state, 'enemy');

  // T2-and-up chassis trait: enter combat already shielded.
  for (const side of ['player', 'enemy'] as Side[]) {
    if (state[side].traits.includes('shield_on_entry')) {
      state[side].shield += Math.round(state[side].maxHull * 0.1);
    }
    if (state[side].traits.includes('counter_reflex')) {
      state[side].counterStance = { percent: 0.25, turnsLeft: 999 };
    }
  }

  state.awaiting = 'player';
  return state;
}

/** Resolves one full round. Returns a new state; the input is untouched. */
export function step(state: CombatState, action: CombatAction): CombatState {
  if (state.outcome !== 'active') return state;

  const next = clone(state);
  next.awaiting = null;

  const playerSkillId = action.type === 'USE_SKILL' ? action.skillId : null;
  const legal = usableSkills(next, 'player');
  const chosenPlayer = playerSkillId && legal.includes(playerSkillId) ? playerSkillId : null;
  const chosenEnemy = chooseAction(next, 'enemy');

  next.log.push({ kind: 'round_start', round: next.round, text: `— Round ${next.round} —` });

  const order = computeOrder(next, {
    player: { action, skill: chosenPlayer ? getSkill(chosenPlayer) : null },
    enemy: { action: chosenEnemy ? { type: 'USE_SKILL', skillId: chosenEnemy } : { type: 'SKIP' }, skill: chosenEnemy ? getSkill(chosenEnemy) : null },
  });
  next.order = order;

  const chosen: Record<Side, SkillId | null> = { player: chosenPlayer, enemy: chosenEnemy };

  for (let i = 0; i < order.length; i++) {
    if (next.outcome !== 'active') break;
    const side = order[i];
    next.orderIndex = i;
    takeTurn(next, side, chosen[side]);

    // §5.2: extra actions exist only as an explicit primitive, never from SPD.
    let guard = 0;
    while (next.outcome === 'active' && next[side].extraActionPending && guard < 2) {
      next[side].extraActionPending = false;
      guard++;
      const extra = chooseAction(next, side);
      takeTurn(next, side, extra, true);
    }
  }

  if (next.outcome === 'active') {
    next.round += 1;
    if (next.round > next.roundLimit) {
      next.outcome = 'draw';
      next.log.push({
        kind: 'combat_end', round: next.round,
        text: 'Both frames disengage — neither can finish the other.',
      });
    }
  }

  if (next.outcome !== 'active' && next.log[next.log.length - 1]?.kind !== 'combat_end') {
    next.log.push({
      kind: 'combat_end', round: next.round,
      text: next.outcome === 'victory' ? 'Contact neutralised.' : 'Frame lost.',
    });
  }

  next.awaiting = next.outcome === 'active' ? 'player' : null;
  return next;
}

function takeTurn(state: CombatState, side: Side, skillId: SkillId | null, isExtra = false): void {
  const c = state[side];
  if (!c.alive || state.outcome !== 'active') return;

  state.log.push({
    kind: 'turn_start', round: state.round, side,
    text: `${c.name}${isExtra ? ' acts again' : ' acts'}.`,
  });

  // Stun consumes the turn and then clears — it is duration 1 by design.
  if (c.statuses.some((s) => s.id === 'stun')) {
    removeStatus(state, side, 'stun');
    state.log.push({ kind: 'skipped', round: state.round, side, text: `${c.name} is stunned and loses the turn.` });
    tickEndOfTurn(state, side);
    return;
  }

  // Static: a flat chance to lose the turn each time it comes around.
  if (c.statuses.some((s) => s.id === 'static')) {
    const r = rollChance(state.seed, state.cursor, STATIC_SKIP_CHANCE);
    state.cursor = r.cursor;
    if (r.value) {
      state.log.push({ kind: 'skipped', round: state.round, side, text: `${c.name} seizes — static discharge.` });
      tickEndOfTurn(state, side);
      return;
    }
  }

  if (!skillId) {
    state.log.push({ kind: 'skipped', round: state.round, side, text: `${c.name} holds position.` });
    tickEndOfTurn(state, side);
    return;
  }

  executeSkill(state, side, skillId);
  if (state.outcome === 'active') tickEndOfTurn(state, side);
}

export function executeSkill(state: CombatState, side: Side, skillId: SkillId): void {
  const c = state[side];
  const skill = getSkill(skillId);
  const ctx = baseContext(state, side, skill);

  // CHARGE: the first use banks the skill, the next use fires it amplified.
  const charged = c.charging && c.charging.skillId === skillId;
  let effects = skill.effects;
  if (charged) {
    ctx.powerMult = c.charging!.multiplier;
    c.charging = null;
    effects = skill.effects.filter((e) => e.kind !== 'CHARGE');
  } else if (skill.effects.some((e) => e.kind === 'CHARGE')) {
    effects = skill.effects.filter((e) => e.kind === 'CHARGE');
  }

  state.log.push({
    kind: 'skill_used', round: state.round, side, targetSide: other(side), skillId,
    text: `${c.name} uses ${skill.name}${charged ? ' — fully charged' : ''}.`,
  });

  runEffectList(ctx, effects);

  // RAMPING bookkeeping: consecutive use grows the counter, anything else resets it.
  for (const id of c.skills) {
    if (id !== skillId) c.ramp[id] = 0;
  }
  c.ramp[skillId] = c.lastSkillId === skillId ? (c.ramp[skillId] ?? 0) + 1 : 1;
  c.lastSkillId = skillId;

  // +1 because this hero's own end-of-turn sweep will immediately tick it down.
  if (skill.cooldown > 0) c.cooldowns[skillId] = skill.cooldown + 1;
}

/** Convenience for tests, the balance report and Draft-mode autoplay. */
export function simulateCombat(setup: CombatSetup): CombatState {
  let state = startCombat(setup);
  let guard = 0;
  while (state.outcome === 'active' && guard < TURN.ROUND_LIMIT + 5) {
    const pick = chooseAction(state, 'player');
    state = step(state, pick ? { type: 'USE_SKILL', skillId: pick } : { type: 'SKIP' });
    guard++;
  }
  return state;
}
