import { Plus, XClose } from "@untitledui/icons";
import { ComboBox as AriaComboBox, Input as AriaInput, ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, Popover as AriaPopover } from "react-aria-components";
import { useRef, useState } from "react";
import { controlClass, listBoxClass, optionClass, popoverClass } from "@/components/interest-form/field-styles";

const CUSTOM_PREFIX = "__custom__:";

interface MultiComboInputProps {
    id: string;
    values: string[];
    options: string[];
    max: number;
    /** "role" / "location" — used in the "add your own" row and the limit message. */
    itemNoun: string;
    placeholder: string;
    invalid: boolean;
    labelledBy: string;
    onChange: (values: string[]) => void;
    onBlur: () => void;
}

interface Item {
    id: string;
    label: string;
    isCustom?: boolean;
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Pick several from a list, with chips for what's already chosen. Anything that isn't in the list
// can be typed and added as-is — target roles and cities are open-ended, and forcing a learner
// into the nearest wrong option would corrupt the matching this data feeds.
export const MultiComboInput = ({ id, values, options, max, itemNoun, placeholder, invalid, labelledBy, onChange, onBlur }: MultiComboInputProps) => {
    const [input, setInput] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const atLimit = values.length >= max;

    const query = input.trim();
    const matches: Item[] = atLimit
        ? []
        : options.filter((o) => !values.some((v) => sameText(v, o)) && o.toLowerCase().includes(query.toLowerCase())).map((o) => ({ id: o, label: o }));
    const canAddCustom = !atLimit && query.length >= 2 && !options.some((o) => sameText(o, query)) && !values.some((v) => sameText(v, query));
    const items: Item[] = canAddCustom ? [...matches, { id: `${CUSTOM_PREFIX}${query}`, label: query, isCustom: true }] : matches;

    const add = (key: string) => {
        const label = key.startsWith(CUSTOM_PREFIX) ? key.slice(CUSTOM_PREFIX.length) : key;
        if (!values.some((v) => sameText(v, label))) onChange([...values, label]);
        setInput("");
    };

    const remove = (label: string) => onChange(values.filter((v) => v !== label));

    return (
        <AriaComboBox
            id={id}
            items={items}
            inputValue={input}
            onInputChange={setInput}
            selectedKey={null}
            onSelectionChange={(key) => key !== null && add(String(key))}
            menuTrigger="focus"
            allowsEmptyCollection
            isInvalid={invalid}
            aria-labelledby={labelledBy}
            onBlur={onBlur}
            className="flex w-full flex-col"
        >
            <div ref={wrapperRef} className={`${controlClass(invalid)} cursor-text flex-wrap py-2`} onClick={(e) => e.currentTarget.querySelector("input")?.focus()}>
                {values.map((label) => (
                    <span key={label} className="flex items-center gap-1 rounded-[6px] bg-blue-dark-50 py-1 pr-1 pl-2.5 text-sm font-semibold text-blue-dark-700">
                        {label}
                        <button
                            type="button"
                            aria-label={`Remove ${label}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                remove(label);
                            }}
                            className="flex size-5 items-center justify-center rounded hover:bg-blue-dark-200/60"
                        >
                            <XClose className="size-3.5" />
                        </button>
                    </span>
                ))}
                <AriaInput
                    placeholder={atLimit ? `${max} ${itemNoun}s chosen` : values.length === 0 ? placeholder : `Add another ${itemNoun}`}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && input === "" && values.length > 0) remove(values[values.length - 1]);
                    }}
                    className="h-8 min-w-40 flex-1 bg-transparent font-medium outline-none placeholder:font-normal placeholder:text-gray-400"
                />
            </div>
            <AriaPopover triggerRef={wrapperRef} offset={4} className={popoverClass} style={{ width: wrapperRef.current?.offsetWidth }}>
                <AriaListBox
                    className={listBoxClass}
                    items={items}
                    renderEmptyState={() => (
                        <p className="px-3 py-2.5 text-sm text-gray-500">{atLimit ? `You can choose up to ${max} ${itemNoun}s. Remove one to add another.` : "Start typing to search."}</p>
                    )}
                >
                    {(item: Item) => (
                        <AriaListBoxItem id={item.id} textValue={item.label} className={optionClass}>
                            {item.isCustom ? (
                                <span className="flex items-center gap-2 font-semibold text-blue-dark-700">
                                    <Plus className="size-4" />
                                    Add "{item.label}"
                                </span>
                            ) : (
                                <span className="truncate">{item.label}</span>
                            )}
                        </AriaListBoxItem>
                    )}
                </AriaListBox>
            </AriaPopover>
        </AriaComboBox>
    );
};
