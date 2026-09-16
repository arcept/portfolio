import { SimpleStatusCard } from "@/components/product/simple-status-card";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";

// home-closure — Rejection + closure scenario, final step. Only reachable with no in-flight
// applications (derive().hubMayClose). Reference: docs/placement/spec/screens/home-closure.png
export const HomeClosure = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" navVariant="locked" sidebar={<DefaultSidebar />}>
            <SimpleStatusCard
                icon="⏰"
                heading="Closing Your Job Search Journey"
                body="We understand job hunting can be challenging. Your efforts matter, and we're here to support you. While you haven't found a job yet, your perseverance is commendable."
                footer={{ title: "Get in touch", body: "Take a moment, and if there's anything we can do to assist you further or improve our platform, please let us know." }}
            />
        </PlacementHubLayout>
    );
};
