import { INDIA_LOCATIONS, INDIA_STATES, OTHER_CITY, PREFERRED_LOCATION_OPTIONS } from "@/data/india-locations";
import {
    AVAILABILITY,
    AVAILABILITY_DAYS,
    COUNTRIES,
    EMPLOYMENT_TYPES,
    NOTICE_FLEXIBILITY,
    NOTICE_PERIODS,
    NOTICE_STATUSES,
    RELOCATION,
    REVIT_EXPERIENCE,
    SITUATIONS,
    SPECIALISATIONS,
    TARGET_ROLES,
    TOTAL_EXPERIENCE,
    WORK_MODES,
    YES_NO,
} from "@/data/interest-form-options";
import type { Option } from "@/data/interest-form-options";
import { appToday } from "@/lib/app-clock";
import type { FieldId, InterestFormValues } from "@/types/interest-form";
import { EMPTY_VALUES } from "@/types/interest-form";

type Values = InterestFormValues;
type Resolvable<T> = T | ((v: Values) => T);

const resolve = <T>(value: Resolvable<T>, v: Values): T => (typeof value === "function" ? (value as (v: Values) => T)(v) : value);

// ─────────────────────────────────────────── schema types

interface FieldBase {
    id: FieldId;
    /** Small caption above the control — only used when a question holds several fields. */
    caption?: string;
    placeholder?: string;
    optional?: boolean;
    visible?: (v: Values) => boolean;
    /** Greyed out until an earlier answer it depends on is given (e.g. city before state). */
    disabled?: (v: Values) => boolean;
    /** Message shown when a required field is left empty. */
    requiredMessage?: string;
}

export type Field =
    | (FieldBase & { kind: "select"; options: Resolvable<Option[]> })
    | (FieldBase & { kind: "combo"; options: Resolvable<Option[]> })
    | (FieldBase & { kind: "text"; maxLength?: number })
    | (FieldBase & { kind: "amount" })
    | (FieldBase & { kind: "date"; min: () => string; max: () => string })
    | (FieldBase & { kind: "choice"; options: Option[]; variant: "segmented" | "cards"; columns?: 2 | 3 })
    | (FieldBase & { kind: "multi-choice"; options: Option[]; columns: 2 | 3 })
    | (FieldBase & { kind: "multi-combo"; options: string[]; max: number; itemNoun: string });

export interface Question {
    type: "question";
    /** Stable id, also the DOM anchor used to scroll to a question. */
    id: string;
    label: Resolvable<string>;
    hint?: Resolvable<string | undefined>;
    /** A soft, non-blocking nudge shown in amber under the hint. */
    warning?: (v: Values) => string | undefined;
    width: "half" | "full";
    fields: Field[];
    /** Lay several fields side by side instead of stacking them. */
    fieldColumns?: 2;
    visible?: (v: Values) => boolean;
}

/** An un-numbered, read-only note between questions (e.g. the derived earliest-joining date). */
export interface Callout {
    type: "callout";
    id: string;
    visible: (v: Values) => boolean;
    text: (v: Values) => string;
}

export type FormItem = Question | Callout;

export interface Section {
    id: string;
    title: string;
    description: string;
    items: FormItem[];
}

// ─────────────────────────────────────────── dates & money

const pad = (n: number) => String(n).padStart(2, "0");
export const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, days: number) => {
    const next = new Date(d);
    next.setDate(next.getDate() + days);
    return next;
};
const parseIso = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
};

export const today = () => toIsoDate(appToday());
export const inDays = (days: number) => toIsoDate(addDays(appToday(), days));

export const formatDate = (iso: string) => parseIso(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const digitsOnly = (raw: string) => raw.replace(/\D/g, "").replace(/^0+/, "");

/** "400000" -> "4,00,000" (Indian digit grouping, as in the Figma frame). */
export const formatIndian = (digits: string) => (digits ? Number(digits).toLocaleString("en-IN") : "");

/** "400000" -> "4 LPA" — the unit recruiters actually talk in. */
export const formatLpa = (digits: string) => {
    const n = Number(digits);
    if (!n) return "";
    if (n >= 10_000_000) return `${parseFloat((n / 10_000_000).toFixed(2))} Cr per annum`;
    return `${parseFloat((n / 100_000).toFixed(2))} LPA`;
};

const MIN_CTC = 10_000;
const MAX_CTC = 50_000_000;

/** The date the learner could realistically start, derived from whichever notice/availability
 *  answers are visible — recruiters get a single date instead of having to do the arithmetic. */
export const getEarliestJoining = (v: Values): string | undefined => {
    if (v.employed === "yes") {
        if (v.noticeStatus === "serving" && v.lastWorkingDay) return toIsoDate(addDays(parseIso(v.lastWorkingDay), 1));
        if (v.noticeStatus === "not_resigned" && v.noticePeriod) return inDays(Number(v.noticePeriod));
        return undefined;
    }
    if (v.employed === "no") {
        if (v.availability === "date") return v.availableFrom || undefined;
        if (v.availability) return inDays(AVAILABILITY_DAYS[v.availability]);
    }
    return undefined;
};

// ─────────────────────────────────────────── conditions

const isIndia = (v: Values) => v.country === "India";
/** A country other than India has been chosen — state and city become free text. */
const isNonIndia = (v: Values) => v.country !== "" && !isIndia(v);
const isEmployed = (v: Values) => v.employed === "yes";
const isRemoteOnly = (v: Values) => v.workModes.length > 0 && v.workModes.every((m) => m === "remote");
const noticeMayBeShortened = (v: Values) => isEmployed(v) && (v.noticeStatus === "serving" || (v.noticeStatus === "not_resigned" && v.noticePeriod !== "0"));

const cityOptions = (v: Values): Option[] => [...(INDIA_LOCATIONS[v.state] ?? []), OTHER_CITY].map((label) => ({ id: label, label }));
const stateOptions: Option[] = INDIA_STATES.map((label) => ({ id: label, label }));
const secondarySpecialisations = (v: Values) => SPECIALISATIONS.filter((o) => o.id !== v.specialisationPrimary);

/** The learner's current city as a readable string, wherever it was entered. */
export const currentCityLabel = (v: Values) => (v.city === OTHER_CITY || !isIndia(v) ? v.cityOther || v.city : v.city);

// ─────────────────────────────────────────── the form
//
// Order follows how a recruiter reads a profile: facts first (background, where you are, where
// you're at right now), then intent (what you want next), and money last — the most sensitive
// question comes once the learner has already invested in the form.

export const SECTIONS: Section[] = [
    {
        id: "background",
        title: "Your background",
        description: "What you studied and how much you've worked with it.",
        items: [
            {
                type: "question",
                id: "specialisation",
                label: "Project or area of specialisation during your studies",
                hint: "Pick the area you spent the most time on. A second area is optional.",
                width: "full",
                fieldColumns: 2,
                fields: [
                    { id: "specialisationPrimary", kind: "select", caption: "Primary", placeholder: "Select your main area", options: SPECIALISATIONS, requiredMessage: "Choose your main area of specialisation" },
                    { id: "specialisationSecondary", kind: "select", caption: "Secondary (optional)", placeholder: "Select a second area", options: secondarySpecialisations, optional: true },
                ],
            },
            {
                type: "question",
                id: "totalExperience",
                label: "Total professional experience",
                hint: "Count paid internships, freelance and full-time work in architecture, design or construction.",
                width: "half",
                fields: [{ id: "totalExperience", kind: "select", placeholder: "Select your experience", options: TOTAL_EXPERIENCE, requiredMessage: "Tell us your total experience" }],
            },
            {
                type: "question",
                id: "revitExperience",
                label: "Years of Revit experience",
                hint: "Include Revit you used at university or on personal projects.",
                width: "half",
                fields: [{ id: "revitExperience", kind: "select", placeholder: "Select your Revit experience", options: REVIT_EXPERIENCE, requiredMessage: "Tell us your Revit experience" }],
            },
        ],
    },
    {
        id: "location",
        title: "Where you are",
        description: "Where you currently live.",
        items: [
            {
                type: "question",
                id: "country",
                label: "Which country do you live in?",
                width: "half",
                fields: [{ id: "country", kind: "combo", placeholder: "Select your country", options: COUNTRIES, requiredMessage: "Select your country" }],
            },
            {
                type: "question",
                id: "state",
                label: (v) => (isNonIndia(v) ? "Which state or region do you live in?" : "Which state do you live in?"),
                hint: (v) => (isNonIndia(v) ? "Type the state, province or region." : undefined),
                width: "half",
                fields: [
                    { id: "state", kind: "combo", placeholder: "Select your state", options: stateOptions, visible: (v) => !isNonIndia(v), disabled: (v) => !v.country, requiredMessage: "Select your state" },
                    { id: "state", kind: "text", placeholder: "e.g. Dubai", visible: isNonIndia, maxLength: 60, requiredMessage: "Enter your state or region" },
                ],
            },
            {
                type: "question",
                id: "city",
                label: "Which city do you live in?",
                hint: (v) => (v.city === OTHER_CITY || isNonIndia(v) ? undefined : "Pick the nearest city if yours isn't listed."),
                width: "half",
                fields: [
                    { id: "city", kind: "combo", placeholder: "Select your city", options: cityOptions, visible: (v) => !isNonIndia(v), disabled: (v) => !v.state, requiredMessage: "Select your city" },
                    { id: "cityOther", kind: "text", placeholder: "Enter your city", visible: (v) => isNonIndia(v) || v.city === OTHER_CITY, maxLength: 60, requiredMessage: "Enter your city" },
                ],
            },
        ],
    },
    {
        id: "current",
        title: "Where you are right now",
        description: "Your current work situation and when you could start a new role.",
        items: [
            {
                type: "question",
                id: "employed",
                label: "Are you currently employed?",
                hint: "Freelancing or on contract? Choose Yes and tell us about your main client or studio.",
                width: "full",
                fields: [{ id: "employed", kind: "choice", variant: "segmented", options: YES_NO, requiredMessage: "Let us know if you're currently employed" }],
            },
            // ── employed
            {
                type: "question",
                id: "currentCompany",
                label: "Current company",
                width: "half",
                visible: isEmployed,
                fields: [{ id: "currentCompany", kind: "text", placeholder: "e.g. Studio Lotus", maxLength: 80, requiredMessage: "Enter your current company" }],
            },
            {
                type: "question",
                id: "currentDesignation",
                label: "Current designation",
                hint: "Your title as it appears on your offer letter.",
                width: "half",
                visible: isEmployed,
                fields: [{ id: "currentDesignation", kind: "text", placeholder: "e.g. BIM Coordinator", maxLength: 80, requiredMessage: "Enter your current designation" }],
            },
            {
                type: "question",
                id: "noticeStatus",
                label: "Where do you stand on notice?",
                width: "full",
                visible: isEmployed,
                fields: [{ id: "noticeStatus", kind: "choice", variant: "cards", columns: 2, options: NOTICE_STATUSES, requiredMessage: "Tell us where you stand on notice" }],
            },
            {
                type: "question",
                id: "lastWorkingDay",
                label: "What is your last working day?",
                hint: "As agreed with your employer.",
                width: "half",
                visible: (v) => isEmployed(v) && v.noticeStatus === "serving",
                fields: [{ id: "lastWorkingDay", kind: "date", min: today, max: () => inDays(365), requiredMessage: "Enter your last working day" }],
            },
            {
                type: "question",
                id: "noticePeriod",
                label: "What is your notice period?",
                hint: "As per your employment contract.",
                width: "half",
                visible: (v) => isEmployed(v) && v.noticeStatus === "not_resigned",
                fields: [{ id: "noticePeriod", kind: "select", placeholder: "Select your notice period", options: NOTICE_PERIODS, requiredMessage: "Select your notice period" }],
            },
            {
                type: "question",
                id: "noticeFlexibility",
                label: "Can your notice be shortened?",
                hint: "Recruiters often ask this first, so it can speed things up.",
                width: "half",
                visible: noticeMayBeShortened,
                fields: [{ id: "noticeFlexibility", kind: "select", placeholder: "Select an option", options: NOTICE_FLEXIBILITY, requiredMessage: "Tell us if your notice can be shortened" }],
            },
            {
                type: "callout",
                id: "earliestJoining",
                visible: (v) => isEmployed(v) && !!getEarliestJoining(v),
                text: (v) => {
                    const date = formatDate(getEarliestJoining(v)!);
                    return v.noticeStatus === "serving" ? `Earliest joining date: ${date}, the day after your last working day.` : `If you resigned today, you could join by ${date}.`;
                },
            },
            // ── not employed
            {
                type: "question",
                id: "situation",
                label: "What best describes you right now?",
                width: "half",
                visible: (v) => v.employed === "no",
                fields: [{ id: "situation", kind: "select", placeholder: "Select an option", options: SITUATIONS, requiredMessage: "Select what best describes you" }],
            },
            {
                type: "question",
                id: "availability",
                label: "When could you start a new role?",
                width: "half",
                visible: (v) => v.employed === "no",
                fields: [{ id: "availability", kind: "select", placeholder: "Select when you could start", options: AVAILABILITY, requiredMessage: "Tell us when you could start" }],
            },
            {
                type: "question",
                id: "availableFrom",
                label: "From which date?",
                width: "half",
                visible: (v) => v.employed === "no" && v.availability === "date",
                fields: [{ id: "availableFrom", kind: "date", min: today, max: () => inDays(365), requiredMessage: "Enter the date you could start" }],
            },
        ],
    },
    {
        id: "looking-for",
        title: "What you're looking for",
        description: "The roles and conditions that would suit you. This is what we match jobs against.",
        items: [
            {
                type: "question",
                id: "targetRoles",
                label: "Which roles are you targeting?",
                hint: "Choose up to 3. Can't find yours? Type it and add it.",
                width: "full",
                fields: [
                    { id: "targetRoles", kind: "multi-combo", placeholder: "Search roles, e.g. BIM Coordinator", options: TARGET_ROLES, max: 3, itemNoun: "role", requiredMessage: "Choose at least one role" },
                ],
            },
            {
                type: "question",
                id: "employmentTypes",
                label: "What type of employment are you looking for?",
                hint: "Select every type you'd consider.",
                width: "full",
                fields: [{ id: "employmentTypes", kind: "multi-choice", columns: 2, options: EMPLOYMENT_TYPES, requiredMessage: "Choose at least one employment type" }],
            },
            {
                type: "question",
                id: "workModes",
                label: "How would you like to work?",
                hint: "Select every mode you'd be comfortable with.",
                width: "full",
                fields: [{ id: "workModes", kind: "multi-choice", columns: 3, options: WORK_MODES, requiredMessage: "Choose at least one work mode" }],
            },
            {
                type: "question",
                id: "relocation",
                label: (v) => (currentCityLabel(v) ? `Are you willing to relocate from ${currentCityLabel(v)}?` : "Are you willing to relocate?"),
                hint: "We only ask this for on-site and hybrid roles.",
                width: "full",
                visible: (v) => v.workModes.length > 0 && !isRemoteOnly(v),
                fields: [{ id: "relocation", kind: "choice", variant: "cards", columns: 3, options: RELOCATION, requiredMessage: "Tell us if you're open to relocating" }],
            },
            {
                type: "question",
                id: "preferredLocations",
                label: "Which locations would you consider?",
                hint: (v) => `Add up to 5 cities.${currentCityLabel(v) ? ` ${currentCityLabel(v)} is always included.` : ""}`,
                width: "full",
                visible: (v) => v.relocation === "preferred" && !isRemoteOnly(v),
                fields: [
                    { id: "preferredLocations", kind: "multi-combo", placeholder: "Search cities, e.g. New Delhi", options: PREFERRED_LOCATION_OPTIONS, max: 5, itemNoun: "location", requiredMessage: "Add at least one location" },
                ],
            },
        ],
    },
    {
        id: "compensation",
        title: "Compensation",
        description: "Kept private to the placement team. It helps us shortlist roles that fit, and it's never shown to companies without your consent.",
        items: [
            {
                type: "question",
                id: "currentCtc",
                label: "What is your current CTC?",
                hint: "Annual fixed pay in ₹, before tax. Leave out one-time bonuses.",
                width: "half",
                visible: isEmployed,
                fields: [{ id: "currentCtc", kind: "amount", placeholder: "e.g. 4,00,000", requiredMessage: "Enter your current annual CTC" }],
            },
            {
                type: "question",
                id: "expectedCtc",
                label: "Expected CTC for future roles?",
                hint: "Annual pay in ₹. A realistic range gets you better matches.",
                width: "half",
                warning: (v) =>
                    isEmployed(v) && v.currentCtc && v.expectedCtc && Number(v.expectedCtc) < Number(v.currentCtc)
                        ? "This is lower than your current CTC. That's fine if it's intentional."
                        : undefined,
                fields: [{ id: "expectedCtc", kind: "amount", placeholder: "e.g. 6,00,000", requiredMessage: "Enter your expected annual CTC" }],
            },
        ],
    },
];

// ─────────────────────────────────────────── evaluation

export const isQuestion = (item: FormItem): item is Question => item.type === "question";

export const isQuestionVisible = (q: Question, v: Values) => q.visible?.(v) ?? true;
export const visibleFields = (q: Question, v: Values) => q.fields.filter((f) => f.visible?.(v) ?? true);

/** The visible questions of a section, in order. */
export const visibleQuestions = (section: Section, v: Values) => section.items.filter(isQuestion).filter((q) => isQuestionVisible(q, v));

export const resolveText = <T extends string | undefined>(value: Resolvable<T> | undefined, v: Values) => (value === undefined ? undefined : resolve(value, v));
export const resolveOptions = (options: Resolvable<Option[]>, v: Values) => resolve(options, v);

const isEmpty = (value: string | string[] | boolean) => (Array.isArray(value) ? value.length === 0 : typeof value === "string" ? value.trim() === "" : !value);

/** The validation message for one field, or undefined when it's fine (or hidden). */
export const validateField = (field: Field, v: Values): string | undefined => {
    if (field.visible && !field.visible(v)) return undefined;
    const value = v[field.id];
    if (isEmpty(value)) return field.optional ? undefined : (field.requiredMessage ?? "This question is required");

    switch (field.kind) {
        case "text":
            return (value as string).trim().length < 2 ? "Please enter at least 2 characters" : undefined;
        case "amount": {
            const n = Number(value);
            if (n < MIN_CTC) return "That looks too low. Enter the full annual amount, e.g. 4,00,000 for 4 LPA";
            if (n > MAX_CTC) return "That looks too high. Please check the amount";
            return undefined;
        }
        case "date": {
            const iso = value as string;
            if (iso < field.min()) return "Choose today or a later date";
            if (iso > field.max()) return "Choose a date within the next year";
            return undefined;
        }
        default:
            return undefined;
    }
};

export type FormErrors = Partial<Record<FieldId, string>>;

export const validateForm = (v: Values): FormErrors => {
    const errors: FormErrors = {};
    for (const section of SECTIONS) {
        for (const q of visibleQuestions(section, v)) {
            for (const f of visibleFields(q, v)) {
                const error = validateField(f, v);
                if (error) errors[f.id] = error;
            }
        }
    }
    if (!v.consent) errors.consent = "Please agree to continue";
    return errors;
};

/** A question counts as done once every required, visible field in it is valid. Optional-only
 *  questions never count towards progress. */
export const isQuestionComplete = (q: Question, v: Values) => visibleFields(q, v).every((f) => !validateField(f, v));

export const getProgress = (v: Values) => {
    let total = 0;
    let done = 0;
    for (const section of SECTIONS) {
        for (const q of visibleQuestions(section, v)) {
            if (visibleFields(q, v).every((f) => f.optional)) continue;
            total += 1;
            if (isQuestionComplete(q, v)) done += 1;
        }
    }
    total += 1; // the consent checkbox
    if (v.consent) done += 1;
    return { done, total };
};

/** Values a hidden question left behind (e.g. a CTC typed before switching to "not employed")
 *  must never be submitted, so blank everything the learner can no longer see. */
export const pruneHiddenValues = (v: Values): Values => {
    const shown = new Set<FieldId>();
    const declared = new Set<FieldId>();
    for (const section of SECTIONS) {
        for (const q of section.items.filter(isQuestion)) {
            const questionVisible = isQuestionVisible(q, v);
            for (const f of q.fields) {
                declared.add(f.id);
                if (questionVisible && (f.visible?.(v) ?? true)) shown.add(f.id);
            }
        }
    }

    // `state` is declared twice (an India dropdown and a free-text control) — it stays if either shows.
    const next: Values = { ...v };
    declared.forEach((id) => {
        if (shown.has(id)) return;
        const empty = EMPTY_VALUES[id];
        (next[id] as unknown) = Array.isArray(empty) ? [] : empty;
    });
    return next;
};

/** Which answers must be cleared when another answer changes, because they depend on it. */
export const cascadeReset = (id: FieldId, next: Values): Partial<Values> => {
    switch (id) {
        case "country":
            return { state: "", city: "", cityOther: "" };
        case "state":
            return { city: "", cityOther: "" };
        case "city":
            return next.city === OTHER_CITY ? {} : { cityOther: "" };
        case "specialisationPrimary":
            return next.specialisationSecondary === next.specialisationPrimary ? { specialisationSecondary: "" } : {};
        default:
            return {};
    }
};

/** Everything a recruiter-facing summary needs, with the derived earliest-joining date resolved. */
export interface InterestSubmission {
    values: Values;
    earliestJoining?: string;
    submittedAt: string;
}

export const buildSubmission = (values: Values): InterestSubmission => {
    const pruned = pruneHiddenValues(values);
    return { values: pruned, earliestJoining: getEarliestJoining(pruned), submittedAt: appToday().toISOString() };
};
