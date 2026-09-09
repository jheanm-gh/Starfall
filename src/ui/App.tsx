/* Application shell. One fixed frame, one navigation rail, one screen at
   a time — the game never becomes a scrolling website. */

import { useEffect } from 'react';
import { useAccount } from '../state/accountStore';
import { useRun } from '../state/runStore';
import { useUi, type Screen } from '../state/uiStore';
import { BridgeScreen } from './bridge/BridgeScreen';
import { RosterScreen } from './roster/RosterScreen';
import { HangarScreen } from './hangar/HangarScreen';
import { RequisitionScreen } from './gacha/RequisitionScreen';
import { RunScreen } from './run/RunScreen';
import { Styleguide } from './shared/Styleguide';

const NAV: { id: Screen; label: string }[] = [
  { id: 'bridge', label: 'Bridge' },
  { id: 'run', label: 'Run' },
  { id: 'roster', label: 'Roster' },
  { id: 'hangar', label: 'Hangar' },
  { id: 'requisition', label: 'Requisition' },
  { id: 'styleguide', label: 'Styleguide' },
];

function Toasts() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-3 right-3 flex flex-col gap-2" style={{ zIndex: 40, maxWidth: 'min(92vw, 340px)' }}>
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className="panel px-3 py-2 text-left text-sm"
          style={{ borderColor: t.tone === 'good' ? 'var(--verdigris)' : t.tone === 'bad' ? 'var(--oxide)' : 'var(--seam)' }}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}

export function App() {
  const hydrateAccount = useAccount((s) => s.hydrate);
  const accountReady = useAccount((s) => s.hydrated);
  const hydrateRun = useRun((s) => s.hydrate);
  const runReady = useRun((s) => s.hydrated);
  const run = useRun((s) => s.run);
  const screen = useUi((s) => s.screen);
  const setScreen = useUi((s) => s.setScreen);

  useEffect(() => {
    void hydrateAccount();
    void hydrateRun();
  }, [hydrateAccount, hydrateRun]);

  if (!accountReady || !runReady) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: 'var(--bone-faint)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-2)' }}>STARFALL</span>
      </div>
    );
  }

  const body =
    screen === 'roster' ? <RosterScreen />
      : screen === 'hangar' ? <HangarScreen />
        : screen === 'requisition' ? <RequisitionScreen />
          : screen === 'styleguide' ? <Styleguide />
            : screen === 'run' ? (run ? <RunScreen /> : <BridgeScreen />)
              : <BridgeScreen />;

  const inCombat = screen === 'run' && run?.phase === 'combat';

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--void)' }}>
      <header
        className="flex items-center gap-2 px-3 py-2 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--seam)', background: 'var(--hull)', flex: '0 0 auto' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-1)', color: 'var(--amber)', letterSpacing: '0.06em' }}>
          STARFALL
        </span>
        <nav className="flex gap-1 ml-2" aria-label="Main">
          {NAV.map((n) => {
            const disabled = n.id === 'run' && !run;
            return (
              <button
                key={n.id}
                type="button"
                className="btn"
                disabled={disabled}
                onClick={() => setScreen(n.id)}
                style={{
                  padding: '4px 10px',
                  borderColor: screen === n.id ? 'var(--amber)' : 'transparent',
                  color: screen === n.id ? 'var(--amber)' : 'var(--bone-dim)',
                }}
              >
                {n.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 min-h-0" style={{ overflow: inCombat ? 'hidden' : 'auto' }}>
        {body}
      </main>

      <Toasts />
    </div>
  );
}
