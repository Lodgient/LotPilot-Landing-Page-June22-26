// Builds the public LotPilot "AI page" URL + slug for a dealer's vehicle —
// the answer-engine-optimized page LotPilot publishes for each VIN, e.g.
//   lotpilot.com/inventory/capitol-nissan-infiniti-austin-texas/2017-toyota-prius-jtdka1-austin-texas
// Mirrors the structure dealers see in the wild so the dashboard preview and
// the real page line up.

import type { Dealer, Vehicle } from "@/lib/dashboard/types";

export const LOTPILOT_HOST = "https://lotpilot.com";

const STATES: Record<string, string> = {
  AL: "alabama", AK: "alaska", AZ: "arizona", AR: "arkansas", CA: "california",
  CO: "colorado", CT: "connecticut", DE: "delaware", FL: "florida", GA: "georgia",
  HI: "hawaii", ID: "idaho", IL: "illinois", IN: "indiana", IA: "iowa",
  KS: "kansas", KY: "kentucky", LA: "louisiana", ME: "maine", MD: "maryland",
  MA: "massachusetts", MI: "michigan", MN: "minnesota", MS: "mississippi",
  MO: "missouri", MT: "montana", NE: "nebraska", NV: "nevada", NH: "new hampshire",
  NJ: "new jersey", NM: "new mexico", NY: "new york", NC: "north carolina",
  ND: "north dakota", OH: "ohio", OK: "oklahoma", OR: "oregon", PA: "pennsylvania",
  RI: "rhode island", SC: "south carolina", SD: "south dakota", TN: "tennessee",
  TX: "texas", UT: "utah", VT: "vermont", VA: "virginia", WA: "washington",
  WV: "west virginia", WI: "wisconsin", WY: "wyoming", DC: "washington dc",
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Split "Austin, TX" into a location slug "austin-texas". */
export function locationSlug(metro: string): string {
  const [cityRaw, stateRaw] = metro.split(",").map((p) => p.trim());
  const city = cityRaw ?? metro;
  const code = (stateRaw ?? "").toUpperCase();
  const state = STATES[code] ?? (stateRaw ?? "").toLowerCase();
  return slugify(`${city} ${state}`.trim());
}

export function dealerSlug(dealer: Pick<Dealer, "name" | "metro">): string {
  return slugify(`${dealer.name} ${locationSlug(dealer.metro).replace(/-/g, " ")}`);
}

export function vehicleSlug(
  dealer: Pick<Dealer, "metro">,
  v: Pick<Vehicle, "year" | "make" | "model" | "vin">,
): string {
  const vinFragment = (v.vin || "").replace(/[^a-z0-9]/gi, "").slice(0, 6).toLowerCase();
  const loc = locationSlug(dealer.metro).replace(/-/g, " ");
  return slugify(`${v.year} ${v.make} ${v.model} ${vinFragment} ${loc}`);
}

/** Full public URL for a vehicle's LotPilot AI page. */
export function livePageUrl(
  dealer: Pick<Dealer, "name" | "metro">,
  v: Pick<Vehicle, "year" | "make" | "model" | "vin">,
): string {
  return `${LOTPILOT_HOST}/inventory/${dealerSlug(dealer)}/${vehicleSlug(dealer, v)}`;
}

/**
 * The URL the dashboard should link to. Prefers the canonical URL published by
 * the page system (handles slug collisions/suffixes); reconstructs one only as a
 * fallback for VINs that haven't been synced yet.
 */
export function resolveLivePageUrl(dealer: Pick<Dealer, "name" | "metro">, v: Vehicle): string {
  return v.liveUrl?.trim() || livePageUrl(dealer, v);
}

/** The path shown in the browser-chrome of the in-dashboard preview. */
export function livePagePath(
  dealer: Pick<Dealer, "name" | "metro">,
  v: Pick<Vehicle, "year" | "make" | "model" | "vin">,
): string {
  return `lotpilot.com/inventory/${dealerSlug(dealer)}/${vehicleSlug(dealer, v)}`;
}
