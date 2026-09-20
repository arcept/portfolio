import { cx } from "@/utils/cx";
import { getStatusConfig, StatusBadge } from "@/components/status-badge";
import type { Job } from "@/types/job";

const CompanyLogo = ({ job }: { job: Job }) => {
    const { logoSrc, logoTreatment, companyName } = job;

    if (!logoSrc) {
        return <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-700 text-lg font-bold text-white">{companyName.charAt(0)}</span>;
    }


    if (logoTreatment === "light-circle") {
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

interface AppliedJobCardProps {
    job: Job;
    onSelect?: (jobId: string) => void;
}

export const AppliedJobCard = ({ job, onSelect }: AppliedJobCardProps) => {
    const { companyName, role, location, workType, applicationStatus, applicationMessage, applicationLastUpdate } = job;
    if (!applicationStatus) return null;
    const { messageClassName } = getStatusConfig(applicationStatus);

    return (
        <button
            type="button"
            onClick={() => onSelect?.(job.id)}
            className="flex w-full cursor-pointer flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 max-md:p-2 text-left shadow-[var(--shadow-card)] transition-shadow duration-150 hover:border-gray-300 hover:shadow-[var(--shadow-card-lg)]"
        >
            <div className="flex w-full items-start gap-4 p-4 max-md:flex-wrap max-md:p-2">
                <CompanyLogo job={job} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-2xl font-bold text-gray-900 max-md:text-xl">{companyName}</p>
                    <p className="text-lg font-medium text-gray-900">{role}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3">
                        <span className="text-base font-semibold text-gray-900">{location}</span>
                        <span className="flex items-center gap-1 text-base font-semibold text-gray-900">
                            <span className="size-1 rounded-full bg-gray-400" />
                            {workType}
                        </span>
                    </div>
                </div>
                <div className="flex w-40 shrink-0 flex-col items-end gap-2 max-md:w-full max-md:items-start">
                    <StatusBadge status={applicationStatus} />
                </div>
            </div>
            <div className={cx("flex w-full flex-col gap-2 rounded-lg px-6 py-4 max-md:px-4", messageClassName)}>
                <p className="text-base font-semibold">{applicationMessage}</p>
                <p className="text-sm font-medium text-gray-500 italic">Last Update: {applicationLastUpdate}</p>
            </div>
        </button>
    );
};
