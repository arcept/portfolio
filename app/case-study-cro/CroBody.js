'use client';

import HeroCollage from './HeroCollage';
import BriefTiles from './BriefTiles';
import { BriefIndexEven, BriefIndexImage, BriefRows, BriefScroll, BriefTop } from './BriefOptions';
import { Article } from './Chapter';
import BriefSwitch from './BriefSwitch';
import { CONTEXT, LASTING_CHANGE, LOOKING_BACK, OBSERVED, PRACTICE, PROVING_GROUND } from './content';
import { useSearchParams } from 'next/navigation';
import { pickBrief } from './briefs';

// The case study's body: the hero, the five-beat summary (Scroll, unless ?brief= picks another; ?compare shows
// the switcher, briefs.js), then the article, chapter by chapter.
//
// The collage's pieces (public/case-study-cro/hero-01-*) are cut from a placeholder illustration until
// its layered files arrive: the laptop's form still shows a typed name.

const CHAPTERS = [CONTEXT, PRACTICE, PROVING_GROUND, OBSERVED, LASTING_CHANGE, LOOKING_BACK];

const BRIEF_LAYOUTS = { index: BriefIndexImage, 'index-even': BriefIndexEven, scroll: BriefScroll, rows: BriefRows, top: BriefTop, cards: BriefTiles };

export default function CroBody() {
  const params = useSearchParams();
  const brief = pickBrief(params.get('brief'));
  const compare = params.has('compare');
  const TheBrief = BRIEF_LAYOUTS[brief];
  return (
    <>
      <HeroCollage />
      <main className="cro-main">
        <TheBrief />
        <Article chapters={CHAPTERS} />
      </main>
      {compare && <BriefSwitch current={brief} />}
    </>
  );
}
