import type { Job, LearnerProfile } from "@/types/job";

export interface RelevanceResult {
    isRelevant: boolean;
    degreeMatch: boolean;
    experienceMatch: boolean;
    /** Doesn't render as a check/x on the card, but still counts toward relevance. */
    locationMatch: boolean;
}

export const computeRelevance = (job: Job, learner: LearnerProfile): RelevanceResult => {
    const degreeMatch = job.degree === learner.degree;
    const experienceMatch = learner.experienceYears >= job.minExperienceYears;
    // A learner open to relocating isn't penalised for a job in another city — but only within
    // their own country, so an overseas posting is still a location mismatch.
    const country = (location: string) => location.split(",").pop()?.trim();
    const locationMatch = job.location === learner.location || (learner.openToOtherLocations && country(job.location) === country(learner.location));

    return { isRelevant: degreeMatch && experienceMatch && locationMatch, degreeMatch, experienceMatch, locationMatch };
};

export const isExpired = (job: Job) => job.deadlineHoursLeft <= 0;

export type JobCategory = "featured" | "relevant" | "irrelevant" | "expired";

// Expiry is orthogonal to relevance and wins the card-variant choice; Featured is a promoted
// subset of Relevant, so a featured job that stops being relevant (or expires) just falls back
// to whichever category actually applies.
export const getJobCategory = (job: Job, learner: LearnerProfile): JobCategory => {
    if (isExpired(job)) return "expired";
    const { isRelevant } = computeRelevance(job, learner);
    if (!isRelevant) return "irrelevant";
    return job.featured ? "featured" : "relevant";
};
