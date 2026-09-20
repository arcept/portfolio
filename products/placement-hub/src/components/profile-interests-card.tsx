import { HeartSquare } from "@untitledui/icons";
import { INTERESTS } from "@/data/profile";

export const ProfileInterestsCard = () => {
    return (
        <div className="flex w-full flex-col items-start overflow-hidden rounded-2xl border border-gray-cool-200 bg-white">
            <div className="flex w-full items-center gap-2 border-b border-gray-cool-200 bg-gray-cool-50 px-6 py-5">
                <HeartSquare className="size-6 text-gray-900" />
                <p className="text-xl font-semibold text-gray-900">Interests</p>
            </div>
            <div className="flex w-full flex-wrap items-center justify-center gap-2 px-6 py-5">
                {INTERESTS.map((interest, index) => (
                    <div key={interest} className="flex items-center gap-2">
                        {index > 0 && <span className="size-1 rounded-full bg-gray-cool-200" />}
                        <p className="text-base text-gray-900 whitespace-nowrap">{interest}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
