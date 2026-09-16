import { APPLICATION_STATUS_CONFIG } from "@/components/product/application-status-config";
import type { Application, Job } from "@/state/learner-state";

interface AppliedJobCardProps {
    job: Job;
    application: Application;
    postedDaysAgo?: number;
}

// Applied Job Card (components.md node 3529:55697) — used by the My Applications list.
export const AppliedJobCard = ({ job, application, postedDaysAgo = 7 }: AppliedJobCardProps) => {
    const config = APPLICATION_STATUS_CONFIG[application.status];

    return (
        <div className="rounded-2xl border border-secondary bg-primary p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{job.company.charAt(0)}</span>
                    <div>
                        <h4 className="text-base font-semibold text-primary">{job.company}</h4>
                        <p className="text-sm text-tertiary">{job.role}</p>
                    </div>
                </div>
                <span className="text-xs text-quaternary">Applied {postedDaysAgo}d ago</span>
            </div>

            {config && (
                <div className="mt-3 flex flex-col gap-1.5">
                    <span className={`w-max rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClassName}`}>{config.badgeLabel}</span>
                    <p className="text-sm text-tertiary">{config.message}</p>
                </div>
            )}
        </div>
    );
};
