import Shell from "@/components/dashboard/Shell";
import InventoryView from "@/components/dashboard/InventoryView";
import { requireDealer, getVehicles } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { dealer, profile } = await requireDealer();
  const vehicles = await getVehicles();

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="Inventory AI"
      intro="How every car on your lot performs inside AI answer engines."
    >
      <InventoryView vehicles={vehicles} />
    </Shell>
  );
}
