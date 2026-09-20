import { FileMinus02 } from "@untitledui/icons";
import { getJobOffer } from "@/lib/job-offer";
import type { Job } from "@/types/job";

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

interface JobOfferRejectedCardProps {
    job: Job;
}

// The "you rejected this offer" counterpart to JobOfferCard — same offer details (position,
// salary, perks, attachment) for reference, same connected card + contact-strip layering, but a
// neutral/closed color treatment instead of the celebratory purple, no Accept/Reject buttons, and
// the reason captured in RejectOfferModal shown in their place.
export const JobOfferRejectedCard = ({ job }: JobOfferRejectedCardProps) => {
    const offer = getJobOffer(job);

    return (
        <div className="relative isolate flex w-full flex-col items-start">
            <div className="z-[2] -mb-6 flex w-full flex-col items-start gap-6 rounded-2xl border border-gray-200 bg-gray-50 px-14 py-[72px] shadow-[var(--shadow-banner)] max-md:gap-5 max-md:px-5 max-md:py-8">
                <div className="flex w-full items-center gap-4">
                    <CompanyLogo job={job} />
                    <p className="flex-1 text-2xl font-semibold text-black">{job.companyName}</p>
                </div>

                <div className="flex w-full flex-col items-start gap-6">
                    <p className="w-full text-[32px] leading-10 font-medium tracking-[-0.64px] max-md:text-2xl max-md:leading-8 text-gray-800">You've rejected the offer from {job.companyName}.</p>
                    <div className="flex w-full flex-col items-start gap-2 text-lg text-gray-800">
                        <p className="font-semibold">We appreciate your participation and wish you the best in your future endeavors.</p>
                        <p>
                            You declined the offer for the {job.role} position at {job.companyName}. The offer details below are kept here for your reference.
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
                    <div className="flex w-full flex-wrap items-center gap-x-2 border-l-[5px] border-gray-400 bg-gray-100 px-4 py-3">
                        <FileMinus02 className="size-6 shrink-0 text-gray-800" />
                        <span className="text-lg font-semibold text-gray-800 underline decoration-solid underline-offset-2">{offer.attachmentName}</span>
                        <span className="text-lg font-semibold text-gray-800">({offer.attachmentSize})</span>
                    </div>
                </div>

                <span className="h-px w-full bg-gray-200" />

                <div className="flex w-full flex-col items-start gap-4">
                    <p className="text-xl font-semibold text-gray-800">Reason for Rejection</p>
                    <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-gray-200 bg-white p-6">
                        <Field label="Reason" value={job.offerRejectionReason || "Not specified"} />
                        <div className="flex w-full flex-col items-start gap-0.5">
                            <p className="text-base text-gray-600">Additional Details</p>
                            <p className="text-base text-gray-800">{job.offerRejectionDetails || "No additional details were provided."}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="z-[1] flex w-full items-center gap-1 rounded-2xl border border-gray-300 bg-gray-50 px-10 pt-10 pb-4 max-md:px-5 max-md:pt-8">
                <div className="flex flex-1 flex-col items-start">
                    <p className="text-lg font-semibold text-gray-800">Have questions about this decision?</p>
                    <p className="text-sm text-gray-600">Let us know, We will try to improve</p>
                </div>
                <button type="button" className="text-lg font-semibold text-purple-600 hover:underline">
                    Contact us
                </button>
            </div>
        </div>
    );
};
