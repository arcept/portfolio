import { Star01 } from "@untitledui/icons";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";
import type { Job } from "@/state/learner-state";

interface HomePlacedProps {
    job: Job;
}

// home-placed — focus mode: Jobs/My Applications locked, only Home reachable. The reference's
// `{{companyName}}` merge-tag is filled from the actual placed job, not hardcoded (state drives
// screens). Rating already happened in the accept-offer popup sequence (Manik's call, 16 Sep
// 2026) — the stars here stay as in the reference (empty/decorative), this is the scenario's last
// step. Reference: docs/placement/spec/screens/home-placed.png
export const HomePlaced = ({ job }: HomePlacedProps) => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" navVariant="locked" sidebar={<DefaultSidebar />}>
            <div className="rounded-2xl bg-warning-primary p-8 text-center">
                <h2 className="text-2xl font-semibold text-primary">
                    Congratulations and Welcome to {job.company}!
                    <br />
                    We look forward to your contributions and success in your new role.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-tertiary">To help you focus, we've restricted access to other pages &amp; resources. For assistance, reach out anytime.</p>

                <div className="mx-auto mt-6 w-max border-t border-warning-solid/30 pt-6">
                    <span className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{job.company.charAt(0)}</span>
                    <p className="text-base font-semibold text-primary">{job.company}</p>
                    <p className="text-sm text-tertiary">{job.role}</p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <p className="text-sm font-medium text-primary">Rate your placement experience</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star01 key={i} className="size-5 text-neutral-300" />
                        ))}
                    </div>
                </div>
            </div>
        </PlacementHubLayout>
    );
};
