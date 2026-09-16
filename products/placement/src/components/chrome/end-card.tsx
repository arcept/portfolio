interface EndCardProps {
    title: string;
    /** Short scenarios only — the branch not just played. */
    otherBranch?: { label: string; onPick: () => void };
    otherScenarios: Array<{ id: string; title: string; onPick: () => void }>;
    onRestart: () => void;
}

// End of a scenario (or a short scenario's branch) — offers the other branch (if any) and the
// other scenarios, per products/placement/CLAUDE.md acceptance: "end card offers the other
// branch and the other scenarios."
export const EndCard = ({ title, otherBranch, otherScenarios, onRestart }: EndCardProps) => (
    <div className="flex size-full flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-xs tracking-wide text-[var(--ink-3)] uppercase" style={{ fontFamily: "var(--mono)" }}>
            End of scenario
        </p>
        <h2 className="max-w-md text-2xl text-[var(--ink)]" style={{ fontFamily: "var(--serif)" }}>
            {title}
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
            <button
                type="button"
                onClick={onRestart}
                className="rounded-lg border border-[var(--rule-2)] bg-[var(--sheet)] px-4 py-2.5 text-sm font-medium text-[var(--ink)]"
                style={{ fontFamily: "var(--sans)" }}
            >
                Watch again
            </button>
            {otherBranch && (
                <button
                    type="button"
                    onClick={otherBranch.onPick}
                    className="rounded-lg border border-[var(--rule-2)] bg-[var(--sheet)] px-4 py-2.5 text-sm font-medium text-[var(--ink)]"
                    style={{ fontFamily: "var(--sans)" }}
                >
                    See the other branch: {otherBranch.label} →
                </button>
            )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs tracking-wide text-[var(--ink-3)] uppercase" style={{ fontFamily: "var(--mono)" }}>
                Other scenarios
            </p>
            <div className="flex flex-wrap justify-center gap-2">
                {otherScenarios.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={s.onPick}
                        className="rounded-full px-3.5 py-1.5 text-sm text-[var(--ink-2)] underline decoration-[var(--rule-2)] underline-offset-4 hover:text-[var(--ink)]"
                        style={{ fontFamily: "var(--sans)" }}
                    >
                        {s.title}
                    </button>
                ))}
            </div>
        </div>
    </div>
);
