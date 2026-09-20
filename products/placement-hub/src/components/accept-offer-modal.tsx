import { Star01, XClose } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import celebrationGif from "@/assets/offer-accepted-celebration.gif";
import type { Job } from "@/types/job";

type Step = "confirm" | "feedback" | "thanks";

interface AcceptOfferModalProps {
    job: Job;
    onClose: () => void;
    /** Fires the moment the learner confirms — the modal doesn't wait on the rating/feedback that
     *  follows, since that's a nice-to-have, not a condition of accepting. */
    onConfirm: () => void;
}

const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hovered || value);
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        className="flex size-9 items-center justify-center"
                    >
                        {/* The icon set hardcodes fill="none" on the <svg>, which a Tailwind fill-* class can't
                            beat — pass fill/color directly as props (spread last, so they win) instead. */}
                        <Star01 className="size-7 transition-colors" fill={filled ? "#fdb022" : "none"} color={filled ? "#fdb022" : "#d0d5dd"} />
                    </button>
                );
            })}
        </div>
    );
};

// Accept Offer confirmation — confirm, then (independent of the accept itself, which already
// happened) an optional star rating that reveals a free-text field once a star is picked, and a
// final thank-you. No backend to send this feedback to; it's discarded on close, same as the rest
// of this app's "static QA simulation" surfaces.
export const AcceptOfferModal = ({ job, onClose, onConfirm }: AcceptOfferModalProps) => {
    const [step, setStep] = useState<Step>("confirm");
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    const handleConfirm = () => {
        onConfirm();
        setStep("feedback");
    };

    const handleRate = (value: number) => setRating(value);

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

                <AnimatePresence mode="wait" initial={false}>
                    {step === "confirm" && (
                        <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-8">
                            <div className="flex w-full flex-col items-center gap-2 text-center">
                                <p className="text-2xl font-semibold text-gray-900">Accept this offer?</p>
                                <p className="text-base text-gray-600">
                                    Are you sure you want to accept the offer for {job.role} at {job.companyName}?
                                </p>
                            </div>
                            <div className="flex w-full items-center gap-3">
                                <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleConfirm} className="flex-1 rounded-lg bg-purple-800 px-6 py-3 text-base font-semibold text-white hover:bg-purple-700">
                                    Yes, Accept Offer
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "feedback" && (
                        <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-6">
                            <img src={celebrationGif} alt="" className="size-40 shrink-0" />
                            <div className="flex w-full flex-col items-center gap-2 text-center">
                                <p className="text-2xl font-semibold text-gray-900">Congratulations, you've accepted the offer from {job.companyName}.</p>
                            </div>

                            <div className="flex w-full flex-col items-center gap-3">
                                <p className="text-base font-semibold text-gray-800">Rate Experience</p>
                                <StarRating value={rating} onChange={handleRate} />
                            </div>

                            {rating > 0 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex w-full flex-col items-start gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Tell us more</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        rows={4}
                                        placeholder="Share more about your experience..."
                                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-500"
                                    />
                                    <button type="button" onClick={() => setStep("thanks")} className="mt-1 w-full rounded-lg bg-purple-800 px-6 py-3 text-base font-semibold text-white hover:bg-purple-700">
                                        Submit
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {step === "thanks" && (
                        <motion.div key="thanks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-6 py-6 text-center">
                            <p className="text-2xl font-semibold text-gray-900">Thank you for your feedback.</p>
                            <button type="button" onClick={onClose} className="rounded-lg bg-purple-800 px-8 py-3 text-base font-semibold text-white hover:bg-purple-700">
                                Done
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};
