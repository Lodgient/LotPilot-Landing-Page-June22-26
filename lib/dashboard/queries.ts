import { redirect } from "next/navigation";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAnonClient } from "@/lib/supabase/anon";
import type {
  ActivityEvent,
  AgentConfig,
  AgentPerformance,
  AgentStatus,
  AttributionEngine,
  Benchmark,
  Dealer,
  EngineName,
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

const DEMO_DEALER_ID = "11111111-1111-1111-1111-111111111111";

/* eslint-disable @typescript-eslint/no-explicit-any */

type AnonDb = ReturnType<typeof createAnonClient>;

/**
 * Resolve the session user ONCE per request (deduped via React cache), shared
 * by requireDealer + every cached read so we don't re-hit auth per query.
 */
const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Cache a static, public demo read. The dashboard serves a single anonymous
 * demo dataset, so these reads are identical for every visitor and safe to
 * cache — cutting the per-navigation Supabase round-trips that made section
 * switches feel slow. Uses the cookie-free anon client so it can live inside
 * `unstable_cache`. REVISIT (key by dealer id) when real multi-tenant auth ships.
 */
function demoRead<A extends unknown[], T>(
  key: string,
  fn: (db: AnonDb, ...args: A) => Promise<T>,
): (...args: A) => Promise<T> {
  const cachedAnon = unstable_cache(
    (...args: A) => fn(createAnonClient(), ...args),
    ["dashboard", key],
    { revalidate: 300, tags: ["dashboard"] },
  ) as (...args: A) => Promise<T>;

  return async (...args: A) => {
    const user = await getSessionUser();
    if (user) {
      // Authenticated dealer → read THEIR rows live via the session client
      // (RLS `dp_*_own` scopes to dp_current_dealer()). Never the demo cache.
      const db = (await createClient()) as unknown as AnonDb;
      return fn(db, ...args);
    }
    // Anonymous → the cached public demo dataset.
    return cachedAnon(...args);
  };
}

const getDemoDealerContext = demoRead(
  "demo-dealer",
  async (supabase): Promise<DealerContext | null> => {
    const [{ data: demo }, { data: demoProfile }] = await Promise.all([
      supabase.from("dp_dealers").select("*").eq("id", DEMO_DEALER_ID).single(),
      supabase
        .from("dp_profiles")
        .select("full_name, role")
        .eq("dealer_id", DEMO_DEALER_ID)
        .limit(1)
        .maybeSingle(),
    ]);
    if (!demo) return null;
    const d = demo as any;
    const pr = demoProfile as any;
    return {
      dealer: {
        id: d.id,
        name: d.name,
        metro: d.metro ?? "",
        rooftops: d.rooftops ?? 1,
        feedType: d.feed_type ?? "",
        vehicles: d.vehicles ?? 0,
        lastSync: d.last_sync ?? "",
      },
      profile: {
        fullName: pr?.full_name ?? d.name ?? "Demo",
        role: pr?.role ?? "Demo workspace",
      },
    };
  },
);

/**
 * Resolve the signed-in user's dealer + profile. Redirects to /login if there's
 * no session or the user isn't linked to a dealer. Auth must stay live (cookies);
 * only the anonymous demo's dealer/profile lookup is cached.
 */
export async function requireDealer(): Promise<DealerContext> {
  const user = await getSessionUser();

  // Public read-only demo: anonymous visitors see the demo dealer's workspace.
  if (!user) {
    if (process.env.DASHBOARD_PUBLIC === "false") redirect("/login");
    const ctx = await getDemoDealerContext();
    if (!ctx) redirect("/login");
    return ctx;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("dp_profiles")
    .select("full_name, role, dealer_id")
    .eq("id", user.id)
    .single();

  // Signed in but not yet provisioned (signed up, hasn't paid) → activate gate.
  if (!profile?.dealer_id) redirect("/activate");

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

export const getKpis = demoRead(
  "kpis",
  async (supabase, scope: "today" | "roi"): Promise<KPI[]> => {
    const { data } = await supabase.from("dp_kpis").select("*").eq("scope", scope).order("sort");
    return (data ?? []).map(toKpi);
  },
);

export const getOvernightSummary = demoRead(
  "overnight",
  async (supabase): Promise<Record<string, string>> => {
    const { data } = await supabase.from("dp_kpis").select("label, value").eq("scope", "overnight");
    const out: Record<string, string> = {};
    (data ?? []).forEach((r: any) => (out[r.label] = r.value));
    return out;
  },
);

export const getActivity = demoRead("activity", async (supabase): Promise<ActivityEvent[]> => {
  const { data } = await supabase.from("dp_activity").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ type: r.type, time: r.time_label ?? "", text: r.body }));
});

export const getVisibility = demoRead(
  "visibility",
  async (supabase): Promise<VisibilitySnapshot | null> => {
    const { data } = await supabase.from("dp_visibility").select("*").maybeSingle();
    if (!data) return null;
    const r = data as any;
    return {
      score: r.score,
      delta: r.score_delta ?? 0,
      band: r.band ?? "developing",
      trend: r.trend ?? [],
      grossAtRisk: r.gross_at_risk ?? "",
      projectedLeads: r.projected_leads ?? "",
    };
  },
);

export const getPillars = demoRead("pillars", async (supabase): Promise<Pillar[]> => {
  const { data } = await supabase.from("dp_pillars").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ label: r.label, score: r.score, delta: r.delta ?? 0 }));
});

export const getVisibilityQueries = demoRead(
  "visibility-queries",
  async (supabase): Promise<VisibilityQuery[]> => {
    const { data } = await supabase.from("dp_visibility_queries").select("*").order("sort");
    return (data ?? []).map((r: any) => ({
      query: r.query,
      engines: r.engines,
      volume: r.volume ?? 0,
      competitor: r.competitor ?? null,
    }));
  },
);

/**
 * Live-or-demo AI visibility monitor data. With AI_MONITOR_LIVE="true" it reads
 * the bot backend's tables (ai_visibility_scans/_runs/_results) for the dealer's
 * latest complete scan and maps them to the dashboard shape. Guarded: if the
 * tables aren't present yet or empty, it falls back to the cached demo queries.
 */
const PLATFORM_TO_ENGINE: Record<string, EngineName> = {
  chatgpt: "ChatGPT",
  grok: "Grok",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
};

export interface VisibilityMonitor {
  queries: VisibilityQuery[];
  captures: Record<string, { rawResponse?: string; screenshotUrl?: string }>;
  live: boolean;
}

export async function getVisibilityMonitor(dealerId: string): Promise<VisibilityMonitor> {
  if (process.env.AI_MONITOR_LIVE === "true") {
    try {
      const supabase = await createClient();
      const { data: scan } = await supabase
        .from("ai_visibility_scans")
        .select("id")
        .eq("dealer_id", dealerId)
        .eq("status", "complete")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scan?.id) {
        const [{ data: runs }, { data: results }] = await Promise.all([
          supabase
            .from("ai_visibility_runs")
            .select("id, resolved_query, platform, raw_response, screenshot_url")
            .eq("scan_id", scan.id),
          supabase
            .from("ai_visibility_results")
            .select("run_id, target_dealer_mentioned, competitor_names_found")
            .eq("scan_id", scan.id),
        ]);

        if (runs && runs.length) {
          const resById = new Map<string, any>((results ?? []).map((r: any) => [r.run_id, r]));
          const byQuery = new Map<string, VisibilityQuery>();
          const captures: VisibilityMonitor["captures"] = {};

          for (const run of runs as any[]) {
            const engine = PLATFORM_TO_ENGINE[run.platform];
            if (!engine) continue;
            const res = resById.get(run.id);
            const cited = !!res?.target_dealer_mentioned;
            const q =
              byQuery.get(run.resolved_query) ??
              ({
                query: run.resolved_query,
                engines: {} as Record<EngineName, boolean>,
                volume: 0,
                competitor: null,
              } as VisibilityQuery);
            (q.engines as Record<string, boolean>)[engine] = cited;
            if (!cited && !q.competitor) {
              const comp = (res?.competitor_names_found ?? [])[0];
              if (comp) q.competitor = comp;
            }
            byQuery.set(run.resolved_query, q);
            if (run.raw_response || run.screenshot_url) {
              captures[`${run.resolved_query}|${engine}`] = {
                rawResponse: run.raw_response ?? undefined,
                screenshotUrl: run.screenshot_url ?? undefined,
              };
            }
          }
          return { queries: [...byQuery.values()], captures, live: true };
        }
      }
    } catch {
      // Tables not present yet / RLS / empty — fall through to demo data.
    }
  }
  return { queries: await getVisibilityQueries(), captures: {}, live: false };
}

export const getShareOfVoice = demoRead("share-of-voice", async (supabase): Promise<ShareSegment[]> => {
  const { data } = await supabase.from("dp_share_of_voice").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ name: r.name, value: r.value, color: r.color }));
});

export const getRecommendedVins = demoRead(
  "recommended-vins",
  async (supabase): Promise<RecommendedVin[]> => {
    const { data } = await supabase.from("dp_recommended_vins").select("*").order("sort");
    return (data ?? []).map((r: any) => ({
      vehicle: r.vehicle,
      engine: r.engine,
      leads: r.leads,
      price: r.price,
    }));
  },
);

export const getLeads = demoRead("leads", async (supabase): Promise<Lead[]> => {
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
});

export const getFunnel = demoRead("funnel", async (supabase): Promise<FunnelStage[]> => {
  const { data } = await supabase.from("dp_funnel").select("*").order("sort");
  return (data ?? []).map((r: any) => ({ stage: r.stage, value: r.value }));
});

export const getVsMarketplace = demoRead(
  "vs-marketplace",
  async (supabase): Promise<VsMarketplaceRow[]> => {
    const { data } = await supabase.from("dp_vs_marketplace").select("*").order("sort");
    return (data ?? []).map((r: any) => ({ metric: r.metric, lp: r.lp, mk: r.mk }));
  },
);

export const getVehicles = demoRead("vehicles", async (supabase): Promise<Vehicle[]> => {
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
});

export const getDemand = demoRead("demand", async (supabase): Promise<DemandRow[]> => {
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
});

export const getAttributionByEngine = demoRead(
  "attribution-engine",
  async (supabase): Promise<AttributionEngine[]> => {
    const { data } = await supabase.from("dp_attribution_engine").select("*").order("sort");
    return (data ?? []).map((r: any) => ({
      engine: r.engine,
      leads: r.leads,
      appts: r.appts,
      sales: r.sales,
      gross: r.gross,
    }));
  },
);

export const getRecommendations = demoRead(
  "recommendations",
  async (supabase): Promise<Recommendation[]> => {
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
  },
);

export const getBenchmarks = demoRead("benchmarks", async (supabase): Promise<Benchmark[]> => {
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
});

export const getForecast = demoRead("forecast", async (supabase): Promise<ForecastRow[]> => {
  const { data } = await supabase.from("dp_forecast").select("*").order("sort");
  return (data ?? []).map((r: any) => ({
    metric: r.metric,
    current: Number(r.current),
    projected: Number(r.projected),
    unit: r.unit,
  }));
});

export const getCustomersOwned = demoRead("customers-owned", async (supabase): Promise<number> => {
  const { data } = await supabase.from("dp_roi").select("customers_owned").maybeSingle();
  return (data as any)?.customers_owned ?? 0;
});

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
  const ch = (data as any).channels ?? {};
  const a = data as any;
  return {
    status: (a.status ?? "active") as AgentStatus,
    displayName: a.display_name ?? "Ava",
    persona: a.persona ?? "warm",
    channels: { sms: !!ch.sms, voice: !!ch.voice, chat: !!ch.chat },
    greeting: a.greeting ?? "",
    handoffPhone: a.handoff_phone ?? "",
    businessHours: a.business_hours ?? "24/7 — always on",
    speedToLeadSec: a.speed_to_lead_sec ?? 11,
    deployedAt: a.deployed_at ?? "",
  };
}

/**
 * Derive the agent's real output from the same tables the rest of the dashboard
 * uses — leads it worked plus attributed sales/gross by engine.
 */
export const getAgentPerformance = demoRead(
  "agent-performance",
  async (supabase): Promise<AgentPerformance> => {
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
  },
);
/* eslint-enable @typescript-eslint/no-explicit-any */
