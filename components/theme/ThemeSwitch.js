'use client';

import { useEffect } from 'react';
import { THEME_ATTR, THEME_KEY, resolveTheme } from './theme';
import useCsTheme from './useCsTheme';

function Sun() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Moon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const apply = (theme) => document.documentElement.setAttribute(THEME_ATTR, theme);
const current = () => (document.documentElement.getAttribute(THEME_ATTR) === 'light' ? 'light' : 'dark');

// The theme switch for the Placement Hub case study. It also owns keeping <html> in step with the
// theme: on client-side navigations the inline gate script doesn't run, and a choice made here must
// not leak onto other pages, so the attribute is removed when the page unmounts.
export default function ThemeSwitch() {
  const theme = useCsTheme();
  useEffect(() => {
    apply(resolveTheme());
    if (!window.matchMedia) return () => document.documentElement.removeAttribute(THEME_ATTR);
    // Follow the operating system live (unless a choice was made with the switch this visit).
    const queries = ['(prefers-color-scheme: dark)', '(prefers-color-scheme: light)'].map((q) => window.matchMedia(q));
    const sync = () => apply(resolveTheme());
    queries.forEach((q) => q.addEventListener('change', sync));
    return () => {
      queries.forEach((q) => q.removeEventListener('change', sync));
      document.documentElement.removeAttribute(THEME_ATTR);
    };
  }, []);

  const flip = () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    try {
      window.sessionStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked — the switch still works, the OS setting wins next load */
    }
    apply(next);
  };

  // The knob and icons are positioned by CSS from <html>'s attribute, so the switch is right on the
  // first paint; aria-checked is the assistive-technology view of the same thing.
  return (
    <button type="button" role="switch" aria-checked={theme !== 'light'} aria-label="Dark theme" className="cs-switch" onClick={flip}>
      <span className="cs-switch__icon cs-switch__icon--sun">
        <Sun />
      </span>
      <span className="cs-switch__icon cs-switch__icon--moon">
        <Moon />
      </span>
      <span className="cs-switch__knob" aria-hidden="true" />
    </button>
  );
}
