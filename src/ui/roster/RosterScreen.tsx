/* The collection. Rarity is read as material and frame construction
   (§2.3) — there are no glow ramps and no rainbow borders here. */

import { useMemo, useState } from 'react';
import type { Rarity, RaceId } from '../../engine/types';
import { RACES, RACE_LIST } from '../../data/races';
import { HERO_LIST, getSkill } from '../../data/registry';
import { ROSTER } from '../../data/balance';
import { RARITIES } from '../../engine/types';
import { skillsForAscension, statAtLevel } from '../../engine/combat/build';
import { ascensionCost, levelCap } from '../../engine/meta/ascension';
import { fragmentThreshold } from '../../engine/meta/gacha';
import { useAccount } from '../../state/accountStore';
import { useUi } from '../../state/uiStore';
import {
  Button, Empty, Panel, Portrait, RARITY_LABEL, RarityFrame, SectionLabel, StatRow, TypeTag,
} from '../shared/primitives';

export function RosterScreen() {
  const account = useAccount((s) => s.account);
  const ascend = useAccount((s) => s.ascend);
  const addFragments = useAccount((s) => s.addFragments);
  const selected = useUi((s) => s.selectedHeroId);
  const select = useUi((s) => s.selectHero);
  const toast = useUi((s) => s.toast);

  const [race, setRace] = useState<RaceId | 'all'>('all');
  const [rarity, setRarity] = useState<Rarity | 'all'>('all');
  const [ownedOnly, setOwnedOnly] = useState(true);

  const heroes = useMemo(() => HERO_LIST.filter((h) => {
    if (race !== 'all' && h.race !== race) return false;
    if (rarity !== 'all' && h.rarity !== rarity) return false;
    if (ownedOnly && !account.heroes[h.id]) return false;
    return true;
  }), [race, rarity, ownedOnly, account.heroes]);

  const hero = selected ? HERO_LIST.find((h) => h.id === selected) ?? null : null;
  const instance = hero ? account.heroes[hero.id] : null;

  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
      <Panel className="p-3">
        <SectionLabel right={`${Object.keys(account.heroes).length} of ${HERO_LIST.length} recovered`}>
          Roster
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          <select className="btn" value={race} onChange={(e) => setRace(e.target.value as RaceId | 'all')} aria-label="Filter by race">
            <option value="all">All races</option>
            {RACE_LIST.filter((r) => HERO_LIST.some((h) => h.race === r.id)).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select className="btn" value={rarity} onChange={(e) => setRarity(e.target.value as Rarity | 'all')} aria-label="Filter by rarity">
            <option value="all">All rarities</option>
            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button onClick={() => setOwnedOnly((v) => !v)}>
            {ownedOnly ? 'Showing recovered' : 'Showing every known hero'}
          </Button>
        </div>
      </Panel>

      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {heroes.length === 0 ? <Empty>No heroes match that filter.</Empty> : null}
        {heroes.map((h) => {
          const owned = account.heroes[h.id];
          return (
            <button key={h.id} type="button" onClick={() => select(h.id)} className="text-left" style={{ background: 'none', border: 0, padding: 0 }}>
              <RarityFrame rarity={h.rarity} className="p-2" style={{ opacity: owned ? 1 : 0.45 }}>
                <Portrait hero={h} size={130} />
                <div className="mt-1 truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{h.name}</div>
                <div className="flex justify-between items-baseline text-xs" style={{ color: 'var(--bone-faint)' }}>
                  <span>{RACES[h.race].short}</span>
                  <span className="tnum">{owned ? `A${owned.ascension}` : `${owned ? 0 : 0}/${fragmentThreshold(h.rarity)}`}</span>
                </div>
              </RarityFrame>
            </button>
          );
        })}
      </div>

      {hero ? (
        <Panel className="p-3">
          <SectionLabel right={RARITY_LABEL[hero.rarity]}>{hero.name}</SectionLabel>
          <div className="flex gap-4 flex-wrap">
            <RarityFrame rarity={hero.rarity} className="p-2" style={{ flex: '0 0 auto' }}>
              <Portrait hero={hero} size={168} />
            </RarityFrame>

            <div style={{ flex: '1 1 240px', minWidth: 220 }}>
              <StatRow label="Race" value={RACES[hero.race].name} />
              <StatRow label="Role" value={hero.role} />
              <StatRow label="Damage type" value={<TypeTag type={hero.damageType} />} />
              <StatRow label="Roster cost" value={ROSTER.COST[hero.rarity]} />
              <StatRow label="Resists" value={RACES[hero.race].resists ?? 'nothing'} />
              <StatRow label="Vulnerable" value={RACES[hero.race].vulnerable ?? 'nothing'} />
              {instance ? (
                <>
                  <StatRow label="Ascension" value={`T${instance.ascension}`} sub={`level cap ${levelCap(instance.ascension)}`} />
                  <StatRow label="Fragments" value={instance.fragments} />
                </>
              ) : (
                <StatRow label="Status" value="Not yet recovered" />
              )}
            </div>

            <div style={{ flex: '1 1 240px', minWidth: 220 }}>
              <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>Base stats at level 1 / 30</div>
              {(['hull', 'atk', 'def', 'spd', 'foc', 'res'] as const).map((k) => (
                <StatRow
                  key={k}
                  label={k.toUpperCase()}
                  value={Math.round(statAtLevel(hero, k, 1))}
                  sub={`→ ${Math.round(statAtLevel(hero, k, 30))}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>
              Kit — the fourth skill unlocks at ascension 4, the awakened passive at 6.
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
              {[...hero.skills, hero.awakenedPassive].map((id, i) => {
                const skill = getSkill(id);
                const unlocked = instance ? skillsForAscension(hero, instance.ascension).includes(id) : i < 3;
                return (
                  <div key={id} className="panel-recess p-2" style={{ opacity: unlocked ? 1 : 0.5 }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <b style={{ fontFamily: 'var(--font-display)' }}>{skill.name}</b>
                      <TypeTag type={skill.type} />
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--bone-dim)' }}>{skill.description}</div>
                    <div className="text-xs mt-1 tnum" style={{ color: 'var(--bone-faint)' }}>
                      {skill.passive ? 'passive' : skill.cooldown > 0 ? `cooldown ${skill.cooldown}` : 'no cooldown'}
                      {skill.priority !== 0 && !skill.passive ? ` · priority ${skill.priority > 0 ? '+' : ''}${skill.priority}` : ''}
                      {unlocked ? '' : ` · locked`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {instance ? (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              {(() => {
                const cost = ascensionCost(hero, instance.ascension);
                if (!cost) return <span className="text-sm" style={{ color: 'var(--amber)' }}>Fully ascended.</span>;
                const affordable = instance.fragments >= cost.fragments && account.salvage >= cost.salvage;
                return (
                  <>
                    <Button
                      variant="primary"
                      disabled={!affordable}
                      onClick={() => {
                        if (ascend(hero.id)) toast(`${hero.name} ascended.`, 'good');
                      }}
                    >
                      Ascend to T{instance.ascension + 1}
                    </Button>
                    <span className="tnum text-xs" style={{ color: 'var(--bone-dim)' }}>
                      {cost.fragments} fragments ({instance.fragments} held) · {cost.salvage} Salvage ({account.salvage} held)
                    </span>
                  </>
                );
              })()}
              {import.meta.env.DEV ? (
                <Button onClick={() => addFragments(hero.id, 25)} title="Development helper">+25 fragments</Button>
              ) : null}
            </div>
          ) : null}
        </Panel>
      ) : null}
    </div>
  );
}
