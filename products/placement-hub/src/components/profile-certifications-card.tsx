import { ProfileSectionCard } from "@/components/profile-section-card";
import { CERTIFICATIONS } from "@/data/profile";

export const ProfileCertificationsCard = () => {
    return (
        <ProfileSectionCard id="certifications" title="Certifications">
            <div className="flex w-full flex-col items-start">
                {CERTIFICATIONS.map((cert, index) => (
                    <div key={cert.title} className="flex w-full flex-col items-start gap-3 py-4">
                        <div className="flex flex-col items-start gap-0.5">
                            <p className="text-lg font-semibold text-gray-900">{cert.title}</p>
                            <p className="text-base text-gray-900">{cert.issuer}</p>
                            <p className="text-base text-gray-500">{cert.issuedDate}</p>
                        </div>
                        {cert.thumbnails && (
                            <div className="flex items-start gap-8 max-[1439px]:flex-wrap max-md:gap-4">
                                {cert.thumbnails.map((src) => (
                                    <span key={src} className="h-32 w-[204px] max-w-full shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                        <img src={src} alt="" className="size-full object-cover" />
                                    </span>
                                ))}
                            </div>
                        )}
                        {index < CERTIFICATIONS.length - 1 && <span className="h-px w-full bg-gray-200" />}
                    </div>
                ))}
            </div>
        </ProfileSectionCard>
    );
};
