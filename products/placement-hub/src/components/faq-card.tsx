import { useState } from "react";
import { ChevronDown } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import faqIcon from "@/assets/faq-icon.svg";

const QUESTIONS = [
    { q: "How does the job application process work on this platform?", a: "To apply for a job, fill out the application form on the respective job page. Our team first reviews each application for suitability. If your profile matches the criteria, your application will then be forwarded to the hiring partner for further consideration." },
    { q: "What happens after I submit my application?", a: "Once submitted, your application undergoes an initial screening by our team. If it aligns well with the general requirements of our hiring partners, it will be forwarded to the relevant company for their evaluation. We will keep you updated on the status of your application." },
    { q: "How long does it take to receive a response after applying?", a: "The response time can vary based on the hiring partner's schedule and the volume of applications. Generally, you can expect an update from us within [specify timeframe, e.g., two weeks]." },
    { q: "Can I apply for multiple jobs through this portal?", a: "Yes, you are encouraged to apply for any job openings that match your qualifications and career goals. Please ensure that your application is relevant and tailored to each opening." },
    { q: "Why is there a screening process before my application reaches the hiring partner?", a: "Our screening process is designed to ensure the best fit between the applicants and the job requirements. This preliminary step enhances the likelihood of your success and helps the hiring partners in efficient candidate selection." },
    { q: "Will I receive feedback on my application?", a: "While we strive to provide feedback due to the high volume of applications, detailed feedback may not always be possible. However, you will be notified of the outcome of your application." },
    { q: "What should I do if I don't hear back after the specified timeframe?", a: "If you haven't received a response within the stated timeframe, please feel free to contact us for an update. We endeavor to provide timely updates to all applicants." },
    { q: "Is there any assistance available for application preparation?", a: "Yes, we provide resources for resume building and interview preparation. These resources can be accessed [specify where they can be found, e.g., on our resources page or via a direct link]." },
    { q: "Who can I contact for more information or assistance with my application?", a: "For any further inquiries or assistance, please reach out to our support team at [contact details]. We are here to assist you throughout your job application process." },
];

// Spring feel matches animate-ui.com's Radix accordion defaults (stiffness 150, damping 22) —
// https://animate-ui.com/docs/components/radix/accordion
const ACCORDION_TRANSITION = { type: "spring" as const, stiffness: 150, damping: 22 };

const FaqItem = ({ index, question, answer, isOpen, onToggle }: { index: number; question: string; answer: string; isOpen: boolean; onToggle: () => void }) => {
    const contentId = `faq-content-${index}`;

    return (
        <div className="flex w-full flex-col rounded-lg">
            <button type="button" onClick={onToggle} aria-expanded={isOpen} aria-controls={contentId} className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-gray-50">
                <p className="flex-1 text-sm font-semibold text-black">
                    {index + 1}. {question}
                </p>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={ACCORDION_TRANSITION} className="flex shrink-0 items-center justify-center">
                    <ChevronDown className="size-4 text-gray-500" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={contentId}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={ACCORDION_TRANSITION}
                        className="overflow-hidden"
                    >
                        <div className="px-2 pb-3">
                            <p className="text-sm text-gray-600">{answer}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const FaqCard = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 p-4">
            <div className="flex flex-col gap-2 px-4 py-2">
                <div className="flex w-full items-center justify-between">
                    <p className="text-xl font-semibold text-success-600">Frequently Asked Questions</p>
                    <img src={faqIcon} alt="" className="size-14 shrink-0" />
                </div>
                <p className="text-sm text-gray-500">Have questions? Find answers covering everything from application process, expectations, and available support</p>
            </div>
            <div className="flex w-full flex-col">
                {QUESTIONS.map((item, i) => (
                    <FaqItem key={item.q} index={i} question={item.q} answer={item.a} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
                ))}
            </div>
        </div>
    );
};
