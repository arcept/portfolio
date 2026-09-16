import type { LearnerState } from "@/state/learner-state";

// Copy taken verbatim off the home-updates-compressed/expanded reference screens (all AECOM,
// matching the spine application). Read-only feed content — not driven by scenario state patches.
export const UPDATE_FIXTURES: LearnerState["updates"] = [
    { id: "upd-01", text: "You have applied with AECOM", read: false },
    { id: "upd-02", text: "Your Profile has been shared with AECOM", read: false },
    { id: "upd-03", text: "Your Profile has been shortlisted with AECOM", read: false },
    { id: "upd-04", text: "Your Profile has been shortlisted for an interview with AECOM", read: false },
    { id: "upd-05", text: "You have received an offer with AECOM", read: true },
    { id: "upd-06", text: "You have a new update regarding your profile shortlisting with AECOM", read: true },
    { id: "upd-07", text: "You have a new update regarding your interview shortlisting with AECOM", read: true },
    { id: "upd-08", text: "Criteria mismatch with AECOM", read: true },
    { id: "upd-09", text: "You declined the offer with AECOM", read: true },
    { id: "upd-10", text: "Position with AECOM no longer available", read: true },
    { id: "upd-11", text: "You have accepted the offer with AECOM", read: true },
    { id: "upd-12", text: "You have been disqualified for not showing up to AECOM's interview. This is your first disqualification.", read: true },
];
