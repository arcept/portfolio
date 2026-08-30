import { Moon01, Sun } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { useTheme } from "@/providers/theme-provider";

/**
 * TODO(temporary): placeholder theme switcher so Manik can preview both themes while the
 * Figma dashboard is still WIP. Not a designed control — replace once a real one exists.
 */
export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
        <ButtonUtility
            size="sm"
            color="tertiary"
            tooltip={isDark ? "Switch to light mode" : "Switch to dark mode"}
            icon={isDark ? Sun : Moon01}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        />
    );
};
