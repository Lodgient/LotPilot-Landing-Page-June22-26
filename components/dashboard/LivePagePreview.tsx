"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { ENGINES, type Dealer, type Vehicle } from "@/lib/dashboard/types";
import { resolveLivePageUrl } from "@/lib/inventory/livePage";
import { cn } from "@/lib/cn";

const money = (n: number) => "$" + n.toLocaleString();

// Deterministic AI Q&A built from the VIN's own data — the answer-engine-citable
// content that makes the page legible to ChatGPT / Perplexity / AI Overviews.
function buildQA(d: Dealer, v: Vehicle): { q: string; a: string }[] {
  const name = `${v.year} ${v.make} ${v.model} ${v.trim}`.trim();
  return [
    {
      q: `Is the ${name} available near ${d.metro.split(",")[0]}?`,
      a: `Yes — ${d.name} has this ${name} in stock (VIN ${v.vin}) at ${money(v.price)}. It's a ${v.stockType.toLowerCase()} unit with ${v.mileage.toLocaleString()} miles, available now.`,
    },
    {
      q: `How much is the ${name} at ${d.name}?`,
      a: `The ${name} is listed at ${money(v.price)}. ${d.name} can confirm current pricing, incentives, and financing in seconds via their AI assistant.`,
    },
    {
      q: `What are the key specs of this ${v.make} ${v.model}?`,
      a: `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}, ${v.body}, ${v.mileage.toLocaleString()} miles, ${v.stockType.toLowerCase()}. VIN ${v.vin}. Located at ${d.name} in ${d.metro}.`,
    },
  ];
}

export default function LivePagePreview({
  dealer,
  vehicle,
  onClose,
}: {
  dealer: Dealer;
  vehicle: Vehicle;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const url = resolveLivePageUrl(dealer, vehicle);
  const path = url.replace(/^https?:\/\//, "");
  const synced = !!vehicle.liveUrl;
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const qa = buildQA(dealer, vehicle);
  const citing = ENGINES.filter((e) => vehicle.engines[e]);

  function copy() {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full max-h-[860px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl">
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-canvas-2 px-3 py-2.5">
          <div className="flex gap-1.5 pl-1">
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
          </div>
          <div className="ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5">
            <Icon name="shield" size={13} className="shrink-0 text-accent" />
            <span className="truncate font-mono text-[11px] text-ink-soft">{path}</span>
          </div>
          <button
            onClick={copy}
            className="hidden h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs text-ink-muted hover:text-ink sm:inline-flex"
          >
            <Icon name={copied ? "check" : "copy"} size={13} /> {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-cyan px-2.5 text-xs font-semibold text-ink-inverse hover:bg-cyan/90"
          >
            <Icon name="external" size={13} /> Open
          </a>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-white/[0.05] hover:text-ink"
            aria-label="Close preview"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* rendered page */}
        <div className="scroll-slim flex-1 overflow-y-auto bg-canvas">
          {/* site header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/20">
                <Icon name="bolt" size={15} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink">{dealer.name}</p>
                <p className="text-[11px] text-ink-faint">{dealer.metro}</p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                synced
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-line bg-white/[0.04] text-ink-muted",
              )}
            >
              <Icon name="shield" size={12} /> {synced ? "Live · AI-verified by LotPilot" : "Preview"}
            </span>
          </div>

          {/* real listing photo when the VIN is synced from the page system */}
          {vehicle.liveImage && !imgError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.liveImage}
              alt={`${name} at ${dealer.name}`}
              className="h-52 w-full object-cover sm:h-64"
              onError={() => setImgError(true)}
            />
          )}

          <div className="px-6 py-6 sm:px-8">
            {/* hero */}
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {vehicle.stockType} · VIN {vehicle.vin}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {name} <span className="text-ink-muted">{vehicle.trim}</span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
              <span className="text-2xl font-bold text-gradient">{money(vehicle.price)}</span>
              <span className="text-ink-muted">{vehicle.mileage.toLocaleString()} mi</span>
              <span className="text-ink-muted">{vehicle.body}</span>
              <span className="text-ink-muted">{vehicle.daysOnLot} days on lot</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex h-10 items-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse">
                Check availability
              </span>
              <span className="inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm font-medium text-ink">
                Message the dealer
              </span>
            </div>

            {/* AI answer block — the citable content */}
            <section className="mt-7">
              <div className="mb-3 flex items-center gap-2">
                <Icon name="sparkles" size={16} className="text-cyan" />
                <h2 className="text-sm font-semibold text-ink">Answers AI engines can cite</h2>
              </div>
              <div className="space-y-2.5">
                {qa.map((item, i) => (
                  <div key={i} className="rounded-xl border border-line bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-ink">{item.q}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* specs */}
            <section className="mt-7">
              <h2 className="mb-3 text-sm font-semibold text-ink">Vehicle details</h2>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                {[
                  ["Year", String(vehicle.year)],
                  ["Make", vehicle.make],
                  ["Model", vehicle.model],
                  ["Trim", vehicle.trim || "—"],
                  ["Body", vehicle.body],
                  ["Mileage", `${vehicle.mileage.toLocaleString()} mi`],
                  ["Stock", vehicle.stockType],
                  ["Price", money(vehicle.price)],
                  ["VIN", vehicle.vin],
                ].map(([k, val]) => (
                  <div key={k} className="bg-canvas px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-ink-faint">{k}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">{val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* schema + citations proof */}
            <section className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-white/[0.02] p-4">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Structured data live
                </p>
                <ul className="space-y-1.5">
                  {["Vehicle schema (JSON-LD)", "Offer + price markup", "FAQ / Q&A markup", "LocalBusiness + geo"].map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-ink-soft">
                      <Icon name="check" size={14} strokeWidth={2.25} className="text-accent" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-line bg-white/[0.02] p-4">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {citing.length ? "Cited by" : "Not yet cited"}
                </p>
                {citing.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {citing.map((e) => (
                      <span
                        key={e}
                        className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[11px] text-accent"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">
                    This page is published and indexing. LotPilot is working it toward its first AI
                    citations.
                  </p>
                )}
              </div>
            </section>

            <p className="mt-7 border-t border-line pt-4 text-center text-[11px] text-ink-faint">
              Published &amp; maintained by LotPilot · Updates automatically from {dealer.name}&apos;s live feed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
