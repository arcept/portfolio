import { computeRelevance, isExpired } from "@/lib/relevance";
import type { Job, LearnerProfile } from "@/types/job";

export type CtaState = "accept_offer" | "already_applied" | "offer_received_blocking" | "expired" | "irrelevant" | "profile_incomplete" | "deadline" | "soft_deadline";

/** ≤ this many hours left, the countdown becomes the urgent "deadline" CTA instead of the soft nudge. */
const HARD_DEADLINE_THRESHOLD_HOURS = 48;

// Precedence, from most to least specific:
// 1. This job already has an offer sitting on it -> let them accept it.
// 2. The learner has already applied here in some other way -> show their status, not a fresh CTA.
// 3. A DIFFERENT job already has an offer (received or accepted) -> the learner is placed, applying elsewhere is blocked.
// 4. Deadline passed -> expired, regardless of relevance.
// 5. Doesn't match the learner's profile -> irrelevant.
// 6. Profile isn't complete enough to apply anywhere -> profile incomplete.
// 7. Otherwise appliable -> urgent or soft deadline nudge depending on how much time is left.
export const getCtaState = (job: Job, learner: LearnerProfile, allJobs: Job[]): CtaState => {
    if (job.applicationStatus === "offer_received") return "accept_offer";
    if (job.applicationStatus) return "already_applied";

    const hasOfferElsewhere = allJobs.some((other) => other.id !== job.id && (other.applicationStatus === "offer_received" || other.applicationStatus === "offer_accepted"));
    if (hasOfferElsewhere) return "offer_received_blocking";

    if (isExpired(job)) return "expired";

    const { isRelevant } = computeRelevance(job, learner);
    if (!isRelevant) return "irrelevant";

    if (!learner.profileComplete) return "profile_incomplete";

    return job.deadlineHoursLeft <= HARD_DEADLINE_THRESHOLD_HOURS ? "deadline" : "soft_deadline";
};

export interface MismatchedField {
    label: string;
    required: string;
    actual: string;
}

// Drives the sidebar's "Your Profile does not match this job" panel — only degree and experience
// are ever surfaced here, matching the job card's own check/x fields (location is a soft factor,
// never rendered as a mismatch reason — see computeRelevance).
export const getMismatchedFields = (job: Job, learner: LearnerProfile): MismatchedField[] => {
    const { degreeMatch, experienceMatch } = computeRelevance(job, learner);
    const fields: MismatchedField[] = [];

    if (!experienceMatch) {
        fields.push({ label: "Experience", required: `${job.minExperienceYears}-${job.minExperienceYears + 1} years of experience`, actual: `You have ${learner.experienceYears} years of experience` });
    }
    if (!degreeMatch) {
        fields.push({ label: "Degree", required: job.degree, actual: `You have a ${learner.degree}` });
    }

    return fields;
};
