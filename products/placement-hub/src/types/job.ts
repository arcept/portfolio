import type { ApplicationStatus } from "@/types/application";

export type LogoTreatment = "dark-tile" | "light-circle";
export type WorkType = "On-Site" | "Remote" | "Hybrid";

export interface Job {
    id: string;
    companyName: string;
    role: string;
    logoSrc?: string;
    logoTreatment: LogoTreatment;
    degree: string;
    minExperienceYears: number;
    location: string;
    workType: WorkType;
    postedDaysAgo: number;
    /** Hours remaining until the application deadline. Zero or negative means the job has expired. */
    deadlineHoursLeft: number;
    /** Marked by the ops team from the backend — always pinned to the top of the Relevant list. */
    featured: boolean;
    /** Social-proof avatars shown on Featured cards ("N other professionals have applied"). */
    applicantAvatars?: string[];
    applicantCount?: number;

    /** Set once the learner has applied to THIS specific job — drives the JD page's status banner,
     *  the sidebar's application tracker, and the My Applications list on Home. */
    applicationStatus?: ApplicationStatus;
    /** Full-width status banner copy shown on the JD page in place of the normal CTA tab. */
    applicationMessage?: string;
    /** Display date reused across every reached step of the tracker (fixture data, not per-step timestamps). */
    applicationDate?: string;
    /** "Applied 7d ago" style string shown on the My Applications card and used for its sort order. */
    applicationLastUpdate?: string;
    /** Captured from RejectOfferModal's form when an offer is declined — shown back on the
     *  "offer rejected" JD page in place of the Accept/Reject buttons. Absent when a status jumps
     *  straight to offer_declined without going through that modal (e.g. the QA Ops Simulator's
     *  "Candidate Declines Offer" action). */
    offerRejectionReason?: string;
    offerRejectionDetails?: string;

    seniorityLevel: string;
    employmentType: string;
    jobFunctions: string;
    industries: string;
    aboutJob: string;
    roleAccountabilities: string[];
}

export interface LearnerProfile {
    degree: string;
    experienceYears: number;
    location: string;
    /** If true, a job in another city of the learner's own country isn't held against relevance —
     *  the learner is open to relocating within it. Overseas jobs still count as a location mismatch. */
    openToOtherLocations: boolean;
    /** Gates applying entirely (Profile Incomplete CTA state) until the learner finishes onboarding. */
    profileComplete: boolean;
}
