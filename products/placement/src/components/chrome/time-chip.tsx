// Appears in the chrome (never inside the product UI) on every `advance` step — a visible signal
// that time/state changed without the learner clicking anything real.
// products/placement/CLAUDE.md: e.g. "Day 3 · ops updated Retool".
export const TimeChip = ({ text }: { text: string }) => (
    <div
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rule-2)] bg-[var(--sheet)] px-3 py-1 text-xs text-[var(--ink-2)]"
        style={{ fontFamily: "var(--mono)" }}
    >
        <span className="size-1.5 rounded-full bg-[var(--amber-mark)]" />
        {text}
    </div>
);
