export interface Option {
    id: string;
    label: string;
    description?: string;
}

const opts = (labels: string[]): Option[] => labels.map((label) => ({ id: label, label }));

export const SPECIALISATIONS = opts([
    "Architectural Design",
    "Architectural Technology",
    "Urban Planning",
    "Urban Design",
    "Landscape Architecture",
    "Interior Design",
    "Sustainable & Green Design",
    "BIM & Computational Design",
    "Structural Engineering",
    "MEP Engineering",
    "Construction Management",
    "Real Estate & Project Management",
    "Other",
]);

export const TOTAL_EXPERIENCE: Option[] = [
    { id: "0", label: "Fresher (no experience yet)" },
    { id: "<1", label: "Less than 1 year" },
    ...Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1), label: i === 0 ? "1 year" : `${i + 1} years` })),
    { id: "10+", label: "More than 10 years" },
];

export const REVIT_EXPERIENCE: Option[] = [
    { id: "0", label: "No Revit experience yet" },
    { id: "<1", label: "Less than 1 year" },
    ...Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: i === 0 ? "1 year" : `${i + 1} years` })),
    { id: "8+", label: "More than 8 years" },
];

/** Numeric value of a TOTAL_EXPERIENCE / REVIT_EXPERIENCE id — used only to sanity-check that Revit
 *  years don't exceed total years. */
export const experienceToYears = (id: string): number => {
    if (id === "<1") return 0.5;
    if (id.endsWith("+")) return parseInt(id, 10) + 1;
    return Number(id) || 0;
};

export const COUNTRIES = opts([
    "India",
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Oman",
    "Bahrain",
    "Singapore",
    "United Kingdom",
    "United States",
    "Canada",
    "Australia",
    "Germany",
    "Other",
]);

export const SITUATIONS = opts(["Recently graduated", "Between jobs", "Taking a career break", "Upskilling or studying further"]);

export const NOTICE_STATUSES: Option[] = [
    { id: "serving", label: "I'm serving my notice", description: "I've already resigned" },
    { id: "not_resigned", label: "I haven't resigned yet", description: "I'd need to serve notice if hired" },
];

export const NOTICE_PERIODS: Option[] = [
    { id: "0", label: "Immediate (no notice)" },
    { id: "15", label: "15 days" },
    { id: "30", label: "30 days" },
    { id: "45", label: "45 days" },
    { id: "60", label: "60 days" },
    { id: "90", label: "90 days" },
    { id: "120", label: "More than 90 days" },
];

export const NOTICE_FLEXIBILITY: Option[] = [
    { id: "buyout", label: "Yes, my employer allows a buyout" },
    { id: "negotiable", label: "Yes, it's negotiable with my manager" },
    { id: "fixed", label: "No, it's fixed" },
    { id: "unsure", label: "Not sure" },
];

export const AVAILABILITY: Option[] = [
    { id: "immediately", label: "Immediately" },
    { id: "15_days", label: "Within 15 days" },
    { id: "1_month", label: "Within a month" },
    { id: "2_months", label: "Within 2 months" },
    { id: "date", label: "On a specific date" },
];

/** Days from today each non-date availability option resolves to. */
export const AVAILABILITY_DAYS: Record<string, number> = { immediately: 0, "15_days": 15, "1_month": 30, "2_months": 60 };

export const TARGET_ROLES = [
    "BIM Coordinator",
    "BIM Modeler",
    "BIM Engineer",
    "BIM Manager",
    "Junior Architect",
    "Project Architect",
    "Architectural Designer",
    "Design Technologist",
    "Computational Designer",
    "Urban Designer",
    "Urban Planner",
    "Landscape Architect",
    "Interior Designer",
    "VDC Engineer",
    "MEP Coordinator",
    "Structural Designer",
    "Site Engineer",
    "Construction Project Manager",
    "Sustainability Consultant",
    "3D Visualiser",
    "CAD / Drafting Technician",
];

export const EMPLOYMENT_TYPES: Option[] = [
    { id: "full_time", label: "Full-time", description: "A permanent role" },
    { id: "contract", label: "Contract", description: "Fixed term, usually 3–12 months" },
    { id: "freelance", label: "Freelance", description: "Project-based work" },
    { id: "internship", label: "Internship", description: "Learning-first, stipend-based" },
];

export const WORK_MODES: Option[] = [
    { id: "on_site", label: "On-site", description: "At the office" },
    { id: "hybrid", label: "Hybrid", description: "A mix of office and home" },
    { id: "remote", label: "Remote", description: "From anywhere" },
];

export const RELOCATION: Option[] = [
    { id: "yes", label: "Yes, anywhere", description: "I'm open to moving for the right role" },
    { id: "preferred", label: "Only to my preferred locations", description: "I'll name the cities" },
    { id: "no", label: "No, I'll stay where I am", description: "Roles in my current city only" },
];

export const YES_NO: Option[] = [
    { id: "yes", label: "Yes" },
    { id: "no", label: "No" },
];
