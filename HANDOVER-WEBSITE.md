# LotPilot — Marketing Website · Handover

The public marketing site (`lot-pilot-landing-page-june22-26.vercel.app`, future
`dealers.lotpilot.com`). Its one job: turn a dealer who saw an ad into a free-audit
lead and then a self-serve signup — **no humans, no "book a demo."**

> Companion doc: **`HANDOVER-DASHBOARD.md`** (the dealer dashboard / app). Shared basics
> (repo, deploy, conventions) are repeated here so this stands alone.

---

## 1. Repo, stack, deploy
- **Repo:** `github.com/Lodgient/LotPilot-Landing-Page-June22-26` · branch `main`
- **Local:** `~/Documents/LotPilot-Landing-Page-June22-26`
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4
  (`@theme` tokens in `app/globals.css`) · Framer Motion · Lenis smooth-scroll
- **Deploy:** Vercel, **auto-deploys on push to `main`**
- **Run:** `npm i` → `npm run dev`; **always** `npx tsc --noEmit && npm run build` before
  committing (chain with `&&`, never `;` — a masked exit code has shipped breakage).

## 2. Brand — "Editorial Tech-Lux"
Warm paper-white canvas + **crisp white cards** + **electric blue** (`--color-cyan #2563eb`)
+ **Fraunces** serif for display moments + **Inter** for body. Tokens in `app/globals.css`
`@theme`; fonts wired in `app/layout.tsx`. Serif is used only for headlines / hero numbers;
Inter for everything else. **Never** the Lodgient cream/emerald/brass/Cormorant skin.

## 3. Page structure
`app/page.tsx` composes the sections in this order:
`Hero → Problem → AuditSection → ProductShowcase → HowItWorks → Discovery → Conversion →
Comparison → Proof → FeedConnect → Inevitable → Pricing → FinalCTA`, wrapped by `Nav` +
`Footer`. The `<main>` has `overflow-x-clip` (contains decorative glow bleed → no mobile
horizontal scroll).

- **Sections:** `components/sections/*` — each is self-contained. `Comparison` (winner-column
  table), `Pricing` (two-tier), and `ShowcaseGallery` (tabbed product screenshots in
  `ProductShowcase`) got the most design work; the rest inherit the design system.
- **Chrome:** `components/Nav.tsx` (premium floating glass bar + mobile drawer),
  `components/Footer.tsx`, `components/Logo.tsx` (blue tile + white navigation glyph).
- **Note:** most sections animate in via `whileInView` — they render fine for real users but
  are blank to headless screenshot tools (verify those functionally / on a real device).

## 4. The free AI-Visibility Audit (the wedge + viral loop)
- **UI:** `components/audit/AuditTool.tsx` — a chat tool; paste a website + city, it runs a
  scan animation and shows a scored report (`ScoreRing`, `PillarBars`, `EngineRow`).
- **Report data:** `lib/audit/generateReport.ts` is **deterministic demo data** (representative
  of an un-optimized store; never a real claim). `app/api/audit/run` returns it with
  `mode:"demo"`. **TODO (real backend):** replace with the live crawl + multi-engine query
  pipeline (the bot team).
- **Viral loop (built + wired):** `components/audit/ShareCard.tsx` exports `ShareProof` — a
  forwardable PNG of "AI named a rival, not you," plus an **"Audit a competitor"** hook. Both
  render inside the audit report.
- **Lead capture:** the audit email-gate posts to `app/api/audit-lead/route.ts`.

## 5. Conversion funnel & CTAs
Hero "Run the free check" → audit → `FeedConnect` (conversational `components/forms/FeedForm.tsx`)
→ `Pricing` → **signup/checkout**. Pricing model (keep consistent **everywhere**):
**AI Visibility $399/mo + AI Sales Agent $699/mo = $1,098 all-in** (founding, flat, no per-lead).
- The Pricing "Start AI Visibility" CTA is `components/CheckoutButton.tsx` → routes anon users
  to `/signup?plan=visibility` and signed-in users to checkout (see dashboard doc for the
  pay→provision pipeline).

## 6. Leads (they persist now)
`/api/lead` (feed form) and `/api/audit-lead` (audit) both **insert into `lp_marketing_leads`**
(Supabase, anon INSERT-only RLS — PII never readable client-side), then fire a **Slack ping**
and a **dealer confirmation email** (`lib/notify.ts`, env-gated). Verified end-to-end.

## 7. SEO / AI-discoverability (strong)
`public/robots.txt` (allows GPTBot/ClaudeBot/PerplexityBot/Googlebot/…), `app/sitemap.ts`,
`public/llms.txt`, `components/StructuredData.tsx` (Organization/WebSite/Service/FAQ JSON-LD),
`app/opengraph-image.tsx` (dynamic OG), full metadata + Twitter cards in `app/layout.tsx`.

## 8. Legal, analytics, errors
- **Legal:** `/privacy`, `/terms`, `/security` (`components/LegalPage.tsx`) + footer links.
  ⚠️ Standard B2B copy — **have counsel review** before scale.
- **Analytics:** `@vercel/analytics` (auto pageviews) + a `checkout_started` event. **Enable
  Analytics in the Vercel project** to start collecting.
- **Errors:** `app/error.tsx` (reports to `/api/log` → Slack) + `app/not-found.tsx`.

## 9. Env vars (website-relevant)
All no-op gracefully until set.

| Var | For |
|---|---|
| `SLACK_WEBHOOK_URL` | new-lead pings + error alerts |
| `RESEND_API_KEY` / `EMAIL_FROM` | lead confirmation / audit-result emails |
| `ANTHROPIC_API_KEY` | the audit chat copilot (`/api/assistant`) — has a deterministic fallback |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | lead writes (public fallback exists) |

## 10. Open items (website)
- Replace the **demo audit** with the real crawl + query backend (bot team).
- **Per-page OG images** for `/demo`, `/how-it-works`, `/plan`.
- **Testimonials / case-study** section for trust.
- Counsel review of `/privacy /terms /security`.
- Point a **real domain** at the Vercel deployment.
- Design-polish the mid-page sections (Problem/Discovery/Conversion/Proof) — they inherit the
  system but weren't individually elevated (hard to QA headlessly; do on a real device).

## 11. Working together
Branch + PR into `main` (don't push straight to `main`); pull often. Hot files:
`components/sections/*`, `app/page.tsx`, `components/audit/*`.
