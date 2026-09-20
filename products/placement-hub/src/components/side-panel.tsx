import { XCircle } from "@untitledui/icons";
import medalHurryNextTime from "@/assets/medal-hurry-next-time.png";
import medalProfileMismatch from "@/assets/medal-profile-mismatch.png";
import { getMismatchedFields } from "@/lib/cta-state";
import { LEARNER } from "@/data/learner";
import type { Job } from "@/types/job";

const ExpiredPanel = () => (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-gray-200 py-8">
        <p className="px-8 max-md:px-5 text-lg font-semibold text-gray-cool-800">Oops! We don't want you to miss out.</p>
        <div className="flex w-full items-center gap-4 bg-blue-dark-50 px-8 max-md:px-5 py-4">
            <img src={medalHurryNextTime} alt="" className="h-12 w-auto shrink-0" />
            <p className="flex-1 text-sm font-medium text-gray-800">You were a good fit for this job. Hurry next time!</p>
        </div>
    </div>
);

// Single mismatch reads as one sentence (matches Figma's "irrelevant" variant); two or more get
// broken out into an itemized list with x-icons (Figma's "Variant3") since a single line
// summarizing several distinct gaps stops being readable.
const IrrelevantPanel = ({ job }: { job: Job }) => {
    const mismatches = getMismatchedFields(job, LEARNER);

    if (mismatches.length <= 1) {
        const mismatch = mismatches[0];
        return (
            <div className="flex w-full flex-col gap-6 rounded-2xl border border-gray-200 py-8">
                <p className="px-8 max-md:px-5 text-lg font-semibold text-error-600">Your Profile does not match this job</p>
                <div className="flex w-full items-center gap-4 bg-error-50 px-8 max-md:px-5 py-4">
                    <img src={medalProfileMismatch} alt="" className="h-12 w-auto shrink-0" />
                    <p className="flex-1 text-sm font-medium text-gray-800">{mismatch ? mismatch.actual : "Your profile doesn't match this job's requirements."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6 rounded-2xl border border-gray-200 py-8">
            <p className="px-8 max-md:px-5 text-lg font-semibold text-error-600">Your Profile does not match this job</p>
            <div className="flex w-full flex-col gap-4 bg-error-50 px-8 max-md:px-5 py-4">
                <div className="flex items-center gap-4">
                    <img src={medalProfileMismatch} alt="" className="h-12 w-auto shrink-0" />
                    <p className="flex-1 text-sm font-medium text-gray-800">There was a mismatch between the recruiter's requirements and your profile:</p>
                </div>
                {mismatches.map((field) => (
                    <div key={field.label} className="flex items-start gap-2">
                        <XCircle className="mt-0.5 size-4 shrink-0 text-error-600" />
                        <div className="flex flex-col text-sm">
                            <p className="font-semibold text-gray-800">{field.required}</p>
                            <p className="text-gray-500">{field.actual}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface SidePanelProps {
    job: Job;
    variant: "expired" | "irrelevant";
}

export const SidePanel = ({ job, variant }: SidePanelProps) => {
    return variant === "expired" ? <ExpiredPanel /> : <IrrelevantPanel job={job} />;
};
