import { ChevronDown } from "@untitledui/icons";

const QUESTIONS = [
    "How does the job application process work on this platform?",
    "What happens after I submit my application?",
    "How long does it take to receive a response after applying?",
    "Can I apply for multiple jobs through this portal",
    "Why is there a screening process before my application reaches the hiring partner?",
    "Will I receive feedback on my application?",
    "Will I receive feedback on my application?",
    "What should I do if I don't hear back after the specified timeframe?",
    "Is there any assistance available for application preparation?",
    "Who can I contact for more information or assistance with my application?",
];

export const FaqCard = () => {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-secondary bg-secondary_subtle p-6">
            <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-success-primary">Frequently Asked Questions</h3>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-solid text-xs font-bold text-white">Q</span>
            </div>
            <p className="text-sm text-tertiary">Have questions? Find answers covering everything from application process, expectations, and available support</p>
            <ul className="flex flex-col divide-y divide-secondary border-t border-secondary">
                {QUESTIONS.map((q, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm text-secondary">
                        <span>
                            {i + 1}. {q}
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-quaternary" />
                    </li>
                ))}
            </ul>
        </div>
    );
};
