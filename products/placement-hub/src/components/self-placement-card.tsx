import { ArrowNarrowRight } from "@untitledui/icons";
import selfPlacementBg from "@/assets/self-placement-bg.png";

export const SelfPlacementCard = () => {
    return (
        <div className="relative flex w-full flex-col items-start justify-end overflow-hidden rounded-[20px] pt-40 shadow-[var(--shadow-card-lg)]">
            <div aria-hidden className="absolute inset-0">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 overflow-hidden">
                    <img src={selfPlacementBg} alt="" className="absolute top-[-8.84%] left-[-7.58%] h-[92.93%] w-[115.16%] max-w-none" />
                </div>
            </div>
            <div className="relative flex w-full flex-col gap-2 bg-white/96 px-10 pt-6 pb-10 backdrop-blur-[26px] max-md:px-5 max-md:pb-6">
                <p className="text-base text-gray-800">Your success is our celebration</p>
                <p className="text-2xl font-semibold text-orange-dark-500">
                    Got placed with your
                    <br />
                    own hard work?
                </p>
                <p className="text-base text-gray-800">Let's make your achievements known on our portal. Your story inspires others as well.</p>
                <button type="button" className="mt-1 flex w-max items-center gap-2 text-sm font-semibold text-gray-cool-900">
                    Share your triumphs with us
                    <ArrowNarrowRight className="size-4" />
                </button>
            </div>
        </div>
    );
};
