import { AlarmClockMinus, AlertTriangle, CheckVerified01, ClockCheck, ClockFastForward, MinusCircle, Star05, XCircle, Zap } from "@untitledui/icons";
import { SirenIcon } from "@/components/siren-icon";
import { LEARNER } from "@/data/learner";
import { getDeadlineUrgency } from "@/lib/deadline-urgency";
import { computeRelevance, getJobCategory, isExpired } from "@/lib/relevance";
import type { Job } from "@/types/job";
import { cx } from "@/utils/cx";

const DEADLINE_STYLES = {
    calm: { icon: ClockCheck, colorClassName: "text-success-600" },
    warning: { icon: SirenIcon, colorClassName: "text-warning-600" },
    urgent: { icon: AlertTriangle, colorClassName: "text-error-600" },
} as const;

const CompanyLogo = ({ job }: { job: Job }) => {
    const { logoSrc, logoTreatment, companyName } = job;

    if (!logoSrc) {
        return <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-700 text-lg font-bold text-white">{companyName.charAt(0)}</span>;
    }
    if (logoTreatment === "light-circle") {
        // These marks are wordmarks (wide, lots of internal margin), not square icons — cropping
        // them to fill the circle like the icon-mark logos below cuts letters off, so contain instead.
        return (
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <img src={logoSrc} alt={companyName} className="size-full object-contain" />
            </span>
        );
    }
    return (
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-gray-700">
            <img src={logoSrc} alt={companyName} className="size-full object-cover" />
        </span>
    );
};

const MatchField = ({ label, value, matches }: { label: string; value: string; matches: boolean }) => (
    <div className="flex max-w-full items-center gap-2">
        <p className="shrink-0 text-sm text-gray-500">{label}</p>
        <p className="min-w-0 text-sm font-semibold text-black">{value}</p>
        {matches ? <CheckVerified01 className="size-4 shrink-0 text-success-600" /> : <XCircle className="size-4 shrink-0 text-error-600" />}
    </div>
);

const Dot = () => <span className="size-1 shrink-0 rounded-full bg-gray-300" />;

interface JobCardProps {
    job: Job;
    onSelect?: (jobId: string) => void;
}

export const JobCard = ({ job, onSelect }: JobCardProps) => {
    const category = getJobCategory(job, LEARNER);
    const { degreeMatch, experienceMatch } = computeRelevance(job, LEARNER);
    const expired = isExpired(job);
    const deadlineStyle = DEADLINE_STYLES[getDeadlineUrgency(job.deadlineHoursLeft)];

    return (
        <button
            type="button"
            onClick={() => onSelect?.(job.id)}
            className={cx(
                "flex w-full cursor-pointer flex-col rounded-md border px-10 py-6 max-md:px-4 max-md:py-5 text-left transition-shadow duration-150 hover:shadow-[var(--shadow-card-lg)]",
                category === "featured" &&
                    "gap-3 border-yellow-400 bg-white bg-[linear-gradient(180deg,rgba(255,255,255,0)_42.026%,rgba(250,197,21,0.1)_100%)]",
                category === "relevant" && "gap-2 border-gray-200 bg-white hover:border-gray-300",
                category === "irrelevant" && "gap-2 border-gray-200 bg-gray-100 hover:border-gray-300",
                category === "expired" && "gap-2 border-gray-200 bg-gray-100",
            )}
        >
            <div className="flex w-full items-start gap-4 max-md:flex-col max-md:gap-3">
                <div className="flex flex-1 items-center gap-4">
                    <CompanyLogo job={job} />
                    <div className="flex flex-1 flex-col">
                        <p className="text-2xl font-bold text-gray-900 max-md:text-xl">{job.companyName}</p>
                        <p className="text-lg font-medium text-gray-900">{job.role}</p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 max-md:flex-wrap">
                    {category === "featured" && (
                        <span className="flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-1">
                            <Zap className="size-4 text-white" />
                            <span className="text-sm font-semibold text-white">Featured</span>
                        </span>
                    )}
                    {(category === "featured" || category === "relevant") && (
                        <span className="flex items-center gap-1 rounded-2xl border border-yellow-200 bg-white px-3 py-1">
                            <Star05 className="size-4 text-black" />
                            <span className="text-sm font-semibold text-black">Best Match</span>
                        </span>
                    )}
                    {category === "expired" && (
                        <span className="flex items-center gap-1 px-3 py-1">
                            <AlarmClockMinus className="size-4 text-gray-cool-800" />
                            <span className="text-sm font-semibold text-gray-cool-800">Expired</span>
                        </span>
                    )}
                    {category === "irrelevant" && (
                        <span className="flex items-center gap-1 rounded-2xl bg-gray-800 px-3 py-1">
                            <MinusCircle className="size-4 text-gray-100" />
                            <span className="text-sm font-semibold text-gray-100">Not a Match</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="flex w-full flex-col gap-1 pl-[72px] max-md:pl-0">
                <div className="flex flex-wrap items-center gap-3">
                    <MatchField label="Degree" value={job.degree} matches={degreeMatch} />
                    <Dot />
                    <MatchField label="Experience" value={`${job.minExperienceYears}+ Years`} matches={experienceMatch} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="text-gray-500">Location</span>
                        <span className="font-semibold text-black">{job.location}</span>
                    </span>
                    <Dot />
                    <span className="text-gray-500">{job.workType}</span>
                </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 pl-[72px] max-md:flex-col max-md:items-start max-md:pl-0">
                {!expired && (category === "featured" || category === "relevant") && (
                    <span className="flex flex-1 items-center gap-2 max-md:flex-none">
                        <deadlineStyle.icon className={cx("size-5", deadlineStyle.colorClassName)} />
                        <span className={cx("text-base font-semibold", deadlineStyle.colorClassName)}>Applications Close in {job.deadlineHoursLeft}hrs. Apply Now!</span>
                    </span>
                )}
                {expired && (
                    <span className="flex flex-1 items-center gap-2 max-md:flex-none">
                        <ClockFastForward className="size-5 text-error-600" />
                        <span className="text-base font-semibold text-error-600">No longer accepting applications</span>
                    </span>
                )}
                {!expired && category === "irrelevant" && (
                    <span className="flex flex-1 items-center gap-2 max-md:flex-none">
                        <ClockFastForward className="size-5 text-gray-800" />
                        <span className="text-base font-semibold text-gray-800">You aren't the right applicant for it.</span>
                    </span>
                )}
                <p className="shrink-0 text-sm text-gray-400">Posted {job.postedDaysAgo}d ago</p>
            </div>

            {category === "featured" && job.applicantAvatars && job.applicantCount !== undefined && (
                <div className="flex w-full flex-wrap items-center gap-2 px-[72px] py-2 max-md:px-0">
                    <div className="flex items-center">
                        {job.applicantAvatars.map((avatar, i) => (
                            <span key={i} className="-mr-2 size-8 overflow-hidden rounded-2xl border-2 border-gray-cool-200 last:mr-0">
                                <img src={avatar} alt="" className="size-full object-cover" />
                            </span>
                        ))}
                    </div>
                    <p className="text-base font-semibold text-black">{job.applicantCount} other professionals have applied for this job</p>
                </div>
            )}
        </button>
    );
};
