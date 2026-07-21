# HospitalityOS — UI Design Brief v2 (Refinement Pass) — COMPLETED ✅

## Current Status Overview (All Tasks Completed)

The precision-operational-tooling token system (`--paper`, `--ink`, `--brass`, `--status-*`, `.ops-card`, status rails) in `src/app/globals.css` is fully realized and enforced across all views.

---

## Task 1: Framework & Icon Set Consolidation — ✅ COMPLETED
- **Removed competing frameworks**: Removed Tailwind CSS dependencies (`tailwindcss`, `@tailwindcss/postcss`, `postcss.config.mjs`) and `bootstrap-icons`.
- **Standardized Iconography**: Standardized 100% on **Material Symbols Outlined** (`<span className="material-symbols-outlined">...</span>`). Removed `lucide-react` icons across all department components.
- **Verification**: `npm run build` and `npm run lint` pass with 0 errors.

---

## Task 2: Simulator Relocation & Access Gating — ✅ COMPLETED
- **Relocated**: Moved `<IntegrationSimulator />` out of `src/app/page.tsx`'s main render tree.
- **Standalone Route**: Created `src/app/dev/simulator/page.tsx`.
- **Access Gated**: Only renders in dev (`process.env.NODE_ENV !== 'production'`) or when `NEXT_PUBLIC_ENABLE_SIMULATOR === 'true'`. Returns Next.js `notFound()` 404 in production without flag.
- **Chrome Cleanup**: Zero simulator links or buttons present in main application chrome.

---

## Task 3: Visual Hierarchy & Polish Pass — ✅ COMPLETED
- **KPI Hierarchy**: Rebuilt `StatsOverview` with primary visual weight for **Critical SLA Escalations** (`status-rail-critical`) and **Property Occupancy** (`status-rail-ok`), with secondary reference metrics properly styled.
- **Spacing Discipline**: Enforced uniform 8px/12px/16px/24px padding and gap scales across `.ops-card` components.
- **Empty States**: Built `.ops-empty-state` component (icon + direct action sentence) for all empty queues, inventories, and feeds.
- **Table & List Density**: Enforced tabular numeral alignment (`tabular-nums`), status rails (`status-rail-*`), and pill badges (`badge-status-*`) across all views.
- **Header & Nav Polish**: Formatted user account switcher into a sleek, professional account dropdown with avatar icon + role badge.
- **Focus Rings**: Added visible `:focus-visible` focus ring with `--brass` accent for all interactive controls.

---

## Acceptance Criteria Status

- [x] Only Bootstrap layout utilities and Material Symbols Outlined icons remain.
- [x] The simulator is unreachable from the main UI in production without explicit flag (`/dev/simulator` gated).
- [x] Every stat/data view has a clear visual hierarchy and designed empty state.
- [x] `npm run build` and `npm run lint` pass clean with 0 errors.
- [x] All 7 department tabs render with consistent spacing, icon treatment, status colors, and CSV data exports.
