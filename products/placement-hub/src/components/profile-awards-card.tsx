import { ProfileSectionCard } from "@/components/profile-section-card";
import { AWARDS } from "@/data/profile";

// "Honours & Awards" trails Publications in the Figma handoff but isn't one of the six scroll-spy
// tabs — reproduced as a plain extra section with no tab entry of its own.
export const ProfileAwardsCard = () => {
    return (
        <ProfileSectionCard id="awards" title="Honours & Awards">
            <div className="flex w-full flex-col items-start">
                {AWARDS.map((award, index) => (
                    <div key={award.title} className="flex w-full flex-col items-start gap-2 py-4">
                        <div className="flex w-full items-start gap-2 max-md:flex-col">
                            <div className="flex flex-1 flex-col items-start gap-0.5">
                                <p className="text-xl font-semibold text-gray-900">{award.title}</p>
                                <p className="text-base text-gray-900">{award.issuer}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-gray-800">{award.date}</p>
                        </div>
                        {index < AWARDS.length - 1 && <span className="h-px w-full bg-gray-200" />}
                    </div>
                ))}
            </div>
        </ProfileSectionCard>
    );
};
