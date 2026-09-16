import type { LearnerState } from "@/state/learner-state";

// Derived rules — screens read these, never re-implement them.
export const derive = (s: LearnerState) => {
    const inFlight = s.applications.some((a) => ["applied", "profile_shared", "shortlisted", "interview", "offer_received"].includes(a.status));
    return {
        hubUnlocked: s.stage === "graduated" && s.eligibility === "eligible",
        hasOffer: s.standing === "offer_received",
        focusMode: s.standing === "placed",
        lockedOut: s.standing === "declined_invalid", // total, immediate
        newApplicationsBlocked: ["disqualified_twice", "declined_invalid", "placed", "offer_received"].includes(s.standing),
        canApply: s.profile === "complete" && s.standing === "active",
        inFlight,
        // "Portal cannot close if person is in the middle of the process"
        hubMayClose: !inFlight,
        relevantJobs: s.jobs.filter((j) => j.relevance === "relevant"),
    };
};
