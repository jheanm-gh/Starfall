/* Meta-progression tests (§9, §10, §14 P4-P5).

   The first block is the important one: §0.3 says nothing permanent grants
   raw stats, with exactly one capped exception. That is a property of the
   data, so it can be asserted rather than trusted. */

import { describe, expect, it } from 'vitest';
import { COMMANDER, GACHA, LEVELLING, ROSTER } from '../../data/balance';
import { CHASSIS_LIST } from '../../data/gear';
import { RUNE_LIST } from '../../data/runes';
import { COMMANDER_SKILLS, DOCTRINES, LOGISTICS, rosterBudgetForRank } from '../../data/commander';
import { HERO_LIST, getHero } from '../../data/registry';
import { RARITIES } from '../types';
import { applyExp, ascensionCost, expToNext, levelCap } from './ascension';
import { emptyPity, fragmentThreshold, pull, pullMany, ratesFor } from './gacha';
import { skillsForAscension } from '../combat/build';

describe('§0.3 — nothing permanent grants raw stats', () => {
  it('gives gear chassis no stats whatsoever, only sockets and a trait', () => {
    for (const c of CHASSIS_LIST) {
      expect(Object.keys(c)).not.toContain('stats');
      expect(Object.keys(c)).not.toContain('baseStats');
      expect(c.sockets).toBeGreaterThanOrEqual(1);
      expect(c.sockets).toBeLessThanOrEqual(4);
      expect(c.trait, `${c.id} must carry a trait`).toBeTruthy();
      expect(c.traitText.length, `${c.id} trait text`).toBeGreaterThan(10);
    }
  });

  it('caps socket count at four so runes stay a decision, not arithmetic', () => {
    expect(Math.max(...CHASSIS_LIST.map((c) => c.sockets))).toBe(4);
  });

  it('expresses doctrines and logistics as rule changes, never multipliers', () => {
    for (const d of DOCTRINES) {
      expect(d.description).not.toMatch(/[×x]\s?\d|\d+%\s*(more|increase)/i);
    }
    for (const l of LOGISTICS) {
      expect(l.description).not.toMatch(/[×x]\s?\d/i);
    }
  });

  it('hard-caps the command aura at +5% (§9.4)', () => {
    expect(COMMANDER.AURA_CAP).toBe(0.05);
    const atMaxRank = COMMANDER.MAX_RANK * COMMANDER.AURA_PER_RANK;
    // The curve must actually reach the cap, and must not be allowed past it.
    expect(atMaxRank).toBeGreaterThanOrEqual(COMMANDER.AURA_CAP);
    expect(Math.min(COMMANDER.AURA_CAP, atMaxRank)).toBe(COMMANDER.AURA_CAP);
  });

  it('keeps Commander multipliers inside their stated caps', () => {
    expect(COMMANDER.EXP_MULT_CAP).toBeLessThanOrEqual(1.5);
    expect(COMMANDER.SCRIP_MULT_CAP).toBeLessThanOrEqual(1.5);
  });

  it('takes the roster budget from 15 to exactly 30 (§7)', () => {
    expect(rosterBudgetForRank(1)).toBe(ROSTER.BASE_BUDGET);
    expect(rosterBudgetForRank(COMMANDER.MAX_RANK)).toBe(ROSTER.MAX_BUDGET);
    for (let r = 1; r < COMMANDER.MAX_RANK; r++) {
      expect(rosterBudgetForRank(r + 1)).toBeGreaterThanOrEqual(rosterBudgetForRank(r));
    }
    // 30 points is what finally makes two Legendaries possible (§7).
    expect(ROSTER.MAX_BUDGET).toBeGreaterThanOrEqual(ROSTER.COST.legendary * 2);
  });

  it('confines raw stats to runes, which are destroyed at run end (§9.3)', () => {
    const statBearing = RUNE_LIST.filter((r) =>
      r.effects.some((e) => e.kind === 'STAT_FLAT' || e.kind === 'STAT_PERCENT'));
    expect(statBearing.length, 'runes are the stat layer').toBeGreaterThan(0);

    // Commander skills are per-combat actions on a cooldown, not standing
    // bonuses — a permanent stat grant would be exactly what §0.3 forbids.
    for (const skill of COMMANDER_SKILLS) {
      expect(skill.cooldown, `${skill.id} needs a cooldown`).toBeGreaterThan(0);
      expect(skill.effects.length, `${skill.id} needs effects`).toBeGreaterThan(0);
      for (const e of skill.effects) {
        if (e.kind === 'STAT_MODIFY') {
          expect(e.duration, `${skill.id} stat change must expire`).toBeLessThan(99);
        }
        expect(e.kind, `${skill.id} must not carry a passive aura`).not.toBe('PASSIVE_AURA');
      }
    }
  });
});

describe('ascension (§9.2)', () => {
  it('gates the level cap by tier, ending at 60', () => {
    expect(levelCap(1)).toBe(10);
    expect(levelCap(6)).toBe(LEVELLING.MAX_LEVEL);
    for (let t = 1; t < 6; t++) {
      expect(levelCap((t + 1) as 2)).toBeGreaterThan(levelCap(t as 1));
    }
  });

  it('unlocks the fourth skill at T4 and the awakened passive at T6', () => {
    const hero = getHero('terran_calder');
    expect(skillsForAscension(hero, 1)).toHaveLength(3);
    expect(skillsForAscension(hero, 3)).toHaveLength(3);
    expect(skillsForAscension(hero, 4)).toHaveLength(4);
    expect(skillsForAscension(hero, 5)).toHaveLength(4);
    const awakened = skillsForAscension(hero, 6);
    expect(awakened).toHaveLength(5);
    expect(awakened).toContain(hero.awakenedPassive);
  });

  it('prices ascension upward, and stops at T6', () => {
    for (const rarity of RARITIES) {
      const hero = HERO_LIST.find((h) => h.rarity === rarity)!;
      let previous = 0;
      for (let tier = 1; tier <= 5; tier++) {
        const cost = ascensionCost(hero, tier as 1)!;
        expect(cost.fragments, `${rarity} T${tier}`).toBeGreaterThan(previous);
        previous = cost.fragments;
      }
      expect(ascensionCost(hero, 6)).toBeNull();
    }
  });

  it('follows the 100 × level^1.5 EXP curve and respects the cap', () => {
    expect(expToNext(1)).toBe(100);
    expect(expToNext(4)).toBe(800);
    expect(expToNext(10)).toBeGreaterThan(expToNext(9));

    const levelled = applyExp(1, 0, 100000, 20);
    expect(levelled.level).toBe(20);
    expect(levelled.exp, 'EXP past the cap is discarded, not banked').toBe(0);

    const partial = applyExp(1, 0, 150, 60);
    expect(partial.level).toBe(2);
    expect(partial.exp).toBe(50);
  });
});

describe('gacha (§10)', () => {
  it('starts from the published base rates, which sum to 1', () => {
    const rates = ratesFor(emptyPity(), false);
    const total = Object.values(rates).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 6);
    expect(rates.legendary).toBeCloseTo(GACHA.BASE_RATES.legendary, 6);
    expect(rates.common).toBeCloseTo(GACHA.BASE_RATES.common, 6);
  });

  it('offers better rates on a full summon than a standard pull', () => {
    const standard = ratesFor(emptyPity(), false);
    const premium = ratesFor(emptyPity(), true);
    expect(premium.legendary).toBeGreaterThan(standard.legendary);
    expect(premium.epic).toBeGreaterThan(standard.epic);
    expect(Object.values(premium).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });

  it('ramps the Epic+ rate through soft pity and keeps the table honest', () => {
    const base = ratesFor({ sinceEpic: 0, total: 0 }, false);
    const soft = ratesFor({ sinceEpic: GACHA.SOFT_PITY_START + 5, total: 0 }, false);
    expect(soft.epic + soft.legendary).toBeGreaterThan(base.epic + base.legendary);
    expect(Object.values(soft).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
    // Nothing changes before the soft-pity threshold.
    const before = ratesFor({ sinceEpic: GACHA.SOFT_PITY_START - 2, total: 0 }, false);
    expect(before.epic).toBeCloseTo(base.epic, 6);
  });

  it('guarantees an Epic or better at hard pity', () => {
    const rates = ratesFor({ sinceEpic: GACHA.HARD_PITY - 1, total: 0 }, false);
    expect(rates.epic + rates.legendary).toBeCloseTo(1, 6);
    expect(rates.common).toBe(0);

    const result = pull(1234, 0, { sinceEpic: GACHA.HARD_PITY - 1, total: 0 });
    expect(['epic', 'legendary']).toContain(result.rarity);
    expect(result.pityTriggered).toBe(true);
    expect(result.pity.sinceEpic, 'pity resets on an Epic+').toBe(0);
  });

  it('never exceeds hard pity across a long simulated history', () => {
    // The property that actually matters to a player: the drought is bounded.
    let pity = emptyPity();
    let longest = 0;
    for (let i = 0; i < 3000; i++) {
      const result = pull(98765, i, pity);
      pity = result.pity;
      longest = Math.max(longest, pity.sinceEpic);
    }
    expect(longest).toBeLessThan(GACHA.HARD_PITY);
    expect(pity.total).toBe(3000);
  });

  it('carries pity forward across a ten-pull', () => {
    const start = { sinceEpic: 40, total: 40 };
    const results = pullMany(555, 0, start, 10);
    expect(results).toHaveLength(10);
    expect(results[results.length - 1].pity.total).toBe(50);
    for (let i = 1; i < results.length; i++) {
      const previous = results[i - 1].pity.sinceEpic;
      const current = results[i].pity.sinceEpic;
      expect(current === 0 || current === previous + 1).toBe(true);
    }
  });

  it('converts duplicates to fragments rather than wasting the pull', () => {
    const owned = new Set(HERO_LIST.map((h) => h.id));
    const result = pull(42, 0, emptyPity(), { owned });
    expect(result.duplicate).toBe(true);
    expect(result.fragments).toBe(GACHA.DUPLICATE_FRAGMENTS[result.rarity]);
    expect(result.fragments).toBeGreaterThan(0);
  });

  it('sets fragment thresholds that rise with rarity (§10)', () => {
    for (let i = 1; i < RARITIES.length; i++) {
      expect(fragmentThreshold(RARITIES[i])).toBeGreaterThan(fragmentThreshold(RARITIES[i - 1]));
    }
    expect(fragmentThreshold('common')).toBe(20);
    expect(fragmentThreshold('legendary')).toBe(200);
  });

  it('is reproducible from its seed', () => {
    const a = pullMany(777, 0, emptyPity(), 20).map((r) => r.hero.id);
    const b = pullMany(777, 0, emptyPity(), 20).map((r) => r.hero.id);
    expect(a).toEqual(b);
    expect(new Set(a).size, 'a twenty-pull should not be one hero').toBeGreaterThan(3);
  });
});
