"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Icon from "./Icon";
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

  // Over the dark cinematic hero the nav is light-on-dark; solid white on scroll.
  const onDark = !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-line bg-white/80 shadow-[0_1px_0_rgba(13,17,23,0.04)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      {/* legibility scrim while floating over the dark hero */}
      {onDark && (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black/40 to-transparent" />
      )}

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="LotPilot home">
          <Logo onDark={onDark} />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors",
                onDark ? "text-white/80 hover:text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className={cn(
              "text-sm font-medium transition-colors",
              onDark ? "text-white/80 hover:text-white" : "text-ink-muted hover:text-ink",
            )}
          >
            Dealer login
          </Link>
          <Link
            href="/#demo"
            className="inline-flex h-10 items-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
          >
            Book a demo
          </Link>
        </div>

        <button
          className={cn(
            "grid h-10 w-10 place-items-center rounded-lg border transition-colors lg:hidden",
            onDark ? "border-white/25 text-white" : "border-line text-ink",
          )}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-white/95 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-black/[0.04]"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-black/[0.04]"
            >
              Dealer login
            </Link>
            <Link
              href="/#demo"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse"
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
