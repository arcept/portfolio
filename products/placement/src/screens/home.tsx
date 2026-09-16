import { CheckCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { NOVATR_BLUE } from "@/components/product/navbar";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";

// home-jobs-not-applied — the steady-state Home dashboard once a learner has acknowledged
// eligibility (see hub-eligible-complete.tsx for the one-time landing shown just before this).
// Reference: docs/placement/spec/screens/home-jobs-not-applied.png. That reference renders with a
// "Profile Incomplete" banner/badge — Manik's call (16 Sep 2026): build from it anyway, swapped to
// the profile-complete copy the happy-path scenario actually needs at this step.
export const HomeJobsNotApplied = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" jobsHasUpdate>
            <div className="flex items-center justify-between gap-6 rounded-2xl border border-secondary bg-primary p-6">
                <div>
                    <p className="text-lg text-primary">Hi Manik!</p>
                    <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                        Gear Up for Success …
                    </p>
                    <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                        Find all your placement related updates here!
                    </p>
                </div>
                <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl bg-brand-secondary text-xs text-brand-secondary">[illustration]</div>
            </div>

            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-primary">Important Updates</h3>
                        <p className="mt-1 max-w-md text-sm text-tertiary">You have successfully met the eligibilty criteria. Now celebrate and wait patiently for new jobs to start hoping up.</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-primary px-3 py-1 text-sm font-medium text-success-primary">
                        <CheckCircle className="size-4" />
                        Eligible
                    </span>
                </div>

                <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <div className="mb-2 flex size-16 items-center justify-center rounded-2xl bg-brand-secondary text-brand-secondary">♥</div>
                    <p className="text-lg font-semibold text-primary">You're up-to-date!</p>
                    <p className="text-sm text-tertiary">Find latest updates about job posting, application here</p>
                    <Button color="brand" size="md" className="mt-3">
                        Browse Jobs
                    </Button>
                </div>

                <div className="my-6 border-t border-secondary" />

                <p className="text-sm font-semibold text-primary">Your career success is our priority. Stay focused, stay prepared!</p>
                <p className="mt-1 text-sm text-tertiary">At Novatr, we stand for cultivating exceptional professionals. It's about your growth journey, not a race. Let's grow together, purposefully. 🚀</p>
            </div>
        </PlacementHubLayout>
    );
};
