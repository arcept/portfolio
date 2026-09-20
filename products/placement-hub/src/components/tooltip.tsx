import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ReactNode } from "react";

// Spring feel matches animate-ui.com's Radix tooltip defaults (stiffness 300, damping 25) —
// https://animate-ui.com/docs/components/radix/tooltip
const TOOLTIP_TRANSITION = { type: "spring" as const, stiffness: 300, damping: 25 };

interface TooltipProps {
    label: string;
    children: ReactNode;
}

export const Tooltip = ({ label, children }: TooltipProps) => {
    const [open, setOpen] = useState(false);

    return (
        <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
            {children}
            <AnimatePresence>
                {open && (
                    <motion.span
                        role="tooltip"
                        initial={{ opacity: 0, scale: 0.9, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 4 }}
                        transition={TOOLTIP_TRANSITION}
                        className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg"
                    >
                        {label}
                        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
};
