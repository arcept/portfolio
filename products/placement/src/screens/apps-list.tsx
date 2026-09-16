import { AppliedJobCard } from "@/components/product/applied-job-card";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";
import type { Application, Job } from "@/state/learner-state";

interface AppsListProps {
    applications: Application[];
    jobsById: Record<string, Job>;
}

// apps-list — My Applications. Reference: docs/placement/spec/screens/apps-list.png
export const AppsList = ({ applications, jobsById }: AppsListProps) => {
    return (
        <PlacementHubLayout activeTab="applications" userName="Manik" sidebar={<DefaultSidebar />}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">My Applications ({applications.length})</h2>
                <div className="flex gap-2 text-sm text-tertiary">
                    <span className="rounded-lg border border-primary px-3 py-1.5">Job Title ⌄</span>
                    <span className="rounded-lg border border-primary px-3 py-1.5">Location ⌄</span>
                </div>
            </div>

            {applications.map((application) => {
                const job = jobsById[application.jobId];
                if (!job) return null;
                return <AppliedJobCard key={application.jobId} job={job} application={application} />;
            })}
        </PlacementHubLayout>
    );
};
