import { CheckVerified01, Star05, XCircle, Zap } from "@untitledui/icons";
import { CtaTab } from "@/components/cta-tab";
import { StatusBadge } from "@/components/status-badge";
import { LEARNER } from "@/data/learner";
import { computeRelevance, getJobCategory } from "@/lib/relevance";
import type { Job } from "@/types/job";

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

interface JobJdCardProps {
    job: Job;
    onApply?: () => void;
    /** False once an offer has been extended — JobOfferCard above already covers the CTA row (and
     *  Figma's offer-state JD content omits it entirely), so showing CtaTab's own "Accept Now"
     *  banner here too would just duplicate that prompt. */
    showCta?: boolean;
}

export const JobJdCard = ({ job, onApply, showCta = true }: JobJdCardProps) => {
    const category = getJobCategory(job, LEARNER);
    const { degreeMatch, experienceMatch } = computeRelevance(job, LEARNER);

    return (
        <div className="flex w-full flex-col gap-8 rounded-2xl border border-gray-200 px-6 pt-6 pb-10 max-md:gap-6 max-md:px-4 max-md:pb-6">
            <p className="text-sm text-gray-400">Posted {job.postedDaysAgo}d ago</p>

            <div className="flex w-full items-center gap-4">
                <CompanyLogo job={job} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex w-full items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2">
                        <p className="flex-1 text-[28px] font-semibold text-black max-md:text-2xl">{job.companyName}</p>
                        <div className="flex shrink-0 items-center gap-2 max-md:flex-wrap">
                            {category === "featured" && (
                                <span className="flex items-center gap-1 rounded-lg bg-yellow-400 px-3 py-1">
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
                            {job.applicationStatus && <StatusBadge status={job.applicationStatus} />}
                        </div>
                    </div>
                    <p className="text-xl font-medium text-black">{job.role}</p>
                </div>
            </div>

            <div className="flex w-full flex-col gap-3 border-y-2 border-gray-100 py-6">
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
                    <span className="font-semibold text-black">{job.workType}</span>
                </div>
            </div>

            {showCta && (
                <div className="flex w-full flex-col gap-4">
                    <CtaTab job={job} onApply={onApply} />

                    {category === "featured" && job.applicantAvatars && job.applicantCount !== undefined && (
                        <div className="flex w-full items-center gap-2">
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
                </div>
            )}

            <div className="flex w-full flex-col gap-8 pr-10 max-md:gap-6 max-md:pr-0">
                <div className="flex w-full flex-col gap-2">
                    <p className="text-base font-semibold text-gray-900">About the Job</p>
                    <p className="text-sm text-gray-700">{job.aboutJob}</p>
                </div>

                <div className="flex w-full flex-col gap-2">
                    <p className="text-base font-semibold text-gray-900">Role Accountabilities</p>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                        {job.roleAccountabilities.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="flex w-full flex-col gap-2">
                    <p className="text-base font-semibold text-gray-900">Important Information</p>
                    <div className="flex w-full items-start gap-8 text-sm max-md:gap-4">
                        <div className="flex flex-1 flex-col gap-2">
                            <div className="flex flex-col">
                                <p className="text-gray-500">Seniority Level</p>
                                <p className="font-semibold text-gray-900">{job.seniorityLevel}</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-gray-500">Job Functions</p>
                                <p className="font-semibold text-gray-900">{job.jobFunctions}</p>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <div className="flex flex-col">
                                <p className="text-gray-500">Employment Type</p>
                                <p className="font-semibold text-gray-900">{job.employmentType}</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-gray-500">Industries</p>
                                <p className="font-semibold text-gray-900">{job.industries}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
