"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What does my AI Visibility score mean?",
  "Which cars are invisible to AI?",
  "How is my AI Sales Assistant doing?",
  "Explain the ROI page to me",
];

export default function Copilot({ dealerName }: { dealerName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text().catch(() => "request failed"));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `Sorry — I couldn't reach the assistant. ${err instanceof Error ? err.message : ""}`,
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open LotPilot Copilot"
        className={cn(
          "no-print fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full shadow-lg transition-all hover:-translate-y-0.5",
          "bg-cyan text-ink-inverse cta-glow",
          open && "rotate-90",
        )}
      >
        <Icon name={open ? "close" : "sparkles"} size={24} strokeWidth={2} />
      </button>

      {/* panel */}
      {open && (
        <div className="no-print fixed bottom-24 right-5 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-canvas-2 shadow-2xl">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-line bg-white/[0.02] px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/20">
              <Icon name="sparkles" size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">LotPilot Copilot</p>
              <p className="truncate text-[11px] text-ink-faint">Knows {dealerName}&apos;s live data</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto grid h-7 w-7 place-items-center rounded-md text-ink-muted hover:bg-white/[0.05] hover:text-ink"
              aria-label="Close"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted">
                  Hi — I&apos;m your Copilot. Ask me about your visibility, inventory, leads, ROI,
                  or how anything in LotPilot works.
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-left text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm",
                    m.role === "user"
                      ? "bg-cyan text-ink-inverse"
                      : "border border-line bg-white/[0.02] text-ink-soft",
                  )}
                >
                  {m.content || (busy && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
          </div>

          {/* composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-line bg-white/[0.02] p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask anything about your dashboard…"
                className="max-h-28 min-h-[40px] flex-1 resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-cyan/50"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan text-ink-inverse transition-colors hover:bg-cyan/90 disabled:opacity-50"
              >
                <Icon name="arrow-right" size={18} strokeWidth={2.25} />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-ink-faint">
              Answers use your live LotPilot data. Double-check anything important.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
