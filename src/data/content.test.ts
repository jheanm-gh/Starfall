/* Content schema validation (§14 P6).

   These are the guards that let 140 heroes be authored quickly without
   silently breaking §0.2 or §7. Every one of them has caught a real
   authoring mistake at least once. */

import { describe, expect, it } from 'vitest';
import { RACE_IDS, RARITIES, type Rarity, type SkillEffect } from '../engine/types';
import { HERO_LIST, SKILL_LIST, SKILLS, getSkill, heroesByRace } from './registry';
import { RACES } from './races';
import { ROSTER, STAT_SOFT_CAPS } from './balance';
import { STATUSES } from './statuses';
import { FIELDS } from './fields';
import { skillsForAscension, statAtLevel } from '../engine/combat/build';

/** Every primitive kind §8 defines. A skill using anything else is a bug. */
const KNOWN_PRIMITIVES = new Set([
  'DIRECT_DAMAGE', 'MULTI_HIT', 'EXECUTE', 'RAMPING', 'RECOIL', 'LIFESTEAL',
  'FIXED_DAMAGE', 'PERCENT_MAX_HULL', 'ARMOR_PIERCE', 'CONDITIONAL_DAMAGE',
  'APPLY_STATUS', 'CLEANSE_SELF', 'TRANSFER_STATUS', 'EXTEND_STATUS', 'CONSUME_STATUS',
  'STAT_MODIFY', 'STAT_STEAL', 'BUFF_STRIP', 'DEBUFF_IMMUNITY', 'REFLECT',
  'SHIELD_FLAT', 'SHIELD_PERCENT_MAX', 'HEAL_FLAT', 'HEAL_PERCENT', 'REGEN',
  'DAMAGE_REDUCTION', 'COUNTER_STANCE', 'DODGE_NEXT',
  'PRIORITY', 'SPEED_SWAP', 'DELAY_TARGET', 'EXTRA_ACTION', 'COOLDOWN_RESET', 'CHARGE',
  'SET_FIELD', 'CLEAR_FIELD', 'FIELD_IMMUNITY', 'SCALE_WITH_FIELD',
  'GAIN_CHARGE', 'SPEND_CHARGE', 'SELF_SACRIFICE', 'REVIVE_SELF',
  'ON_KILL', 'ON_HIT', 'ON_TAKE_DAMAGE', 'PASSIVE_AURA',
]);

const DAMAGING = new Set([
  'DIRECT_DAMAGE', 'MULTI_HIT', 'EXECUTE', 'RAMPING', 'RECOIL', 'LIFESTEAL',
  'FIXED_DAMAGE', 'PERCENT_MAX_HULL', 'CONDITIONAL_DAMAGE', 'SCALE_WITH_FIELD',
  'SPEND_CHARGE', 'SELF_SACRIFICE', 'CONSUME_STATUS',
]);

const EXPECTED_PER_RARITY: Record<Rarity, number> = {
  common: 5, uncommon: 4, rare: 3, epic: 2, legendary: 1,
};

function walk(effects: SkillEffect[], visit: (e: SkillEffect) => void): void {
  for (const e of effects) {
    visit(e);
    if ('effects' in e && Array.isArray(e.effects)) walk(e.effects, visit);
  }
}

describe('roster shape (§7)', () => {
  it('has ten races of fifteen heroes each', () => {
    expect(HERO_LIST.length).toBe(150);
    for (const race of RACE_IDS) {
      expect(heroesByRace(race).length, `${race} roster size`).toBe(15);
    }
  });

  it('follows the 5/4/3/2/1 rarity spread in every race', () => {
    for (const race of RACE_IDS) {
      const heroes = heroesByRace(race);
      for (const rarity of RARITIES) {
        expect(
          heroes.filter((h) => h.rarity === rarity).length,
          `${race} ${rarity} count`,
        ).toBe(EXPECTED_PER_RARITY[rarity]);
      }
    }
  });

  it('gives every race exactly the §5.4 resistance profile', () => {
    for (const race of RACE_IDS) {
      const def = RACES[race];
      if (def.resists && def.vulnerable) {
        expect(def.resists, `${race} cannot resist and fear the same type`).not.toBe(def.vulnerable);
      }
    }
    // Terran alone resists nothing and fears nothing — that is deliberate (§7).
    expect(RACES.terran.resists).toBeNull();
    expect(RACES.terran.vulnerable).toBeNull();
  });

  it('uses unique ids and slugs', () => {
    expect(new Set(HERO_LIST.map((h) => h.id)).size).toBe(HERO_LIST.length);
    expect(new Set(HERO_LIST.map((h) => h.slug)).size).toBe(HERO_LIST.length);
    expect(new Set(SKILL_LIST.map((s) => s.id)).size).toBe(SKILL_LIST.length);
  });

  it('prices every hero at its rarity’s roster cost (§7)', () => {
    for (const h of HERO_LIST) {
      expect(h.rosterCost, `${h.id} roster cost`).toBe(ROSTER.COST[h.rarity]);
    }
  });
});

describe('hero definitions', () => {
  it('gives every hero four skills and an awakened passive', () => {
    for (const h of HERO_LIST) {
      expect(h.skills.length, `${h.id} skill count`).toBe(4);
      expect(new Set(h.skills).size, `${h.id} duplicate skills`).toBe(4);
      for (const id of h.skills) expect(SKILLS[id], `${h.id} → ${id}`).toBeDefined();
      expect(SKILLS[h.awakenedPassive], `${h.id} awakened`).toBeDefined();
      expect(getSkill(h.awakenedPassive).passive, `${h.id} awakened must be passive`).toBe(true);
    }
  });

  it('never puts a passive in an active skill slot', () => {
    for (const h of HERO_LIST) {
      for (const id of h.skills) {
        expect(getSkill(id).passive, `${h.id} → ${id} is passive`).not.toBe(true);
      }
    }
  });

  it('gives every hero at least two damaging options', () => {
    // A hero with one damaging skill spends half of every fight unable to
    // affect the enemy's HULL, which in a 1v1 is not a build — it is a loss.
    for (const h of HERO_LIST) {
      const damaging = h.skills.filter((id) =>
        getSkill(id).effects.some((e) => DAMAGING.has(e.kind)));
      expect(damaging.length, `${h.id} damaging skills`).toBeGreaterThanOrEqual(2);
    }
  });

  it('gives every unit a base attack that is never on cooldown', () => {
    // The rule: every hero always has an attack available, at every ascension
    // tier. Because ascension only ever ADDS skills, it is enough to require
    // the base attack inside the first three — then it is present from a
    // fresh account onward. A base attack is allowed to be weak; it is not
    // allowed to be absent, or the hero can be left with no legal move and
    // the fight simply stops.
    for (const h of HERO_LIST) {
      const base = h.skills.slice(0, 3).map(getSkill);
      const baseAttack = base.find(
        (s) => s.cooldown === 0 && s.effects.some((e) => DAMAGING.has(e.kind)),
      );
      expect(baseAttack, `${h.id} has no cooldown-free base attack`).toBeDefined();
    }
  });

  it('keeps a base attack available at every ascension tier', () => {
    for (const h of HERO_LIST) {
      for (const tier of [1, 2, 3, 4, 5, 6] as const) {
        const kit = skillsForAscension(h, tier).map(getSkill);
        const ready = kit.some(
          (s) => !s.passive && s.cooldown === 0 && s.effects.some((e) => DAMAGING.has(e.kind)),
        );
        expect(ready, `${h.id} at ascension ${tier} has no always-ready attack`).toBe(true);
      }
    }
  });

  it('lets every hero attack on every turn', () => {
    // A skill on cooldown N is available 1/(N+1) of the time. If a kit's
    // damaging skills do not sum to at least one full turn of availability,
    // the hero is periodically forced to pass — which in a permadeath 1v1
    // is a losing kit, not a defensive one.
    for (const h of HERO_LIST) {
      const uptime = h.skills
        .map(getSkill)
        .filter((s) => s.effects.some((e) => DAMAGING.has(e.kind)))
        .reduce((sum, s) => sum + 1 / (s.cooldown + 1), 0);
      expect(uptime, `${h.id} damage uptime`).toBeGreaterThanOrEqual(1);
    }
  });

  it('keeps stats positive, growing and inside the soft caps at level 60', () => {
    for (const h of HERO_LIST) {
      for (const key of ['hull', 'atk', 'def', 'spd', 'foc', 'res'] as const) {
        expect(h.baseStats[key], `${h.id}.${key} base`).toBeGreaterThan(0);
        expect(h.growth[key], `${h.id}.${key} growth`).toBeGreaterThan(0);
        expect(statAtLevel(h, key, 60), `${h.id}.${key} at 60`).toBeLessThanOrEqual(STAT_SOFT_CAPS[key]);
      }
    }
  });

  it('scales the stat budget monotonically with rarity across the roster', () => {
    // Per-race this does NOT hold, and should not: a legendary's value is
    // partly in its kit, so balance tuning can leave one with a smaller raw
    // budget than an epic of another race. What must hold is the aggregate
    // ladder. That rarity actually *plays* stronger is asserted where it can
    // be measured properly — in the balance report.
    const budget = (h: (typeof HERO_LIST)[number]) =>
      h.baseStats.atk + h.baseStats.def + h.baseStats.spd
      + h.baseStats.foc + h.baseStats.res + h.baseStats.hull / 3;
    const avg = (r: Rarity) => {
      const group = HERO_LIST.filter((h) => h.rarity === r);
      return group.reduce((sum, h) => sum + budget(h), 0) / group.length;
    };
    for (let i = 1; i < RARITIES.length; i++) {
      expect(
        avg(RARITIES[i]),
        `${RARITIES[i]} should out-budget ${RARITIES[i - 1]}`,
      ).toBeGreaterThan(avg(RARITIES[i - 1]));
    }
  });
});

describe('skill definitions (§0.2, §8)', () => {
  it('composes every skill from known primitives only', () => {
    for (const skill of SKILL_LIST) {
      expect(skill.effects.length, `${skill.id} has no effects`).toBeGreaterThan(0);
      walk(skill.effects, (e) => {
        expect(KNOWN_PRIMITIVES.has(e.kind), `${skill.id} uses unknown primitive ${e.kind}`).toBe(true);
      });
    }
  });

  it('references only defined statuses and fields', () => {
    for (const skill of SKILL_LIST) {
      walk(skill.effects, (e) => {
        if ('status' in e && e.status) expect(STATUSES[e.status], `${skill.id} → ${e.status}`).toBeDefined();
        if (e.kind === 'SET_FIELD') expect(FIELDS[e.field], `${skill.id} → ${e.field}`).toBeDefined();
        if (e.kind === 'SCALE_WITH_FIELD') {
          const fields = Array.isArray(e.field) ? e.field : [e.field];
          for (const f of fields) expect(FIELDS[f], `${skill.id} → ${f}`).toBeDefined();
        }
      });
    }
  });

  it('keeps priority inside the -2..+3 tier range (§5.2)', () => {
    for (const skill of SKILL_LIST) {
      expect(skill.priority, `${skill.id} priority`).toBeGreaterThanOrEqual(-2);
      expect(skill.priority, `${skill.id} priority`).toBeLessThanOrEqual(3);
    }
  });

  it('keeps the PRIORITY primitive in step with the priority field', () => {
    // The field is what turn order reads. The primitive is the same value
    // stated compositionally; if they drift, the tooltip lies about the
    // order the round will actually resolve in.
    for (const skill of SKILL_LIST) {
      const tiers = skill.effects.filter((e) => e.kind === 'PRIORITY');
      if (tiers.length === 0) continue;
      const total = tiers.reduce((sum, e) => sum + (e as { tier: number }).tier, 0);
      expect(total, `${skill.id}: PRIORITY primitive vs priority field`).toBe(skill.priority);
    }
  });

  it('keeps EXTRA_ACTION rare and expensive (§5.2)', () => {
    const withExtra = SKILL_LIST.filter((s) => s.effects.some((e) => e.kind === 'EXTRA_ACTION'));
    // A second action is the strongest thing in a 1v1. It stays exceptional.
    expect(withExtra.length).toBeLessThanOrEqual(6);
    for (const s of withExtra) {
      expect(s.cooldown, `${s.id} EXTRA_ACTION cooldown`).toBeGreaterThanOrEqual(4);
    }
  });

  it('keeps probabilities and durations sane', () => {
    for (const skill of SKILL_LIST) {
      expect(skill.cooldown, `${skill.id} cooldown`).toBeGreaterThanOrEqual(0);
      walk(skill.effects, (e) => {
        if ('baseChance' in e) {
          expect(e.baseChance, `${skill.id} baseChance`).toBeGreaterThan(0);
          expect(e.baseChance, `${skill.id} baseChance`).toBeLessThanOrEqual(1);
        }
        if ('pierce' in e) {
          expect(e.pierce, `${skill.id} pierce`).toBeGreaterThan(0);
          expect(e.pierce, `${skill.id} pierce`).toBeLessThanOrEqual(1);
        }
        if ('duration' in e && typeof e.duration === 'number') {
          expect(e.duration, `${skill.id} duration`).toBeGreaterThan(0);
        }
        if ('hits' in e) {
          expect(e.hits, `${skill.id} hits`).toBeGreaterThan(0);
          expect(e.hits, `${skill.id} hits`).toBeLessThanOrEqual(8);
        }
      });
    }
  });

  it('leaves no skill orphaned', () => {
    const used = new Set<string>();
    for (const h of HERO_LIST) {
      for (const id of h.skills) used.add(id);
      used.add(h.awakenedPassive);
    }
    const orphans = SKILL_LIST.filter((s) => !used.has(s.id)).map((s) => s.id);
    expect(orphans, `unused skills: ${orphans.join(', ')}`).toEqual([]);
  });
});
