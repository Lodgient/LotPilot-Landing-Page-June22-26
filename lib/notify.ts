// Lightweight notifications + observability. No SDKs — uses Slack + Resend REST
// APIs via fetch, all env-gated so everything no-ops cleanly until configured.
//
//   SLACK_WEBHOOK_URL        — incoming-webhook for new-lead + error pings
//   SLACK_ERROR_WEBHOOK_URL  — (optional) separate channel for errors
//   RESEND_API_KEY           — transactional email
//   EMAIL_FROM               — e.g. "LotPilot <hello@lotpilot.com>"

const SITE = "https://lotpilot.com";

async function postSlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    /* never let a notification break the request */
  }
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true };
  const from = process.env.EMAIL_FROM || "LotPilot <hello@lotpilot.com>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/** Internal Slack ping when a new lead arrives. */
export async function notifyNewLead(lead: {
  kind: string;
  dealership: string;
  email: string;
  score?: number | null;
  website?: string | null;
  city?: string | null;
  feedType?: string | null;
}): Promise<void> {
  const bits = [
    `🚗 *New ${lead.kind} lead* — ${lead.dealership}`,
    `• ${lead.email}`,
    lead.website ? `• ${lead.website}${lead.city ? ` · ${lead.city}` : ""}` : null,
    typeof lead.score === "number" ? `• AI score: ${lead.score}/100` : null,
    lead.feedType ? `• Feed: ${lead.feedType}` : null,
  ].filter(Boolean);
  await postSlack(bits.join("\n"));
}

/** Centralized error capture — logs (Vercel captures) + optional Slack alert. */
export async function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  const msg =
    error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
  console.error("[error]", context ?? {}, msg);
  const url = process.env.SLACK_ERROR_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const where = context?.where ? ` in *${String(context.where)}*` : "";
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `🔴 Error${where}\n\`\`\`${msg.slice(0, 900)}\`\`\`` }),
    });
  } catch {
    /* swallow */
  }
}

/* --------------------------------- emails ---------------------------------- */

const wrap = (inner: string) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1714">
    <div style="padding:20px 0"><span style="font-size:18px;font-weight:700;color:#2563eb">LotPilot</span></div>
    ${inner}
    <p style="margin-top:28px;color:#847b6f;font-size:12px">AI visibility for automotive dealers · ${SITE}</p>
  </div>`;

export function auditResultEmail(p: {
  dealership: string;
  score?: number | null;
  city?: string | null;
}): { subject: string; html: string } {
  return {
    subject: `Your AI-visibility check — ${p.dealership}`,
    html: wrap(`
      <h1 style="font-size:22px;margin:0 0 8px">Here's where AI ranks ${p.dealership}.</h1>
      <p style="color:#57514a;line-height:1.6">
        ${typeof p.score === "number" ? `Your AI-Visibility Score is <b>${p.score}/100</b>${p.city ? ` in ${p.city}` : ""}. ` : ""}
        Buyers are asking AI which car to buy — and right now most stores are invisible. LotPilot
        rebuilds every VIN as an AI-readable page so your inventory becomes the cited answer.
      </p>
      <p style="margin-top:20px">
        <a href="${SITE}/#feed" style="background:#2563eb;color:#fff;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:600">Connect your feed →</a>
      </p>`),
  };
}

export function feedThanksEmail(p: { dealership: string }): { subject: string; html: string } {
  return {
    subject: `We've got ${p.dealership}'s feed request`,
    html: wrap(`
      <h1 style="font-size:22px;margin:0 0 8px">You're in motion.</h1>
      <p style="color:#57514a;line-height:1.6">
        Thanks — we received your request to connect ${p.dealership}'s inventory feed. We'll rebuild
        every VIN as an AI-readable page and start testing it across ChatGPT, Perplexity, Gemini,
        Grok and Claude. You'll see your first results in your dashboard shortly.
      </p>`),
  };
}
