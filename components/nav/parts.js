'use client';

import { useEffect, useState } from 'react';

// The site nav's parts (Nav.js): its links and icons, the scroll state, and the tone of what is under the nav.

// The site's pages, for both navs: add one here and it shows in the capsule, the dock and the phone menu (which
// also wants a picture for it, in MobileMenu.js, and the dock an icon, below). `note` is its line in the phone menu.
export const PAGES = [
  { label: 'Work', href: '/#work', note: 'Selected case studies', match: (p) => p === '/' || p.startsWith('/case-study') },
  { label: 'About', href: '/about', note: 'The person behind them', match: (p) => p.startsWith('/about') },
  { label: 'Contact', href: '/contact', note: 'Say hello', match: (p) => p.startsWith('/contact') },
];



// The dock's icons, by label (24px grid, stroked).
export const ICONS = {
  Home: (
    <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />
  ),
  Work: (
    <>
      <rect x="4" y="7.5" width="16" height="12" rx="2" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M4 12.5h16" />
    </>
  ),
  About: (
    <>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 19.5c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" />
    </>
  ),
  Contact: (
    <>
      <rect x="3.5" y="6" width="17" height="12.5" rx="2" />
      <path d="m4.5 7.5 7.5 6 7.5-6" />
    </>
  ),
};

// The dock's items: home, then the pages (there, Work is lit on a case study; the home page is Home's).
export const ITEMS = [
  { label: 'Home', href: '/', match: (p) => p === '/' },
  ...PAGES.map((p) => (p.label === 'Work' ? { ...p, match: (q) => q.startsWith('/case-study') } : p)),
];

export function usePath() {
  const [path, setPath] = useState('');
  useEffect(() => setPath(window.location.pathname.replace(/\/$/, '') || '/'), []);
  return path;
}

export function isActive(link, path) {
  return Boolean(path) && link.match(path);
}

// How far the page has scrolled, and how far through it the reader is.
export function useScroll() {
  const [state, setState] = useState({ y: 0, progress: 0 });
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({ y, progress: max > 0 ? Math.min(1, y / max) : 0 });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return state;
}

// Whether what sits under the bar is light or dark, so the bar can flip its ink section by section (and with the
// page's own theme). Reads the background colour behind a few points along the bar: the first solid colour among
// the element under each point and its ancestors.
function parse(c) {
  const m = c && c.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r, g, b, a };
}

function luminance({ r, g, b }) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function colourAt(x, y, skip) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (skip.some((s) => s && s.contains(el))) continue;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    break;
  }
  return parse(getComputedStyle(document.body).backgroundColor) || parse(getComputedStyle(document.documentElement).backgroundColor) || { r: 8, g: 9, b: 10 };
}

export function useTone(ref, { y: atY } = {}) {
  const [tone, setTone] = useState('dark');
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const y = atY != null ? atY() : Math.max(1, box.top + box.height / 2);
      const skip = [el];
      const xs = [0.2, 0.5, 0.8].map((f) => box.left + box.width * f);
      const lights = xs.map((x) => luminance(colourAt(x, Math.min(window.innerHeight - 1, y), skip)) > 0.4).filter(Boolean).length;
      setTone(lights >= 2 ? 'light' : 'dark');
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    const timers = [200, 800, 2000].map((ms) => setTimeout(schedule, ms));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const watch = new MutationObserver(() => setTimeout(schedule, 60));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-cs-theme', 'data-theme', 'class', 'style'] });
    watch.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      watch.disconnect();
    };
  }, [ref, atY]);
  return tone;
}


export function Star({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C12.6 6.6 17.4 11.4 24 12 17.4 12.6 12.6 17.4 12 24 11.4 17.4 6.6 12.6 0 12 6.6 11.4 11.4 6.6 12 0Z" />
    </svg>
  );
}
