'use client';

import { useEffect } from 'react';
import { SECTION_IDS, THEME_KEY } from './theme';

function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

function chosenTheme() {
  try {
    const value = window.sessionStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

// The section the reader is in, so switching versions doesn't send them back to the top.
function currentSectionId() {
  if (window.scrollY < 300) return '';
  let found = '';
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) found = id;
  }
  return found;
}

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

// `page` is which version this switch sits on ('dark' or 'light'); `siblingHref` is the other one.
// `variant` picks the stylesheet prefix ('cs' for the dark site design, 'lx' for the light one).
export default function ThemeSwitch({ page, siblingHref, variant = 'cs' }) {
  // Keep the page in step with the theme: covers client-side navigations (where the inline gate
  // script doesn't run) and follows the operating system live if it changes while the page is open.
  useEffect(() => {
    const sync = () => {
      const wanted = chosenTheme() ?? systemTheme();
      if (wanted !== page) window.location.replace(siblingHref + window.location.hash);
    };
    sync();
    if (!window.matchMedia) return undefined;
    const queries = ['(prefers-color-scheme: dark)', '(prefers-color-scheme: light)'].map((q) => window.matchMedia(q));
    queries.forEach((q) => q.addEventListener('change', sync));
    return () => queries.forEach((q) => q.removeEventListener('change', sync));
  }, [page, siblingHref]);

  const other = page === 'dark' ? 'light' : 'dark';

  const flip = () => {
    try {
      window.sessionStorage.setItem(THEME_KEY, other);
    } catch {
      /* storage blocked — the switch still moves you, the OS setting wins next load */
    }
    const id = currentSectionId();
    window.location.assign(siblingHref + (id ? `#${id}` : ''));
  };

  const p = `${variant}-switch`;
  return (
    <button type="button" role="switch" aria-checked={page === 'dark'} aria-label="Dark theme" className={p} onClick={flip}>
      <span className={`${p}__icon ${p}__icon--sun`}>
        <Sun />
      </span>
      <span className={`${p}__icon ${p}__icon--moon`}>
        <Moon />
      </span>
      <span className={`${p}__knob`} aria-hidden="true" />
    </button>
  );
}
