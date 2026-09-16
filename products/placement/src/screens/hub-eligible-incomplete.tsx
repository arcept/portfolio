import { EligibilityCriteriaPanel } from "@/components/product/eligibility-criteria";
import { NOVATR_BLUE } from "@/components/product/navbar";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { HomeSidebar } from "@/components/product/sidebars";

// hub-eligible-incomplete — Gate scenario, "Eligible profile incomplete" branch, step 2.
// Reference: docs/placement/spec/screens/hub-eligible-incomplete.png
export const HubEligibleIncomplete = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" jobsHasUpdate sidebar={<HomeSidebar />}>
            <div className="flex flex-col gap-4 rounded-2xl border border-secondary bg-primary p-6">
                <div className="flex items-center justify-between gap-6">
                    <div>
                        <p className="text-lg text-primary">Hi Manik!</p>
                        <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                            Gear Up for Success …
                        </p>
                        <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                            Placement Portal Unlocking Post-Graduation
                        </p>
                    </div>
                    <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl bg-brand-secondary text-xs text-brand-secondary">[illustration]</div>
                </div>
                <div className="rounded-lg border border-warning-primary bg-warning-primary/40 p-3 text-sm font-medium text-warning-primary">
                    Important: Your profile is still incomplete. You will be unable to apply for jobs until your profile is completed. Fulfill all required needs to apply for jobs of your choice.
                </div>
            </div>

            <EligibilityCriteriaPanel variant="eligible_incomplete" />
        </PlacementHubLayout>
    );
};
