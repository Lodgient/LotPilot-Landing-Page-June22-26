"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { cn } from "@/lib/cn";

/**
 * FeedAgent — the conversational replacement for the old feed-connect lead form.
 * The dealer just talks to it: it answers questions, gathers a website + a way
 * to reach them, and quietly creates the lead via /api/lead. No form fields.
 * (Filename kept as FeedForm so existing imports keep working.)
 */

const FEED_TYPES = ["vAuto", "HomeNet", "Dealer.com", "DealerSocket", "CSV", "XML"];

const PROMPTS = [
  "We export from vAuto",
  "What formats do you accept?",
  "Is there any work for my team?",
];

type Msg =
  | { id: number; role: "assistant" | "user"; kind: "text"; text: string }
  | { id: number; role: "assistant"; kind: "done"; site: string };

let _id = 0;
const nid = () => ++_id;

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const DOMAIN_RE =
  /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+)\b/i;

interface Lead {
  website?: string;
  email?: string;
  phone?: string;
  feedType?: string;
  dealershipName?: string;
}

function extract(raw: string): Partial<Lead> {
  const out: Partial<Lead> = {};
  const email = raw.match(EMAIL_RE);
  if (email) out.email = email[0];
  // strip the email before phone-matching so the email's digits don't match
  const noEmail = raw.replace(EMAIL_RE, " ");
  const phone = noEmail.match(PHONE_RE);
  if (phone) out.phone = phone[1].trim();
  const dom = raw.match(DOMAIN_RE);
  if (
    dom &&
    dom[1] &&
    /\.(com|net|org|io|co|us|dealer|auto|cars?|biz|info|app|store)\b/i.test(dom[1]) &&
    !out.email?.includes(dom[1])
  ) {
    out.website = dom[1];
  }
  const feed = FEED_TYPES.find((f) =>
    new RegExp(`\\b${f.replace(".", "\\.")}\\b`, "i").test(raw),
  );
  if (feed) out.feedType = feed;
  return out;
}

export default function FeedForm() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: nid(),
      role: "assistant",
      kind: "text",
      text:
        "Hey — I'm the LotPilot onboarding agent. Tell me your dealership website and which tool you export inventory from (vAuto, HomeNet, Dealer.com, CSV…) and I'll get your feed connected. Ask me anything about how it works, too.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const lead = useRef<Lead>({});
  const leadSent = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const push = (m: Msg) => setMessages((x) => [...x, m]);
  const scrollToMsg = (id: number) =>
    timers.current.push(
      setTimeout(
        () =>
          document
            .getElementById(`fm-${id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80,
      ),
    );

  const sendLead = useCallback(async () => {
    leadSent.current = true;
    const l = lead.current;
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealershipName:
            l.dealershipName ||
            l.website?.replace(/^https?:\/\//, "").replace(/^www\./, "") ||
            "Dealer (via onboarding chat)",
          contactName: "",
          email: l.email || "",
          phone: l.phone || "",
          website: l.website || "",
          feedType: l.feedType || "Other",
          rooftops: "1",
          source: "feed-onboarding-chat",
        }),
      });
    } catch {
      /* never dead-end the conversation */
    }
  }, []);

  const streamAnswer = useCallback(async (history: Msg[], nudge?: string) => {
    setBusy(true);
    const id = nid();
    push({ id, role: "assistant", kind: "text", text: "" });
    try {
      const payload = history
        .filter((m): m is Extract<Msg, { kind: "text" }> => m.kind === "text")
        .map((m) => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok || !res.body) throw new Error("unreachable");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((x) =>
          x.map((m) => (m.id === id && m.kind === "text" ? { ...m, text: acc } : m)),
        );
      }
      if (nudge) {
        setMessages((x) =>
          x.map((m) =>
            m.id === id && m.kind === "text" ? { ...m, text: `${acc}\n\n${nudge}` } : m,
          ),
        );
      }
    } catch {
      setMessages((x) =>
        x.map((m) =>
          m.id === id && m.kind === "text"
            ? {
                ...m,
                text:
                  nudge ||
                  "We accept the export your current tools already produce — vAuto, HomeNet, Dealer.com, DealerSocket, CSV or XML. What's your dealership website?",
              }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const reply = useCallback(
    (text: string, history: Msg[]) => {
      Object.assign(lead.current, extract(text));
      const l = lead.current;
      const hasContact = Boolean(l.email || l.phone);

      // Enough to create the lead → confirm and log it.
      if (!leadSent.current && l.website && hasContact) {
        sendLead();
        const id = nid();
        push({ id, role: "assistant", kind: "done", site: l.website });
        scrollToMsg(id);
        return;
      }

      // Have a site, still need a way to reach them.
      if (!leadSent.current && l.website && !hasContact) {
        const id = nid();
        push({
          id,
          role: "assistant",
          kind: "text",
          text: `Perfect — I can prep the connection for ${l.website.replace(
            /^https?:\/\//,
            "",
          )}${l.feedType ? ` (${l.feedType} feed)` : ""}. What's the best email or phone for a LotPilot specialist to confirm go-live? No work needed on your end.`,
        });
        scrollToMsg(id);
        return;
      }

      // Have contact but no site yet.
      if (!leadSent.current && hasContact && !l.website) {
        const id = nid();
        push({
          id,
          role: "assistant",
          kind: "text",
          text: "Got it. What's your dealership website so I can prep your inventory feed?",
        });
        scrollToMsg(id);
        return;
      }

      // Otherwise it's a question — answer it, and nudge toward connecting if we still need info.
      const nudge =
        !leadSent.current && !l.website
          ? "Whenever you're ready, drop your dealership website and I'll start the connection."
          : undefined;
      streamAnswer(history, nudge);
    },
    [sendLead, streamAnswer],
  );

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setInput("");
      const userMsg: Msg = { id: nid(), role: "user", kind: "text", text };
      setMessages((x) => [...x, userMsg]);
      scrollToMsg(userMsg.id);
      reply(text, [...messages, userMsg]);
    },
    [busy, messages, reply],
  );

  return (
    <div className="surface relative overflow-hidden rounded-2xl">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />

      {/* header */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/25">
          <Icon name="sparkles" size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">LotPilot Onboarding Agent</p>
          <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Online · connects your feed in minutes
          </p>
        </div>
      </div>

      {/* conversation */}
      <div className="space-y-4 px-4 py-5 sm:px-5">
        {messages.map((m) => (
          <div key={m.id} id={`fm-${m.id}`} className="scroll-mt-24">
            <MessageView m={m} />
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="rounded-full border border-line-strong bg-black/[0.02] px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="border-t border-line bg-black/[0.015] p-3"
      >
        <div className="flex items-end gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me your website + export tool…  e.g. yourstore.com, vAuto"
            className="h-12 flex-1 rounded-xl border border-line-strong bg-canvas px-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-cyan/60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow disabled:translate-y-0 disabled:opacity-50"
          >
            <Icon name="arrow-right" size={20} strokeWidth={2.25} />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-ink-faint">
          No forms. Just tell the agent about your store — it handles the rest.
        </p>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- views */

function Avatar() {
  return (
    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/20">
      <Icon name="sparkles" size={16} />
    </span>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="pulse-dot h-1.5 w-1.5 rounded-full bg-ink-faint"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function MessageView({ m }: { m: Msg }) {
  if (m.kind === "text" && m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2.5 text-sm text-ink-inverse shadow-sm">
          {m.text}
        </div>
      </div>
    );
  }

  if (m.kind === "text") {
    return (
      <div className="flex items-start gap-2.5">
        <Avatar />
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-line bg-black/[0.02] px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
          {m.text || <Dots />}
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="flex items-start gap-2.5">
      <Avatar />
      <div className="w-full rounded-2xl rounded-tl-sm border border-accent/30 bg-accent/[0.06] p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/25">
            <Icon name="check" size={18} strokeWidth={2.5} />
          </span>
          <p className="text-base font-semibold text-ink">
            You&apos;re in. We&apos;ll take it from here.
          </p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          I&apos;ve logged{" "}
          <span className="font-medium text-ink">
            {m.site.replace(/^https?:\/\//, "")}
          </span>{" "}
          and a LotPilot specialist will reach out to confirm your feed and walk
          you through go-live. No work needed on your end yet — keep asking me
          anything in the meantime.
        </p>
      </div>
    </div>
  );
}
