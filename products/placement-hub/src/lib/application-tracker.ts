import type { ApplicationStatus } from "@/types/application";

export interface TrackerStep {
    label: string;
    /** "current" is the last reached step on the happy path (blue/bold); "negative" is a terminal
     *  outcome that cuts the happy path short (rejected/declined/disqualified/inactive) and is
     *  styled red instead of blue; "pending" is a step not reached yet, styled gray; every other
     *  reached step is a plain past step. */
    tone: "past" | "current" | "pending" | "negative";
}

const HAPPY_PATH = ["Applied", "Profile Shared", "Profile Shortlisted", "Selected for interview", "Offer Recieved", "Offer Accepted"];

// How far each status has progressed along the happy path before either continuing (current) or
// being cut short by a terminal outcome (negative) — fixture logic, not a real workflow engine.
const REACHED_COUNT: Record<ApplicationStatus, number> = {
    applied: 1,
    shared: 2,
    in_process: 3,
    offer_received: 5,
    offer_accepted: 6,
    disqualified: 3,
    rejected: 4,
    offer_declined: 5,
    inactive: 2,
};

const TERMINAL_LABEL: Partial<Record<ApplicationStatus, string>> = {
    disqualified: "Disqualified",
    rejected: "Rejected",
    offer_declined: "Offer Declined",
    inactive: "Application Inactive",
};

// Still-ongoing statuses show every step on the happy path, with whatever hasn't been reached yet
// grayed out — so the learner can see what's still ahead, not just where they've been. A terminal
// negative outcome cuts the path short instead: nothing was ever going to come after a rejection.
export const getTrackerSteps = (status: ApplicationStatus): TrackerStep[] => {
    const reachedCount = REACHED_COUNT[status];
    const terminalLabel = TERMINAL_LABEL[status];

    if (terminalLabel) {
        return HAPPY_PATH.slice(0, reachedCount).map((label, index) => {
            const isLast = index === reachedCount - 1;
            return { label: isLast ? terminalLabel : label, tone: isLast ? "negative" : "past" };
        });
    }

    return HAPPY_PATH.map((label, index) => {
        if (index < reachedCount - 1) return { label, tone: "past" };
        if (index === reachedCount - 1) return { label, tone: "current" };
        return { label, tone: "pending" };
    });
};
