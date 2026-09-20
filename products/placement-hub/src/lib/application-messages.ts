import type { ApplicationStatus } from "@/types/application";

// Canonical status -> banner copy, shared by the fixture data (src/data/jobs.ts), the "apply"
// flow, and the QA ops simulator — so every path that sets a status keeps the message in sync
// with it instead of each caller inventing its own text.
export const APPLICATION_MESSAGE_BY_STATUS: Record<ApplicationStatus, string> = {
    applied: "You've successfully submitted your application. Our team will review it shortly.",
    shared: "Your application has been successfully shared with the Hiring Partner. Please wait for the assessment.",
    in_process: "Your application is currently being reviewed. We appreciate your patience, and you'll be notified once a decision is made.",
    offer_received: "Congratulations! You've been offered a placement. Review the details and accept within the given timeframe.",
    offer_accepted: "Congratulations! You've accepted the placement offer. Welcome to the team! We look forward to your contributions and success in your new role.",
    rejected: "We appreciate your interest, but unfortunately, your application has been unsuccessful. Don't be discouraged, and consider applying for future opportunities.",
    offer_declined: "We understand if you've chosen not to accept the placement. We appreciate your participation and wish you the best in your future endeavors.",
    inactive: "The position you applied for is no longer available. Explore other open opportunities.",
    disqualified: "You did not show up for interview, hence you have been disqualified from sitting for this job's placement process.",
};
