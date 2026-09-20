import { motion } from "motion/react";

export type JobFilter = "all" | "featured" | "relevant" | "expired";

const TABS: Array<{ key: JobFilter; label: string }> = [
    { key: "all", label: "All Jobs" },
    { key: "featured", label: "Featured" },
    { key: "relevant", label: "Relevant" },
    { key: "expired", label: "Expired" },
];

const UNDERLINE_TRANSITION = { type: "spring" as const, stiffness: 400, damping: 35 };

const UNDERLINE_COLOR: Record<JobFilter, string> = {
    all: "bg-blue-700",
    featured: "bg-yellow-400",
    relevant: "bg-blue-700",
    expired: "bg-error-600",
};

interface JobFilterTabsProps {
    active: JobFilter;
    onChange: (filter: JobFilter) => void;
    relevantCount: number;
}

export const JobFilterTabs = ({ active, onChange, relevantCount }: JobFilterTabsProps) => {
    return (
        <div className="flex w-full items-center gap-4 max-md:gap-0 max-md:overflow-x-auto">
            {TABS.map((tab) => {
                const isActive = tab.key === active;
                return (
                    <button key={tab.key} type="button" onClick={() => onChange(tab.key)} className="relative flex h-14 items-center gap-2 px-4 text-lg font-semibold text-gray-cool-900 max-md:h-12 max-md:shrink-0 max-md:px-3 max-md:text-base max-md:whitespace-nowrap">
                        {tab.label}
                        {tab.key === "relevant" && (
                            <span className="flex size-8 items-center justify-center rounded-xl bg-gray-cool-100 text-base font-semibold text-gray-cool-800">
                                {String(relevantCount).padStart(2, "0")}
                            </span>
                        )}
                        {isActive && (
                            <motion.span
                                layoutId="job-filter-underline"
                                transition={UNDERLINE_TRANSITION}
                                className={`absolute inset-x-0 bottom-0 h-0.5 transition-colors duration-200 ${UNDERLINE_COLOR[active]}`}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};
