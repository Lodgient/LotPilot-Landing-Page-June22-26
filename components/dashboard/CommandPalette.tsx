"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

export const OPEN_CMDK = "lotpilot:open-cmdk";

type Item = {
  group: string;
  label: string;
  icon: IconName;
  href?: string;
  action?: "logout";
  keywords?: string;
};

const ITEMS: Item[] = [
  { group: "Navigate", label: "Command Center", icon: "command", href: "/dashboard", keywords: "home overview" },
  { group: "Navigate", label: "AI Visibility", icon: "radar", href: "/dashboard/visibility", keywords: "scan engines citation rate" },
  { group: "Navigate", label: "Inventory AI", icon: "car", href: "/dashboard/inventory", keywords: "vins vehicles cars" },
  { group: "Navigate", label: "Demand Intelligence", icon: "trending", href: "/dashboard/demand", keywords: "queries buyers" },
  { group: "Navigate", label: "Leads & Conversations", icon: "messages", href: "/dashboard/leads", keywords: "inbox chat" },
  { group: "Navigate", label: "AI Sales Assistant", icon: "bolt", href: "/dashboard/assistant", keywords: "ava agent voice sms" },
  { group: "Navigate", label: "ROI & Attribution", icon: "chart", href: "/dashboard/roi", keywords: "gross revenue money" },
  { group: "Navigate", label: "Board-ready report", icon: "printer", href: "/dashboard/report", keywords: "pdf print export" },
  { group: "Navigate", label: "Settings", icon: "gauge", href: "/dashboard/settings", keywords: "profile billing notifications team" },
  { group: "Actions", label: "Connect your feed", icon: "globe", href: "/#feed", keywords: "inventory vauto homenet" },
  { group: "Actions", label: "View marketing site", icon: "external", href: "/", keywords: "home landing" },
  { group: "Actions", label: "Log out", icon: "reply", action: "logout", keywords: "sign out exit" },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter((it) =>
      `${it.label} ${it.group} ${it.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [query]);

  // groups preserved in result order
  const groups = useMemo(() => {
    const m = new Map<string, Item[]>();
    results.forEach((it) => m.set(it.group, [...(m.get(it.group) ?? []), it]));
    return [...m.entries()];
  }, [results]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const select = useCallback(
    async (it: Item | undefined) => {
      if (!it) return;
      close();
      if (it.action === "logout") {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
        return;
      }
      if (it.href) router.push(it.href);
    },
    [close, router],
  );

  // open via ⌘K / Ctrl+K, or a custom event from the topbar button
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_CMDK, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_CMDK, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);
  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            select(results[active]);
          }
        }}
        className="surface relative w-full max-w-xl overflow-hidden rounded-2xl p-0 shadow-[0_40px_120px_-30px_rgba(38,32,24,0.5)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" size={18} className="text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and actions…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="rounded-md border border-line bg-black/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto scroll-slim p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-muted">No matches.</p>
          )}
          {groups.map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {group}
              </p>
              {items.map((it) => {
                const idx = results.indexOf(it);
                const isActive = idx === active;
                return (
                  <button
                    key={it.label}
                    onMouseMove={() => setActive(idx)}
                    onClick={() => select(it)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      isActive ? "bg-cyan/10 text-ink" : "text-ink-soft hover:bg-black/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                        isActive ? "bg-cyan text-white" : "bg-black/[0.05] text-ink-soft",
                      )}
                    >
                      <Icon name={it.icon} size={14} />
                    </span>
                    <span className="flex-1 font-medium">{it.label}</span>
                    {isActive && (
                      <span className="text-[11px] text-ink-faint">↵</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
