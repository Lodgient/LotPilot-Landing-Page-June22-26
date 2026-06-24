// Shared dashboard types (data now comes from Supabase via queries.ts).

export interface Dealer {
  id: string;
  name: string;
  metro: string;
  rooftops: number;
  feedType: string;
  vehicles: number;
  lastSync: string;
}

export interface Profile {
  fullName: string;
  role: string;
}

export interface KPI {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  spark?: number[];
  accent?: "accent" | "cyan" | "violet" | "warn";
  invertTrend?: boolean;
}

export type ActivityType =
  | "reply"
  | "creditapp"
  | "appointment"
  | "visibility"
  | "handoff";

export interface ActivityEvent {
  type: ActivityType;
  time: string;
  text: string;
}

export type EngineName =
  | "ChatGPT"
  | "Perplexity"
  | "Gemini"
  | "Grok"
  | "Google AI Overviews"
  | "Bing Copilot";

export const ENGINES: EngineName[] = [
  "ChatGPT",
  "Perplexity",
  "Gemini",
  "Grok",
  "Google AI Overviews",
  "Bing Copilot",
];

export interface VisibilitySnapshot {
  score: number;
  delta: number;
  band: "critical" | "weak" | "developing" | "strong";
  trend: number[];
  grossAtRisk: string;
  projectedLeads: string;
}

export interface Pillar {
  label: string;
  score: number;
  delta: number;
}

export interface VisibilityQuery {
  query: string;
  engines: Record<EngineName, boolean>;
  /** Estimated monthly buyer searches for this query in-market. */
  volume: number;
  /** Who AI recommends instead when your inventory isn't the cited source. */
  competitor: string | null;
}

export interface ShareSegment {
  name: string;
  value: number;
  color: string;
}

export interface RecommendedVin {
  vehicle: string;
  engine: string;
  leads: number;
  price: string;
}

export type LeadTemp = "Hot" | "Warm" | "Cold";

export interface Message {
  from: "buyer" | "agent" | "rep";
  text: string;
  time: string;
}

export interface Lead {
  id: string;
  name: string;
  vehicle: string;
  source: string;
  status: string;
  temp: LeadTemp;
  firstReplySec: number;
  creditApp: boolean;
  time: string;
  transcript: Message[];
}

export interface VehicleCitation {
  query: string;
  topSource: string;
  engines: Record<string, boolean>;
}

export interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body: string;
  stockType: string;
  price: number;
  mileage: number;
  daysOnLot: number;
  estGross: number;
  aiScore: number;
  enginesCiting: number;
  queriesMatched: number;
  aiLeads: number;
  aiVdpViews: number;
  trend: number[];
  blocker: string;
  engines: Record<string, boolean>;
  citations: VehicleCitation[];
  liveUrl?: string;
  liveImage?: string;
}

export interface DemandRow {
  query: string;
  segment: string;
  weeklyVolume: number;
  trend: number[];
  yourStock: number;
  cited: number;
  topSource: string;
  status: "gap" | "covered" | "surplus";
}

export interface AttributionEngine {
  engine: string;
  leads: number;
  appts: number;
  sales: number;
  gross: number;
}

export interface Recommendation {
  id: string;
  priority: "High" | "Medium" | "Low";
  title: string;
  detail: string;
  impact: string;
  effort: string;
  category: string;
  status: "open" | "applied";
}

export interface Benchmark {
  metric: string;
  yourValue: number;
  peerMedian: number;
  peerTop: number;
  percentile: number;
  unit: "score" | "pct" | "sec" | "usd" | "count";
  higherBetter: boolean;
}

export interface ForecastRow {
  metric: string;
  current: number;
  projected: number;
  unit: "score" | "usd" | "count";
}

export interface FunnelStage {
  stage: string;
  value: number;
}

export interface VsMarketplaceRow {
  metric: string;
  lp: string;
  mk: string;
}

export type AgentStatus = "active" | "paused" | "not_deployed";

export interface AgentConfig {
  status: AgentStatus;
  displayName: string;
  persona: string;
  channels: { sms: boolean; voice: boolean; chat: boolean };
  greeting: string;
  handoffPhone: string;
  businessHours: string;
  speedToLeadSec: number;
  deployedAt: string;
}

export interface AgentPerformance {
  leadsWorked: number;
  appts: number;
  creditApps: number;
  attributedSales: number;
  gross: number;
}
