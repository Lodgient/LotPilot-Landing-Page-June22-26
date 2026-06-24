"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import type { Dealer, Profile } from "@/lib/dashboard/types";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "profile", label: "Profile", icon: "name" },
  { id: "dealership", label: "Dealership", icon: "shield" },
  { id: "feed", label: "Feed & Integrations", icon: "globe" },
  { id: "agent", label: "AI Sales Agent", icon: "bolt" },
  { id: "billing", label: "Billing", icon: "file" },
  { id: "notifications", label: "Notifications", icon: "messages" },
  { id: "team", label: "Team", icon: "handoff" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-cyan" : "bg-black/[0.12]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SaveBar({ note }: { note?: string }) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
      <p className="text-xs text-ink-faint">{note ?? "Changes apply across your workspace."}</p>
      <button className="inline-flex h-10 items-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow">
        Save changes
      </button>
    </div>
  );
}

export default function SettingsView({ dealer, profile }: { dealer: Dealer; profile: Profile }) {
  const [tab, setTab] = useState<TabId>("profile");
  const [notif, setNotif] = useState({
    recap: true,
    hotLead: true,
    boardReport: true,
    visibilityDrop: true,
    productNews: false,
  });
  const first = profile.fullName.split(" ")[0] ?? "";
  const last = profile.fullName.split(" ").slice(1).join(" ");
  const oems = dealer.name.match(/nissan|infiniti|toyota|honda|ford|chevrolet|kia|hyundai|bmw|audi|lexus/gi) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
      {/* tab rail */}
      <nav
        role="tablist"
        aria-label="Settings"
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={cn(
                "group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] tracking-[-0.01em] transition-all",
                on
                  ? "bg-cyan/10 font-semibold text-cyan ring-1 ring-inset ring-cyan/20"
                  : "font-medium text-ink-soft hover:bg-black/[0.04] hover:text-ink",
              )}
            >
              {on && (
                <span className="absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan lg:block" />
              )}
              <Icon name={t.icon as IconName} size={16} />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* panels */}
      <div>
        {tab === "profile" && (
          <Card>
            <PanelHeading title="Profile" sub="Your name and how the workspace addresses you" />
            <div className="mb-6 flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-violet/15 font-display text-2xl text-violet">
                {initials(profile.fullName)}
              </span>
              <button className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:border-cyan/50">
                Change photo
              </button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name">
                <input className="input" defaultValue={first} />
              </Field>
              <Field label="Last name">
                <input className="input" defaultValue={last} />
              </Field>
              <Field label="Work email">
                <input className="input" defaultValue="duncan@capitolnissan.com" />
              </Field>
              <Field label="Role / title">
                <input className="input" defaultValue={profile.role} />
              </Field>
              <Field label="Mobile (for hot-lead alerts)">
                <input className="input" defaultValue="(408) 555-0142" />
              </Field>
              <Field label="Timezone">
                <select className="input" defaultValue="PT">
                  <option value="PT">Pacific (PT)</option>
                  <option value="MT">Mountain (MT)</option>
                  <option value="CT">Central (CT)</option>
                  <option value="ET">Eastern (ET)</option>
                </select>
              </Field>
            </div>
            <SaveBar />
          </Card>
        )}

        {tab === "dealership" && (
          <Card>
            <PanelHeading title="Dealership" sub="The rooftop this workspace represents" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Dealership name">
                <input className="input" defaultValue={dealer.name} />
              </Field>
              <Field label="Market / metro">
                <input className="input" defaultValue={dealer.metro} />
              </Field>
              <Field label="Rooftops">
                <input className="input" defaultValue={String(dealer.rooftops || 1)} />
              </Field>
              <Field label="Inventory size">
                <input className="input" defaultValue={`${dealer.vehicles || 0} vehicles`} />
              </Field>
            </div>
            <div className="mt-5">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Franchise brands</span>
              <div className="flex flex-wrap gap-2">
                {(oems.length ? [...new Set(oems.map((o) => o[0].toUpperCase() + o.slice(1).toLowerCase()))] : ["Nissan", "Infiniti"]).map(
                  (o) => (
                    <span
                      key={o}
                      className="inline-flex items-center gap-1.5 rounded-md border border-cyan/25 bg-cyan/[0.07] px-2.5 py-1 text-[12px] font-semibold text-cyan"
                    >
                      <Icon name="shield" size={12} strokeWidth={2.5} />
                      {o}
                    </span>
                  ),
                )}
              </div>
            </div>
            <SaveBar />
          </Card>
        )}

        {tab === "feed" && (
          <Card>
            <PanelHeading
              title="Feed & Integrations"
              sub="Where LotPilot pulls your live inventory — the only setup you need"
            />
            <div className="space-y-3">
              {[
                { name: "vAuto", desc: `Inventory feed · synced ${dealer.lastSync || "recently"}`, connected: true },
                { name: "Dealer.com", desc: "Website + VDP source", connected: false },
                { name: "DealerSocket CRM", desc: "Push qualified leads + appointments", connected: false },
                { name: "HomeNet", desc: "Alternate inventory export", connected: false },
              ].map((it) => (
                <div
                  key={it.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-black/[0.02] p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-canvas-2 text-ink-soft">
                      <Icon name="globe" size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{it.name}</p>
                      <p className="text-xs text-ink-muted">{it.desc}</p>
                    </div>
                  </div>
                  {it.connected ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-3 py-1 text-xs font-medium text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Connected
                    </span>
                  ) : (
                    <button className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:border-cyan/50">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "agent" && (
          <Card>
            <PanelHeading title="AI Sales Agent" sub="How your AI works every lead" />
            <div className="rounded-xl border border-violet/25 bg-violet/[0.05] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet font-display text-lg text-white">
                    A
                  </span>
                  <div>
                    <p className="font-display text-lg text-ink">Ava</p>
                    <p className="text-xs text-ink-muted">SMS + voice · 24/7 · replies in ~11s</p>
                  </div>
                </div>
                <Badge tone="accent">● Live</Badge>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-soft">
              Persona, greeting, channels, voice and human-handoff are configured in the full agent
              console.
            </p>
            <Link
              href="/dashboard/assistant"
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
            >
              Configure agent <Icon name="arrow-right" size={15} />
            </Link>
          </Card>
        )}

        {tab === "billing" && (
          <Card>
            <PanelHeading title="Billing" sub="Your plan, invoices and payment method" />
            <div className="rounded-2xl border border-cyan/25 bg-cyan/[0.04] p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-cyan">Current plan</p>
                  <p className="mt-1 font-display text-2xl text-ink">AI Visibility + Sales Agent</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-4xl text-ink">$1,098</p>
                  <p className="text-xs text-ink-muted">/mo all-in</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
                <li className="flex items-center justify-between">
                  <span>AI Visibility</span>
                  <span className="tabular-nums text-ink">$399/mo</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>AI Sales Agent</span>
                  <span className="tabular-nums text-ink">$699/mo</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-ink-faint">
                Founding rate, locked for life · next invoice Jul 24, 2026 · cancel anytime
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-black/[0.02] p-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-canvas-2 text-ink-soft">
                  <Icon name="file" size={16} />
                </span>
                <p className="text-sm text-ink-soft">Visa ending 4242</p>
              </div>
              <button className="text-sm font-medium text-cyan hover:underline">Update</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:border-cyan/50">
                Download invoices
              </button>
              <button className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:border-cyan/50">
                Manage billing
              </button>
            </div>
          </Card>
        )}

        {tab === "notifications" && (
          <Card>
            <PanelHeading title="Notifications" sub="What LotPilot tells you, and how" />
            <ul className="divide-y divide-line">
              {(
                [
                  { key: "recap", label: "Daily AI recap", desc: "Morning email of what your AI did overnight" },
                  { key: "hotLead", label: "Hot-lead alerts", desc: "Text me when a buyer is ready for a human close" },
                  { key: "boardReport", label: "Weekly board report", desc: "Sunday summary for ownership" },
                  { key: "visibilityDrop", label: "Visibility drop alerts", desc: "Tell me if a competitor starts out-citing us" },
                  { key: "productNews", label: "Product news", desc: "New LotPilot features and tips" },
                ] as { key: keyof typeof notif; label: string; desc: string }[]
              ).map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{row.label}</p>
                    <p className="text-xs text-ink-muted">{row.desc}</p>
                  </div>
                  <Switch on={notif[row.key]} onClick={() => setNotif((n) => ({ ...n, [row.key]: !n[row.key] }))} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === "team" && (
          <Card>
            <PanelHeading
              title="Team"
              sub="Who can access this workspace"
              action={
                <button className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cyan px-4 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim">
                  <Icon name="handoff" size={14} /> Invite
                </button>
              }
            />
            <ul className="space-y-2.5">
              {[
                { name: profile.fullName, role: profile.role, tag: "Owner", you: true },
                { name: "Marcus Pratt", role: "Sales Manager", tag: "Admin", you: false },
                { name: "Renee Cole", role: "BDC Lead", tag: "Member", you: false },
              ].map((m) => (
                <li
                  key={m.name}
                  className="flex items-center gap-3 rounded-xl border border-line bg-black/[0.02] p-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-violet/15 text-xs font-semibold text-violet">
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {m.name} {m.you && <span className="text-ink-faint">· you</span>}
                    </p>
                    <p className="truncate text-xs text-ink-muted">{m.role}</p>
                  </div>
                  <Badge tone={m.tag === "Owner" ? "accent" : "neutral"}>{m.tag}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
