/* Balance instrumentation (§14).

   The engine's purity is what makes this a script rather than a chore:
   1000 fights is a loop, not a playtest. Run with `npm run balance`. */

import { simulateCombat } from '../src/engine/combat/resolve';
import { HERO_LIST, getHero } from '../src/data/registry';
import { skillsForAscension } from '../src/engine/combat/build';
import { RARITIES, type HeroDefinition, type RaceId } from '../src/engine/types';
import { RACES } from '../src/data/races';

export interface MatchSample {
  attacker: string;
  defender: string;
  rounds: number;
  outcome: string;
  dpr: number;
}

export interface HeroReport {
  id: string;
  name: string;
  race: RaceId;
  rarity: string;
  wins: number;
  fights: number;
  winRate: number;
  /** Win rate against same-rarity opponents only. This is the number that
      matters: a common losing to a legendary is the design working. */
  peerWins: number;
  peerFights: number;
  peerWinRate: number;
  avgRounds: number;
  avgDpr: number;
}

export interface RaceReport {
  race: RaceId;
  name: string;
  fights: number;
  winRate: number;
  avgRounds: number;
}

export interface BalanceReport {
  level: number;
  fights: number;
  heroes: HeroReport[];
  races: RaceReport[];
  ttk: { min: number; p25: number; median: number; p75: number; max: number; drawRate: number };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx];
}

export function runBalanceReport(opts: { level?: number; fights?: number; ascension?: number; peerSamples?: number } = {}): BalanceReport {
  const level = opts.level ?? 20;
  const targetFights = opts.fights ?? 1000;
  const ascension = opts.ascension ?? 4;
  const peerSamples = opts.peerSamples ?? 900;
  const roster: HeroDefinition[] = HERO_LIST;
  if (roster.length < 2) throw new Error('balance report needs at least two heroes');

  const stats = new Map<string, HeroReport>();
  for (const h of roster) {
    stats.set(h.id, {
      id: h.id, name: h.name, race: h.race, rarity: h.rarity,
      wins: 0, fights: 0, winRate: 0, peerWins: 0, peerFights: 0, peerWinRate: 0, avgRounds: 0, avgDpr: 0,
    });
  }

  const roundSamples: number[] = [];
  let draws = 0;
  let fights = 0;
  let seed = 1;

  // Stride pairing rather than a nested loop: with 150 heroes a nested
  // round-robin truncated at 1000 fights only ever samples the first few
  // rows, which quietly turns the report into "hero 0 versus everyone".
  {
    {
      const n = roster.length;
      for (let k = 0; k < targetFights; k++) {
        const i = k % n;
        const j = (i + 1 + Math.floor(k / n)) % n;
        if (i === j) continue;
        const a = roster[i];
        const b = roster[j];
        const result = simulateCombat({
          seed: seed++,
          player: { defId: a.id, level, skills: skillsForAscension(getHero(a.id), ascension) },
          enemy: { defId: b.id, level, skills: skillsForAscension(getHero(b.id), ascension) },
          field: null,
        });
        fights++;
        const rounds = result.round;
        roundSamples.push(rounds);
        if (result.outcome === 'draw') draws++;

        const sa = stats.get(a.id)!;
        const sb = stats.get(b.id)!;
        sa.fights++; sb.fights++;
        if (result.outcome === 'victory') sa.wins++;
        if (result.outcome === 'defeat') sb.wins++;
        if (a.rarity === b.rarity) {
          sa.peerFights++; sb.peerFights++;
          if (result.outcome === 'victory') sa.peerWins++;
          if (result.outcome === 'defeat') sb.peerWins++;
        }
        sa.avgRounds += rounds; sb.avgRounds += rounds;
        sa.avgDpr += (result.enemy.maxHull - result.enemy.hull) / Math.max(1, rounds);
        sb.avgDpr += (result.player.maxHull - result.player.hull) / Math.max(1, rounds);
      }
    }
  }

  // A dedicated same-rarity phase. The stride loop above pairs across the
  // whole roster, so same-rarity matchups are incidental and peer win rate —
  // the number that actually drives tuning — ends up measured on a handful of
  // fights. This samples the bands directly so that number means something.
  for (const rarity of RARITIES) {
    const band = roster.filter((h) => h.rarity === rarity);
    if (band.length < 2) continue;
    const perHero = Math.max(8, Math.round(peerSamples / band.length));
    for (let i = 0; i < band.length; i++) {
      for (let step = 1; step <= perHero; step++) {
        const j = (i + step) % band.length;
        if (i === j) continue;
        const a = band[i];
        const b = band[j];
        const result = simulateCombat({
          seed: seed++,
          player: { defId: a.id, level, skills: skillsForAscension(getHero(a.id), ascension) },
          enemy: { defId: b.id, level, skills: skillsForAscension(getHero(b.id), ascension) },
          field: null,
        });
        const sa = stats.get(a.id)!;
        const sb = stats.get(b.id)!;
        sa.peerFights++; sb.peerFights++;
        if (result.outcome === 'victory') sa.peerWins++;
        if (result.outcome === 'defeat') sb.peerWins++;
      }
    }
  }

  const heroes = [...stats.values()].map((s) => ({
    ...s,
    winRate: s.fights ? s.wins / s.fights : 0,
    peerWinRate: s.peerFights ? s.peerWins / s.peerFights : 0,
    avgRounds: s.fights ? s.avgRounds / s.fights : 0,
    avgDpr: s.fights ? s.avgDpr / s.fights : 0,
  })).sort((x, y) => y.peerWinRate - x.peerWinRate);

  const byRace = new Map<RaceId, { wins: number; fights: number; rounds: number }>();
  for (const h of heroes) {
    const entry = byRace.get(h.race) ?? { wins: 0, fights: 0, rounds: 0 };
    entry.wins += h.wins;
    entry.fights += h.fights;
    entry.rounds += h.avgRounds * h.fights;
    byRace.set(h.race, entry);
  }

  const races: RaceReport[] = [...byRace.entries()].map(([race, e]) => ({
    race,
    name: RACES[race].name,
    fights: e.fights,
    winRate: e.fights ? e.wins / e.fights : 0,
    avgRounds: e.fights ? e.rounds / e.fights : 0,
  })).sort((a, b) => b.winRate - a.winRate);

  const sorted = roundSamples.slice().sort((a, b) => a - b);

  return {
    level,
    fights,
    heroes,
    races,
    ttk: {
      min: sorted[0] ?? 0,
      p25: percentile(sorted, 0.25),
      median: percentile(sorted, 0.5),
      p75: percentile(sorted, 0.75),
      max: sorted[sorted.length - 1] ?? 0,
      drawRate: fights ? draws / fights : 0,
    },
  };
}

export function formatReport(report: BalanceReport): string {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const lines: string[] = [];
  lines.push(`STARFALL balance report — level ${report.level}, ${report.fights} simulated fights`);
  lines.push('');
  lines.push(`Time to kill (rounds)  min ${report.ttk.min}  p25 ${report.ttk.p25}  median ${report.ttk.median}  p75 ${report.ttk.p75}  max ${report.ttk.max}`);
  lines.push(`Draw rate ${pct(report.ttk.drawRate)}`);
  lines.push('');
  lines.push('Win rate by race');
  for (const r of report.races) {
    lines.push(`  ${r.name.padEnd(22)} ${pct(r.winRate).padStart(6)}   avg ${r.avgRounds.toFixed(1)} rounds   (${r.fights} fights)`);
  }
  lines.push('');
  lines.push('Outliers within their own rarity band (peer win rate)');
  const ranked = report.heroes.filter((h) => h.peerFights > 0);
  for (const h of ranked.slice(0, 6)) {
    lines.push(`  strong  ${h.name.padEnd(24)} ${pct(h.peerWinRate).padStart(6)}  ${h.rarity}`);
  }
  for (const h of ranked.slice(-6)) {
    lines.push(`  weak    ${h.name.padEnd(24)} ${pct(h.peerWinRate).padStart(6)}  ${h.rarity}`);
  }
  return lines.join('\n');
}
