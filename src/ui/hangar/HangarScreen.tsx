/* §9.3, §9.4 — the meta layer.

   Every purchase on this screen buys capacity, options or access. The one
   number that goes up is the command aura, and it is hard-capped at +5%
   by §9.4. The cap is displayed, because it is a design promise. */

import type { GearSlot } from '../../engine/types';
import { GEAR_SLOTS } from '../../engine/types';
import { COMMANDER } from '../../data/balance';
import { CHASSIS_LIST, chassisForSlot, CHASSIS } from '../../data/gear';
import { COMMANDER_SKILLS, LOGISTICS, rosterBudgetForRank } from '../../data/commander';
import { HERO_LIST } from '../../data/registry';
import { useAccount } from '../../state/accountStore';
import { useUi } from '../../state/uiStore';
import { Button, Empty, Panel, SectionLabel, StatRow } from '../shared/primitives';

const SLOT_LABEL: Record<GearSlot, string> = {
  weapon: 'Weapon', plating: 'Plating', core: 'Core', auxiliary: 'Auxiliary',
};

export function HangarScreen() {
  const account = useAccount((s) => s.account);
  const rankUp = useAccount((s) => s.rankUp);
  const buyChassis = useAccount((s) => s.buyChassis);
  const setLoadout = useAccount((s) => s.setLoadout);
  const setCommanderSkill = useAccount((s) => s.setCommanderSkill);
  const auraPercent = useAccount((s) => s.auraPercent);
  const mutate = useAccount((s) => s.mutate);
  const selected = useUi((s) => s.selectedHeroId);
  const select = useUi((s) => s.selectHero);
  const toast = useUi((s) => s.toast);

  const owned = HERO_LIST.filter((h) => account.heroes[h.id]);
  const hero = selected ? owned.find((h) => h.id === selected) ?? owned[0] : owned[0];
  const rankCost = COMMANDER.rankCost(account.commander.rank);
  const aura = auraPercent();

  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
      <Panel className="p-3">
        <SectionLabel right={`${account.salvage} Salvage`}>Commander</SectionLabel>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div>
            <StatRow label="Rank" value={account.commander.rank} sub={`of ${COMMANDER.MAX_RANK}`} />
            <StatRow label="Roster budget" value={rosterBudgetForRank(account.commander.rank)} sub="points" />
            <StatRow
              label="Command aura"
              value={`+${(aura * 100).toFixed(2)}%`}
              sub={`capped at +${COMMANDER.AURA_CAP * 100}%`}
            />
            <StatRow label="Next rank" value={`${rankCost} Salvage`} />
            <div className="mt-2">
              <Button
                variant="primary"
                disabled={account.salvage < rankCost || account.commander.rank >= COMMANDER.MAX_RANK}
                onClick={() => { if (rankUp()) toast('Commander rank raised.', 'good'); }}
              >
                Promote
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>
              Command skills — two slots, one use each per cooldown, in combat.
            </div>
            {[0, 1].map((slot) => (
              <div key={slot} className="mb-2">
                <select
                  className="btn w-full"
                  aria-label={`Command skill slot ${slot + 1}`}
                  value={account.commander.skills[slot] ?? ''}
                  onChange={(e) => setCommanderSkill(slot, e.target.value || null)}
                >
                  <option value="">— empty —</option>
                  {COMMANDER_SKILLS.filter((s) => s.unlockRank <= account.commander.rank).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="text-xs mt-0.5" style={{ color: 'var(--bone-faint)' }}>
                  {COMMANDER_SKILLS.find((s) => s.id === account.commander.skills[slot])?.description ?? 'Nothing assigned.'}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>Logistics</div>
            {LOGISTICS.map((l) => {
              const unlocked = account.commander.rank >= l.unlockRank;
              const active = account.commander.logistics.includes(l.id);
              return (
                <div key={l.id} className="flex items-baseline justify-between gap-2 py-1" style={{ borderBottom: '1px solid var(--seam)', opacity: unlocked ? 1 : 0.45 }}>
                  <div>
                    <div className="text-sm">{l.name}</div>
                    <div className="text-xs" style={{ color: 'var(--bone-faint)' }}>{l.description}</div>
                  </div>
                  <Button
                    disabled={!unlocked || active}
                    onClick={() => {
                      mutate((draft) => { draft.commander.logistics.push(l.id); });
                      toast(`${l.name} enabled.`, 'good');
                    }}
                  >
                    {active ? 'active' : unlocked ? 'enable' : `rank ${l.unlockRank}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right="chassis grant no stats — only sockets and a trait">Gear chassis</SectionLabel>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {CHASSIS_LIST.map((c) => {
            const have = account.chassis.includes(c.id);
            return (
              <div key={c.id} className="panel-recess p-2">
                <div className="flex justify-between items-baseline gap-2">
                  <b style={{ fontFamily: 'var(--font-display)' }}>{c.name}</b>
                  <span className="tnum text-xs" style={{ color: 'var(--bone-faint)' }}>T{c.tier} · {c.sockets} socket{c.sockets > 1 ? 's' : ''}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--bone-dim)' }}>{c.traitText}</div>
                <div className="mt-2">
                  <Button
                    disabled={have || account.salvage < c.salvageCost}
                    onClick={() => { if (buyChassis(c.id, c.salvageCost)) toast(`${c.name} acquired.`, 'good'); }}
                  >
                    {have ? 'owned' : `${c.salvageCost} Salvage`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right={hero ? hero.name : undefined}>Loadout</SectionLabel>
        {owned.length === 0 ? <Empty>No heroes recovered yet.</Empty> : null}
        {owned.length > 0 ? (
          <>
            <select
              className="btn mb-3"
              aria-label="Choose a hero to fit"
              value={hero?.id ?? ''}
              onChange={(e) => select(e.target.value)}
            >
              {owned.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {GEAR_SLOTS.map((slot) => {
                const fittedId = hero ? account.loadouts[hero.id]?.[slot] ?? '' : '';
                const fitted = fittedId ? CHASSIS[fittedId] : null;
                return (
                  <div key={slot} className="panel-recess p-2">
                    <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>{SLOT_LABEL[slot]}</div>
                    <select
                      className="btn w-full"
                      aria-label={`${SLOT_LABEL[slot]} chassis`}
                      value={fittedId}
                      onChange={(e) => hero && setLoadout(hero.id, slot, e.target.value || null)}
                    >
                      <option value="">— empty —</option>
                      {chassisForSlot(slot).filter((c) => account.chassis.includes(c.id)).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="text-xs mt-1" style={{ color: 'var(--bone-faint)' }}>
                      {fitted ? `${fitted.sockets} socket${fitted.sockets > 1 ? 's' : ''} · ${fitted.traitText}` : 'Nothing fitted.'}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--bone-faint)' }}>
              Runes go into these sockets during a run, and are destroyed when it ends.
            </p>
          </>
        ) : null}
      </Panel>
    </div>
  );
}
