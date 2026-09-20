'use client';

import { useEffect, useState } from 'react';
import { THEME_ATTR } from './theme';

// The theme currently on <html>: null until the page has mounted (so server and first client render
// agree), then 'dark' or 'light', following the switch and the operating system as they change it.
export default function useCsTheme() {
  const [theme, setTheme] = useState(null);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute(THEME_ATTR) === 'light' ? 'light' : 'dark');
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: [THEME_ATTR] });
    return () => observer.disconnect();
  }, []);
  return theme;
}
