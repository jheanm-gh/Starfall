/* The hub. Roster selection, mode, difficulty and doctrine all happen
   here, and the roster-cost budget (§7) is the constraint that makes the
   choice interesting rather than a checklist. */

import { useMemo, useState } from 'react';
import type { Difficulty, GameMode } from '../../engine/types';
import { DIFFICULTY, ROSTER, RUN } from '../../data/balance';
import { DOCTRINES, type DoctrineId } from '../../data/commander';
import { HERO_LIST, getHero } from '../../data/registry';
import { deriveSeed, shuffle } from '../../engine/rng';
import { useAccount } from '../../state/accountStore';
import { useRun } from '../../state/runStore';
import { useUi } from '../../state/uiStore';
import { Button, Empty, Panel, Portrait, RarityFrame, SectionLabel, StatRow } from '../shared/primitives';

const MODE_COPY: Record<GameMode, { name: string; rules: string }> = {
  story: { name: 'Story', rules: '300 floors, resumable, revives available.' },
  endless: { name: 'Endless', rules: 'Infinite floors, scaling difficulty, ranked by depth.' },
  ironman: { name: 'Ironman', rules: 'No revives. One save slot, deleted on death.' },
  draft: { name: 'Draft', rules: 'Twelve heroes offered, pick five, roster budget ignored.' },
};

const DIFFICULTY_COPY: Record<Difficulty, string> = {
  standard: 'Baseline.',
  hardened: 'Enemy stats ×1.25, one fewer revive, bosses gain a second phase. Salvage ×1.5.',
  attrition: 'Enemy stats ×1.5, no revives, HULL does not restore between floors. Salvage ×2.25.',
};

export function BridgeScreen() {
  const account = useAccount((s) => s.account);
  const budget = useAccount((s) => s.rosterBudget());
  const maxHeroes = useAccount((s) => s.maxHeroes());
  const run = useRun((s) => s.run);
  const startRun = useRun((s) => s.startRun);
  const abandonRun = useRun((s) => s.abandonRun);
  const setScreen = useUi((s) => s.setScreen);
  const toast = useUi((s) => s.toast);

  const [mode, setMode] = useState<GameMode>('story');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [picked, setPicked] = useState<string[]>([]);
  const [doctrine, setDoctrine] = useState<DoctrineId | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  const ownedHeroes = useMemo(
    () => HERO_LIST.filter((h) => account.heroes[h.id]),
    [account.heroes],
  );

  // Draft mode ignores roster cost and offers twelve at random (§12).
  const draftOffer = useMemo(() => {
    if (mode !== 'draft') return null;
    const pool = ownedHeroes.length >= 12 ? ownedHeroes : HERO_LIST;
    return shuffle(deriveSeed(account.createdAt, account.stats.runs, 0xd4af7), 0, pool).value.slice(0, 12);
  }, [mode, ownedHeroes, account.createdAt, account.stats.runs]);

  const selectable = mode === 'draft' ? draftOffer ?? [] : ownedHeroes;

  const spent = picked.reduce((sum, id) => sum + ROSTER.COST[getHero(id).rarity], 0);
  const overBudget = mode !== 'draft' && spent > budget;

  // Three doctrines offered, one taken (§9.4).
  const doctrineOffer = useMemo(
    () => shuffle(deriveSeed(account.createdAt, account.stats.runs, 0xd0c), 0, DOCTRINES).value.slice(0, 3),
    [account.createdAt, account.stats.runs],
  );

  const unlocked: Record<GameMode, boolean> = {
    story: true,
    endless: account.unlocks.endless,
    ironman: account.unlocks.ironman,
    draft: account.unlocks.draft,
  };

  function toggle(id: string) {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      if (current.length >= maxHeroes) return current;
      return [...current, id];
    });
  }

  function launch() {
    if (picked.length === 0) { toast('Pick at least one hero.', 'bad'); return; }
    if (overBudget) { toast('Over the roster budget.', 'bad'); return; }
    startRun({ mode, difficulty, roster: picked, doctrine });
    setScreen('run');
  }

  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
      <Panel className="p-3">
        <SectionLabel right={`${account.salvage} Salvage`}>Bridge</SectionLabel>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <StatRow label="Commander rank" value={account.commander.rank} />
            <StatRow label="Roster budget" value={budget} sub={`max ${ROSTER.MAX_BUDGET}`} />
            <StatRow label="Heroes recovered" value={`${ownedHeroes.length} / ${HERO_LIST.length}`} />
          </div>
          <div>
            <StatRow label="Runs" value={account.stats.runs} />
            <StatRow label="Deepest floor" value={account.stats.bestFloor} sub={`of ${RUN.TOTAL_FLOORS}`} />
            <StatRow label="Summon beacons" value={account.summonItems} />
          </div>
          <div>
            <StatRow label="Endless" value={unlocked.endless ? 'open' : 'clear Story'} />
            <StatRow label="Ironman" value={unlocked.ironman ? 'open' : 'clear Story'} />
            <StatRow label="Draft" value={unlocked.draft ? 'open' : 'reach floor 100'} />
          </div>
        </div>
      </Panel>

      {run ? (
        <Panel className="p-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-2)' }}>Run in progress</div>
            <div className="text-xs" style={{ color: 'var(--bone-dim)' }}>
              {MODE_COPY[run.mode].name} · {run.difficulty} · floor {run.floor} · {run.roster.filter((h) => h.alive).length} alive
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--bone-faint)' }}>
              Abandoning keeps Salvage, hero unlocks and fragments. Levels, runes and Scrip are lost.
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setScreen('run')}>Resume</Button>
            {/* A run must be endable from here. Reaching the abandon control
                on the run map is not always possible — a fight you cannot act
                in has no route back to it. */}
            <Button
              variant="danger"
              onClick={() => setConfirmAbandon(true)}
            >
              Abandon run
            </Button>
          </div>
        </Panel>
      ) : null}

      {confirmAbandon && run ? (
        <Panel className="p-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: 'var(--oxide)' }}>
          <span className="text-sm">
            End the run on floor {run.floor}? Run-scoped progress is lost; Salvage and unlocks are kept.
          </span>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={async () => {
                await abandonRun();
                setConfirmAbandon(false);
                toast('Run ended.', 'neutral');
              }}
            >
              End it
            </Button>
            <Button onClick={() => setConfirmAbandon(false)}>Keep going</Button>
          </div>
        </Panel>
      ) : null}

      <Panel className="p-3">
        <SectionLabel>Launch</SectionLabel>

        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          {(Object.keys(MODE_COPY) as GameMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className="btn text-left"
              disabled={!unlocked[m]}
              onClick={() => { setMode(m); setPicked([]); }}
              style={{ borderColor: mode === m ? 'var(--amber)' : 'var(--seam)' }}
            >
              <b style={{ fontFamily: 'var(--font-display)' }}>{MODE_COPY[m].name}</b>
              <span className="block text-xs" style={{ color: 'var(--bone-dim)' }}>{MODE_COPY[m].rules}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          {(Object.keys(DIFFICULTY) as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              className="btn text-left"
              onClick={() => setDifficulty(d)}
              style={{ borderColor: difficulty === d ? 'var(--amber)' : 'var(--seam)' }}
            >
              <b style={{ fontFamily: 'var(--font-display)', textTransform: 'capitalize' }}>{d}</b>
              <span className="block text-xs" style={{ color: 'var(--bone-dim)' }}>{DIFFICULTY_COPY[d]}</span>
            </button>
          ))}
        </div>

        <div className="mb-3">
          <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>
            Doctrine — one per run. These are rule changes, not multipliers.
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {doctrineOffer.map((d) => (
              <button
                key={d.id}
                type="button"
                className="btn text-left"
                onClick={() => setDoctrine(doctrine === d.id ? null : d.id)}
                style={{ borderColor: doctrine === d.id ? 'var(--amber)' : 'var(--seam)' }}
              >
                <b style={{ fontFamily: 'var(--font-display)' }}>{d.name}</b>
                <span className="block text-xs" style={{ color: 'var(--bone-dim)' }}>{d.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="text-xs" style={{ color: 'var(--bone-dim)' }}>
            {mode === 'draft' ? 'Draft offer — budget ignored' : 'Crew'}
          </span>
          <span className="tnum text-xs" style={{ color: overBudget ? 'var(--oxide)' : 'var(--bone-dim)' }}>
            {picked.length} / {maxHeroes} heroes · {spent} / {mode === 'draft' ? '∞' : budget} points
          </span>
        </div>

        {selectable.length === 0 ? <Empty>Nothing available to crew with.</Empty> : null}
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))' }}>
          {selectable.map((h) => {
            const on = picked.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => toggle(h.id)}
                className="text-left"
                style={{ background: 'none', border: 0, padding: 0, opacity: on ? 1 : 0.72 }}
              >
                <RarityFrame rarity={h.rarity} className="p-2" style={{ outline: on ? '2px solid var(--amber)' : 'none', outlineOffset: 2 }}>
                  <Portrait hero={h} size={112} />
                  <div className="mt-1 truncate text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{h.name}</div>
                  <div className="tnum text-xs" style={{ color: 'var(--bone-faint)' }}>
                    {ROSTER.COST[h.rarity]} pts · A{account.heroes[h.id]?.ascension ?? 1}
                  </div>
                </RarityFrame>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2 flex-wrap">
          <Button variant="primary" onClick={launch} disabled={picked.length === 0 || overBudget || !!run}>
            {run ? 'Finish the current run first' : 'Launch'}
          </Button>
          <Button onClick={() => setPicked([])}>Clear</Button>
        </div>
      </Panel>
    </div>
  );
}
