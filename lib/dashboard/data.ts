// lib/dashboard/data.ts
//
// Deterministic MOCK data for the demo dealer dashboard.
// No backend — this powers a high-fidelity, sales-ready demo (and is the
// single source of truth the UI reads). Swap these getters for real API/DB
// calls later; the component layer won't need to change.
//
// Demo dealer: Capitol Nissan Infiniti (kept consistent with the marketing site).

export interface KPI {
  label: string;
  value: string;
  sub?: string;
  trend?: number; // percent change, +/-
  spark?: number[];
  accent?: "accent" | "cyan" | "violet" | "warn";
}

export type ActivityType =
  | "reply"
  | "creditapp"
  | "appointment"
  | "visibility"
  | "handoff";

export interface ActivityEvent {
  type: ActivityType;
  time: string;
  text: string;
}

export type EngineName =
  | "ChatGPT"
  | "Perplexity"
  | "Gemini"
  | "Google AI Overviews"
  | "Bing Copilot";

export interface VisibilityQuery {
  query: string;
  /** Per-engine: true = dealer cited, false = absent. */
  engines: Record<EngineName, boolean>;
}

export interface Pillar {
  label: string;
  score: number;
  delta: number;
}

export type LeadStatus =
  | "Appointment booked"
  | "Credit app started"
  | "Qualifying"
  | "Responding"
  | "New";

export type LeadTemp = "Hot" | "Warm" | "Cold";

export interface Message {
  from: "buyer" | "agent" | "rep";
  text: string;
  time: string;
}

export interface Lead {
  id: string;
  name: string;
  vehicle: string;
  source: EngineName | "AI answer page";
  status: LeadStatus;
  temp: LeadTemp;
  firstReplySec: number;
  creditApp: boolean;
  time: string;
  transcript: Message[];
}

export const DEMO_DEALER = {
  name: "Capitol Nissan Infiniti",
  metro: "Austin, TX",
  rooftops: 1,
  contact: "Dana Reyes",
  role: "Internet Sales Director",
  feedType: "vAuto",
  vehicles: 412,
  lastSync: "8 min ago",
};

export const ENGINES: EngineName[] = [
  "ChatGPT",
  "Perplexity",
  "Gemini",
  "Google AI Overviews",
  "Bing Copilot",
];

/* ------------------------------- Command Center ------------------------------ */

export const TODAY_KPIS: KPI[] = [
  {
    label: "Leads worked",
    value: "23",
    sub: "by AI agent today",
    trend: 12,
    accent: "cyan",
    spark: [8, 11, 9, 14, 12, 17, 23],
  },
  {
    label: "Avg speed-to-lead",
    value: "18s",
    sub: "first AI response",
    trend: -34,
    accent: "accent",
    spark: [120, 90, 60, 44, 30, 22, 18],
  },
  {
    label: "Appointments booked",
    value: "6",
    sub: "today · 31 this wk",
    trend: 20,
    accent: "violet",
    spark: [2, 3, 3, 4, 5, 4, 6],
  },
  {
    label: "Credit apps captured",
    value: "4",
    sub: "today · 19 this wk",
    trend: 33,
    accent: "warn",
    spark: [1, 2, 1, 3, 2, 3, 4],
  },
];

export const OVERNIGHT: ActivityEvent[] = [
  { type: "appointment", time: "6:42 AM", text: "Booked Marcus B. for a 2022 Rogue SV test drive — today 6:00 PM." },
  { type: "creditapp", time: "5:18 AM", text: "Captured a credit application from Priya N. on a 2021 Altima." },
  { type: "reply", time: "3:04 AM", text: "Answered 4 overnight questions on financing & availability in <30s." },
  { type: "visibility", time: "1:30 AM", text: "Your 2023 Frontier is now cited by ChatGPT for ‘best used truck near Austin’." },
  { type: "appointment", time: "12:11 AM", text: "Booked Sara L. for a 2020 Murano — tomorrow 11:30 AM." },
  { type: "handoff", time: "11:47 PM", text: "Flagged a high-intent buyer (cash, ready this week) for your team." },
];

export const OVERNIGHT_SUMMARY = {
  leadsAnswered: 14,
  appts: 2,
  creditApps: 3,
  fastestReply: "11s",
};

/* -------------------------------- AI Visibility ------------------------------ */

export const VISIBILITY_SCORE = { score: 71, delta: 47, band: "developing" as const };

export const VISIBILITY_TREND = [24, 28, 31, 38, 44, 49, 55, 60, 64, 68, 70, 71];

export const PILLARS: Pillar[] = [
  { label: "Crawlability", score: 82, delta: 53 },
  { label: "Structured-data fidelity", score: 76, delta: 64 },
  { label: "Freshness", score: 79, delta: 41 },
  { label: "Citation presence", score: 58, delta: 52 },
  { label: "Entity consistency", score: 68, delta: 39 },
];

export const VISIBILITY_QUERIES: VisibilityQuery[] = [
  {
    query: "best used SUV under $30k near Austin",
    engines: { ChatGPT: true, Perplexity: true, Gemini: true, "Google AI Overviews": true, "Bing Copilot": false },
  },
  {
    query: "most reliable used truck near Austin",
    engines: { ChatGPT: true, Perplexity: false, Gemini: true, "Google AI Overviews": true, "Bing Copilot": true },
  },
  {
    query: "certified Nissan Rogue for sale Austin",
    engines: { ChatGPT: true, Perplexity: true, Gemini: true, "Google AI Overviews": true, "Bing Copilot": true },
  },
  {
    query: "cheapest hybrid with Apple CarPlay near me",
    engines: { ChatGPT: false, Perplexity: true, Gemini: false, "Google AI Overviews": true, "Bing Copilot": false },
  },
  {
    query: "family SUV third row under $35k Austin",
    engines: { ChatGPT: true, Perplexity: true, Gemini: false, "Google AI Overviews": true, "Bing Copilot": false },
  },
  {
    query: "good first car under $20k Austin",
    engines: { ChatGPT: false, Perplexity: true, Gemini: true, "Google AI Overviews": false, "Bing Copilot": true },
  },
];

export const SHARE_OF_VOICE = [
  { name: "Capitol Nissan", value: 38, color: "var(--color-accent)" },
  { name: "Carvana", value: 21, color: "var(--color-cyan)" },
  { name: "CarGurus", value: 17, color: "var(--color-violet)" },
  { name: "A competing dealer", value: 14, color: "var(--color-warn)" },
  { name: "Other", value: 10, color: "rgba(255,255,255,0.18)" },
];

export const RECOMMENDED_VINS = [
  { vehicle: "2023 Nissan Frontier SV", engine: "ChatGPT", leads: 7, price: "$31,450" },
  { vehicle: "2022 Nissan Rogue SV", engine: "Gemini", leads: 5, price: "$24,980" },
  { vehicle: "2021 Nissan Altima SR", engine: "Perplexity", leads: 4, price: "$22,300" },
  { vehicle: "2020 Nissan Murano SL", engine: "Google AI Overviews", leads: 3, price: "$26,750" },
];

/* ----------------------------- Leads & Conversations ------------------------- */

export const LEADS: Lead[] = [
  {
    id: "l1",
    name: "Marcus Bell",
    vehicle: "2022 Nissan Rogue SV",
    source: "ChatGPT",
    status: "Appointment booked",
    temp: "Hot",
    firstReplySec: 11,
    creditApp: true,
    time: "6:42 AM",
    transcript: [
      { from: "buyer", text: "Is the 2022 Rogue still available? ChatGPT recommended you.", time: "6:41 AM" },
      { from: "agent", text: "Hi Marcus! Yes — 2022 Rogue SV, 28k miles, $24,980, in stock now. Want me to hold it and set a time to see it?", time: "6:41 AM" },
      { from: "buyer", text: "Maybe tomorrow evening?", time: "6:42 AM" },
      { from: "agent", text: "Today or tomorrow 6:00 PM both work. I can also start a quick 2-min pre-approval so it's ready when you arrive — want the link?", time: "6:42 AM" },
      { from: "buyer", text: "Sure, send it", time: "6:42 AM" },
      { from: "agent", text: "Sent ✅ You're booked for today 6:00 PM at Capitol Nissan. I'll text a reminder an hour before.", time: "6:42 AM" },
    ],
  },
  {
    id: "l2",
    name: "Priya Nair",
    vehicle: "2021 Nissan Altima SR",
    source: "Perplexity",
    status: "Credit app started",
    temp: "Hot",
    firstReplySec: 14,
    creditApp: true,
    time: "5:18 AM",
    transcript: [
      { from: "buyer", text: "What would payments look like on the Altima with $3k down?", time: "5:17 AM" },
      { from: "agent", text: "Great question Priya! On the 2021 Altima SR at $22,300 with $3k down, estimates land around $360–$390/mo depending on term & credit. Want a real number? I can run a soft pre-approval — no impact to your score.", time: "5:17 AM" },
      { from: "buyer", text: "Okay let's do it", time: "5:18 AM" },
      { from: "agent", text: "Perfect — here's your secure application 🔒. Takes about 2 minutes and you'll see real terms.", time: "5:18 AM" },
    ],
  },
  {
    id: "l3",
    name: "Devon Carter",
    vehicle: "2023 Nissan Frontier SV",
    source: "Google AI Overviews",
    status: "Qualifying",
    temp: "Warm",
    firstReplySec: 9,
    creditApp: false,
    time: "Yesterday",
    transcript: [
      { from: "buyer", text: "Does the Frontier have the tow package?", time: "9:02 PM" },
      { from: "agent", text: "Hi Devon! Yes — the 2023 Frontier SV ($31,450) has the Class IV tow hitch and trailer sway control. Are you towing a boat or trailer? I can confirm capacity for your setup.", time: "9:02 PM" },
      { from: "buyer", text: "A 5,000 lb trailer", time: "9:14 PM" },
      { from: "agent", text: "You're well covered — it's rated up to 6,720 lbs. Want to come see it this week? I have Thu or Sat openings.", time: "9:14 PM" },
    ],
  },
  {
    id: "l4",
    name: "Sara Lopez",
    vehicle: "2020 Nissan Murano SL",
    source: "AI answer page",
    status: "Appointment booked",
    temp: "Hot",
    firstReplySec: 16,
    creditApp: false,
    time: "Yesterday",
    transcript: [
      { from: "buyer", text: "Is the Murano still for sale?", time: "7:40 PM" },
      { from: "agent", text: "It is! 2020 Murano SL, $26,750, one owner, clean history. Want to lock in a time to drive it?", time: "7:40 PM" },
      { from: "buyer", text: "Tomorrow morning?", time: "7:41 PM" },
      { from: "agent", text: "Booked you for 11:30 AM tomorrow ✅ See you then, Sara!", time: "7:41 PM" },
    ],
  },
  {
    id: "l5",
    name: "James Wright",
    vehicle: "2019 Nissan Sentra SV",
    source: "Bing Copilot",
    status: "Responding",
    temp: "Warm",
    firstReplySec: 21,
    creditApp: false,
    time: "Yesterday",
    transcript: [
      { from: "buyer", text: "What's the out-the-door price on the Sentra?", time: "4:12 PM" },
      { from: "agent", text: "Hi James! The 2019 Sentra SV is $16,490. Out-the-door with TT&L in Austin is about $17,950. Want me to hold it or set up a quick look?", time: "4:12 PM" },
    ],
  },
  {
    id: "l6",
    name: "Tanya Brooks",
    vehicle: "2022 Nissan Kicks SR",
    source: "ChatGPT",
    status: "New",
    temp: "Cold",
    firstReplySec: 13,
    creditApp: false,
    time: "Yesterday",
    transcript: [
      { from: "buyer", text: "Do you still have the Kicks in red?", time: "2:55 PM" },
      { from: "agent", text: "Hi Tanya! Yes — 2022 Kicks SR in Scarlet Ember, $21,200. Still shopping or ready to take a look? Happy to answer anything.", time: "2:55 PM" },
      { from: "agent", text: "Following up 👋 it's still available and a popular one — want me to hold it for 24 hours?", time: "Today 9:10 AM" },
    ],
  },
];

/* --------------------------------- ROI & Attribution ------------------------- */

export const ROI_KPIS: KPI[] = [
  { label: "AI-sourced leads", value: "142", sub: "this month", trend: 28, accent: "cyan", spark: [60, 72, 80, 96, 110, 128, 142] },
  { label: "Cost per lead", value: "$18", sub: "vs ~$232 marketplace", trend: -92, accent: "accent", spark: [40, 34, 30, 26, 22, 20, 18] },
  { label: "Appointments", value: "47", sub: "31 shown", trend: 19, accent: "violet", spark: [22, 26, 30, 35, 40, 44, 47] },
  { label: "Attributed sales", value: "12", sub: "this month", trend: 25, accent: "warn", spark: [4, 5, 7, 8, 9, 11, 12] },
];

export const ROI_VS_MARKETPLACE = [
  { metric: "Monthly cost", lp: "Flat subscription", mk: "$25k–50k+ + per-lead" },
  { metric: "Cost per lead", lp: "$18", mk: "~$232" },
  { metric: "Lead resold to competitors", lp: "Never", mk: "Up to 3 dealers" },
  { metric: "Customer ownership", lp: "100% yours", mk: "Marketplace's" },
  { metric: "Worked by AI 24/7", lp: "Included", mk: "Not included" },
];

export const ROI_FUNNEL = [
  { stage: "AI-sourced leads", value: 142 },
  { stage: "Engaged by agent", value: 138 },
  { stage: "Qualified", value: 86 },
  { stage: "Appointments", value: 47 },
  { stage: "Shown", value: 31 },
  { stage: "Sold", value: 12 },
];

export const CUSTOMERS_OWNED = 142; // none resold
