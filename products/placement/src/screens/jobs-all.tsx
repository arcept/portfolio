import { JobCard } from "@/components/product/job-card";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";
import { ALL_JOBS } from "@/state/fixtures/jobs";

// jobs-all — All Jobs, split into Relevant / Expired / Other sections.
// Reference: docs/placement/spec/screens/jobs-all.png. Card counts don't match Figma's dummy
// "(36)"/"(12)"/"(4)" totals — not needed for phase 1 fidelity (see screen-map.md Gaps).
export const JobsAll = () => {
    const relevant = ALL_JOBS.filter((j) => j.relevance === "relevant");
    const expired = ALL_JOBS.filter((j) => j.relevance === "expired");
    const irrelevant = ALL_JOBS.filter((j) => j.relevance === "irrelevant");

    return (
        <PlacementHubLayout activeTab="jobs" userName="Manik" jobsHasUpdate sidebar={<DefaultSidebar />}>
            <h2 className="text-lg font-semibold text-primary">All Jobs ({ALL_JOBS.length})</h2>

            <section className="flex flex-col gap-4">
                <p className="text-sm font-medium text-quaternary uppercase">Relevant Jobs</p>
                {relevant.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
                <button type="button" className="self-start rounded-lg border border-primary px-3.5 py-2 text-sm font-semibold text-brand-secondary">
                    Show All Relevant Jobs →
                </button>
            </section>

            <section className="flex flex-col gap-4">
                <p className="text-sm font-medium text-quaternary uppercase">Expired Jobs</p>
                {expired.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
                <button type="button" className="self-start rounded-lg border border-primary px-3.5 py-2 text-sm font-semibold text-brand-secondary">
                    Show All Expired Jobs →
                </button>
            </section>

            <section className="flex flex-col gap-4">
                <p className="text-sm font-medium text-quaternary uppercase">Other Jobs</p>
                {irrelevant.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
                <button type="button" className="self-start rounded-lg border border-primary px-3.5 py-2 text-sm font-semibold text-brand-secondary">
                    Show All Other Jobs →
                </button>
            </section>
        </PlacementHubLayout>
    );
};
