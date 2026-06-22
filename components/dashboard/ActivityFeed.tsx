import type { ActivityEvent, ActivityType } from "@/lib/dashboard/types";

const META: Record<ActivityType, { icon: string; tone: string }> = {
  appointment: { icon: "📅", tone: "bg-violet/15 text-violet" },
  creditapp: { icon: "📄", tone: "bg-warn/15 text-warn" },
  reply: { icon: "💬", tone: "bg-cyan/15 text-cyan" },
  visibility: { icon: "◎", tone: "bg-accent/15 text-accent" },
  handoff: { icon: "🤝", tone: "bg-white/10 text-ink-soft" },
};

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="relative space-y-4">
      <span className="absolute left-[15px] top-1 bottom-1 w-px bg-line" aria-hidden />
      {events.map((e, i) => {
        const m = META[e.type];
        return (
          <li key={i} className="relative flex gap-3">
            <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm ${m.tone}`}>
              {m.icon}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm text-ink-soft">{e.text}</p>
              <p className="mt-0.5 text-xs text-ink-faint">{e.time}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
