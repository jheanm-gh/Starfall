/* §11 — seeded floor and encounter generation.

   §13: every floor derives its randomness from (runSeed, floorIndex)
   rather than a shared mutable generator, so floor 214 generates
   identically whether you reached it in one sitting or across six
   sessions — and a bug report only needs a seed and a floor number.

   Milestone cadence (flagged in §15.1 as an inference): floors ending in
   zero are milestones; odd tens are bosses, even tens are event nodes,
   and 100/200/300 override both as apex encounters. */

import type {
  Difficulty, EnemyBlueprint, EventKind, FloorNode, HeroDefinition, NodeKind, Rarity,
} from '../types';
import { DIFFICULTY, RUN, SCALING } from '../../data/balance';
import { SECTORS, sectorForFloor } from '../../data/sectors';
import { HERO_LIST } from '../../data/registry';
import { deriveSeed, pick, pickWeighted, rollChance } from '../rng';

export function isMilestone(floor: number): boolean {
  return floor % 10 === 0;
}

export function nodeKindFor(floor: number): NodeKind {
  if (RUN.APEX_FLOORS.includes(floor)) return 'apex';
  if (floor % 20 === 10) return 'boss';   // odd tens: 10, 30, 50, ...
  if (floor % 20 === 0) return 'event';   // even tens: 20, 40, 60, ...
  if (floor % 5 === 0) return 'elite';
  return 'combat';
}

const EVENT_KINDS: EventKind[] = ['merchant', 'gacha_shrine', 'derelict', 'rescue', 'gauntlet'];
const EVENT_WEIGHTS = [34, 16, 20, 15, 15];

/** Rarity of the opposition, by node kind. Enemies do not use the pity table. */
const ENEMY_RARITY_WEIGHTS: Record<NodeKind, Record<Rarity, number>> = {
  combat: { common: 62, uncommon: 28, rare: 9, epic: 1, legendary: 0 },
  elite: { common: 22, uncommon: 40, rare: 30, epic: 8, legendary: 0 },
  boss: { common: 0, uncommon: 12, rare: 48, epic: 36, legendary: 4 },
  apex: { common: 0, uncommon: 0, rare: 0, epic: 30, legendary: 70 },
  event: { common: 60, uncommon: 30, rare: 10, epic: 0, legendary: 0 },
  merchant: { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  rest: { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
};

const BOSS_TITLES = [
  'the Unquiet', 'Wreckwarden', 'of the Long Silence', 'Hullbreaker', 'the Tithe-Taker',
  'Cold Anchor', 'the Last Shift', 'Ashfall', 'Deadweight', 'the Standing Order',
];

const APEX_TITLES: Record<number, string> = {
  100: 'THE TITHE-TAKER',
  200: 'THE STANDING ORDER',
  300: 'STARFALL',
};

function candidatePool(floor: number, kind: NodeKind, seed: number): HeroDefinition[] {
  const sector = sectorForFloor(floor);
  const weights = ENEMY_RARITY_WEIGHTS[kind];
  const rarities = (Object.keys(weights) as Rarity[]).filter((r) => weights[r] > 0);
  const picked = pickWeighted(seed, 0, rarities, rarities.map((r) => weights[r]));

  // Prefer the sector's own races; fall back to the whole roster when a
  // race has nothing at the drawn rarity yet (true during content build-out).
  const inSector = HERO_LIST.filter(
    (h) => sector.enemyRaces.includes(h.race) && h.rarity === picked.value,
  );
  if (inSector.length > 0) return inSector;
  const anyRace = HERO_LIST.filter((h) => h.rarity === picked.value);
  return anyRace.length > 0 ? anyRace : HERO_LIST;
}

export function generateFloor(runSeed: number, floor: number, difficulty: Difficulty): FloorNode {
  const seed = deriveSeed(runSeed, floor, 0x5f10);
  const kind = nodeKindFor(floor);
  const sector = sectorForFloor(floor);
  const diff = DIFFICULTY[difficulty];

  if (kind === 'event') {
    const ev = pickWeighted(seed, 0, EVENT_KINDS, EVENT_WEIGHTS);
    return {
      floor, kind: 'event', sector: sector.index, field: sector.field,
      enemies: [], eventKind: ev.value,
    };
  }

  const pool = candidatePool(floor, kind, deriveSeed(seed, 1));
  const chosen = pick(deriveSeed(seed, 2), 0, pool);
  const level = SCALING.enemyLevel(floor);
  const statMult = SCALING.NODE_STAT_MULT[kind] * diff.enemyStatMult;

  let title: string | undefined;
  if (kind === 'apex') {
    title = APEX_TITLES[floor] ?? 'APEX';
  } else if (kind === 'boss') {
    const t = pick(deriveSeed(seed, 3), 0, BOSS_TITLES);
    title = t.value;
  }

  // A boss on Hardened or Attrition gains a second phase (§12), modelled
  // as a second, tougher blueprint queued behind the first.
  const enemies: EnemyBlueprint[] = [{
    defId: chosen.value.id,
    level,
    statMult,
    isBoss: kind === 'boss' || kind === 'apex',
    title,
  }];

  if ((kind === 'boss' || kind === 'apex') && diff.bossPhases > 1) {
    const second = pick(deriveSeed(seed, 4), 0, candidatePool(floor, kind, deriveSeed(seed, 5)));
    enemies.push({
      defId: second.value.id,
      level: Math.min(60, level + 2),
      statMult: statMult * 1.12,
      isBoss: true,
      title: `${title ?? 'Second'} — second phase`,
    });
  }

  return { floor, kind, sector: sector.index, field: sector.field, enemies };
}

/** The condition actually in force, allowing for rare local anomalies. */
export function fieldForFloor(runSeed: number, floor: number): FloorNode['field'] {
  const sector = sectorForFloor(floor);
  if (RUN.APEX_FLOORS.includes(floor)) return sector.field;
  const anomaly = rollChance(deriveSeed(runSeed, floor, 0xf1e1d), 0, 0.12);
  if (!anomaly.value) return sector.field;
  const other = pick(deriveSeed(runSeed, floor, 0xa11), 0, SECTORS.map((s) => s.field));
  return other.value;
}

export function floorsInSector(sectorIndex: number): [number, number] {
  return [sectorIndex * RUN.SECTOR_SIZE + 1, (sectorIndex + 1) * RUN.SECTOR_SIZE];
}
