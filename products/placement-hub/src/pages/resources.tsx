import type { NavTab } from "@/components/navbar";
import { Navbar } from "@/components/navbar";

interface ResourcesProps {
    onNavigate?: (tab: NavTab) => void;
    onNavigateProfile: () => void;
    onNavigateJob?: (jobId: string) => void;
}

export const Resources = ({ onNavigate, onNavigateProfile, onNavigateJob }: ResourcesProps) => {
    return (
        <div className="flex min-h-screen w-full flex-col items-start bg-gray-25">
            <Navbar active="resources" onNavigate={onNavigate} onNavigateProfile={onNavigateProfile} onNavigateJob={onNavigateJob} />
            <div className="flex w-full flex-1 items-center justify-center py-32">
                <p className="text-lg text-gray-500">Resources is coming soon.</p>
            </div>
        </div>
    );
};
