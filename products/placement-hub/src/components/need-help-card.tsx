import { ArrowNarrowRight } from "@untitledui/icons";
import needHelpIllustration from "@/assets/need-help-illustration.png";

export const NeedHelpCard = () => {
    return (
        <div className="flex w-full items-center overflow-hidden rounded-2xl bg-blue-dark-700 shadow-[var(--shadow-card-lg)]">
            <div className="flex flex-1 flex-col items-start gap-4 py-8 pr-2 pl-8">
                <div className="flex flex-col gap-0 text-white">
                    <p className="text-2xl font-semibold">Need Help?</p>
                    <p className="text-sm">Contact us for assistance</p>
                </div>
                <button type="button" className="flex items-center gap-2 rounded-xs border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-800">
                    Get in touch
                    <ArrowNarrowRight className="size-3.5" />
                </button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-hidden py-4">
                <img src={needHelpIllustration} alt="" className="w-full object-contain" />
            </div>
        </div>
    );
};
