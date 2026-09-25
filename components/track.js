// Analytics events, one call for the whole site. Sends to GA4 through gtag when it is loaded and the
// visitor has accepted cookies; until then (or after "Decline") it does nothing, so pages can call it
// freely.
export function track(event, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}
