/* Save-schema tests (§13).

   The migration path is exercised directly rather than through IndexedDB, so
   these run in node and stay fast. The point is that an old save opens — a
   schema bump that quietly wipes a player's 150-hero collection is the worst
   bug this project could ship. */

import { describe, expect, it } from 'vitest';
import { ACCOUNT_SCHEMA, RUN_SCHEMA, __testing } from './persist';

const { migrate, ACCOUNT_MIGRATIONS, RUN_MIGRATIONS } = __testing;

function v1Account() {
  return {
    schema: 1,
    heroes: { terran_vale: { defId: 'terran_vale', ascension: 3, fragments: 42, acquiredAt: 1 } },
    chassis: ['weapon_t1'],
    commander: { rank: 7, salvageSpent: 900, skills: ['cmd_emergency_repair'], logistics: [] },
    salvage: 1234,
    pity: { sinceEpic: 61, total: 300 },
    cosmetics: [],
    stats: { runs: 9, floorsCleared: 812, kills: 0, deaths: 0, pulls: 300, bestFloor: 147 },
    createdAt: 1,
    updatedAt: 1,
  };
}

describe('account save migrations', () => {
  it('brings a v1 save all the way to current', () => {
    const migrated = migrate(v1Account(), ACCOUNT_SCHEMA, ACCOUNT_MIGRATIONS);
    expect(migrated).not.toBeNull();
    expect(migrated!.schema).toBe(ACCOUNT_SCHEMA);
  });

  it('preserves everything a player earned', () => {
    const before = v1Account();
    const after = migrate(before, ACCOUNT_SCHEMA, ACCOUNT_MIGRATIONS) as unknown as ReturnType<typeof v1Account>;
    expect(after.heroes).toEqual(before.heroes);
    expect(after.salvage).toBe(before.salvage);
    expect(after.commander.rank).toBe(before.commander.rank);
    expect(after.stats.bestFloor).toBe(before.stats.bestFloor);
    // §10: the pity counter must survive, or a player loses a 61-pull drought.
    expect(after.pity).toEqual(before.pity);
  });

  it('fills in fields that did not exist in the old schema', () => {
    const after = migrate(v1Account(), ACCOUNT_SCHEMA, ACCOUNT_MIGRATIONS) as unknown as Record<string, unknown>;
    expect(after.loadouts).toEqual({});
    expect(after.summonItems).toBe(0);
    expect(after.unlocks).toMatchObject({ endless: false, draft: false, deepestFloor: 0 });
  });

  it('leaves a current save untouched', () => {
    const current = { ...v1Account(), schema: ACCOUNT_SCHEMA };
    expect(migrate(current, ACCOUNT_SCHEMA, ACCOUNT_MIGRATIONS)).toEqual(current);
  });

  it('refuses a save it has no path for, rather than corrupting it', () => {
    expect(migrate({ schema: 99 }, ACCOUNT_SCHEMA, ACCOUNT_MIGRATIONS)).toBeNull();
    expect(migrate({ schema: 0 }, ACCOUNT_SCHEMA, ACCOUNT_MIGRATIONS)).toBeNull();
  });

  it('ships a migration for every schema below current', () => {
    for (let v = 1; v < ACCOUNT_SCHEMA; v++) {
      expect(ACCOUNT_MIGRATIONS[v], `account migration from v${v}`).toBeDefined();
    }
    for (let v = 1; v < RUN_SCHEMA; v++) {
      expect(RUN_MIGRATIONS[v], `run migration from v${v}`).toBeDefined();
    }
  });
});

describe('run save migrations', () => {
  it('carries a mid-run save forward, RNG cursor and all', () => {
    const v1 = {
      schema: 1,
      seed: 20260909,
      mode: 'story',
      difficulty: 'hardened',
      floor: 147,
      roster: [{ defId: 'terran_vale', level: 31, currentHull: 812, alive: true }],
      scrip: 640,
      combat: { seed: 20260909, cursor: 4821, round: 6 },
    };
    const after = migrate(v1, RUN_SCHEMA, RUN_MIGRATIONS) as unknown as typeof v1 & { eventIndex: number };
    expect(after.schema).toBe(RUN_SCHEMA);
    expect(after.floor).toBe(147);
    // §13: the run resumes exactly where it stopped, which means the cursor.
    expect(after.combat.cursor).toBe(4821);
    expect(after.eventIndex).toBe(0);
  });
});
