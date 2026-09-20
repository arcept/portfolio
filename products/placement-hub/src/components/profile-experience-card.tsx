import { useState } from "react";
import { ProfileSectionCard } from "@/components/profile-section-card";
import { WORK_EXPERIENCE } from "@/data/profile";
import { cx } from "@/utils/cx";

const ExperienceDescription = ({ lines }: { lines: string[] }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="flex w-full flex-col items-start gap-1 text-base text-gray-500">
            <p className={cx(!expanded && "line-clamp-3")}>
                {lines.map((line, i) => (
                    <span key={i}>
                        -{line}
                        {i < lines.length - 1 && <br />}
                    </span>
                ))}
            </p>
            <button type="button" onClick={() => setExpanded((v) => !v)} className="text-base font-semibold text-purple-800 hover:underline">
                {expanded ? "Show Less" : "Read More"}
            </button>
        </div>
    );
};

export const ProfileExperienceCard = () => {
    return (
        <ProfileSectionCard id="work-experience" title="Work Experience">
            <div className="flex w-full flex-col items-start">
                {WORK_EXPERIENCE.map((entry, index) => (
                    <div key={`${entry.role}-${entry.org}`} className="flex w-full flex-col items-start gap-4 py-6">
                        <div className="flex w-full items-start gap-2 max-md:flex-col">
                            <div className="flex flex-1 flex-col items-start gap-0.5">
                                <p className="text-xl font-semibold text-gray-900">{entry.role}</p>
                                <div className="flex flex-wrap items-center gap-x-2 text-lg text-gray-900">
                                    <p>{entry.org}</p>
                                    <span className="size-1 rounded-full bg-gray-cool-200" />
                                    <p>{entry.type}</p>
                                </div>
                            </div>
                            <div className="flex w-[200px] shrink-0 flex-col items-end gap-1 text-right max-md:w-auto max-md:items-start max-md:text-left">
                                <p className="text-sm font-semibold text-gray-800">{entry.dateRange}</p>
                                <p className="text-sm font-medium text-gray-700">{entry.duration}</p>
                            </div>
                        </div>
                        {entry.description &&
                            (entry.truncated ? <ExperienceDescription lines={entry.description} /> : (
                                <p className="w-full text-base text-gray-500">
                                    {entry.description.map((line, i) => (
                                        <span key={i}>
                                            -{line}
                                            {i < entry.description!.length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            ))}
                        {index < WORK_EXPERIENCE.length - 1 && <span className="h-px w-full bg-gray-200" />}
                    </div>
                ))}
            </div>
        </ProfileSectionCard>
    );
};
