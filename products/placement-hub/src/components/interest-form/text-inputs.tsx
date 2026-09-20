import { Calendar } from "@untitledui/icons";
import { controlClass } from "@/components/interest-form/field-styles";
import { digitsOnly, formatIndian, formatLpa } from "@/lib/interest-form";

const inputClass = "h-11 min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:font-normal placeholder:text-gray-400";

interface BaseProps {
    id: string;
    invalid: boolean;
    labelledBy: string;
    placeholder?: string;
    onBlur: () => void;
}

export const TextInput = ({ id, value, maxLength, invalid, labelledBy, placeholder, onChange, onBlur }: BaseProps & { value: string; maxLength?: number; onChange: (v: string) => void }) => (
    <div className={controlClass(invalid)}>
        <input
            id={id}
            type="text"
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            aria-labelledby={labelledBy}
            aria-invalid={invalid || undefined}
            autoComplete="off"
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={inputClass}
        />
    </div>
);

// Annual pay in rupees. Digits are stored raw ("400000") and shown with Indian grouping
// ("4,00,000") as in the Figma frame, with the LPA equivalent alongside so a learner can tell at a
// glance they typed 4 lakh and not 40.
export const AmountInput = ({ id, value, invalid, labelledBy, placeholder, onChange, onBlur }: BaseProps & { value: string; onChange: (v: string) => void }) => (
    <div className={controlClass(invalid)}>
        <span aria-hidden className="text-base font-semibold text-gray-500">
            ₹
        </span>
        <input
            id={id}
            type="text"
            inputMode="numeric"
            value={formatIndian(value)}
            placeholder={placeholder}
            aria-labelledby={labelledBy}
            aria-invalid={invalid || undefined}
            autoComplete="off"
            onChange={(e) => onChange(digitsOnly(e.target.value).slice(0, 9))}
            onBlur={onBlur}
            className={inputClass}
        />
        {value && <span className="shrink-0 rounded-[6px] bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{formatLpa(value)}</span>}
    </div>
);

export const DateInput = ({ id, value, min, max, invalid, labelledBy, onChange, onBlur }: BaseProps & { value: string; min: string; max: string; onChange: (v: string) => void }) => (
    <div className={controlClass(invalid)}>
        <input
            id={id}
            type="date"
            value={value}
            min={min}
            max={max}
            aria-labelledby={labelledBy}
            aria-invalid={invalid || undefined}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={`${inputClass} appearance-none [&::-webkit-calendar-picker-indicator]:hidden ${value ? "" : "text-gray-400"}`}
            onClick={(e) => e.currentTarget.showPicker?.()}
        />
        <Calendar aria-hidden className="size-4 shrink-0 text-gray-500" />
    </div>
);
