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
