"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const DEMO_EMAIL = "demo@capitolnissan.com";
const DEMO_PASSWORD = "LotPilotDemo!23";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(creds?: { email: string; password: string }) {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: creds?.email ?? email,
      password: creds?.password ?? password,
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Dealer sign in</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Welcome back. Let&apos;s see what your AI did.</p>

      <button
        onClick={() => signIn({ email: DEMO_EMAIL, password: DEMO_PASSWORD })}
        disabled={busy}
        className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan text-sm font-semibold text-ink-inverse transition-all hover:bg-cyan/90 cta-glow disabled:opacity-60"
      >
        {busy ? "Loading…" : "Enter the live demo →"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-line" /> or sign in <span className="h-px flex-1 bg-line" />
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
            <span className="normal-case tracking-normal text-ink-faint">Forgot?</span>
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

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <button
        onClick={() => signIn()}
        disabled={busy}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl border border-line-strong text-sm font-semibold text-ink transition-colors hover:bg-white/[0.04] disabled:opacity-60"
      >
        Sign in
      </button>

      <p className="mt-6 text-center text-xs text-ink-faint">
        New to LotPilot?{" "}
        <Link href="/signup" className="text-cyan hover:underline">
          Create your workspace
        </Link>
      </p>
    </div>
  );
}
