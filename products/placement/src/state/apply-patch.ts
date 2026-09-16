import type { Application, LearnerState } from "@/state/learner-state";

// Scenario steps set state via dot/bracket paths (docs/placement/spec/scenarios/README.md),
// e.g. { "applications[0].status": "profile_shared" }. Applied immutably so React sees a new
// reference and re-renders — screens are pure functions of LearnerState, never mutate it in place.
export type StatePatch = Record<string, unknown>;

const parsePath = (path: string): Array<string | number> =>
    path
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .filter(Boolean)
        .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));

const setAtPath = (target: unknown, segments: Array<string | number>, value: unknown): unknown => {
    const [head, ...rest] = segments;
    const container = (Array.isArray(target) ? [...target] : { ...(target as Record<string, unknown>) }) as Record<string | number, unknown>;

    container[head] = rest.length === 0 ? value : setAtPath(container[head], rest, value);
    return container;
};

const APPLICATION_STATUS_PATH = /^applications\[(\d+)\]\.status$/;

export const applyPatch = (state: LearnerState, patch: StatePatch): LearnerState => {
    let next: LearnerState = state;
    for (const [path, value] of Object.entries(patch)) {
        next = setAtPath(next, parsePath(path), value) as LearnerState;

        // Scenario steps only ever set `applications[n].status` (docs/placement/spec/scenarios/*.json
        // never re-lists the full history per step) — the Steps tracker reads `history`, so every
        // status change appends here rather than requiring each scenario step to hand-maintain it.
        const statusMatch = path.match(APPLICATION_STATUS_PATH);
        if (statusMatch) {
            const index = Number(statusMatch[1]);
            const app = next.applications[index];
            if (app && app.history[app.history.length - 1] !== value) {
                next = {
                    ...next,
                    applications: next.applications.map((a, i) => (i === index ? { ...a, history: [...a.history, value as Application["status"]] } : a)),
                };
            }
        }
    }
    return next;
};
