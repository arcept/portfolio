import { Moon02, Sun } from "@untitledui/icons";
import { motion } from "motion/react";
import { useTheme } from "@/providers/theme-provider";
import { cx } from "@/utils/cx";

/** Figma node 404:6283 ("Preview Theme" row) — a two-pill segmented switch, not the single
 * icon-swap button this used to be. The active pill's fill is one shared `layoutId` element, so
 * toggling slides it across rather than just swapping icons. */
export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    const options = [
        { mode: "dark" as const, icon: Moon02, label: "Switch to dark mode" },
        { mode: "light" as const, icon: Sun, label: "Switch to light mode" },
    ];

    return (
        <div className="flex items-center gap-1 rounded-[28px] bg-secondary_hover p-0.5">
            {options.map(({ mode, icon: Icon, label }) => {
                const active = mode === "dark" ? isDark : !isDark;
                return (
                    <button
                        key={mode}
                        type="button"
                        aria-label={label}
                        aria-pressed={active}
                        onClick={() => setTheme(mode)}
                        className="relative flex cursor-pointer items-center justify-center rounded-full p-2 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        {active && (
                            <motion.span
                                layoutId="theme-toggle-thumb"
                                className="absolute inset-0 rounded-full bg-primary shadow-xs"
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            />
                        )}
                        <Icon className={cx("relative z-10 size-4", active ? "text-primary" : "text-quaternary")} />
                    </button>
                );
            })}
        </div>
    );
};
