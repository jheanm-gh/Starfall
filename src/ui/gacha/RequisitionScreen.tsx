/* §10 — acquisition. Rates are shown honestly, including what soft pity
   has actually done to them, because hiding that is the part of the genre
   worth not copying. */

import { useState } from 'react';
import type { Rarity } from '../../engine/types';
import { RARITIES } from '../../engine/types';
import { GACHA } from '../../data/balance';
import { pullMany, ratesFor, type PullResult } from '../../engine/meta/gacha';
import { useAccount } from '../../state/accountStore';
import { useUi } from '../../state/uiStore';
import { Button, Panel, Portrait, RarityFrame, SectionLabel, StatRow } from '../shared/primitives';

export function RequisitionScreen() {
  const account = useAccount((s) => s.account);
  const mutate = useAccount((s) => s.mutate);
  const toast = useUi((s) => s.toast);
  const [results, setResults] = useState<PullResult[]>([]);

  const rates = ratesFor(account.pity, false);
  const premiumRates = ratesFor(account.pity, true);

  function commit(pulls: PullResult[], spend: (draft: typeof account) => void) {
    mutate((draft) => {
      spend(draft);
      for (const p of pulls) {
        const existing = draft.heroes[p.hero.id];
        if (existing) {
          existing.fragments += GACHA.DUPLICATE_FRAGMENTS[p.rarity];
        } else {
          draft.heroes[p.hero.id] = { defId: p.hero.id, ascension: 1, fragments: 0, acquiredAt: Date.now() };
        }
        draft.stats.pulls += 1;
      }
      draft.pity = pulls[pulls.length - 1].pity;
    });
    setResults(pulls);
    const best = pulls.reduce<Rarity>((acc, p) => (RARITIES.indexOf(p.rarity) > RARITIES.indexOf(acc) ? p.rarity : acc), 'common');
    toast(`Requisition complete — best result ${best}.`, best === 'epic' || best === 'legendary' ? 'good' : 'neutral');
  }

  function standardPull(count: number) {
    const cost = GACHA.PULL_SALVAGE_COST * count;
    if (account.salvage < cost) { toast('Not enough Salvage.', 'bad'); return; }
    const owned = new Set(Object.keys(account.heroes));
    const pulls = pullMany(account.createdAt ^ account.pity.total, account.pity.total, account.pity, count, { owned });
    commit(pulls, (draft) => { draft.salvage -= cost; });
  }

  function beaconPull() {
    if (account.summonItems <= 0) { toast('No summon beacons held.', 'bad'); return; }
    const owned = new Set(Object.keys(account.heroes));
    const pulls = pullMany(account.createdAt ^ (account.pity.total + 7919), account.pity.total, account.pity, 1, { owned, premium: true });
    commit(pulls, (draft) => { draft.summonItems -= 1; });
  }

  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
      <Panel className="p-3">
        <SectionLabel right={`${account.salvage} Salvage · ${account.summonItems} beacons`}>Requisition</SectionLabel>
        <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
          Heroes are never taken from wrecks — every frame here was requisitioned.
          Duplicates convert to fragments, so no pull is wasted.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button variant="primary" onClick={() => standardPull(1)} disabled={account.salvage < GACHA.PULL_SALVAGE_COST}>
            Single pull — {GACHA.PULL_SALVAGE_COST} Salvage
          </Button>
          <Button onClick={() => standardPull(10)} disabled={account.salvage < GACHA.PULL_SALVAGE_COST * 10}>
            Ten pulls — {GACHA.PULL_SALVAGE_COST * 10} Salvage
          </Button>
          <Button onClick={beaconPull} disabled={account.summonItems <= 0}>
            Full summon — 1 beacon
          </Button>
        </div>
      </Panel>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Panel className="p-3">
          <SectionLabel right="live, after pity">Standard rates</SectionLabel>
          {RARITIES.map((r) => (
            <StatRow key={r} label={r} value={`${(rates[r] * 100).toFixed(2)}%`} sub={rates[r] > GACHA.BASE_RATES[r] ? 'boosted' : undefined} />
          ))}
        </Panel>
        <Panel className="p-3">
          <SectionLabel right="beacon">Full summon rates</SectionLabel>
          {RARITIES.map((r) => (
            <StatRow key={r} label={r} value={`${(premiumRates[r] * 100).toFixed(2)}%`} />
          ))}
        </Panel>
        <Panel className="p-3">
          <SectionLabel>Pity</SectionLabel>
          <StatRow label="Pulls since Epic+" value={account.pity.sinceEpic} />
          <StatRow label="Soft pity begins" value={GACHA.SOFT_PITY_START} sub={account.pity.sinceEpic >= GACHA.SOFT_PITY_START ? 'active' : undefined} />
          <StatRow label="Guaranteed at" value={GACHA.HARD_PITY} />
          <StatRow label="Lifetime pulls" value={account.pity.total} />
          <p className="text-xs mt-2" style={{ color: 'var(--bone-faint)' }}>
            The counter is stored in the account save and survives closing the tab.
          </p>
        </Panel>
      </div>

      {results.length > 0 ? (
        <Panel className="p-3">
          <SectionLabel right={`${results.length} pulled`}>Results</SectionLabel>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {results.map((p, i) => (
              <RarityFrame key={i} rarity={p.rarity} className="p-2">
                <Portrait hero={p.hero} size={118} />
                <div className="mt-1 truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{p.hero.name}</div>
                <div className="text-xs" style={{ color: p.duplicate ? 'var(--verdigris)' : 'var(--amber)' }}>
                  {p.duplicate ? `duplicate → +${GACHA.DUPLICATE_FRAGMENTS[p.rarity]} fragments` : 'new'}
                </div>
              </RarityFrame>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
