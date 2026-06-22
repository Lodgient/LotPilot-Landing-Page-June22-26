# LotPilot AI-Visibility Engine — Build Spec

**Audience:** engineering. **Status:** the dashboard exists and renders; the engine that produces its numbers does **not** exist yet. Today every metric is seeded demo data (note the `Demo data` badge). This document is how we make it real.

**One-sentence framing:** the dashboard is a *viewer*. The product is a **worker service** that (1) measures how "answer-engine-ready" each VIN's page is, (2) probes the real AI engines to see whether that VIN actually gets cited, (3) attributes leads back to AI, and (4) POSTs the results into the endpoints we already built. Flip it on and the `Demo data` badge comes off.

---

## 0. The two mental shifts (read this first)

1. **It's prompts, not keywords.** Nobody "ranks for `used prius san jose`" in ChatGPT. Buyers *ask* "what's a reliable hybrid under $16k near San Jose?" We track a **set of buyer questions** per dealer, not a keyword list. Our "keyword research" is **prompt-set generation**.

2. **Every metric is one of two fundamentally different kinds.** Conflating them is what makes this feel impossible:

   | Kind | What it is | How we get it | Truth level |
   |------|-----------|---------------|-------------|
   | **A. Page readiness** | Is this VIN's page structured so an AI *can* cite it? | We **fetch the page and check facts** (schema, indexability, freshness) | 100% deterministic, real today |
   | **B. Engine visibility** | Does the VIN *actually* get cited in ChatGPT/Perplexity/etc.? | We **probe the engines** with the prompt set and parse citations | Real but **sampled / probabilistic** |

   Half A is most of the `AI score` and **all** of the `Top fix` column — and it's easy. Half B is the part that feels like magic; it isn't, it's just scheduled API calls + citation parsing.

---

## 1. System architecture

```
                          ┌─────────────────────────────────────────────┐
                          │              VISIBILITY ENGINE                │
                          │            (new worker service)               │
   inventory feed ──────► │                                               │
   (vAuto/HomeNet/CSV)    │  1. Feed normalizer  ──► dp_vehicles (facts)  │
                          │                                               │
                          │  2. Page-Readiness Crawler  (Half A)          │
                          │       fetch VIN page → schema/index/freshness │
                          │                                               │
                          │  3. Prompt-Probe Runner     (Half B)          │
                          │       prompt set × {ChatGPT,Perplexity,...}   │
                          │       → parse citations → "cited? by whom?"   │
                          │                                               │
                          │  4. Attribution collector                     │
                          │       referral events + lead form ties        │
                          │                                               │
                          │  5. Scorer: facts → aiScore/enginesCiting/... │
                          └───────────────┬───────────────────────────────┘
                                          │  POST (x-lotpilot-key)
                                          ▼
        ┌──────────────────────────────────────────────────────────┐
        │  EXISTING Next.js app (already built — DO NOT rebuild)     │
        │   POST /api/feed/ingest        → upsert inventory facts    │
        │   POST /api/visibility/ingest  → upsert AI metrics         │
        │        ↓ writes dp_vehicles (service role)                 │
        │   /dashboard/*  reads dp_vehicles and renders              │
        └──────────────────────────────────────────────────────────┘
```

**Key point for the team:** the app side is done. You are building the worker that calls `/api/visibility/ingest`. You never touch the dashboard UI. The contract between them is frozen and documented in §6.

**Where the worker runs:** a **standalone Node/TS service** (Railway / Fly / Cloud Run / a small VM), **not** Vercel functions. Probing N dealers × M prompts × 5 engines with retries and rate limits is long-running and will blow Vercel's execution limits. Use a job queue (BullMQ+Redis, or a Postgres-backed queue). Trigger on a cron (see §7).

---

## 2. Component 1 — Page-Readiness Crawler (Half A) ★ build this first

This is the highest-ROI, lowest-risk piece. It's deterministic, cheap, and it alone replaces a big chunk of demo data honestly. It powers `aiScore` (the page side), `blocker`, and the `Top fix` column.

**Input:** each VIN's published page URL (we already store it — `dp_vehicles.live_url`, e.g. `https://lotpilot.com/inventory/capitol-nissan-infiniti-san-jose-california/2017-toyota-prius-...`).

**What it does:** `fetch()` the page HTML and run a checklist. Each check is true/false with a weight. Every check maps to a human-readable fix string.

### The checklist (this is the actual rubric)

| # | Check | How to verify | Weight | Fix string if failing |
|---|-------|---------------|--------|----------------------|
| 1 | **Indexable** | No `noindex` in `<meta robots>` or `X-Robots-Tag`; `robots.txt` allows path | 15 | "Page blocked from indexing" |
| 2 | **Server-rendered** | Core content present in raw HTML (not injected by JS only) | 10 | "Content not in HTML (JS-only)" |
| 3 | **Valid `Vehicle`/`Car` JSON-LD** | `<script type="application/ld+json">` parses and `@type` ∈ {Vehicle, Car, Product} | 20 | "Missing vehicle structured data" |
| 4 | **Required schema fields** | JSON-LD has `name, brand, model, vehicleIdentificationNumber, mileageFromOdometer, offers{price, priceCurrency, availability, itemCondition}` | 15 | "Incomplete schema (missing price/VIN/availability)" |
| 5 | **Price freshness** | Schema `offers.price` == `dp_vehicles.price` from latest feed; `dateModified` within 7 days | 15 | "Stale freshness" |
| 6 | **FAQ content** | `FAQPage` JSON-LD OR ≥3 Q&A blocks answering buyer intents | 10 | "No Q&A content for AI to quote" |
| 7 | **Canonical + single host** | `<link rel=canonical>` self-references, one host (no www/non-www split) | 5 | "Canonical/host mismatch" |
| 8 | **In sitemap + IndexNow** | URL present in `/sitemap.xml`; submitted via IndexNow ping | 5 | "Not in sitemap / not pinged" |
| 9 | **Performance** | TTFB + HTML weight under threshold (proxy for Core Web Vitals) | 5 | "Slow page" |

`pageReadiness` (0–100) = sum of weights of passing checks. `blocker` / `Top fix` = the fix string of the **highest-weight failing** check (or `"Fully optimized"` if all pass — exactly what the UI shows now).

### Reference implementation

```ts
// engine/crawler.ts
import { load } from "cheerio";

export interface ReadinessResult {
  pageReadiness: number;          // 0–100
  blocker: string;                // "" if fully optimized
  checks: Record<string, boolean>;
}

const CHECKS = [
  { key: "indexable",   weight: 15, fix: "Page blocked from indexing" },
  { key: "ssr",         weight: 10, fix: "Content not in HTML (JS-only)" },
  { key: "schema",      weight: 20, fix: "Missing vehicle structured data" },
  { key: "schemaFull",  weight: 15, fix: "Incomplete schema (price/VIN/availability)" },
  { key: "fresh",       weight: 15, fix: "Stale freshness" },
  { key: "faq",         weight: 10, fix: "No Q&A content for AI to quote" },
  { key: "canonical",   weight: 5,  fix: "Canonical/host mismatch" },
  { key: "sitemap",     weight: 5,  fix: "Not in sitemap / not pinged" },
  { key: "perf",        weight: 5,  fix: "Slow page" },
];

export async function auditPage(url: string, feedPrice: number): Promise<ReadinessResult> {
  const res = await fetch(url, { headers: { "user-agent": "LotPilotBot/1.0" } });
  const html = await res.text();
  const $ = load(html);

  // Parse all JSON-LD blocks
  const blocks: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try { blocks.push(JSON.parse($(el).text())); } catch {}
  });
  const flat = blocks.flatMap(b => (Array.isArray(b) ? b : b["@graph"] ?? [b]));
  const vehicle = flat.find(n => ["Vehicle", "Car", "Product"].includes(n?.["@type"]));
  const offer = vehicle?.offers;

  const checks: Record<string, boolean> = {
    indexable:  !/noindex/i.test($('meta[name="robots"]').attr("content") || "")
                && !/noindex/i.test(res.headers.get("x-robots-tag") || ""),
    ssr:        html.includes(String(feedPrice)) || !!vehicle,   // price visible in raw HTML
    schema:     !!vehicle,
    schemaFull: !!(offer?.price && vehicle?.vehicleIdentificationNumber
                && vehicle?.mileageFromOdometer && offer?.availability && offer?.itemCondition),
    fresh:      Number(offer?.price) === feedPrice
                && daysSince(vehicle?.dateModified) <= 7,
    faq:        flat.some(n => n?.["@type"] === "FAQPage")
                || $('[itemtype*="FAQPage"]').length > 0,
    canonical:  ($('link[rel="canonical"]').attr("href") || "").includes(new URL(url).host),
    sitemap:    true,  // fill in via sitemap fetch + IndexNow ledger
    perf:       html.length < 1_500_000,
  };

  const passed = CHECKS.filter(c => checks[c.key]);
  const pageReadiness = passed.reduce((s, c) => s + c.weight, 0);
  const worstFail = CHECKS.filter(c => !checks[c.key]).sort((a, b) => b.weight - a.weight)[0];

  return { pageReadiness, blocker: worstFail?.fix ?? "", checks };
}

function daysSince(d?: string) {
  if (!d) return 999;
  return (Date.now() - new Date(d).getTime()) / 86_400_000;
}
```

**Note — the moat:** LotPilot doesn't just *measure* this, it **generates the page that passes every check**. The crawler is also our QA on our own page generator. If a generated page scores < 100, that's a bug in generation.

---

## 3. Component 2 — Prompt-Probe Runner (Half B) ★ the part you were confused about

This produces `enginesCiting` (the `●●●●○` dots), `queriesMatched`, `citations[]`, and the citation half of `aiScore`. There is **no ranking API** for AI engines — so we **probe**: send buyer prompts to each engine on a schedule and parse whether our pages get cited.

### 3a. Generate the prompt set (the "keyword research")

Two layers:

- **Dealer-level prompts** (geo + brand + intent): *"best Nissan dealer near San Jose for financing", "certified pre-owned SUV San Jose under $40k", "where to get a KBB instant cash offer in San Jose"*.
- **VIN-level prompts** derived from each vehicle's attributes: `{year} {make} {model}` + intent modifiers (price band, body style, use case, condition, geo). E.g. for the 2017 Prius: *"reliable used hybrid under $16k near San Jose", "cheapest Toyota Prius for commuting Bay Area", "high-mileage Prius worth buying?"*.

Generate via templates, then **expand with an LLM** for natural phrasing. Store a **per-dealer prompt library** and tag each prompt with the VIN(s) it's relevant to (so we can compute per-VIN `queriesMatched`). Dedupe aggressively — many VINs share prompts.

```ts
// engine/prompts.ts
export function vinPrompts(v: Vehicle, metro: string): string[] {
  const city = metro.split(",")[0];
  const band = priceBand(v.price); // "$15k–$20k"
  return [
    `best ${v.make} ${v.model} deals near ${city}`,
    `${v.year} ${v.make} ${v.model} for sale near ${city} — is it a good buy?`,
    `reliable ${bodyToUseCase(v.body)} under ${band.replace(/–.*/, "")} near ${city}`,
    `${v.stockType.toLowerCase()} ${v.make} ${v.model} ${city} with ${Math.round(v.mileage/1000)}k miles`,
  ];
}
```

### 3b. Probe each engine and parse citations

For each `(prompt × engine)` we record: **was our domain cited? at what position? which competitor was cited instead?** "Cited" = a citation URL whose host matches the dealer's page host (best: path contains the VIN slug), or the dealer name/VIN appears in the answer text.

**Per-engine reality (model IDs drift — verify current ones):**

| Engine | How to reach it | Citation signal |
|--------|----------------|-----------------|
| **Perplexity** | `POST https://api.perplexity.ai/chat/completions`, model `sonar` / `sonar-pro` | Returns `citations[]` / `search_results[]` (URLs). **Cleanest. Start here.** |
| **ChatGPT** | OpenAI Responses API with `web_search` tool, or `gpt-4o-search-preview` | Returns URL annotations/citations |
| **Gemini** | Gemini API with **Google Search grounding** tool | `groundingMetadata.groundingChunks[].web.uri` — ⚠ these are `vertexaisearch...` redirect URLs; **resolve them** (follow redirect) to get the real domain |
| **Google AI Overviews** | **No API.** SERP scraper: **SerpApi** (`engine=google`, read `ai_overview`) or **DataForSEO** | Cited sources in the AI Overview block |
| **Bing Copilot** | No clean public API. Approximate via Bing grounding, or **defer** (be honest it's partial) | — |

```ts
// engine/probe/perplexity.ts  — start with this one
export async function probePerplexity(prompt: string) {
  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await r.json();
  const answer: string = data.choices?.[0]?.message?.content ?? "";
  const citations: string[] = data.citations ?? data.search_results?.map((s: any) => s.url) ?? [];
  return { answer, citations };
}

// engine/probe/match.ts
export function isCited(citations: string[], answer: string, dealerHost: string, vinSlug: string) {
  const host = (u: string) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return ""; } };
  const urlHit = citations.some(c => host(c) === dealerHost && (c.includes(vinSlug) || true));
  const textHit = answer.toLowerCase().includes(vinSlug.toLowerCase());
  return urlHit || textHit;
}
```

```ts
// engine/probe/openai.ts
import OpenAI from "openai";
const client = new OpenAI();
export async function probeChatGPT(prompt: string) {
  const r = await client.responses.create({
    model: "gpt-4o", tools: [{ type: "web_search" }], input: prompt,
  });
  const text = r.output_text ?? "";
  const citations = (r.output ?? [])
    .flatMap((o: any) => o.content ?? [])
    .flatMap((c: any) => c.annotations ?? [])
    .filter((a: any) => a.type === "url_citation")
    .map((a: any) => a.url);
  return { answer: text, citations };
}
```

```ts
// engine/probe/gemini.ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
export async function probeGemini(prompt: string) {
  const r = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  const gm = r.candidates?.[0]?.groundingMetadata;
  // ⚠ resolve vertexaisearch redirect URLs to real domains before matching
  const rawUris = (gm?.groundingChunks ?? []).map((c: any) => c.web?.uri).filter(Boolean);
  const citations = await Promise.all(rawUris.map(resolveRedirect));
  return { answer: r.text ?? "", citations };
}
async function resolveRedirect(u: string) {
  try { return (await fetch(u, { method: "HEAD", redirect: "follow" })).url; } catch { return u; }
}
```

**Reduce noise (critical):** AI answers are **non-deterministic**. Run each prompt **k times (k≈3)** per engine and record the **citation rate** (e.g. cited 2/3). Store the raw answers + citations for audit. Never present a single run as ground truth.

---

## 4. Component 3 — Attribution ("AI-sourced leads / VDP views")

Powers `aiLeads`, `aiVdpViews`, ROI/Attribution page. Three layers, strongest first.

1. **First-party referral capture (the defensible floor).** A tiny script on every hosted VIN page records `document.referrer`, UTM params, landing URL, and a `sessionId` cookie. When the buyer submits the lead form / starts the AI chat, post the `sessionId` so the lead inherits its source. Classify by referrer host:

   ```ts
   const AI_REFERRERS: Record<string, string> = {
     "chatgpt.com": "ChatGPT", "chat.openai.com": "ChatGPT",
     "perplexity.ai": "Perplexity",
     "gemini.google.com": "Gemini",
     "copilot.microsoft.com": "Bing Copilot",
     "bing.com": "Bing Copilot",      // path/qs heuristics for the chat surface
   };
   function classify(ref: string) {
     try { return AI_REFERRERS[new URL(ref).host.replace(/^www\./,"")] ?? "Other"; }
     catch { return "Direct"; }
   }
   ```
   `aiVdpViews` = sessions on a VIN page with an AI referrer. `aiLeads` = leads whose session was AI-referred.

2. **"How did you hear about us?"** on the lead form (a checkbox option "ChatGPT / AI assistant").
3. **Self-report in chat** — the AI sales assistant logs when a buyer says "ChatGPT told me…".

**Be honest:** much AI influence is **zero-click** (buyer reads the answer, never clicks, later returns via branded search). You cannot fully attribute that. Report referral-based as the measured floor and label any modeled uplift as modeled. Anyone selling "exact AI attribution" is lying.

---

## 5. Component 4 — The Scorer (facts → the exact dashboard fields)

Combine Half A + Half B into the fields the UI reads. Proposed formulas (tune weights with real data):

```ts
// engine/score.ts
function scoreVin(readiness: ReadinessResult, probes: ProbeResult[]) {
  const ENGINES = ["ChatGPT","Perplexity","Gemini","Google AI Overviews","Bing Copilot"];

  // enginesCiting (0–5): engines that cited us in ≥1 relevant prompt
  const citedEngines = new Set(probes.filter(p => p.citedRate > 0).map(p => p.engine));
  const enginesCiting = citedEngines.size;

  // queriesMatched: distinct prompts where we were cited by ≥1 engine
  const queriesMatched = new Set(probes.filter(p => p.citedRate > 0).map(p => p.prompt)).size;

  // citationVisibility (0–100): avg citation rate across engines × prompts
  const citationVisibility = probes.length
    ? Math.round(100 * probes.reduce((s,p)=>s+p.citedRate,0) / probes.length) : 0;

  // aiScore (0–100): page readiness is necessary, citations prove it works.
  const aiScore = Math.round(0.5 * readiness.pageReadiness + 0.5 * citationVisibility);

  // engines{} map for the UI dots
  const engines = Object.fromEntries(ENGINES.map(e => [e, citedEngines.has(e)]));

  // citations[] for the drill-down: per prompt, who we lost to
  const citations = probes.map(p => ({
    query: p.prompt, topSource: p.topCompetitor ?? "—", engines: p.engineMap,
  }));

  return {
    aiScore, enginesCiting, queriesMatched,
    blocker: readiness.blocker, engines, citations,
  };
}
```

- `trend[]` — append today's `aiScore` to a stored history array (keep ~12 points); that's the sparkline.
- KPIs (top cards) are aggregates the dashboard computes from rows: `Inventory AI-visible %` = share of VINs with `aiScore ≥ threshold` (or `enginesCiting ≥ 1`); `Gross sitting dark` = Σ `estGross` of VINs with `enginesCiting = 0`. Confirm exact formulas in `lib/dashboard/queries.ts`, but the **inputs come from the per-VIN fields above**.

---

## 6. Data contract — exactly what to POST (already built, do not change)

Both endpoints live in the Next app, auth via header `x-lotpilot-key: $LOTPILOT_INGEST_KEY`, write with the Supabase **service role**. They `upsert` into `dp_vehicles` on `(dealer_id, vin)`.

### `POST /api/visibility/ingest`
```jsonc
{
  "dealerId": "11111111-1111-1111-1111-111111111111",
  "source": "lotpilot-engine",
  "vehicles": [
    {
      "vin": "JTDKARFU5H3534500",        // REQUIRED — upsert key
      "aiScore": 86,                       // 0–100  (from scorer)
      "enginesCiting": 5,                  // 0–5    (the dots)
      "queriesMatched": 12,
      "aiLeads": 6,
      "aiVdpViews": 240,
      "blocker": "",                       // "" => "Fully optimized"; else => Top fix
      "trend": [70,72,75,78,80,83,86],     // sparkline history
      "engines": { "ChatGPT": true, "Perplexity": true, "Gemini": true,
                   "Google AI Overviews": true, "Bing Copilot": false },
      "citations": [
        { "query": "reliable hybrid under $16k near San Jose",
          "topSource": "lotpilot.com", "engines": { "Perplexity": true, "ChatGPT": true } }
      ]
      // optional: may also carry inventory facts (year, make, price, liveUrl, ...) in same call
    }
  ]
}
```
Returns `{ ok: true, upserted: N }`. Until `LOTPILOT_INGEST_KEY` + `SUPABASE_SERVICE_ROLE_KEY` are set it returns **501** (that's the current state).

### `POST /api/feed/ingest` (inventory facts + canonical page URL)
```jsonc
{
  "dealerId": "…", "feedType": "vAuto", "source": "feed",
  "vehicles": [
    { "vin": "…", "year": 2017, "make": "Toyota", "model": "Prius", "trim": "",
      "body": "5D Hatchback", "stockType": "Used", "price": 15995, "mileage": 129474,
      "daysOnLot": 16, "estGross": 1800,
      "liveUrl": "https://lotpilot.com/inventory/…", "liveImage": "https://…" }
  ]
}
```

**Field → DB mapping** (from the route source): `stockType→stock_type`, `daysOnLot→days_on_lot`, `estGross→est_gross`, `aiScore→ai_score`, `enginesCiting→engines_citing`, `queriesMatched→queries_matched`, `aiLeads→ai_leads`, `aiVdpViews→ai_vdp_views`, `liveUrl→live_url`, `liveImage→live_image`; `trend`, `engines`, `citations`, `blocker` map by name. Every run is logged to `dp_ingest_runs`.

---

## 7. Scheduling, infra, cost

**Cadence (per dealer):**
- Feed sync: as the dealer's feed updates (hourly–daily).
- Page-readiness crawl: **daily**, plus immediately after any page (re)generation.
- Prompt probing: **daily** for the core prompt set; sample the long tail weekly. Don't probe every VIN-prompt every day — dedupe to the dealer's unique prompt set (~30–60 prompts), each × 5 engines × k=3 runs.
- Attribution rollup: continuous (event stream) + nightly aggregate.

**Infra:** standalone worker + queue (BullMQ/Redis or pg-boss). Per job: crawl → probe → score → POST. Idempotent, retried, rate-limit-aware (per-engine token buckets). Persist **raw** probe responses (cheap object storage) for audit/debugging and to recompute scores when we change the formula.

**Cost ballpark (order of magnitude, per dealer/day):** ~40 prompts × 5 engines × 3 runs ≈ 600 calls. Perplexity/OpenAI/Gemini grounded calls are cents each; SerpApi AI-Overview lookups are the priciest (~$ per search). Expect **low single-digit dollars/dealer/day** — control it by sampling cadence and caching. This is the main variable cost of the product; budget it per pricing tier.

**Secrets:** `PERPLEXITY_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `SERPAPI_KEY` (or DataForSEO), `LOTPILOT_INGEST_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. None committed.

---

## 8. Honest limitations (put these in front of dealers — it builds trust)

- **Non-determinism & personalization:** AI answers vary by run, user, location. We measure *propensity to be cited*, sampled over k runs — not the exact thing one buyer saw. Report rates, not absolutes.
- **AI Overviews have no API:** we depend on SERP scrapers that can break when Google changes layout. Build the AI-Overview probe behind an interface so the provider is swappable.
- **Bing Copilot** has no clean citation API — mark it partial/estimated, don't fake precision.
- **Zero-click attribution gap:** referral capture is the measured floor; the rest is modeled and must be labeled as modeled.
- **Model drift:** model IDs and citation formats change monthly. Pin versions, alert on parse-rate drops, keep raw responses.

---

## 9. Phased build plan

**Phase 0 — turn it on (days, not weeks).** Set `LOTPILOT_INGEST_KEY` + `SUPABASE_SERVICE_ROLE_KEY` in the Next app. Confirm feed normalizer POSTs real inventory to `/api/feed/ingest`. *(Inventory facts already real for the pilot dealer.)*

**Phase 1 — Page-Readiness Crawler (Half A).** Build §2. Output real `aiScore` (page side), `blocker`, `Top fix` for the pilot dealer. **This alone makes most of the screen honest.** Also doubles as QA on our page generator.

**Phase 2 — Perplexity probe.** Build §3 for Perplexity only (cleanest citations). Real `enginesCiting`/`queriesMatched`/`citations` for one engine. Prove one VIN end-to-end: demo → genuinely measured.

**Phase 3 — add ChatGPT + Gemini**, then **AI Overviews (SerpApi)**. Now the 5 dots are real.

**Phase 4 — Attribution.** Ship the referral script + lead-form `sessionId` tie-in → real `aiLeads`/`aiVdpViews` and the ROI page.

**Phase 5 — Demand Intelligence & Benchmarks.** Aggregate prompt coverage across the prompt library → "5 cars match real demand but AI never shows them," gaps, peer benchmarks.

**Definition of done:** the `Demo data` badge is removed only when a dealer's every visible number traces to a stored crawl/probe/attribution record with a timestamp.

---

## 10. First three tickets (start Monday)

1. **`engine` service skeleton** — repo, queue, cron, secrets, a `runDealer(dealerId)` that loads VINs from `dp_vehicles`, no-ops, and POSTs an empty result to `/api/visibility/ingest` (proves the loop + auth).
2. **Page-Readiness Crawler v1** — §2 checklist against the pilot dealer's 20 live URLs; POST real `aiScore`/`blocker`. Compare against the current demo values on screen.
3. **Perplexity probe v1** — §3 prompt set for the pilot dealer; POST real `enginesCiting`/`citations` for Perplexity. Demo one VIN flipping to measured on a call.

---

*The category is real and proven at brand level (Profound, Otterly.ai, Peec, Scrunch, BrandLight). Our wedge is doing it **per-VIN for dealers** — which nobody does. The dashboard already proves the vision; this engine is the 4 weeks of work that makes it true.*
