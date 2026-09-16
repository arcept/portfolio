import type { Scenario } from "@/scenarios/types";
import happyPath from "@/scenarios/data/01-happy-path.json";
import rejectionClosure from "@/scenarios/data/02-rejection-closure.json";
import gate from "@/scenarios/data/03-gate.json";
import exitLadder from "@/scenarios/data/04-exit-ladder.json";

export const SCENARIOS: Record<string, Scenario> = {
    "happy-path": happyPath as Scenario,
    "rejection-closure": rejectionClosure as Scenario,
    gate: gate as Scenario,
    "exit-ladder": exitLadder as Scenario,
};

export const SCENARIO_ORDER = ["happy-path", "rejection-closure", "gate", "exit-ladder"] as const;
