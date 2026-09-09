/* The run loop's outer shell: map, reward, event and merchant nodes.
   Combat has its own screen; everything else lives here. */

import { useMemo } from 'react';
import { HULL_SCALE, RUN } from '../../data/balance';
import { FIELDS } from '../../data/fields';
import { getItem, ITEMS } from '../../data/items';
import { getRune } from '../../data/runes';
import { getHero } from '../../data/registry';
import { SECTORS } from '../../data/sectors';
import { nodeKindFor } from '../../engine/run/floorGen';
import { sectorProgress } from '../../engine/run/sector';
import { statAtLevel } from '../../engine/combat/build';
import { useRun } from '../../state/runStore';
import { useUi } from '../../state/uiStore';
import { CombatScreen } from '../combat/CombatScreen';
import { Bar, Button, Empty, Panel, Portrait, SectionLabel } from '../shared/primitives';

const NODE_LABEL: Record<string, string> = {
  combat: 'Contact',
  elite: 'Heavy contact',
  boss: 'Boss',
  apex: 'Apex encounter',
  event: 'Event node',
  merchant: 'Merchant',
  rest: 'Quiet floor',
};

function maxHullFor(defId: string, level: number): number {
  return Math.max(1, Math.round(statAtLevel(getHero(defId), 'hull', level) * HULL_SCALE));
}

function RosterStrip() {
  const run = useRun((s) => s.run);
  const setActive = useRun((s) => s.setActiveHero);
  if (!run) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {run.roster.map((hero, i) => {
        const def = getHero(hero.defId);
        const max = maxHullFor(hero.defId, hero.level);
        const active = i === run.activeIndex;
        return (
          <button
            key={`${hero.defId}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            disabled={!hero.alive}
            className="panel text-left"
            style={{
              minWidth: 156,
              padding: 8,
              opacity: hero.alive ? 1 : 0.42,
              borderColor: active ? 'var(--amber)' : 'var(--seam)',
            }}
          >
            <div className="flex gap-2">
              <Portrait hero={def} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{def.name}</div>
                <div className="tnum text-xs" style={{ color: 'var(--bone-faint)' }}>
                  L{hero.level}{hero.alive ? '' : ' · lost'}
                </div>
                <div className="mt-1"><Bar value={hero.currentHull} max={max} height={8} label={`${def.name} HULL`} /></div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Inventory() {
  const run = useRun((s) => s.run);
  const consumeItem = useRun((s) => s.consumeItem);
  const socketRune = useRun((s) => s.socketRune);
  const toast = useUi((s) => s.toast);
  if (!run) return null;

  const owned = Object.entries(run.items).filter(([, n]) => n > 0);
  const runes = run.pendingRewards.runes;

  return (
    <Panel className="p-3">
      <SectionLabel right="destroyed at run end">Hold</SectionLabel>
      {owned.length === 0 && runes.length === 0 ? <Empty>Nothing in the hold.</Empty> : null}

      {owned.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {owned.map(([id, count]) => (
            <Button
              key={id}
              title={ITEMS[id]?.description}
              onClick={() => {
                const ok = consumeItem(id, run.activeIndex);
                toast(ok ? `${getItem(id).name} used.` : 'That cannot be used right now.', ok ? 'good' : 'bad');
              }}
            >
              {getItem(id).name} <span className="tnum">×{count}</span>
            </Button>
          ))}
        </div>
      ) : null}

      {runes.length > 0 ? (
        <div>
          <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>
            Unsocketed runes — socket them into the active hero&apos;s weapon mount.
          </div>
          <div className="flex flex-wrap gap-2">
            {runes.map((id, i) => (
              <Button
                key={`${id}-${i}`}
                title={getRune(id).description}
                onClick={() => {
                  socketRune(run.activeIndex, 'weapon', 0, id);
                  toast(`${getRune(id).name} socketed.`, 'good');
                }}
              >
                {getRune(id).name}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function MapNode() {
  const run = useRun((s) => s.run);
  const enterFloor = useRun((s) => s.enterFloor);
  const abandon = useRun((s) => s.abandonRun);
  const setScreen = useUi((s) => s.setScreen);

  const preview = useMemo(() => (run ? nodeKindFor(run.floor) : 'combat'), [run]);
  if (!run) return null;

  const progress = sectorProgress(run.floor);
  const sector = SECTORS[Math.min(SECTORS.length - 1, progress.sector.index)];
  const anyAlive = run.roster.some((h) => h.alive);

  return (
    <div className="p-3 flex flex-col gap-3 overflow-y-auto h-full">
      <Panel className="p-3">
        <SectionLabel right={`Floor ${run.floor} of ${run.mode === 'story' ? RUN.TOTAL_FLOORS : '∞'}`}>
          {sector.name}
        </SectionLabel>
        <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>{sector.description}</p>
        <div className="mt-2 tnum text-xs" style={{ color: 'var(--bone-faint)' }}>
          Ambient condition: {FIELDS[sector.field].name} — {FIELDS[sector.field].description}
        </div>
        <div className="mt-2">
          <Bar value={progress.index} max={progress.of} tone="exp" height={8} label="Sector progress" />
        </div>
      </Panel>

      <Panel className="p-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-2)', color: preview === 'boss' || preview === 'apex' ? 'var(--oxide)' : 'var(--bone)' }}>
            {NODE_LABEL[preview]}
          </div>
          <div className="text-xs" style={{ color: 'var(--bone-dim)' }}>
            {preview === 'apex' ? 'A named encounter with a forced condition and run-defining rewards.'
              : preview === 'boss' ? 'Elevated stats and a unique kit. Guaranteed rewards.'
                : preview === 'event' ? 'No fighting here — a choice instead.'
                  : preview === 'elite' ? 'Harder than the floors around it.'
                    : 'A routine contact.'}
          </div>
        </div>
        <Button variant="primary" onClick={enterFloor} disabled={!anyAlive}>Advance</Button>
      </Panel>

      <div>
        <SectionLabel right={`${run.scrip} Scrip · ${run.revives} revives`}>Crew</SectionLabel>
        <RosterStrip />
      </div>

      <Inventory />

      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setScreen('bridge')}>Bridge</Button>
        <Button variant="danger" onClick={() => void abandon()}>Abandon run</Button>
      </div>
    </div>
  );
}

function Reward({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel-recess px-3 py-2">
      <div className="text-xs" style={{ color: 'var(--bone-dim)' }}>{label}</div>
      <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-2)', color: 'var(--amber)' }}>{value}</div>
    </div>
  );
}

function RewardNode() {
  const run = useRun((s) => s.run);
  const advance = useRun((s) => s.advanceFloor);
  if (!run) return null;
  const r = run.pendingRewards;
  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-y-auto">
      <Panel className="p-4">
        <SectionLabel>{run.eventResult ? 'Node resolved' : `Floor ${run.floor} cleared`}</SectionLabel>
        {run.eventResult ? <p className="text-sm mb-3">{run.eventResult}</p> : null}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <Reward label="EXP" value={r.exp} />
          <Reward label="Scrip" value={r.scrip} />
          <Reward label="Salvage" value={r.salvage} />
          <Reward label="Summon items" value={r.summonItems} />
        </div>
        {r.runes.length > 0 ? (
          <div className="mt-3">
            <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>Runes recovered</div>
            <div className="flex flex-wrap gap-2">
              {r.runes.map((id, i) => (
                <span key={`${id}-${i}`} className="panel-recess px-2 py-1 text-xs" title={getRune(id).description}>
                  {getRune(id).name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4"><Button variant="primary" onClick={advance}>Move up</Button></div>
      </Panel>
      <Inventory />
    </div>
  );
}

const EVENT_COPY: Record<string, { title: string; body: string; choices: { id: string; label: string; note: string }[] }> = {
  gacha_shrine: {
    title: 'Requisition shrine',
    body: 'An automated requisition post, still drawing power from something. It will honour one request.',
    choices: [
      { id: 'summon', label: 'Draw a beacon', note: 'One summon item.' },
      { id: 'salvage', label: 'Strip the post', note: 'Salvage instead.' },
    ],
  },
  derelict: {
    title: 'Derelict hulk',
    body: 'A dead hauler, reactor still warm. Cutting it loose pays well and costs HULL.',
    choices: [
      { id: 'risk', label: 'Cut the reactor loose', note: 'Large Scrip payout. Everyone takes 25% HULL.' },
      { id: 'salvage', label: 'Strip the plating', note: 'Safe Salvage.' },
      { id: 'leave', label: 'Leave it', note: 'Nothing gained, nothing lost.' },
    ],
  },
  rescue: {
    title: 'Rescue beacon',
    body: 'A survivor pod on a decaying orbit. Their medical stores are intact.',
    choices: [
      { id: 'repair', label: 'Take them aboard', note: 'Restores every surviving frame to full HULL.' },
      { id: 'scrip', label: 'Take the stores only', note: 'Scrip instead.' },
    ],
  },
  gauntlet: {
    title: 'Gauntlet run',
    body: 'A blockade with a gap in it. Push through fast and something breaks loose.',
    choices: [
      { id: 'scrip', label: 'Run the gauntlet', note: 'Scrip.' },
      { id: 'salvage', label: 'Pick the wrecks clean', note: 'Salvage.' },
    ],
  },
};

function EventNode() {
  const run = useRun((s) => s.run);
  const resolve = useRun((s) => s.resolveEvent);
  if (!run?.node) return null;
  const copy = EVENT_COPY[run.node.eventKind ?? 'derelict'] ?? EVENT_COPY.derelict;
  return (
    <div className="p-3 h-full overflow-y-auto">
      <Panel className="p-4">
        <SectionLabel right={`Floor ${run.floor}`}>{copy.title}</SectionLabel>
        <p className="text-sm mb-4" style={{ color: 'var(--bone-dim)' }}>{copy.body}</p>
        <div className="flex flex-col gap-2">
          {copy.choices.map((c) => (
            <button key={c.id} type="button" className="btn text-left" onClick={() => resolve(c.id)}>
              <b style={{ fontFamily: 'var(--font-display)' }}>{c.label}</b>
              <span className="block text-xs" style={{ color: 'var(--bone-dim)' }}>{c.note}</span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function MerchantNode() {
  const run = useRun((s) => s.run);
  const buyRune = useRun((s) => s.buyRune);
  const buyItem = useRun((s) => s.buyItem);
  const reroll = useRun((s) => s.rerollMerchant);
  const advance = useRun((s) => s.advanceFloor);
  const toast = useUi((s) => s.toast);
  if (!run?.merchant) return null;
  const stock = run.merchant;

  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-y-auto">
      <Panel className="p-3">
        <SectionLabel right={`${run.scrip} Scrip`}>Merchant hub</SectionLabel>
        <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
          Scrip is worthless after the run ends. Spend it.
        </p>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right={`${stock.rerolls} rerolls`}>Runes</SectionLabel>
        {stock.runes.length === 0 ? <Empty>Sold out.</Empty> : null}
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {stock.runes.map((entry, i) => {
            const rune = getRune(entry.runeId);
            return (
              <button
                key={`${entry.runeId}-${i}`}
                type="button"
                className="btn text-left"
                disabled={run.scrip < entry.price}
                onClick={() => { if (buyRune(i)) toast(`${rune.name} acquired.`, 'good'); }}
              >
                <span className="flex justify-between items-baseline gap-2">
                  <b style={{ fontFamily: 'var(--font-display)' }}>{rune.name}</b>
                  <span className="tnum" style={{ color: 'var(--amber)' }}>{entry.price}</span>
                </span>
                <span className="block text-xs" style={{ color: 'var(--bone-dim)' }}>{rune.description}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <Button disabled={stock.rerolls <= 0} onClick={() => reroll()}>Reroll stock</Button>
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel>Consumables</SectionLabel>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {stock.items.map((entry, i) => {
            const item = getItem(entry.itemId);
            return (
              <button
                key={`${entry.itemId}-${i}`}
                type="button"
                className="btn text-left"
                disabled={run.scrip < entry.price}
                onClick={() => { if (buyItem(i)) toast(`${item.name} purchased.`, 'good'); }}
              >
                <span className="flex justify-between items-baseline gap-2">
                  <b style={{ fontFamily: 'var(--font-display)' }}>{item.name}</b>
                  <span className="tnum" style={{ color: 'var(--amber)' }}>{entry.price}</span>
                </span>
                <span className="block text-xs" style={{ color: 'var(--bone-dim)' }}>{item.description}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Button variant="primary" onClick={advance}>Leave the hub</Button>
    </div>
  );
}

function RunOver({ victory }: { victory: boolean }) {
  const run = useRun((s) => s.run);
  const abandon = useRun((s) => s.abandonRun);
  const setScreen = useUi((s) => s.setScreen);
  if (!run) return null;
  return (
    <div className="p-3 h-full flex items-center justify-center">
      <Panel className="p-6" style={{ maxWidth: 520 }}>
        <h2 style={{ fontSize: 'var(--step-3)', color: victory ? 'var(--amber)' : 'var(--oxide)' }}>
          {victory ? 'Starfall reached' : 'Crew lost'}
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--bone-dim)' }}>
          {victory
            ? 'Three hundred floors. The run is finished and every mode is open.'
            : `The last frame went down on floor ${run.floor}. Levels, runes and Scrip are gone; Salvage, unlocks and fragments are kept.`}
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={async () => { await abandon(); setScreen('bridge'); }}>
            Return to the bridge
          </Button>
        </div>
      </Panel>
    </div>
  );
}

export function RunScreen() {
  const run = useRun((s) => s.run);
  if (!run) return null;
  switch (run.phase) {
    case 'combat': return <CombatScreen />;
    case 'reward': return <RewardNode />;
    case 'event': return <EventNode />;
    case 'merchant': return <MerchantNode />;
    case 'defeat': return <RunOver victory={false} />;
    case 'victory': return <RunOver victory />;
    default: return <MapNode />;
  }
}
