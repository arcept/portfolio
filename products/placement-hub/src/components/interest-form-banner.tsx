import { ArrowNarrowRight } from "@untitledui/icons";
import bannerIllustration from "@/assets/interest-banner-illustration.png";

interface InterestFormBannerProps {
    onFillForm: () => void;
}

// Home's call-to-action for the Placement Interest Form — swapped for InterestFormSubmittedStrip
// once the form has been submitted.
export const InterestFormBanner = ({ onFillForm }: InterestFormBannerProps) => {
    return (
        <div className="flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-indigo-300 bg-linear-to-b from-indigo-800 to-indigo-600">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-6 py-10 pr-6 pl-12 max-md:gap-4 max-md:p-6 lg:max-xl:pl-8">
                <div className="flex w-full flex-col gap-2">
                    <p className="text-base font-semibold text-white">Exciting Job Opportunities Coming Soon!</p>
                    <p className="text-2xl leading-8 font-bold text-white max-md:text-xl max-md:leading-7">Fill out the form to mark your interest for the Placement Assistance Service</p>
                    <p className="text-sm text-gray-300 italic">
                        <span className="font-semibold">Disclaimer:</span> Please note that filling out this form does not guarantee a job.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onFillForm}
                    className="flex items-center justify-center gap-2 rounded-xs border border-purple-200 bg-white px-8 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-25"
                >
                    Fill Form
                    <ArrowNarrowRight className="size-4" />
                </button>
            </div>
            <div className="flex shrink-0 items-center justify-center py-2 pr-6 max-md:hidden lg:max-xl:hidden">
                <img src={bannerIllustration} alt="" className="h-[154px] w-[220px] shrink-0 object-cover" />
            </div>
        </div>
    );
};
