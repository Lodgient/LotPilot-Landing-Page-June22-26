// lib/audit/types.ts
// Shared types for the AI-Visibility Audit engine.

export type AuditMode = "demo" | "live";

export type EngineName =
  | "ChatGPT"
  | "Perplexity"
  | "Gemini"
  | "Grok"
  | "Claude"
  | "Google AI Overviews"
  | "Bing Copilot";

/** The five AVTS pillars that compose the AI Visibility Score. */
export type PillarKey =
  | "crawlability"
  | "structuredData"
  | "freshness"
  | "citationPresence"
  | "entityConsistency";

export interface PillarScore {
  key: PillarKey;
  label: string;
  /** 0–100 */
  score: number;
  /** One-line plain-English read on this pillar. */
  insight: string;
}

export interface RecommendedSource {
  /** Display name of the source the AI surfaced (marketplace / competitor / aggregator). */
  name: string;
  /** Loose category, used for styling + honesty framing. */
  type: "marketplace" | "aggregator" | "competitor" | "oem" | "editorial" | "dealer";
}

export interface EngineQueryResult {
  engine: EngineName;
  /** The buyer-style query that was run. */
  query: string;
  /** Sources the AI recommended for this query, in order. */
  recommended: RecommendedSource[];
  /** Whether the audited dealership appeared in the answer at all. */
  dealerPresent: boolean;
}

export interface AuditReport {
  /** Normalised input echo. */
  url: string;
  city: string;
  dealershipName?: string;
  /** Best-guess primary make derived from the domain (used in queries). */
  makeGuess: string;

  /** 0–100 overall AI Visibility Score. */
  score: number;
  scoreBand: "critical" | "weak" | "developing" | "strong";

  pillars: PillarScore[];
  engines: EngineQueryResult[];

  /** Estimated count of in-stock vehicles that match buyer queries but were never surfaced. */
  matchingCarsMissed: number;
  /** Plain-English diagnosed gaps. */
  gaps: string[];

  mode: AuditMode;
  generatedAt: string;
  /** Total queries run across all engines. */
  queryCount: number;
  /** Of those, how many surfaced the dealer. */
  dealerHits: number;
}
