// lib/audit/generateReport.ts
//
// THE AI-VISIBILITY AUDIT ENGINE (demo mode).
//
// This is a STANDALONE module — it has no React/DOM dependencies — so it can be
// imported by the website UI *and* by an outbound script that bulk-generates
// personalized "here's your AI result" reports for cold email:
//
//   import { generateReport } from "@/lib/audit/generateReport";
//   const report = generateReport("https://smithford.com", "Austin, TX");
//
// DEMO MODE GUARDRAILS (see CLAUDE CODE BRIEF §4):
//  - Output is deterministic for a given (url, city): same input → same report.
//  - It is REPRESENTATIVE, never a claim about a real dealer's live data.
//  - It only ever names broad marketplaces / aggregators (Carvana, CarGurus,
//    Cars.com, AutoTrader, Edmunds) or an anonymized "a competing dealer in
//    {city}" as the AI's pick — never a specific named real competitor as
//    "winning". Live mode (/api/audit/run) is where real, named results belong.

import type {
  AuditReport,
  EngineName,
  EngineQueryResult,
  PillarScore,
  RecommendedSource,
} from "./types";

/* ----------------------------- deterministic RNG ----------------------------- */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, deterministic PRNG seeded from a 32-bit int. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------- helpers --------------------------------- */

const ENGINES: EngineName[] = [
  "ChatGPT",
  "Perplexity",
  "Gemini",
  "Grok",
  "Claude",
  "Google AI Overviews",
  "Bing Copilot",
];

const MAKES = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Nissan",
  "Hyundai",
  "Kia",
  "Subaru",
  "Jeep",
  "Volkswagen",
] as const;

const MARKETPLACES: RecommendedSource[] = [
  { name: "Carvana", type: "marketplace" },
  { name: "CarGurus", type: "marketplace" },
  { name: "Cars.com", type: "marketplace" },
  { name: "AutoTrader", type: "marketplace" },
  { name: "TrueCar", type: "marketplace" },
];

const EDITORIAL: RecommendedSource[] = [
  { name: "Edmunds", type: "editorial" },
  { name: "Kelley Blue Book", type: "editorial" },
  { name: "U.S. News Best Cars", type: "editorial" },
];

function cleanCity(city: string): string {
  const c = (city || "").trim();
  return c.length ? c : "your metro";
}

function domainFrom(url: string): string {
  let u = (url || "").trim().toLowerCase();
  u = u.replace(/^https?:\/\//, "").replace(/^www\./, "");
  u = u.split("/")[0] || u;
  return u || "your-dealership.com";
}

/** Best-effort guess of the store's primary franchise from its domain text. */
function guessMake(domain: string, rand: () => number): string {
  const hit = MAKES.find((m) => domain.includes(m.toLowerCase()));
  if (hit) return hit;
  return MAKES[Math.floor(rand() * MAKES.length)];
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** Pick `n` distinct items from arr (stable for a given rand stream). */
function sample<T>(arr: T[], n: number, rand: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return out;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/* ----------------------------- query templates ----------------------------- */

function buildQueries(city: string, make: string): string[] {
  return [
    `best used SUV under $30k near ${city}`,
    `most reliable used truck near ${city}`,
    `certified ${make} for sale near ${city}`,
    `cheapest hybrid with Apple CarPlay near ${city}`,
    `family SUV with third row near ${city} under $35k`,
  ];
}

/* ------------------------------ pillar scoring ------------------------------ */

function buildPillars(rand: () => number): PillarScore[] {
  // Demo reports skew low — that's the point (the gut-punch). Each pillar gets
  // a representative-but-weak score with a tailored insight.
  const crawl = clamp(18 + Math.floor(rand() * 34), 8, 62);
  const schema = clamp(10 + Math.floor(rand() * 30), 4, 54);
  const fresh = clamp(26 + Math.floor(rand() * 40), 12, 74);
  const cite = clamp(6 + Math.floor(rand() * 24), 2, 40);
  const entity = clamp(22 + Math.floor(rand() * 38), 10, 66);

  return [
    {
      key: "crawlability",
      label: "Crawlability",
      score: crawl,
      insight:
        crawl < 35
          ? "AI crawlers are blocked or stalled on your vehicle detail pages."
          : "AI crawlers reach some pages, but inventory loads after they leave.",
    },
    {
      key: "structuredData",
      label: "Structured-data fidelity",
      score: schema,
      insight:
        schema < 30
          ? "No machine-readable Vehicle schema — AI can't read price, trim or VIN."
          : "Partial schema present; key vehicle fields are missing or stale.",
    },
    {
      key: "freshness",
      label: "Freshness",
      score: fresh,
      insight:
        fresh < 45
          ? "Your live inventory updates aren't reaching the sources AI reads."
          : "Inventory changes propagate slowly — sold units still show as available.",
    },
    {
      key: "citationPresence",
      label: "Citation presence",
      score: cite,
      insight:
        "Your store is rarely cited as a source in AI answers for your market.",
    },
    {
      key: "entityConsistency",
      label: "Entity consistency",
      score: entity,
      insight:
        entity < 40
          ? "Name, address and inventory don't line up across the web — AI can't trust the entity."
          : "Minor NAP and listing mismatches dilute how confidently AI cites you.",
    },
  ];
}

/* ------------------------------ engine results ------------------------------ */

function buildEngineResults(
  city: string,
  queries: string[],
  rand: () => number,
  dealerName: string,
): EngineQueryResult[] {
  return ENGINES.map((engine, i) => {
    const query = queries[i % queries.length];

    // Demo mode: dealer is almost always absent (representative of an
    // un-optimized store). Occasionally let one engine surface the dealer to
    // keep it believable rather than uniformly bleak.
    const dealerPresent = rand() < 0.12;

    const competitor: RecommendedSource = {
      name: `A competing dealer in ${city}`,
      type: "competitor",
    };

    const recommended: RecommendedSource[] = [
      ...sample(MARKETPLACES, 2, rand),
      rand() < 0.6 ? competitor : pick(EDITORIAL, rand),
    ];

    // When the dealer surfaced, list them at the top of what the AI cited — so
    // the "You appeared" badge agrees with the recommended list below it.
    if (dealerPresent) {
      recommended.unshift({ name: dealerName, type: "dealer" });
    }

    return { engine, query, recommended, dealerPresent };
  });
}

/* --------------------------------- main API --------------------------------- */

/**
 * Generate a deterministic, representative AI-Visibility Audit report.
 *
 * @param url   Dealership website URL (any format).
 * @param city  City / metro, e.g. "Austin, TX".
 * @param dealershipName  Optional display name for the report header.
 */
export function generateReport(
  url: string,
  city: string,
  dealershipName?: string,
): AuditReport {
  const domain = domainFrom(url);
  const niceCity = cleanCity(city);
  const seed = hashString(`${domain}::${niceCity.toLowerCase()}`);
  const rand = mulberry32(seed);

  const makeGuess = guessMake(domain, rand);
  const queries = buildQueries(niceCity, makeGuess);
  const pillars = buildPillars(rand);
  const engines = buildEngineResults(niceCity, queries, rand, dealershipName?.trim() || "Your store");

  // Overall score = weighted blend of pillars, nudged toward the low band.
  const weights: Record<string, number> = {
    crawlability: 0.24,
    structuredData: 0.26,
    freshness: 0.16,
    citationPresence: 0.22,
    entityConsistency: 0.12,
  };
  const weighted = pillars.reduce(
    (acc, p) => acc + p.score * (weights[p.key] ?? 0.2),
    0,
  );
  const score = clamp(Math.round(weighted), 6, 72);

  const scoreBand: AuditReport["scoreBand"] =
    score < 25 ? "critical" : score < 45 ? "weak" : score < 65 ? "developing" : "strong";

  const dealerHits = engines.filter((e) => e.dealerPresent).length;
  const matchingCarsMissed = 9 + Math.floor(rand() * 40); // representative range

  const gaps = [
    "AI crawlers can't fully read your vehicle detail pages.",
    "No machine-readable Vehicle schema on your listings (price, trim, VIN, availability).",
    `No AI-answer pages targeting how buyers shop in ${niceCity}.`,
    "Your inventory isn't present in the third-party sources AI cites.",
    "Inventory freshness signals (sold / price drops) aren't reaching answer engines.",
  ];

  return {
    url: domain,
    city: niceCity,
    dealershipName: dealershipName?.trim() || undefined,
    makeGuess,
    score,
    scoreBand,
    pillars,
    engines,
    matchingCarsMissed,
    gaps,
    mode: "demo",
    generatedAt: new Date().toISOString(),
    queryCount: engines.length,
    dealerHits,
  };
}

export default generateReport;
