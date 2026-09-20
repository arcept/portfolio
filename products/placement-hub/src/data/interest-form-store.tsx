import { useSyncExternalStore } from "react";
import { buildSubmission } from "@/lib/interest-form";
import type { InterestSubmission } from "@/lib/interest-form";
import type { InterestFormValues } from "@/types/interest-form";
import { EMPTY_VALUES } from "@/types/interest-form";

// Same tiny external-store shape as profile-store.tsx / jobs-store.tsx. Holds the in-progress draft
// (so leaving the form and coming back doesn't lose answers) and, once submitted, the submission
// the Home banner and the "thank you" screen read from.
interface InterestFormState {
    draft: InterestFormValues;
    submission?: InterestSubmission;
}

let state: InterestFormState = { draft: EMPTY_VALUES };
const listeners = new Set<() => void>();

const setState = (next: InterestFormState) => {
    state = next;
    listeners.forEach((listener) => listener());
};

export const interestFormStore = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    saveDraft: (draft: InterestFormValues) => setState({ ...state, draft }),
    submit: (values: InterestFormValues) => {
        const submission = buildSubmission(values);
        setState({ draft: submission.values, submission });
    },
    // Back to a blank, never-submitted form — used by the QA simulator.
    reset: () => setState({ draft: EMPTY_VALUES }),
};

// Selects just the submission (a stable reference) so keystrokes that only touch the draft never
// re-render Home or the form page through this hook.
export const useInterestFormSubmission = () => useSyncExternalStore(interestFormStore.subscribe, () => interestFormStore.getSnapshot().submission);
