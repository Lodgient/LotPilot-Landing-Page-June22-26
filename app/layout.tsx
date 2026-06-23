import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";
import SmoothScroll from "@/components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  display: "swap",
});

const SITE = "https://dealers.lotpilot.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "LotPilot — Get your inventory recommended by AI. Leads worked by AI.",
    template: "%s · LotPilot for Dealers",
  },
  description:
    "Buyers now ask AI which car to buy. LotPilot makes your inventory visible and recommended inside ChatGPT, Perplexity, Gemini and Google AI Overviews — then works every lead with AI agents that capture credit apps and book deals. You just send the feed.",
  keywords: [
    "AI car dealership marketing",
    "AI inventory visibility",
    "dealership lead automation",
    "AI search for car dealers",
    "ChatGPT car recommendations",
    "AI SDR for dealerships",
    "GEO for dealers",
  ],
  authors: [{ name: "LotPilot" }],
  creator: "LotPilot",
  publisher: "LotPilot",
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "LotPilot for Dealers",
    title: "Your inventory, recommended by AI. Your leads, worked by AI.",
    description:
      "LotPilot makes every car you stock discoverable inside AI answer engines and works the leads with AI agents. The only lift for your store: send the feed.",
    locale: "en_US",
    // Open Graph image is provided by app/opengraph-image.tsx (dynamic PNG).
  },
  twitter: {
    card: "summary_large_image",
    site: "@Lot_Pilot_AI",
    creator: "@Lot_Pilot_AI",
    title: "Your inventory, recommended by AI. Your leads, worked by AI.",
    description:
      "Get found by buyers asking AI which car to buy — then let AI agents work every lead. You just send the feed.",
    // Twitter image is taken from app/opengraph-image.tsx automatically.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} antialiased`}
    >
      <head>
        {/* JSON-LD emitted statically, server-side, in the initial HTML. */}
        <StructuredData />
      </head>
      <body className="min-h-screen">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
