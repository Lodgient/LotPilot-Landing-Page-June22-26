import { NextResponse } from "next/server";
import {
  getOvernightSummary,
  getLeads,
  getVisibility,
  getRecommendations,
} from "@/lib/dashboard/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Derives the dealer's notifications from the same data the dashboard uses —
 * the overnight recap, hot leads, visibility movement, and auto-applied fixes.
 * Resolves to the signed-in dealer's data (or the public demo) via RLS.
 */
export async function GET() {
  try {
    const [overnight, leads, visibility, recs] = await Promise.all([
      getOvernightSummary(),
      getLeads(),
      getVisibility(),
      getRecommendations(),
    ]);

    const hot = leads.filter((l) => l.temp === "Hot");
    const applied = recs.filter((r) => r.status === "done").length;

    type N = {
      id: string;
      icon: string;
      tone: "accent" | "danger" | "cyan" | "warn";
      title: string;
      body: string;
      time: string;
      href: string;
    };
    const notifications: N[] = [];

    if (overnight.grossInfluenced) {
      notifications.push({
        id: "overnight",
        icon: "bolt",
        tone: "accent",
        title: "While you slept",
        body: `AI influenced ${overnight.grossInfluenced} in gross — ${overnight.leadsAnswered ?? 0} leads answered, ${overnight.appts ?? 0} booked.`,
        time: "8h ago",
        href: "/dashboard/leads",
      });
    }
    if (hot.length) {
      notifications.push({
        id: "hot",
        icon: "messages",
        tone: "danger",
        title: `${hot.length} hot ${hot.length === 1 ? "buyer" : "buyers"} ready`,
        body: `${hot
          .map((h) => h.name.split(" ")[0])
          .slice(0, 3)
          .join(", ")} ${hot.length === 1 ? "is" : "are"} ready for a human close.`,
        time: "2h ago",
        href: "/dashboard/leads",
      });
    }
    if (visibility && visibility.delta > 0) {
      notifications.push({
        id: "vis-up",
        icon: "trending",
        tone: "accent",
        title: `AI visibility up +${visibility.delta} pts`,
        body: `Your score climbed to ${visibility.score}/100 — more buyer questions now name your store.`,
        time: "1d ago",
        href: "/dashboard/visibility",
      });
    }
    if (applied) {
      notifications.push({
        id: "fixes",
        icon: "check",
        tone: "cyan",
        title: `${applied} ${applied === 1 ? "fix" : "fixes"} applied automatically`,
        body: "LotPilot rebuilt VIN pages and closed visibility gaps — nothing for your team to do.",
        time: "1d ago",
        href: "/dashboard/inventory",
      });
    }

    return NextResponse.json({ notifications, unread: notifications.length });
  } catch {
    return NextResponse.json({ notifications: [], unread: 0 });
  }
}
