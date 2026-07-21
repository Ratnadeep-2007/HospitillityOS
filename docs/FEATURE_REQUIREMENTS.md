# What Hotels & Restaurants Actually Require From Operations Software

This is not a feature wishlist — it's the set of things that come up in real procurement
conversations with hotel/restaurant operators, ranked by how often they're a dealbreaker if
missing. Each item is marked against HospitalityOS's current state so this doubles as a gap list,
not just a market research doc.

**Legend:** ✅ Have it · 🟡 Partial · ❌ Gap

---

## Tier 1 — Table stakes (a buyer will not seriously evaluate you without these)

| Requirement | Why it's non-negotiable | Status |
|---|---|---|
| Real-time task assignment & tracking | Core operational coordination — this is the product | ✅ |
| SLA deadlines + automatic escalation | Prevents dropped requests; managers need to know before a guest does | ✅ |
| Audit trail / activity log | Needed for accountability, disputes, and often insurance/compliance | ✅ |
| Role-based access (who can see/do what) | A housekeeper shouldn't see financials; a front desk agent shouldn't reassign maintenance staff | 🟡 — role checks exist in places (manager override), not confirmed as a consistent system-wide model |
| Multi-property / multi-tenant data isolation | Any operator with more than one location requires this, and any buyer's IT/security review will ask directly | ✅ (RLS-based, tested) — **but** incoming webhook routing must correctly map to the right property or this guarantee breaks in practice (flagged separately in the engineering brief) |
| Works reliably on mobile/tablet | Housekeeping, maintenance, and food runners are not sitting at a desktop | ✅ (Responsive grid, stacked mobile cards, touch targets) |
| Data export (CSV/PDF reports) | Owners and accountants need to pull data out, not just view it in-app | ✅ (CSV exports built for Tasks, Guests, Rooms, Inventory, Assets, & Audit Logs) |
| Uptime/reliability during a real shift | If the app goes down during dinner service or a checkout rush, it gets abandoned within a week | ❌ — no monitoring, alerting, or documented uptime SLA |

---

## Tier 2 — Hotel-specific requirements

| Requirement | Why it matters | Status |
|---|---|---|
| PMS integration (Opera, Cloudbeds, Mews, Protel, etc.) | Room status, bookings, and guest data live in the PMS today — a tool that doesn't sync with it creates double data entry, which staff will abandon within weeks | ❌ — webhook contract exists conceptually, no real PMS connector built |
| Room status sync (Clean/Dirty/Inspected/Out-of-Order) back to PMS | Front desk can't check guests in if this doesn't reflect in the system they're actually using | ❌ |
| Housekeeping assignment by floor/section, not just by task | Real housekeeping departments schedule by zone, not a flat task list | 🟡 — depends on how `HousekeepingView` currently structures assignment |
| Lost & found tracking | A genuinely constant, real operational need in hotels, often handled on paper today | ❌ |
| Guest preference/history memory across stays | Repeat guests expect recognition — competitors and PMS systems already do this | 🟡 — `Guest` model exists; depth of preference tracking unclear |
| Channel manager / OTA awareness (Booking.com, Expedia, etc.) | Not core to your product, but GMs will ask if it interacts at all with rate/inventory sync | ❌ — explicitly out of scope, fine to say so |

---

## Tier 3 — Restaurant-specific requirements

| Requirement | Why it matters | Status |
|---|---|---|
| Table management / floor plan view | Restaurant hosts and managers think in terms of physical tables and turn times, not just a task list | ❌ |
| POS integration (Toast, Square, Micros, etc.) | Orders, billing, and menu data live in the POS — same double-entry problem as PMS if disconnected | ❌ |
| Kitchen Display System (KDS) style routing | Kitchen staff need order/prep visibility distinct from front-of-house tasks | 🟡 — `RestaurantView` and `KitchenProcurementView` exist; unclear if they function as a real KDS or a generic task list relabeled |
| Reservation/waitlist handling | Directly tied to the WhatsApp reservation extraction feature already pitched — needs a genuinely usable host-stand view, not just a task in a list | 🟡 |
| Allergen/dietary flagging on orders | Real liability issue — missing this is a legal risk for a restaurant operator, not just a UX gap | ❌ |
| Food safety / temperature log compliance | Many jurisdictions legally require logged temperature checks (walk-ins, hot-holding); health inspectors ask for these records | ❌ |
| Waste/spoilage tracking | Tied to inventory, but a distinct metric restaurant operators specifically track for cost control | ❌ |

---

## Tier 4 — Compliance & trust (raised late in the sales cycle, but can kill a deal fast)

| Requirement | Why it matters | Status |
|---|---|---|
| Data privacy / guest PII handling policy | Any hotel with EU or California guests has real obligations (GDPR/CCPA); IT/legal will ask directly | ❌ — no documented policy |
| Payment data — PCI DSS scope | If you ever touch card data (folio credits, payments) this becomes mandatory, not optional | ❌ — currently folio credits appear to be logged, not actual payment processing, which is the right call for now; just don't drift into handling real card data without this |
| Data backup / disaster recovery plan | "What happens if Supabase goes down or we lose data" is a real, common question from an IT director | ❌ — no documented backup/retention policy |
| SOC 2 or equivalent security posture | Enterprise buyers (Taj/Radisson-scale) will require this; independent hotels generally won't ask | ❌ — expected at this stage, not a near-term priority unless targeting enterprise |
| Staff labor law compliance (break tracking, overtime flags) | Comes up if the product ever touches scheduling/shift management directly | Not yet in scope — fine to leave out unless scheduling becomes a feature |

---

## What this means practically

**Don't try to build all of this.** Most of Tier 3/4 is irrelevant if you're staying focused on
independent hotels for now (per the earlier go-to-market conversation) rather than restaurants or
enterprise chains. Building POS integration and food safety logging for a product that isn't
targeting restaurants yet would be wasted effort.

**What's worth prioritizing now, given your actual target (independent/small hotel operators):**
1. Mobile/tablet responsiveness — your actual daily users are on the floor, not at a desk
2. Basic data export (CSV) — a cheap feature that removes a real objection
3. A real PMS integration with at least one common system (even a single connector, e.g.
   Cloudbeds, which has a more open API than Opera) — this is the single feature most likely to
   come up as a hard blocker in a real sales conversation
4. A documented, honest answer to "what happens to guest data" and "what's your backup story" —
   this doesn't require new engineering, just writing it down so you're not caught flat-footed

**What to explicitly scope out and say so, rather than pretend to have:** restaurant-specific
features (table management, KDS, allergen tracking) until/unless you deliberately decide to target
restaurants as a segment — trying to be both right now dilutes the product and the pitch.
