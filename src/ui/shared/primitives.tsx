/* The design system, as components. Everything here is a direct reading of
   §2 — the palette, the rarity materials, the single permitted radius
   exception, the motion budget. Nothing invents a token. */

import type { CSSProperties, ReactNode } from 'react';
import type { DamageType, HeroDefinition, Rarity, StatusId } from '../../engine/types';
import { STATUSES } from '../../data/statuses';
import { heroPortrait } from '../../art/manifest';

/* ---------- panels ---------- */

export function Panel({ children, className = '', recess = false, style }: {
  children: ReactNode; className?: string; recess?: boolean; style?: CSSProperties;
}) {
  return (
    <div className={`${recess ? 'panel-recess' : 'panel'} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="label-rule flex items-baseline justify-between gap-3 mb-3">
      <span>{children}</span>
      {right ? <span className="font-body text-xs" style={{ color: 'var(--bone-dim)' }}>{right}</span> : null}
    </div>
  );
}

/* ---------- controls ---------- */

export function Button({ children, onClick, variant = 'default', disabled, title, className = '', full }: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  title?: string;
  className?: string;
  full?: boolean;
}) {
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : '';
  return (
    <button
      type="button"
      className={`btn ${variantClass} ${full ? 'w-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

/* ---------- §2.3 rarity as material ---------- */

export const RARITY_CLASS: Record<Rarity, string> = {
  common: 'rarity-common',
  uncommon: 'rarity-uncommon',
  rare: 'rarity-rare brackets',
  epic: 'rarity-epic',
  legendary: 'rarity-legendary brackets',
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Stamped steel',
  uncommon: 'Anodised alloy',
  rare: 'Etched brass',
  epic: 'Ablative ceramic',
  legendary: 'Irradiated composite',
};

export function RarityFrame({ rarity, children, className = '', style }: {
  rarity: Rarity; children: ReactNode; className?: string; style?: CSSProperties;
}) {
  return (
    <div className={`${RARITY_CLASS[rarity]} ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ---------- bars ---------- */

export function Bar({ value, max, tone = 'hull', label, height = 14 }: {
  value: number; max: number; tone?: 'hull' | 'shield' | 'exp' | 'enemy'; label?: string; height?: number;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const colour =
    tone === 'shield' ? 'var(--verdigris)'
      : tone === 'exp' ? 'var(--amber-60)'
        : tone === 'enemy' ? 'var(--oxide)'
          : pct <= 25 ? 'var(--oxide)' : 'var(--amber)';
  return (
    <div className="bar-track" style={{ height }} role="meter" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className="bar-fill" style={{ width: `${pct}%`, background: colour }} />
    </div>
  );
}

/* ---------- status chips: the one rounded element in the game ---------- */

const STATUS_TONE: Record<StatusId, string> = {
  burn: 'var(--oxide)', corrode: 'var(--oxide)', hemorrhage: 'var(--oxide)',
  irradiate: 'var(--oxide)', stun: 'var(--amber)', jam: 'var(--amber)',
  blind: 'var(--amber)', suppress: 'var(--amber)', mark: 'var(--oxide)',
  static: 'var(--amber)', overclock: 'var(--verdigris)', bulwark: 'var(--verdigris)',
};

export function StatusChip({ id, stacks, turns, fresh }: {
  id: StatusId; stacks: number; turns: number; fresh?: boolean;
}) {
  const def = STATUSES[id];
  return (
    <span
      className={`chip tnum ${fresh ? 'chip-pop' : ''}`}
      style={{ color: STATUS_TONE[id] }}
      title={def.description}
    >
      {def.name}
      {def.maxStacks > 1 && stacks > 1 ? <b>×{stacks}</b> : null}
      <i style={{ opacity: 0.7, fontStyle: 'normal' }}>{turns}</i>
    </span>
  );
}

/* ---------- damage types ---------- */

export const TYPE_TONE: Record<DamageType, string> = {
  kinetic: 'var(--bone-dim)',
  thermal: 'var(--oxide)',
  corrosive: 'var(--verdigris)',
  em: 'var(--amber)',
  psionic: 'var(--bone)',
};

export function TypeTag({ type }: { type: DamageType }) {
  return (
    <span className="text-xs font-body" style={{ color: TYPE_TONE[type] }}>
      {type}
    </span>
  );
}

/* ---------- portraits ---------- */

export function Portrait({ hero, size = 96, className = '' }: {
  hero: HeroDefinition; size?: number; className?: string;
}) {
  return (
    <img
      src={heroPortrait(hero)}
      alt={hero.name}
      width={size}
      height={Math.round(size * 1.25)}
      loading="lazy"
      className={className}
      style={{ width: size, height: Math.round(size * 1.25), objectFit: 'cover' }}
    />
  );
}

/* ---------- stat readouts ---------- */

export function StatRow({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1" style={{ borderBottom: '1px solid var(--seam)' }}>
      <span className="text-xs" style={{ color: 'var(--bone-dim)' }}>{label}</span>
      <span className="tnum" style={{ fontWeight: 500 }}>
        {value}
        {sub ? <span className="text-xs ml-1" style={{ color: 'var(--bone-faint)' }}>{sub}</span> : null}
      </span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm px-3 py-6 text-center" style={{ color: 'var(--bone-faint)' }}>
      {children}
    </div>
  );
}
