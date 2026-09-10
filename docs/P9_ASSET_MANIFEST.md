# STARFALL — P9 Asset Manifest

Complete production brief for every asset the game can consume: character
art, the entire UI, backgrounds, icons, attack effects, and audio.

**This document is a contract with the code.** Every path below is already
resolved by `src/art/manifest.ts` at build time. Drop a correctly named file
into the matching folder and it appears in the game with no code change.
Every asset is optional: a missing hero portrait falls back to its
procedural silhouette, and every other missing asset resolves to `null`,
leaving the built-in CSS treatment in place. Nothing here can break a
screen, and the game ships playable at 0% asset coverage.

Read `§2` of `STARFALL_MASTER_PROMPT.md` before starting. It is a binding
design contract and the art must serve it, not fight it.

---

## 0. Totals at a glance

| Class | Count | Folder | Format |
|---|---:|---|---|
| Hero portraits | 150 | `public/assets/heroes/{race}/` | WebP |
| Race emblems | 10 | `public/assets/races/` | SVG |
| Sector backdrops | 10 | `public/assets/sectors/` | WebP |
| Condition overlays | 10 | `public/assets/fields/` | WebP (alpha) |
| Status icons | 12 | `public/assets/icons/statuses/` | SVG |
| Damage-type icons | 5 | `public/assets/icons/types/` | SVG |
| Gear chassis icons | 16 | `public/assets/icons/gear/` | SVG |
| Rune icons | 23 | `public/assets/icons/runes/` | SVG |
| Consumable icons | 9 | `public/assets/icons/items/` | SVG |
| UI elements | 32 | `public/assets/ui/` | SVG / WebP |
| Attack & event effects | 11 | `public/assets/effects/` | WebP sprite sheets |
| Music | 19 | `public/assets/audio/music/` | OGG (+MP3 fallback) |
| Sound effects | 44 | `public/assets/audio/sfx/` | OGG (+MP3 fallback) |

**351 assets total.** They can land in any order. Ship a folder at a time.

---

## 1. Art direction, in one paragraph

Hard sci-fi salvage and attrition. The reference points are the Nostromo's
instrumentation, *The Expanse*'s utilitarian screens, Duskers and Cogmind —
**not** Mass Effect's polish and **not** cyberpunk. Everything is worn,
functional and repaired. Surfaces are matte and scuffed. Light is a hard
single key from upper left with deep shadow fill. The palette is six values
and no more (§2.1):

```
--void      #0D0C0A   warm black, soot and grease
--hull      #22201C   dull olive-grey steel
--seam      #3A362F   borders and dividers (never text)
--bone      #D8D2C4   aged label plastic
--amber     #E0922F   phosphor instrument amber — the one accent
--oxide     #8C3B24   rust red — damage, danger, loss
--verdigris #4A6B60   patina teal — healing, positive states
```

**Forbidden throughout, in every class:** cyan of any kind; acid green;
neon; glow ramps; rainbow borders; chrome; lens flares; bloom; gradients as
decoration; anything that reads as "clean" or "pristine". Rarity escalates
**detail density, never brightness.**

---

## 2. Hero portraits — 150

`public/assets/heroes/{race}/{slug}.webp`

Race folders: `terran vantari kelshar reclaimed ithka meridian pyroclast
umbral signal drenn` — 15 heroes each (5 common, 4 uncommon, 3 rare, 2 epic,
1 legendary). Exact slugs are in `src/data/races/{race}.ts` as the `slug`
field; the placeholder currently rendered in-game shows the silhouette
vocabulary each race is built from.

**Spec:** 512 × 640 (4:5), chest-up three-quarter view, neutral expression,
flat dark background, WebP quality 82.

**Generation.** Local only — SDXL via ComfyUI or Automatic1111. Hosted free
tiers rate-limit long before hero 150 and, worse, drift in style between
sessions; inconsistency across a roster is exactly what makes a collection
look cheap. Lock sampler, steps, CFG and resolution across the entire run.
Use a per-race IP-Adapter reference or LoRA so all 15 heroes of a race share
a visual family.

```
industrial sci-fi character portrait, [RACE_ANATOMY], [ROLE_GEAR],
chest-up three-quarter view, neutral expression, functional worn equipment,
scuffed matte surfaces, practical utility design, no ornamentation,
hard single key light from upper left, deep shadow fill,
flat dark grey background, 85mm lens, shallow depth of field,
muted desaturated palette, grain, photographic

Negative: glossy, chrome, neon, glowing, symmetrical, heroic pose,
anime, cel shaded, cape, full body, busy background, text, watermark,
bright colours, clean, pristine, ornate
```

**`[RACE_ANATOMY]` per race:**

| Race | Anatomy prompt | Two-colour family |
|---|---|---|
| Terran Directorate | human, military fatigues, respirator rig | `#5A5348` / `#8E8577` |
| Vantari Hegemony | broad heavy-gravity humanoid, thick neck, pressure carapace | `#3E4A4E` / `#6E7C7A` |
| Kel'Shar Brood | eusocial arthropoid, chitin plating, compound eye cluster | `#4A4326` / `#7E7238` |
| The Reclaimed | heavily cyberised human, mismatched salvage prosthetics | `#3C3A38` / `#7A6E5E` |
| Ith'ka | tall, thin, vacuum-adapted, elongated skull, no visible mouth | `#2F3A3E` / `#5F7A80` |
| Meridian Combine | human, mercantile uniform, ledger optics, trade insignia | `#4E4326` / `#9C8442` |
| Pyroclast Clans | silicate-skinned humanoid, cracked mineral hide, vent ports | `#4A2A1E` / `#94472A` |
| Umbral Drift | indistinct humanoid, phase-blurred edges, featureless faceplate | `#302E3A` / `#5C566E` |
| The Signal | serene humanoid, sensory crown, too-still posture | `#3A3630` / `#8C7A50` |
| Drenn Hullborn | squat industrial brute, welded plate, demolition rig | `#43362C` / `#8A6244` |

**`[ROLE_GEAR]`** comes from each hero's `role` field (Sustain, Bruiser,
Disruptor, Skirmisher, Assassin, Wall, and so on) — read it from the data.

**Rarity reads as equipment history, not light:**

| Rarity | Treatment |
|---|---|
| Common | Standard-issue gear, uniform, undamaged and unremarkable |
| Uncommon | One personalised item, light field wear |
| Rare | Non-standard kit, visible repairs, a unit marking |
| Epic | Field-modified equipment, scarring, layered patches |
| Legendary | Heavily modified, hand-painted markings, trophies, obvious history |

**Resist the urge to make Legendaries glow.**

**Post-processing — this matters more than the generation settings.** Apply
identically to all 150: background removal → crop 4:5 → resize 512 × 640 →
one shared colour grade pulled toward the §2.1 palette → WebP q82. The
unified grade is what makes 150 separately-generated images read as one art
direction. Do it as a batch script, not by hand.

---

## 3. The UI — every screen

The interface is currently pure CSS from `src/styles/tokens.css` and is
complete and shippable as-is. Everything in this section is an **upgrade
path**, not a gap. Supply any subset.

`public/assets/ui/{name}.svg` (or `.webp` / `.png`)

### 3.1 Panel and frame construction

| File | Use | Notes |
|---|---|---|
| `frames/common.svg` | Common card frame | Stamped steel, 1px seam border, square corners |
| `frames/uncommon.svg` | Uncommon card frame | Anodised alloy, doubled border, 2px inner offset |
| `frames/rare.svg` | Rare card frame | Etched brass, corner brackets, hairline etch |
| `frames/epic.svg` | Epic card frame | Ablative ceramic, scored/chipped edge, visible layer |
| `frames/legendary.svg` | Legendary card frame | Irradiated composite, brackets; shimmer stays CSS |
| `panel-plate.svg` | Panel background texture | Tiling, ≤6% contrast, brushed steel |
| `panel-corner.svg` | Panel corner bracket | 9 × 9, 1px stroke |
| `divider-rule.svg` | Section divider | 1px, seam colour, optional rivet marks |
| `recess-grain.png` | Recessed-panel noise | Tiling 64 × 64, ≤4% opacity |

Supply frames as 9-slice-safe SVG (corners fixed, edges stretchable), or as
plain SVG that scales. The Legendary heat shimmer stays in CSS — it is the
one piece of ambient motion in the whole interface (§2.3) and must not be
baked into a static file.

### 3.2 Chrome and controls

| File | Use |
|---|---|
| `logo-starfall.svg` | Wordmark in the header |
| `nav-active.svg` | Active nav-item marker |
| `btn-plate.svg` | Button face texture (tiling) |
| `btn-corner-cut.svg` | Button corner treatment |
| `focus-ring.svg` | Keyboard focus indicator (must stay amber, §2.6) |
| `scrollbar-thumb.svg` | Scrollbar thumb |
| `toast-plate.svg` | Toast background |

### 3.3 Combat HUD

The three-band layout (enemy 30% / field and state 15% / player 55%) is
fixed and must not be redesigned by the art.

| File | Use |
|---|---|
| `hud/band-divider.svg` | Horizontal rule between the three bands |
| `hud/bar-track.svg` | HULL/shield bar housing, 9-slice |
| `hud/bar-fill-hull.svg` | HULL fill texture |
| `hud/bar-fill-shield.svg` | Shield fill texture (verdigris) |
| `hud/bar-fill-enemy.svg` | Enemy HULL fill texture (oxide) |
| `hud/turn-indicator.svg` | "Who acts first" marker |
| `hud/skill-plate.svg` | Skill button face |
| `hud/skill-cooling.svg` | Cooldown overlay treatment |
| `hud/crit-burst.webp` | Critical-hit frame flash |
| `hud/scanline.png` | CRT scanline overlay, tiling, ≤22% black |

### 3.4 Screen backgrounds

| File | Use |
|---|---|
| `bg/bridge.webp` | Bridge (hub) backdrop — ship interior, instrument-lit |
| `bg/roster.webp` | Roster backdrop — crew manifest wall, filing |
| `bg/hangar.webp` | Hangar backdrop — gear racks, workbench |
| `bg/requisition.webp` | Requisition backdrop — automated supply post |
| `bg/event.webp` | Event-node backdrop — neutral derelict interior |
| `bg/merchant.webp` | Merchant-hub backdrop — cargo bay, crates |

**Spec:** 1920 × 1080 WebP q75, heavily darkened. These sit *behind* panels
at roughly 25% effective brightness — they must read at a glance and never
compete with foreground text. Test every one against `--bone` body copy for
WCAG AA before delivering.

---

## 4. Sector backdrops — 10

`public/assets/sectors/{id}.webp` — 1920 × 1080, WebP q75.

Each is the star system a 30-floor sector takes place in, seen from the
ship. Same darkening rule as §3.4.

| File | Sector | Subject |
|---|---|---|
| `kepler_reach.webp` | Kepler Reach | Abandoned shipping lanes, drifting wrecks |
| `tannhauser_drift.webp` | Tannhauser Drift | Permanent charge storm, arcing dust |
| `brood_shoals.webp` | The Brood Shoals | Vacuum reef, organic accretion on hulls |
| `vantar_deep.webp` | Vantar Deep | Crushing gravity well, a station under strain |
| `meridian_span.webp` | Meridian Span | Trade span inside a dust cloud, lit signage |
| `cinder_gate.webp` | Cinder Gate | Vent fields under a dying star |
| `the_hush.webp` | The Hush | Featureless void; the absence of signal |
| `oxide_belt.webp` | Oxide Belt | Decaying reactor belt, corroded debris |
| `magnetar_wake.webp` | Magnetar Wake | Dead star's wake, sheared structures |
| `starfall.webp` | Starfall | Final approach, flare-washed and unshielded |

---

## 5. Environmental condition overlays — 10

`public/assets/fields/{id}.webp` — 1920 × 1080 with alpha, WebP q80.

These composite **over** the combat scene while a condition is active. They
must be legible at a glance without obscuring the HUD: keep the centre third
clear and the effect concentrated at the edges.

| File | Condition | Visual |
|---|---|---|
| `ion_storm.webp` | Ion Storm | Arcing static at frame edges, interference banding |
| `hard_vacuum.webp` | Hard Vacuum | Hard black vignette, frost at the corners |
| `high_gravity.webp` | High Gravity | Heavy downward blur, compression at the base |
| `nebula_haze.webp` | Nebula Haze | Dust veil, softened edges, reduced contrast |
| `radiation_belt.webp` | Radiation Belt | Grain storm, sensor speckle |
| `null_field.webp` | Null Field | Desaturation mask, flat dead light |
| `magnetar_wake.webp` | Magnetar Wake | Directional shear lines, magnetic distortion |
| `thermal_bloom.webp` | Thermal Bloom | Heat shimmer at the base, ember drift |
| `derelict_hulk.webp` | Derelict Hulk | Structural silhouettes framing the edges |
| `solar_flare.webp` | Solar Flare | Blown-out upper-left key, deep contrast |

---

## 6. Icons

All icons: **SVG, 24 × 24 viewBox, single-path where possible, `stroke:
currentColor`, no fills.** They are tinted by CSS at every call site, so a
baked-in colour will fight the palette. 1.5px stroke at 24px.

### 6.1 Status effects — 12
`public/assets/icons/statuses/{id}.svg`

`burn` `corrode` `hemorrhage` `irradiate` `stun` `jam` `blind` `suppress`
`mark` `static` `overclock` `bulwark`

Read as instrument-panel warning glyphs, not fantasy iconography. Burn is a
heat-warning triangle, not a flame; Jam is a locked mechanism; Mark is a
targeting bracket.

### 6.2 Damage types — 5
`public/assets/icons/types/{id}.svg`

`kinetic` (projectile/impact) · `thermal` (heat) · `corrosive` (droplet/etch)
· `em` (waveform) · `psionic` (concentric ripple)

### 6.3 Gear chassis — 16
`public/assets/icons/gear/{id}.svg`

Four slots × four tiers:
`weapon_t1…t4`, `plating_t1…t4`, `core_t1…t4`, `aux_t1…t4`

Tier reads as **socket count and build quality**: T1 scavenged and
asymmetric, T4 prototype and precise. Not brighter — better made.

### 6.4 Runes — 23
`public/assets/icons/runes/{id}.svg`

Ids are in `src/data/runes.ts`. Runes are physical inserts — cartridges,
shims, coils — not magical sigils. Group the visual language by rarity:
common are single stamped parts; legendary are complex assemblies.

### 6.5 Consumables — 9
`public/assets/icons/items/{id}.svg`

`item_patch` `item_weld` `item_drydock` `item_revive` `item_stim`
`item_plate` `item_scrambler` `item_summon` `item_reroll`

### 6.6 Race emblems — 10
`public/assets/races/{race}.svg` — 64 × 64 viewBox.

Faction insignia, stencil-cut: readable at 16px, one colour, no gradients.

---

## 7. Attack effects and animation — 11

`public/assets/effects/{name}.webp`

**Format:** horizontal sprite sheet, **8 frames**, each frame 256 × 256,
sheet 2048 × 256, WebP with alpha, played at **12fps (≈666ms total)**.
Effects are drawn centred on the struck combatant.

### 7.1 Per damage type — 5

| File | Type | Motion |
|---|---|---|
| `kinetic.webp` | Kinetic | Hard impact spark, debris spall, quick decay |
| `thermal.webp` | Thermal | Ignition flash into ember drift |
| `corrosive.webp` | Corrosive | Splash, then a slow etch-and-drip |
| `em.webp` | EM | Arc discharge, then static bloom |
| `psionic.webp` | Psionic | Concentric ripple, spatial distortion, no light |

### 7.2 Per combat event — 6

| File | Event | Motion |
|---|---|---|
| `crit.webp` | Critical hit | Amber frame burst; pairs with the 4px screen shake |
| `heal.webp` | Repair | Verdigris weld-glow, seams closing |
| `shield.webp` | Shield raised | Plating snapping into place |
| `dodge.webp` | Dodge / phase | Displacement smear, afterimage |
| `death.webp` | Destruction | Structural collapse, venting, cut to black |
| `status_apply.webp` | Status applied | Short chip-flare behind the status chip |

### 7.3 Motion budget — binding

§2.5 caps motion for the whole game, and these effects sit inside that cap,
not outside it. Permitted alongside them: damage numbers rising and fading,
HP drain at 250ms, status-chip pop, turn-order slide, the 4px/120ms critical
shake, one combat-start sequence, and the Legendary frame shimmer.

**Forbidden:** looping idle animations, ambient particle fields, parallax,
animated gradients, screen-filling flashes, anything that persists after its
event has resolved.

Under `prefers-reduced-motion`, effects must be safe to drop to a **single
static frame** — so make frame 3 of every sheet legible on its own.

---

## 8. Audio

Entirely unspecified in the original brief (§15.5). Proposed direction
below; say the word and it changes.

**Direction:** diegetic and industrial. Music is sparse, low, and mostly
texture — think ship systems more than score. Sustained low drones, distant
hull stress, rhythmic machinery, tape hiss. Melodic content is rare and
earns its entry. Nothing orchestral, nothing heroic, nothing synthwave.
Reference: *Duskers*, *Alien: Isolation* ambience, Ben Frost, Lustmord.

### 8.1 Music — 19
`public/assets/audio/music/{name}.ogg` — OGG Vorbis q5, seamless loop, −16
LUFS integrated.

| File | Use | Length |
|---|---|---|
| `bridge.ogg` | Bridge / hub | 2–3 min loop |
| `roster.ogg` | Roster and Hangar | 2–3 min loop |
| `requisition.ogg` | Requisition screen | 90 s loop |
| `combat_standard.ogg` | Ordinary contact | 2 min loop |
| `combat_elite.ogg` | Heavy contact | 2 min loop |
| `boss.ogg` | Boss encounters | 3 min loop |
| `apex.ogg` | Floors 100 / 200 / 300 | 4 min loop |
| `victory.ogg` | Floor cleared | 8 s sting |
| `defeat.ogg` | Crew lost | 12 s sting |
| `sector_01…10.ogg` | Per-sector ambient bed | 3 min loop each — 10 files |

Sector beds layer *under* the combat tracks rather than replacing them, so
they must be harmonically neutral — drones and texture, no strong key.

### 8.2 Sound effects — 44
`public/assets/audio/sfx/{name}.ogg` — mono, 48kHz, −20 LUFS, ≤1.5s unless
noted.

**Combat, per damage type (10):** `hit_kinetic` `hit_thermal`
`hit_corrosive` `hit_em` `hit_psionic`, plus a `_crit` variant of each.

**Combat events (12):** `miss` `dodge` `shield_raise` `shield_break`
`heal` `death_player` `death_enemy` `revive` `counter` `reflect`
`extra_action` `charge_release`

**Statuses (12):** one short application cue per status —
`status_burn` `status_corrode` `status_hemorrhage` `status_irradiate`
`status_stun` `status_jam` `status_blind` `status_suppress` `status_mark`
`status_static` `status_overclock` `status_bulwark`

**Interface (10):** `ui_click` `ui_hover` `ui_confirm` `ui_cancel`
`ui_error` `ui_toast` `floor_advance` `reward_open` `rune_socket`
`gacha_reveal`

Interface sounds are relay clicks and servo movement, not tones. Keep them
under 200ms.

---

## 9. Delivery and integration

### 9.1 Naming
Filenames must match the ids in `src/data/**` exactly — lowercase,
underscore-separated, no spaces. The build resolves by exact path; a typo
means the asset silently does not appear rather than erroring.

### 9.2 Formats
Images WebP (photographic) or SVG (icons and frames); audio OGG Vorbis with
an optional MP3 sibling for Safari. The resolver prefers `.ogg` then `.mp3`,
and `.svg` then `.webp` then `.png`.

### 9.3 Budget
Target **under 25 MB total** for the shipped bundle. Portraits dominate:
150 × ~45 KB ≈ 7 MB. Backdrops are the risk — 16 × 1920 × 1080 WebP q75 ≈
6 MB. Compress hard; these sit at 25% brightness behind panels and will not
be scrutinised.

### 9.4 Verification
```bash
npm run dev     # assets appear immediately, no restart
npm test        # src/art/manifest.test.ts checks resolution and fallback
```
`assetCoverage()` in `src/art/manifest.ts` reports how much of this manifest
has landed, per class, against counts derived from the data — so it stays
accurate as content changes.

### 9.5 Order of work
Highest visible return first:

1. **Hero portraits** (150) — the collection is the product
2. **Status and damage-type icons** (17) — read constantly during combat
3. **Attack effects** (11) — combat currently has no impact feedback
4. **Sector backdrops and condition overlays** (20) — depth and place
5. **UI frames and HUD** (32) — the CSS treatment is already good
6. **Audio** (63) — largest effort, latest return
7. **Rune, gear and item icons** (48) — currently text, and text works

---

## 10. Open questions for the client

1. **Audio direction** is proposed here, not specified. Confirm or redirect
   before any recording starts.
2. **Portrait style** — photographic (as specified) or illustrated? The
   prompt template above targets photographic; an illustrated roster would
   be cheaper to keep consistent but changes the whole feel.
3. **Boss portraits** — bosses currently reuse hero art with a generated
   title. Unique art for the 27 bosses and 3 apex encounters would be 30
   additional portraits.
4. **Animated portraits** — out of scope here. If wanted, budget a 4-frame
   idle loop per hero and a hard decision about the §2.5 motion cap, which
   currently forbids ambient looping motion.
