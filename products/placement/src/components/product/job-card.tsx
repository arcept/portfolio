import { Clock, MinusCircle, Plus, Zap } from "@untitledui/icons";
import type { Job } from "@/state/learner-state";
import { cx } from "@/utils/cx";

interface JobCardProps {
    job: Job;
}

const CompanyLogo = ({ company }: { company: string }) => (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
        {company
            .split(" ")
            .map((w) => w[0])
            .slice(0, 1)
            .join("")}
    </span>
);

export const JobCard = ({ job }: JobCardProps) => {
    const isExpired = job.relevance === "expired";
    const isIrrelevant = job.relevance === "irrelevant";

    return (
        <div className={cx("rounded-2xl border border-secondary p-5", isExpired ? "bg-secondary" : "bg-primary")}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <CompanyLogo company={job.company} />
                    <div>
                        <h4 className="text-base font-semibold text-primary">{job.company}</h4>
                        <p className="text-sm text-tertiary">{job.role}</p>
                    </div>
                </div>

                {job.relevance === "relevant" && job.badges && (
                    <div className="flex shrink-0 gap-2">
                        {job.badges.includes("featured") && (
                            <span className="flex items-center gap-1 rounded-full bg-warning-solid px-2.5 py-1 text-xs font-semibold text-white">
                                <Zap className="size-3" />
                                Featured
                            </span>
                        )}
                        {job.badges.includes("best_match") && (
                            <span className="flex items-center gap-1 rounded-full border border-primary px-2.5 py-1 text-xs font-semibold text-secondary">
                                <Plus className="size-3" />
                                Best Match
                            </span>
                        )}
                    </div>
                )}
                {isExpired && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-secondary">
                        <Clock className="size-3" />
                        Expired
                    </span>
                )}
                {isIrrelevant && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white">
                        <MinusCircle className="size-3" />
                        Not a Match
                    </span>
                )}
            </div>

            {isExpired ? (
                <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-error-primary">
                        <Clock className="size-4" />
                        No longer accepting applications
                    </span>
                    <span className="text-xs text-quaternary">Posted {job.postedDaysAgo}d ago</span>
                </div>
            ) : (
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-tertiary">
                        <span>
                            Degree <span className={cx("font-medium text-secondary", isIrrelevant && "inline-flex items-center gap-1")}>{job.degree}</span>
                        </span>
                        <span>
                            Experience <span className="font-medium text-secondary">{job.experience}</span>
                        </span>
                        <span>
                            Location <span className="font-medium text-secondary">{job.location}</span> · {job.workType}
                        </span>
                    </div>
                    {job.relevance === "relevant" ? <span className="text-xs text-quaternary">Posted {job.postedDaysAgo}d ago</span> : null}
                </div>
            )}

            {job.relevance === "relevant" && job.deadline && (
                <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-warning-primary">
                    <Clock className="size-4" />
                    {job.deadline === "hard_48h" ? "Applications Close in 48hrs." : "Apply before it closes."} Apply Now!
                </div>
            )}
        </div>
    );
};
