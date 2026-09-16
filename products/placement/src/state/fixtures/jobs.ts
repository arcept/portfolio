import type { Job } from "@/state/learner-state";

// Company names and copy kept exactly as in Figma (docs/placement/spec/state-model.ts comment).
// AECOM Architects · BIM Architect is the spine job used by all 4 scenarios — its details (degree,
// experience, location) are read directly off the jd-apply-48h / jd-t-* reference screens.
export const AECOM_BIM_JOB: Job = {
    id: "aecom-bim",
    company: "AECOM Architects",
    role: "BIM Architect",
    location: "Hyderabad, India",
    workType: "On-Site",
    degree: "Bachelor of Architecture",
    experience: "4+ Years",
    relevance: "relevant",
    deadline: "hard_48h",
    badges: ["featured", "best_match"],
    postedDaysAgo: 1,
};

// A handful more for list variety (Jobs tab needs relevant/expired/irrelevant cards on screen
// alongside AECOM) — counts don't need to match the Figma "(36)"/"(12)"/"(4)" totals exactly for
// phase 1; the fidelity pass on the Jobs screens will decide whether that matters.
export const OTHER_JOBS: Job[] = [
    {
        id: "foster-partners-landscape",
        company: "Foster + Partners",
        role: "Senior Landscape Designer",
        location: "London, UK",
        workType: "Hybrid",
        degree: "Bachelor of Landscape Architecture",
        experience: "5+ Years",
        relevance: "relevant",
        deadline: "soft",
        postedDaysAgo: 3,
    },
    {
        id: "gensler-interior",
        company: "Gensler",
        role: "Interior Designer",
        location: "Dubai, UAE",
        workType: "On-Site",
        degree: "Bachelor of Interior Design",
        experience: "2+ Years",
        relevance: "irrelevant",
        postedDaysAgo: 5,
    },
    {
        id: "zaha-hadid-urban",
        company: "Zaha Hadid Architects",
        role: "Urban Planner",
        location: "London, UK",
        workType: "Remote",
        degree: "Master of Urban Planning",
        experience: "6+ Years",
        relevance: "expired",
        postedDaysAgo: 12,
    },
    {
        id: "aecom-structural",
        company: "AECOM Architects",
        role: "Structural Engineer",
        location: "Gurugram, India",
        workType: "On-Site",
        degree: "Bachelor of Civil Engineering",
        experience: "3+ Years",
        relevance: "irrelevant",
        postedDaysAgo: 2,
    },
];

export const ALL_JOBS: Job[] = [AECOM_BIM_JOB, ...OTHER_JOBS];
