import { AlertTriangle, ArrowNarrowRight, ArrowNarrowUpRight, ClockCheck, ClockFastForward, Star06 } from "@untitledui/icons";
import { SirenIcon } from "@/components/siren-icon";
import { getStatusConfig } from "@/components/status-badge";
import { getCtaState } from "@/lib/cta-state";
import { getDeadlineUrgency } from "@/lib/deadline-urgency";
import { LEARNER } from "@/data/learner";
import { useJobs } from "@/data/jobs-store";
import { cx } from "@/utils/cx";
import type { Job } from "@/types/job";

const DEADLINE_TAB_STYLES = {
    calm: { bgClassName: "bg-green-50", colorClassName: "text-success-600", icon: ClockCheck },
    warning: { bgClassName: "bg-orange-50", colorClassName: "text-warning-600", icon: SirenIcon },
    urgent: { bgClassName: "bg-error-25", colorClassName: "text-error-600", icon: AlertTriangle },
} as const;

const ApplyButton = ({
    label = "Apply Now",
    tone = "dark",
    onClick,
}: {
    label?: string;
    tone?: "dark" | "purple" | "disabled" | "white";
    onClick?: () => void;
}) => (
    <button
        type="button"
        disabled={tone === "disabled"}
        onClick={onClick}
        className={{
            dark: "flex items-center gap-2 rounded-sm bg-gray-cool-900 px-5 py-3 text-sm font-semibold text-white",
            purple: "flex items-center gap-2 rounded-sm border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-800",
            disabled: "flex cursor-not-allowed items-center gap-2 rounded-sm bg-gray-cool-200 px-5 py-3 text-sm font-semibold text-white",
            white: "flex items-center gap-2 rounded-sm border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-800",
        }[tone]}
    >
        {label}
        <ArrowNarrowRight className="size-4" />
    </button>
);

interface CtaTabProps {
    job: Job;
    /** Opens the Apply flow modal — only wired up for the plain "Apply Now" states (deadline/soft
     *  deadline); Accept Now, Share concern and My Profile are separate, unrelated actions. */
    onApply?: () => void;
}

export const CtaTab = ({ job, onApply }: CtaTabProps) => {
    const jobs = useJobs();
    const state = getCtaState(job, LEARNER, jobs);

    if (state === "accept_offer") {
        return (
            <div className="flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 bg-purple-700 px-6 py-4">
                <div className="flex flex-1 items-center gap-2">
                    <Star06 className="size-4 shrink-0 text-white" />
                    <p className="text-base font-semibold text-white">Congratulations! 🙌 You've received a placement offer. Review the details and accept within the given timeframe. 🙌</p>
                </div>
                <ApplyButton label="Accept Now" tone="white" />
            </div>
        );
    }

    if (state === "already_applied" && job.applicationStatus) {
        const { messageClassName } = getStatusConfig(job.applicationStatus);
        return (
            <div className={cx("flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 px-6 py-4", messageClassName)}>
                <p className="flex-1 text-base font-semibold">{job.applicationMessage}</p>
            </div>
        );
    }

    if (state === "offer_received_blocking") {
        return (
            <div className="flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 bg-indigo-50 px-6 py-4">
                <p className="flex-1 text-base font-semibold text-indigo-800">You already have an offer letter. Hence you cannot apply to this opening.</p>
                <ApplyButton tone="disabled" />
            </div>
        );
    }

    if (state === "expired") {
        return (
            <div className="flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 bg-error-25 px-6 py-4">
                <div className="flex flex-1 items-center gap-2">
                    <SirenIcon className="size-5 text-error-600" />
                    <p className="text-base font-semibold text-error-600">No longer accepting applications</p>
                </div>
                <ApplyButton tone="disabled" />
            </div>
        );
    }

    if (state === "irrelevant") {
        return (
            <div className="flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 bg-purple-25 px-6 py-4">
                <p className="flex-1 text-base font-semibold text-purple-800">Have concerns about why this job is not relevant to you?</p>
                <ApplyButton label="Share concern" tone="purple" />
            </div>
        );
    }

    if (state === "profile_incomplete") {
        return (
            <div className="flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 bg-orange-50 px-6 py-4">
                <div className="flex flex-1 items-center gap-2">
                    <SirenIcon className="size-5 text-warning-600" />
                    <p className="text-base font-semibold text-warning-600">Your profile is incomplete. Hence you cannot apply to this job</p>
                </div>
                <button type="button" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-cool-900">
                    My Profile
                    <ArrowNarrowUpRight className="size-4" />
                </button>
            </div>
        );
    }

    if (state === "deadline") {
        const style = DEADLINE_TAB_STYLES[getDeadlineUrgency(job.deadlineHoursLeft)];
        return (
            <div className={`flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 px-6 py-4 ${style.bgClassName}`}>
                <div className="flex flex-1 items-center gap-2">
                    <style.icon className={`size-5 ${style.colorClassName}`} />
                    <p className={`text-base font-semibold ${style.colorClassName}`}>Applications Close in {job.deadlineHoursLeft}hrs. Apply Now!</p>
                </div>
                <ApplyButton onClick={onApply} />
            </div>
        );
    }

    // soft_deadline
    return (
        <div className="flex w-full items-center gap-4 rounded-2xl max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 bg-blue-50 px-6 py-4">
            <div className="flex flex-1 items-center gap-2">
                <ClockFastForward className="size-5 text-gray-900" />
                <p className="text-base font-semibold text-gray-900">Apply soon, applications filling fast</p>
            </div>
            <ApplyButton onClick={onApply} />
        </div>
    );
};
