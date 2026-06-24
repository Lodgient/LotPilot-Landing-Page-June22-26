"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/#problem", label: "The Problem" },
  { href: "/#audit", label: "Free Check" },
  { href: "/#product", label: "Product" },
  { href: "/#how", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onDark = !scrolled && !open;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-[1200px] items-center justify-between gap-4 rounded-2xl border px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled || open
            ? "border-line bg-[#f8fafc]/80 shadow-[0_12px_40px_-18px_rgba(15,23,34,0.28)] backdrop-blur-xl saturate-150"
            : "border-white/12 bg-[#0a0f1a]/25 backdrop-blur-md",
        )}
      >
        <Link href="/" aria-label="LotPilot home" className="shrink-0">
          <Logo onDark={onDark} />
        </Link>

        <ul className="hidden items-center gap-1.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn(
                  "inline-flex rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.006em] ring-1 transition-all duration-200",
                  onDark
                    ? "bg-white/[0.08] text-white/85 ring-white/15 hover:-translate-y-0.5 hover:bg-white/[0.16] hover:text-white"
                    : "bg-ink/[0.03] text-ink-soft ring-line hover:-translate-y-0.5 hover:bg-ink/[0.06] hover:text-ink",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className={cn(
              "text-[13px] font-medium tracking-[-0.006em] transition-colors duration-300",
              onDark ? "text-white/75 hover:text-white" : "text-ink-soft hover:text-ink",
            )}
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-4 py-2 text-[13px] font-semibold tracking-[-0.006em] text-white shadow-[0_8px_24px_-10px_rgba(37,99,235,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_14px_34px_-12px_rgba(37,99,235,0.95)]"
          >
            See the live demo
          </Link>
        </div>

        <button
          className={cn(
            "grid h-9 w-9 place-items-center rounded-lg text-xl leading-none transition-colors lg:hidden",
            onDark ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/[0.05]",
          )}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-[1200px] overflow-hidden rounded-2xl border border-line bg-[#f8fafc]/97 p-3 shadow-xl backdrop-blur-xl lg:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-line pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-line-strong px-4 py-2.5 text-center text-sm font-medium text-ink"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-[#2563eb] px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                See the live demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
