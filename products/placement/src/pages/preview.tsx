import { useParams } from "react-router";
import { HomeJobsNotApplied } from "@/screens/home";
import { HubEligibleComplete } from "@/screens/hub-eligible-complete";

// Dev-only screen-by-slug preview, used for fidelity screenshots against docs/placement/spec/screens/
// during the build (products/placement/CLAUDE.md's "Fidelity loop"). Not part of the shipped
// walkthrough/embed experience.
const SCREENS: Record<string, React.ComponentType> = {
    "hub-eligible-complete": HubEligibleComplete,
    "home-jobs-not-applied": HomeJobsNotApplied,
};

export const Preview = () => {
    const { slug } = useParams<{ slug: string }>();
    const Screen = slug ? SCREENS[slug] : undefined;

    if (!Screen) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary p-8 text-sm text-tertiary">
                Unknown preview slug. Available: {Object.keys(SCREENS).join(", ")}
            </div>
        );
    }

    return <Screen />;
};
