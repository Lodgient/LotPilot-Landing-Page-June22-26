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

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l, i) => (
            <li key={l.href} className="relative">
              {i > 0 && (
                <span className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-current opacity-25" />
              )}
              <a
                href={l.href}
                className={cn(
                  "px-3.5 py-2 text-[11.5px] font-normal uppercase tracking-[0.06em] transition-opacity",
                  onDark ? "text-[#f8fafc]/90 hover:text-[#f8fafc]" : "text-ink-soft hover:text-ink",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/login"
            className={cn(
              "text-[11.5px] font-normal uppercase tracking-[0.06em] transition-opacity",
              onDark ? "text-[#f8fafc]/90 hover:text-[#f8fafc]" : "text-ink-soft hover:text-ink",
            )}
          >
            Login
          </Link>
          <Link
            href="/#demo"
            className={cn(
              "inline-flex items-center rounded-sm border px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-0.5",
              onDark
                ? "border-[#f8fafc]/50 text-[#f8fafc] hover:bg-[#2563eb] hover:border-[#2563eb]"
                : "border-cyan/60 text-cyan hover:bg-cyan hover:text-white",
            )}
          >
            Speak with us
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
              href="/#demo"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-sm bg-cyan px-5 py-3 text-[12px] font-medium uppercase tracking-[0.1em] text-white"
            >
              Speak with us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
