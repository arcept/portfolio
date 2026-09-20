// One look for every text-like control on the Interest Form (dropdowns, comboboxes, text, amount,
// date) so they line up in a row. The Figma frame mixes two border greys and two heights across
// its dropdowns and text fields; this settles on a single 48px control with a blue focus ring.
export const controlClass = (invalid: boolean) =>
    [
        "flex min-h-12 w-full items-center gap-2 rounded-xs border bg-white px-4 text-base font-medium text-gray-900 transition-[border-color,box-shadow] duration-150",
        invalid
            ? "border-error-600 focus-within:ring-4 focus-within:ring-error-100"
            : "border-gray-300 hover:border-gray-400 focus-within:border-blue-dark-600 focus-within:ring-4 focus-within:ring-blue-dark-50",
    ].join(" ");

export const popoverClass = "w-(--trigger-width) min-w-48 overflow-hidden rounded-xs border border-gray-200 bg-white shadow-lg outline-none";

export const listBoxClass = "max-h-64 overflow-auto p-1 outline-none";

export const optionClass = (state: { isFocused: boolean; isSelected: boolean }) =>
    [
        "flex cursor-pointer items-center justify-between gap-3 rounded-[6px] px-3 py-2.5 text-base text-gray-700 outline-none",
        state.isFocused ? "bg-gray-50" : "",
        state.isSelected ? "font-semibold text-blue-dark-700" : "",
    ].join(" ");
