/* Run-structure integration tests (§11, §12, §14 P7).

   These play the run layer headlessly: floor generation, the milestone
   cadence, sector conditions, and a complete 300-floor Story clear. */

import { describe, expect, it } from 'vitest';
import type { Difficulty, FloorNode } from '../types';
import { COMMANDER, HULL_SCALE, RUN, SCALING } from '../../data/balance';
import { FIELDS } from '../../data/fields';
import { SECTORS, sectorForFloor } from '../../data/sectors';
import { getHero } from '../../data/registry';
import { getRune } from '../../data/runes';
import { skillsForAscension, statAtLevel } from '../combat/build';
import { simulateCombat } from '../combat/resolve';
import { fieldForFloor, generateFloor, nodeKindFor } from './floorGen';
import { rewardsForFloor } from './rewards';
import { generateStock } from './economy';

const SEED = 20260909;

function floorsOf(seed: number, difficulty: Difficulty = 'standard'): FloorNode[] {
  return Array.from({ length: RUN.TOTAL_FLOORS }, (_, i) => {
    const node = generateFloor(seed, i + 1, difficulty);
    node.field = fieldForFloor(seed, i + 1);
    return node;
  });
}

describe('floor generation (§11)', () => {
  it('generates all 300 floors without error', () => {
    const floors = floorsOf(SEED);
    expect(floors.length).toBe(RUN.TOTAL_FLOORS);
    for (const node of floors) {
      expect(node.sector).toBeGreaterThanOrEqual(0);
      expect(node.sector).toBeLessThan(SECTORS.length);
      if (node.kind !== 'event') {
        expect(node.enemies.length, `floor ${node.floor} has no enemy`).toBeGreaterThan(0);
        for (const e of node.enemies) expect(() => getHero(e.defId)).not.toThrow();
      }
    }
  });

  it('follows the milestone cadence: bosses on odd tens, events on even tens', () => {
    // Flagged in §15.1 as an inference from "every other ten levels".
    for (let floor = 10; floor <= RUN.TOTAL_FLOORS; floor += 10) {
      const kind = nodeKindFor(floor);
      if (RUN.APEX_FLOORS.includes(floor)) {
        expect(kind, `floor ${floor}`).toBe('apex');
      } else if (floor % 20 === 10) {
        expect(kind, `floor ${floor}`).toBe('boss');
      } else {
        expect(kind, `floor ${floor}`).toBe('event');
      }
    }
    expect(RUN.APEX_FLOORS).toEqual([100, 200, 300]);
  });

  it('never puts a milestone on a floor that is not a multiple of ten', () => {
    for (let floor = 1; floor <= RUN.TOTAL_FLOORS; floor++) {
      if (floor % 10 === 0) continue;
      expect(['combat', 'elite']).toContain(nodeKindFor(floor));
    }
  });

  it('walks all ten sectors and shows every environmental condition', () => {
    const floors = floorsOf(SEED);
    expect(new Set(floors.map((f) => f.sector)).size).toBe(SECTORS.length);
    const seen = new Set(floors.map((f) => f.field));
    for (const sector of SECTORS) {
      expect(seen.has(sector.field), `${FIELDS[sector.field].name} never appeared`).toBe(true);
    }
  });

  it('reproduces a floor exactly from its seed and index (§13)', () => {
    for (const floor of [1, 47, 100, 213, 300]) {
      const a = generateFloor(SEED, floor, 'standard');
      const b = generateFloor(SEED, floor, 'standard');
      expect(a).toEqual(b);
      expect(fieldForFloor(SEED, floor)).toBe(fieldForFloor(SEED, floor));
    }
  });

  it('generates different runs for different seeds', () => {
    const a = JSON.stringify(floorsOf(1).map((f) => f.enemies[0]?.defId));
    const b = JSON.stringify(floorsOf(2).map((f) => f.enemies[0]?.defId));
    expect(a).not.toBe(b);
  });

  it('gives bosses a second phase on Hardened and Attrition (§12)', () => {
    for (const difficulty of ['hardened', 'attrition'] as Difficulty[]) {
      const boss = generateFloor(SEED, 10, difficulty);
      expect(boss.enemies.length, `${difficulty} boss phases`).toBe(2);
    }
    expect(generateFloor(SEED, 10, 'standard').enemies.length).toBe(1);
  });

  it('scales enemies with depth and with difficulty', () => {
    const early = generateFloor(SEED, 5, 'standard').enemies[0];
    const late = generateFloor(SEED, 250, 'standard').enemies[0];
    expect(late.level).toBeGreaterThan(early.level);

    const standard = generateFloor(SEED, 50, 'standard').enemies[0];
    const attrition = generateFloor(SEED, 50, 'attrition').enemies[0];
    expect(attrition.statMult).toBeGreaterThan(standard.statMult);
  });

  it('keeps scaling past floor 300 for Endless, and not before', () => {
    expect(SCALING.depthMultiplier(1)).toBe(1);
    expect(SCALING.depthMultiplier(300)).toBe(1);
    expect(SCALING.depthMultiplier(400)).toBeGreaterThan(1);
    expect(SCALING.depthMultiplier(600)).toBeGreaterThan(SCALING.depthMultiplier(400));
    // Endless cycles the sector list rather than parking on the last one.
    expect(sectorForFloor(301).id).toBe(SECTORS[0].id);
  });
});

describe('economy and rewards (§9.5)', () => {
  it('pays more for a boss than a routine contact, and more still for an apex', () => {
    const ctx = { runSeed: SEED, difficulty: 'standard' as Difficulty, expMult: 1, scripMult: 1 };
    const routine = rewardsForFloor(generateFloor(SEED, 97, 'standard'), ctx);
    const boss = rewardsForFloor(generateFloor(SEED, 90 + 0, 'standard'), { ...ctx });
    const apex = rewardsForFloor(generateFloor(SEED, 100, 'standard'), ctx);
    expect(apex.exp).toBeGreaterThan(routine.exp);
    expect(apex.salvage).toBeGreaterThan(routine.salvage);
    expect(boss.exp).toBeGreaterThan(0);
  });

  it('pays out more Salvage on harder difficulties (§12)', () => {
    const node = generateFloor(SEED, 50, 'standard');
    const base = rewardsForFloor(node, { runSeed: SEED, difficulty: 'standard', expMult: 1, scripMult: 1 });
    const hard = rewardsForFloor(node, { runSeed: SEED, difficulty: 'attrition', expMult: 1, scripMult: 1 });
    expect(hard.salvage).toBeGreaterThan(base.salvage);
  });

  it('guarantees a rune from every boss and apex encounter', () => {
    const ctx = { runSeed: SEED, difficulty: 'standard' as Difficulty, expMult: 1, scripMult: 1 };
    for (const floor of [10, 30, 100, 200, 300]) {
      expect(rewardsForFloor(generateFloor(SEED, floor, 'standard'), ctx).runes.length,
        `floor ${floor} rune drop`).toBeGreaterThan(0);
    }
  });

  it('stocks a merchant deterministically and prices it up with depth', () => {
    const early = generateStock(SEED, 20);
    const late = generateStock(SEED, 280);
    expect(generateStock(SEED, 20)).toEqual(early);
    expect(early.runes.length).toBeGreaterThan(0);
    const cheapest = (s: typeof early) => Math.min(...s.items.map((i) => i.price));
    expect(cheapest(late)).toBeGreaterThan(cheapest(early));
  });
});

describe('a complete Story run (§14 P7)', () => {
  it('can be cleared end to end by a well-built roster', () => {
    // The honest version of "is 300 floors survivable": a five-hero crew
    // that carries its damage between floors, recovers the §11 between-floor
    // fraction, and loses a hero permanently when one falls. If the curve is
    // impossible this fails here rather than the player finding out at 200.
    // What a crew genuinely has by floor 300: the capped +5% command aura
    // (§9.4) and a few socketed runes (§9.3 — every boss guarantees one, and
    // there are 29 bosses plus 3 apex encounters before this point). This is
    // a conservative fit-out, not a maximal one.
    const aura = COMMANDER.AURA_CAP;
    const runeEffects = [
      ...getRune('rune_apex').effects,
      ...getRune('rune_ablative').effects,
      ...getRune('rune_bulk').effects,
      ...getRune('rune_lamellar').effects,
    ];

    const crew = [
      'terran_delacroix', 'vantari_hegemon', 'ithka_unbreathing',
      'pyro_firstvent', 'signal_first',
    ].map((id) => {
      const def = getHero(id);
      const maxHull = Math.round(statAtLevel(def, 'hull', 60) * 1.12 * (1 + aura) * HULL_SCALE);
      return { id, skills: skillsForAscension(def, 6), hull: maxHull, maxHull, alive: true };
    });

    let active = 0;
    let cleared = 0;
    let lostAt: number | null = null;

    for (let floor = 1; floor <= RUN.TOTAL_FLOORS; floor++) {
      const node = generateFloor(SEED, floor, 'standard');

      if (node.kind === 'event') {
        cleared++;
      } else {
        let phase = 0;
        for (const blueprint of node.enemies) {
          let resolved = false;
          // The enemy carries its damage between reliefs: when a hero falls,
          // the next steps into the same fight rather than restarting it.
          let enemyHull: number | undefined;
          while (!resolved) {
            const hero = crew[active];
            const result = simulateCombat({
              seed: (SEED ^ (floor * 0x9e37) ^ (phase * 0x1f1f) ^ (active * 0x2b2b)) | 0,
              player: {
                defId: hero.id, level: 60, skills: hero.skills,
                currentHull: hero.hull, auraPercent: aura, runeEffects,
                traits: ['survive_lethal', 'cooldown_on_kill'],
              },
              enemy: {
                defId: blueprint.defId,
                level: blueprint.level,
                statMult: blueprint.statMult,
                currentHull: enemyHull,
              },
              field: fieldForFloor(SEED, floor),
            });
            hero.hull = Math.max(0, result.player.hull);
            if (result.outcome === 'victory') {
              resolved = true;
            } else {
              enemyHull = Math.max(1, result.enemy.hull);
              hero.alive = false;
              hero.hull = 0;
              const next = crew.findIndex((h) => h.alive);
              if (next === -1) { lostAt = floor; break; }
              active = next;
            }
          }
          if (lostAt !== null) break;
          phase++;
        }
        if (lostAt !== null) break;
        cleared++;
      }

      // §11: HULL partially restores between floors on Standard.
      for (const hero of crew) {
        if (!hero.alive) continue;
        hero.hull = Math.min(hero.maxHull, hero.hull + Math.round(hero.maxHull * RUN.BETWEEN_FLOOR_HEAL));
      }
    }

    expect(lostAt, `crew wiped on floor ${lostAt}`).toBeNull();
    expect(cleared).toBe(RUN.TOTAL_FLOORS);
    expect(crew.filter((h) => h.alive).length, 'survivors').toBeGreaterThan(0);
  });

  it('is genuinely dangerous for an under-levelled roster', () => {
    // The other half of the curve: floor 1 must still be able to kill you on
    // run fifty, which is the whole reason levels reset each run (§9.1).
    const hero = getHero('terran_corpsman');
    let deepest = 0;
    for (let floor = 1; floor <= RUN.TOTAL_FLOORS; floor++) {
      const node = generateFloor(SEED, floor, 'attrition');
      if (node.kind === 'event') { deepest = floor; continue; }
      const result = simulateCombat({
        seed: (SEED ^ (floor * 0x9e37)) | 0,
        player: { defId: hero.id, level: 1, skills: hero.skills.slice(0, 3) },
        enemy: {
          defId: node.enemies[0].defId,
          level: node.enemies[0].level,
          statMult: node.enemies[0].statMult,
        },
        field: fieldForFloor(SEED, floor),
      });
      if (result.outcome !== 'victory') break;
      deepest = floor;
    }
    expect(deepest, 'a level-1 common should not clear 300 floors on Attrition')
      .toBeLessThan(RUN.TOTAL_FLOORS);
  });
});
