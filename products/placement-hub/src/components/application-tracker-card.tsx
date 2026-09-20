import activityLogBg from "@/assets/activity-log-bg.png";
import { StepConnector } from "@/components/step-connector";
import { getTrackerSteps } from "@/lib/application-tracker";
import type { Job } from "@/types/job";
import { cx } from "@/utils/cx";

const TONE_TEXT_CLASSNAME = {
    past: "font-medium text-gray-800",
    current: "font-semibold text-blue-dark-700",
    pending: "font-medium text-gray-400",
    negative: "font-semibold text-error-600",
} as const;

const TONE_DOT_CLASSNAME = {
    past: "text-blue-dark-700",
    current: "text-blue-dark-700",
    pending: "text-gray-300",
    negative: "text-error-600",
} as const;

export const ApplicationTrackerCard = ({ job }: { job: Job }) => {
    if (!job.applicationStatus) return null;
    const steps = getTrackerSteps(job.applicationStatus);

    return (
        <div className="relative flex w-full flex-col items-start overflow-hidden rounded-2xl border border-gray-200">
            <img src={activityLogBg} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="relative flex w-full flex-col gap-6 bg-white/90 px-8 pt-6 pb-8 backdrop-blur-[26px] max-md:px-5">
                <div className="flex min-h-20 w-full flex-col gap-1">
                    <p className="text-sm font-bold text-blue-dark-600">Track your application here</p>
                    <p className="text-xl font-semibold text-gray-900">Your Journey with {job.companyName}</p>
                </div>

                <div className="flex w-full flex-col items-start">
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;
                        return (
                            <div key={step.label} className={cx("flex w-full items-start gap-4", !isLast && "-mb-4")}>
                                <div className="flex w-24 shrink-0 items-center justify-center py-1">
                                    <p className={cx("text-sm whitespace-nowrap", step.tone === "past" ? "text-gray-800" : TONE_TEXT_CLASSNAME[step.tone])}>
                                        {step.tone === "pending" ? "" : job.applicationDate}
                                    </p>
                                </div>
                                <StepConnector withLine={!isLast} className={TONE_DOT_CLASSNAME[step.tone]} />
                                <p className={cx("flex-1 text-base", TONE_TEXT_CLASSNAME[step.tone])}>{step.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
