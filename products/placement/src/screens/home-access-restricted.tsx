import { SimpleStatusCard } from "@/components/product/simple-status-card";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";

// home-access-restricted — Exit ladder scenario, "declined invalid" branch, final step. Immediate
// and total lockout. Reference: docs/placement/spec/screens/home-access-restricted.png
export const HomeAccessRestricted = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" navVariant="locked" sidebar={<DefaultSidebar />}>
            <SimpleStatusCard
                icon="🛑"
                heading="Access Restricted"
                headingClassName="text-warning-primary"
                body="We apologize for any inconvenience. Your access to the platform has been restricted as a result of declining a job offer."
                footer={{ title: "Get in touch", body: "If you have any inquiries or wish to appeal this decision, please contact our support team within [specified timeframe]. Thank you for your understanding" }}
            />
        </PlacementHubLayout>
    );
};
