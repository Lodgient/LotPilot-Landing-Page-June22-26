# LotPilot for Dealers — dealers.lotpilot.com

B2B sales + showcase site for LotPilot. One job: convert a car dealer to
(a) run the free **AI-Visibility Audit** (lead capture), and (b) connect their
inventory feed / book a demo.

> This is **not** the consumer inventory site (that's `lotpilot.com`). We link
> to it; we never rebuild it here.

## Positioning

**Your inventory, recommended by AI. Your leads, worked by AI. You just send the feed.**

- **Discovery layer** — get found by buyers asking AI which car to buy.
- **Conversion layer** — AI agents work every lead: qualify, take credit apps, book the deal.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (design tokens in `app/globals.css` via `@theme`)
- Framer Motion

## The centerpiece — AI-Visibility Audit

The primary conversion mechanism. Full interactive UI; backend is stubbed.

- **UI:** `components/audit/AuditTool.tsx` (input → animated scan → score report → email gate).
- **Engine module:** `lib/audit/generateReport.ts` exports `generateReport(url, city, name?)`.
  - Pure, dependency-free, **deterministic** (same input → same report).
  - Reusable from a script for **bulk cold-outbound** personalized reports — not just the website UI.
  - Demo output is **representative**, never a claim about a real dealer; it only
    ever names broad marketplaces/aggregators (or an anonymized "a competing
    dealer in {city}") as the AI's pick.

### Two modes (`NEXT_PUBLIC_AUDIT_MODE`)

| Mode             | Behavior                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `demo` (default) | Instant, no backend. `generateReport()` produces a deterministic sample so the page always shows something.   |
| `live`           | POSTs to `/api/audit/run`. **Wire the real crawl + multi-engine query pipeline there** (`// TODO: wire backend`). |

Set `NEXT_PUBLIC_AUDIT_MODE=live` to switch the tool to the live endpoint.

## Lead capture (stubbed API routes — `// TODO: wire backend`)

- `POST /api/audit-lead` — the audit email gate (email + dealership name). **This is the lead.**
- `POST /api/lead` — "Connect your inventory feed" form.
- `POST /api/audit/run` — live-mode audit run.

All forms are controlled React (no native `<form>` submit, no localStorage).

## GEO / AI discoverability (we eat our own dog food)

- JSON-LD (`Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Service`,
  `FAQPage`) is emitted **statically, server-side** in `components/StructuredData.tsx`
  (rendered from `app/layout.tsx` `<head>`) — present in the initial HTML, not
  hydration-only. Verify with a no-JS / curl view.
- `public/robots.txt` allows all major AI crawlers; `public/llms.txt`;
  `app/sitemap.ts` → `/sitemap.xml`. Canonical + OG/Twitter in metadata.
- Single host (`https://dealers.lotpilot.com`); canonical, sitemap and schema all agree.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Deploy (Vercel)

- Team slug: `revamply`
- Production domain: `dealers.lotpilot.com` (single host — no www/non-www split)
- Env: `NEXT_PUBLIC_AUDIT_MODE` (`demo` | `live`)

## Guardrails honored

No invented metrics, testimonials, dealer names (beyond the two pilots —
Capitol Nissan Infiniti, Unique Drive — shown as labeled placeholders) or
pricing. "All the dealer does is send the feed" is kept front and center.
