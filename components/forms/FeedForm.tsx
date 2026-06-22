"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const FEED_TYPES = [
  "vAuto",
  "HomeNet",
  "Dealer.com",
  "DealerSocket",
  "CSV",
  "XML",
  "Other",
];

interface FormState {
  dealershipName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  feedType: string;
  rooftops: string;
}

const EMPTY: FormState = {
  dealershipName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  feedType: FEED_TYPES[0],
  rooftops: "1",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FeedForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Controlled submit — never relies on native <form> submission (per brief §6).
  async function submit() {
    setError(null);
    if (!form.dealershipName.trim()) return setError("Dealership name is required.");
    if (!EMAIL_RE.test(form.email.trim())) return setError("Enter a valid work email.");

    setBusy(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid place-items-center rounded-2xl border border-accent/30 bg-accent/[0.06] p-10 text-center"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-2xl text-accent">
          ✓
        </span>
        <h3 className="mt-4 text-xl font-semibold">You&apos;re in. We&apos;ll take it from here.</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          A LotPilot specialist will reach out to confirm your feed and walk you
          through go-live. No work needed on your end yet.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="surface rounded-2xl p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Dealership name *" value={form.dealershipName} onChange={update("dealershipName")} placeholder="Smith Auto Group" />
        <Input label="Your name" value={form.contactName} onChange={update("contactName")} placeholder="Jordan Smith" />
        <Input label="Work email *" type="email" value={form.email} onChange={update("email")} placeholder="you@dealership.com" />
        <Input label="Phone" type="tel" value={form.phone} onChange={update("phone")} placeholder="(555) 010-0199" />
        <Input label="Current website" type="url" value={form.website} onChange={update("website")} placeholder="yourdealership.com" />

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
            Feed type
          </span>
          <select
            value={form.feedType}
            onChange={(e) => update("feedType")(e.target.value)}
            className="h-12 w-full rounded-xl border border-line-strong bg-white/[0.03] px-3 text-sm text-ink focus:border-cyan/60 focus:outline-none"
          >
            {FEED_TYPES.map((t) => (
              <option key={t} value={t} className="bg-panel text-ink">
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
            Number of rooftops
          </span>
          <input
            type="number"
            min={1}
            value={form.rooftops}
            onChange={(e) => update("rooftops")(e.target.value)}
            className="h-12 w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 text-sm text-ink focus:border-cyan/60 focus:outline-none sm:w-40"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-full bg-cyan px-7 py-4 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Sending…" : "Connect my feed →"}
      </button>
      <p className="mt-3 text-xs text-ink-faint">
        We accept the export you already produce. Zero new work for your team.
      </p>
    </div>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
        {props.label}
      </span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="h-12 w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
      />
    </label>
  );
}
