interface ForkCardProps {
    title: string;
    proves: string[];
    branches: Array<{ label: string }>;
    onPick: (index: number) => void;
}

// Short scenarios open on a fork card — the viewer picks a branch before anything plays.
export const ForkCard = ({ title, proves, branches, onPick }: ForkCardProps) => (
    <div className="flex size-full flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-xs tracking-wide text-[var(--ink-3)] uppercase" style={{ fontFamily: "var(--mono)" }}>
            Short scenario
        </p>
        <h2 className="max-w-md text-2xl text-[var(--ink)]" style={{ fontFamily: "var(--serif)" }}>
            {title}
        </h2>
        <ul className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
            {proves.map((p) => (
                <li key={p}>{p}</li>
            ))}
        </ul>
        <div className="mt-2 flex gap-3">
            {branches.map((branch, i) => (
                <button
                    key={branch.label}
                    type="button"
                    onClick={() => onPick(i)}
                    className="rounded-lg border border-[var(--rule-2)] bg-[var(--sheet)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] hover:border-[var(--ink-3)]"
                    style={{ fontFamily: "var(--sans)" }}
                >
                    {branch.label}
                </button>
            ))}
        </div>
    </div>
);
