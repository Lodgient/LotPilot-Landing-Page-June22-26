import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { marked } from "marked";
import "./plan.css";

// Shareable, unlisted build-plan page. Not linked in nav and excluded from
// indexing/sitemap — a clean URL to hand to the dev team / stakeholders.
export const metadata: Metadata = {
  title: "LotPilot AI-Visibility Engine — Build Plan",
  description: "How we make the Inventory AI dashboard real: the engine that produces its numbers.",
  robots: { index: false, follow: false },
};

// Rendered at build time (static). The spec lives in the repo, so it's present
// during the build and baked into HTML.
function getHtml(): string {
  const file = path.join(process.cwd(), "docs", "AI-VISIBILITY-ENGINE-SPEC.md");
  const md = fs.readFileSync(file, "utf8");
  marked.setOptions({ gfm: true, breaks: false });
  return marked.parse(md) as string;
}

export default function PlanPage() {
  const html = getHtml();
  return (
    <main className="plan-shell">
      <article className="plan-doc" dangerouslySetInnerHTML={{ __html: html }} />
      <footer className="plan-foot">
        LotPilot · internal build plan · share by link
      </footer>
    </main>
  );
}
