/* The §2 contract, rendered. Every component the design system defines
   appears here, so a drift from the spec is visible rather than argued
   about. P0's done-when condition points at this route. */

import { RARITIES, type StatusId } from '../../engine/types';
import { STATUS_LIST } from '../../data/statuses';
import { FIELD_LIST } from '../../data/fields';
import { HERO_LIST } from '../../data/registry';
import {
  Bar, Button, Panel, Portrait, RARITY_LABEL, RarityFrame, SectionLabel, StatRow, StatusChip, TypeTag,
} from './primitives';
import { DAMAGE_TYPES } from '../../engine/types';

const SWATCHES: { name: string; token: string; use: string }[] = [
  { name: 'void', token: '--void', use: 'Combat backdrop, deepest recess' },
  { name: 'hull', token: '--hull', use: 'Panel ground, dull olive-grey steel' },
  { name: 'seam', token: '--seam', use: 'Borders and dividers — never text' },
  { name: 'bone', token: '--bone', use: 'Primary text, aged label plastic' },
  { name: 'amber', token: '--amber', use: 'Phosphor instrument amber, primary accent' },
  { name: 'oxide', token: '--oxide', use: 'Rust red — damage, danger, loss' },
  { name: 'verdigris', token: '--verdigris', use: 'Patina teal — healing, positive states' },
];

export function Styleguide() {
  const sample = HERO_LIST.slice(0, 5);
  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
      <Panel className="p-3">
        <SectionLabel right="§2 of the build specification">Design contract</SectionLabel>
        <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
          Six colours, two typefaces, one radius exception, one ambient animation.
          Anything on screen that is not derived from this page is a bug.
        </p>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right="§2.1">Palette</SectionLabel>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {SWATCHES.map((s) => (
            <div key={s.name} className="panel-recess p-2">
              <div style={{ background: `var(${s.token})`, height: 44, border: '1px solid var(--seam)' }} />
              <div className="mt-1 text-sm" style={{ fontFamily: 'var(--font-display)' }}>{s.name}</div>
              <div className="text-xs" style={{ color: 'var(--bone-faint)' }}>{s.use}</div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--bone-faint)' }}>
          No cyan, and no near-black-plus-acid-green. Amber phosphor is a real instrumentation
          convention and is warm where the rest of the palette is cold.
        </p>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right="§2.2">Typography</SectionLabel>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>Saira Condensed — names, headers, callouts</div>
            {([['--step-5', 47], ['--step-4', 37], ['--step-3', 30], ['--step-2', 24], ['--step-1', 19]] as const).map(([token, px]) => (
              <div key={token} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: `var(${token})`, lineHeight: 1.1 }}>
                Admiral Delacroix <span className="tnum text-xs" style={{ color: 'var(--bone-faint)' }}>{px}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>IBM Plex Sans — body, skills, tooltips</div>
            <p className="text-sm">
              Three bursts downrange. Nobody aims through it. Body copy runs at 15px with a
              1.25 ratio above it, and numerics use tabular lining figures so stat columns
              align without switching to a monospace face.
            </p>
            <div className="tnum mt-2">
              <StatRow label="ATK" value={1284} />
              <StatRow label="DEF" value={906} />
              <StatRow label="SPD" value={77} />
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right="§2.3">Rarity as material</SectionLabel>
        <p className="text-sm mb-3" style={{ color: 'var(--bone-dim)' }}>
          Rarity is expressed through material and frame construction, with hue as a quiet
          secondary signal. No glow ramps, no rainbow borders. The Legendary heat shimmer is
          the only ambient motion in the entire interface.
        </p>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {RARITIES.map((r, i) => (
            <RarityFrame key={r} rarity={r} className="p-2">
              {sample[i] ? <Portrait hero={sample[i]} size={132} /> : null}
              <div className="mt-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, textTransform: 'capitalize' }}>{r}</div>
              <div className="text-xs" style={{ color: 'var(--bone-faint)' }}>{RARITY_LABEL[r]}</div>
            </RarityFrame>
          ))}
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right="§2.4 — the one radius exception">Status chips</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {STATUS_LIST.map((s) => (
            <StatusChip key={s.id} id={s.id as StatusId} stacks={s.maxStacks} turns={s.duration} />
          ))}
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel>Controls and bars</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button variant="primary">Primary</Button>
          <Button>Default</Button>
          <Button variant="danger">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div><div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>HULL, healthy</div><Bar value={82} max={100} /></div>
          <div><div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>HULL, critical</div><Bar value={17} max={100} /></div>
          <div><div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>Shield</div><Bar value={44} max={100} tone="shield" /></div>
          <div><div className="text-xs mb-1" style={{ color: 'var(--bone-dim)' }}>Enemy</div><Bar value={63} max={100} tone="enemy" /></div>
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right="§5.4">Damage types and conditions</SectionLabel>
        <div className="flex flex-wrap gap-3 mb-3">
          {DAMAGE_TYPES.map((t) => <TypeTag key={t} type={t} />)}
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {FIELD_LIST.map((f) => (
            <div key={f.id} className="panel-recess p-2">
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--amber)' }}>{f.name}</div>
              <div className="text-xs" style={{ color: 'var(--bone-dim)' }}>{f.description}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-3">
        <SectionLabel right="§2.5">Motion budget</SectionLabel>
        <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
          Permitted: damage numbers rise and fade, HP drain at 250ms, chip application pop,
          turn-order slide, 4px screen shake on a critical, one combat-start sequence,
          and the Legendary frame shimmer. Forbidden: entrance animations on lists, hover
          transitions on cards, particle fields, parallax, animated gradients.
          Everything above collapses to instant under <code>prefers-reduced-motion</code>,
          except the HP drain, which shortens to 80ms.
        </p>
      </Panel>
    </div>
  );
}
