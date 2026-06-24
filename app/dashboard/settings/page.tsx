import Shell from "@/components/dashboard/Shell";
import SettingsView from "@/components/dashboard/SettingsView";
import { requireDealer } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { dealer, profile } = await requireDealer();
  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="Settings"
      intro="Manage your profile, dealership, feed, agent and billing."
    >
      <SettingsView dealer={dealer} profile={profile} />
    </Shell>
  );
}
