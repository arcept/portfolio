interface DesignerNotesProps {
    note?: string;
    visible: boolean;
    onToggle: () => void;
}

// Off by default, persists across steps (see use-walkthrough.ts's localStorage read/write),
// renders nothing for empty notes. Keyboard: N toggles (wired in walkthrough.tsx).
export const DesignerNotes = ({ note, visible, onToggle }: DesignerNotesProps) => {
    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={onToggle}
                className="w-max text-xs tracking-wide text-[var(--ink-3)] uppercase underline decoration-[var(--rule-2)] underline-offset-4 hover:text-[var(--ink)]"
                style={{ fontFamily: "var(--sans)" }}
            >
                Designer's notes (N)
            </button>
            {visible && note && (
                <p className="max-w-md text-sm text-[var(--ink-2)] italic" style={{ fontFamily: "var(--serif)" }}>
                    {note}
                </p>
            )}
        </div>
    );
};
