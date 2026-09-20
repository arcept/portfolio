export type NoticeStatus = "serving" | "not_resigned";
export type RelocationPreference = "yes" | "preferred" | "no";
export type Availability = "immediately" | "15_days" | "1_month" | "2_months" | "date";

// Every answer on the Placement Interest Form. Single-select and text answers are plain strings
// ("" = unanswered), multi-selects are string[] — one flat shape so the draft can live in a store
// and the schema in lib/interest-form.ts can address any field by key.
export interface InterestFormValues {
    // 1 · Background
    specialisationPrimary: string;
    specialisationSecondary: string;
    totalExperience: string;
    revitExperience: string;

    // 2 · Location
    country: string;
    state: string;
    city: string;
    /** Free-text city, used when the learner picks "Other city" or lives outside India. */
    cityOther: string;

    // 3 · Current situation
    employed: "yes" | "no" | "";
    currentCompany: string;
    currentDesignation: string;
    noticeStatus: NoticeStatus | "";
    /** Days — only asked while noticeStatus === "not_resigned". */
    noticePeriod: string;
    /** ISO yyyy-mm-dd — only asked while noticeStatus === "serving". */
    lastWorkingDay: string;
    noticeFlexibility: string;
    /** Only asked when not employed. */
    situation: string;
    availability: Availability | "";
    /** ISO yyyy-mm-dd — only asked when availability === "date". */
    availableFrom: string;

    // 4 · What they're looking for
    targetRoles: string[];
    employmentTypes: string[];
    workModes: string[];
    relocation: RelocationPreference | "";
    preferredLocations: string[];

    // 5 · Compensation (digits only, in ₹ per annum)
    currentCtc: string;
    expectedCtc: string;

    consent: boolean;
}

export type FieldId = keyof InterestFormValues;

export const EMPTY_VALUES: InterestFormValues = {
    specialisationPrimary: "",
    specialisationSecondary: "",
    totalExperience: "",
    revitExperience: "",
    country: "",
    state: "",
    city: "",
    cityOther: "",
    employed: "",
    currentCompany: "",
    currentDesignation: "",
    noticeStatus: "",
    noticePeriod: "",
    lastWorkingDay: "",
    noticeFlexibility: "",
    situation: "",
    availability: "",
    availableFrom: "",
    targetRoles: [],
    employmentTypes: [],
    workModes: [],
    relocation: "",
    preferredLocations: [],
    currentCtc: "",
    expectedCtc: "",
    consent: false,
};
