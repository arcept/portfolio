import type { Job } from "@/types/job";

export interface JobOfferDetails {
    position: string;
    salaryPerAnnum: string;
    startDate: string;
    stockOptions: string;
    probationPeriod: string;
    bonus: string;
    paidTimeOff: string;
    healthInsurance: string;
    locationSupport: string;
    flexibleSchedule: string;
    mealAllowance: string;
    attachmentName: string;
    attachmentSize: string;
}

// Fixture offer terms — there's no backend generating real offer letters, so every job that
// reaches "offer_received" (via the Apply flow or the QA Ops Simulator's "Extend Offer" action)
// gets the same boilerplate benefits package. Only position/attachment vary per job, derived from
// the job itself so this works for whichever job QA extends an offer to, not just one golden path.
export const getJobOffer = (job: Job): JobOfferDetails => ({
    position: `${job.role} - Mid Level`,
    salaryPerAnnum: "INR 12,00,000 Per Annum",
    startDate: "May 15, 2025",
    stockOptions: "Available",
    probationPeriod: "3 months",
    bonus: "Eligible after probation",
    paidTimeOff: "20 days annually",
    healthInsurance: "Full cover",
    locationSupport: "Offered",
    flexibleSchedule: "Available",
    mealAllowance: "Provided",
    attachmentName: "employment_contract.pdf",
    attachmentSize: "125kb",
});
