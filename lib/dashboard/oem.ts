// Derive the franchise OEM brand(s) a dealer represents from its name.
// Works for any new dealer account with no DB change — e.g.
// "Capitol Nissan Infiniti" -> ["Nissan", "Infiniti"].

const MAKES: Record<string, string> = {
  acura: "Acura",
  "alfa romeo": "Alfa Romeo",
  "aston martin": "Aston Martin",
  audi: "Audi",
  bentley: "Bentley",
  bmw: "BMW",
  buick: "Buick",
  cadillac: "Cadillac",
  chevrolet: "Chevrolet",
  chevy: "Chevrolet",
  chrysler: "Chrysler",
  dodge: "Dodge",
  fiat: "FIAT",
  ford: "Ford",
  genesis: "Genesis",
  gmc: "GMC",
  honda: "Honda",
  hyundai: "Hyundai",
  infiniti: "Infiniti",
  jaguar: "Jaguar",
  jeep: "Jeep",
  kia: "Kia",
  "land rover": "Land Rover",
  lexus: "Lexus",
  lincoln: "Lincoln",
  maserati: "Maserati",
  mazda: "Mazda",
  "mercedes-benz": "Mercedes-Benz",
  mercedes: "Mercedes-Benz",
  mini: "MINI",
  mitsubishi: "Mitsubishi",
  nissan: "Nissan",
  porsche: "Porsche",
  ram: "RAM",
  subaru: "Subaru",
  tesla: "Tesla",
  toyota: "Toyota",
  volkswagen: "Volkswagen",
  vw: "Volkswagen",
  volvo: "Volvo",
};

const escape = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

export function deriveOEMs(name: string): string[] {
  if (!name) return [];
  const lower = name.toLowerCase();
  const found: { canonical: string; idx: number }[] = [];
  for (const [alias, canonical] of Object.entries(MAKES)) {
    const idx = lower.search(new RegExp(`\\b${escape(alias)}\\b`));
    if (idx !== -1 && !found.some((f) => f.canonical === canonical)) {
      found.push({ canonical, idx });
    }
  }
  return found.sort((a, b) => a.idx - b.idx).map((f) => f.canonical);
}
