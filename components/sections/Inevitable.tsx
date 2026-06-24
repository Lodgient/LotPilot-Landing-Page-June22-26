const STARK = [
  { k: "Every buyer", v: "asks AI first now" },
  { k: "One answer", v: "names just a few stores" },
  { k: "Be in it", v: "or be invisible" },
];

export default function Inevitable() {
  return (
    <section id="why-now" className="relative overflow-hidden bg-[#0a0f1a] py-24 text-[#f8fafc] sm:py-32">
      {/* ambient blue glows for drama */}
      <div className="pointer-events-none absolute -left-24 top-0 h-[440px] w-[540px] bg-[radial-gradient(ellipse_at_30%_30%,rgba(56,189,248,0.18),transparent_60%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[440px] w-[540px] bg-[radial-gradient(ellipse_at_70%_70%,rgba(37,99,235,0.16),transparent_60%)] blur-2xl" />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#5b8def]/40 bg-[#0f1b33]/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8fc7ff]">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
          The shift is already here
        </span>

        <h2 className="mx-auto mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[3.3rem]">
          Buyers stopped Googling. They&apos;re asking AI which car to buy — and{" "}
          <span className="text-[#5cb8ff]">it only names a few stores.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#f8fafc]/80 sm:text-lg">
          Whichever dealers AI recommends will quietly take the customers from the ones it doesn&apos;t —
          and that gap compounds every single month. This is the SEO land-grab all over again: the
          stores that moved first owned Google for a decade. AI search is wide open today. It
          won&apos;t be for long — and the dealers who wait will spend years buying back ground the
          early movers got for free.
        </p>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-stretch justify-center gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:flex-row">
          {STARK.map((s) => (
            <div key={s.k} className="flex-1 bg-white/[0.02] px-6 py-5">
              <p className="font-serif text-lg font-semibold text-[#f8fafc]">{s.k}</p>
              <p className="mt-1 text-sm text-[#f8fafc]/65">{s.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#audit"
            className="group inline-flex items-center gap-3 rounded-sm bg-[#2563eb] px-9 py-[18px] text-[12px] font-medium uppercase tracking-[1.5px] text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
          >
            See if AI recommends you — free
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#product"
            className="inline-flex items-center rounded-sm border border-white/30 px-9 py-[18px] text-[12px] font-medium uppercase tracking-[1.5px] text-[#f8fafc] transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#0a0f1a]"
          >
            See the platform
          </a>
        </div>
        <p className="mt-5 text-xs text-[#f8fafc]/50">
          No card. No call. 60 seconds to know exactly where you stand.
        </p>
      </div>
    </section>
  );
}
