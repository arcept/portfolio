import { CheckVerified02, Share07, Stars01 } from "@untitledui/icons";
import avatarManik from "@/assets/avatar-manik.png";
import handsClapping from "@/assets/hands-clapping.svg";
import { PROFILE } from "@/data/profile";

// The avatar/name/stats block at the top of My Profile — identical in both the incomplete and
// complete states (only the sidebar's Important Links card differs between them).
export const ProfileHeader = () => {
    return (
        <div className="flex w-full items-center gap-8 px-4 max-lg:flex-col max-lg:items-start max-lg:gap-4 max-md:px-0">
            <div className="flex flex-1 items-center gap-8 max-md:w-full max-md:flex-col max-md:items-start max-md:gap-4">
                <div className="flex shrink-0 flex-col items-center justify-center max-md:self-start">
                    <span className="mb-[-20px] size-40 max-md:size-28 overflow-hidden rounded-[32px] border-4 border-white shadow-[var(--shadow-card)]">
                        <img src={avatarManik} alt="" className="size-full object-cover" />
                    </span>
                    <span className="rounded-full bg-gradient-to-br from-[#f49062] to-[#fd371f] px-3 py-2 text-sm font-semibold whitespace-nowrap text-white">Top Performer</span>
                </div>

                <div className="flex flex-1 flex-col items-start justify-center gap-2">
                    <div className="flex items-center gap-2">
                        <p className="text-[32px] leading-10 font-semibold tracking-[-0.64px] text-gray-900 max-md:text-2xl max-md:leading-8">{PROFILE.name}</p>
                        <CheckVerified02 className="size-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col items-start text-xl font-medium text-gray-800 max-md:text-lg">
                        <p>{PROFILE.headline}</p>
                        <p>{PROFILE.experienceSummary}</p>
                        <p>{PROFILE.location}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                        <span className="flex items-center gap-1 text-base font-semibold text-success-900">
                            <img src={handsClapping} alt="" className="size-6" />
                            {PROFILE.applauds} Applauds
                        </span>
                        <span className="flex items-center gap-1 text-base font-semibold text-success-900">
                            <Stars01 className="size-6" />
                            {PROFILE.recommendationCount} Recommendations
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 max-md:w-full">
                <button type="button" className="flex items-center gap-2 max-md:flex-1 max-md:justify-center max-md:px-4 rounded-full border border-purple-200 bg-white px-6 py-3 text-base font-semibold text-purple-800 hover:bg-purple-25">
                    <Share07 className="size-4" />
                    Share Profile
                </button>
                <button type="button" className="flex items-center gap-2 max-md:flex-1 max-md:justify-center max-md:px-4 rounded-full bg-blue-dark-800 px-6 py-3 text-base font-semibold text-white hover:bg-blue-dark-700">
                    Edit Profile
                </button>
            </div>
        </div>
    );
};
