import novatrLogo from "@/assets/novatr-logo.svg";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";

interface TopBarProps {
    onNavigateProfile: () => void;
    onNavigateJob?: (jobId: string) => void;
}

// The brand + user-menu row shared by the standard Navbar and the Job Description page's header
// (which swaps the tab row underneath for a "Back to Jobs" button instead).
export const TopBar = ({ onNavigateProfile, onNavigateJob }: TopBarProps) => {
    return (
        <div className="flex w-full items-center justify-center gap-2 border border-gray-100 bg-gray-25 px-[120px] py-4 max-xl:px-8 max-md:px-4 max-md:py-3">
            <div className="flex w-full max-w-[1400px] flex-1 items-center gap-5 max-md:gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 p-2 max-md:p-0">
                    <img src={novatrLogo} alt="Novatr" className="h-4 shrink-0" />
                    <span className="text-lg font-semibold text-blue-dark-200">/</span>
                    <span className="truncate text-lg font-semibold text-blue-dark-600 max-md:text-sm">Placement Hub</span>
                </div>
                <UserMenu onNavigateProfile={onNavigateProfile} />
                <NotificationBell onNavigateJob={onNavigateJob} />
            </div>
        </div>
    );
};
