/* §13 — save architecture.

   Two IndexedDB stores: `account` (permanent) and `activeRun` (resumable,
   including the RNG cursor). localStorage will not hold 150 heroes plus a
   full run state, which is why this is idb-keyval and not JSON in a string.

   Every save carries a schema number and every schema bump ships a
   migration. The schema WILL change; this is planned for, not bolted on. */

import { del, get, set } from 'idb-keyval';

export const ACCOUNT_KEY = 'starfall:account';
export const RUN_KEY = 'starfall:activeRun';

export const ACCOUNT_SCHEMA = 3;
export const RUN_SCHEMA = 2;

export interface Versioned {
  schema: number;
}

type Migration<T> = (save: T) => T;

/** Migrations are indexed by the schema they migrate FROM. */
const ACCOUNT_MIGRATIONS: Record<number, Migration<Record<string, unknown>>> = {
  1: (save) => ({
    ...save,
    // v2 introduced per-hero chassis loadouts, which did not exist in v1.
    loadouts: save.loadouts ?? {},
    schema: 2,
  }),
  2: (save) => ({
    ...save,
    // v3 split summon items out of the generic item bag.
    summonItems: save.summonItems ?? 0,
    unlocks: save.unlocks ?? {
      endless: false, ironman: false, draft: false, storyCleared: false, deepestFloor: 0,
    },
    schema: 3,
  }),
};

const RUN_MIGRATIONS: Record<number, Migration<Record<string, unknown>>> = {
  1: (save) => ({
    ...save,
    // v2 stores the event index so a floor's RNG is reproducible mid-event.
    eventIndex: save.eventIndex ?? 0,
    schema: 2,
  }),
};

function migrate<T extends Versioned>(
  save: T,
  target: number,
  migrations: Record<number, Migration<Record<string, unknown>>>,
): T | null {
  let current = save as unknown as Record<string, unknown>;
  let guard = 0;
  while ((current.schema as number) < target && guard++ < 20) {
    const step = migrations[current.schema as number];
    if (!step) return null; // No path forward: treat the save as unreadable.
    current = step(current);
  }
  return (current.schema as number) === target ? (current as unknown as T) : null;
}

export async function loadAccount<T extends Versioned>(): Promise<T | null> {
  const raw = await get<T>(ACCOUNT_KEY);
  if (!raw) return null;
  return migrate(raw, ACCOUNT_SCHEMA, ACCOUNT_MIGRATIONS);
}

export async function saveAccount<T extends Versioned>(save: T): Promise<void> {
  await set(ACCOUNT_KEY, save);
}

export async function loadRun<T extends Versioned>(): Promise<T | null> {
  const raw = await get<T>(RUN_KEY);
  if (!raw) return null;
  return migrate(raw, RUN_SCHEMA, RUN_MIGRATIONS);
}

export async function saveRun<T extends Versioned>(save: T): Promise<void> {
  await set(RUN_KEY, save);
}

export async function clearRun(): Promise<void> {
  await del(RUN_KEY);
}

export async function clearAccount(): Promise<void> {
  await del(ACCOUNT_KEY);
}

/** Exposed for the migration test, which must not touch IndexedDB. */
export const __testing = { migrate, ACCOUNT_MIGRATIONS, RUN_MIGRATIONS };
