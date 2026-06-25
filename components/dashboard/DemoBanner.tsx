"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

/**
 * Shown only on the public demo (anonymous → demo dealer). The demo link is the
 * primary shared asset, so it converts explorers into signups. Dismissible.
 */
export default function DemoBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem("lp-demo-banner") !== "off");
    } catch {
      setShow(true);
    }
  }, []);
  if (!show) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-cyan/25 bg-gradient-to-r from-cyan/[0.07] via-accent/[0.04] to-violet/[0.05] p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/25">
        <Icon name="sparkles" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          You&apos;re exploring a live demo on Capitol Nissan&apos;s data.
        </p>
        <p className="text-xs text-ink-muted">
          See this on your own inventory — free to start, live in about a minute.
        </p>
      </div>
      <Link
        href="/signup?plan=visibility"
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
      >
        Start your own
        <Icon name="arrow-right" size={15} />
      </Link>
      <button
        onClick={() => {
          try {
            localStorage.setItem("lp-demo-banner", "off");
          } catch {
            /* ignore */
          }
          setShow(false);
        }}
        aria-label="Dismiss"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-black/[0.05] hover:text-ink"
      >
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}
