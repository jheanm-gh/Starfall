/* Run-scoped state (§9.1 right-hand column, §11, §13).

   Everything here dies with the run: hero levels, runes, Scrip,
   consumables and field buffs. The store serialises whole — including the
   combat RNG cursor — so a refresh mid-fight resumes exactly where it
   stopped. */

import { create } from 'zustand';
import type {
  CombatState, Difficulty, FloorNode, GameMode, GearSlot, RunHero, RunRewards, SkillId,
} from '../engine/types';
import { DIFFICULTY, LEVELLING, RUN } from '../data/balance';
import { CHASSIS } from '../data/gear';
import { getItem, type ItemId } from '../data/items';
import { getRune } from '../data/runes';
import { getHero } from '../data/registry';
import type { DoctrineId } from '../data/commander';
import { COMMANDER_SKILLS } from '../data/commander';
import { skillsForAscension } from '../engine/combat/build';
import { startCombat, step } from '../engine/combat/resolve';
import { executeSkill } from '../engine/combat/resolve';
import { applyExp, levelCap } from '../engine/meta/ascension';
import { generateFloor, fieldForFloor } from '../engine/run/floorGen';
import { generateStock, startingScrip, type MerchantStock } from '../engine/run/economy';
import { emptyRewards, mergeRewards, rewardsForFloor } from '../engine/run/rewards';
import { HULL_SCALE } from '../data/balance';
import { statAtLevel } from '../engine/combat/build';
import { RUN_SCHEMA, clearRun, loadRun, saveRun } from './persist';
import { useAccount } from './accountStore';

export type RunPhase = 'map' | 'combat' | 'reward' | 'event' | 'merchant' | 'defeat' | 'victory';

export interface RunSave {
  schema: number;
  seed: number;
  mode: GameMode;
  difficulty: Difficulty;
  floor: number;
  phase: RunPhase;
  roster: RunHero[];
  activeIndex: number;
  scrip: number;
  items: Record<ItemId, number>;
  doctrine: DoctrineId | null;
  revives: number;
  node: FloorNode | null;
  /** Which blueprint in the node is currently engaged (boss phases). */
  enemyIndex: number;
  combat: CombatState | null;
  merchant: MerchantStock | null;
  pendingRewards: RunRewards;
  commanderCooldowns: Record<string, number>;
  eventIndex: number;
  eventResult: string | null;
  journal: string[];
  startedAt: number;
}

function maxHullFor(defId: string, level: number): number {
  return Math.max(1, Math.round(statAtLevel(getHero(defId), 'hull', level) * HULL_SCALE));
}

function freshRunHero(defId: string): RunHero {
  // §9.1: levels reset to 1 every run. This is what keeps floor 1
  // dangerous on run fifty.
  return {
    defId,
    level: 1,
    exp: 0,
    currentHull: maxHullFor(defId, 1),
    statuses: [],
    gear: { weapon: null, plating: null, core: null, auxiliary: null },
    alive: true,
  };
}

interface RunStore {
  run: RunSave | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  persist: () => void;
  startRun: (opts: { mode: GameMode; difficulty: Difficulty; roster: string[]; doctrine: DoctrineId | null; seed?: number }) => void;
  abandonRun: () => Promise<void>;

  enterFloor: () => void;
  useSkill: (skillId: SkillId) => void;
  useCommanderSkill: (slot: number) => void;
  concludeCombat: () => void;
  advanceFloor: () => void;

  setActiveHero: (index: number) => void;
  socketRune: (heroIndex: number, slot: GearSlot, socket: number, runeId: string | null) => void;
  buyRune: (index: number) => boolean;
  buyItem: (index: number) => boolean;
  rerollMerchant: () => boolean;
  useItem: (itemId: ItemId, heroIndex: number) => boolean;
  resolveEvent: (choice: string) => void;
  leaveNode: () => void;

  activeHero: () => RunHero | null;
}

function heroSpecFor(run: RunSave, hero: RunHero) {
  const account = useAccount.getState();
  const instance = account.account.heroes[hero.defId];
  const ascension = instance?.ascension ?? 1;
  const loadout = account.account.loadouts[hero.defId] ?? {};

  const traits = (Object.keys(loadout) as GearSlot[])
    .map((slot) => loadout[slot])
    .filter((id): id is string => !!id && !!CHASSIS[id])
    .map((id) => CHASSIS[id].trait);

  // Runes are the only stat layer, and they evaporate at run end (§9.3).
  const runeEffects = (Object.keys(hero.gear) as GearSlot[]).flatMap((slot) => {
    const gear = hero.gear[slot];
    if (!gear) return [];
    return gear.runes.filter((r): r is string => !!r).flatMap((id) => getRune(id).effects);
  });

  if (run.doctrine === 'opening_gambit') traits.push('opening_priority');
  if (run.doctrine === 'persistent_afflictions') traits.push('dot_extend');

  return {
    defId: hero.defId,
    level: hero.level,
    currentHull: hero.currentHull,
    skills: skillsForAscension(getHero(hero.defId), ascension),
    traits,
    runeEffects,
    auraPercent: account.auraPercent(),
  };
}

export const useRun = create<RunStore>((setState, getState) => ({
  run: null,
  hydrated: false,

  hydrate: async () => {
    const loaded = await loadRun<RunSave>();
    setState({ run: loaded, hydrated: true });
  },

  persist: () => {
    const { run } = getState();
    if (run) void saveRun(run);
  },

  startRun: ({ mode, difficulty, roster, doctrine, seed }) => {
    const account = useAccount.getState();
    const logistics = account.account.commander.logistics;
    const runSeed = seed ?? (Date.now() ^ (Math.random() * 0xffffffff)) | 0;

    const run: RunSave = {
      schema: RUN_SCHEMA,
      seed: runSeed,
      mode,
      difficulty,
      floor: 1,
      phase: 'map',
      roster: roster.map(freshRunHero),
      activeIndex: 0,
      scrip: startingScrip(difficulty, logistics.includes('log_scrip') ? 80 : 0),
      items: {},
      doctrine,
      revives: DIFFICULTY[difficulty].revives + (logistics.includes('log_revive') ? 1 : 0),
      node: null,
      enemyIndex: 0,
      combat: null,
      merchant: null,
      pendingRewards: emptyRewards(),
      commanderCooldowns: {},
      eventIndex: 0,
      eventResult: null,
      journal: [`Run seed ${runSeed >>> 0} — ${mode}, ${difficulty}.`],
      startedAt: Date.now(),
    };
    setState({ run });
    void saveRun(run);
  },

  abandonRun: async () => {
    const { run } = getState();
    if (run) {
      useAccount.getState().recordRun(run.floor - 1, run.floor - 1, run.mode);
    }
    setState({ run: null });
    await clearRun();
  },

  enterFloor: () => {
    const { run } = getState();
    if (!run) return;
    const node = generateFloor(run.seed, run.floor, run.difficulty);
    node.field = fieldForFloor(run.seed, run.floor);

    if (node.kind === 'event') {
      const next: RunSave = {
        ...run,
        node,
        phase: node.eventKind === 'merchant' ? 'merchant' : 'event',
        merchant: node.eventKind === 'merchant'
          ? generateStock(run.seed, run.floor, {
            shopTier: useAccount.getState().account.commander.logistics.includes('log_shop_tier') ? 1 : 0,
            rerolls: 1 + (useAccount.getState().account.commander.logistics.includes('log_reroll') ? 1 : 0),
          })
          : null,
        eventResult: null,
      };
      setState({ run: next });
      void saveRun(next);
      return;
    }

    const hero = run.roster[run.activeIndex];
    if (!hero || !hero.alive) return;
    const blueprint = node.enemies[0];

    const combat = startCombat({
      seed: (run.seed ^ (run.floor * 0x9e37)) | 0,
      player: heroSpecFor(run, hero),
      enemy: {
        defId: blueprint.defId,
        level: blueprint.level,
        statMult: blueprint.statMult,
        nameOverride: blueprint.title
          ? `${getHero(blueprint.defId).name} ${blueprint.title}`
          : undefined,
      },
      field: node.field,
    });

    const next: RunSave = { ...run, node, enemyIndex: 0, combat, phase: 'combat' };
    setState({ run: next });
    void saveRun(next);
  },

  useSkill: (skillId) => {
    const { run } = getState();
    if (!run?.combat || run.combat.outcome !== 'active') return;
    const combat = step(run.combat, { type: 'USE_SKILL', skillId });
    const next: RunSave = { ...run, combat };
    setState({ run: next });
    void saveRun(next);
  },

  useCommanderSkill: (slot) => {
    const { run } = getState();
    if (!run?.combat || run.combat.outcome !== 'active') return;
    const skillId = useAccount.getState().account.commander.skills[slot];
    if (!skillId) return;
    const def = COMMANDER_SKILLS.find((s) => s.id === skillId);
    if (!def) return;
    if ((run.commanderCooldowns[skillId] ?? 0) > 0) return;

    // Commander skills resolve as a free action, outside the turn economy.
    const combat = structuredClone(run.combat);
    combat.player.skills = [...combat.player.skills, def.id];
    combat.player.cooldowns[def.id] = 0;
    executeSkill(combat, 'player', def.id);
    combat.player.skills = combat.player.skills.filter((s) => s !== def.id);
    delete combat.player.cooldowns[def.id];

    const next: RunSave = {
      ...run,
      combat,
      commanderCooldowns: { ...run.commanderCooldowns, [skillId]: def.cooldown },
    };
    setState({ run: next });
    void saveRun(next);
  },

  concludeCombat: () => {
    const { run } = getState();
    if (!run?.combat || !run.node) return;
    const account = useAccount.getState();
    const combat = run.combat;
    const roster = structuredClone(run.roster);
    const hero = roster[run.activeIndex];

    hero.currentHull = combat.player.hull;
    hero.alive = combat.player.alive && combat.player.hull > 0;

    if (combat.outcome === 'victory') {
      // Boss phases: the next blueprint engages immediately, carrying HULL.
      const nextIndex = run.enemyIndex + 1;
      if (nextIndex < run.node.enemies.length) {
        const blueprint = run.node.enemies[nextIndex];
        const nextCombat = startCombat({
          seed: (run.seed ^ (run.floor * 0x9e37) ^ (nextIndex * 0x1f1f)) | 0,
          player: { ...heroSpecFor(run, hero), currentHull: hero.currentHull },
          enemy: {
            defId: blueprint.defId, level: blueprint.level, statMult: blueprint.statMult,
            nameOverride: `${getHero(blueprint.defId).name} ${blueprint.title ?? ''}`.trim(),
          },
          field: run.node.field,
        });
        const mid: RunSave = { ...run, roster, enemyIndex: nextIndex, combat: nextCombat };
        setState({ run: mid });
        void saveRun(mid);
        return;
      }

      const rewards = rewardsForFloor(run.node, {
        runSeed: run.seed,
        difficulty: run.difficulty,
        expMult: 1 + account.account.commander.rank * 0.012,
        scripMult: 1 + account.account.commander.rank * 0.012,
      });
      if (run.doctrine === 'salvage_dividend' && run.floor % 10 === 0) {
        rewards.runes.push(...rewardsForFloor(run.node, {
          runSeed: run.seed ^ 0x51a1, difficulty: run.difficulty, expMult: 1, scripMult: 1,
        }).runes);
      }

      // EXP goes to the whole surviving roster; only levels, never stats.
      for (const member of roster) {
        if (!member.alive) continue;
        const instance = account.account.heroes[member.defId];
        const cap = Math.min(LEVELLING.MAX_LEVEL, levelCap(instance?.ascension ?? 1));
        const applied = applyExp(member.level, member.exp, rewards.exp, cap);
        if (applied.level !== member.level) {
          const ratio = member.currentHull / maxHullFor(member.defId, member.level);
          member.level = applied.level;
          member.currentHull = Math.round(maxHullFor(member.defId, member.level) * ratio);
        }
        member.exp = applied.exp;
      }

      account.addSalvage(rewards.salvage);
      const next: RunSave = {
        ...run,
        roster,
        phase: 'reward',
        scrip: run.scrip + rewards.scrip,
        pendingRewards: mergeRewards(run.pendingRewards, rewards),
        journal: [...run.journal, `Floor ${run.floor} cleared.`].slice(-60),
      };
      setState({ run: next });
      void saveRun(next);
      return;
    }

    // Defeat, or a draw treated as a defeat for the engaged hero.
    hero.alive = false;
    hero.currentHull = 0;
    const survivors = roster.filter((h) => h.alive);
    let revives = run.revives;
    if (survivors.length === 0 && revives > 0) {
      revives -= 1;
      hero.alive = true;
      hero.currentHull = Math.round(maxHullFor(hero.defId, hero.level) * 0.4);
    }

    const stillAlive = roster.some((h) => h.alive);
    const next: RunSave = {
      ...run,
      roster,
      revives,
      combat: null,
      phase: stillAlive ? 'map' : 'defeat',
      activeIndex: stillAlive ? roster.findIndex((h) => h.alive) : run.activeIndex,
      journal: [...run.journal, `${getHero(hero.defId).name} lost on floor ${run.floor}.`].slice(-60),
    };
    setState({ run: next });
    void saveRun(next);
    if (!stillAlive) {
      account.recordRun(run.floor - 1, run.floor, run.mode);
      if (run.mode === 'ironman') void clearRun();
    }
  },

  advanceFloor: () => {
    const { run } = getState();
    if (!run) return;
    const diff = DIFFICULTY[run.difficulty];
    const roster = structuredClone(run.roster);

    // §12: Attrition does not restore HULL between floors — only at events.
    if (diff.healBetweenFloors) {
      const bonus = run.doctrine === 'triage_line' ? 0.15 : 0;
      for (const hero of roster) {
        if (!hero.alive) continue;
        const max = maxHullFor(hero.defId, hero.level);
        hero.currentHull = Math.min(max, hero.currentHull + Math.round(max * (RUN.BETWEEN_FLOOR_HEAL + bonus)));
      }
    }

    const cooldowns: Record<string, number> = {};
    for (const [id, turns] of Object.entries(run.commanderCooldowns)) {
      if (turns > 1) cooldowns[id] = turns - 1;
    }

    const isLastFloor = run.mode === 'story' && run.floor >= RUN.TOTAL_FLOORS;
    const next: RunSave = {
      ...run,
      roster,
      floor: run.floor + 1,
      phase: isLastFloor ? 'victory' : 'map',
      node: null,
      combat: null,
      merchant: null,
      enemyIndex: 0,
      commanderCooldowns: cooldowns,
      pendingRewards: emptyRewards(),
      eventResult: null,
    };
    setState({ run: next });
    void saveRun(next);
    if (isLastFloor) {
      useAccount.getState().recordRun(RUN.TOTAL_FLOORS, RUN.TOTAL_FLOORS, run.mode);
    }
  },

  setActiveHero: (index) => {
    const { run } = getState();
    if (!run || !run.roster[index]?.alive) return;
    const next = { ...run, activeIndex: index };
    setState({ run: next });
    void saveRun(next);
  },

  socketRune: (heroIndex, slot, socket, runeId) => {
    const { run } = getState();
    if (!run) return;
    const account = useAccount.getState();
    const roster = structuredClone(run.roster);
    const hero = roster[heroIndex];
    if (!hero) return;

    const chassisId = account.account.loadouts[hero.defId]?.[slot];
    if (!chassisId) return;
    const chassis = CHASSIS[chassisId];
    if (!chassis || socket >= chassis.sockets) return;

    const current = hero.gear[slot] ?? { chassisId, runes: new Array(chassis.sockets).fill(null) };
    const runes = [...current.runes];
    while (runes.length < chassis.sockets) runes.push(null);
    runes[socket] = runeId;
    hero.gear[slot] = { chassisId, runes };

    // Socketing consumes the rune from the run's pool.
    const pending = { ...run.pendingRewards };
    if (runeId) {
      const idx = pending.runes.indexOf(runeId);
      if (idx >= 0) pending.runes = pending.runes.filter((_, i) => i !== idx);
    }

    const next = { ...run, roster, pendingRewards: pending };
    setState({ run: next });
    void saveRun(next);
  },

  buyRune: (index) => {
    const { run } = getState();
    if (!run?.merchant) return false;
    const entry = run.merchant.runes[index];
    if (!entry) return false;
    const free = run.doctrine === 'free_first_socket' && !run.journal.includes('__free_socket_used');
    const price = free ? 0 : entry.price;
    if (run.scrip < price) return false;
    const merchant: MerchantStock = { ...run.merchant, runes: run.merchant.runes.filter((_, i) => i !== index) };
    const next: RunSave = {
      ...run,
      scrip: run.scrip - price,
      merchant,
      pendingRewards: { ...run.pendingRewards, runes: [...run.pendingRewards.runes, entry.runeId] },
      journal: free ? [...run.journal, '__free_socket_used'] : run.journal,
    };
    setState({ run: next });
    void saveRun(next);
    return true;
  },

  buyItem: (index) => {
    const { run } = getState();
    if (!run?.merchant) return false;
    const entry = run.merchant.items[index];
    if (!entry || run.scrip < entry.price) return false;
    const merchant: MerchantStock = { ...run.merchant, items: run.merchant.items.filter((_, i) => i !== index) };
    const items = { ...run.items, [entry.itemId]: (run.items[entry.itemId] ?? 0) + 1 };
    const next: RunSave = { ...run, scrip: run.scrip - entry.price, merchant, items };
    setState({ run: next });
    void saveRun(next);
    return true;
  },

  rerollMerchant: () => {
    const { run } = getState();
    if (!run?.merchant || run.merchant.rerolls <= 0) return false;
    const merchant = generateStock(run.seed, run.floor, {
      shopTier: useAccount.getState().account.commander.logistics.includes('log_shop_tier') ? 1 : 0,
      rerolls: run.merchant.rerolls - 1,
      rerollIndex: run.eventIndex + 1,
    });
    const next: RunSave = { ...run, merchant, eventIndex: run.eventIndex + 1 };
    setState({ run: next });
    void saveRun(next);
    return true;
  },

  useItem: (itemId, heroIndex) => {
    const { run } = getState();
    if (!run || (run.items[itemId] ?? 0) <= 0) return false;
    const def = getItem(itemId);
    const roster = structuredClone(run.roster);
    const hero = roster[heroIndex];
    if (!hero) return false;

    if (def.kind === 'repair') {
      if (!hero.alive) return false;
      const max = maxHullFor(hero.defId, hero.level);
      hero.currentHull = Math.min(max, hero.currentHull + Math.round(max * (def.percent ?? 0)));
    } else if (def.kind === 'revive') {
      if (hero.alive) return false;
      hero.alive = true;
      hero.currentHull = Math.round(maxHullFor(hero.defId, hero.level) * (def.percent ?? 0.5));
    } else if (def.kind !== 'buff') {
      return false;
    }

    const items = { ...run.items, [itemId]: run.items[itemId] - 1 };
    const next: RunSave = { ...run, roster, items };
    setState({ run: next });
    void saveRun(next);
    return true;
  },

  resolveEvent: (choice) => {
    const { run } = getState();
    if (!run?.node) return;
    const account = useAccount.getState();
    const roster = structuredClone(run.roster);
    let scrip = run.scrip;
    let result = '';

    switch (choice) {
      case 'repair': {
        for (const hero of roster) {
          if (!hero.alive) continue;
          hero.currentHull = maxHullFor(hero.defId, hero.level);
        }
        result = 'Every surviving frame restored to full HULL.';
        break;
      }
      case 'salvage': {
        const gain = 40 + run.floor * 3;
        account.addSalvage(gain);
        result = `Stripped the hulk for ${gain} Salvage.`;
        break;
      }
      case 'scrip': {
        const gain = 60 + run.floor * 4;
        scrip += gain;
        result = `Sold the manifest for ${gain} Scrip.`;
        break;
      }
      case 'risk': {
        // Derelict: real risk, real reward. Half the roster takes damage.
        const gain = 150 + run.floor * 8;
        for (const hero of roster) {
          if (!hero.alive) continue;
          const max = maxHullFor(hero.defId, hero.level);
          hero.currentHull = Math.max(1, hero.currentHull - Math.round(max * 0.25));
        }
        scrip += gain;
        result = `Cut the reactor loose: ${gain} Scrip, and everyone took the blast.`;
        break;
      }
      case 'summon': {
        result = 'Beacon acquired at the shrine.';
        account.mutate((draft) => { draft.summonItems += 1; });
        break;
      }
      default:
        result = 'Moved on without touching anything.';
    }

    const next: RunSave = { ...run, roster, scrip, phase: 'reward', eventResult: result };
    setState({ run: next });
    void saveRun(next);
  },

  leaveNode: () => {
    getState().advanceFloor();
  },

  activeHero: () => {
    const { run } = getState();
    if (!run) return null;
    return run.roster[run.activeIndex] ?? null;
  },
}));
