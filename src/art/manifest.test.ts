/* The §0.4 guarantee, asserted: with no art present, nothing throws and
   nothing returns a broken path. Every hero still renders. */

import { describe, expect, it } from 'vitest';
import {
  assetCoverage, chassisIcon, damageTypeIcon, effectSheet, fieldOverlay,
  hasRealPortrait, heroPortrait, itemIcon, musicTrack, portraitCoverage,
  raceEmblem, rarityFrame, runeIcon, sectorBackdrop, sfx, statusIcon, uiAsset,
} from './manifest';
import { DAMAGE_TYPES, RACE_IDS, RARITIES } from '../engine/types';
import { HERO_LIST } from '../data/registry';
import { STATUS_LIST } from '../data/statuses';
import { FIELD_LIST } from '../data/fields';
import { CHASSIS_LIST } from '../data/gear';
import { RUNE_LIST } from '../data/runes';
import { ITEM_LIST } from '../data/items';
import { SECTORS } from '../data/sectors';

describe('asset manifest', () => {
  it('renders every hero with or without real art', () => {
    for (const h of HERO_LIST) {
      const src = heroPortrait(h);
      expect(src, `${h.id} portrait`).toBeTruthy();
      expect(src.startsWith('data:image/svg+xml') || src.startsWith('/assets/heroes/')).toBe(true);
    }
  });

  it('resolves a missing asset to null rather than a broken path', () => {
    // Every one of these is unshipped today; none may invent a URL.
    for (const race of RACE_IDS) expect(raceEmblem(race)).toBeNull();
    for (const s of SECTORS) expect(sectorBackdrop(s.id)).toBeNull();
    for (const f of FIELD_LIST) expect(fieldOverlay(f.id)).toBeNull();
    for (const s of STATUS_LIST) expect(statusIcon(s.id)).toBeNull();
    for (const t of DAMAGE_TYPES) expect(damageTypeIcon(t)).toBeNull();
    for (const c of CHASSIS_LIST) expect(chassisIcon(c.id)).toBeNull();
    for (const r of RUNE_LIST) expect(runeIcon(r.id)).toBeNull();
    for (const i of ITEM_LIST) expect(itemIcon(i.id)).toBeNull();
    for (const r of RARITIES) expect(rarityFrame(r)).toBeNull();
    for (const t of DAMAGE_TYPES) expect(effectSheet(t)).toBeNull();
    for (const e of ['crit', 'heal', 'shield', 'dodge', 'death']) expect(effectSheet(e)).toBeNull();
    expect(uiAsset('frames/legendary')).toBeNull();
    expect(musicTrack('combat_standard')).toBeNull();
    expect(sfx('hit_kinetic')).toBeNull();
  });

  it('reports P9 coverage against the counts the data actually implies', () => {
    const expected = {
      heroes: HERO_LIST.length,
      statuses: STATUS_LIST.length,
      fields: FIELD_LIST.length,
      sectors: SECTORS.length,
      types: DAMAGE_TYPES.length,
    };
    const coverage = assetCoverage(expected);
    expect(coverage).toHaveLength(5);
    for (const entry of coverage) {
      expect(entry.expected).toBeGreaterThan(0);
      expect(entry.shipped).toBe(0); // nothing has landed yet
    }
    expect(portraitCoverage(HERO_LIST)).toEqual({ real: 0, total: 150 });
    expect(HERO_LIST.every((h) => !hasRealPortrait(h))).toBe(true);
  });
});
