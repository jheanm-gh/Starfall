/* §2.4 — combat is a fixed three-band vertical layout, never a scrolling
   page. Enemy band 30%, field/state band 15%, player band 55%.

   The centre band is the load-bearing element: environmental conditions
   and status stacks are the tactical information in a 1v1 with no
   switching, so they get real estate instead of an icon row. */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CombatEvent, CombatState, Side } from '../../engine/types';
import { FIELDS } from '../../data/fields';
import { getHero, getSkill } from '../../data/registry';
import { COMMANDER_SKILLS } from '../../data/commander';
import { skillUnavailableReason, usableSkills } from '../../engine/combat/rules';
import { effectiveStat } from '../../engine/combat/stats';
import { computeOrder } from '../../engine/combat/turnOrder';
import { useAccount } from '../../state/accountStore';
import { useRun } from '../../state/runStore';
import { useUi } from '../../state/uiStore';
import { Bar, Button, Panel, Portrait, StatusChip, TypeTag } from '../shared/primitives';

interface FloatingNumber {
  id: number;
  side: Side;
  amount: number;
  crit: boolean;
  heal: boolean;
}

let floatId = 0;

/** Pulls the new events since the last render into transient visuals. */
function useCombatFeedback(combat: CombatState | null) {
  const seen = useRef(0);
  const [floats, setFloats] = useState<FloatingNumber[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!combat) { seen.current = 0; return; }
    if (combat.log.length < seen.current) seen.current = 0;
    const fresh = combat.log.slice(seen.current);
    seen.current = combat.log.length;

    const added: FloatingNumber[] = [];
    let sawCrit = false;
    for (const e of fresh) {
      if ((e.kind === 'damage' || e.kind === 'crit' || e.kind === 'status_tick') && e.amount) {
        added.push({ id: ++floatId, side: e.targetSide ?? e.side ?? 'enemy', amount: e.amount, crit: e.kind === 'crit', heal: false });
        if (e.kind === 'crit') sawCrit = true;
      }
      if (e.kind === 'heal' && e.amount) {
        added.push({ id: ++floatId, side: e.side ?? 'player', amount: e.amount, crit: false, heal: true });
      }
    }
    if (added.length) {
      setFloats((f) => [...f, ...added].slice(-8));
      setTimeout(() => setFloats((f) => f.slice(added.length)), 950);
    }
    // §2.5: screen shake on critical hits — 4px, 120ms, nothing more.
    if (sawCrit) {
      setShake(true);
      setTimeout(() => setShake(false), 130);
    }
  }, [combat]);

  return { floats, shake };
}

function Floats({ floats, side }: { floats: FloatingNumber[]; side: Side }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {floats.filter((f) => f.side === side).map((f, i) => (
        <span
          key={f.id}
          className="float-up tnum absolute"
          style={{
            left: `${42 + ((i * 13) % 26)}%`,
            fontSize: f.crit ? 'var(--step-3)' : 'var(--step-2)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: f.heal ? 'var(--verdigris)' : f.crit ? 'var(--amber)' : 'var(--oxide)',
          }}
        >
          {f.heal ? '+' : '−'}{f.amount}
        </span>
      ))}
    </div>
  );
}

function CombatantBand({ combat, side, compact }: { combat: CombatState; side: Side; compact?: boolean }) {
  const c = combat[side];
  const def = getHero(c.defId);
  return (
    <div className="flex items-center gap-3 h-full px-3">
      <div style={{ flex: '0 0 auto' }}>
        <Portrait hero={def} size={compact ? 62 : 88} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h2 className="truncate" style={{ fontSize: compact ? 'var(--step-1)' : 'var(--step-2)' }}>{c.name}</h2>
          <span className="text-xs tnum" style={{ color: 'var(--bone-faint)' }}>L{c.level}</span>
          <TypeTag type={c.damageType} />
        </div>
        <div className="mt-1">
          <Bar value={c.hull} max={c.maxHull} tone={side === 'enemy' ? 'enemy' : 'hull'} label={`${c.name} HULL`} height={compact ? 12 : 16} />
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="tnum text-xs" style={{ color: 'var(--bone-dim)' }}>
            {c.hull} / {c.maxHull}
            {c.shield > 0 ? <b style={{ color: 'var(--verdigris)', marginLeft: 8 }}>+{c.shield}</b> : null}
          </span>
          <span className="tnum text-xs" style={{ color: 'var(--bone-faint)' }}>
            ATK {Math.round(effectiveStat(c, 'atk', combat.field))} · DEF {Math.round(effectiveStat(c, 'def', combat.field))} · SPD {Math.round(effectiveStat(c, 'spd', combat.field))}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusColumn({ combat, side, align }: { combat: CombatState; side: Side; align: 'left' | 'right' }) {
  const c = combat[side];
  const mods = c.mods.filter((m) => Number.isFinite(m.turnsLeft));
  return (
    <div className={`flex flex-wrap gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
      {c.statuses.map((s) => (
        <StatusChip key={s.id} id={s.id} stacks={s.stacks} turns={s.turnsLeft} />
      ))}
      {mods.map((m, i) => (
        <span key={`${m.stat}${i}`} className="chip tnum" style={{ color: m.positive ? 'var(--verdigris)' : 'var(--oxide)' }}>
          {m.stat.toUpperCase()} {m.percent > 0 ? '+' : ''}{Math.round(m.percent * 100)}%
          <i style={{ opacity: 0.7, fontStyle: 'normal' }}>{m.turnsLeft}</i>
        </span>
      ))}
      {c.statuses.length === 0 && mods.length === 0 ? (
        <span className="text-xs" style={{ color: 'var(--bone-faint)' }}>no active states</span>
      ) : null}
    </div>
  );
}

export function CombatScreen() {
  const run = useRun((s) => s.run);
  const useSkill = useRun((s) => s.useSkill);
  const useCommanderSkill = useRun((s) => s.useCommanderSkill);
  const concludeCombat = useRun((s) => s.concludeCombat);
  const commander = useAccount((s) => s.account.commander);
  const logOpen = useUi((s) => s.combatLogOpen);
  const toggleLog = useUi((s) => s.toggleCombatLog);

  const combat = run?.combat ?? null;
  const { floats, shake } = useCombatFeedback(combat);

  const skills = useMemo(() => (combat ? combat.player.skills.map(getSkill).filter((s) => !s.passive) : []), [combat]);
  const usable = useMemo(() => (combat ? usableSkills(combat, 'player') : []), [combat]);

  // §2.6: combat is fully playable without a mouse.
  useEffect(() => {
    if (!combat) return;
    const onKey = (e: KeyboardEvent) => {
      // The log stays reachable after the fight ends; actions do not.
      if (e.key.toLowerCase() === 'l') { toggleLog(); return; }
      if (combat.outcome !== 'active') return;
      const index = Number(e.key) - 1;
      if (index >= 0 && index < skills.length) {
        const id = skills[index].id;
        if (usable.includes(id)) useSkill(id);
      }
      if (e.key.toLowerCase() === 'q') useCommanderSkill(0);
      if (e.key.toLowerCase() === 'w') useCommanderSkill(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combat, skills, usable, useSkill, useCommanderSkill, toggleLog]);

  if (!run || !combat) return null;

  const field = combat.field ? FIELDS[combat.field] : null;
  const finished = combat.outcome !== 'active';

  // Show who would move first if the player committed their fastest option.
  const order = computeOrder(combat, {
    player: { action: { type: 'SKIP' }, skill: null },
    enemy: { action: { type: 'SKIP' }, skill: null },
  });

  return (
    <div className={`flex flex-col h-full ${shake ? 'shake' : ''}`} style={{ background: 'var(--void)' }}>
      {/* ---------- enemy band, 30% ---------- */}
      <div className="relative scanline" style={{ flex: '0 0 30%', borderBottom: '1px solid var(--seam)', minHeight: 128 }}>
        <CombatantBand combat={combat} side="enemy" />
        <Floats floats={floats} side="enemy" />
      </div>

      {/* ---------- field and state band, 15% ---------- */}
      <div style={{ flex: '0 0 15%', minHeight: 116, background: 'var(--hull)', borderBottom: '1px solid var(--seam)' }} className="px-3 py-2 overflow-hidden">
        <div className="flex items-baseline justify-between gap-3">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-1)', color: field ? 'var(--amber)' : 'var(--bone-faint)' }}>
            {field ? field.name : 'Clear conditions'}
          </span>
          <span className="tnum text-xs" style={{ color: 'var(--bone-dim)' }}>
            Round {combat.round} · {order[0] === 'player' ? 'you move first' : 'they move first'}
          </span>
        </div>
        {field ? <p className="text-xs mt-0.5" style={{ color: 'var(--bone-dim)' }}>{field.description}</p> : null}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <StatusColumn combat={combat} side="player" align="left" />
          <StatusColumn combat={combat} side="enemy" align="right" />
        </div>
      </div>

      {/* ---------- player band, 55% ---------- */}
      <div className="relative flex flex-col" style={{ flex: '1 1 55%', minHeight: 0 }}>
        <div className="relative" style={{ flex: '0 0 auto', paddingTop: 8 }}>
          <CombatantBand combat={combat} side="player" compact />
          <Floats floats={floats} side="player" />
        </div>

        <div className="flex-1 min-h-0 px-3 pb-3 pt-2">
          {finished ? (
            <Panel className="p-4 flex flex-col items-start gap-3">
              <h3 style={{ fontSize: 'var(--step-2)', color: combat.outcome === 'victory' ? 'var(--amber)' : 'var(--oxide)' }}>
                {combat.outcome === 'victory' ? 'Contact neutralised' : combat.outcome === 'draw' ? 'Mutual disengage' : 'Frame lost'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
                {[...combat.log].reverse().find((e) => e.kind === 'death' || e.kind === 'combat_end')?.text}
              </p>
              <div className="flex gap-2">
                <Button variant="primary" onClick={concludeCombat}>Continue</Button>
                <Button onClick={toggleLog}>Log [L]</Button>
              </div>
            </Panel>
          ) : (
            <>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                {skills.map((skill, i) => {
                  const reason = skillUnavailableReason(combat, 'player', skill.id);
                  const enabled = !reason;
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      className="btn text-left"
                      disabled={!enabled}
                      onClick={() => useSkill(skill.id)}
                      title={skill.description}
                      style={{ opacity: enabled ? 1 : 0.5, padding: '8px 10px' }}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <b style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-1)' }}>{skill.name}</b>
                        <span className="tnum text-xs" style={{ color: 'var(--bone-faint)' }}>{i + 1}</span>
                      </span>
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--bone-dim)' }}>
                        {reason ?? skill.description}
                      </span>
                      <span className="block text-xs mt-1" style={{ color: 'var(--bone-faint)' }}>
                        <TypeTag type={skill.type} />
                        {skill.cooldown > 0 ? ` · cd ${skill.cooldown}` : ' · no cooldown'}
                        {skill.priority !== 0 ? ` · priority ${skill.priority > 0 ? '+' : ''}${skill.priority}` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {commander.skills.map((id, slot) => {
                  const def = id ? COMMANDER_SKILLS.find((s) => s.id === id) : null;
                  if (!def) return null;
                  const cd = run.commanderCooldowns[def.id] ?? 0;
                  return (
                    <Button key={def.id} onClick={() => useCommanderSkill(slot)} disabled={cd > 0} title={def.description}>
                      {def.name} {cd > 0 ? <span className="tnum">({cd})</span> : <span className="text-xs" style={{ color: 'var(--bone-faint)' }}>[{slot === 0 ? 'Q' : 'W'}]</span>}
                    </Button>
                  );
                })}
                <Button onClick={toggleLog} title="Toggle the combat log">Log [L]</Button>
              </div>
            </>
          )}
        </div>

        {logOpen ? <CombatLog log={combat.log} /> : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {combat.log[combat.log.length - 1]?.text}
      </p>
    </div>
  );
}

function CombatLog({ log }: { log: CombatEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log.length]);
  return (
    <div
      ref={ref}
      className="panel-recess mx-3 mb-3 px-3 py-2 overflow-y-auto text-xs"
      style={{ maxHeight: 180 }}
    >
      {log.slice(-80).map((e, i) => (
        <div
          key={i}
          style={{
            color: e.kind === 'crit' ? 'var(--amber)'
              : e.kind === 'death' || e.kind === 'damage' ? 'var(--bone-dim)'
                : e.kind === 'round_start' ? 'var(--amber-60)'
                  : 'var(--bone-faint)',
            padding: '1px 0',
          }}
        >
          {e.text}
        </div>
      ))}
    </div>
  );
}
