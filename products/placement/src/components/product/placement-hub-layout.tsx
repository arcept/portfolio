import type { ReactNode } from "react";
import type { NavTab } from "@/components/product/navbar";
import { Navbar } from "@/components/product/navbar";
import { Footer } from "@/components/product/footer";

interface PlacementHubLayoutProps {
    activeTab: NavTab;
    userName: string;
    navVariant?: "default" | "subdued" | "locked";
    jobsHasUpdate?: boolean;
    breadcrumbColor?: "blue" | "dark";
    sidebar: ReactNode;
    children: ReactNode;
}

// Shared page shell for every Placement Hub screen: Navbar, a 2-column body (main + a sidebar that
// varies per screen — Home gets Success Spotlight + FAQ + Need Help, Jobs/JD/My Applications drop
// Success Spotlight, and JD screens with an active application swap in the Steps tracker), and the
// Footer. Product canvas is a fixed 1440 logical width (products/placement/CLAUDE.md), so no
// responsive breakpoints here.
export const PlacementHubLayout = ({ activeTab, userName, navVariant, jobsHasUpdate, breadcrumbColor, sidebar, children }: PlacementHubLayoutProps) => {
    return (
        <div className="flex min-h-full w-[1440px] flex-col bg-secondary">
            <Navbar active={activeTab} userName={userName} variant={navVariant} jobsHasUpdate={jobsHasUpdate} breadcrumbColor={breadcrumbColor} />
            <div className="flex flex-1 gap-6 px-8 py-6">
                <div className="flex flex-1 flex-col gap-6">{children}</div>
                <div className="flex w-[300px] shrink-0 flex-col gap-6">{sidebar}</div>
            </div>
            <Footer />
        </div>
    );
};
