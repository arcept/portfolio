import { Check } from "@untitledui/icons";

export const EligibilityBanner = () => {
    return (
        <div className="flex w-full items-start justify-between rounded-2xl bg-success-500 px-10 py-8 shadow-[var(--shadow-banner)] max-md:flex-col max-md:gap-4 max-md:px-5 max-md:py-6">
            <div className="flex flex-col gap-2">
                <p className="text-[28px] leading-9 font-semibold text-white max-md:text-xl max-md:leading-7">Congratulations You're in! You qualify for personalised placement support ☺️</p>
                <p className="text-lg font-medium text-success-100 max-md:text-base">You have successfully met the eligibility criteria.</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-3xl bg-success-100 px-4 py-1 text-base font-semibold text-success-600">
                <Check className="size-6" />
                Eligible
            </span>
        </div>
    );
};
