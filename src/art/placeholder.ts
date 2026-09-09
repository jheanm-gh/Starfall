/* ============================================================
   §3.1 — deterministic procedural portraits.

   Not a grey box with a question mark. Each hero draws a chest-up
   silhouette from a per-race vocabulary (head shape, shoulder profile,
   optic array, appendage count), filled in the race's two colours on a
   hull-grey ground, wearing its rarity's frame construction from §2.3.

   The same heroId always produces the same portrait, so the roster looks
   stable across sessions and a hero is recognisable before any real art
   exists.
   ============================================================ */

import type { RaceId, Rarity } from '../engine/types';
import { RACES } from '../data/races';
import { at, hashString } from '../engine/rng';

const W = 512;
const H = 640;

type HeadShape = 'dome' | 'ovoid' | 'angular' | 'tapered' | 'crested' | 'split';
type OpticShape = 'visor' | 'cluster' | 'single' | 'slit' | 'none';
type ShoulderShape = 'squared' | 'sloped' | 'plated' | 'hunched';

interface RaceVocabulary {
  heads: HeadShape[];
  optics: OpticShape[];
  shoulders: ShoulderShape[];
  appendages: number[];
  /** Vertical proportion of the head, 1 is baseline. */
  headScale: number;
}

/* Each race reads as a family without any two heroes being identical. */
const VOCAB: Record<RaceId, RaceVocabulary> = {
  terran:    { heads: ['dome', 'ovoid'], optics: ['visor', 'single'], shoulders: ['squared', 'plated'], appendages: [0, 1], headScale: 1 },
  vantari:   { heads: ['angular', 'crested'], optics: ['slit', 'visor'], shoulders: ['plated', 'squared'], appendages: [0, 2], headScale: 0.92 },
  kelshar:   { heads: ['tapered', 'split'], optics: ['cluster'], shoulders: ['hunched', 'sloped'], appendages: [2, 3, 4], headScale: 1.05 },
  reclaimed: { heads: ['dome', 'angular', 'split'], optics: ['single', 'cluster'], shoulders: ['plated', 'hunched'], appendages: [1, 2], headScale: 1 },
  ithka:     { heads: ['tapered', 'ovoid'], optics: ['cluster', 'slit'], shoulders: ['sloped'], appendages: [2, 4], headScale: 1.12 },
  meridian:  { heads: ['ovoid', 'dome'], optics: ['visor', 'single'], shoulders: ['squared', 'sloped'], appendages: [0, 1], headScale: 1 },
  pyroclast: { heads: ['crested', 'angular'], optics: ['slit', 'none'], shoulders: ['plated', 'hunched'], appendages: [1, 3], headScale: 0.96 },
  umbral:    { heads: ['tapered', 'split'], optics: ['none', 'slit'], shoulders: ['sloped', 'hunched'], appendages: [0, 2], headScale: 1.08 },
  signal:    { heads: ['ovoid', 'crested'], optics: ['cluster', 'none'], shoulders: ['sloped', 'squared'], appendages: [3, 4], headScale: 1.04 },
  drenn:     { heads: ['angular', 'dome'], optics: ['single', 'slit'], shoulders: ['plated', 'hunched'], appendages: [0, 1], headScale: 0.88 },
};

/** Detail density, not brightness, escalates with rarity (§3.3). */
const RARITY_TICKS: Record<Rarity, number> = {
  common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5,
};

function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const to = (x: number) => Math.round(x).toString(16).padStart(2, '0');
  return `#${to(ar + (br - ar) * t)}${to(ag + (bg - ag) * t)}${to(ab + (bb - ab) * t)}`;
}

const RARITY_FRAME: Record<Rarity, { stroke: string; width: number; brackets: boolean; dash?: string }> = {
  common:    { stroke: '#3A362F', width: 2, brackets: false },
  uncommon:  { stroke: '#4A6B60', width: 2, brackets: false },
  rare:      { stroke: 'rgba(224,146,47,0.6)', width: 2, brackets: true },
  epic:      { stroke: '#8C3B24', width: 3, brackets: true, dash: '46 10' },
  legendary: { stroke: '#E0922F', width: 3, brackets: true },
};

function head(shape: HeadShape, cx: number, cy: number, rx: number, ry: number): string {
  switch (shape) {
    case 'dome':
      return `M ${cx - rx} ${cy + ry} L ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy} L ${cx + rx} ${cy + ry} Z`;
    case 'ovoid':
      return `M ${cx} ${cy - ry} C ${cx + rx} ${cy - ry}, ${cx + rx} ${cy + ry}, ${cx} ${cy + ry} C ${cx - rx} ${cy + ry}, ${cx - rx} ${cy - ry}, ${cx} ${cy - ry} Z`;
    case 'angular':
      return `M ${cx} ${cy - ry} L ${cx + rx} ${cy - ry * 0.35} L ${cx + rx * 0.78} ${cy + ry} L ${cx - rx * 0.78} ${cy + ry} L ${cx - rx} ${cy - ry * 0.35} Z`;
    case 'tapered':
      return `M ${cx} ${cy - ry} L ${cx + rx * 0.82} ${cy - ry * 0.1} L ${cx + rx * 0.4} ${cy + ry} L ${cx - rx * 0.4} ${cy + ry} L ${cx - rx * 0.82} ${cy - ry * 0.1} Z`;
    case 'crested':
      return `M ${cx} ${cy - ry * 1.3} L ${cx + rx * 0.5} ${cy - ry * 0.55} L ${cx + rx} ${cy - ry * 0.1} L ${cx + rx * 0.7} ${cy + ry} L ${cx - rx * 0.7} ${cy + ry} L ${cx - rx} ${cy - ry * 0.1} L ${cx - rx * 0.5} ${cy - ry * 0.55} Z`;
    case 'split':
      return `M ${cx - rx} ${cy + ry} L ${cx - rx * 0.9} ${cy - ry * 0.4} L ${cx - rx * 0.2} ${cy - ry} L ${cx} ${cy - ry * 0.45} L ${cx + rx * 0.2} ${cy - ry} L ${cx + rx * 0.9} ${cy - ry * 0.4} L ${cx + rx} ${cy + ry} Z`;
  }
}

function shoulders(shape: ShoulderShape, cx: number, top: number): string {
  const bottom = H + 4;
  switch (shape) {
    case 'squared':
      return `M ${cx - 216} ${bottom} L ${cx - 204} ${top + 30} L ${cx - 104} ${top - 6} L ${cx + 104} ${top - 6} L ${cx + 204} ${top + 30} L ${cx + 216} ${bottom} Z`;
    case 'sloped':
      return `M ${cx - 196} ${bottom} C ${cx - 190} ${top + 56}, ${cx - 96} ${top + 6}, ${cx} ${top - 8} C ${cx + 96} ${top + 6}, ${cx + 190} ${top + 56}, ${cx + 196} ${bottom} Z`;
    case 'plated':
      return `M ${cx - 232} ${bottom} L ${cx - 224} ${top + 62} L ${cx - 168} ${top + 16} L ${cx - 96} ${top - 10} L ${cx + 96} ${top - 10} L ${cx + 168} ${top + 16} L ${cx + 224} ${top + 62} L ${cx + 232} ${bottom} Z`;
    case 'hunched':
      return `M ${cx - 210} ${bottom} L ${cx - 228} ${top - 6} L ${cx - 132} ${top + 40} L ${cx} ${top + 22} L ${cx + 132} ${top + 40} L ${cx + 228} ${top - 6} L ${cx + 210} ${bottom} Z`;
  }
}

/** Chest hardware: a plate, vents, and rank ticks. Reads as equipment. */
function torsoDetail(
  seed: number, cx: number, top: number, mid: string, dark: string, ticks: number,
): string {
  const parts: string[] = [];
  const plateW = 150 + at(seed, 11) * 60;
  const plateY = top + 74;
  parts.push(`<path d="M ${cx - plateW / 2} ${H} L ${cx - plateW / 2} ${plateY + 14} L ${cx - plateW / 2 + 16} ${plateY} L ${cx + plateW / 2 - 16} ${plateY} L ${cx + plateW / 2} ${plateY + 14} L ${cx + plateW / 2} ${H} Z" fill="${mid}" />`);

  const vents = 2 + Math.floor(at(seed, 12) * 3);
  for (let i = 0; i < vents; i++) {
    const vx = cx - plateW / 2 + 22 + (i * (plateW - 44)) / Math.max(1, vents - 1);
    parts.push(`<rect x="${vx.toFixed(1)}" y="${(plateY + 34).toFixed(1)}" width="7" height="${(46 + at(seed, 13 + i) * 30).toFixed(1)}" fill="${dark}" opacity="0.75" />`);
  }

  // Rarity reads as detail density, never brightness (§3.3).
  for (let i = 0; i < ticks; i++) {
    parts.push(`<rect x="${(cx - plateW / 2 + 20 + i * 15).toFixed(1)}" y="${(plateY + 12).toFixed(1)}" width="9" height="4" fill="${dark}" opacity="0.9" />`);
  }
  return parts.join('');
}

/** Collar / gorget across the base of the neck. */
function collar(shape: ShoulderShape, cx: number, top: number, colour: string): string {
  const w = shape === 'hunched' ? 128 : 108;
  return `<path d="M ${cx - w} ${top + 26} L ${cx - w * 0.62} ${top - 4} L ${cx + w * 0.62} ${top - 4} L ${cx + w} ${top + 26} L ${cx + w * 0.7} ${top + 40} L ${cx - w * 0.7} ${top + 40} Z" fill="${colour}" />`;
}

function optics(shape: OpticShape, cx: number, cy: number, rx: number, colour: string): string {
  switch (shape) {
    case 'visor':
      return `<rect x="${cx - rx * 0.74}" y="${cy - 13}" width="${rx * 1.48}" height="24" fill="${colour}" />`
        + `<rect x="${cx - rx * 0.74}" y="${cy - 13}" width="${rx * 1.48}" height="4" fill="#D8D2C4" opacity="0.18" />`;
    case 'single':
      return `<circle cx="${cx}" cy="${cy}" r="${rx * 0.27}" fill="${colour}" />`
        + `<circle cx="${cx - rx * 0.09}" cy="${cy - rx * 0.09}" r="${rx * 0.07}" fill="#D8D2C4" opacity="0.22" />`;
    case 'slit':
      return `<rect x="${cx - rx * 0.62}" y="${cy - 5}" width="${rx * 1.24}" height="10" fill="${colour}" />`;
    case 'cluster': {
      const dots: string[] = [];
      for (let i = 0; i < 4; i++) {
        const ox = (i - 1.5) * rx * 0.36;
        const oy = i === 0 || i === 3 ? 8 : -10;
        dots.push(`<circle cx="${(cx + ox).toFixed(1)}" cy="${(cy + oy).toFixed(1)}" r="${(rx * 0.12).toFixed(1)}" fill="${colour}" />`);
      }
      return dots.join('');
    }
    case 'none':
      // Featureless plate, broken only by a seam. Umbral and Signal read
      // as wrong precisely because there is nothing to look at.
      return `<rect x="${cx - rx * 0.5}" y="${cy}" width="${rx}" height="3" fill="${colour}" opacity="0.7" />`;
  }
}

function appendages(count: number, cx: number, cy: number, rx: number, ry: number, colour: string): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const tier = Math.floor(i / 2);
    const x0 = cx + side * rx * 0.74;
    const y0 = cy - ry * 0.34 + tier * 30;
    const x1 = cx + side * (rx * 1.9 + tier * 16);
    const y1 = y0 - 74 - tier * 26;
    parts.push(`<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${x1.toFixed(1)} ${(y0 - 26).toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${colour}" stroke-width="${(9 - tier * 2).toFixed(0)}" fill="none" stroke-linecap="round" />`);
  }
  return parts.join('');
}

function frame(rarity: Rarity): string {
  const f = RARITY_FRAME[rarity];
  const inset = f.width;
  const parts = [
    `<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" fill="none" stroke="${f.stroke}" stroke-width="${f.width}"${f.dash ? ` stroke-dasharray="${f.dash}"` : ''} />`,
  ];
  // Anodised alloy reads as a doubled border with a 2px inner offset (§2.3).
  if (rarity === 'uncommon') {
    parts.push(`<rect x="${inset + 6}" y="${inset + 6}" width="${W - (inset + 6) * 2}" height="${H - (inset + 6) * 2}" fill="none" stroke="rgba(74,107,96,0.35)" stroke-width="1" />`);
  }
  if (f.brackets) {
    const b = 34;
    const o = inset + 8;
    const corners = [
      `M ${o} ${o + b} L ${o} ${o} L ${o + b} ${o}`,
      `M ${W - o - b} ${o} L ${W - o} ${o} L ${W - o} ${o + b}`,
      `M ${W - o} ${H - o - b} L ${W - o} ${H - o} L ${W - o - b} ${H - o}`,
      `M ${o + b} ${H - o} L ${o} ${H - o} L ${o} ${H - o - b}`,
    ];
    for (const d of corners) {
      parts.push(`<path d="${d}" fill="none" stroke="${f.stroke}" stroke-width="${f.width}" />`);
    }
  }
  return parts.join('');
}

export function generatePlaceholderSvg(heroId: string, race: RaceId, rarity: Rarity): string {
  const vocab = VOCAB[race];
  const [dark, light] = RACES[race].palette;
  const seed = hashString(heroId);
  const uid = seed % 99991;
  const pickFrom = <T,>(items: readonly T[], index: number): T =>
    items[Math.floor(at(seed, index) * items.length) % items.length];

  const headShape = pickFrom(vocab.heads, 0);
  const opticShape = pickFrom(vocab.optics, 1);
  const shoulderShape = pickFrom(vocab.shoulders, 2);
  const appendageCount = pickFrom(vocab.appendages, 3);

  const cx = W / 2 + (at(seed, 4) - 0.5) * 22;
  const headRx = 112 + at(seed, 5) * 30;
  const headRy = (134 + at(seed, 6) * 34) * vocab.headScale;
  const headCy = 208;
  const neckBase = headCy + headRy - 10;
  const shoulderTop = neckBase + 54;
  const tilt = (at(seed, 7) - 0.5) * 7;
  const ticks = RARITY_TICKS[rarity];

  // A mid tone mixed from the race's two colours keeps every hero to a
  // two-colour family while still giving the plating a readable step.
  const mid = mixHex(dark, light, 0.35);
  const headPath = head(headShape, cx, headCy, headRx, headRy);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${RACES[race].name} silhouette">
  <defs>
    <linearGradient id="v${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0D0C0A" stop-opacity="0.5" />
      <stop offset="0.5" stop-color="#0D0C0A" stop-opacity="0" />
      <stop offset="1" stop-color="#0D0C0A" stop-opacity="0.78" />
    </linearGradient>
    <linearGradient id="k${uid}" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0" stop-color="#D8D2C4" stop-opacity="0.16" />
      <stop offset="0.42" stop-color="#D8D2C4" stop-opacity="0" />
      <stop offset="1" stop-color="#0D0C0A" stop-opacity="0.42" />
    </linearGradient>
    <pattern id="s${uid}" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#0D0C0A" opacity="0.15" />
    </pattern>
    <clipPath id="h${uid}"><path d="${headPath}" /></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#22201C" />
  <rect width="${W}" height="${H}" fill="url(#v${uid})" />
  ${appendages(appendageCount, cx, headCy, headRx, headRy, mid)}
  <rect x="${(cx - 40).toFixed(1)}" y="${(neckBase - 20).toFixed(1)}" width="80" height="84" fill="${dark}" />
  <path d="${shoulders(shoulderShape, cx, shoulderTop)}" fill="${dark}" />
  ${torsoDetail(seed, cx, shoulderTop, mid, '#0D0C0A', ticks)}
  ${collar(shoulderShape, cx, shoulderTop, mid)}
  <g transform="rotate(${tilt.toFixed(2)} ${cx.toFixed(1)} ${headCy})">
    <path d="${headPath}" fill="${light}" />
    <g clip-path="url(#h${uid})">
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#k${uid})" />
      <rect x="${(cx + headRx * 0.34).toFixed(1)}" y="0" width="${W}" height="${H}" fill="#0D0C0A" opacity="0.24" />
      <rect x="${(cx - headRx).toFixed(1)}" y="${(headCy - headRy * 0.9).toFixed(1)}" width="${(headRx * 2).toFixed(1)}" height="6" fill="#0D0C0A" opacity="0.3" />
    </g>
    <path d="${headPath}" fill="none" stroke="#0D0C0A" stroke-opacity="0.55" stroke-width="3" />
    ${optics(opticShape, cx, headCy + headRy * 0.08, headRx, '#0D0C0A')}
  </g>
  <rect width="${W}" height="${H}" fill="url(#s${uid})" />
  ${frame(rarity)}
</svg>`;
}

/** SVG data URI, safe to drop straight into an <img src>. */
export function generatePlaceholder(heroId: string, race: RaceId, rarity: Rarity): string {
  const svg = generatePlaceholderSvg(heroId, race, rarity);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
