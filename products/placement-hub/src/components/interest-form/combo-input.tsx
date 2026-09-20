import { Check, ChevronDown } from "@untitledui/icons";
import { Button as AriaButton, ComboBox as AriaComboBox, Input as AriaInput, ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, Popover as AriaPopover } from "react-aria-components";
import { controlClass, listBoxClass, optionClass, popoverClass } from "@/components/interest-form/field-styles";
import type { Option } from "@/data/interest-form-options";

interface ComboInputProps {
    id: string;
    value: string;
    options: Option[];
    placeholder: string;
    invalid: boolean;
    labelledBy: string;
    disabled?: boolean;
    onChange: (value: string) => void;
    onBlur: () => void;
}

// Long lists (countries, states, cities) — same dropdown, but you can type to narrow it down.
// Opens on focus so it reads as a dropdown first and a search box second.
export const ComboInput = ({ id, value, options, placeholder, invalid, labelledBy, disabled, onChange, onBlur }: ComboInputProps) => {
    return (
        <AriaComboBox
            id={id}
            defaultItems={options}
            selectedKey={value || null}
            onSelectionChange={(key) => onChange(key === null ? "" : String(key))}
            menuTrigger="focus"
            allowsEmptyCollection
            isInvalid={invalid}
            isDisabled={disabled}
            aria-labelledby={labelledBy}
            onBlur={onBlur}
            className="group flex w-full flex-col"
        >
            <div className={`${controlClass(invalid)} cursor-text pr-2 group-data-[disabled]:cursor-not-allowed group-data-[disabled]:bg-gray-50 group-data-[disabled]:opacity-60`}>
                <AriaInput placeholder={placeholder} className="h-11 min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:font-normal placeholder:text-gray-400" />
                <AriaButton aria-label="Show options" className="flex size-8 shrink-0 items-center justify-center rounded-[6px] outline-none hover:bg-gray-50">
                    <ChevronDown className="size-4 text-gray-500 transition-transform duration-150 group-data-[open]:rotate-180" />
                </AriaButton>
            </div>
            <AriaPopover offset={4} className={popoverClass}>
                <AriaListBox
                    className={listBoxClass}
                    renderEmptyState={() => <p className="px-3 py-2.5 text-sm text-gray-500">No matches. Try a different spelling.</p>}
                >
                    {(item: Option) => (
                        <AriaListBoxItem id={item.id} textValue={item.label} className={optionClass}>
                            {({ isSelected }) => (
                                <>
                                    <span className="truncate">{item.label}</span>
                                    {isSelected && <Check className="size-4 shrink-0 text-blue-dark-700" />}
                                </>
                            )}
                        </AriaListBoxItem>
                    )}
                </AriaListBox>
            </AriaPopover>
        </AriaComboBox>
    );
};
