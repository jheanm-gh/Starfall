/* Permanent account state (§9.1 left-hand column).

   Nothing here grants raw stats. Hero unlocks, ascension tiers, gear
   chassis, Commander rank, Salvage, cosmetics and mode unlocks are all
   capacity, options or access — with the single capped aura exception
   from §9.4. */

import { create } from 'zustand';
import type { Ascension, GameMode, GearSlot, HeroInstance } from '../engine/types';
import { COMMANDER, GACHA, ROSTER } from '../data/balance';
import { STARTER_CHASSIS } from '../data/gear';
import { getHero } from '../data/registry';
import { ascensionCost } from '../engine/meta/ascension';
import { emptyPity, type PityState } from '../engine/meta/gacha';
import { rosterBudgetForRank } from '../data/commander';
import { ACCOUNT_SCHEMA, loadAccount, saveAccount } from './persist';

export interface AccountUnlocks {
  endless: boolean;
  ironman: boolean;
  draft: boolean;
  storyCleared: boolean;
  deepestFloor: number;
}

export interface AccountStats {
  runs: number;
  floorsCleared: number;
  kills: number;
  deaths: number;
  pulls: number;
  bestFloor: number;
}

export interface AccountSave {
  schema: number;
  heroes: Record<string, HeroInstance>;
  chassis: string[];
  loadouts: Record<string, Partial<Record<GearSlot, string | null>>>;
  commander: {
    rank: number;
    salvageSpent: number;
    skills: (string | null)[];
    logistics: string[];
  };
  salvage: number;
  pity: PityState;
  summonItems: number;
  cosmetics: string[];
  unlocks: AccountUnlocks;
  stats: AccountStats;
  createdAt: number;
  updatedAt: number;
}

export function newAccount(): AccountSave {
  return {
    schema: ACCOUNT_SCHEMA,
    // A new account opens with one common Terran so the first run is playable.
    heroes: {
      terran_corpsman: { defId: 'terran_corpsman', ascension: 1, fragments: 0, acquiredAt: Date.now() },
      terran_breacher: { defId: 'terran_breacher', ascension: 1, fragments: 0, acquiredAt: Date.now() },
      terran_scout: { defId: 'terran_scout', ascension: 1, fragments: 0, acquiredAt: Date.now() },
    },
    chassis: [...STARTER_CHASSIS],
    loadouts: {},
    commander: { rank: 1, salvageSpent: 0, skills: ['cmd_emergency_repair', null], logistics: [] },
    salvage: 0,
    pity: emptyPity(),
    summonItems: 1,
    cosmetics: [],
    unlocks: { endless: false, ironman: false, draft: false, storyCleared: false, deepestFloor: 0 },
    stats: { runs: 0, floorsCleared: 0, kills: 0, deaths: 0, pulls: 0, bestFloor: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface AccountStore {
  account: AccountSave;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  mutate: (fn: (draft: AccountSave) => void) => void;

  grantHero: (defId: string) => { duplicate: boolean; fragments: number };
  addFragments: (defId: string, amount: number) => void;
  ascend: (defId: string) => boolean;
  addSalvage: (amount: number) => void;
  spendSalvage: (amount: number) => boolean;
  rankUp: () => boolean;
  setCommanderSkill: (slot: number, skillId: string | null) => void;
  buyChassis: (chassisId: string, cost: number) => boolean;
  setLoadout: (defId: string, slot: GearSlot, chassisId: string | null) => void;
  setPity: (pity: PityState) => void;
  recordRun: (floors: number, deepest: number, mode: GameMode) => void;
  auraPercent: () => number;
  rosterBudget: () => number;
  maxHeroes: () => number;
  reset: () => Promise<void>;
}

export const useAccount = create<AccountStore>((setState, getState) => ({
  account: newAccount(),
  hydrated: false,

  hydrate: async () => {
    const loaded = await loadAccount<AccountSave>();
    setState({ account: loaded ?? newAccount(), hydrated: true });
    if (!loaded) await saveAccount(getState().account);
  },

  persist: async () => {
    await saveAccount(getState().account);
  },

  mutate: (fn) => {
    const next = structuredClone(getState().account);
    fn(next);
    next.updatedAt = Date.now();
    setState({ account: next });
    void saveAccount(next);
  },

  grantHero: (defId) => {
    const def = getHero(defId);
    const existing = getState().account.heroes[defId];
    const duplicate = !!existing;
    const fragments = duplicate ? GACHA.DUPLICATE_FRAGMENTS[def.rarity] : 0;
    getState().mutate((draft) => {
      draft.stats.pulls += 1;
      if (duplicate) {
        draft.heroes[defId].fragments += fragments;
      } else {
        draft.heroes[defId] = { defId, ascension: 1, fragments: 0, acquiredAt: Date.now() };
      }
    });
    return { duplicate, fragments };
  },

  addFragments: (defId, amount) => {
    getState().mutate((draft) => {
      const existing = draft.heroes[defId];
      if (existing) {
        existing.fragments += amount;
      } else {
        // Fragments for an unowned hero accumulate toward a first unlock.
        draft.heroes[defId] = { defId, ascension: 1, fragments: amount, acquiredAt: 0 };
      }
    });
  },

  ascend: (defId) => {
    const state = getState();
    const instance = state.account.heroes[defId];
    if (!instance || instance.ascension >= 6) return false;
    const cost = ascensionCost(getHero(defId), instance.ascension);
    if (!cost) return false;
    if (instance.fragments < cost.fragments || state.account.salvage < cost.salvage) return false;
    state.mutate((draft) => {
      const target = draft.heroes[defId];
      target.fragments -= cost.fragments;
      target.ascension = (target.ascension + 1) as Ascension;
      draft.salvage -= cost.salvage;
    });
    return true;
  },

  addSalvage: (amount) => {
    getState().mutate((draft) => { draft.salvage += Math.max(0, Math.round(amount)); });
  },

  spendSalvage: (amount) => {
    if (getState().account.salvage < amount) return false;
    getState().mutate((draft) => { draft.salvage -= amount; });
    return true;
  },

  rankUp: () => {
    const { account } = getState();
    if (account.commander.rank >= COMMANDER.MAX_RANK) return false;
    const cost = COMMANDER.rankCost(account.commander.rank);
    if (account.salvage < cost) return false;
    getState().mutate((draft) => {
      draft.salvage -= cost;
      draft.commander.rank += 1;
      draft.commander.salvageSpent += cost;
    });
    return true;
  },

  setCommanderSkill: (slot, skillId) => {
    getState().mutate((draft) => {
      while (draft.commander.skills.length < COMMANDER.SKILL_SLOTS) draft.commander.skills.push(null);
      draft.commander.skills[slot] = skillId;
    });
  },

  buyChassis: (chassisId, cost) => {
    const { account } = getState();
    if (account.chassis.includes(chassisId) || account.salvage < cost) return false;
    getState().mutate((draft) => {
      draft.salvage -= cost;
      draft.chassis.push(chassisId);
    });
    return true;
  },

  setLoadout: (defId, slot, chassisId) => {
    getState().mutate((draft) => {
      draft.loadouts[defId] = { ...(draft.loadouts[defId] ?? {}), [slot]: chassisId };
    });
  },

  setPity: (pity) => {
    getState().mutate((draft) => { draft.pity = pity; });
  },

  recordRun: (floors, deepest, mode) => {
    getState().mutate((draft) => {
      draft.stats.runs += 1;
      draft.stats.floorsCleared += floors;
      draft.stats.bestFloor = Math.max(draft.stats.bestFloor, deepest);
      draft.unlocks.deepestFloor = Math.max(draft.unlocks.deepestFloor, deepest);
      // §12 unlock gating.
      if (deepest >= 100) draft.unlocks.draft = true;
      if (mode === 'story' && deepest >= 300) {
        draft.unlocks.storyCleared = true;
        draft.unlocks.endless = true;
        draft.unlocks.ironman = true;
      }
    });
  },

  auraPercent: () => {
    const rank = getState().account.commander.rank;
    return Math.min(COMMANDER.AURA_CAP, rank * COMMANDER.AURA_PER_RANK);
  },

  rosterBudget: () => rosterBudgetForRank(getState().account.commander.rank),

  maxHeroes: () =>
    ROSTER.MAX_HEROES + (getState().account.commander.logistics.includes('log_bench') ? 1 : 0),

  reset: async () => {
    const fresh = newAccount();
    setState({ account: fresh });
    await saveAccount(fresh);
  },
}));
