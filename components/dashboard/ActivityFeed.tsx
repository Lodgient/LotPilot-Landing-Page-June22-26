import Icon, { type IconName } from "@/components/Icon";
import type { ActivityEvent, ActivityType } from "@/lib/dashboard/types";

const META: Record<ActivityType, { icon: IconName; tone: string }> = {
  appointment: { icon: "calendar", tone: "bg-violet/15 text-violet ring-violet/20" },
  creditapp: { icon: "file", tone: "bg-warn/15 text-warn ring-warn/20" },
  reply: { icon: "reply", tone: "bg-cyan/15 text-cyan ring-cyan/20" },
  visibility: { icon: "radar", tone: "bg-accent/15 text-accent ring-accent/20" },
  handoff: { icon: "handoff", tone: "bg-white/10 text-ink-soft ring-white/15" },
};

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="relative space-y-4">
      <span className="absolute left-[15px] top-1 bottom-1 w-px bg-line" aria-hidden />
      {events.map((e, i) => {
        const m = META[e.type];
        return (
          <li key={i} className="relative flex gap-3">
            <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-inset ${m.tone}`}>
              <Icon name={m.icon} size={15} />
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
