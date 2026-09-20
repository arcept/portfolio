import { ProfileSectionCard } from "@/components/profile-section-card";
import { PROFESSIONAL_SKILLS } from "@/data/profile";

export const ProfileSkillsCard = () => {
    return (
        <ProfileSectionCard id="professional-skills" title="Top professional skills" subtitle="Validated and evaluated by our mentors.">
            <div className="grid w-full grid-cols-3 gap-x-16 gap-y-2 max-[1439px]:gap-x-6 max-md:grid-cols-1">
                {PROFESSIONAL_SKILLS.map((skill) => (
                    <div key={skill.label} className="flex flex-col items-start gap-0.5 py-2">
                        <p className="w-40 max-w-full text-lg font-semibold text-gray-900">{skill.label}</p>
                        <div className="flex w-full items-center gap-4">
                            <div className="h-2 flex-1 rounded-sm bg-gray-cool-200">
                                <div className="h-2 rounded-sm bg-green-400" style={{ width: `${skill.percent}%` }} />
                            </div>
                            <p className="shrink-0 text-base font-medium text-gray-900">{skill.percent}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </ProfileSectionCard>
    );
};
