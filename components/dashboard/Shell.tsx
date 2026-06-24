"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Icon, { type IconName } from "@/components/Icon";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import type { Dealer, Profile } from "@/lib/dashboard/types";
import { deriveOEMs } from "@/lib/dashboard/oem";
import { DemoBadge } from "./ui";
import DateRange from "./DateRange";
import { PrintButton } from "./Exports";
import Copilot from "./Copilot";

type NavItem = { href: string; label: string; icon: IconName; exact?: boolean };

// Grouped so the two jobs are unmistakable: LotPilot gets the dealer FOUND by AI,
// then WINS the leads that creates. Command Center = overview, ROI = proof.
const NAV_GROUPS: { heading?: string; items: NavItem[] }[] = [
  { items: [{ href: "/dashboard", label: "Command Center", icon: "command", exact: true }] },
  {
    heading: "Get found by AI",
    items: [
      { href: "/dashboard/visibility", label: "AI Visibility", icon: "radar" },
      { href: "/dashboard/inventory", label: "Inventory AI", icon: "car" },
      { href: "/dashboard/demand", label: "Demand Intelligence", icon: "trending" },
    ],
  },
  {
    heading: "Win the lead",
    items: [
      { href: "/dashboard/leads", label: "Leads & Conversations", icon: "messages" },
      { href: "/dashboard/assistant", label: "AI Sales Assistant", icon: "bolt" },
    ],
  },
  {
    heading: "Prove it",
    items: [{ href: "/dashboard/roi", label: "ROI & Attribution", icon: "chart" }],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-4">
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.heading ?? gi} className="flex flex-col gap-1">
          {group.heading && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {group.heading}
            </p>
          )}
          {group.items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] tracking-[-0.01em] transition-all",
                  active
                    ? "bg-cyan/10 font-semibold text-cyan ring-1 ring-inset ring-cyan/20"
                    : "font-medium text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan" />
                )}
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                    active
                      ? "bg-cyan text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.65)]"
                      : "bg-ink/[0.05] text-ink-soft group-hover:bg-ink/[0.09] group-hover:text-ink",
                  )}
                >
                  <Icon name={item.icon} size={17} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

/** OEM franchise badge — clean shield mark + brand name (no external assets). */
function OemBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan/25 bg-cyan/[0.07] px-2 py-1 text-[11px] font-semibold text-cyan">
      <Icon name="shield" size={11} strokeWidth={2.5} />
      {name}
    </span>
  );
}

function SidebarInner({
  dealer,
  profile,
  onNavigate,
}: {
  dealer: Dealer;
  profile: Profile;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const oems = deriveOEMs(dealer.name);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-2">
        <Link href="/dashboard" onClick={onNavigate} aria-label="LotPilot dashboard">
          <Logo />
        </Link>
        <p className="mt-2 px-1 text-[11px] leading-snug text-ink-muted">
          Get your cars recommended by AI — then win every lead it creates.
        </p>
      </div>

      {/* dealer card */}
      <div className="surface mt-5 rounded-xl p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-black/[0.05] font-display text-gradient">
            {dealer.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{dealer.name}</p>
            <p className="truncate text-xs text-ink-muted">{dealer.metro}</p>
          </div>
        </div>

        {/* OEM franchise badge(s) — derived from the dealer name, real logos loaded live */}
        {oems.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {oems.map((o) => (
              <OemBadge key={o} name={o} />
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-black/[0.03] px-2.5 py-1.5">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
            Feed live
          </span>
          <span className="text-xs text-ink-faint">
            {dealer.feedType} · {dealer.lastSync}
          </span>
        </div>
      </div>

      <div className="mt-6 flex-1">
        <NavLinks onNavigate={onNavigate} />
      </div>

      {/* user / settings / logout */}
      <div className="mt-4 border-t border-line pt-4">
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="group -mx-1 flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-black/[0.04]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-violet/20 text-xs font-semibold text-violet">
            {initials(profile.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink">{profile.fullName}</p>
            <p className="truncate text-[11px] text-ink-faint">{profile.role}</p>
          </div>
          <Icon
            name="gauge"
            size={15}
            className="text-ink-faint transition-colors group-hover:text-ink"
          />
        </Link>
        <div className="mt-1 flex items-center gap-1 px-1 text-xs">
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className="rounded-md px-2 py-1 text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink"
          >
            Settings
          </Link>
          <span className="text-ink-faint">·</span>
          <button
            onClick={logout}
            className="rounded-md px-2 py-1 text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shell({
  title,
  intro,
  dealer,
  profile,
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  dealer: Dealer;
  profile: Profile;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[268px_1fr]">
      {/* desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-screen flex-col border-r border-line-strong bg-canvas-2/70 p-5 lg:flex">
        <SidebarInner dealer={dealer} profile={profile} />
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-line bg-canvas p-5">
            <SidebarInner dealer={dealer} profile={profile} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="relative min-w-0">
        {/* ambient backdrop — soft depth instead of flat white */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-canvas-2 to-transparent" />
          <div className="glow-cyan absolute -right-24 -top-28 h-80 w-80 opacity-50" />
          <div className="glow-accent absolute -left-24 -top-32 h-72 w-72 opacity-40" />
        </div>
        {/* topbar */}
        <header className="no-print sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-canvas/70 px-5 backdrop-blur-xl sm:px-8">
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink lg:hidden"
            aria-label="Open menu"
          >
            <Icon name="menu" size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg text-ink sm:text-xl">{title}</h1>
            {intro && <p className="hidden truncate text-xs text-ink-muted sm:block">{intro}</p>}
          </div>
          <Suspense fallback={null}>
            <DateRange />
          </Suspense>
          <span className="hidden sm:inline-flex">
            <PrintButton />
          </span>
          {dealer.id === "11111111-1111-1111-1111-111111111111" ? (
            <span className="hidden sm:inline-flex">
              <DemoBadge />
            </span>
          ) : (
            <span className="hidden items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-[11px] font-medium text-accent sm:inline-flex">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" /> Live
            </span>
          )}
        </header>

        <main className="px-5 pb-24 pt-6 sm:px-8 sm:py-8">{children}</main>
      </div>

      <Copilot dealerName={dealer.name} />
    </div>
  );
}
