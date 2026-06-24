// ============================================================================
// AI Visibility Monitor — shared data contract (bots ⇄ dashboard)
// ----------------------------------------------------------------------------
// This is the single source of truth for the shape of data the bot backend
// produces and the LotPilot dashboard consumes. The bot team writes rows to the
// Postgres tables in the spec (ai_visibility_scans, _runs, _results,
// _shadow_competitors, _visibility_score_history, ai_query_templates); the
// dashboard reads them through these typed views.
//
// DB is snake_case; these are the camelCase TS mirrors. Keep the two in sync —
// if the spec's schema changes, change this file in the same PR.
// ============================================================================

/** The AI answer engines the bots query. Mirrors the spec's `platform` enum. */
export type AiPlatform = "chatgpt" | "grok" | "perplexity" | "gemini" | "claude";

export const AI_PLATFORMS: AiPlatform[] = [
  "chatgpt",
  "grok",
  "perplexity",
  "gemini",
  "claude",
];

/** Display label for a platform (UI). */
export const PLATFORM_LABEL: Record<AiPlatform, string> = {
  chatgpt: "ChatGPT",
  grok: "Grok",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
};

export type ScanStatus = "queued" | "running" | "complete" | "partial" | "failed";
export type RunStatus = "queued" | "running" | "success" | "failed" | "blocked";
export type ScanTrigger = "scheduled" | "manual" | "onboarding";

export type SourceClass = "dealer" | "competitor" | "marketplace" | "review_site" | "other";
export type MentionType = "dealer_name" | "dealer_domain" | "dealer_url" | "competitor_name";
export type QueryCategory =
  | "inventory_search"
  | "dealer_recommendation"
  | "price_comparison"
  | "review_request";

/** ai_query_templates */
export interface QueryTemplate {
  id: string;
  template: string; // "best used {vehicle_type} under {price} near {city}"
  category: QueryCategory;
  intent: "purchase_intent" | "research" | "comparison";
  variables: string[];
  isActive: boolean;
}

/** ai_visibility_scans — one scheduled run for one dealer (all queries × platforms). */
export interface AiScan {
  id: string;
  dealerId: string;
  status: ScanStatus;
  triggeredBy: ScanTrigger;
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  /** 0–100, computed after all runs complete. */
  visibilityScore: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface SourceUrl {
  url: string;
  classification: SourceClass;
}

export interface ParsedMention {
  type: MentionType;
  value: string;
  context: string; // surrounding sentence, for UI display
  confidence: "high" | "medium" | "low";
  isTargetDealer: boolean;
}

/**
 * ai_visibility_runs + ai_visibility_results, flattened for the UI.
 * One row per (query × platform). `rawResponse` and `screenshotUrl` are exactly
 * what the AnswerMonitor renders once live data is wired (it simulates until then).
 */
export interface AiRun {
  id: string;
  scanId: string;
  dealerId: string;
  resolvedQuery: string;
  platform: AiPlatform;
  status: RunStatus;
  rawResponse: string | null;
  screenshotUrl: string | null;
  durationMs: number | null;
  executedAt: string | null;
  // ---- parsed result ----
  targetDealerMentioned: boolean;
  dealerMentionCount: number;
  competitorMentionCount: number;
  sourceUrls: SourceUrl[];
  vehiclesMentioned: string[];
  hasInventoryData: boolean;
  competitorNamesFound: string[];
  mentionContexts: ParsedMention[];
}

/** ai_shadow_competitors — dealers AI surfaces instead of this one. */
export interface ShadowCompetitor {
  id: string;
  dealerId: string;
  competitorName: string;
  competitorDomain: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  totalMentions: number;
  platformsSeen: AiPlatform[];
  queriesTriggered: string[];
}

/** ai_visibility_score_history — one point per scan, for the trend chart. */
export interface ScoreHistoryPoint {
  scanId: string;
  score: number;
  scoreByPlatform: Partial<Record<AiPlatform, number>>;
  scoreByCategory: Partial<Record<QueryCategory, number>>;
  recordedAt: string;
}

/** LotPilot improvement recommendation derived from a scan (spec §7.2). */
export interface VisibilityRecommendation {
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  fix: string;
  estimatedImpact: string;
  canAutoFix: boolean;
}

// ---------------------------------------------------------------------------
// Dashboard view-models — what the pages render. The data layer maps the bot
// tables above into these; until the bots ship, queries.ts serves demo data in
// the same shape so the UI is identical with real vs sample data.
// ---------------------------------------------------------------------------

/** One buyer query's result across platforms — powers the AnswerMonitor + table. */
export interface MonitoredQuery {
  query: string;
  category?: QueryCategory;
  volume: number;
  /** cited?: true per platform the dealer was the cited answer for. */
  cited: Partial<Record<AiPlatform, boolean>>;
  /** the actual captured run per platform (raw response + screenshot), when live. */
  runs?: Partial<Record<AiPlatform, Pick<AiRun, "rawResponse" | "screenshotUrl" | "targetDealerMentioned" | "competitorNamesFound">>>;
  competitor: string | null;
}
