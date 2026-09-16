import type { LearnerState } from "@/state/learner-state";
import type { StatePatch } from "@/state/apply-patch";

// Mirrors docs/placement/spec/scenarios/README.md's conventions exactly — the JSONs in ./data
// are copies of docs/placement/spec/scenarios/*.json, kept in sync by hand (see that folder for
// the source of truth if scenario content changes).
export interface ScenarioStep {
    n: number;
    screen: string; // slug from docs/placement/spec/screen-map.md
    set?: StatePatch; // applied on entering the step
    action: string; // learner-facing click, or "advance" / "end" / "auto <n>s → home"
    note?: string; // Designer's note — hidden by default
    chapter?: string;
    timeChip?: string;
}

export interface ScenarioBranch {
    label: string;
    steps: ScenarioStep[];
}

interface ScenarioBase {
    id: string;
    title: string;
    proves: string[];
}

export interface HeroScenario extends ScenarioBase {
    tier: "hero";
    initialState: Partial<LearnerState>;
    steps: ScenarioStep[];
    chapters: string[];
}

export interface ShortScenario extends ScenarioBase {
    tier: "short";
    initialState: Partial<LearnerState>;
    branches: ScenarioBranch[];
    phase2Hint?: string;
}

export type Scenario = HeroScenario | ShortScenario;
