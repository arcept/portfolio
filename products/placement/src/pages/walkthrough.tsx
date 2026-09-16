import { useEffect } from "react";
import { ChapterRail } from "@/components/chrome/chapter-rail";
import { DesignerNotes } from "@/components/chrome/designer-notes";
import { DeviceFrame } from "@/components/chrome/device-frame";
import { EndCard } from "@/components/chrome/end-card";
import { ForkCard } from "@/components/chrome/fork-card";
import { ScenarioPicker } from "@/components/chrome/scenario-picker";
import { StepControls } from "@/components/chrome/step-controls";
import { TimeChip } from "@/components/chrome/time-chip";
import { resolvePageScreen, resolvePopup } from "@/scenarios/resolve-screen";
import { useWalkthrough } from "@/scenarios/use-walkthrough";

// The full walkthrough: chrome (chapter rail / time chip / notes / step controls) around the
// DeviceFrame, driven entirely by useWalkthrough's state machine. products/placement/CLAUDE.md
// build order: "scenarios → chrome → ... → motion polish" — this is that wiring step.
export const Walkthrough = () => {
    const wt = useWalkthrough();

    // Keyboard: ←/→ step, N toggles notes, Esc exits to picker (acceptance.md).
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
            if (e.key === "ArrowRight") wt.goNext();
            else if (e.key === "ArrowLeft") wt.goBack();
            else if (e.key.toLowerCase() === "n") wt.toggleNotes();
            else if (e.key === "Escape") wt.exitToPicker();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wt.goNext, wt.goBack, wt.toggleNotes, wt.exitToPicker]);

    if (!wt.scenario) {
        return (
            <div className="chrome flex min-h-screen flex-col" style={{ background: "var(--ground)" }}>
                <ScenarioPicker onPick={wt.selectScenario} />
            </div>
        );
    }

    if (wt.atFork && wt.branches) {
        return (
            <div className="chrome flex min-h-screen flex-col" style={{ background: "var(--ground)" }}>
                <ForkCard title={wt.scenario.title} proves={wt.scenario.proves} branches={wt.branches} onPick={wt.selectBranch} />
            </div>
        );
    }

    if (!wt.view) return null;

    const { step, stepIndex, totalSteps, state, pageSlug, popupSlug, isEnd } = wt.view;
    const pageScreen = resolvePageScreen(pageSlug, state);
    const popupScreen = popupSlug ? resolvePopup(popupSlug, state) : null;

    const otherScenarios = wt.scenarioOrder.filter((id) => id !== wt.scenarioId).map((id) => ({ id, title: wt.allScenarios[id].title, onPick: () => wt.selectScenario(id) }));

    // For a short scenario's branch end, offer the other branch too.
    const otherBranch =
        wt.branches && wt.branches.length === 2
            ? (() => {
                  const currentLabel = wt.branches!.find((b) => b.steps.includes(step))?.label;
                  const other = wt.branches!.find((b) => b.label !== currentLabel);
                  const otherIndex = other ? wt.branches!.indexOf(other) : -1;
                  return other && otherIndex >= 0 ? { label: other.label, onPick: () => wt.selectBranch(otherIndex) } : undefined;
              })()
            : undefined;

    return (
        <div className="chrome flex min-h-screen flex-col gap-4 p-6" style={{ background: "var(--ground)" }}>
            <div className="flex items-center justify-between">
                <button type="button" onClick={wt.exitToPicker} className="text-xs tracking-wide text-[var(--ink-3)] uppercase hover:text-[var(--ink)]" style={{ fontFamily: "var(--mono)" }}>
                    ← Scenarios
                </button>
                <h1 className="text-sm text-[var(--ink-2)]" style={{ fontFamily: "var(--serif)" }}>
                    {wt.scenario.title}
                </h1>
                <div />
            </div>

            {wt.chapters && <ChapterRail chapters={wt.chapters} currentChapter={step.chapter} onJump={wt.jumpToChapter} />}

            <div className="flex min-h-0 flex-1 gap-4">
                <div className="min-h-0 flex-1">
                    <DeviceFrame overlay={popupScreen}>{pageScreen}</DeviceFrame>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                {step.timeChip ? <TimeChip text={step.timeChip} /> : <div />}
                <DesignerNotes note={step.note} visible={wt.notesVisible} onToggle={wt.toggleNotes} />
            </div>

            {isEnd ? (
                <EndCard title={`That's the end of “${wt.scenario.title}.”`} otherBranch={otherBranch} otherScenarios={otherScenarios} onRestart={wt.restartScenario} />
            ) : (
                <StepControls
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    actionLabel={step.action === "advance" ? "time passes" : step.action.startsWith("auto") ? "auto-redirects" : step.action}
                    onBack={wt.goBack}
                    onNext={wt.goNext}
                    isEnd={isEnd}
                />
            )}
        </div>
    );
};
