import type { ApplicationStatus } from "@/types/application";

export interface OpsAction {
    label: string;
    next: ApplicationStatus;
    tone: "primary" | "danger";
}

// What the placement ops team can do from each stage of an application — mirrors the happy path
// in src/lib/application-tracker.ts, with a reject off-ramp at applied/shared and an
// accept/decline fork once an offer is extended.
//
// Disqualification is deliberately NOT available at "applied" or "shared" — those stages haven't
// involved any direct contact with the candidate yet (no interview, no offline communication), so
// there's nothing to disqualify them over. It only becomes possible once the application is
// "in_process" (interview stage — e.g. the candidate no-shows) or once an offer has already been
// extended ("offer_received" — e.g. a background/reference check afterwards turns something up).
export const OPS_ACTIONS: Partial<Record<ApplicationStatus, OpsAction[]>> = {
    applied: [{ label: "Share with Hiring Partner", next: "shared", tone: "primary" }],
    shared: [
        { label: "Move to In Process", next: "in_process", tone: "primary" },
        { label: "Reject Application", next: "rejected", tone: "danger" },
    ],
    in_process: [
        { label: "Extend Offer", next: "offer_received", tone: "primary" },
        { label: "Reject Application", next: "rejected", tone: "danger" },
        { label: "Disqualify Candidate", next: "disqualified", tone: "danger" },
    ],
    offer_received: [
        { label: "Candidate Accepts Offer", next: "offer_accepted", tone: "primary" },
        { label: "Candidate Declines Offer", next: "offer_declined", tone: "danger" },
        { label: "Disqualify Candidate", next: "disqualified", tone: "danger" },
    ],
};
