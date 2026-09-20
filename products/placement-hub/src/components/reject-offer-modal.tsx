import { ChevronDown, XClose } from "@untitledui/icons";
import { motion } from "motion/react";
import { useState } from "react";
import type { Job } from "@/types/job";
import { cx } from "@/utils/cx";

type Step = "form" | "rejected";

interface RejectOfferModalProps {
    job: Job;
    onClose: () => void;
    /** Fires only once every requirement below is met and the learner clicks the final Reject
     *  button — rejecting is contingent on the reason being captured, unlike accepting. Passes the
     *  chosen reason and free-text details along so they can be stashed on the job and shown back
     *  on the "offer rejected" JD page. */
    onConfirm: (reason: string, details: string) => void;
}

// Random-but-plausible reasons a candidate might turn down a placement offer — there's no backend
// to source these from, same fixture-data spirit as the rest of this app.
const REJECT_REASONS = [
    "Accepted a better offer elsewhere",
    "Salary does not meet my expectations",
    "Role does not align with my career goals",
    "Relocation is not feasible for me right now",
    "Compensation and benefits package is insufficient",
    "On-site/location requirement is not suitable",
    "Concerns about company culture or work environment",
    "Job responsibilities differ from what was discussed",
    "Personal or family circumstances have changed",
    "Decided to pursue further education/higher studies",
];

// No separate "are you sure?" step — the form below (checkboxes + reason + details) already gates
// the reject action, so a plain yes/no confirm in front of it would just be a redundant extra
// click. It opens straight into the form, then confirms with a final "Offer Rejected" dialog once
// the actual rejection has fired.
export const RejectOfferModal = ({ job, onClose, onConfirm }: RejectOfferModalProps) => {
    const [step, setStep] = useState<Step>("form");
    const [understandsDisqualification, setUnderstandsDisqualification] = useState(false);
    const [readPolicy, setReadPolicy] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");

    const canReject = understandsDisqualification && readPolicy && reason !== "" && details.trim().length > 0;

    const handleReject = () => {
        onConfirm(reason, details);
        setStep("rejected");
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm max-md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                className="relative flex w-[560px] flex-col items-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-10 max-md:max-h-[calc(100dvh-32px)] max-md:w-full max-md:overflow-y-auto max-md:p-5 shadow-[var(--shadow-card-lg)]"
            >
                <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-lg hover:bg-gray-50">
                    <XClose className="size-5 text-gray-500" />
                </button>

                {step === "form" ? (
                    <div className="flex w-full flex-col items-start gap-5">
                        <div className="flex w-full flex-col items-start gap-1">
                            <p className="text-xl font-semibold text-gray-900">Before you reject this offer</p>
                            <p className="text-sm text-gray-600">
                                Please review and confirm the following before rejecting the offer for {job.role} at {job.companyName}.
                            </p>
                        </div>

                        <div className="flex w-full flex-col items-start gap-3">
                            <label className="flex w-full items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={understandsDisqualification}
                                    onChange={(e) => setUnderstandsDisqualification(e.target.checked)}
                                    className="mt-0.5 size-4 shrink-0 rounded border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">I understand that rejecting an offer might lead to my disqualification from the placement process.</span>
                            </label>
                            <label className="flex w-full items-start gap-2">
                                <input type="checkbox" checked={readPolicy} onChange={(e) => setReadPolicy(e.target.checked)} className="mt-0.5 size-4 shrink-0 rounded border-gray-300" />
                                <span className="text-sm font-medium text-gray-700">
                                    I've read all of the terms and conditions and the placement policy, and I understand the implications of rejecting an offer.
                                </span>
                            </label>
                        </div>

                        <div className="flex w-full flex-col items-start gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Reason for rejecting</label>
                            <div className="relative w-full">
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none focus:border-purple-500"
                                >
                                    <option value="" disabled>
                                        Select a reason
                                    </option>
                                    {REJECT_REASONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        <div className="flex w-full flex-col items-start gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Tell us more</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows={4}
                                placeholder="Share more details about why you're rejecting this offer..."
                                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-500"
                            />
                        </div>

                        <div className="flex w-full items-center gap-3 pt-1">
                            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={!canReject}
                                className={cx(
                                    "flex-1 rounded-lg px-6 py-3 text-base font-semibold",
                                    canReject ? "bg-error-600 text-white hover:bg-error-700" : "cursor-not-allowed bg-gray-100 text-gray-400",
                                )}
                            >
                                Reject Offer
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex w-full flex-col items-center gap-6 py-6 text-center">
                        <p className="text-2xl font-semibold text-gray-900">Offer Rejected</p>
                        <p className="text-base text-gray-600">
                            You've rejected the offer from {job.companyName}. We appreciate your participation and wish you the best in your future endeavors.
                        </p>
                        <button type="button" onClick={onClose} className="rounded-lg bg-purple-800 px-8 py-3 text-base font-semibold text-white hover:bg-purple-700">
                            Done
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
