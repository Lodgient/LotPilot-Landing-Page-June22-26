import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Dealer sign in",
  robots: { index: false, follow: false },
};

const WINS = [
  { icon: "📅", text: "Booked 2 appointments overnight" },
  { icon: "📄", text: "Captured 3 credit applications" },
  { icon: "◎", text: "Now cited by ChatGPT for ‘best used SUV near Austin’" },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-line bg-canvas-2 p-12 lg:flex lg:flex-col">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="glow-accent pointer-events-none absolute -top-20 left-10 h-[420px] w-[420px] opacity-70" />
        <div className="glow-violet pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] opacity-70" />

        <div className="relative">
          <Link href="/" aria-label="LotPilot home">
            <Logo />
          </Link>
        </div>

        <div className="relative mt-auto">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            While you were away
          </p>
          <h2 className="mt-4 max-w-md text-balance text-3xl font-semibold leading-tight tracking-tight text-ink">
            Your inventory got{" "}
            <span className="font-display text-gradient">recommended by AI</span> — and your leads
            got <span className="font-display text-gradient">worked by AI.</span>
          </h2>

          <ul className="mt-8 space-y-3">
            {WINS.map((w) => (
              <li
                key={w.text}
                className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] p-3.5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.05] text-base">
                  {w.icon}
                </span>
                <span className="text-sm text-ink-soft">{w.text}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs text-ink-faint">
            Delaware C-Corp · US data only · FCRA-aligned · No lead reselling
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
