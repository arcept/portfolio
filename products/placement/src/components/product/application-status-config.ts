import type { ApplicationStatus } from "@/state/learner-state";

interface StatusConfig {
    badgeLabel: string;
    badgeClassName: string;
    /** Verbatim banner copy from the jd-t-* reference screens. */
    message: string;
    messageClassName: string;
    /** Label used in the "Your Journey with {company}" tracker timeline. */
    trackerLabel: string;
}

// Only the statuses scenario 01 (happy path) uses so far — extend when scenarios 02-04 get built.
export const APPLICATION_STATUS_CONFIG: Partial<Record<ApplicationStatus, StatusConfig>> = {
    applied: {
        badgeLabel: "Applied",
        badgeClassName: "bg-utility-blue-50 text-utility-blue-700",
        message: "Congratulations! You've successfully submitted your application. Our team will review it shortly.",
        messageClassName: "bg-utility-blue-50 text-utility-blue-700",
        trackerLabel: "Applied",
    },
    profile_shared: {
        badgeLabel: "Profile Shared",
        badgeClassName: "bg-utility-indigo-50 text-utility-indigo-700",
        message: "Your application is currently being reviewed. We appreciate your patience, and you'll be notified once a decision is made.",
        messageClassName: "bg-utility-indigo-50 text-utility-indigo-700",
        trackerLabel: "Profile Shared",
    },
    shortlisted: {
        badgeLabel: "In Process",
        badgeClassName: "bg-utility-green-50 text-utility-green-700",
        message: "Congratulations! Your profile has been shortlisted. Await further instructions regarding the next steps.",
        messageClassName: "bg-utility-green-50 text-utility-green-700",
        trackerLabel: "Profile Shortlisted",
    },
    interview: {
        badgeLabel: "In Process",
        badgeClassName: "bg-utility-green-50 text-utility-green-700",
        message: "You've been selected for an interview! Details will be shared soon. Prepare to showcase your skills.",
        messageClassName: "bg-utility-green-50 text-utility-green-700",
        trackerLabel: "Selected for interview",
    },
    offer_received: {
        badgeLabel: "Offer Received",
        badgeClassName: "bg-brand-solid text-white",
        message: "🎉 Congratulations! You've received a placement offer. Review the details and accept within the given timeframe.",
        messageClassName: "bg-brand-solid text-white",
        trackerLabel: "Offer Received",
    },
    accepted: {
        badgeLabel: "Offer Accepted",
        badgeClassName: "bg-utility-blue-600 text-white",
        message: "🎉 Congratulations! You've accepted the placement offer. Welcome to the team! We look forward to your contributions and success in your new role.",
        messageClassName: "bg-utility-blue-600 text-white",
        trackerLabel: "Offer Accepted",
    },
};

export const TRACKER_STAGE_ORDER: ApplicationStatus[] = ["applied", "profile_shared", "shortlisted", "interview", "offer_received", "accepted"];
