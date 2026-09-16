// Placement Hub — learner state model (as shipped, 2024)
// Source: claude/placement-portal-ia-flows-scenarios.md §1, §5. Every screen = f(LearnerState).

export type JourneyStage =
  | 'learn' | 'capstone_pre50' | 'capstone_post50' | 'evaluation_day' | 'graduated' | 'hub_closed';

export type Eligibility = 'not_assessed' | 'eligible' | 'not_eligible';
// Computed: 50% capstone + 30% learn mode + 20% evaluation day, plus review-day attendance.
// Profile completeness is a HARD gate here (flagged inconsistency — soft everywhere else).

export type ProfileCompleteness = 'complete' | 'incomplete';

export type Interest = 'unknown' | 'interested' | 'not_interested';

export type Standing =
  | 'active' | 'offer_received' | 'placed' | 'self_placed'
  | 'declined_valid' | 'declined_invalid'      // invalid → access restricted, immediate
  | 'disqualified_once' | 'disqualified_twice' // twice → new listings + applying blocked; existing apps workable
  | 'non_placed_closed';

export type ApplicationStatus =
  | 'applied' | 'profile_shared' | 'shortlisted' | 'interview' | 'offer_received'
  | 'accepted' | 'declined'
  | 'not_shared_criteria' | 'rejected_profile' | 'rejected_interview'
  | 'no_company_response' | 'position_unavailable' | 'company_inactive' | 'offer_expired'
  | 'disqualified';

export type JobRelevance = 'relevant' | 'irrelevant' | 'expired';
export type Deadline = 'hard_48h' | 'soft';

export interface Job {
  id: string;
  company: string;            // Figma names kept, e.g. "AECOM Architects"
  role: string;               // e.g. "BIM Architect"
  location: string;
  workType: 'On-Site' | 'Hybrid' | 'Remote';
  degree: string;
  experience: string;
  relevance: JobRelevance;
  deadline?: Deadline;
  badges?: Array<'featured' | 'best_match'>;
  postedDaysAgo: number;
}

export interface Application {
  jobId: string;
  status: ApplicationStatus;
  history: ApplicationStatus[]; // drives the Steps tracker
  reason?: string;              // shipped: post-application rejection reasoning
}

export interface LearnerState {
  name: string;
  stage: JourneyStage;
  eligibility: Eligibility;
  profile: ProfileCompleteness;
  interest: Interest;
  standing: Standing;
  preferredLocation: string;
  jobs: Job[];                  // content condition: any openings? any relevant?
  applications: Application[];
  updates: Array<{ id: string; text: string; read: boolean }>;
  windowClosingSoon: boolean;   // "portal closing in a week"
}

// Derived rules — screens read these, never re-implement them.
export const derive = (s: LearnerState) => {
  const inFlight = s.applications.some(a =>
    ['applied','profile_shared','shortlisted','interview','offer_received'].includes(a.status));
  return {
    hubUnlocked: s.stage === 'graduated' && s.eligibility === 'eligible',
    hasOffer: s.standing === 'offer_received',
    focusMode: s.standing === 'placed',
    lockedOut: s.standing === 'declined_invalid',              // total, immediate
    newApplicationsBlocked: ['disqualified_twice','declined_invalid','placed','offer_received'].includes(s.standing),
    canApply: s.profile === 'complete' && s.standing === 'active',
    inFlight,
    // "Portal cannot close if person is in the middle of the process"
    hubMayClose: !inFlight,
    relevantJobs: s.jobs.filter(j => j.relevance === 'relevant'),
  };
};

// NOT prototyped: pre-application per-criterion skills-match panel (cut — Retool exposed only a verdict).
