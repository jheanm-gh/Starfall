import { describe, expect, it } from 'vitest';
import { simulateCombat, startCombat, step } from './resolve';
import { chooseAction } from './ai';
import { usableSkills } from './rules';
import type { CombatSetup } from './resolve';

function setup(seed: number, playerId = 'terran_vale', enemyId = 'terran_breacher'): CombatSetup {
  return {
    seed,
    player: { defId: playerId, level: 20 },
    enemy: { defId: enemyId, level: 20 },
    field: null,
  };
}

describe('combat engine', () => {
  it('runs two heroes to a conclusion', () => {
    const result = simulateCombat(setup(12345));
    expect(['victory', 'defeat', 'draw']).toContain(result.outcome);
    expect(result.log.length).toBeGreaterThan(10);
    expect(result.player.hull === 0 || result.enemy.hull === 0 || result.outcome === 'draw').toBe(true);
  });

  it('is deterministic: the same seed yields an identical log 100 times', () => {
    const reference = JSON.stringify(simulateCombat(setup(9001)).log);
    for (let i = 0; i < 100; i++) {
      expect(JSON.stringify(simulateCombat(setup(9001)).log)).toBe(reference);
    }
  });

  it('produces different combats for different seeds', () => {
    const logs = new Set<string>();
    for (let seed = 1; seed <= 25; seed++) {
      logs.add(JSON.stringify(simulateCombat(setup(seed)).log));
    }
    expect(logs.size).toBeGreaterThan(5);
  });

  it('never mutates the state passed to step', () => {
    const state = startCombat(setup(777));
    const before = JSON.stringify(state);
    step(state, { type: 'USE_SKILL', skillId: usableSkills(state, 'player')[0] });
    expect(JSON.stringify(state)).toBe(before);
  });

  it('replays exactly from a recorded action list', () => {
    const record: string[] = [];
    let state = startCombat(setup(4242));
    while (state.outcome === 'active') {
      const pick = chooseAction(state, 'player');
      record.push(pick ?? '');
      state = step(state, pick ? { type: 'USE_SKILL', skillId: pick } : { type: 'SKIP' });
    }
    let replay = startCombat(setup(4242));
    for (const id of record) {
      if (replay.outcome !== 'active') break;
      replay = step(replay, id ? { type: 'USE_SKILL', skillId: id } : { type: 'SKIP' });
    }
    expect(JSON.stringify(replay.log)).toBe(JSON.stringify(state.log));
    expect(replay.outcome).toBe(state.outcome);
  });

  it('always leaves a legal move: SKIP advances a round with nothing available', () => {
    // Jam plus overlapping cooldowns can leave a hero with no usable skill.
    // The turn must still be submittable, or the fight simply stops — which
    // is exactly what happened in play before this was handled.
    const state = startCombat(setup(31337));
    for (const id of state.player.skills) state.player.cooldowns[id] = 9;
    expect(usableSkills(state, 'player')).toHaveLength(0);

    const before = state.round;
    const after = step(state, { type: 'SKIP' });
    expect(after.round, 'the round must advance').toBeGreaterThan(before);
    expect(after.outcome === 'active' || after.outcome === 'defeat').toBe(true);
    expect(after.log.some((e) => e.kind === 'skipped')).toBe(true);
    // Cooldowns tick while holding, so the lock always resolves itself.
    expect(after.player.cooldowns[state.player.skills[0]]).toBeLessThan(9);
  });

  it('treats an unusable skill id as a pass rather than a free action', () => {
    const state = startCombat(setup(4711));
    for (const id of state.player.skills) state.player.cooldowns[id] = 5;
    const after = step(state, { type: 'USE_SKILL', skillId: state.player.skills[0] });
    expect(after.log.some((e) => e.kind === 'skill_used' && e.side === 'player')).toBe(false);
    expect(after.round).toBeGreaterThan(state.round);
  });

  it('terminates every matchup within the round limit', () => {
    let draws = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const r = simulateCombat(setup(seed, 'terran_calder', 'terran_medic'));
      expect(r.outcome).not.toBe('active');
      if (r.outcome === 'draw') draws++;
    }
    expect(draws).toBeLessThan(30);
  });
});
