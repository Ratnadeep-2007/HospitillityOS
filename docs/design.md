# HospitalityOS — UI Design Brief

## Read this first

The current UI (`src/app/globals.css`, "Nebula Obsidian Glassmorphism") uses a near-black
background with neon cyan/violet/emerald/rose glow accents, glassmorphic cards, and hover-lift
animations. This reads as a generic AI-generated dashboard template — the kind seen on crypto
trackers and hackathon demos — not as enterprise operational software. **We are deliberately
moving away from this direction, not iterating on it.** Do not carry over the neon glow, the
"obsidian" naming, or the glassmorphism as a starting point.

The people using this software are hotel GMs, front desk staff, housekeeping supervisors, and
maintenance techs, often on shared desktop screens or tablets, often mid-shift and under time
pressure, sometimes in a bright back office or a lobby, not a dark room. The design should read
like precision operational tooling — closer to an airline ops center or a hospital nurse
station display than a consumer app or a sci-fi control panel. Calm, legible, fast to scan under
stress. Trustworthy, not flashy.

---

## Design direction (token system)

Follow this system. Don't default back to dark-mode-plus-neon-accent, and don't default to the
other common AI-cliché instead (warm cream + serif + terracotta accent) — this has its own
identity, grounded in hospitality operations specifically.

### Color

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F7F6F2` | Primary background — warm off-white, not stark white |
| `ink` | `#1C2321` | Primary text — near-black with a slight warmth, not pure black |
| `slate` | `#6B7280` | Secondary text, borders, muted labels |
| `line` | `#E4E1DA` | Hairline dividers, card borders |
| `brass` | `#A8763E` | Primary accent — a single considered brand color, evokes a hotel key/bell without being literal or twee. Used sparingly: primary buttons, active tab, key numbers. Not gradients, not glow. |
| `surface` | `#FFFFFF` | Card/panel background, sits on top of `paper` |

**Status colors are functional, not decorative.** They exist only to communicate state, and should
never appear as background washes or ambient glow:
- `status-ok` `#2F8558` (room available, task completed, SLA on track)
- `status-attention` `#B8792A` (pending, low stock, approaching SLA)
- `status-critical` `#B23A32` (escalated, overdue, dirty room blocking check-in)
- `status-info` `#3B6EA5` (informational, in-progress)

Use these as small solid badges, left-border accents on cards, or text color — never as full-card
neon glows or gradients.

### Typography

- **Display/headings:** A grounded, slightly warm sans with real character at larger sizes —
  something like Söhne, General Sans, or similar (pick one available via Google Fonts if licensing
  is a concern — e.g. "Instrument Sans" or "Sora" at weight 600–700 for headings). Avoid anything
  that reads as either "startup SaaS generic" (Inter everywhere at every weight) or "AI-cliché
  editorial serif."
- **Body/data:** A highly legible workhorse sans built for dense tables and small sizes — Inter or
  IBM Plex Sans are both fine here, this is not where to spend a design risk.
- **Numerals:** Use tabular figures for any numeric data (SLA countdowns, occupancy %, inventory
  counts) so columns of numbers align. Most of the fonts above support this via `font-variant-numeric: tabular-nums`.

### Layout

- Light background, white surfaces for cards, hairline borders (`1px solid line`) instead of
  glassmorphism/blur/glow for separation.
- Flat design — no `backdrop-filter: blur()`, no drop shadows beyond a very subtle
  `0 1px 2px rgba(0,0,0,0.04)` for elevation. This is functional software, not a marketing page.
- Dense information layout is fine and expected — this is an ops dashboard, not a landing page.
  Don't over-simplify or add excessive whitespace where it costs the user scan time.
- Status is communicated primarily through color-coded left borders on cards/rows and small solid
  badges, not through changing the entire card's background.

### Motion

- Minimal. A quick `150-200ms ease` transition on hover/state-change is enough. No hover-lift
  transforms, no glow-on-hover, no ambient background animation. The one place motion can earn its
  keep: a brief, calm transition when a task moves status (e.g., PENDING → IN_PROGRESS) or when an
  SLA escalates — this is information, not decoration, so it's worth a deliberate, subtle moment
  (e.g., a border color transition + a small pulse on the badge only, not the whole card).

### Signature element

The one place to spend real design attention: **the SLA/status rail**. Every task card, room card,
and workflow item carries a live deadline. Make this the visual through-line of the product — a
thin, consistent left-edge color bar (using the status colors above) plus a small monospace/tabular
countdown or timestamp, used consistently across every module (tasks, rooms, maintenance tickets,
procurement requests). This is the thing a GM's eye should learn to scan for across the whole app —
consistent, disciplined, never decorative elsewhere.

---

## What to avoid (explicit anti-patterns)

- No neon glow, no glassmorphism/blur, no gradient backgrounds
- No hover-lift `transform: translateY()` on cards
- No more than one accent color (`brass`) used decoratively — status colors are functional only
- No numbered-marker decoration (`01 / 02 / 03`) unless something is genuinely a sequence
- No stock icon-in-a-circle-with-gradient treatment
- Don't rename working CSS classes/variables purely for aesthetic reasons if it risks breaking
  functionality — extend or replace the token values, keep the wiring stable

---

## Process to follow

1. **Update the token system first.** Rewrite the CSS custom properties in `src/app/globals.css`
   (`--background`, `--foreground`, `--card-bg`, `--card-border`, the neon-* variables, etc.) to
   match the palette above. Keep the variable names where reasonable so existing component code
   doesn't need mass find-replace, but the actual values and any glow/blur effects change.
2. **Audit every use of `.premium-card`, `.stitched-card`, `.blueprint-grid`, `.stitched-pin`, and
   any neon/glow utility classes** in `src/app/page.tsx` (or the componentized version if the
   page.tsx refactor has already happened). Replace blur/glow treatments with the flat,
   hairline-bordered card style described above.
3. **Apply the SLA/status rail pattern** consistently across task cards, room status cards, and any
   other item with a deadline or state.
4. **Check contrast.** Text on `paper`/`surface` must meet WCAG AA contrast minimums. Status colors
   need to be distinguishable without relying on color alone (pair with a label/icon, not color
   only, for accessibility).
5. **Responsive check.** Verify the dashboard remains usable on a tablet-width viewport (this is
   realistic hardware for housekeeping/maintenance staff), not just desktop.
6. **Self-critique before calling it done:** does any part of this still look like a stock AI
   dashboard template? Does the eye have one clear place to land per screen (the brass accent,
   used sparingly) rather than competing signals? Fix before finishing.

## Acceptance criteria

- No `backdrop-filter`, no neon/glow box-shadows, no gradient card backgrounds remain in the codebase.
- A person unfamiliar with the product can tell, within 2 seconds of looking at any screen, what
  needs attention right now (via the status rail / badge system) without reading text.
- `npm run build` and `npm run lint` pass with no new errors.
- Visual behavior/functionality is unchanged — this is a restyle, not a feature change.
