// Popup screens render as an overlay on top of the last non-popup ("page") screen, matching how
// the reference screens show them (JD page dimmed behind the modal) — see resolve-screen.tsx.
export const POPUP_SLUGS = new Set([
    "popup-apply-confirm",
    "popup-apply-location-mismatch",
    "popup-apply-policy-reminder",
    "popup-apply-success",
    "popup-accept-confirm",
    "popup-offer-accepted-1",
    "popup-offer-accepted-2",
    "popup-offer-accepted-3",
    "popup-offer-accepted-4",
    "popup-query-form",
    "popup-query-ack",
    "popup-offer-concern",
    "popup-offer-concern-ack",
]);

export const isPopupSlug = (slug: string): boolean => POPUP_SLUGS.has(slug);
