import { ArrowNarrowRight, Edit03 } from "@untitledui/icons";
import successConfettiLottie from "@/assets/success-confetti.json";
import { LottiePlayer } from "@/components/lottie-player";
import { EMPLOYMENT_TYPES, NOTICE_FLEXIBILITY, NOTICE_PERIODS, REVIT_EXPERIENCE, TOTAL_EXPERIENCE, WORK_MODES } from "@/data/interest-form-options";
import type { InterestSubmission } from "@/lib/interest-form";
import { currentCityLabel, formatDate, formatIndian, formatLpa } from "@/lib/interest-form";

const labelOf = (options: { id: string; label: string }[], id: string) => options.find((o) => o.id === id)?.label ?? id;
const labelsOf = (options: { id: string; label: string }[], ids: string[]) => ids.map((id) => labelOf(options, id)).join(", ");

const summaryRows = ({ values: v, earliestJoining }: InterestSubmission): { label: string; value: string }[] => {
    const rows: { label: string; value: string }[] = [
        { label: "Looking for", value: v.targetRoles.join(", ") },
        { label: "Employment type", value: labelsOf(EMPLOYMENT_TYPES, v.employmentTypes) },
        { label: "Work mode", value: labelsOf(WORK_MODES, v.workModes) },
        { label: "Based in", value: [currentCityLabel(v), v.state, v.country].filter(Boolean).join(", ") },
    ];

    if (v.relocation === "yes") rows.push({ label: "Open to relocating", value: "Yes, anywhere" });
    if (v.relocation === "preferred") rows.push({ label: "Open to relocating", value: `Only to ${v.preferredLocations.join(", ")}` });
    if (v.relocation === "no") rows.push({ label: "Open to relocating", value: "No" });

    rows.push({ label: "Experience", value: `${labelOf(TOTAL_EXPERIENCE, v.totalExperience)} overall, ${labelOf(REVIT_EXPERIENCE, v.revitExperience).toLowerCase()} in Revit` });

    if (v.employed === "yes") rows.push({ label: "Currently at", value: `${v.currentDesignation}, ${v.currentCompany}` });
    if (v.noticeStatus === "serving") rows.push({ label: "Notice", value: `Serving notice, last working day ${formatDate(v.lastWorkingDay)}` });
    if (v.noticeStatus === "not_resigned") rows.push({ label: "Notice", value: `Not resigned yet, ${labelOf(NOTICE_PERIODS, v.noticePeriod).toLowerCase()}` });
    if (v.noticeFlexibility) rows.push({ label: "Notice can be shortened", value: labelOf(NOTICE_FLEXIBILITY, v.noticeFlexibility) });
    if (earliestJoining) rows.push({ label: "Earliest joining", value: formatDate(earliestJoining) });

    if (v.currentCtc) rows.push({ label: "Current CTC", value: `₹${formatIndian(v.currentCtc)} (${formatLpa(v.currentCtc)})` });
    rows.push({ label: "Expected CTC", value: `₹${formatIndian(v.expectedCtc)} (${formatLpa(v.expectedCtc)})` });
    return rows;
};

interface SubmittedCardProps {
    submission: InterestSubmission;
    onBackHome: () => void;
    onEdit: () => void;
}

// Shown in place of the form once it's been submitted — echoes the answers back so the learner can
// see what recruiters will see, and offers a way to change them.
export const SubmittedCard = ({ submission, onBackHome, onEdit }: SubmittedCardProps) => {
    return (
        <div className="flex w-full flex-col gap-8 rounded-xs bg-white px-8 py-10 max-md:px-4 max-md:py-6">
            <div className="flex w-full flex-col items-center gap-3 text-center">
                <LottiePlayer animationData={successConfettiLottie} loop={false} className="size-28" />
                <p className="text-2xl font-semibold text-gray-cool-900">Thanks, we've got your details</p>
                <p className="max-w-lg text-base text-gray-600">
                    Your answers now shape which roles we put in front of you. If your plans change, you can update them here any time.
                </p>
            </div>

            <dl className="flex w-full flex-col divide-y divide-gray-100 rounded-xs border border-gray-200">
                {summaryRows(submission).map((row) => (
                    <div key={row.label} className="flex items-start gap-6 px-5 py-3 max-md:flex-col max-md:gap-0.5 max-md:px-4">
                        <dt className="w-44 shrink-0 text-sm text-gray-500">{row.label}</dt>
                        <dd className="text-sm font-medium text-gray-900">{row.value}</dd>
                    </div>
                ))}
            </dl>

            <div className="flex w-full items-center justify-between gap-4 max-md:flex-col-reverse max-md:items-stretch">
                <button type="button" onClick={onEdit} className="flex items-center justify-center gap-2 rounded-xs border border-purple-200 bg-white px-6 py-3 text-base font-semibold text-purple-800 hover:bg-purple-25">
                    <Edit03 className="size-4" />
                    Edit responses
                </button>
                <button type="button" onClick={onBackHome} className="flex items-center justify-center gap-2 rounded-xs bg-purple-800 px-8 py-3 text-base font-semibold text-white hover:bg-purple-700">
                    Back to Home
                    <ArrowNarrowRight className="size-4" />
                </button>
            </div>
        </div>
    );
};
