'use client';

import VelarisBackground from '@/components/VelarisBackground';
import useCsTheme from '@/components/theme/useCsTheme';

// The hero's moving gradient. Dark uses the site's shader in the case study's colours; light uses a
// soft CSS wash that drifts slowly (the shader is built for dark backgrounds and turns muddy on a
// light one — the wash takes its colours from --ph-wash-a / --ph-wash-b, see hero.css). Until the
// theme is known (first paint) nothing is drawn and the hero's own CSS gradient shows, so there is no
// flash of the wrong backdrop.
//
// colors: the shader's four colours, brightest first, ending in the page background.
const BLUE = ['#3b82f6', '#2563eb', '#0A1A4F', '#08090A'];

export default function HeroBackdrop({ colors = BLUE }) {
  const theme = useCsTheme();
  if (theme === 'light') return <div className="ph-wash" />;
  if (theme === 'dark') return <VelarisBackground colors={colors} bg={colors[colors.length - 1]} />;
  return null;
}
