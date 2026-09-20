import { Check } from "@untitledui/icons";
import { Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup, Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import type { Option } from "@/data/interest-form-options";
import { cx } from "@/utils/cx";

const GRID = { 2: "grid-cols-2 max-md:grid-cols-1", 3: "grid-cols-3 max-md:grid-cols-1", 4: "grid-cols-4 max-md:grid-cols-1" } as const;

const cardClass = (state: { isSelected: boolean; isFocusVisible: boolean; isHovered: boolean }, invalid: boolean) =>
    cx(
        "group flex cursor-pointer items-start gap-3 rounded-xs border bg-white p-4 outline-none transition-[border-color,background-color,box-shadow] duration-150",
        state.isSelected ? "border-blue-dark-600 bg-blue-dark-50" : invalid ? "border-error-600" : "border-gray-300",
        state.isHovered && !state.isSelected && "border-gray-400",
        state.isFocusVisible && "ring-4 ring-blue-dark-50",
    );

const RadioDot = ({ selected }: { selected: boolean }) => (
    <span className={cx("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors", selected ? "border-blue-dark-700 bg-blue-dark-700" : "border-gray-400 bg-white")}>
        <span className={cx("size-2 rounded-full bg-white transition-transform", selected ? "scale-100" : "scale-0")} />
    </span>
);

const CheckBox = ({ selected }: { selected: boolean }) => (
    <span className={cx("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors", selected ? "border-blue-dark-700 bg-blue-dark-700" : "border-gray-400 bg-white")}>
        <Check className={cx("size-3.5 text-white transition-transform", selected ? "scale-100" : "scale-0")} strokeWidth={3} />
    </span>
);

const OptionText = ({ option }: { option: Option }) => (
    <span className="flex min-w-0 flex-col">
        <span className="text-base leading-5 font-semibold text-gray-900">{option.label}</span>
        {option.description && <span className="mt-1 text-sm leading-5 text-gray-500">{option.description}</span>}
    </span>
);

interface ChoiceInputProps {
    value: string;
    options: Option[];
    variant: "segmented" | "cards";
    columns?: 2 | 3;
    invalid: boolean;
    labelledBy: string;
    onChange: (value: string) => void;
    onBlur: () => void;
}

// Single choice. "segmented" is the compact Yes/No pair (the Figma radios, made big enough to tap);
// "cards" gives each option room for a one-line explanation.
export const ChoiceInput = ({ value, options, variant, columns = 2, invalid, labelledBy, onChange, onBlur }: ChoiceInputProps) => {
    if (variant === "segmented") {
        return (
            <AriaRadioGroup value={value} onChange={onChange} onBlur={onBlur} isInvalid={invalid} aria-labelledby={labelledBy} orientation="horizontal" className="flex gap-3">
                {options.map((option) => (
                    <AriaRadio key={option.id} value={option.id} className={(s) => cx(cardClass(s, invalid), "w-32 items-center")}>
                        {({ isSelected }) => (
                            <>
                                <RadioDot selected={isSelected} />
                                <span className="text-base font-semibold text-gray-900">{option.label}</span>
                            </>
                        )}
                    </AriaRadio>
                ))}
            </AriaRadioGroup>
        );
    }

    return (
        <AriaRadioGroup value={value} onChange={onChange} onBlur={onBlur} isInvalid={invalid} aria-labelledby={labelledBy} className={cx("grid gap-3", GRID[columns])}>
            {options.map((option) => (
                <AriaRadio key={option.id} value={option.id} className={(s) => cardClass(s, invalid)}>
                    {({ isSelected }) => (
                        <>
                            <RadioDot selected={isSelected} />
                            <OptionText option={option} />
                        </>
                    )}
                </AriaRadio>
            ))}
        </AriaRadioGroup>
    );
};

interface MultiChoiceInputProps {
    values: string[];
    options: Option[];
    columns: 2 | 3;
    invalid: boolean;
    labelledBy: string;
    onChange: (values: string[]) => void;
    onBlur: () => void;
}

// Multiple choice as cards with a checkbox — same footprint as the single-choice cards so the two
// kinds of question read as one family.
export const MultiChoiceInput = ({ values, options, columns, invalid, labelledBy, onChange, onBlur }: MultiChoiceInputProps) => {
    return (
        <AriaCheckboxGroup value={values} onChange={onChange} onBlur={onBlur} isInvalid={invalid} aria-labelledby={labelledBy} className={cx("grid gap-3", GRID[columns])}>
            {options.map((option) => (
                <AriaCheckbox key={option.id} value={option.id} className={(s) => cardClass(s, invalid)}>
                    {({ isSelected }) => (
                        <>
                            <CheckBox selected={isSelected} />
                            <OptionText option={option} />
                        </>
                    )}
                </AriaCheckbox>
            ))}
        </AriaCheckboxGroup>
    );
};
