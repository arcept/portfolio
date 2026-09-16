import { ArrowLeft, ArrowRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface StepControlsProps {
    stepIndex: number;
    totalSteps: number;
    actionLabel: string;
    onBack: () => void;
    onNext: () => void;
    isEnd: boolean;
}

// Step counter "07 / 17" in mono, Back/Next controls. This is the walkthrough's ONE real advance
// mechanism — the mocked buttons inside the product screens (e.g. "Apply Now") are non-functional
// replicas matching the reference screenshots, not wired to state. Deliberately never echoes
// `actionLabel` verbatim as the button's own text: several reference screens already show that
// exact label on a product button (e.g. "Go to Placement Hub" appears both on the mocked page and
// would collide here), which reads as two buttons doing the same thing when only one works.
// Keyboard ←/→ wired at the walkthrough page level (products/placement/CLAUDE.md acceptance).
export const StepControls = ({ stepIndex, totalSteps, actionLabel, onBack, onNext, isEnd }: StepControlsProps) => {
    return (
        <div className="flex items-center justify-between border-t border-[var(--rule)] pt-3">
            <button
                type="button"
                onClick={onBack}
                disabled={stepIndex === 0}
                className="flex items-center gap-1.5 text-sm text-[var(--ink-2)] disabled:opacity-30"
                style={{ fontFamily: "var(--sans)" }}
            >
                <ArrowLeft className="size-4" />
                Back
            </button>

            <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--ink-3)] italic" style={{ fontFamily: "var(--serif)" }}>
                    In the product: “{actionLabel}”
                </span>
                <span className="text-xs tabular-nums" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>
                    {String(stepIndex + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
                </span>
            </div>

            <button
                type="button"
                onClick={onNext}
                disabled={isEnd}
                className={cx(
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-[var(--sheet)] transition-opacity",
                    isEnd ? "opacity-30" : "hover:opacity-90",
                )}
                style={{ fontFamily: "var(--sans)", backgroundColor: "var(--ink)" }}
            >
                Next
                <ArrowRight className="size-4" />
            </button>
        </div>
    );
};
