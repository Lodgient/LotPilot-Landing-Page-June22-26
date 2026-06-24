import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import CheckoutButton from "@/components/CheckoutButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Activate your workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const INCLUDES = [
  "An AI-searchable page for every VIN",
  "Visibility monitor across every AI engine",
  "Competitor & share-of-voice tracking",
  "Board-ready monthly report",
];

export default async function ActivatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup?plan=visibility");

  const { data: profile } = await supabase
    .from("dp_profiles")
    .select("dealer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.dealer_id) redirect("/dashboard");

  const dealership = ((user.user_metadata?.dealership as string) || "your dealership").trim();

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="LotPilot home" className="inline-block">
          <Logo />
        </Link>

        <h1 className="mt-8 font-display text-3xl text-ink sm:text-4xl">One step left.</h1>
        <p className="mt-3 text-ink-soft">
          Start your subscription to activate <span className="font-medium text-ink">{dealership}</span>
          ’s workspace — your dashboard lights up the moment you do.
        </p>

        <div className="surface mt-6 rounded-2xl p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-cyan">AI Visibility</p>
              <p className="mt-1 text-xs text-ink-faint">Founding rate, locked for life</p>
            </div>
            <p className="font-display text-3xl text-ink">
              $399<span className="text-base text-ink-muted">/mo</span>
            </p>
          </div>
          <ul className="mt-4 space-y-2">
            {INCLUDES.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-ink-soft">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                  <Icon name="check" size={12} strokeWidth={2.5} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <CheckoutButton
            plans={["visibility"]}
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow disabled:opacity-70"
          >
            Start AI Visibility — $399/mo
            <Icon name="arrow-right" size={16} />
          </CheckoutButton>
        </div>
        <p className="mt-3 text-center text-xs text-ink-faint">
          Cancel anytime · add the AI Sales Agent later from your dashboard
        </p>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Wrong account?{" "}
          <Link href="/login" className="text-cyan hover:underline">
            Switch
          </Link>
        </p>
      </div>
    </main>
  );
}
