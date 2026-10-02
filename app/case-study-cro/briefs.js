// "In brief" layouts. Scroll is the chosen one (2026-10-02); the rest are kept, out of sight, to compare again:
// ?compare on the URL shows the switcher (BriefSwitch.js), and ?brief= picks a layout. They live in
// BriefOptions.js, but for the image cards (BriefTiles.js).
export const BRIEFS = [
  { id: 'index', name: 'Index + image' },
  { id: 'index-even', name: 'Index · even' },
  { id: 'scroll', name: 'Scroll' },
  { id: 'rows', name: 'Rows' },
  { id: 'top', name: 'Image on top' },
  { id: 'cards', name: 'Image cards' },
];

export const CHOSEN = 'scroll';

export function pickBrief(value) {
  return BRIEFS.some((b) => b.id === value) ? value : CHOSEN;
}
