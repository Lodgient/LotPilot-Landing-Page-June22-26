"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { Card } from "@/components/dashboard/ui";
import { cn } from "@/lib/cn";

type State = "idle" | "calling" | "done" | "unavailable" | "error";

export default function CallMe() {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>("idle");

  async function call() {
    if (!phone.trim() || !consent || state === "calling") return;
    setState("calling");
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, consent }),
      });
      if (res.status === 503) {
        setState("unavailable");
        return;
      }
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  const ready = phone.trim().length >= 7 && consent && state !== "calling";

  return (
    <Card glow className="relative overflow-hidden">
      <div className="glow-cyan pointer-events-none absolute -left-10 -top-16 h-56 w-56 opacity-40" />
      <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/25">
            <Icon name="phone" size={22} />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              Get a live call from Ava
            </h3>
            <p className="mt-1 max-w-md text-sm text-ink-muted">
              Don&apos;t take our word for it — have Ava call your phone right now and hear
              exactly how she works a buyer, live.
            </p>
          </div>
        </div>

        {state === "done" ? (
          <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] p-4">
            <Icon name="check" size={18} className="text-accent" strokeWidth={2.25} />
            <p className="text-sm text-ink-soft">
              Ava is calling you now — pick up and have a chat.
            </p>
          </div>
        ) : state === "unavailable" ? (
          <div className="flex items-center gap-3 rounded-xl border border-line-strong bg-black/[0.02] p-4">
            <Icon name="shield" size={18} className="text-ink-muted" />
            <p className="text-sm text-ink-muted">
              Live calling isn&apos;t switched on in this demo yet. Ask your LotPilot rep to
              enable it.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                aria-label="Your phone number"
                className="input h-11 flex-1"
              />
              <button
                onClick={call}
                disabled={!ready}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors",
                  ready
                    ? "bg-cyan text-ink-inverse cta-glow hover:bg-cyan/90"
                    : "bg-cyan/40 text-ink-inverse/70",
                )}
              >
                <Icon name="phone" size={15} strokeWidth={2} />
                {state === "calling" ? "Calling…" : "Call me"}
              </button>
            </div>
            <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-ink-faint">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-cyan"
              />
              I agree to receive a one-time automated demo call at this number. Standard
              carrier rates may apply.
            </label>
            {state === "error" && (
              <p className="mt-2 text-xs text-warn">
                We couldn&apos;t place the call. Check the number and try again.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
