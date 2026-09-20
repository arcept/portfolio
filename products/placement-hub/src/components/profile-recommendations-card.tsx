import { Stars01 } from "@untitledui/icons";
import { useState } from "react";
import { RECOMMENDATIONS } from "@/data/profile";
import { cx } from "@/utils/cx";

const RecommendationEntry = ({ recommendation }: { recommendation: (typeof RECOMMENDATIONS)[number] }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="flex w-full flex-col items-start gap-3">
            <div className="flex w-full items-center gap-3">
                <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-blue-100">
                    <img src={recommendation.avatarSrc} alt="" className="size-full object-cover" />
                </span>
                <div className="flex flex-1 flex-col items-start">
                    <p className="text-lg font-semibold text-gray-900">{recommendation.name}</p>
                    <p className="text-sm font-medium text-gray-500">{recommendation.title}</p>
                </div>
            </div>
            <div className="flex flex-col items-start gap-1 px-1">
                <p className={cx("text-base text-gray-900", !expanded && "line-clamp-3")}>{recommendation.quote}</p>
                <button type="button" onClick={() => setExpanded((v) => !v)} className="text-base font-semibold text-purple-800 hover:underline">
                    {expanded ? "Show Less" : "Read More"}
                </button>
                <p className="text-sm font-medium text-gray-500">{recommendation.date}</p>
            </div>
        </div>
    );
};

export const ProfileRecommendationsCard = () => {
    return (
        <div className="flex w-full max-w-[800px] flex-col items-start overflow-hidden rounded-2xl border border-gray-cool-200 bg-white">
            <div className="flex w-full items-center gap-2 border-b border-gray-cool-200 bg-gray-cool-50 px-6 py-5">
                <Stars01 className="size-6 text-gray-900" />
                <p className="text-xl font-semibold text-gray-900">Recommendations ({RECOMMENDATIONS.length})</p>
            </div>
            <div className="flex w-full flex-col items-end gap-4 px-6 py-5">
                {RECOMMENDATIONS.map((recommendation, index) => (
                    <div key={recommendation.name} className="flex w-full flex-col items-start gap-3 py-1">
                        <RecommendationEntry recommendation={recommendation} />
                        {index < RECOMMENDATIONS.length - 1 && <span className="mt-2 h-px w-full bg-gray-200" />}
                    </div>
                ))}
            </div>
        </div>
    );
};
