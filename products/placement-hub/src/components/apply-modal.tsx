import { AlertTriangle, CheckCircle, Star05, XClose, Zap } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import confettiLottie from "@/assets/confetti-ludo-colors.json";
import successConfettiLottie from "@/assets/success-confetti.json";
import { LottiePlayer } from "@/components/lottie-player";
import { computeRelevance, getJobCategory } from "@/lib/relevance";
import { LEARNER } from "@/data/learner";
import { jobsStore } from "@/data/jobs-store";
import type { Job } from "@/types/job";
import { cx } from "@/utils/cx";

type Step = "confirm" | "policy" | "success";
const STEP_INDEX: Record<Step, number> = { confirm: 0, policy: 1, success: 2 };

interface ApplyModalProps {
    job: Job;
    onClose: () => void;
    onViewApplications: () => void;
    onViewMoreJobs: () => void;
}

const ProgressDots = ({ step }: { step: Step }) => (
    <div className="flex shrink-0 items-center justify-center gap-1">
        {[0, 1, 2].map((i) => (
            <span key={i} className={cx("h-1 w-8 rounded-[4px] transition-colors duration-300", i <= STEP_INDEX[step] ? "bg-blue-dark-700" : "bg-gray-300")} />
        ))}
    </div>
);

const CompanyHeader = ({ job }: { job: Job }) => {
    const category = getJobCategory(job, LEARNER);
    return (
        <div className="flex w-full items-start gap-4 bg-white p-6 max-md:p-4">
            <div className="flex flex-1 items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-gray-700">
                    {job.logoSrc && <img src={job.logoSrc} alt={job.companyName} className="size-full object-cover" />}
                </span>
                <div className="flex flex-col">
                    <p className="text-2xl font-bold text-gray-900 max-md:text-xl">{job.companyName}</p>
                    <p className="text-lg font-medium text-gray-600 max-md:text-base">{job.role}</p>
                </div>
            </div>
            {category === "featured" && (
                <span className="flex shrink-0 items-center gap-1 rounded-lg bg-yellow-400 px-3 py-1">
                    <Zap className="size-4 text-white" />
                    <span className="text-sm font-semibold text-white">Featured</span>
                </span>
            )}
            {category === "relevant" && (
                <span className="flex shrink-0 items-center gap-1 rounded-2xl border border-yellow-200 bg-white px-3 py-1">
                    <Star05 className="size-4 text-black" />
                    <span className="text-sm font-semibold text-black">Best Match</span>
                </span>
            )}
        </div>
    );
};

const DetailRow = ({ label, value, matches }: { label: string; value: string; matches: boolean }) => (
    <div className="flex w-full items-start gap-2">
        <p className="w-[216px] shrink-0 text-base text-gray-600 max-md:w-24">{label}</p>
        <div className="flex flex-1 items-center gap-2">
            <p className="text-base font-medium text-gray-900">{value}</p>
            {matches && <CheckCircle className="size-6 shrink-0 text-success-600" />}
        </div>
    </div>
);

const ConfirmStep = ({ job }: { job: Job }) => {
    const { degreeMatch, experienceMatch, locationMatch } = computeRelevance(job, LEARNER);

    return (
        <div className="flex w-full flex-1 flex-col items-center">
            <div
                className={cx(
                    "flex w-full flex-col items-start overflow-hidden rounded-xl",
                    !locationMatch && "border border-blue-gray-200 bg-error-100",
                )}
            >
                <div className="flex w-full flex-col items-start rounded-xl bg-gray-50 shadow-[var(--shadow-card)]">
                    <CompanyHeader job={job} />
                    <div className="flex w-full flex-col gap-2 px-6 pt-4 pb-6">
                        <DetailRow label="Degree" value={job.degree} matches={degreeMatch} />
                        <DetailRow label="Experience" value={`${job.minExperienceYears}+ Years`} matches={experienceMatch} />
                        <div className="flex w-full items-start gap-2">
                            <p className="w-[216px] shrink-0 text-base text-gray-600 max-md:w-24">Location</p>
                            <div className="flex flex-1 flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-base font-medium text-gray-900">
                                        {job.location}, {job.workType}
                                    </p>
                                    {locationMatch && <CheckCircle className="size-6 shrink-0 text-success-600" />}
                                </div>
                                {!locationMatch && (
                                    <span className="flex items-center gap-2">
                                        <AlertTriangle className="size-5 shrink-0 text-error-600" />
                                        <span className="text-base font-semibold text-error-600">Location mismatch</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {!locationMatch && (
                    <div className="flex w-full flex-col gap-2 px-10 pt-2 pb-4">
                        <span className="text-sm font-medium text-gray-800">This job isn't in your preferred location - {LEARNER.location}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const PolicyStep = () => (
    <div className="flex w-full flex-1 flex-col items-center overflow-hidden rounded-sm border border-purple-300 bg-white">
        <div className="flex w-full flex-col gap-2 border-b border-purple-300 bg-purple-50 py-4 pl-10">
            <p className="text-lg font-semibold text-purple-700">Placement policy reminder</p>
        </div>
        <div className="flex w-full flex-1 items-start px-5 py-4">
            <ul className="w-full list-disc pl-6 text-base font-medium text-gray-900">
                <li className="pb-2">By applying to this opening, you are marking interest in the role.</li>
                <li className="pb-2">Based on your profile and matchmaking with the role your profile will be forwarded to the company</li>
                <li>By applying to this position it is assumed you have read clearly through the requirements and agree to the role, job location requirements.</li>
            </ul>
        </div>
    </div>
);

const SuccessStep = ({ onViewApplications, onViewMoreJobs }: { onViewApplications: () => void; onViewMoreJobs: () => void }) => (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-10">
        {/* Two Lotties centered on the same point: the streamer burst is the larger background
            layer, and the checkmark celebration plays on top at half its size. */}
        <div className="relative flex size-[320px] shrink-0 items-center justify-center max-md:size-52">
            <LottiePlayer animationData={confettiLottie} loop={false} className="pointer-events-none absolute inset-0 m-auto size-full max-w-none" />
            <LottiePlayer animationData={successConfettiLottie} loop={false} className="absolute inset-0 m-auto size-[160px] max-w-none" />
        </div>
        <div className="flex w-full flex-col items-center gap-3 px-12 max-md:px-0">
            <p className="text-center text-2xl font-semibold text-gray-900">Your job application has been submitted successfully</p>
            <p className="text-center text-sm text-gray-500">
                We have received your application successfully for review to be shared with the recruiters. You can track your application under the 'My Applications' tab in the Hub.
            </p>
            <button type="button" onClick={onViewApplications} className="text-lg font-semibold text-purple-600 hover:underline">
                View Applications
            </button>
        </div>
        <div className="flex w-full justify-center px-16 max-md:px-0">
            <button type="button" onClick={onViewMoreJobs} className="flex-1 rounded-sm bg-purple-800 px-6 py-3 text-base font-semibold text-white">
                View more jobs
            </button>
        </div>
    </div>
);

const STEP_VARIANTS = {
    initial: (direction: 1 | -1) => ({ opacity: 0, x: direction * 24 }),
    animate: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 320, damping: 32 } },
    exit: (direction: 1 | -1) => ({ opacity: 0, x: direction * -24, transition: { duration: 0.15 } }),
};

export const ApplyModal = ({ job, onClose, onViewApplications, onViewMoreJobs }: ApplyModalProps) => {
    const [step, setStep] = useState<Step>("confirm");
    const [direction, setDirection] = useState<1 | -1>(1);

    const goTo = (next: Step) => {
        setDirection(STEP_INDEX[next] >= STEP_INDEX[step] ? 1 : -1);
        setStep(next);
    };

    const handleSubmit = () => {
        jobsStore.applyToJob(job.id);
        goTo("success");
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm max-md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                className={cx(
                    "relative flex w-[640px] max-md:w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-400 bg-gray-100 shadow-[var(--shadow-card-lg)]",
                    step === "success" ? "h-[720px] max-md:h-[min(720px,calc(100dvh-32px))]" : "h-[580px] max-md:h-[min(580px,calc(100dvh-32px))]",
                )}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-[22px] left-[calc(83.33%+46px)] max-md:top-3 max-md:right-3 max-md:left-auto flex size-[38px] shrink-0 items-center justify-center rounded-xs hover:bg-gray-200"
                >
                    <XClose className="size-5 text-gray-700" />
                </button>

                <div className="flex h-full w-full flex-1 flex-col items-center gap-10 overflow-hidden p-10 max-md:gap-4 max-md:p-5">
                    {step !== "success" && (
                        <div className="flex w-full flex-col items-start gap-1 px-2">
                            <p className="pr-8 text-[28px] font-semibold text-gray-900 max-md:text-xl">Confirm Job Application</p>
                            <p className="text-lg text-gray-600 max-md:text-base">
                                Are you sure you want to apply for the position of {job.role} at {job.companyName}?
                            </p>
                        </div>
                    )}

                    <div className="relative flex w-full flex-1 items-stretch overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction} initial={false}>
                            <motion.div key={step} custom={direction} variants={STEP_VARIANTS} initial="initial" animate="animate" exit="exit" className="absolute inset-0 flex w-full max-md:overflow-y-auto">
                                {step === "confirm" && <ConfirmStep job={job} />}
                                {step === "policy" && <PolicyStep />}
                                {step === "success" && <SuccessStep onViewApplications={onViewApplications} onViewMoreJobs={onViewMoreJobs} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {step !== "success" && (
                        <div className="flex w-full items-center justify-between px-2">
                            <button
                                type="button"
                                onClick={() => (step === "confirm" ? onClose() : goTo("confirm"))}
                                className="rounded-xs border border-purple-200 bg-white px-6 py-3 text-base font-semibold text-purple-800"
                            >
                                {step === "confirm" ? "Cancel" : "Back"}
                            </button>

                            <ProgressDots step={step} />

                            {step === "confirm" ? (
                                <button type="button" onClick={() => goTo("policy")} className="rounded-xs bg-purple-800 px-6 py-3 text-base font-semibold text-white">
                                    Next
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} className="rounded-xs bg-purple-800 px-6 py-3 text-base font-semibold text-white">
                                    Apply to this job
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
