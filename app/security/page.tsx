import LegalPage, { legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Security");

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      updated="June 24, 2026"
      intro="Dealers trust LotPilot with inventory and customer conversations. Here's how we protect it."
    >
      <h2>Infrastructure</h2>
      <ul>
        <li>Hosted on SOC 2-aligned cloud infrastructure (Vercel + Supabase/Postgres).</li>
        <li>Data encrypted in transit (TLS) and at rest.</li>
        <li>US-based data processing.</li>
      </ul>

      <h2>Access &amp; isolation</h2>
      <ul>
        <li>Row-Level Security (RLS) scopes every dealership&apos;s data to that dealership.</li>
        <li>Least-privilege access; service credentials are never exposed to the browser.</li>
        <li>The free audit and public demo run on representative data — never another dealer&apos;s live data.</li>
      </ul>

      <h2>Data handling</h2>
      <ul>
        <li>We don&apos;t sell data or resell leads.</li>
        <li>Inventory feeds are read-only imports; we never write to your DMS/CRM without permission.</li>
        <li>Credit-application data, where captured, follows FCRA-aligned handling.</li>
        <li>Consumer messaging follows TCPA requirements.</li>
      </ul>

      <h2>Reliability</h2>
      <p>
        Feeds sync continuously so AI never cites a sold car; sold units drop and price/availability
        updates propagate automatically.
      </p>

      <h2>Reporting an issue</h2>
      <p>
        Found a vulnerability? Email{" "}
        <a href="mailto:security@lotpilot.com">security@lotpilot.com</a>. We investigate every report
        and respond promptly.
      </p>
    </LegalPage>
  );
}
