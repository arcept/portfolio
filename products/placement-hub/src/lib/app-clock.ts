// The prototype's "today", frozen on purpose. Job deadlines ("closes in 36hrs"), "posted 3d ago"
// and application dates are all fixture data, so the board must read the same on every visit no
// matter when it's opened. Anything that needs "today" reads it from here instead of `new Date()`.
export const APP_TODAY = new Date(2026, 8, 19); // 19 Sep 2026

/** A fresh copy each call, so callers can't mutate the shared date. */
export const appToday = () => new Date(APP_TODAY);
