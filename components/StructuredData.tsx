// components/StructuredData.tsx
//
// Emits JSON-LD as a STATIC server-rendered <script> tag.
// CRITICAL: keep this in a SERVER component (no "use client") so the JSON-LD
// is present in the initial HTML for non-rendering AI crawlers (GPTBot,
// PerplexityBot, ClaudeBot). This is the exact thing the consumer site got
// wrong (schema only in the hydration payload) — do NOT repeat that here.
//
// Usage: render <StructuredData /> inside app/layout.tsx and per-page as needed.

import React from "react";

const SITE = "https://dealers.lotpilot.com";

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "LotPilot",
      url: SITE,
      logo: `${SITE}/logo.svg`,
      sameAs: [
        "https://lotpilot.com",
        "https://www.instagram.com/lotpilot_ai/",
        "https://x.com/Lot_Pilot_AI",
      ],
      description:
        "LotPilot makes dealer inventory visible in AI answer engines and works the leads with AI agents.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "LotPilot for Dealers",
      publisher: { "@id": `${SITE}/#org` },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE}/#webpage`,
      url: SITE,
      name: "LotPilot — Get your inventory recommended by AI",
      isPartOf: { "@id": `${SITE}/#website` },
      about: { "@id": `${SITE}/#service` },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "How it works",
          item: `${SITE}/how-it-works`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "See the live demo",
          item: `${SITE}/dashboard`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE}/#service`,
      name: "LotPilot AI Inventory Visibility & Lead-Working Platform",
      provider: { "@id": `${SITE}/#org` },
      areaServed: "US",
      audience: {
        "@type": "BusinessAudience",
        name: "Franchise and independent car dealerships",
      },
      serviceType:
        "AI search visibility and AI lead engagement for car dealerships",
      description:
        "Ingests a dealer's inventory feed, makes every vehicle discoverable in AI answer engines, and works the resulting leads with AI SMS and voice agents that capture credit applications and book deals.",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What does LotPilot do for my dealership?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "LotPilot makes every vehicle in your inventory discoverable and recommended inside AI answer engines like ChatGPT, Perplexity, and Gemini, then works the leads with AI agents that respond in seconds, capture credit applications, and book deals.",
          },
        },
        {
          "@type": "Question",
          name: "What do I have to do to get started?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Connect your existing inventory feed. LotPilot accepts vAuto, HomeNet, Dealer.com, DealerSocket, and generic CSV or XML exports. There is no ongoing work required from your team.",
          },
        },
        {
          "@type": "Question",
          name: "How is this different from CarGurus or Cars.com?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Marketplaces own the customer and resell the same lead to multiple competing dealers. LotPilot gets your inventory found directly through AI search on your own behalf and works those leads for you — no lead reselling.",
          },
        },
        {
          "@type": "Question",
          name: "What is the free AI-Visibility Audit?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A free 60-second check that queries the major AI answer engines with real buyer-style questions for your market and scores how visible your inventory is. It shows which sources the AI recommends today and where your store is invisible.",
          },
        },
        {
          "@type": "Question",
          name: "Do the AI agents capture credit applications?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. LotPilot's AI agents respond to leads in seconds over SMS and voice, answer vehicle questions, qualify the buyer, capture credit applications, book appointments, and progress the deal toward sale — 24/7.",
          },
        },
      ],
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // Static server-rendered injection. Safe: content is our own constant object.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
