import { APPLICATION_STATUS_CONFIG } from "@/components/product/application-status-config";
import { ApplyCtaBar } from "@/components/product/cta-tab";
import { MainJd } from "@/components/product/main-jd";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";
import { StepsTracker } from "@/components/product/steps-tracker";
import type { Application, Job } from "@/state/learner-state";

interface JobDescriptionProps {
    job: Job;
    application?: Application;
}

// job-description — one component drives every jd-* reference screen (jd-apply-48h, jd-t-shared,
// jd-t-shortlisted, jd-t-interview, jd-t-offer, jd-t-accepted): pre-application shows the CTA bar,
// once `application` exists it shows the status message banner + badge + Steps tracker instead.
// Reference: docs/placement/spec/screens/jd-apply-48h.png, jd-t-*.png
export const JobDescription = ({ job, application }: JobDescriptionProps) => {
    const config = application ? APPLICATION_STATUS_CONFIG[application.status] : undefined;

    return (
        <PlacementHubLayout
            activeTab={application ? "applications" : "jobs"}
            userName="Manik"
            jobsHasUpdate
            sidebar={application ? (
                <>
                    <StepsTracker companyName={job.company} application={application} />
                    <DefaultSidebar />
                </>
            ) : (
                <DefaultSidebar />
            )}
        >
            <MainJd
                job={job}
                topRight={
                    config ? (
                        <span className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${config.badgeClassName}`}>{config.badgeLabel}</span>
                    ) : (
                        <div className="flex shrink-0 gap-2">
                            {job.badges?.includes("featured") && <span className="rounded-full bg-warning-solid px-2.5 py-1 text-xs font-semibold text-white">⚡ Featured</span>}
                            {job.badges?.includes("best_match") && <span className="rounded-full border border-primary px-2.5 py-1 text-xs font-semibold text-secondary">+ Best Match</span>}
                        </div>
                    )
                }
                messageBanner={config ? <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${config.messageClassName}`}>{config.message}</div> : undefined}
                ctaBar={!application && job.deadline ? <ApplyCtaBar deadline={job.deadline} /> : undefined}
            />
        </PlacementHubLayout>
    );
};
