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
    /** Pre-application gate states that replace the normal Apply CTA bar. */
    variant?: "profile_incomplete" | "irrelevant";
}

const ProfileIncompleteCta = () => (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-warning-primary px-4 py-3">
        <span className="text-sm font-medium text-warning-primary">🔔 One last step! Complete your profile to submit your application for this job.</span>
        <button type="button" className="shrink-0 text-sm font-semibold text-primary">
            My Profile ↗
        </button>
    </div>
);

const IrrelevantCta = () => (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-brand-secondary px-4 py-3">
        <span className="text-sm font-medium text-brand-secondary">Have concerns about why this job is not relevant to you?</span>
        <button type="button" className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-sm font-semibold text-secondary">
            Share concern →
        </button>
    </div>
);

const NotAMatchSidebarNote = () => (
    <div className="rounded-2xl border border-secondary bg-primary p-5">
        <h4 className="text-base font-semibold text-error-primary">Your Profile does not match this job</h4>
        <div className="mt-3 rounded-lg bg-error-primary p-3 text-sm text-error-primary">🤨 You have 2 years of experience and an architecture degree</div>
        <p className="mt-3 text-sm font-semibold text-primary">The recruiter wanted the following:</p>
        <p className="text-sm text-tertiary">3-4 years of experience · Bachelor of Design</p>
    </div>
);

// job-description — one component drives every jd-* reference screen (jd-apply-48h, jd-t-shared,
// jd-t-shortlisted, jd-t-interview, jd-t-offer, jd-t-accepted, jd-profile-incomplete, jd-irrelevant):
// pre-application shows a CTA bar (Apply / My Profile / Share concern depending on `variant`), once
// `application` exists it shows the status message banner + badge + Steps tracker instead.
// Reference: docs/placement/spec/screens/jd-apply-48h.png, jd-t-*.png, jd-profile-incomplete.png, jd-irrelevant.png
export const JobDescription = ({ job, application, variant }: JobDescriptionProps) => {
    const config = application ? APPLICATION_STATUS_CONFIG[application.status] : undefined;

    let ctaBar: React.ReactNode;
    if (!application) {
        if (variant === "profile_incomplete") ctaBar = <ProfileIncompleteCta />;
        else if (variant === "irrelevant") ctaBar = <IrrelevantCta />;
        else if (job.deadline) ctaBar = <ApplyCtaBar deadline={job.deadline} />;
    }

    const sidebar = application ? (
        <>
            <StepsTracker companyName={job.company} application={application} />
            <DefaultSidebar />
        </>
    ) : variant === "irrelevant" ? (
        <>
            <NotAMatchSidebarNote />
            <DefaultSidebar />
        </>
    ) : (
        <DefaultSidebar />
    );

    return (
        <PlacementHubLayout activeTab={application ? "applications" : "jobs"} userName="Manik" jobsHasUpdate sidebar={sidebar}>
            <MainJd
                job={job}
                topRight={
                    config ? (
                        <span className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${config.badgeClassName}`}>{config.badgeLabel}</span>
                    ) : variant === "irrelevant" ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white">⊘ Not a Match</span>
                    ) : (
                        <div className="flex shrink-0 gap-2">
                            {job.badges?.includes("featured") && <span className="rounded-full bg-warning-solid px-2.5 py-1 text-xs font-semibold text-white">⚡ Featured</span>}
                            {job.badges?.includes("best_match") && <span className="rounded-full border border-primary px-2.5 py-1 text-xs font-semibold text-secondary">+ Best Match</span>}
                        </div>
                    )
                }
                messageBanner={config ? <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${config.messageClassName}`}>{config.message}</div> : undefined}
                ctaBar={ctaBar}
            />
        </PlacementHubLayout>
    );
};
