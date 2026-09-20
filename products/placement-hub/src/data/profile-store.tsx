import { useSyncExternalStore } from "react";

// A tiny external store (same shape as jobs-store.tsx) for the learner's profile-completion state.
// There's no real "fill out your profile" workflow in this build — QA flips it directly via the
// Ops Simulator to preview both the incomplete and complete My Profile states.
let profileComplete = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const profileStore = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getSnapshot: () => profileComplete,
    // Simulates the outcome of the (unbuilt) profile-completion workflow — jumps straight to the
    // "done" state, uploading the resume and portfolio in one shot.
    completeProfile: () => {
        profileComplete = true;
        notify();
    },
    resetProfile: () => {
        profileComplete = false;
        notify();
    },
};

export const useProfileComplete = () => useSyncExternalStore(profileStore.subscribe, profileStore.getSnapshot);
