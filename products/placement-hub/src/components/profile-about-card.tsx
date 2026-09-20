import { useState } from "react";
import { PROFILE, SKILL_TAGS } from "@/data/profile";
import { cx } from "@/utils/cx";

// "Personal" tab content — renders bare (no card border/header), matching the Figma handoff,
// unlike every other section which uses ProfileSectionCard.
export const ProfileAboutCard = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div id="personal" className="flex w-full scroll-mt-[190px] max-md:scroll-mt-20 flex-col gap-6 rounded-lg bg-white px-4 py-6">
            <div className="flex flex-col items-start gap-2">
                <p className={cx("text-lg text-gray-900", !expanded && "line-clamp-2")}>{PROFILE.about.join(" ")}</p>
                <button type="button" onClick={() => setExpanded((v) => !v)} className="text-base font-semibold text-purple-800 hover:underline">
                    {expanded ? "Show Less" : "Read More"}
                </button>
            </div>

            <div className="flex w-full items-start gap-8 max-md:flex-col max-md:items-stretch max-md:gap-4">
                <div className="flex w-[600px] shrink-0 flex-col items-start gap-2 max-[1439px]:w-auto max-[1439px]:min-w-0 max-[1439px]:shrink max-[1439px]:flex-[2]">
                    <p className="text-lg text-gray-900">Softwares & Skills</p>
                    <div className="flex flex-wrap items-center gap-2">
                        {SKILL_TAGS.map((skill) => (
                            <span
                                key={skill.label}
                                className={cx("rounded-xl bg-gray-cool-100 px-3 py-1 text-lg font-semibold", skill.tone === "primary" ? "text-gray-cool-900" : "text-gray-cool-600")}
                            >
                                {skill.label}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-1 flex-col items-start gap-2 text-gray-900">
                    <p className="text-lg">Languages</p>
                    <p className="text-xl font-semibold">{PROFILE.languages}</p>
                </div>
            </div>
        </div>
    );
};
