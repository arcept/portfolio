'use client';

import { useEffect, useState } from 'react';
import { ABT_ATTR } from '@/app/about/theme';
import { THEME_ATTR } from '@/components/theme/theme';

// The page's current theme, following the switch: the homepage's attribute or a case study's (the same
// site theme, on the attribute each page's CSS keys off). 'dark' until mounted, so the server and the
// first client render agree.
export default function useTheme() {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute(ABT_ATTR) === 'light' || root.getAttribute(THEME_ATTR) === 'light' ? 'light' : 'dark');
    read();
    const watcher = new MutationObserver(read);
    watcher.observe(root, { attributes: true, attributeFilter: [ABT_ATTR, THEME_ATTR] });
    return () => watcher.disconnect();
  }, []);
  return theme;
}
