import { getJobCategory, isExpired } from "@/lib/relevance";
import type { Job, LearnerProfile } from "@/types/job";

export type JobSortOption = "posted" | "deadline" | "relevance";

const relevanceRank = (job: Job, learner: LearnerProfile) => {
    const category = getJobCategory(job, learner);
    if (category === "featured" || category === "relevant") return 0;
    if (category === "irrelevant") return 1;
    return 2; // expired
};

const compareBy = (sortBy: JobSortOption, learner: LearnerProfile) => (a: Job, b: Job) => {
    if (sortBy === "posted") return a.postedDaysAgo - b.postedDaysAgo;
    if (sortBy === "deadline") {
        // Expired jobs aren't actionable, so they sink to the bottom instead of "winning" a
        // soonest-deadline sort just because their negative hours-left is the smallest number.
        const effective = (job: Job) => (isExpired(job) ? Infinity : job.deadlineHoursLeft);
        return effective(a) - effective(b);
    }
    const rankDiff = relevanceRank(a, learner) - relevanceRank(b, learner);
    return rankDiff !== 0 ? rankDiff : a.postedDaysAgo - b.postedDaysAgo;
};

// Featured jobs sort inline with everyone else by whichever criterion is active — they don't get
// pinned to the top regardless of sort order.
export const sortJobs = (jobs: Job[], sortBy: JobSortOption, learner: LearnerProfile): Job[] => {
    return [...jobs].sort(compareBy(sortBy, learner));
};
