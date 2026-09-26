'use client';

import AnimatedThemeSwitch from './AnimatedThemeSwitch';
import { THEME_ATTR, THEME_KEY, resolveTheme } from './theme';
import { useT } from '@/components/i18n/LangProvider';

// The case studies' theme switch: the site's switch, driving the case studies' theme (see theme.js).
export default function ThemeSwitch() {
  const t = useT();
  return <AnimatedThemeSwitch attr={THEME_ATTR} storageKey={THEME_KEY} resolve={resolveTheme} page="case-study" label={t('ui.darkTheme', 'Dark theme')} />;
}
