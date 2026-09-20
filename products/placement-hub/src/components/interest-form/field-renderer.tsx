import { ChoiceInput, MultiChoiceInput } from "@/components/interest-form/choice-input";
import { ComboInput } from "@/components/interest-form/combo-input";
import { MultiComboInput } from "@/components/interest-form/multi-combo-input";
import { SelectInput } from "@/components/interest-form/select-input";
import { AmountInput, DateInput, TextInput } from "@/components/interest-form/text-inputs";
import { resolveOptions } from "@/lib/interest-form";
import type { Field } from "@/lib/interest-form";
import type { FieldId, InterestFormValues } from "@/types/interest-form";

interface FieldRendererProps {
    field: Field;
    values: InterestFormValues;
    /** Only set once the error should actually be shown (after a blur or a submit attempt). */
    error?: string;
    labelledBy: string;
    onChange: (id: FieldId, value: string | string[]) => void;
    onTouch: (id: FieldId) => void;
}

// Maps one schema field onto the control that renders it — keeps the page free of per-kind
// branching, and keeps the controls free of any knowledge about the schema.
export const FieldRenderer = ({ field, values, error, labelledBy, onChange, onTouch }: FieldRendererProps) => {
    const domId = `field-${field.id}`;
    const invalid = !!error;
    const touch = () => onTouch(field.id);
    const value = values[field.id];
    const str = typeof value === "string" ? value : "";
    const list = Array.isArray(value) ? value : [];
    const set = (v: string | string[]) => onChange(field.id, v);
    const disabled = field.disabled?.(values);

    switch (field.kind) {
        case "select":
            return (
                <SelectInput
                    id={domId}
                    value={str}
                    options={resolveOptions(field.options, values)}
                    placeholder={field.placeholder ?? "Select"}
                    caption={field.caption}
                    disabled={disabled}
                    invalid={invalid}
                    labelledBy={labelledBy}
                    onChange={set}
                    onBlur={touch}
                />
            );
        case "combo":
            return <ComboInput id={domId} value={str} options={resolveOptions(field.options, values)} placeholder={field.placeholder ?? "Search"} invalid={invalid} labelledBy={labelledBy} disabled={disabled} onChange={set} onBlur={touch} />;
        case "text":
            return <TextInput id={domId} value={str} maxLength={field.maxLength} placeholder={field.placeholder} invalid={invalid} labelledBy={labelledBy} onChange={set} onBlur={touch} />;
        case "amount":
            return <AmountInput id={domId} value={str} placeholder={field.placeholder} invalid={invalid} labelledBy={labelledBy} onChange={set} onBlur={touch} />;
        case "date":
            return <DateInput id={domId} value={str} min={field.min()} max={field.max()} invalid={invalid} labelledBy={labelledBy} onChange={set} onBlur={touch} />;
        case "choice":
            return <ChoiceInput value={str} options={field.options} variant={field.variant} columns={field.columns} invalid={invalid} labelledBy={labelledBy} onChange={set} onBlur={touch} />;
        case "multi-choice":
            return <MultiChoiceInput values={list} options={field.options} columns={field.columns} invalid={invalid} labelledBy={labelledBy} onChange={set} onBlur={touch} />;
        case "multi-combo":
            return (
                <MultiComboInput
                    id={domId}
                    values={list}
                    options={field.options}
                    max={field.max}
                    itemNoun={field.itemNoun}
                    placeholder={field.placeholder ?? "Search"}
                    invalid={invalid}
                    labelledBy={labelledBy}
                    onChange={set}
                    onBlur={touch}
                />
            );
    }
};
