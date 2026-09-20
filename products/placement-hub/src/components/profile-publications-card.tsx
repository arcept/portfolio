import { ArrowNarrowUpRight } from "@untitledui/icons";
import { ProfileSectionCard } from "@/components/profile-section-card";
import { PUBLICATIONS } from "@/data/profile";

export const ProfilePublicationsCard = () => {
    return (
        <ProfileSectionCard id="publications" title="Publications">
            <div className="flex w-full flex-col items-start">
                {PUBLICATIONS.map((pub, index) => (
                    <div key={pub.title} className="flex w-full flex-col items-start gap-2 py-4">
                        <div className="flex w-full items-start gap-16 max-md:flex-col max-md:gap-1">
                            <div className="flex flex-1 flex-col items-start gap-0.5">
                                <p className="text-xl font-semibold text-gray-900">{pub.title}</p>
                                <p className="text-base text-gray-900">{pub.source}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-gray-800">{pub.date}</p>
                        </div>
                        {pub.linkLabel && (
                            <a href="#" className="flex items-center gap-2 text-base font-semibold text-blue-600 hover:underline">
                                {pub.linkLabel}
                                <ArrowNarrowUpRight className="size-4" />
                            </a>
                        )}
                        {index < PUBLICATIONS.length - 1 && <span className="h-px w-full bg-gray-200" />}
                    </div>
                ))}
            </div>
        </ProfileSectionCard>
    );
};
