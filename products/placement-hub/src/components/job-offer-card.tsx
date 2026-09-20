import { FileMinus02 } from "@untitledui/icons";
import { useState } from "react";
import { getJobOffer } from "@/lib/job-offer";
import type { Job } from "@/types/job";
import { cx } from "@/utils/cx";

const CompanyLogo = ({ job }: { job: Job }) => {
    const { logoSrc, logoTreatment, companyName } = job;

    if (!logoSrc) {
        return <span className="flex size-12 shrink-0 items-center justify-center rounded-3xl bg-gray-800 text-lg font-bold text-white">{companyName.charAt(0)}</span>;
    }
    if (logoTreatment === "light-circle") {
        return (
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <img src={logoSrc} alt={companyName} className="size-full object-contain" />
            </span>
        );
    }
    return (
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gray-800">
            <img src={logoSrc} alt={companyName} className="size-full object-cover" />
        </span>
    );
};

const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-start gap-0.5">
        <p className="text-base text-gray-600">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
);

const PerkField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center text-lg">
        <span className="w-44 text-gray-600 max-md:w-32 max-md:shrink-0">{label}</span>
        <span className="flex-1 font-semibold text-gray-800">{value}</span>
    </div>
);

interface JobOfferCardProps {
    job: Job;
    /** Opens the Accept/Reject confirmation modals — owned by JobDescription (like ApplyModal) and
     *  rendered outside this card's animated ancestor tree, since a `position: fixed` modal breaks
     *  under any ancestor with a `transform` (Framer Motion's animations use `transform`, which
     *  creates a new containing block and would confine the modal inside the card instead of the
     *  viewport). */
    onRequestAccept: () => void;
    onRequestReject: () => void;
}

// The big "you've been offered a role" card shown at the top of the JD page once an offer has
// been extended — sits visually connected to (and above) JobJdCard below it via a negative margin
// + z-index overlap, matching the Figma handoff's two-piece "offer card + contact strip" layering.
export const JobOfferCard = ({ job, onRequestAccept, onRequestReject }: JobOfferCardProps) => {
    const offer = getJobOffer(job);
    const [readPolicy, setReadPolicy] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const canAccept = readPolicy && agreedToTerms;

    return (
        <div className="relative isolate flex w-full flex-col items-start">
            <div className="z-[2] -mb-6 flex w-full flex-col items-start gap-6 rounded-2xl border border-purple-100 bg-purple-25 px-14 py-[72px] shadow-[var(--shadow-banner)] max-md:gap-5 max-md:px-5 max-md:py-8">
                <div className="flex w-full items-center gap-4">
                    <CompanyLogo job={job} />
                    <p className="flex-1 text-2xl font-semibold text-black">{job.companyName}</p>
                </div>

                <div className="flex w-full flex-col items-start gap-6">
                    <p className="w-full text-[32px] leading-10 font-medium tracking-[-0.64px] max-md:text-2xl max-md:leading-8 text-purple-800">
                        Congratulations!
                        <br />
                        You've been offered a role at {job.companyName}.
                    </p>
                    <div className="flex w-full flex-col items-start gap-2 text-lg text-gray-800">
                        <p className="font-semibold">We look forward to your contributions and success in your new role.</p>
                        <p>
                            Excited to offer you the {job.role} position at {job.companyName}. This opportunity comes along with a range of benefits and room to grow with our team. We're looking forward to
                            having you on board!
                        </p>
                    </div>
                </div>

                <span className="h-px w-full bg-gray-200" />

                <div className="grid w-full grid-cols-3 gap-1 max-md:grid-cols-1 max-md:gap-3">
                    <Field label="Position" value={offer.position} />
                    <Field label="Salary" value={offer.salaryPerAnnum} />
                    <Field label="Start Date" value={offer.startDate} />
                </div>

                <span className="h-px w-full bg-gray-200" />

                <div className="flex w-full flex-col items-start gap-4">
                    <p className="text-xl font-semibold text-gray-800">Perks & Additional Benefits</p>
                    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2 max-md:grid-cols-1">
                        <PerkField label="Stock options" value={offer.stockOptions} />
                        <PerkField label="Probation Period" value={offer.probationPeriod} />
                        <PerkField label="Bonus" value={offer.bonus} />
                        <PerkField label="Paid time off" value={offer.paidTimeOff} />
                        <PerkField label="Health insurance" value={offer.healthInsurance} />
                        <PerkField label="Location support" value={offer.locationSupport} />
                        <PerkField label="Flexible schedule" value={offer.flexibleSchedule} />
                        <PerkField label="Meal allowance" value={offer.mealAllowance} />
                    </div>
                </div>

                <span className="h-px w-full bg-gray-200" />

                <div className="flex w-full flex-col items-start gap-4">
                    <p className="text-xl font-semibold text-gray-800">Attachments</p>
                    <div className="flex w-full flex-wrap items-center gap-x-2 border-l-[5px] border-purple-500 bg-purple-100 px-4 py-3">
                        <FileMinus02 className="size-6 shrink-0 text-gray-800" />
                        <span className="text-lg font-semibold text-gray-800 underline decoration-solid underline-offset-2">{offer.attachmentName}</span>
                        <span className="text-lg font-semibold text-gray-800">({offer.attachmentSize})</span>
                    </div>
                </div>

                <div className="flex w-full flex-col items-start gap-6 pt-4">
                    <div className="flex w-full flex-col items-start">
                        <label className="flex w-full items-center gap-2 p-2">
                            <input type="checkbox" checked={readPolicy} onChange={(e) => setReadPolicy(e.target.checked)} className="size-4 rounded border-gray-300" />
                            <span className="text-sm font-medium text-gray-700">
                                I've carefully read the Placement Policy, Employment Contract Letter and understand the Terms & Conditions.
                            </span>
                        </label>
                        <label className="flex w-full items-center gap-2 p-2">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="size-4 shrink-0 rounded border-gray-300" />
                            <span className="flex-1 text-sm font-medium text-gray-700">I declare that I have read clearly through the requirements and agree to the role, offer and job requirements.</span>
                        </label>
                    </div>

                    <div className="flex w-full items-start gap-2 max-md:flex-col max-md:items-stretch">
                        <button
                            type="button"
                            onClick={onRequestReject}
                            className="flex min-w-[200px] max-w-[400px] items-center justify-center gap-2 max-md:max-w-none rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-purple-800 hover:bg-gray-50"
                        >
                            Reject Offer
                        </button>
                        <button
                            type="button"
                            onClick={onRequestAccept}
                            disabled={!canAccept}
                            className={cx(
                                "flex min-w-[200px] max-w-[400px] items-center justify-center gap-2 max-md:max-w-none rounded-lg px-6 py-3 text-base font-semibold text-white",
                                canAccept ? "bg-purple-800 hover:bg-purple-700" : "cursor-not-allowed bg-purple-200",
                            )}
                        >
                            Accept Offer
                        </button>
                    </div>
                </div>
            </div>

            <div className="z-[1] flex w-full items-center gap-1 rounded-2xl border border-gray-300 bg-gray-50 px-10 pt-10 pb-4 max-md:px-5 max-md:pt-8">
                <div className="flex flex-1 flex-col items-start">
                    <p className="text-lg font-semibold text-gray-800">Having some issue with the offer?</p>
                    <p className="text-sm text-gray-600">Let us know, We will try to improve</p>
                </div>
                <button type="button" className="text-lg font-semibold text-purple-600 hover:underline">
                    Contact us
                </button>
            </div>
        </div>
    );
};
