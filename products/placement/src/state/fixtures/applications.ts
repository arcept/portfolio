import type { Application } from "@/state/learner-state";

// A mixed-status set for the apps-list reference screen ("My Applications (12), mixed statuses").
// Scenario walkthroughs don't use this — they build up `applications` from their own initialState
// + step patches — this is only for previewing the My Applications screen outside a scripted run.
export const APPLICATION_FIXTURES: Application[] = [
    { jobId: "aecom-bim", status: "offer_received", history: ["applied", "profile_shared", "shortlisted", "interview", "offer_received"] },
    { jobId: "foster-partners-landscape", status: "interview", history: ["applied", "profile_shared", "shortlisted", "interview"] },
    { jobId: "gensler-interior", status: "rejected_profile", history: ["applied", "rejected_profile"] },
    { jobId: "zaha-hadid-urban", status: "company_inactive", history: ["applied", "profile_shared", "shortlisted", "interview", "company_inactive"] },
    { jobId: "aecom-structural", status: "not_shared_criteria", history: ["applied", "not_shared_criteria"] },
];
