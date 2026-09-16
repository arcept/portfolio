// Isolated embed render, selected via ?embed=<key> in main.tsx (not a route — see products/oms's
// main.tsx for why: this is embedded as a static file with no server-side rewrites available).
export type EmbedViewKey = "walkthrough" | "scenario-01" | "scenario-02" | "scenario-03" | "scenario-04";

export const EmbedView = ({ view }: { view: EmbedViewKey }) => {
    return (
        <div className="chrome flex min-h-screen items-center justify-center p-6 text-center" data-theme={view === "walkthrough" ? undefined : "light"}>
            <p className="font-mono text-xs text-[var(--ink-3)]">embed: {view} (scaffold placeholder)</p>
        </div>
    );
};
