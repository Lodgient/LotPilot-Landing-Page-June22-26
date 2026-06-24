# LotPilot — Website & Dashboard · Developer Handover

Welcome aboard, Helmy. This is everything you need to start working on the LotPilot
marketing site **and** the dealer dashboard. Duncan is still actively working in this
repo too, so **please branch** (see [Working together](#working-together)).

---

## 1. What this is

**LotPilot** is a B2B SaaS for car dealers. Two layers, one product:

1. **AI Visibility (discovery)** — make every car (VIN) in a dealer's inventory the
   *cited answer* inside AI answer engines (ChatGPT, Perplexity, Gemini, Grok, Claude,
   Google AI Overviews, Bing Copilot).
2. **AI Sales Agent (conversion)** — an SMS + voice agent that works each resulting lead:
   qualifies, captures credit app, books the appointment.

The dealer's only job: **send their inventory feed.** No website replatform.

> **The moat (read this):** competitors optimize what AI says about the *dealership*
> (store-level reputation). LotPilot makes every *car* the answer — that's **inventory-level
> (VIN-grounded) GEO**. The hero metric everywhere is **Inventory Citation Rate** (% of live
> inventory that is the cited answer), NOT a generic store score. See
> `docs/AI-VISIBILITY-ENGINE-SPEC.md` and the product-direction doc Duncan can share.

This repo = the **marketing site** (`dealers.lotpilot.com`) + the **dealer dashboard**
(`/dashboard`, the "Dealer OS"). It is **not** the consumer inventory site.

---

## 2. Repo, stack, deploy

- **Repo:** `github.com/Lodgient/LotPilot-Landing-Page-June22-26` · default branch `main`
- **Local path:** `~/Documents/LotPilot-Landing-Page-June22-26`
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4
  (`@theme` tokens in `app/globals.css`) · Framer Motion · Lenis (marketing smooth scroll) ·
  Supabase (Postgres + Auth + RLS)
- **Deploy:** Vercel, **auto-deploys on push to `main`** →
  `https://lot-pilot-landing-page-june22-26.vercel.app` (a real domain will be pointed here later)

### Run it locally
```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # typecheck — ALWAYS run before committing (see gotchas)
npm run build        # production build
npm run lint
```

The app boots with **no env vars** for read-only work: the Supabase URL + anon key have
public fallbacks in `lib/supabase/config.ts` (the anon key is public-by-design; RLS protects
data). You only need env vars for the AI/voice features below.

---

## 3. Environment variables

| Var | Purpose | Needed for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project (has public fallback) | everything (data) |
| `SUPABASE_SERVICE_ROLE_KEY` | server-side privileged writes (`lib/supabase/admin.ts`) | feed/visibility ingest |
| `ANTHROPIC_API_KEY` | Claude — audit copilot + Test-Ava assistant | `/api/assistant` |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_AGENT_ID` / `ELEVENLABS_PHONE_NUMBER_ID` | voice agent / TTS | `/api/tts`, `/api/call` |
| `LOTPILOT_INGEST_KEY` | shared secret for the bot backend to POST scans | `/api/visibility/ingest` |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | demo-login flow | `/api/demo-login` |
| `AI_MONITOR_LIVE` | `"true"` switches visibility data from demo → live bot tables | live monitor |
| `DASHBOARD_PUBLIC` | set `"false"` to require login for `/dashboard` (default: public demo) | access control |

Ask Duncan for the real values (don't commit them).

---

## 4. Project structure

```
app/
  page.tsx                     ← marketing home (composes components/sections/*)
  login, signup, demo, plan, how-it-works
  dashboard/
    page.tsx                   ← Command Center (daily landing)
    visibility/page.tsx        ← AI Visibility (the flagship — see §6)
    visibility/history, visibility/competitors
    inventory/page.tsx         ← Inventory AI (per-VIN table)
    demand/page.tsx            ← Demand Intelligence
    leads/page.tsx             ← Leads & Conversations (inbox)
    assistant/page.tsx         ← AI Sales Assistant config
    roi/page.tsx               ← ROI & Attribution
    report/page.tsx            ← board-ready printable report
    loading.tsx                ← skeleton shown during nav (perf)
  api/
    assistant (Claude stream) · tts (ElevenLabs) · call (Twilio)
    audit/run · audit-lead · feed/ingest · visibility/ingest · lead · demo-login · agent/webhook

components/
  sections/      ← marketing sections (Hero, Pricing, Comparison, Discovery, …)
  dashboard/     ← dashboard UI (Shell, InventoryView, LeadsView, AnswerMonitor,
                   VinCitationBreakdown, ui.tsx primitives, charts.tsx, …)
  audit/         ← the free AI-Visibility audit chat tool + ShareCard (forwardable proof)
  Logo.tsx, Nav.tsx, Icon.tsx, Footer.tsx, StructuredData.tsx, ui/Section.tsx, ui/Reveal.tsx

lib/
  dashboard/queries.ts   ← ALL dashboard data fetching (Supabase) — start here
  dashboard/types.ts     ← dashboard types + ENGINES list
  ai-visibility/contract.ts ← shared TS contract mirroring the bot backend schema
  audit/                 ← audit report generator + types
  supabase/              ← server.ts (cookie client) · anon.ts (cached reads) · admin.ts · config.ts
```

---

## 5. Data layer (important)

- **Supabase Postgres.** Dashboard data lives in `dp_*` tables (e.g. `dp_dealers`,
  `dp_visibility`, `dp_pillars`, `dp_vehicles`, `dp_leads`, `dp_demand`,
  `dp_attribution_engine`, `dp_kpis`, …). All reads go through **`lib/dashboard/queries.ts`** —
  that's the one file to learn first.
- **Public demo:** anonymous visitors see a single demo dealer, **Capitol Nissan Infiniti**
  (`DEMO_DEALER_ID = 11111111-1111-1111-1111-111111111111`). `requireDealer()` resolves the
  signed-in dealer or falls back to the demo. RLS scopes anon reads to the demo dealer.
- **Caching (perf):** static demo reads are wrapped in `unstable_cache` (300s) using a
  **cookie-free anon client** (`lib/supabase/anon.ts`) via the `demoRead()` helper in
  `queries.ts`. This is why section navigation is fast. ⚠️ **This caches by a static key and
  is only safe while the dashboard is demo-only — re-key by dealer id before real multi-tenant
  auth ships.** Auth (`requireDealer`) and the agent-config write stay live (cookies).

---

## 6. The flagship: AI Visibility + the bot backend

The AI Visibility page (`app/dashboard/visibility/page.tsx`) is the product's core and is
**fully built** to the strategy doc:
- **Inventory Citation Rate** hero (% of live VINs cited), AVTS demoted to a secondary badge.
- **`VinCitationBreakdown.tsx`** — per-VIN drill-down: per-engine dots + expandable
  per-query detail (who AI names instead).
- **Forwardable shock card** (`components/audit/ShareCard.tsx` → `ShareProof`) — exportable
  PNG of "AI named a rival, not you." Used on this page AND in the marketing audit.
- **Inventory-grounded AVTS** — the five pillars carry live feed evidence (citation rate,
  schema coverage, feed-sync freshness).

**Bot backend seam:** a separate team (2 devs) is building bots that run buyer queries across
engines and write to Postgres tables `ai_visibility_scans / _runs / _results`. The contract
is **`lib/ai-visibility/contract.ts`** (keep it in sync with them). When their data is ready,
set `AI_MONITOR_LIVE="true"` and `getVisibilityMonitor()` reads live data instead of demo —
**zero UI changes**. They POST to `/api/visibility/ingest` (auth via `LOTPILOT_INGEST_KEY`).

> ⚠️ **Engine-count inconsistency to be aware of:** `lib/dashboard/types.ts` `ENGINES` has 7
> engines; some inventory/citation UI still says "/5". Harmless but worth unifying.

---

## 7. Brand & design system

LotPilot has its **own** identity (do not reuse Lodgient's cream/emerald/brass):
- **Colors** (tokens in `app/globals.css` `@theme`): canvas `#f6f8fb`, ink `#0f1722`,
  **cyan `#2563eb`** (primary), accent/sky `#0ea5e9`, violet `#6366f1`, plus `danger/warn`.
  Use the tokens (`text-ink`, `bg-cyan`, `border-line`, …), not raw hex, where possible.
- **Fonts:** Inter = `font-sans` (`--font-geist-sans`), Sora = `font-serif` / `.font-display`
  (`--font-instrument`), Geist Mono = `font-mono`.
- **Logo:** `components/Logo.tsx` — blue gradient tile + white navigation glyph (inline SVG).
- **Dashboard table convention** (just established — match it): tinted **uppercase** header
  band (`bg-canvas-2/50 text-[11px] uppercase tracking-[0.07em]`), subtle zebra rows
  (`i % 2 === 1 && "bg-black/[0.015]"`), branded cyan row-hover. See `InventoryView.tsx` /
  `demand/page.tsx` for the pattern.
- Dashboard UI primitives live in `components/dashboard/ui.tsx` (`Card`, `PanelHeading`,
  `Badge`, `StatCard`) and `charts.tsx` (`Sparkline`, `LineChart`, `Donut`, `ProgressBar`).

---

## 8. Conventions & gotchas (learned the hard way)

- **Always typecheck before committing:** `npx tsc --noEmit; echo "EXIT=$?"` and confirm
  `EXIT=0`. (Piping `tsc` through `head` hides the exit code and has shipped breakage before.)
- **`Edit` requires a prior `Read`** of the file in the same session.
- **Pushing to `main` deploys to production.** Verify after deploy.
- **Screenshot QA:** marketing sections use scroll-reveal (`ui/Reveal`) which renders blank
  under headless Chrome + reduced-motion — verify those **functionally** (check `innerText`),
  not visually. Dashboard pages render fine in headless. Lenis smooth-scroll breaks
  `window.scrollTo` in puppeteer — emulate `prefers-reduced-motion: reduce` to disable it.
- **Mobile:** the marketing `<main>` uses `overflow-x-clip` to contain decorative glow bleed —
  keep new full-bleed decorations inside an `overflow-hidden`/clipped parent or you'll
  reintroduce horizontal scroll on phones.
- **No external logo CDNs** for OEM badges (they render broken) — use the shield+text pill
  pattern in `Shell.tsx`.
- Commit style: clear `type(scope): summary` messages.

---

## 9. Current state (what's done)

**Marketing site:** Hero, Problem, free Audit (chat tool, no signup), Product showcase
(tabbed gallery), How-it-works, Discovery, Conversion, Comparison (winner-column table),
Proof, Feed-connect, Inevitable, two-tier Pricing, Final CTA. Mobile-optimized. Premium
floating nav.

**Pricing model (keep consistent everywhere):** **AI Visibility $399/mo** (founding, locked
for life; standard $599) **+ AI Sales Agent $699/mo** = **$1,098 all-in**. Flat, no per-lead.

**Dashboard:** all pages built and design-lifted — Command Center, **AI Visibility (flagship,
complete)**, Inventory AI, Demand Intelligence, Leads & Conversations. Perf: `loading.tsx`
skeleton + cached demo reads (sub-second navigation).

---

## 10. Open items / good places to start

- **AI Sales Assistant** (`/dashboard/assistant`) and **ROI & Attribution** (`/dashboard/roi`)
  — last two pages still due for the design-lift pass (match the table/card conventions in §7).
- **Marketing "audit your rival" hook** — the audit already exports a shock image; add a
  post-report CTA to audit a competitor's site (viral loop).
- **Unify engine count** (5 vs 7, §6).
- **Re-key the demo cache by dealer id** before multi-tenant auth (§5).
- When the bot backend lands: wire `AI_MONITOR_LIVE`, validate against `contract.ts`.
- Point a real domain at the Vercel deployment.

---

## 11. Working together

Duncan is committing to `main` frequently (auto-deploys). To avoid stepping on each other:

- **Create a feature branch** for your work: `git checkout -b helmy/<thing>`; open a PR into
  `main`. Don't push straight to `main`.
- Pull `main` often. The hot files right now are `app/dashboard/visibility/page.tsx`,
  `lib/dashboard/queries.ts`, and `components/sections/*` — coordinate before large refactors.
- Keep `lib/ai-visibility/contract.ts` aligned with the bot team.

Questions → Duncan. The two most useful files to read first: **`lib/dashboard/queries.ts`**
and **`app/dashboard/visibility/page.tsx`**.
