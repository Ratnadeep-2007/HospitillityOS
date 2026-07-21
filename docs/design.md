# HospitalityOS — UI Design Brief v2 (Refinement Pass)

## Where we are

The precision-operational-tooling token system from the previous design pass (`--paper`, `--ink`,
`--brass`, `--status-*`, `.ops-card`, status rails) is implemented in `src/app/globals.css` and
mostly holds up: flat cards, functional status color, tabular numerals, no neon/glow/glassmorphism.
Keep this system. Do not start over or introduce a new palette. This pass is about finishing the
job, not replacing it.

Two problems are undermining it right now:

1. **Two competing UI frameworks are loaded simultaneously** — Bootstrap 5 (`bootstrap.min.css`,
   `bootstrap-icons`) is imported in `src/app/layout.tsx` and used throughout via grid/utility
   classes (`row`, `col-lg-2`, `d-flex`), while Tailwind CSS is also installed and configured. Two
   icon systems are in use at once (Material Symbols Outlined and Bootstrap Icons), which produces
   visually inconsistent icon weights and sizes across the app. This is the single biggest thing
   making the app look assembled rather than designed.
2. **The integration simulator is rendered directly in the main dashboard**, immediately below the
   stats row (`<IntegrationSimulator />` in `src/app/page.tsx`), visible to every user at all
   times. A "Simulate Incoming Message" panel in the primary surface reads as unfinished/demo
   software the instant a prospect or buyer sees it, regardless of how polished everything else is.

Fix both. Details below.

---

## Task 1: Pick one UI framework and one icon set — remove the other

**Decision: keep Bootstrap 5's grid/layout utilities (already used everywhere, low risk to rip
out), remove Tailwind if it's not actually load-bearing anywhere, and standardize on a single icon
set.**

1. Grep the codebase for actual Tailwind utility class usage (`className="...flex...bg-...p-4..."`
   patterns that aren't also valid as plain CSS/Bootstrap). If Tailwind is barely used outside the
   original token-system CSS variables (which don't require Tailwind to work), remove the Tailwind
   dependency, its config, and the `@import "tailwindcss"` line entirely. If it turns out to be
   load-bearing in specific components, list those components back to me before removing anything
   — don't silently break a view.
2. Standardize on **one** icon set. Recommendation: keep Material Symbols Outlined (already the
   primary one used per the previous design pass) and remove `bootstrap-icons` usage, replacing any
   Bootstrap Icon references (`bi bi-*` classes) with the equivalent Material Symbol. Consistent
   icon weight and optical size matters more than which set you pick — just pick one.
3. After this cleanup, `npm run build` and `npm run lint` must still pass with no new errors, and
   every existing screen must render with no missing icons or broken layout.

---

## Task 2: Move the simulator out of the primary product surface

1. Move `<IntegrationSimulator />` out of `src/app/page.tsx`'s main render tree entirely.
2. Create a separate route, e.g. `src/app/dev/simulator/page.tsx`, and render it there instead.
3. Gate access: only render/allow this route when `process.env.NODE_ENV !== 'production'`, OR
   behind an explicit env flag like `NEXT_PUBLIC_ENABLE_SIMULATOR`. In production builds without
   that flag set, the route should 404 or redirect, not silently render an empty page.
4. Remove any nav link, tab, or button pointing to the simulator from the main dashboard chrome.
   It should not be discoverable by a normal user browsing the app — only reachable by someone who
   already knows the URL (you, during a live demo, in a separate tab).
5. Preserve all the simulator's existing functionality and its wiring to `/api/integrations/mock` —
   this is a relocation and access-gating change, not a feature removal.

**Acceptance:** A production build with the flag unset shows zero trace of the simulator anywhere
in the primary UI — no nav item, no visible route. With the flag set, `/dev/simulator` still works
exactly as before.

---

## Task 3: Visual hierarchy and polish pass

The token system is right; the execution needs another pass for it to read as genuinely premium
rather than "correctly styled but flat."

1. **KPI hierarchy in `StatsOverview`.** Right now every stat card appears to carry equal visual
   weight. Not every number matters equally in the moment — decide which 1-2 numbers (e.g.
   escalated tasks, occupancy %) deserve to be visually primary (larger, `--brass` or
   `--status-critical` accent) versus which are secondary reference numbers (smaller, `--slate`).
   A GM should be able to tell what needs attention without reading every card.
2. **Spacing discipline.** Audit padding/margin consistency across `.ops-card` instances — Bootstrap
   utility classes (`p-3`, `mb-4`, `g-3`) get applied inconsistently ad hoc per component right now.
   Define a consistent spacing scale (e.g. 4/8/12/16/24/32px) and apply it uniformly rather than
   picking Bootstrap spacing utilities per-component by feel.
3. **Empty states.** Check every department view (`HousekeepingView`, `MaintenanceView`,
   `RestaurantView`, etc.) for what renders when there's no data. A blank div or a raw "No tasks"
   string reads as unfinished. Design one consistent empty-state pattern (icon + short direct
   sentence, in the interface's voice — e.g. "No maintenance tickets right now" not "No data
   found") and reuse it everywhere data can be empty.
4. **Table/list density in data-heavy views** (Reception, Housekeeping room grids, Inventory).
   Confirm room/task rows use tabular alignment, consistent row height, and the status-rail pattern
   uniformly — check for any view that still uses ad hoc badge styling instead of the
   `badge-status-*` classes already defined in `globals.css`.
5. **Header/nav polish.** Check `ops-navbar` and `nav-tab-ops` for consistent active-state
   treatment across all department tabs, and make sure the property/employee switcher (referenced
   in `handleEmployeeSwitch`) doesn't look like a leftover dev control — style it as a deliberate,
   professional account/context switcher (common enterprise pattern: small avatar or initials
   badge + name + chevron, opening a clean dropdown).
6. **Focus states.** Confirm every interactive element (buttons, tabs, form inputs) has a visible
   keyboard focus ring using the `--brass` accent — required for accessibility, also a quiet signal
   of quality craftsmanship most competitors skip.

---

## What NOT to touch in this pass

- Don't change the color tokens, don't reintroduce dark mode, don't add gradients/glow back.
- Don't change any data/API logic — this is CSS, component structure, and framework cleanup only.
- Don't remove the simulator's functionality — only its visibility and reachability from the main
  app.

## Acceptance criteria for this whole pass

- Only one CSS framework and one icon set remain in the codebase.
- The simulator is unreachable from the main UI in a production build without an explicit flag.
- Every stat/data view has a clear visual hierarchy and a designed empty state — nothing renders
  a blank area or raw fallback text.
- `npm run build` and `npm run lint` pass clean.
- Manual click-through of every department tab shows consistent spacing, consistent icon
  treatment, and consistent status-color usage — no view looks visually different in kind from
  the others.
