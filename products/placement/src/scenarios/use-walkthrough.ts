import { useCallback, useMemo, useState } from "react";
import { isPopupSlug } from "@/scenarios/popup-slugs";
import { SCENARIOS, SCENARIO_ORDER } from "@/scenarios/loader";
import type { HeroScenario, Scenario, ScenarioStep, ShortScenario } from "@/scenarios/types";
import { applyPatch } from "@/state/apply-patch";
import { ALL_JOBS } from "@/state/fixtures/jobs";
import { UPDATE_FIXTURES } from "@/state/fixtures/updates";
import type { LearnerState } from "@/state/learner-state";

const BASE_STATE: LearnerState = {
    name: "Manik",
    stage: "evaluation_day",
    eligibility: "not_assessed",
    profile: "complete",
    interest: "unknown",
    standing: "active",
    preferredLocation: "Gurugram, India",
    jobs: ALL_JOBS,
    applications: [],
    updates: UPDATE_FIXTURES,
    windowClosingSoon: false,
};

const isHero = (s: Scenario): s is HeroScenario => s.tier === "hero";
const isShort = (s: Scenario): s is ShortScenario => s.tier === "short";

// Persists the Designer's notes toggle across steps/scenarios (products/placement/CLAUDE.md:
// "off by default, persists"). try/catch since localStorage can throw (private browsing, etc).
const NOTES_KEY = "placement-hub-designer-notes";
const readNotesPreference = (): boolean => {
    try {
        return localStorage.getItem(NOTES_KEY) === "1";
    } catch {
        return false;
    }
};
const writeNotesPreference = (value: boolean) => {
    try {
        localStorage.setItem(NOTES_KEY, value ? "1" : "0");
    } catch {
        // ignore — not essential, just a nice-to-have persisted preference
    }
};

export interface WalkthroughStepView {
    step: ScenarioStep;
    stepIndex: number;
    totalSteps: number;
    state: LearnerState;
    pageSlug: string;
    popupSlug: string | null;
    isEnd: boolean;
}

export const useWalkthrough = () => {
    const [scenarioId, setScenarioId] = useState<string | null>(null);
    const [branchIndex, setBranchIndex] = useState<number | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [notesVisible, setNotesVisible] = useState(readNotesPreference);

    const scenario = scenarioId ? SCENARIOS[scenarioId] : null;

    const steps: ScenarioStep[] = useMemo(() => {
        if (!scenario) return [];
        if (isHero(scenario)) return scenario.steps;
        if (isShort(scenario) && branchIndex !== null) return scenario.branches[branchIndex].steps;
        return [];
    }, [scenario, branchIndex]);

    const atFork = !!scenario && isShort(scenario) && branchIndex === null;

    const view: WalkthroughStepView | null = useMemo(() => {
        if (!scenario || steps.length === 0) return null;
        const clampedIndex = Math.min(stepIndex, steps.length - 1);

        let state: LearnerState = { ...BASE_STATE, ...scenario.initialState };
        let pageSlug = "";
        let popupSlug: string | null = null;

        for (let i = 0; i <= clampedIndex; i++) {
            const step = steps[i];
            if (step.set) state = applyPatch(state, step.set);
            if (isPopupSlug(step.screen)) {
                popupSlug = step.screen;
            } else {
                pageSlug = step.screen;
                popupSlug = null;
            }
        }

        const step = steps[clampedIndex];
        return {
            step,
            stepIndex: clampedIndex,
            totalSteps: steps.length,
            state,
            pageSlug,
            popupSlug,
            isEnd: step.action === "end",
        };
    }, [scenario, steps, stepIndex]);

    const selectScenario = useCallback((id: string) => {
        setScenarioId(id);
        setBranchIndex(null);
        setStepIndex(0);
    }, []);

    const selectBranch = useCallback((index: number) => {
        setBranchIndex(index);
        setStepIndex(0);
    }, []);

    const goNext = useCallback(() => {
        setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, [steps.length]);

    const goBack = useCallback(() => {
        setStepIndex((i) => Math.max(i - 1, 0));
    }, []);

    const jumpToChapter = useCallback(
        (chapter: string) => {
            const idx = steps.findIndex((s) => s.chapter === chapter);
            if (idx >= 0) setStepIndex(idx);
        },
        [steps],
    );

    const restartScenario = useCallback(() => {
        setBranchIndex(null);
        setStepIndex(0);
    }, []);

    const exitToPicker = useCallback(() => {
        setScenarioId(null);
        setBranchIndex(null);
        setStepIndex(0);
    }, []);

    const toggleNotes = useCallback(() => {
        setNotesVisible((v) => {
            const next = !v;
            writeNotesPreference(next);
            return next;
        });
    }, []);

    return {
        scenario,
        scenarioId,
        atFork,
        view,
        chapters: scenario && isHero(scenario) ? scenario.chapters : null,
        branches: scenario && isShort(scenario) ? scenario.branches : null,
        notesVisible,
        scenarioOrder: SCENARIO_ORDER,
        allScenarios: SCENARIOS,
        selectScenario,
        selectBranch,
        goNext,
        goBack,
        jumpToChapter,
        restartScenario,
        exitToPicker,
        toggleNotes,
    };
};
