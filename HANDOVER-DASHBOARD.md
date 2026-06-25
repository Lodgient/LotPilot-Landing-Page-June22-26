# LotPilot — Dealer Dashboard Platform · Handover

The dealer "Dealer OS" at `/dashboard`. This is the actual product dealers live in: get found
by AI (visibility), work the leads (agent), prove ROI. It's **UI-complete and connector-ready**
— most of what's left is wiring real data/keys into seams that already exist.

> Companion doc: **`HANDOVER-WEBSITE.md`**. Shared basics repeated here so this stands alone.

---

## 1. Repo, stack, deploy
- **Repo:** `github.com/Lodgient/LotPilot-Landing-Page-June22-26` · branch `main` · Vercel
  auto-deploys on push. Local: `~/Documents/LotPilot-Landing-Page-June22-26`.
- **Stack:** Next.js 16 App Router · React 19 · TypeScript (strict) · Tailwind v4 ·
  Supabase (Postgres + Auth + RLS). **Always** `npx tsc --noEmit && npm run build` before commit.
- **Supabase project:** `slbkykjgghtvlyujqcuy` (lotpilot-sales-brain).

## 2. Pages (`app/dashboard/*`)
Command Center (`page.tsx`) · **AI Visibility** (`visibility/page.tsx` — the flagship) ·
Inventory AI · Demand Intelligence · Leads & Conversations · AI Sales Assistant · ROI &
Attribution · Settings · Board report (`report/`) · `visibility/history` · `visibility/competitors`.
All wrapped by `components/dashboard/Shell.tsx` (sidebar + topbar + the global widgets below).

## 3. Data layer — start here (`lib/dashboard/queries.ts`)
- Data lives in `dp_*` Supabase tables. Every read goes through this file.
- **`requireDealer()`** resolves the signed-in dealer (or the public **demo** dealer
  "Capitol Nissan Infiniti", id `11111111-…`). `getSessionUser()` is a per-request cached auth lookup.
- **Multi-tenant is solved:** `demoRead()` branches — **anonymous → cached demo dataset**
  (fast); **authenticated dealer → their own rows live via the session client** (RLS `dp_*_own`
  via `dp_current_dealer()`). RLS policies already exist on every `dp_` table
  (`demo_public_read` for anon + `dp_*_own` for authenticated).
- **Pay-to-access gate:** `requireDealer()` sends any dealer whose `subscription_status` isn't
  `active`/`trialing` → `/activate`. The demo dealer is set `active`.

## 4. Design system & component conventions
Editorial Tech-Lux (warm paper, Fraunces serif on hero numbers + card/page titles, Inter for
data). Reusable primitives in `components/dashboard/ui.tsx` (`Card`, `PanelHeading` (has a
`tag` slot), `StatCard`, `Badge`) + `charts.tsx` (the **LineChart has hover tooltips**).
- **Data-state system** (`States.tsx`): `EmptyState` (no feed) · `ScanningState` (feed in,
  scan running) · `DataTag` (a per-widget **Demo↔Live** pill that flips with a connector flag).
  Wired into Visibility/Inventory/Demand first-runs.
- **Table convention:** uppercase tinted header band + zebra rows + branded hover.
- **Onboarding checklist** (`OnboardingChecklist.tsx`) on Command Center — lights up from real
  data signals (feed → scan → optional agent).

## 5. Signature dashboard features (all built + verified)
- **AI Visibility (flagship):** Inventory Citation Rate hero · per-VIN drill-down
  (`VinCitationBreakdown.tsx`) · forwardable shock card · inventory-grounded AVTS · AnswerMonitor.
- **⌘K command palette** (`CommandPalette.tsx`) · **notification bell** (`NotificationBell.tsx`
  → `/api/notifications`, derived from real data) · **demo conversion banner** (`DemoBanner.tsx`,
  demo-only) · **multi-page guided product tour** (`ProductTour.tsx` — walks the whole value
  story across pages, persists via sessionStorage; desktop + mobile).
- A11y: `:focus-visible` rings + `prefers-reduced-motion` support (globals). Mobile: 2×2 KPI
  grids, tap-lead→conversation, no overflow.

## 6. Zero-touch onboarding (signup → pay → provision)
`/signup?plan=visibility` → create Supabase auth user (details in user_metadata) →
`/api/checkout` → **Stripe Checkout** → pay → **`/api/stripe/webhook`** (`checkout.session.completed`)
→ `provisionDealer()` (`lib/onboarding/provision.ts`, idempotent, service-role) → their own
dashboard (first-run states). Notes:
- A **pre-existing Supabase DB trigger** already creates `dp_dealers`+`dp_profiles` on signup
  (status `inactive`); the gate + webhook flip it to active/trialing.
- **Pre-launch fallback:** with no Stripe key, `/api/checkout` provisions a **trialing** workspace
  directly (needs the service-role key). `/activate` is the pay gate for unprovisioned users.
- Email confirmation is OFF in Supabase Auth (instant session) — verified.
- Stripe code: `lib/stripe/{plans,server}.ts`, `app/api/checkout`, `app/api/stripe/webhook`.

## 7. Connector seams — what to wire (the core of this handover)
Every interactive control is wired to a real endpoint with finished UX; the demo/anon paths
no-op so nothing errors. **Point each at its backend:**

| Control | Seam | Connect | Env |
|---|---|---|---|
| Feed / visibility / agent ingest | `POST /api/feed/ingest`, `/api/visibility/ingest`, `/api/agent/webhook` (REAL) | bot/normalizer POSTs here | `SUPABASE_SERVICE_ROLE_KEY`, `LOTPILOT_INGEST_KEY` |
| AI Visibility live data | `AI_MONITOR_LIVE=true` + `ai_visibility_*` tables; contract in `lib/ai-visibility/contract.ts` | `getVisibilityMonitor()` reads live; `DataTag` flips Demo→Live | `AI_MONITOR_LIVE` |
| "Run a fresh scan" | `POST /api/ai-visibility/scans` | forward to the bot scan trigger | `BOT_SCAN_WEBHOOK_URL`, `BOT_SCAN_KEY` |
| Leads "Take over → Send" | `POST /api/lead/reply` | agent outbound (Twilio/ElevenLabs) + insert `dp_messages` | `AGENT_SEND_WEBHOOK_URL`, `AGENT_SEND_KEY` |
| Settings → Profile Save | server action `saveProfile` (RLS `dp_profiles_update_self`) | already live for signed-in dealers | — |
| Date-range | `?range=` URL param (wired) | scope ranged queries when time-series data exists | — |
| Onboarding checklist / states | `dealer.vehicles`/`feedType`, `visibility`, `agent.status` | data flows → steps + ScanningState resolve automatically | — |

## 8. Observability (`lib/notify.ts`)
Slack pings (new lead + errors), Resend transactional email, and `captureError` wired into the
lead/webhook/scan/reply routes + a `/api/log` sink from `app/error.tsx`. All env-gated.

## 9. ⚠️ Go-live checklist (set in Vercel — currently NOT set)
1. `SUPABASE_SERVICE_ROLE_KEY` — **required** for provisioning (without it, new signups hit
   `/activate` and can't complete).
2. `STRIPE_SECRET_KEY`, `STRIPE_PRICE_VISIBILITY`, `STRIPE_PRICE_AGENT`, `STRIPE_WEBHOOK_SECRET`
   + a Stripe webhook → `https://<domain>/api/stripe/webhook`
   (`checkout.session.completed`, `customer.subscription.updated/deleted`).
3. `BOT_SCAN_WEBHOOK_URL`/`BOT_SCAN_KEY`, `AGENT_SEND_WEBHOOK_URL`/`AGENT_SEND_KEY` when those backends exist.
4. `AI_MONITOR_LIVE="true"` once the bot tables are populated.
5. `SLACK_WEBHOOK_URL`, `RESEND_API_KEY`/`EMAIL_FROM` for notifications/email.
6. (`DASHBOARD_PUBLIC="false"` to close the public demo; leave unset to keep it open.)

## 10. Open items (dashboard)
- **Per-VIN public AI-readable pages** (`/inventory/[dealer]/[vehicle]` + schema.org/llms.txt) —
  the moat & the crawler's targets. URL gen exists (`lib/inventory/livePage.ts`, preview in
  `LivePagePreview.tsx`); the public route is **not built** (your team / Helmy).
- **Inventory-derived query engine** (generate buyer queries from the live feed) — not built.
- In-app **leads view** of `lp_marketing_leads` (needs the service-role key; Slack covers it meanwhile).
- Once bot data flows: validate against `contract.ts`, flip `AI_MONITOR_LIVE`.

## 11. Working together
Branch + PR into `main`. Hottest files: `lib/dashboard/queries.ts`,
`app/dashboard/visibility/page.tsx`, `components/dashboard/Shell.tsx`, `lib/onboarding/provision.ts`,
`lib/ai-visibility/contract.ts` (keep aligned with the bot team).
