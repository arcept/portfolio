import { EligibilityCriteriaPanel } from "@/components/product/eligibility-criteria";
import { NOVATR_BLUE } from "@/components/product/navbar";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { HomeSidebar } from "@/components/product/sidebars";

// hub-not-eligible — Gate scenario, "Not eligible" branch, step 1.
// Reference: docs/placement/spec/screens/hub-not-eligible.png
export const HubNotEligible = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" navVariant="locked" sidebar={<HomeSidebar />}>
            <div className="flex items-center justify-between gap-6 rounded-2xl border border-secondary bg-primary p-6">
                <div>
                    <p className="text-lg text-primary">Hi Manik!</p>
                    <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                        We are sorry! You did not pass the eligibility
                    </p>
                    <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                        criteria for placement support.
                    </p>
                </div>
                <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl bg-brand-secondary text-xs text-brand-secondary">[illustration]</div>
            </div>

            <EligibilityCriteriaPanel variant="not_eligible" />
        </PlacementHubLayout>
    );
};
