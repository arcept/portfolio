import { Check, ChevronDown } from "@untitledui/icons";
import { Button as AriaButton, ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, Popover as AriaPopover, Select as AriaSelect, SelectValue as AriaSelectValue } from "react-aria-components";
import { controlClass, listBoxClass, optionClass, popoverClass } from "@/components/interest-form/field-styles";
import type { Option } from "@/data/interest-form-options";

interface SelectInputProps {
    id: string;
    value: string;
    options: Option[];
    placeholder: string;
    invalid: boolean;
    labelledBy: string;
    caption?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
    onBlur: () => void;
}

// Short lists (experience, notice period, ...) — a plain dropdown, no search box to fumble with.
export const SelectInput = ({ id, value, options, placeholder, invalid, labelledBy, caption, disabled, onChange, onBlur }: SelectInputProps) => {
    return (
        <AriaSelect
            id={id}
            selectedKey={value || null}
            onSelectionChange={(key) => onChange(key === null ? "" : String(key))}
            onBlur={onBlur}
            isInvalid={invalid}
            isDisabled={disabled}
            placeholder={placeholder}
            aria-label={caption}
            aria-labelledby={caption ? undefined : labelledBy}
            className="group flex w-full flex-col gap-1.5"
        >
            {caption && <span className="text-sm font-medium text-gray-600">{caption}</span>}
            <AriaButton className={`${controlClass(invalid)} cursor-pointer text-left outline-none group-data-[disabled]:cursor-not-allowed group-data-[disabled]:bg-gray-50 group-data-[disabled]:opacity-60 data-[focus-visible]:border-blue-dark-600 data-[focus-visible]:ring-4 data-[focus-visible]:ring-blue-dark-50`}>
                <AriaSelectValue className="flex-1 truncate data-[placeholder]:font-normal data-[placeholder]:text-gray-400" />
                <ChevronDown className="size-4 shrink-0 text-gray-500 transition-transform duration-150 group-data-[open]:rotate-180" />
            </AriaButton>
            <AriaPopover offset={4} className={popoverClass}>
                <AriaListBox className={listBoxClass}>
                    {options.map((option) => (
                        <AriaListBoxItem key={option.id} id={option.id} textValue={option.label} className={optionClass}>
                            {({ isSelected }) => (
                                <>
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <Check className="size-4 shrink-0 text-blue-dark-700" />}
                                </>
                            )}
                        </AriaListBoxItem>
                    ))}
                </AriaListBox>
            </AriaPopover>
        </AriaSelect>
    );
};
