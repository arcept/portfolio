import { cx } from "@/utils/cx";

interface ChapterRailProps {
    chapters: string[];
    currentChapter?: string;
    onJump: (chapter: string) => void;
}

// Hero scenarios only (short scenarios use fork-card/end-card instead) — jumps to a chapter's
// first step. products/placement/CLAUDE.md acceptance: "Chapter rail on hero scenarios; jump to
// chapter start."
export const ChapterRail = ({ chapters, currentChapter, onJump }: ChapterRailProps) => {
    return (
        <nav className="flex items-center gap-1 border-b border-[var(--rule)] px-1 pb-3">
            {chapters.map((chapter, i) => {
                const isActive = chapter === currentChapter;
                return (
                    <button
                        key={chapter}
                        type="button"
                        onClick={() => onJump(chapter)}
                        className={cx(
                            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs tracking-wide uppercase transition-colors duration-150",
                            isActive ? "bg-[var(--ink)] text-[var(--sheet)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]",
                        )}
                        style={{ fontFamily: "var(--sans)" }}
                    >
                        <span className="font-mono text-[10px]" style={{ fontFamily: "var(--mono)" }}>
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        {chapter}
                    </button>
                );
            })}
        </nav>
    );
};
