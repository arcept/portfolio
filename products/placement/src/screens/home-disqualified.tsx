import { SimpleStatusCard } from "@/components/product/simple-status-card";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";

// home-disqualified — Exit ladder scenario, "disqualified" branch, final step (second
// disqualification = full lockout). Reference: docs/placement/spec/screens/home-disqualified.png
export const HomeDisqualified = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" navVariant="locked" sidebar={<DefaultSidebar />}>
            <SimpleStatusCard
                icon="🛑"
                heading="You have been disqualified. Placement Hub is no longer accessible to you."
                headingClassName="text-warning-primary"
                body="We regret to inform you that your account has been disqualified due to unresponsiveness. We've made multiple attempts to connect regarding your application status without success."
                footer={{ title: "Get in touch", body: "If you have any inquiries or wish to appeal this decision, please contact our support team within [specified timeframe]. Thank you for your understanding" }}
            />
        </PlacementHubLayout>
    );
};
