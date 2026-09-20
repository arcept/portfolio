import { ArrowNarrowUpRight, MinusCircle } from "@untitledui/icons";

interface CompleteProfileNudgeProps {
    onNavigateProfile: () => void;
}

// Shown on Home instead of EligibilityBanner's plain "Eligible" state once the learner has
// qualified but hasn't finished their profile yet — the Resume/Portfolio gap is what the two
// My Profile variants differ on, so this card is what routes a learner there to close it.
export const CompleteProfileNudge = ({ onNavigateProfile }: CompleteProfileNudgeProps) => {
    return (
        <div className="flex w-full flex-col items-start overflow-hidden rounded-2xl border-2 border-blue-dark-500 bg-blue-dark-800">
            <div className="flex w-full flex-col items-start gap-6 bg-white px-10 py-8 max-md:px-5 max-md:py-6">
                <div className="flex w-full items-center gap-2 max-md:flex-col max-md:items-start max-md:gap-3">
                    <div className="flex flex-1 flex-col items-center justify-center">
                        <p className="w-full text-2xl leading-8 font-semibold text-gray-cool-900 max-md:text-xl max-md:leading-7">Complete Your Profile Now!</p>
                        <p className="w-full text-base font-medium text-gray-600">
                            You have successfully met the eligibility criteria. Now complete your profile to start applying and maximise your opportunities.
                        </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-3xl bg-blue-dark-700 px-4 py-1 text-base font-semibold whitespace-nowrap text-white">
                        <MinusCircle className="size-5" />
                        Profile Incomplete
                    </span>
                </div>

                <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full items-center gap-4">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-500 text-white">
                            <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 3 4.5 8.5 2 6" />
                            </svg>
                        </span>
                        <p className="w-60 text-base text-gray-700 max-md:w-auto max-md:shrink-0">Personal & Professional Details</p>
                        <span className="h-px flex-1 border-t border-dashed border-gray-200" />
                    </div>
                    <div className="flex w-full items-center gap-4">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-warning-400 text-sm font-semibold text-white">!</span>
                        <p className="w-60 text-base text-gray-700 max-md:w-auto max-md:shrink-0">Resume Submission</p>
                        <span className="h-px flex-1 border-t border-dashed border-gray-200" />
                    </div>
                    <div className="flex w-full items-center gap-4">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-warning-400 text-sm font-semibold text-white">!</span>
                        <p className="w-60 text-base text-gray-700 max-md:w-auto max-md:shrink-0">Portfolio Upload</p>
                        <span className="h-px flex-1 border-t border-dashed border-gray-200" />
                    </div>
                </div>
            </div>

            <button type="button" onClick={onNavigateProfile} className="flex w-full items-center gap-[72px] px-10 py-4 text-left hover:bg-blue-dark-700 max-md:gap-3 max-md:px-5">
                <span className="flex-1 text-base font-semibold text-white">Enhance your chances by completing your profile</span>
                <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-white">
                    My Profile
                    <ArrowNarrowUpRight className="size-4" />
                </span>
            </button>
        </div>
    );
};
