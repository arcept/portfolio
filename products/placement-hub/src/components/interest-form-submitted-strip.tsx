import { CheckCircle } from "@untitledui/icons";

interface InterestFormSubmittedStripProps {
    submittedAt: string;
    onReview: () => void;
}

// Replaces InterestFormBanner after submission: a quiet confirmation instead of a second big
// banner, with a way back in to review or change the answers.
export const InterestFormSubmittedStrip = ({ submittedAt, onReview }: InterestFormSubmittedStripProps) => {
    const date = new Date(submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    return (
        <div className="flex w-full items-center gap-3 rounded-2xl border border-success-100 bg-green-50 px-6 py-4 max-md:flex-wrap max-md:px-4">
            <CheckCircle className="size-6 shrink-0 text-success-600" />
            <p className="flex-1 text-base font-semibold text-success-900">
                Placement interest form submitted <span className="font-normal text-success-600">· {date}</span>
            </p>
            <button type="button" onClick={onReview} className="text-sm font-semibold text-success-900 underline-offset-2 hover:underline">
                Review or edit
            </button>
        </div>
    );
};
