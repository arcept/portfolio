'use client';

import AnimatedThemeSwitch from '@/components/theme/AnimatedThemeSwitch';
import { ABT_ATTR, ABT_KEY, MOBILE_QUERY, resolveTheme } from './theme';

// The About page's theme switch: the site's switch, driving the About page's own theme (see theme.js).
export default function AboutThemeSwitch() {
  return <AnimatedThemeSwitch attr={ABT_ATTR} storageKey={ABT_KEY} resolve={resolveTheme} follow={[MOBILE_QUERY]} page="about" />;
}
