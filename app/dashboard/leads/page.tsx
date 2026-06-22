import Shell from "@/components/dashboard/Shell";
import LeadsView from "@/components/dashboard/LeadsView";
import { requireDealer, getLeads } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { dealer, profile } = await requireDealer();
  const leads = await getLeads();

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="Leads & Conversations"
      intro="Every lead, worked by your AI agent in real time."
    >
      <LeadsView leads={leads} />
    </Shell>
  );
}
