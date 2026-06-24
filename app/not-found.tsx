import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 pt-24 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">404</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            This page took a wrong turn.
          </h1>
          <p className="mt-4 max-w-md text-ink-soft">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back
            to where the cars get found.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-full bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
            >
              Back home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-medium text-ink transition-colors hover:border-cyan/50"
            >
              See the live demo
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
