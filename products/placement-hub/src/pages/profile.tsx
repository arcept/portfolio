import { ChevronLeft } from "@untitledui/icons";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ProfileAboutCard } from "@/components/profile-about-card";
import { ProfileAwardsCard } from "@/components/profile-awards-card";
import { ProfileCertificationsCard } from "@/components/profile-certifications-card";
import { ProfileEducationCard } from "@/components/profile-education-card";
import { ProfileExperienceCard } from "@/components/profile-experience-card";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileImportantLinksCard } from "@/components/profile-important-links-card";
import { ProfileInterestsCard } from "@/components/profile-interests-card";
import { ProfilePublicationsCard } from "@/components/profile-publications-card";
import { ProfileRecommendationsCard } from "@/components/profile-recommendations-card";
import { ProfileSkillsCard } from "@/components/profile-skills-card";
import { PROFILE_TABS, ProfileTabs } from "@/components/profile-tabs";
import { TopBar } from "@/components/top-bar";
import { useProfileComplete } from "@/data/profile-store";

interface ProfileProps {
    onBack: () => void;
    onNavigateJob?: (jobId: string) => void;
}

// Same fade-and-stack entrance used on the JD page — each block rises in slightly after the one
// before it instead of the whole page popping in at once.
const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

// My Profile — header + scroll-spy tabs over one continuous page (Personal, Professional Skills,
// Work Experience, Education, Publications, Certifications) plus a sidebar (Important Links,
// Recommendations, Interests). The incomplete/complete variants are identical except for
// ProfileImportantLinksCard, which is the only thing keyed off profileStore's flag.
export const Profile = ({ onBack, onNavigateJob }: ProfileProps) => {
    const profileComplete = useProfileComplete();
    const [activeTab, setActiveTab] = useState(PROFILE_TABS[0].id);
    const isClickScrolling = useRef(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Highlights whichever section's heading has crossed just below the sticky header+tabs bar —
    // suppressed while a tab click is driving an in-flight smooth scroll so the two don't fight.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (isClickScrolling.current) return;
                const visible = entries.filter((entry) => entry.isIntersecting);
                if (visible.length > 0) {
                    setActiveTab(visible[0].target.id);
                }
            },
            { rootMargin: "-140px 0px -70% 0px", threshold: 0 },
        );

        PROFILE_TABS.forEach((tab) => {
            const el = document.getElementById(tab.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const handleSelectTab = (id: string) => {
        setActiveTab(id);
        isClickScrolling.current = true;
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.setTimeout(() => {
            isClickScrolling.current = false;
        }, 600);
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-start bg-gray-25">
            <div className="sticky top-0 z-20 flex w-full flex-col bg-gray-25 max-md:static">
                <TopBar onNavigateProfile={() => {}} onNavigateJob={onNavigateJob} />
                <div className="flex w-full items-center justify-center px-[120px] py-4 max-xl:px-8 max-md:px-4 max-md:py-2">
                    <div className="flex w-full max-w-[1400px] flex-1 items-center">
                        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg px-2 py-1 text-base font-semibold text-gray-cool-900 hover:bg-gray-50">
                            <ChevronLeft className="size-6" />
                            Back to Home Page
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-col items-center px-[120px] py-2 max-xl:px-8 max-md:px-4">
                <motion.div className="flex w-full max-w-[1400px] flex-col items-start gap-6 pb-20" variants={containerVariants} initial="hidden" animate="show">
                    <motion.div className="w-full" variants={cardVariants}>
                        <ProfileHeader />
                    </motion.div>

                    <div className="flex w-full items-start gap-6 max-lg:flex-col max-lg:items-stretch">
                        <div className="flex flex-1 flex-col items-start gap-4 max-[1439px]:min-w-0 max-lg:flex-none">
                            <ProfileTabs active={activeTab} onSelect={handleSelectTab} />
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileAboutCard />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileSkillsCard />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileExperienceCard />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileEducationCard />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfilePublicationsCard />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileCertificationsCard />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileAwardsCard />
                            </motion.div>
                        </div>

                        <div className="flex w-[440px] shrink-0 flex-col items-start gap-6 max-lg:w-full">
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileImportantLinksCard complete={profileComplete} />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileRecommendationsCard />
                            </motion.div>
                            <motion.div className="w-full" variants={cardVariants}>
                                <ProfileInterestsCard />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
