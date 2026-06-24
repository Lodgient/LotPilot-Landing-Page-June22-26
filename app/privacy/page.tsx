import LegalPage, { legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Privacy Policy");

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 24, 2026"
      intro="LotPilot helps automotive dealers get their inventory recommended by AI and works the resulting leads. This policy explains what we collect, why, and your choices."
    >
      <h2>Who we are</h2>
      <p>
        LotPilot (&ldquo;LotPilot,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) provides AI-visibility
        and AI-sales-agent software to franchise and independent car dealerships in the United States.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account &amp; dealership data</strong> — name, work email, phone, role, dealership
          name, market, and rooftop details you provide when you sign up or request the free audit.
        </li>
        <li>
          <strong>Inventory feed data</strong> — the vehicle inventory export you connect (vAuto,
          HomeNet, Dealer.com, DealerSocket, CSV/XML), used to build AI-readable pages and run
          visibility tests.
        </li>
        <li>
          <strong>Lead &amp; conversation data</strong> — when our AI agent works a shopper lead on
          your behalf (SMS, voice, chat), we process the shopper&apos;s messages and contact details
          as a service provider to your dealership.
        </li>
        <li>
          <strong>Usage data</strong> — pages viewed, features used, and aggregate analytics, to
          improve the product.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>Operate the service: rebuild VIN pages, run AI-visibility scans, and work leads.</li>
        <li>Provide reporting, attribution, and your dashboard.</li>
        <li>Communicate with you about your account, billing, and product updates.</li>
        <li>Maintain security and prevent abuse.</li>
      </ul>

      <h2>How we share it</h2>
      <p>
        We do <strong>not</strong> sell your data and we do <strong>not</strong> resell your leads to
        competing dealers. We share data only with subprocessors that run the service on our behalf
        (e.g., cloud hosting, AI model providers for query testing and agent responses, telephony for
        SMS/voice, payment processing), each under contract, and where required by law.
      </p>

      <h2>Consumer leads &amp; messaging</h2>
      <p>
        When our AI agent contacts a shopper, it does so on your dealership&apos;s behalf and in line
        with applicable consumer-protection and messaging laws (including TCPA for SMS/voice). Credit
        applications, where captured, are handled consistent with FCRA-aligned practices.
      </p>

      <h2>Data retention &amp; security</h2>
      <p>
        We retain data for as long as your account is active or as needed to provide the service, then
        delete or anonymize it. See our{" "}
        <a href="/security">Security</a> page for safeguards. US data is processed in the US.
      </p>

      <h2>Your choices</h2>
      <p>
        You may access, correct, export, or delete your account data by contacting us. You can cancel
        your subscription at any time.
      </p>
    </LegalPage>
  );
}
