import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import type { JobFilter } from "@/components/job-filter-tabs";
import { JobFilterTabs } from "@/components/job-filter-tabs";
import { JobCard } from "@/components/job-card";
import { JobSortDropdown } from "@/components/job-sort-dropdown";
import { MotivationFooter } from "@/components/motivation-footer";
import { Pagination } from "@/components/pagination";
import { LEARNER } from "@/data/learner";
import { useJobs } from "@/data/jobs-store";
import type { JobSortOption } from "@/lib/job-sort";
import { sortJobs } from "@/lib/job-sort";
import { getJobCategory } from "@/lib/relevance";

const PAGE_SIZE = 7;

// Staggered wave-in on entrance (indexed via `custom`), quick uniform fade on exit so switching
// filters feels snappy rather than waiting for a staggered exit.
const cardVariants = {
    initial: { opacity: 0, y: 16 },
    animate: (index: number) => ({ opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30, delay: index * 0.04 } }),
    exit: { opacity: 0, y: -16, transition: { duration: 0.15 } },
};

export interface JobsListState {
    filter: JobFilter;
    sortBy: JobSortOption;
    page: number;
}

interface JobsProps {
    state: JobsListState;
    onStateChange: (state: JobsListState) => void;
    onSelectJob?: (jobId: string) => void;
}

// The Jobs tab's unique content — rendered inside AppShell's animated left column.
// Navbar, the sidebar (Col 2), and the footer are owned by AppShell and stay static across tabs.
// Filter/sort/page live in the parent (not local state) so they survive visiting a job's
// description page and coming back via "Back to Jobs".
export const Jobs = ({ state, onStateChange, onSelectJob }: JobsProps) => {
    const { filter, sortBy, page } = state;
    const jobs = useJobs();
    // Once a job has been applied to (any application status, even a fresh "applied"), it moves
    // to My Applications on Home and drops off the board — no longer something to browse/apply to.
    const boardJobs = useMemo(() => jobs.filter((job) => !job.applicationStatus), [jobs]);

    const categorized = useMemo(() => boardJobs.map((job) => ({ job, category: getJobCategory(job, LEARNER) })), [boardJobs]);
    const relevantCount = useMemo(() => categorized.filter(({ category }) => category === "relevant" || category === "featured").length, [categorized]);

    const filtered = useMemo(() => {
        if (filter === "all") return boardJobs;
        if (filter === "featured") return categorized.filter(({ category }) => category === "featured").map(({ job }) => job);
        if (filter === "relevant") return categorized.filter(({ category }) => category === "relevant" || category === "featured").map(({ job }) => job);
        return categorized.filter(({ category }) => category === "expired").map(({ job }) => job);
    }, [filter, categorized, boardJobs]);

    const sorted = useMemo(() => sortJobs(filtered, sortBy, LEARNER), [filtered, sortBy]);
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleFilterChange = (value: JobFilter) => onStateChange({ filter: value, sortBy, page: 1 });
    const handleSortChange = (value: JobSortOption) => onStateChange({ filter, sortBy: value, page: 1 });
    const handlePageChange = (value: number) => onStateChange({ filter, sortBy, page: value });

    return (
        <>
            <div className="flex w-full flex-col gap-6 py-6">
                <div className="flex w-full items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-2">
                    <JobFilterTabs active={filter} onChange={handleFilterChange} relevantCount={relevantCount} />
                    <JobSortDropdown value={sortBy} onChange={handleSortChange} />
                </div>

                <div className="flex w-full flex-col gap-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {visible.map((job, index) => (
                            <motion.div key={job.id} layout custom={index} variants={cardVariants} initial="initial" animate="animate" exit="exit">
                                <JobCard job={job} onSelect={onSelectJob} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {visible.length === 0 && <p className="w-full py-10 text-center text-base text-gray-500">No jobs in this filter right now.</p>}
                </div>

                <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
            </div>

            <MotivationFooter />
        </>
    );
};
