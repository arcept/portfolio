import { SCENARIO_ORDER, SCENARIOS } from "@/scenarios/loader";
import { cx } from "@/utils/cx";

interface ScenarioPickerProps {
    onPick: (id: string) => void;
}

// The walkthrough's entry point — 4 cards, 2 hero (full depth) + 2 short (3-4 step branches).
export const ScenarioPicker = ({ onPick }: ScenarioPickerProps) => (
    <div className="flex size-full flex-col items-center justify-center gap-8 p-8">
        <div className="text-center">
            <p className="text-xs tracking-wide text-[var(--ink-3)] uppercase" style={{ fontFamily: "var(--mono)" }}>
                Placement Hub — interactive case study
            </p>
            <h1 className="mt-2 text-3xl text-[var(--ink)]" style={{ fontFamily: "var(--serif)" }}>
                Pick a scenario
            </h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
            {SCENARIO_ORDER.map((id) => {
                const scenario = SCENARIOS[id];
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onPick(id)}
                        className="flex w-72 flex-col items-start gap-2 rounded-xl border border-[var(--rule-2)] bg-[var(--sheet)] p-5 text-left hover:border-[var(--ink-3)]"
                    >
                        <span
                            className={cx("rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase", scenario.tier === "hero" ? "bg-[var(--ink)] text-[var(--sheet)]" : "border border-[var(--rule-2)] text-[var(--ink-3)]")}
                            style={{ fontFamily: "var(--mono)" }}
                        >
                            {scenario.tier === "hero" ? "Hero" : "Short"}
                        </span>
                        <h3 className="text-lg text-[var(--ink)]" style={{ fontFamily: "var(--serif)" }}>
                            {scenario.title}
                        </h3>
                        <ul className="flex flex-col gap-0.5 text-xs text-[var(--ink-3)]">
                            {scenario.proves.map((p) => (
                                <li key={p}>· {p}</li>
                            ))}
                        </ul>
                    </button>
                );
            })}
        </div>
    </div>
);
