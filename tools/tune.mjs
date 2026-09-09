/* ============================================================
   Balance tuner — the working end of §14's "generate a balance report".

   Measures the roster with tools/balanceReport.ts, then applies a per-hero
   scalar to every base stat and growth value, moving each hero toward a 50%
   win rate against its own rarity band. Distributions are preserved: a
   Vantari stays tanky and an Ith'ka stays fast, only the overall power
   moves. Convergence is fast — six passes took the roster from 41 heroes
   more than 25pp off their band to three.

   Usage:
     node tools/tune.mjs --measure-only   # report, change nothing
     node tools/tune.mjs 0.22             # one measure-and-correct pass

   Run it in a FRESH process per pass. Vite caches the module graph, so a
   loop inside one process will happily measure stale content while writing
   new content to disk.
   ============================================================ */
import { createServer } from 'vite';
import { readFileSync, writeFileSync } from 'fs';

const server = await createServer({ configFile: '/home/user/Starfall/vite.config.ts', root: '/home/user/Starfall', server: { port: 5194 } });
await server.listen();
const mod = await server.ssrLoadModule('/tools/balanceReport.ts');
const report = mod.runBalanceReport({ level: 20, fights: 12000 });

const ranked = report.heroes.filter(h => h.peerFights >= 6);
const rates = ranked.map(h => h.peerWinRate);
const spread = Math.max(...rates) - Math.min(...rates);
const outliers = ranked.filter(h => Math.abs(h.peerWinRate - 0.5) > 0.25).length;
console.log(`peer spread ${(spread*100).toFixed(0)}pp  outliers(>25pp) ${outliers}/${ranked.length}  ttk ${report.ttk.median}  races ${(Math.max(...report.races.map(r=>r.winRate))-Math.min(...report.races.map(r=>r.winRate))).toFixed(3)}`);

if (process.argv[2] !== '--measure-only') {
  const gain = Number(process.argv[2] ?? 0.18);
  const byRace = {};
  for (const h of ranked) (byRace[h.race] ??= []).push(h);
  for (const [race, heroes] of Object.entries(byRace)) {
    const path = `/home/user/Starfall/src/data/races/${race}.ts`;
    let src = readFileSync(path, 'utf8');
    for (const h of heroes) {
      const factor = Math.max(0.9, Math.min(1.1, 1 + (0.5 - h.peerWinRate) * gain));
      const at = src.indexOf(`id: '${h.id}',`);
      if (at < 0) continue;
      const re = /(baseStats|growth): \{ hull: ([\d.]+), atk: ([\d.]+), def: ([\d.]+), spd: ([\d.]+), foc: ([\d.]+), res: ([\d.]+) \}/g;
      re.lastIndex = at;
      for (let n = 0; n < 2; n++) {
        const m = re.exec(src);
        if (!m) break;
        const v = m.slice(2, 8).map(Number).map(x => {
          const s = x * factor;
          return m[1] === 'growth' ? Math.max(0.1, Math.round(s * 10) / 10) : Math.max(1, Math.round(s));
        });
        const replacement = `${m[1]}: { hull: ${v[0]}, atk: ${v[1]}, def: ${v[2]}, spd: ${v[3]}, foc: ${v[4]}, res: ${v[5]} }`;
        src = src.slice(0, m.index) + replacement + src.slice(m.index + m[0].length);
        re.lastIndex = m.index + replacement.length;
      }
    }
    writeFileSync(path, src);
  }
}
await server.close();
