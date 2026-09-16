import type { ReactNode } from "react";
import { FaqCard } from "@/components/product/faq-card";
import type { NavTab } from "@/components/product/navbar";
import { Navbar } from "@/components/product/navbar";
import { NeedHelpCard } from "@/components/product/need-help-card";
import { SuccessSpotlightCard } from "@/components/product/success-spotlight-card";
import { Footer } from "@/components/product/footer";

interface PlacementHubLayoutProps {
    activeTab: NavTab;
    userName: string;
    navVariant?: "default" | "subdued" | "locked";
    jobsHasUpdate?: boolean;
    children: ReactNode;
}

// Shared page shell for every Placement Hub screen: Navbar, a 2-column body (main + a fixed
// sidebar of Success Spotlight / FAQ / Need Help), and the Footer. Product canvas is a fixed
// 1440 logical width (products/placement/CLAUDE.md), so no responsive breakpoints here.
export const PlacementHubLayout = ({ activeTab, userName, navVariant, jobsHasUpdate, children }: PlacementHubLayoutProps) => {
    return (
        <div className="flex min-h-full w-[1440px] flex-col bg-secondary">
            <Navbar active={activeTab} userName={userName} variant={navVariant} jobsHasUpdate={jobsHasUpdate} />
            <div className="flex flex-1 gap-6 px-8 py-6">
                <div className="flex flex-1 flex-col gap-6">{children}</div>
                <div className="flex w-[300px] shrink-0 flex-col gap-6">
                    <SuccessSpotlightCard />
                    <FaqCard />
                    <NeedHelpCard />
                </div>
            </div>
            <Footer />
        </div>
    );
};
