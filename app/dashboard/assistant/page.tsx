import Shell from "@/components/dashboard/Shell";
import AgentConsole from "@/components/dashboard/AgentConsole";
import { requireDealer, getAgentConfig, getAgentPerformance } from "@/lib/dashboard/queries";
import type { AgentConfig } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG: AgentConfig = {
  status: "not_deployed",
  displayName: "Ava",
  persona: "warm",
  channels: { sms: true, voice: true, chat: true },
  greeting:
    "Hi! Thanks for reaching out about the {vehicle}. I can answer anything and get you scheduled — what works best for you?",
  handoffPhone: "",
  businessHours: "24/7 — always on",
  speedToLeadSec: 11,
  deployedAt: "",
};

export default async function AssistantPage() {
  const { dealer, profile } = await requireDealer();
  const [config, performance] = await Promise.all([
    getAgentConfig(dealer.id),
    getAgentPerformance(),
  ]);

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="AI Sales Assistant"
      intro={`The AI that works every lead for ${dealer.name} — included with your subscription.`}
    >
      <AgentConsole
        initial={config ?? DEFAULT_CONFIG}
        performance={performance}
        dealerName={dealer.name}
      />
    </Shell>
  );
}
