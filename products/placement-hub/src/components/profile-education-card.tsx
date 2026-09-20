import { ProfileSectionCard } from "@/components/profile-section-card";
import { EDUCATION } from "@/data/profile";

export const ProfileEducationCard = () => {
    return (
        <ProfileSectionCard id="education" title="Education">
            <div className="flex w-full flex-col items-start">
                {EDUCATION.map((entry, index) => (
                    <div key={entry.school} className="flex w-full flex-col items-start gap-4 py-4">
                        <div className="flex w-full items-start gap-2 max-md:flex-col">
                            <div className="flex flex-1 flex-col items-start gap-0.5">
                                <p className="text-xl font-semibold text-gray-900">{entry.school}</p>
                                <p className="text-base text-gray-900">{entry.program}</p>
                            </div>
                            <div className="flex w-[200px] shrink-0 justify-end max-md:w-auto max-md:justify-start">
                                <p className="text-sm font-semibold text-gray-800">{entry.dateRange}</p>
                            </div>
                        </div>
                        {index < EDUCATION.length - 1 && <span className="h-px w-full bg-gray-200" />}
                    </div>
                ))}
            </div>
        </ProfileSectionCard>
    );
};
