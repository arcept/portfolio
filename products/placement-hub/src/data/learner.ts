import { PROFILE } from "@/data/profile";
import type { LearnerProfile } from "@/types/job";

// Manik Madaan's profile — what job requirements are matched against to compute relevance.
export const LEARNER: LearnerProfile = {
    degree: "Bachelor of Architecture",
    experienceYears: 4,
    // Same city the Profile page shows. Open to moving anywhere in India, since the job board spans
    // the whole country.
    location: PROFILE.location,
    openToOtherLocations: true,
    profileComplete: true,
};
