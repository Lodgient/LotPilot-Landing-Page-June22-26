"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import { cn } from "@/lib/cn";

type Tone = "accent" | "danger" | "cyan" | "warn";
interface Note {
  id: string;
  icon: IconName;
  tone: Tone;
  title: string;
  body: string;
  time: string;
  href: string;
}

const TILE: Record<Tone, string> = {
  accent: "bg-accent/12 text-accent",
  danger: "bg-danger/12 text-danger",
  cyan: "bg-cyan/12 text-cyan",
  warn: "bg-warn/12 text-warn",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [read, setRead] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotes(Array.isArray(d?.notifications) ? d.notifications : []))
      .catch(() => {});
  }, []);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = read ? 0 : notes.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          setRead(true);
        }}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.7 21a2 2 0 0 1-3.4 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_30px_80px_-28px_rgba(38,32,24,0.4)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-base text-ink">Notifications</p>
            {notes.length > 0 && (
              <button
                onClick={() => setRead(true)}
                className="text-xs font-medium text-cyan hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto scroll-slim">
            {notes.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted">
                You&apos;re all caught up.
              </p>
            ) : (
              notes.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-black/[0.02]"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                      TILE[n.tone],
                    )}
                  >
                    <Icon name={n.icon} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{n.title}</p>
                      <span className="shrink-0 text-[11px] text-ink-faint">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-ink-muted">{n.body}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
