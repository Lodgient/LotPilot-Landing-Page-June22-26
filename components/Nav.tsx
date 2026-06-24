"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/#problem", label: "The problem" },
  { href: "/#audit", label: "Free audit" },
  { href: "/#how", label: "How it works" },
  { href: "/#compare", label: "vs Marketplaces" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onDark = !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "border-b border-line bg-[#f8fafc]/92 py-3.5 backdrop-blur-xl saturate-150"
          : "border-b border-transparent py-6",
      )}
    >
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-7 sm:px-10">
        <Link href="/" aria-label="LotPilot home">
          <Logo onDark={onDark} />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[12px] font-medium uppercase tracking-[0.07em] transition-colors duration-300",
                  onDark
                    ? "text-white/75 hover:bg-white/10 hover:text-white"
                    : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1.5 lg:flex">
          <Link
            href="/login"
            className={cn(
              "rounded-full px-3.5 py-2 text-[12px] font-medium uppercase tracking-[0.07em] transition-colors duration-300",
              onDark
                ? "text-white/75 hover:bg-white/10 hover:text-white"
                : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
            )}
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="ml-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_14px_32px_-10px_rgba(37,99,235,0.95)]"
          >
            See the live demo
          </Link>
        </div>

        <button
          className={cn(
            "text-2xl leading-none transition-colors lg:hidden",
            onDark ? "text-[#f8fafc]" : "text-ink",
          )}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-[#f8fafc]/97 px-7 py-5 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 font-serif text-xl text-ink-soft hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 font-serif text-xl text-ink-soft hover:text-ink"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-sm bg-cyan px-5 py-3 text-[12px] font-medium uppercase tracking-[0.1em] text-white"
            >
              See the live demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
