import { describe, expect, it } from 'vitest';
import { generatePlaceholder, generatePlaceholderSvg } from './placeholder';
import { HERO_LIST } from '../data/registry';

describe('procedural portraits', () => {
  it('is deterministic per hero id', () => {
    const a = generatePlaceholderSvg('terran_vale', 'terran', 'uncommon');
    const b = generatePlaceholderSvg('terran_vale', 'terran', 'uncommon');
    expect(a).toBe(b);
  });

  it('gives different heroes different silhouettes', () => {
    const svgs = new Set(HERO_LIST.map((h) => generatePlaceholderSvg(h.id, h.race, h.rarity)));
    expect(svgs.size).toBe(HERO_LIST.length);
  });

  it('emits a usable data URI with no unresolved template holes', () => {
    for (const h of HERO_LIST) {
      const svg = generatePlaceholderSvg(h.id, h.race, h.rarity);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).not.toContain('undefined');
      expect(svg).not.toContain('NaN');
      expect(generatePlaceholder(h.id, h.race, h.rarity).startsWith('data:image/svg+xml')).toBe(true);
    }
  });
});
