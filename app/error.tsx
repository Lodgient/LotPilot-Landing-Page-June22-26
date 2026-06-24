"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for logging/monitoring (wire Sentry here when added).
    console.error(error);
  }, [error]);

  return (
    <main className="overflow-x-clip bg-canvas">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-danger">Something broke</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">We hit a snag.</h1>
        <p className="mt-4 max-w-md text-ink-soft">
          An unexpected error occurred. Try again — if it keeps happening, head back home and
          we&apos;ll look into it.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center rounded-full bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-medium text-ink transition-colors hover:border-cyan/50"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
