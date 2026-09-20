'use client';

import VelarisBackground from '@/components/VelarisBackground';
import useCsTheme from '@/components/theme/useCsTheme';

// The hero's moving gradient. Dark uses the site's shader; light uses a soft CSS wash that drifts
// slowly (the shader is built for dark backgrounds and turns muddy on a light one). Until the
// theme is known (first paint) nothing is drawn and the hero's own CSS gradient shows, so there is
// no flash of the wrong backdrop.
export default function HeroBackdrop() {
  const theme = useCsTheme();
  if (theme === 'light') return <div className="ph-wash" />;
  if (theme === 'dark') return <VelarisBackground colors={['#3b82f6', '#2563eb', '#0A1A4F', '#08090A']} bg="#08090A" />;
  return null;
}
