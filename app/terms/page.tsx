import LegalPage, { legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Terms of Service");

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 24, 2026"
      intro="These terms govern your dealership's use of LotPilot. By creating an account or connecting a feed, you agree to them."
    >
      <h2>The service</h2>
      <p>
        LotPilot makes your inventory discoverable inside AI answer engines and, optionally, works the
        resulting leads with an AI agent. Features and AI outputs are provided on an &ldquo;as-is&rdquo;
        basis and depend on third-party AI engines we don&apos;t control.
      </p>

      <h2>Your account &amp; data</h2>
      <ul>
        <li>You&apos;re responsible for the accuracy of the inventory feed and dealership info you connect.</li>
        <li>You grant us a license to process that data solely to provide the service.</li>
        <li>You retain ownership of your data and your customers — we never resell your leads.</li>
      </ul>

      <h2>Subscriptions &amp; billing</h2>
      <ul>
        <li>
          Plans are billed monthly: <strong>AI Visibility $399/mo</strong> and the optional{" "}
          <strong>AI Sales Agent +$699/mo</strong>. Founding rates, where offered, are honored for the
          life of a continuous subscription.
        </li>
        <li>Subscriptions renew automatically until cancelled. You can cancel anytime; access continues through the paid period.</li>
        <li>Fees are non-refundable except where required by law.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t use LotPilot to violate consumer-protection, messaging (TCPA), or fair-lending laws,
        to submit data you don&apos;t have rights to, or to disrupt the service.
      </p>

      <h2>AI outputs &amp; results</h2>
      <p>
        AI visibility builds over time, like SEO, and depends on third-party engines. We don&apos;t
        guarantee specific rankings, citations, lead volume, or sales.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, LotPilot is not liable for indirect or consequential
        damages, and our total liability is limited to the fees you paid in the prior three months.
      </p>

      <h2>Changes &amp; termination</h2>
      <p>
        We may update these terms or the service; material changes will be communicated. Either party
        may terminate per the subscription terms above.
      </p>
    </LegalPage>
  );
}
