"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const [dealership, setDealership] = useState("");
  const [fullName, setFullName] = useState("");
  const [metro, setMetro] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!dealership.trim()) return setError("Dealership name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid work email.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");

    setBusy(true);
    const supabase = createClient();
    // app:'dealer_portal' triggers server-side provisioning (dealer + profile)
    // and auto-confirm so the account is usable immediately.
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          app: "dealer_portal",
          dealership: dealership.trim(),
          full_name: fullName.trim(),
          metro: metro.trim(),
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }
    // Sign in right away (auto-confirmed by trigger).
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setError("Account created — please sign in.");
      setBusy(false);
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your workspace</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Spin up your dealer dashboard in seconds.
      </p>

      <div className="mt-7 space-y-3">
        <Field label="Dealership name" value={dealership} onChange={setDealership} placeholder="Capitol Nissan" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Your name" value={fullName} onChange={setFullName} placeholder="Dana Reyes" />
          <Field label="City / metro" value={metro} onChange={setMetro} placeholder="Austin, TX" />
        </div>
        <Field label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@dealership.com" />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          onEnter={submit}
        />
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan text-sm font-semibold text-ink-inverse transition-all hover:bg-cyan/90 cta-glow disabled:opacity-60"
      >
        {busy ? "Creating…" : "Create workspace →"}
      </button>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  onEnter?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
      />
    </label>
  );
}
