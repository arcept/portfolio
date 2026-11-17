'use client';

import Work from './Work';
import { Bento } from './WorkVariants';
import { TipStyle } from './Tip';

// The homepage's selected work, as chosen in the work lab (2026-11-17): the bento on a wide screen,
// on the page's own colour (the film grain was taken off; bg="grain" brings it back), with the case studies still being written folded into it, and the pill-and-arrow
// tooltip on hover. Phones keep the carousel.
export default function SelectedWork() {
  return (
    <TipStyle.Provider value="arrow">
      <Work Wide={Bento} bg="none" foldMore />
    </TipStyle.Provider>
  );
}
