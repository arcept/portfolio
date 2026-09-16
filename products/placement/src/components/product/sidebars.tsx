import { FaqCard } from "@/components/product/faq-card";
import { NeedHelpCard } from "@/components/product/need-help-card";
import { SuccessSpotlightCard } from "@/components/product/success-spotlight-card";

// Home is the only screen with Success Spotlight in the sidebar (jobs-all.png, apps-list.png and
// the jd-* screens all drop it) — see docs/placement/spec/screens for the per-page composition.
export const HomeSidebar = () => (
    <>
        <SuccessSpotlightCard />
        <FaqCard />
        <NeedHelpCard />
    </>
);

export const DefaultSidebar = () => (
    <>
        <FaqCard />
        <NeedHelpCard />
    </>
);
