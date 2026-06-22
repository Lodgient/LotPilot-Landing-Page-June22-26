"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Demo only — no real auth. Drops into the dashboard.
  function signIn() {
    setBusy(true);
    setTimeout(() => router.push("/dashboard"), 450);
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Dealer sign in</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Welcome back. Let&apos;s see what your AI did.
      </p>

      <button
        onClick={signIn}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-line-strong bg-white/[0.03] text-sm font-medium text-ink transition-colors hover:bg-white/[0.06]"
      >
        <span className="text-base">G</span> Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
            Work email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
            placeholder="you@dealership.com"
            className="h-12 w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-ink-faint">
            Password
            <span className="text-cyan normal-case tracking-normal">Forgot?</span>
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
            placeholder="••••••••"
            className="h-12 w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
          />
        </label>
      </div>

      <button
        onClick={signIn}
        disabled={busy}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan text-sm font-semibold text-ink-inverse transition-all hover:bg-cyan/90 cta-glow disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in →"}
      </button>

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-line text-sm font-medium text-ink-soft transition-colors hover:bg-white/[0.04]"
      >
        View the live demo dashboard
      </button>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Not a partner yet?{" "}
        <Link href="/#audit" className="text-cyan hover:underline">
          Run your free AI audit
        </Link>
      </p>
    </div>
  );
}
