import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  ActivityEvent,
  AttributionEngine,
  Benchmark,
  Dealer,
  DemandRow,
  ForecastRow,
  FunnelStage,
  KPI,
  Lead,
  Pillar,
  Profile,
  Recommendation,
  RecommendedVin,
  ShareSegment,
  Vehicle,
  VisibilityQuery,
  VisibilitySnapshot,
  VsMarketplaceRow,
} from "./types";

export interface DealerContext {
  dealer: Dealer;
  profile: Profile;
}

/**
 * Resolve the signed-in user's dealer + profile. Redirects to /login if there's
 * no session or the user isn't linked to a dealer.
 */
const DEMO_DEALER_ID = "11111111-1111-1111-1111-111111111111";

export async function requireDealer(): Promise<DealerContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public read-only demo: anonymous visitors see the demo dealer's workspace.
  // RLS scopes anon reads to this dealer only. Disable with DASHBOARD_PUBLIC=false.
  if (!user) {
    if (process.env.DASHBOARD_PUBLIC === "false") redirect("/login");
    const { data: demo } = await supabase
      .from("dp_dealers")
      .select("*")
      .eq("id", DEMO_DEALER_ID)
      .single();
    if (!demo) redirect("/login");
    const { data: demoProfile } = await supabase
      .from("dp_profiles")
      .select("full_name, role")
      .eq("dealer_id", DEMO_DEALER_ID)
      .limit(1)
      .maybeSingle();
    return {
      dealer: {
        id: demo.id,
        name: demo.name,
        metro: demo.metro ?? "",
        rooftops: demo.rooftops ?? 1,
        feedType: demo.feed_type ?? "",
        vehicles: demo.vehicles ?? 0,
        lastSync: demo.last_sync ?? "",
      },
      profile: {
        fullName: demoProfile?.full_name ?? demo.name ?? "Demo",
        role: demoProfile?.role ?? "Demo workspace",
      },
    };
  }

  const { data: profile } = await supabase
    .from("dp_profiles")
    .select("full_name, role, dealer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.dealer_id) redirect("/login");

  const { data: dealer } = await supabase
    .from("dp_dealers")
    .select("*")
    .eq("id", profile.dealer_id)
    .single();

  if (!dealer) redirect("/login");

  return {
    dealer: {
      id: dealer.id,
      name: dealer.name,
      metro: dealer.metro ?? "",
      rooftops: dealer.rooftops ?? 1,
      feedType: dealer.feed_type ?? "",
      vehicles: dealer.vehicles ?? 0,
      lastSync: dealer.last_sync ?? "",
    },
    profile: { fullName: profile.full_name ?? "", role: profile.role ?? "" },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toKpi(r: any): KPI {
  return {
    label: r.label,
    value: r.value,
    sub: r.sub ?? undefined,
    trend: r.trend ?? undefined,
    spark: r.spark ?? [],
    accent: r.accent ?? "cyan",
    invertTrend: r.invert_trend ?? false,
  };
}

export async function getKpis(scope: "today" | "roi"): Promise<KPI[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dp_kpis")
    .select("*")
    .eq("scope", scope)
    .order("sort");
  return (data ?? []).map(toKpi);
}

export async function getOvernightSummary(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_kpis").select("label, value").eq("scope", "overnight");
  const out: Record<string, string> = {};
  (data ?? []).forEach((r: any) => (out[r.label] = r.value));
  return out;
}

export async function getActivity(): Promise<ActivityEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dp_activity")
    .select("*")
    .order("sort");
  return (data ?? []).map((r: any) => ({ type: r.type, time: r.time_label ?? "", text: r.body }));
}

export async function getVisibility(): Promise<VisibilitySnapshot | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_visibility").select("*").maybeSingle();
  if (!data) return null;
  return { score: data.score, delta: data.score_delta ?? 0, band: data.band ?? "developing", trend: data.trend ?? [] };
}

export async function getPillars(): Promise<Pillar[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_pillars").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ label: r.label, score: r.score, delta: r.delta ?? 0 }));
}

export async function getVisibilityQueries(): Promise<VisibilityQuery[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_visibility_queries").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ query: r.query, engines: r.engines }));
}

export async function getShareOfVoice(): Promise<ShareSegment[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_share_of_voice").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ name: r.name, value: r.value, color: r.color }));
}

export async function getRecommendedVins(): Promise<RecommendedVin[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_recommended_vins").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ vehicle: r.vehicle, engine: r.engine, leads: r.leads, price: r.price }));
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dp_leads")
    .select("*, dp_messages(sender, body, time_label, sort)")
    .order("sort");
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    vehicle: r.vehicle,
    source: r.source,
    status: r.status,
    temp: r.temp,
    firstReplySec: r.first_reply_sec ?? 0,
    creditApp: r.credit_app ?? false,
    time: r.time_label ?? "",
    transcript: (r.dp_messages ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((m: any) => ({ from: m.sender, text: m.body, time: m.time_label ?? "" })),
  }));
}

export async function getFunnel(): Promise<FunnelStage[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_funnel").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ stage: r.stage, value: r.value }));
}

export async function getVsMarketplace(): Promise<VsMarketplaceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_vs_marketplace").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ metric: r.metric, lp: r.lp, mk: r.mk }));
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_vehicles").select("*").order("sort");
  return (data ?? []).map((r: any) => ({
    id: r.id,
    vin: r.vin,
    year: r.year,
    make: r.make,
    model: r.model,
    trim: r.trim,
    body: r.body,
    stockType: r.stock_type,
    price: r.price,
    mileage: r.mileage,
    daysOnLot: r.days_on_lot,
    estGross: r.est_gross,
    aiScore: r.ai_score,
    enginesCiting: r.engines_citing,
    queriesMatched: r.queries_matched,
    aiLeads: r.ai_leads,
    aiVdpViews: r.ai_vdp_views,
    trend: r.trend ?? [],
    blocker: r.blocker,
    engines: r.engines ?? {},
    citations: r.citations ?? [],
    liveUrl: r.live_url ?? undefined,
    liveImage: r.live_image ?? undefined,
  }));
}

export async function getDemand(): Promise<DemandRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_demand").select("*").order("sort");
  return (data ?? []).map((r: any) => ({
    query: r.query,
    segment: r.segment,
    weeklyVolume: r.weekly_volume,
    trend: r.trend ?? [],
    yourStock: r.your_stock,
    cited: r.cited,
    topSource: r.top_source,
    status: r.status,
  }));
}

export async function getAttributionByEngine(): Promise<AttributionEngine[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_attribution_engine").select("*").order("sort");
  return (data ?? []).map((r: any) => ({
    engine: r.engine,
    leads: r.leads,
    appts: r.appts,
    sales: r.sales,
    gross: r.gross,
  }));
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_recommendations").select("*").order("sort");
  return (data ?? []).map((r: any) => ({
    id: r.id,
    priority: r.priority,
    title: r.title,
    detail: r.detail,
    impact: r.impact,
    effort: r.effort,
    category: r.category,
    status: r.status ?? "open",
  }));
}

export async function getBenchmarks(): Promise<Benchmark[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_benchmarks").select("*").order("sort");
  return (data ?? []).map((r: any) => ({
    metric: r.metric,
    yourValue: Number(r.your_value),
    peerMedian: Number(r.peer_median),
    peerTop: Number(r.peer_top),
    percentile: r.percentile,
    unit: r.unit,
    higherBetter: r.higher_better,
  }));
}

export async function getForecast(): Promise<ForecastRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_forecast").select("*").order("sort");
  return (data ?? []).map((r: any) => ({
    metric: r.metric,
    current: Number(r.current),
    projected: Number(r.projected),
    unit: r.unit,
  }));
}

export async function getCustomersOwned(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("dp_roi").select("customers_owned").maybeSingle();
  return data?.customers_owned ?? 0;
}

import type { AgentConfig, AgentPerformance, AgentStatus } from "./types";

export async function getAgentConfig(dealerId?: string): Promise<AgentConfig | null> {
  const supabase = await createClient();
  let { data } = await supabase.from("dp_agent").select("*").maybeSingle();
  // New dealers (self-serve signups) have no row yet — create a default one,
  // deployed-off, so they can turn their assistant on. RLS scopes the insert.
  if (!data && dealerId) {
    const { data: created } = await supabase
      .from("dp_agent")
      .insert({ dealer_id: dealerId, status: "not_deployed" })
      .select("*")
      .maybeSingle();
    data = created;
  }
  if (!data) return null;
  const ch = data.channels ?? {};
  return {
    status: (data.status ?? "active") as AgentStatus,
    displayName: data.display_name ?? "Ava",
    persona: data.persona ?? "warm",
    channels: { sms: !!ch.sms, voice: !!ch.voice, chat: !!ch.chat },
    greeting: data.greeting ?? "",
    handoffPhone: data.handoff_phone ?? "",
    businessHours: data.business_hours ?? "24/7 — always on",
    speedToLeadSec: data.speed_to_lead_sec ?? 11,
    deployedAt: data.deployed_at ?? "",
  };
}

/**
 * Derive the agent's real output from the same tables the rest of the dashboard
 * uses — leads it worked plus attributed sales/gross by engine.
 */
export async function getAgentPerformance(): Promise<AgentPerformance> {
  const supabase = await createClient();
  const [leads, attribution] = await Promise.all([
    supabase.from("dp_leads").select("status, credit_app"),
    supabase.from("dp_attribution_engine").select("appts, sales, gross"),
  ]);
  const ld = (leads.data ?? []) as any[];
  const at = (attribution.data ?? []) as any[];
  return {
    leadsWorked: ld.length,
    appts: at.reduce((s, r) => s + (r.appts ?? 0), 0),
    creditApps: ld.filter((l) => l.credit_app).length,
    attributedSales: at.reduce((s, r) => s + (r.sales ?? 0), 0),
    gross: at.reduce((s, r) => s + (r.gross ?? 0), 0),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
