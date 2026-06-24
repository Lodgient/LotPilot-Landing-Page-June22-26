import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your dealer workspace",
  robots: { index: false, follow: false },
};

const POINTS = [
  "Per-VIN AI visibility across every answer engine",
  "AI agent that works every lead 24/7",
  "Demand intelligence + competitor share of voice",
  "You own every customer — no lead reselling",
];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-line bg-canvas-2 p-12 lg:flex lg:flex-col">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="glow-cyan pointer-events-none absolute -top-20 left-10 h-[420px] w-[420px] opacity-70" />
        <div className="glow-violet pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] opacity-70" />

        <div className="relative">
          <Link href="/" aria-label="LotPilot home">
            <Logo />
          </Link>
        </div>

        <div className="relative mt-auto">
          <h2 className="max-w-md text-balance text-3xl font-semibold leading-tight tracking-tight text-ink">
            Your inventory, <span className="font-display text-gradient">recommended by AI.</span>{" "}
            Your leads, <span className="font-display text-gradient">worked by AI.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs text-accent">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-ink-faint">
            Delaware C-Corp · US data only · FCRA-aligned · No lead reselling
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <SignupForm plan={plan} />
        </div>
      </div>
    </main>
  );
}
