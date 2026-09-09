# STARFALL

A single-player, browser-based, turn-based roguelike hero-collector. 150
heroes across 10 alien races, strictly 1v1 combat, 300-floor runs. No
backend, no auth, no paid services.

Built against `STARFALL_MASTER_PROMPT.md`. Section references throughout the
code (`§5.3`, `§9.4`) point at that specification.

```bash
npm install
npm run dev        # play it
npm test           # 70 tests, including the balance gate
npm run lint
npm run build
```

## What is here

| Phase | Deliverable | State |
|---|---|---|
| P0 | Scaffold, design tokens, procedural portraits | Done — `/styleguide` route renders the whole §2 contract |
| P1 | Pure combat engine and primitive library | Done — deterministic, 46 primitives, tested |
| P2 | Terran Directorate, combat UI | Done — three-band layout, keyboard-playable |
| P3 | Run loop: floors, merchant, boss, events | Done — resumable across a refresh |
| P4 | Meta layer: save, Salvage, Commander, gear | Done — with schema migrations |
| P5 | Gacha, fragments, ascension | Done — pity persists across sessions |
| P6 | 9 remaining races, 140 heroes | Done — 150 heroes, schema-validated |
| P7 | 300 floors, 10 sectors, conditions | Done — a full Story clear is a test |
| P8 | Endless, Ironman, Draft, three difficulties | Done |
| P9 | Real art, audio, polish | Not started — the manifest is ready for it |

## The five non-negotiables, and how each is held

**1. The combat engine is pure TypeScript with zero React imports.**
`src/engine` may import only from `src/engine` and `src/data`. An ESLint
`no-restricted-imports` rule enforces the boundary. `step(state, action)`
returns a new state and never mutates its input — there is a test for that.
Every combat replays byte-identically from its seed, which is what makes
daily challenges, replays and the balance report possible.

**2. Skills are data, never code.** Every one of the ~500 skills is a
composition of the §8 primitives, dispatched from one table in
`engine/combat/primitives/index.ts`. There is no path from a hero id to
engine behaviour. `src/data/content.test.ts` asserts that every effect in
the game is a known primitive.

**3. Nothing permanent grants raw stats.** Gear chassis have no stat fields
at all — their value is socket count plus one non-numeric trait. Runes are
the only stat-bearing layer and are destroyed at run end. The single
exception is the command aura, hard-capped at +5%. `engine/meta/meta.test.ts`
asserts all of it.

**4. The game is fully playable before any art exists.** Every hero renders
from a deterministic SVG silhouette built from a per-race vocabulary. Drop
`public/assets/heroes/{race}/{slug}.webp` in and it lights up with no code
change; a missing file degrades to the placeholder rather than breaking.

**5. The visual design is specified, not improvised.** `styles/tokens.css`
is the §2 contract: six colours, two typefaces, radius 0 except status
chips, and one ambient animation in the whole interface (the Legendary
frame shimmer). The `/styleguide` route renders all of it.

## Balance

The engine's purity makes balancing a script rather than a chore.

```bash
node tools/tune.mjs --measure-only   # report only
node tools/tune.mjs 0.2              # one measure-and-correct pass
```

`tools/balanceReport.ts` simulates the roster; `tools/tune.mjs` nudges each
hero's stats toward a 50% win rate against its own rarity band, preserving
each race's distribution. Run it in a fresh process per pass — Vite caches
the module graph and will otherwise measure stale content.

Current state, at level 20 over 6000 fights:

- Race win rates 44.6%–55.3% (from 30.5pp spread down to 10.7pp)
- Zero heroes more than 25pp off their rarity band (from 41)
- Median time to kill: 5 rounds, 0% draws
- Rarity ladder: common 19% → uncommon 47% → rare 69% → epic 83% → legendary 94%

`tools/balanceReport.test.ts` gates all of this in CI.

## Structure

```
src/
  engine/          PURE. No React, no DOM, no storage.
    combat/        resolve, damage, turnOrder, statuses, field, primitives/
    run/           floorGen, sector, rewards, economy
    meta/          gacha, ascension
    rng.ts         mulberry32, exposed as a pure indexed draw
    types.ts       single source of truth
  data/            heroes, skills, statuses, fields, gear, runes, sectors
    balance.ts     EVERY tuning constant, and nowhere else
  state/           account (persistent), run (resumable), ui (ephemeral)
  ui/              combat, roster, gacha, hangar, bridge, run, shared
  art/             placeholder generator, asset manifest
tools/             balance report and tuner
```

## Notes on two design decisions

**Turn order.** A SPD advantage never grants a second turn, at any gap. Both
sides commit an action, then the round resolves by priority tier, then item
priority, then effective SPD, then base SPD, then hero id — the last two
deterministic so replays reproduce. Extra actions exist only as a rare
`EXTRA_ACTION` primitive; a test caps how many skills may carry it and
requires a cooldown of at least 4.

**A fallen hero does not reset the fight.** When a hero is destroyed, the
next one steps into the same combat against the enemy as it stands. The
alternative — restarting the encounter at full enemy HULL — makes a
five-hero roster worth no more than one hero and turns every boss into a
wall. A full 300-floor Story clear is only possible with this rule, which
is asserted in `engine/run/run.test.ts`.

## Open decisions (§15)

Flagged rather than decided unilaterally:

1. **Milestone cadence.** Implemented as bosses on odd tens, event nodes on
   even tens, apex encounters at 100/200/300 — a reading of "every other ten
   levels". Changing it touches `nodeKindFor` and one test.
2. **Hero levels reset each run.** Implemented as specified. If levels
   should persist instead, §9.1 and the entire difficulty curve need
   revisiting.
3. **Enemy roster.** Reskinned heroes, per the acquisition model's licence
   to do so. Bosses get a generated title and elevated stats; a
   purpose-built bestiary would drop into `floorGen` cleanly.
4. **Draft mode and ascension.** Draft currently ignores roster cost but
   still uses each hero's real ascension tier.
5. **Audio.** Unspecified, and not started.
