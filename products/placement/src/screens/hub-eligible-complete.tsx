import { EligibilityCriteriaPanel } from "@/components/product/eligibility-criteria";
import { NOVATR_BLUE } from "@/components/product/navbar";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { HomeSidebar } from "@/components/product/sidebars";

// hub-eligible-complete — shown once, right after Placement Hub unlocks (eligible + profile
// complete), before the learner moves on to the general Home dashboard (see screens/home.tsx).
// Reference: docs/placement/spec/screens/hub-eligible-complete.png
export const HubEligibleComplete = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" jobsHasUpdate sidebar={<HomeSidebar />}>
            <div className="flex items-center justify-between gap-6 rounded-2xl border border-secondary bg-primary p-6">
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

            <div className="flex items-center justify-between gap-6 rounded-2xl bg-success-primary p-6">
                <div>
                    <h3 className="flex items-center gap-1.5 text-lg font-semibold text-success-primary">Your placement needs have been captured! ✓</h3>
                    <p className="mt-1 max-w-md text-sm text-tertiary">You can always come back here to check what you filled in. This form is a preliminary step to gauge interest.</p>
                    <button type="button" className="mt-3 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-secondary shadow-xs ring-1 ring-primary ring-inset">
                        View Form →
                    </button>
                </div>
                <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl bg-white/60 text-xs text-success-primary">[illustration]</div>
            </div>

            <EligibilityCriteriaPanel profileComplete />
        </PlacementHubLayout>
    );
};
