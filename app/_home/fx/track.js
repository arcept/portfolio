// Which part of the homepage is at the middle of the screen, measured fresh every frame from the page
// itself, for the cursor's colour (cursor.js).
//
// The page's sections are its stops: the hero's portrait, the Statement (its ruler marker, which stays
// put while the Statement pins, so everything is measured on screen), Selected Work (three points down
// the section) and the avatar in About. Between two stops the colour eases from one to the next.

const FOCUS = 0.5; // the line it reads at, as a share of the screen's height

const visible = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width && r.height ? r : null;
};

const stop = (kind, r) => ({ kind, cy: r.top + r.height / 2 });

// The stops, top to bottom, as screen positions.
export function measureStops() {
  const stops = [];
  const hero = visible(document.querySelector('.hx-i-portrait-scale')) || visible(document.querySelector('.hx-i-hero'));
  if (hero) stops.push(stop('hero', hero));

  const statement = visible(document.querySelector('.hx-st__marker')) || visible(document.querySelector('.hx-st'));
  if (statement) stops.push(stop('statement', statement));

  const work = visible(document.getElementById('work'));
  if (work) {
    for (let i = 0; i < 3; i += 1) stops.push({ kind: 'work', cy: work.top + work.height * (0.25 + i * 0.25) });
  }

  const about = visible(document.querySelector('.hx-me__avatar')) || visible(document.getElementById('about'));
  if (about) stops.push(stop('about', about));
  return stops;
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Which pair of stops the middle of the screen is between (`seg`), and how far (`hold`, 0..1, eased so
// the colour settles on each section and changes between them).
export function between(stops, vh) {
  const f = vh * FOCUS;
  const n = stops.length;
  if (!n) return null;
  let i = -1;
  for (let k = 0; k < n; k += 1) if (stops[k].cy <= f) i = k;
  if (i < 0) return { seg: 0, hold: 0 };
  if (i >= n - 1) return { seg: n - 1, hold: 0 };
  const t = (f - stops[i].cy) / Math.max(1, stops[i + 1].cy - stops[i].cy);
  return { seg: i, hold: smooth(0.2, 0.8, t) };
}
