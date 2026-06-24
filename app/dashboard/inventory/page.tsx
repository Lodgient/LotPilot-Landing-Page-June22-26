import { Suspense } from "react";
import Shell from "@/components/dashboard/Shell";
import InventoryView from "@/components/dashboard/InventoryView";
import { EmptyState, ScanningState } from "@/components/dashboard/States";
import { requireDealer, getVehicles } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { dealer, profile } = await requireDealer();
  const vehicles = await getVehicles();
  const feedConnected = !!dealer.feedType || (dealer.vehicles ?? 0) > 0;

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="Inventory AI"
      intro="How every car on your lot performs inside AI answer engines."
    >
      {vehicles.length === 0 ? (
        feedConnected ? (
          <ScanningState
            title="Rebuilding your inventory as AI-readable pages…"
            desc={`We're turning every VIN in ${dealer.name}'s feed into a machine-readable page and scoring it across the answer engines. Your inventory lands here shortly.`}
          />
        ) : (
          <EmptyState
            icon="car"
            title="Score every car for AI visibility."
            desc="Connect the inventory feed you already export and we'll rank every VIN by how discoverable it is in AI — and the gross it's leaving on the table."
            cta="Connect your feed"
            href="/#feed"
          />
        )
      ) : (
        <Suspense fallback={null}>
          <InventoryView vehicles={vehicles} dealer={dealer} />
        </Suspense>
      )}
    </Shell>
  );
}
