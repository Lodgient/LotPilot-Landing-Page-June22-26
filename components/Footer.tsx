import Link from "next/link";
import Logo from "./Logo";

const COLS = [
  {
    title: "Platform",
    links: [
      { label: "AI-Visibility Audit", href: "#audit" },
      { label: "How it works", href: "#how" },
      { label: "Discovery layer", href: "#discovery" },
      { label: "Conversion layer", href: "#conversion" },
      { label: "vs Marketplaces", href: "#compare" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Connect your feed", href: "#feed" },
      { label: "Book a demo", href: "#demo" },
      { label: "Pricing", href: "#pricing" },
      { label: "Dealer login", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Consumer site →", href: "https://lotpilot.com" },
      { label: "Instagram", href: "https://www.instagram.com/lotpilot_ai/" },
      { label: "X / Twitter", href: "https://x.com/Lot_Pilot_AI" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-canvas-2">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Your inventory, recommended by AI. Your leads, worked by AI. You
              just send the feed.
            </p>
            <a
              href="#audit"
              className="mt-5 inline-flex h-10 items-center rounded-full border border-cyan/40 bg-cyan/[0.06] px-4 text-sm font-medium text-cyan transition-colors hover:bg-cyan/[0.12]"
            >
              Run the free AI audit →
            </a>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-mono uppercase tracking-wider text-ink-faint">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => {
                  const external = l.href.startsWith("http");
                  return (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} LotPilot. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Delaware C-Corp</span>
            <span>US data only</span>
            <span>FCRA-aligned</span>
            <span>No lead reselling</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
