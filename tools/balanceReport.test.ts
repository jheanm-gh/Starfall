import { describe, expect, it } from 'vitest';
import { formatReport, runBalanceReport } from './balanceReport';

describe('balance report', () => {
  it('runs 1000 fights and prints the curves', () => {
    // 150 heroes need more than 1000 samples before per-hero rates mean anything.
    const report = runBalanceReport({ level: 20, fights: 6000 });
    // eslint-disable-next-line no-console
    console.log('\n' + formatReport(report) + '\n');
    expect(report.fights).toBeGreaterThan(5000);

    // Guardrails, not assertions about a specific balance state:
    // a stalling engine or a runaway race should fail the build.
    expect(report.ttk.drawRate).toBeLessThan(0.1);
    expect(report.ttk.median).toBeGreaterThan(3);
    expect(report.ttk.median).toBeLessThan(30);

    // §7: no race may be a trap pick or an auto-pick. Tuned with
    // tools/tune.mjs; this is the gate that keeps it tuned.
    const rates = report.races.map((r) => r.winRate);
    const spread = Math.max(...rates) - Math.min(...rates);
    expect(spread, 'race win-rate spread').toBeLessThan(0.12);
    for (const r of report.races) {
      expect(r.winRate, `${r.name} win rate`).toBeGreaterThan(0.4);
      expect(r.winRate, `${r.name} win rate`).toBeLessThan(0.6);
    }

    // §10's rarity economy only means something if rarity plays stronger.
    // This is the honest measurement of it — a raw stat-budget comparison is
    // a proxy that misses kit power entirely.
    const byRarity = new Map<string, number[]>();
    for (const h of report.heroes) {
      const list = byRarity.get(h.rarity) ?? [];
      list.push(h.winRate);
      byRarity.set(h.rarity, list);
    }
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const ladder = ['common', 'uncommon', 'rare', 'epic', 'legendary']
      .map((r) => mean(byRarity.get(r) ?? [0]));
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i], `rarity ladder step ${i}`).toBeGreaterThan(ladder[i - 1]);
    }

    // Within a rarity band, no hero should be a runaway or a dead pick.
    const ranked = report.heroes.filter((h) => h.peerFights >= 6);
    const extreme = ranked.filter((h) => Math.abs(h.peerWinRate - 0.5) > 0.32);
    expect(extreme.map((h) => h.name), 'heroes far outside their band').toHaveLength(0);
  });
});
