/* ============================================================
   Terran Directorate — §7.
   Identity: versatile buff and utility. No resistance, no vulnerability.
   They are the baseline the other nine races are legible against, so the
   kits here lean on tempo, buffs and clean fundamentals rather than a
   single loud mechanic.
   ============================================================ */

import type { HeroDefinition, SkillDefinition } from '../../engine/types';

export const TERRAN_SKILLS: SkillDefinition[] = [
  /* ---------- shared Directorate issue ---------- */
  {
    id: 'terran_service_rifle', name: 'Service Rifle', type: 'kinetic', cooldown: 0, priority: 0,
    description: 'Standard-issue burst. Reliable, unremarkable, always available.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 1.0 }],
  },
  {
    id: 'terran_sidearm', name: 'Sidearm', type: 'kinetic', cooldown: 0, priority: 1,
    description: 'Fast draw. Strikes first, hits light.',
    effects: [{ kind: 'PRIORITY', tier: 1 }, { kind: 'DIRECT_DAMAGE', power: 0.72 }],
  },
  {
    id: 'terran_frag', name: 'Fragmentation Charge', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Casing shrapnel. Ignores plating entirely.',
    effects: [{ kind: 'FIXED_DAMAGE', amount: 90 }],
  },

  {
    id: 'terran_flare_shot', name: 'Flare Shot', type: 'thermal', cooldown: 0, priority: 0,
    description: 'Base attack. A signal round used as a weapon; sometimes it catches.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.85 },
      { kind: 'APPLY_STATUS', status: 'burn', baseChance: 0.25 },
    ],
  },
  {
    id: 'terran_etchant', name: 'Etchant Spray', type: 'corrosive', cooldown: 0, priority: 0,
    description: 'Base attack. Hull solvent at close range. Thin, but it never runs dry.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.85 },
      { kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.25 },
    ],
  },
  {
    id: 'terran_mind_spike', name: 'Mind Spike', type: 'psionic', cooldown: 0, priority: 0,
    description: 'Base attack. A short, unpleasant intrusion. Costs nothing to repeat.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 0.9 }],
  },

  /* ---------- Line Corpsman ---------- */
  {
    id: 'terran_field_suture', name: 'Field Suture', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Seals the worst of it. Repairs 22% of maximum HULL.',
    effects: [{ kind: 'HEAL_PERCENT', percent: 0.22 }],
  },
  {
    id: 'terran_steady_fire', name: 'Steady Fire', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Settles into the recoil. ATK +25% for 3 turns.',
    effects: [{ kind: 'STAT_MODIFY', stat: 'atk', percent: 0.25, duration: 3, target: 'self' }],
  },
  {
    id: 'terran_corpsman_kit', name: 'Corpsman Kit', type: 'kinetic', cooldown: 4, priority: 0,
    description: 'Purges one affliction and starts a repair cycle.',
    effects: [
      { kind: 'CLEANSE_SELF', count: 1 },
      { kind: 'REGEN', percent: 0.06, duration: 3 },
    ],
  },
  {
    id: 'terran_corpsman_awakened', name: 'Triage Protocol', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Repair cycles run 8% stronger and hits build resolve.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'res', percent: 0.12 },
      { kind: 'ON_TAKE_DAMAGE', chance: 0.3, effects: [{ kind: 'HEAL_PERCENT', percent: 0.04 }] },
    ],
  },

  /* ---------- Breach Trooper ---------- */
  {
    id: 'terran_breach_charge', name: 'Breach Charge', type: 'kinetic', cooldown: 2, priority: -1,
    description: 'Shaped cutting charge. Heavy, slow, eats plating.',
    effects: [
      { kind: 'ARMOR_PIERCE', pierce: 0.3 },
      { kind: 'DIRECT_DAMAGE', power: 1.35 },
      { kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.45 },
    ],
  },
  {
    id: 'terran_shield_wall', name: 'Shield Wall', type: 'kinetic', cooldown: 3, priority: 2,
    description: 'Braces behind the slab. Incoming damage -40% for 2 turns.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'DAMAGE_REDUCTION', percent: 0.35, duration: 2 }],
  },
  {
    id: 'terran_breach_awakened', name: 'Doorkicker', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Opens every engagement already braced.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'def', percent: 0.15 },
      { kind: 'ON_TAKE_DAMAGE', chance: 0.25, effects: [{ kind: 'SHIELD_PERCENT_MAX', percent: 0.06 }] },
    ],
  },

  /* ---------- Signal Tech ---------- */
  {
    id: 'terran_jam_transmitter', name: 'Jam Transmitter', type: 'em', cooldown: 3, priority: 1,
    description: 'Floods their command band. Locks their heaviest system.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'DIRECT_DAMAGE', power: 0.85 },
      { kind: 'APPLY_STATUS', status: 'jam', baseChance: 0.7 },
    ],
  },
  {
    id: 'terran_pulse', name: 'Inductive Pulse', type: 'em', cooldown: 1, priority: 0,
    description: 'Coil discharge with a chance of a hard seize. Banks charge.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 1.1 },
      { kind: 'APPLY_STATUS', status: 'static', baseChance: 0.35 },
      { kind: 'GAIN_CHARGE', amount: 1 },
    ],
  },
  {
    id: 'terran_uplink', name: 'Targeting Uplink', type: 'em', cooldown: 3, priority: 0,
    description: 'Borrowed fire-control. FOC +35% for 3 turns.',
    effects: [{ kind: 'STAT_MODIFY', stat: 'foc', percent: 0.35, duration: 3, target: 'self' }],
  },
  {
    id: 'terran_signal_awakened', name: 'Band Discipline', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every landed hit degrades their guidance.',
    effects: [{ kind: 'ON_HIT', chance: 0.28, effects: [{ kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.9 }] }],
  },

  /* ---------- Recon Scout ---------- */
  {
    id: 'terran_mark_target', name: 'Mark Target', type: 'kinetic', cooldown: 2, priority: 2,
    description: 'Paints them for everything that follows. +20% damage taken.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.85 },
      { kind: 'DIRECT_DAMAGE', power: 0.8 },
    ],
  },
  {
    id: 'terran_evade', name: 'Break Contact', type: 'kinetic', cooldown: 3, priority: 3,
    description: 'Slips the next attack, then re-engages harder.',
    effects: [
      { kind: 'PRIORITY', tier: 3 },
      { kind: 'DODGE_NEXT' },
      { kind: 'STAT_MODIFY', stat: 'spd', percent: 0.2, duration: 2, target: 'self' },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.25, duration: 2, target: 'self' },
    ],
  },
  {
    id: 'terran_scout_awakened', name: 'Forward Observer', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Reads the ground before anyone else moves.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'spd', percent: 0.14 },
      { kind: 'ON_HIT', chance: 0.2, effects: [{ kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.9 }] },
    ],
  },

  /* ---------- Ordnance Hand ---------- */
  {
    id: 'terran_incendiary', name: 'Incendiary Round', type: 'thermal', cooldown: 1, priority: 0,
    description: 'Sets them alight. Burn stacks are the whole plan.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.85 },
      { kind: 'APPLY_STATUS', status: 'burn', baseChance: 0.6 },
    ],
  },
  {
    id: 'terran_cook_off', name: 'Cook-Off', type: 'thermal', cooldown: 3, priority: 0,
    description: 'Detonates their burn stacks for a burst of thermal damage.',
    effects: [{ kind: 'CONSUME_STATUS', status: 'burn', damagePerStack: 1.35 }],
  },
  {
    id: 'terran_tamp', name: 'Tamped Charge', type: 'thermal', cooldown: 3, priority: 0,
    description: 'Packs the blast. Shields for 18% of maximum HULL and hits hard.',
    effects: [
      { kind: 'SHIELD_PERCENT_MAX', percent: 0.18 },
      { kind: 'DIRECT_DAMAGE', power: 0.9 },
    ],
  },
  {
    id: 'terran_ordnance_awakened', name: 'Ammunition Discipline', type: 'thermal', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Fires burn the longer for it.',
    effects: [
      { kind: 'ON_HIT', chance: 0.35, effects: [{ kind: 'EXTEND_STATUS', turns: 1 }] },
      { kind: 'PASSIVE_AURA', stat: 'foc', percent: 0.1 },
    ],
  },

  /* ---------- Sergeant Vale (uncommon) ---------- */
  {
    id: 'terran_suppressing_fire', name: 'Suppressing Fire', type: 'kinetic', cooldown: 2, priority: 0,
    description: 'Three bursts downrange. Nobody aims through it.',
    effects: [
      { kind: 'MULTI_HIT', power: 0.42, hits: 3 },
      { kind: 'APPLY_STATUS', status: 'blind', baseChance: 0.4 },
    ],
  },
  {
    id: 'terran_rally', name: 'Rally', type: 'kinetic', cooldown: 4, priority: 1,
    description: 'ATK and SPD +30% for 3 turns, and one affliction shaken off.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.3, duration: 3, target: 'self' },
      { kind: 'STAT_MODIFY', stat: 'spd', percent: 0.3, duration: 3, target: 'self' },
      { kind: 'CLEANSE_SELF', count: 1 },
    ],
  },
  {
    id: 'terran_aimed_shot', name: 'Aimed Shot', type: 'kinetic', cooldown: 2, priority: -1,
    description: 'Slow, deliberate, and it goes through plate.',
    effects: [{ kind: 'ARMOR_PIERCE', pierce: 0.35 }, { kind: 'DIRECT_DAMAGE', power: 1.55 }],
  },
  {
    id: 'terran_vale_awakened', name: 'Non-Commissioned', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill resets the section and steadies the line.',
    effects: [
      { kind: 'ON_KILL', effects: [{ kind: 'COOLDOWN_RESET', count: 2 }] },
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.1 },
    ],
  },

  /* ---------- Combat Medic ---------- */
  {
    id: 'terran_triage', name: 'Triage', type: 'kinetic', cooldown: 3, priority: 2,
    description: 'Repairs 28% of maximum HULL. Goes before almost anything.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'HEAL_PERCENT', percent: 0.28 }],
  },
  {
    id: 'terran_stim', name: 'Combat Stim', type: 'kinetic', cooldown: 4, priority: 0,
    description: 'Overclocks the frame and runs a repair cycle to pay for it.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'overclock', baseChance: 1 },
      { kind: 'REGEN', percent: 0.07, duration: 3 },
    ],
  },
  {
    id: 'terran_medic_awakened', name: 'Golden Hour', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Arms a single reboot at 35% HULL.',
    effects: [{ kind: 'REVIVE_SELF', healPercent: 0.35 }],
  },

  {
    id: 'terran_transfusion', name: 'Transfusion Line', type: 'kinetic', cooldown: 1, priority: 0,
    description: 'Draws 45% of the damage dealt straight back into the frame.',
    effects: [{ kind: 'LIFESTEAL', power: 1.05, leechPercent: 0.45 }],
  },

  /* ---------- Sapper ---------- */
  {
    id: 'terran_acid_charge', name: 'Acid Charge', type: 'corrosive', cooldown: 1, priority: 0,
    description: 'Eats plating. Corrode stacks to -50% DEF.',
    effects: [
      { kind: 'DIRECT_DAMAGE', power: 0.9 },
      { kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.65 },
    ],
  },
  {
    id: 'terran_demolition', name: 'Demolition Work', type: 'corrosive', cooldown: 3, priority: -1,
    description: 'Hits far harder into something already corroded.',
    effects: [
      { kind: 'ARMOR_PIERCE', pierce: 0.25 },
      { kind: 'CONDITIONAL_DAMAGE', power: 1.3, condition: { targetHasStatus: 'corrode' }, bonusMult: 1.55 },
    ],
  },
  {
    id: 'terran_entrench', name: 'Entrench', type: 'corrosive', cooldown: 4, priority: 0,
    description: 'Digs in. Bulwark: DEF +30%, SPD -15%.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'bulwark', baseChance: 1 },
      { kind: 'SHIELD_PERCENT_MAX', percent: 0.12 },
    ],
  },
  {
    id: 'terran_sapper_awakened', name: 'Structural Survey', type: 'corrosive', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Finds the weak seam on every hit.',
    effects: [{ kind: 'ON_HIT', chance: 0.3, effects: [{ kind: 'APPLY_STATUS', status: 'corrode', baseChance: 0.85 }] }],
  },

  /* ---------- Drone Handler ---------- */
  {
    id: 'terran_loitering_munition', name: 'Loitering Munition', type: 'em', cooldown: 0, priority: -1,
    description: 'Keeps circling. Each consecutive launch hits harder.',
    effects: [{ kind: 'RAMPING', power: 0.85, increment: 0.28, maxStacks: 4 }],
  },
  {
    id: 'terran_recall', name: 'Recall Swarm', type: 'em', cooldown: 3, priority: 1,
    description: 'Pulls the drones in as a screen and clears interference.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'CLEANSE_SELF', count: 2 },
      { kind: 'SHIELD_PERCENT_MAX', percent: 0.14 },
    ],
  },
  {
    id: 'terran_spotter', name: 'Spotter Feed', type: 'em', cooldown: 3, priority: 0,
    description: 'Steals their fire-control solution and paints them with it.',
    effects: [
      { kind: 'STAT_STEAL', stat: 'foc', percent: 0.25, duration: 3 },
      { kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.6 },
    ],
  },
  {
    id: 'terran_handler_awakened', name: 'Persistent Coverage', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. The swarm never fully lands.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'foc', percent: 0.15 },
      { kind: 'ON_KILL', effects: [{ kind: 'SHIELD_PERCENT_MAX', percent: 0.15 }] },
    ],
  },

  /* ---------- Lieutenant Ondaatje (rare) ---------- */
  {
    id: 'terran_command_override', name: 'Command Override', type: 'em', cooldown: 3, priority: 1,
    description: 'Strips their enhancements and takes their ATK for three turns.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'BUFF_STRIP', count: 2 },
      { kind: 'STAT_STEAL', stat: 'atk', percent: 0.28, duration: 3 },
    ],
  },
  {
    id: 'terran_overwatch', name: 'Overwatch', type: 'em', cooldown: 4, priority: 2,
    description: 'Returns 55% of what lands, for three turns.',
    effects: [{ kind: 'PRIORITY', tier: 2 }, { kind: 'COUNTER_STANCE', percent: 0.45, duration: 2 }],
  },
  {
    id: 'terran_crossfire', name: 'Crossfire', type: 'em', cooldown: 1, priority: 0,
    description: 'Four converging bursts. Rewards a Marked target.',
    effects: [{ kind: 'MULTI_HIT', power: 0.42, hits: 4 }],
  },
  {
    id: 'terran_ondaatje_awakened', name: 'Chain of Command', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Being hit sharpens the response.',
    effects: [
      { kind: 'ON_TAKE_DAMAGE', chance: 0.3, effects: [{ kind: 'STAT_MODIFY', stat: 'atk', percent: 0.12, duration: 2, target: 'self' }] },
      { kind: 'PASSIVE_AURA', stat: 'res', percent: 0.12 },
    ],
  },

  /* ---------- Void Marine (rare) ---------- */
  {
    id: 'terran_vacuum_drill', name: 'Vacuum Drill', type: 'kinetic', cooldown: 3, priority: 0,
    description: 'Finishes wounded frames. Doubles below 35% HULL.',
    effects: [{ kind: 'EXECUTE', power: 1.15, threshold: 0.35, bonusMult: 1.85 }],
  },
  {
    id: 'terran_mag_lock', name: 'Mag-Lock', type: 'kinetic', cooldown: 4, priority: 0,
    description: 'Anchors to the deck. Bulwark plus immunity to interference.',
    effects: [
      { kind: 'APPLY_STATUS', status: 'bulwark', baseChance: 1 },
      { kind: 'DEBUFF_IMMUNITY', duration: 2 },
    ],
  },
  {
    id: 'terran_boarding_axe', name: 'Boarding Axe', type: 'kinetic', cooldown: 1, priority: 0,
    description: 'Enormous swing. 20% of what it deals comes back.',
    effects: [{ kind: 'ARMOR_PIERCE', pierce: 0.2 }, { kind: 'RECOIL', power: 1.55, recoilPercent: 0.28 }],
  },
  {
    id: 'terran_marine_awakened', name: 'Hard Vacuum Trained', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Ignores the conditions and hits through them.',
    effects: [
      { kind: 'FIELD_IMMUNITY', duration: 99 },
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.12 },
    ],
  },

  /* ---------- Systems Officer (rare) ---------- */
  {
    id: 'terran_reroute', name: 'Reroute Power', type: 'em', cooldown: 5, priority: 1,
    description: 'Flushes every cooldown and banks charge.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'COOLDOWN_RESET' },
      { kind: 'GAIN_CHARGE', amount: 3 },
    ],
  },
  {
    id: 'terran_capacitor', name: 'Capacitor Tap', type: 'em', cooldown: 0, priority: 0,
    description: 'A light discharge that banks two charge for the next arc.',
    effects: [{ kind: 'DIRECT_DAMAGE', power: 0.95 }, { kind: 'GAIN_CHARGE', amount: 2 }],
  },
  {
    id: 'terran_feedback', name: 'Feedback Loop', type: 'em', cooldown: 4, priority: 0,
    description: 'Reflects 45% of incoming damage for three turns.',
    effects: [{ kind: 'REFLECT', percent: 0.45, duration: 3 }],
  },
  {
    id: 'terran_arc', name: 'Arc Discharge', type: 'em', cooldown: 0, priority: 0,
    description: 'Spends banked charge. Empty banks still arc, weakly.',
    effects: [{ kind: 'SPEND_CHARGE', amount: 3, power: 2.2 }],
  },
  {
    id: 'terran_systems_awakened', name: 'Load Balancing', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Every exchange banks a little more charge.',
    effects: [{ kind: 'ON_TAKE_DAMAGE', chance: 1, effects: [{ kind: 'GAIN_CHARGE', amount: 1 }] }],
  },

  /* ---------- Major Calder (epic) ---------- */
  {
    id: 'terran_doctrine', name: 'Directorate Doctrine', type: 'kinetic', cooldown: 4, priority: 2,
    description: 'ATK, DEF and RES +22% for four turns. The whole line steadies.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.2, duration: 4, target: 'self' },
      { kind: 'STAT_MODIFY', stat: 'def', percent: 0.2, duration: 4, target: 'self' },
      { kind: 'STAT_MODIFY', stat: 'res', percent: 0.2, duration: 4, target: 'self' },
    ],
  },
  {
    id: 'terran_enfilade', name: 'Enfilade', type: 'kinetic', cooldown: 0, priority: 0,
    description: 'Sustained flanking fire that grows while it is maintained.',
    effects: [{ kind: 'RAMPING', power: 0.78, increment: 0.2, maxStacks: 5 }],
  },
  {
    id: 'terran_called_shot', name: 'Called Shot', type: 'kinetic', cooldown: 3, priority: -1,
    description: 'Half their plating means nothing, and less of them below 40%.',
    effects: [
      { kind: 'ARMOR_PIERCE', pierce: 0.5 },
      { kind: 'EXECUTE', power: 1.3, threshold: 0.4, bonusMult: 1.8 },
    ],
  },
  {
    id: 'terran_hold_the_line', name: 'Hold the Line', type: 'kinetic', cooldown: 4, priority: 3,
    description: 'Incoming -45% and 40% returned, for two turns.',
    effects: [
      { kind: 'PRIORITY', tier: 3 },
      { kind: 'DAMAGE_REDUCTION', percent: 0.45, duration: 2 },
      { kind: 'COUNTER_STANCE', percent: 0.4, duration: 2 },
    ],
  },
  {
    id: 'terran_calder_awakened', name: 'Field Promotion', type: 'kinetic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Kills compound into the next engagement.',
    effects: [
      { kind: 'ON_KILL', effects: [{ kind: 'STAT_MODIFY', stat: 'atk', percent: 0.2, duration: 4, target: 'self' }, { kind: 'HEAL_PERCENT', percent: 0.15 }] },
      { kind: 'PASSIVE_AURA', stat: 'def', percent: 0.12 },
    ],
  },

  /* ---------- Ghost Cell Operative (epic) ---------- */
  {
    id: 'terran_silence', name: 'Silence', type: 'psionic', cooldown: 3, priority: 2,
    description: 'They cannot be reinforced for three turns.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'APPLY_STATUS', status: 'suppress', baseChance: 0.75 },
      { kind: 'BUFF_STRIP', count: 3 },
      { kind: 'DIRECT_DAMAGE', power: 0.7 },
    ],
  },
  {
    id: 'terran_killing_word', name: 'Killing Word', type: 'psionic', cooldown: 1, priority: 0,
    description: 'Psionic execution. Nearly triples below 30% HULL.',
    effects: [{ kind: 'EXECUTE', power: 1.15, threshold: 0.3, bonusMult: 2.7 }],
  },
  {
    id: 'terran_deadline', name: 'Deadline', type: 'psionic', cooldown: 3, priority: 1,
    description: 'Slows them 30% and marks them for the finish.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'DELAY_TARGET', percent: 0.3, duration: 3 },
      { kind: 'APPLY_STATUS', status: 'mark', baseChance: 0.8 },
      { kind: 'DIRECT_DAMAGE', power: 0.65 },
    ],
  },
  {
    id: 'terran_ghost_awakened', name: 'No Record Exists', type: 'psionic', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. A kill buys another disappearance.',
    effects: [
      { kind: 'ON_KILL', effects: [{ kind: 'DODGE_NEXT' }, { kind: 'COOLDOWN_RESET', count: 1 }] },
      { kind: 'PASSIVE_AURA', stat: 'spd', percent: 0.12 },
    ],
  },

  /* ---------- Admiral Sarn Delacroix (legendary) ---------- */
  {
    id: 'terran_fleet_command', name: 'Fleet Command', type: 'em', cooldown: 5, priority: 1,
    description: 'Acts again immediately. The rarest thing in the game.',
    effects: [
      { kind: 'PRIORITY', tier: 1 },
      { kind: 'STAT_MODIFY', stat: 'atk', percent: 0.2, duration: 3, target: 'self' },
      { kind: 'EXTRA_ACTION' },
    ],
  },
  {
    id: 'terran_broadside', name: 'Broadside', type: 'em', cooldown: 0, priority: -1,
    description: 'Four ranging shots through a quarter of their plating.',
    effects: [
      { kind: 'ARMOR_PIERCE', pierce: 0.25 },
      { kind: 'MULTI_HIT', power: 0.4, hits: 4 },
    ],
  },
  {
    id: 'terran_adaptive_doctrine', name: 'Adaptive Doctrine', type: 'em', cooldown: 4, priority: 2,
    description: 'Clears the board, takes their DEF, and hardens against reply.',
    effects: [
      { kind: 'PRIORITY', tier: 2 },
      { kind: 'CLEANSE_SELF' },
      { kind: 'STAT_STEAL', stat: 'def', percent: 0.3, duration: 3 },
      { kind: 'DEBUFF_IMMUNITY', duration: 2 },
    ],
  },
  {
    id: 'terran_final_order', name: 'Final Order', type: 'em', cooldown: 3, priority: 0,
    description: 'Strips everything they have and finishes what is left.',
    effects: [
      { kind: 'BUFF_STRIP' },
      { kind: 'EXECUTE', power: 1.35, threshold: 0.45, bonusMult: 2.1 },
    ],
  },
  {
    id: 'terran_delacroix_awakened', name: 'Flag Authority', type: 'em', cooldown: 0, priority: 0, passive: true,
    description: 'Awakened. Command tempo compounds with every kill.',
    effects: [
      { kind: 'PASSIVE_AURA', stat: 'atk', percent: 0.15 },
      { kind: 'PASSIVE_AURA', stat: 'spd', percent: 0.1 },
      { kind: 'ON_KILL', effects: [{ kind: 'COOLDOWN_RESET' }, { kind: 'HEAL_PERCENT', percent: 0.2 }] },
    ],
  },
];

export const TERRAN_HEROES: HeroDefinition[] = [
  {
    id: 'terran_corpsman', slug: 'line-corpsman', name: 'Line Corpsman', race: 'terran',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Sustain',
    baseStats: { hull: 125, atk: 49, def: 42, spd: 49, foc: 38, res: 42 },
    growth: { hull: 10.3, atk: 4.2, def: 3.6, spd: 1.5, foc: 2.5, res: 2.9 },
    skills: ['terran_service_rifle', 'terran_transfusion', 'terran_field_suture', 'terran_corpsman_kit'],
    awakenedPassive: 'terran_corpsman_awakened',
  },
  {
    id: 'terran_breacher', slug: 'breach-trooper', name: 'Breach Trooper', race: 'terran',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Bruiser',
    baseStats: { hull: 121, atk: 44, def: 43, spd: 34, foc: 32, res: 34 },
    growth: { hull: 10.9, atk: 4.2, def: 3.4, spd: 1, foc: 2, res: 2.4 },
    skills: ['terran_service_rifle', 'terran_breach_charge', 'terran_shield_wall', 'terran_frag'],
    awakenedPassive: 'terran_breach_awakened',
  },
  {
    id: 'terran_signal_tech', slug: 'signal-tech', name: 'Signal Technician', race: 'terran',
    rarity: 'common', rosterCost: 1, damageType: 'em', role: 'Disruptor',
    baseStats: { hull: 121, atk: 55, def: 40, spd: 60, foc: 55, res: 38 },
    growth: { hull: 9.8, atk: 5.3, def: 3, spd: 2.2, foc: 3.4, res: 2.4 },
    skills: ['terran_pulse', 'terran_loitering_munition', 'terran_uplink', 'terran_jam_transmitter'],
    awakenedPassive: 'terran_signal_awakened',
  },
  {
    id: 'terran_scout', slug: 'recon-scout', name: 'Recon Scout', race: 'terran',
    rarity: 'common', rosterCost: 1, damageType: 'kinetic', role: 'Skirmisher',
    baseStats: { hull: 139, atk: 62, def: 41, spd: 76, foc: 50, res: 37 },
    growth: { hull: 10.5, atk: 5.5, def: 2.9, spd: 2.8, foc: 3.2, res: 2.3 },
    skills: ['terran_sidearm', 'terran_mark_target', 'terran_evade', 'terran_steady_fire'],
    awakenedPassive: 'terran_scout_awakened',
  },
  {
    id: 'terran_ordnance', slug: 'ordnance-hand', name: 'Ordnance Hand', race: 'terran',
    rarity: 'common', rosterCost: 1, damageType: 'thermal', role: 'Damage over time',
    baseStats: { hull: 113, atk: 51, def: 36, spd: 43, foc: 44, res: 31 },
    growth: { hull: 9.4, atk: 4.7, def: 3, spd: 1.4, foc: 3, res: 2.3 },
    skills: ['terran_flare_shot', 'terran_incendiary', 'terran_tamp', 'terran_cook_off'],
    awakenedPassive: 'terran_ordnance_awakened',
  },
  {
    id: 'terran_vale', slug: 'sergeant-vale', name: 'Sergeant Vale', race: 'terran',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Frontline',
    baseStats: { hull: 124, atk: 52, def: 42, spd: 48, foc: 40, res: 38 },
    growth: { hull: 10.9, atk: 5.1, def: 3.6, spd: 1.6, foc: 2.5, res: 2.5 },
    skills: ['terran_suppressing_fire', 'terran_service_rifle', 'terran_rally', 'terran_aimed_shot'],
    awakenedPassive: 'terran_vale_awakened',
  },
  {
    id: 'terran_medic', slug: 'combat-medic', name: 'Combat Medic', race: 'terran',
    rarity: 'uncommon', rosterCost: 2, damageType: 'kinetic', role: 'Sustain',
    baseStats: { hull: 131, atk: 46, def: 49, spd: 52, foc: 40, res: 49 },
    growth: { hull: 12.2, atk: 4.2, def: 4, spd: 1.9, foc: 2.4, res: 3.3 },
    skills: ['terran_transfusion', 'terran_service_rifle', 'terran_triage', 'terran_stim'],
    awakenedPassive: 'terran_medic_awakened',
  },
  {
    id: 'terran_sapper', slug: 'sapper', name: 'Directorate Sapper', race: 'terran',
    rarity: 'uncommon', rosterCost: 2, damageType: 'corrosive', role: 'Armour breaker',
    baseStats: { hull: 130, atk: 62, def: 46, spd: 49, foc: 51, res: 37 },
    growth: { hull: 10.7, atk: 6, def: 3.7, spd: 1.4, foc: 3.2, res: 2.6 },
    skills: ['terran_etchant', 'terran_acid_charge', 'terran_demolition', 'terran_entrench'],
    awakenedPassive: 'terran_sapper_awakened',
  },
  {
    id: 'terran_handler', slug: 'drone-handler', name: 'Drone Handler', race: 'terran',
    rarity: 'uncommon', rosterCost: 2, damageType: 'em', role: 'Ramping damage',
    baseStats: { hull: 137, atk: 61, def: 44, spd: 65, foc: 63, res: 40 },
    growth: { hull: 11.9, atk: 5.8, def: 3.6, spd: 2.5, foc: 3.8, res: 2.8 },
    skills: ['terran_loitering_munition', 'terran_pulse', 'terran_recall', 'terran_spotter'],
    awakenedPassive: 'terran_handler_awakened',
  },
  {
    id: 'terran_ondaatje', slug: 'lt-ondaatje', name: 'Lt. Ondaatje', race: 'terran',
    rarity: 'rare', rosterCost: 4, damageType: 'em', role: 'Controller',
    baseStats: { hull: 143, atk: 63, def: 50, spd: 61, foc: 58, res: 47 },
    growth: { hull: 12.5, atk: 5.9, def: 3.7, spd: 2.3, foc: 3.3, res: 3 },
    skills: ['terran_capacitor', 'terran_crossfire', 'terran_command_override', 'terran_overwatch'],
    awakenedPassive: 'terran_ondaatje_awakened',
  },
  {
    id: 'terran_void_marine', slug: 'void-marine', name: 'Void Marine', race: 'terran',
    rarity: 'rare', rosterCost: 4, damageType: 'kinetic', role: 'Executioner',
    baseStats: { hull: 159, atk: 66, def: 55, spd: 47, foc: 49, res: 49 },
    growth: { hull: 13.5, atk: 6.4, def: 4.2, spd: 1.4, foc: 3.2, res: 3.4 },
    skills: ['terran_service_rifle', 'terran_boarding_axe', 'terran_vacuum_drill', 'terran_mag_lock'],
    awakenedPassive: 'terran_marine_awakened',
  },
  {
    id: 'terran_systems', slug: 'systems-officer', name: 'Systems Officer', race: 'terran',
    rarity: 'rare', rosterCost: 4, damageType: 'em', role: 'Charge burst',
    baseStats: { hull: 148, atk: 66, def: 53, spd: 64, foc: 62, res: 46 },
    growth: { hull: 11.4, atk: 6, def: 3.8, spd: 2.4, foc: 3.5, res: 3.2 },
    skills: ['terran_capacitor', 'terran_arc', 'terran_reroute', 'terran_feedback'],
    awakenedPassive: 'terran_systems_awakened',
  },
  {
    id: 'terran_calder', slug: 'major-calder', name: 'Major Calder', race: 'terran',
    rarity: 'epic', rosterCost: 7, damageType: 'kinetic', role: 'Attrition anchor',
    baseStats: { hull: 163, atk: 71, def: 65, spd: 57, foc: 55, res: 57 },
    growth: { hull: 14.6, atk: 6.8, def: 4.9, spd: 2.3, foc: 3.3, res: 3.4 },
    skills: ['terran_enfilade', 'terran_doctrine', 'terran_called_shot', 'terran_hold_the_line'],
    awakenedPassive: 'terran_calder_awakened',
  },
  {
    id: 'terran_ghost', slug: 'ghost-cell-operative', name: 'Ghost Cell Operative', race: 'terran',
    rarity: 'epic', rosterCost: 7, damageType: 'psionic', role: 'Assassin',
    baseStats: { hull: 160, atk: 87, def: 53, spd: 91, foc: 81, res: 53 },
    growth: { hull: 13.5, atk: 8.3, def: 4, spd: 3.2, foc: 4.4, res: 3.3 },
    skills: ['terran_killing_word', 'terran_silence', 'terran_mind_spike', 'terran_deadline'],
    awakenedPassive: 'terran_ghost_awakened',
  },
  {
    id: 'terran_delacroix', slug: 'admiral-delacroix', name: 'Admiral Sarn Delacroix', race: 'terran',
    rarity: 'legendary', rosterCost: 12, damageType: 'em', role: 'Command tempo',
    baseStats: { hull: 146, atk: 66, def: 54, spd: 63, foc: 58, res: 52 },
    growth: { hull: 12.6, atk: 6.3, def: 3.9, spd: 2.2, foc: 3.3, res: 3.2 },
    skills: ['terran_broadside', 'terran_final_order', 'terran_adaptive_doctrine', 'terran_fleet_command'],
    awakenedPassive: 'terran_delacroix_awakened',
  },
];
