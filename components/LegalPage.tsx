import type { ReactNode } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export function legalMetadata(title: string): Metadata {
  return { title, robots: { index: true, follow: true } };
}

export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Legal</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-ink-muted">Last updated {updated}</p>
          {intro && <p className="mt-5 text-pretty text-base leading-relaxed text-ink-soft">{intro}</p>}
          <div className="legal mt-8 text-[15px] leading-relaxed text-ink-soft">{children}</div>
          <p className="mt-12 border-t border-line pt-6 text-sm text-ink-muted">
            Questions? Email{" "}
            <a href="mailto:privacy@lotpilot.com" className="text-cyan underline">
              privacy@lotpilot.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
