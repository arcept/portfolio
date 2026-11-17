'use client';

import Behind from './Behind';
import { CASES } from './cases';
import './backdrops.css';

// What sits behind the selected work (Work.js `bg`). The contour lines (Behind.js) are kept as one of
// the choices so they can come back; the others are CSS only (backdrops.css, .wb-*).
//
//   none    — the page's own colour.
//   lines   — the drifting contour lines (the original).
//   dots    — a fine dot grid, fading out towards the section's edges.
//   dots-grain — the dot grid with a film grain over the whole section.
//   aurora  — three slow, heavily blurred pools in the case studies' colours.
//   grain   — a film grain over the page colour, with a soft light from above and darker edges.
//   horizon — one wide light rising from below the cards, and a faint line where it meets the dark.
export const BACKDROPS = [
  { slug: 'none', name: 'None' },
  { slug: 'lines', name: 'Lines (original)' },
  { slug: 'dots', name: 'Dot grid' },
  { slug: 'dots-grain', name: 'Dot grid + grain' },
  { slug: 'aurora', name: 'Aurora' },
  { slug: 'grain', name: 'Grain' },
  { slug: 'horizon', name: 'Horizon' },
];

export default function Backdrop({ kind = 'none' }) {
  if (kind === 'none') return null;
  if (kind === 'lines') return <Behind />;
  if (kind === 'dots-grain')
    return (
      <>
        <div className="wb wb--dots" aria-hidden="true" />
        <div className="wb wb--grain-only" aria-hidden="true">
          <Noise />
        </div>
      </>
    );
  return (
    <div className={`wb wb--${kind}`} aria-hidden="true">
      {kind === 'aurora' &&
        CASES.map((w, i) => <span key={w.slug} className="wb__pool" style={{ '--accent': w.accent, '--i': i }} />)}
      {kind === 'grain' && <Noise />}
      {kind === 'horizon' && <span className="wb__line" />}
    </div>
  );
}

// A film grain: fractal noise, desaturated, laid over the section (backdrops.css sets its strength).
function Noise() {
  return (
    <svg className="wb__noise" width="100%" height="100%">
      <filter id="wb-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#wb-noise)" />
    </svg>
  );
}
