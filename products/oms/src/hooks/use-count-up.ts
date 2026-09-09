import { useEffect, useRef, useState } from "react";

/**
 * Animates a displayed integer toward `target` whenever it changes (including the very first
 * render, which counts up from 0) rather than snapping straight to the new value.
 */
export const useCountUp = (target: number, durationMs = 700) => {
    const [value, setValue] = useState(0);
    const valueRef = useRef(0);

    useEffect(() => {
        const from = valueRef.current;
        if (from === target) return;

        let raf: number;
        let start: number | null = null;
        const tick = (now: number) => {
            if (start === null) start = now;
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            const next = Math.round(from + (target - from) * eased);
            valueRef.current = next;
            setValue(next);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, durationMs]);

    return value;
};
