'use client';

import { useSearchParams } from 'next/navigation';
import { HERO_FONTS } from './fonts';
import HeroTracker from './HeroTracker';
import HeroRail from './HeroRail';
import HeroBox from './HeroBox';
import './hero-options.css';

// The hero, and three new ones to compare with it (2026-10-03), inspired by the CRO case study's. The current
// hero (`children`) stays the default and the one in the page's HTML; the others show in the browser only:
// ?hero= picks one, and ?compare pins a switcher between them to the window.
//   tracker  Fraunces, the product's blue: a collage of the portal's pieces, an application moving through it
//   rail     the page's grotesk with a Newsreader turn, green, on a blueprint grid: the journey as one line
//   box      Instrument Serif, amber, in grain: the learner's questions in a black box, answered as it clears
// `facts` and `actions` are the current hero's, handed in so all four carry the same ones.

export const HEROES = [
  { id: 'current', name: 'Current' },
  { id: 'tracker', name: 'Tracker', Hero: HeroTracker },
  { id: 'rail', name: 'Rail', Hero: HeroRail },
  { id: 'box', name: 'Box', Hero: HeroBox },
];

function HeroSwitch({ current }) {
  return (
    <nav className="phx-dirs" aria-label="Hero layout">
      <span className="phx-dirs__label">Hero</span>
      {HEROES.map(({ id, name }, i) => (
        <a key={id} href={`?compare&hero=${id}`} className="phx-dirs__opt" aria-current={current === id ? 'page' : undefined}>
          <span className="phx-dirs__id">{i === 0 ? '0' : String.fromCharCode(64 + i)}</span>
          {name}
        </a>
      ))}
    </nav>
  );
}

export default function HeroOptions({ children, facts, actions, fontVars }) {
  const params = useSearchParams();
  const chosen = HEROES.find((h) => h.id === params.get('hero')) ?? HEROES[0];
  const { Hero } = chosen;
  return (
    <>
      {params.has('compare') && <HeroSwitch current={chosen.id} />}
      {Hero ? (
        <div className={`phx ${HERO_FONTS} ${fontVars}`}>
          <Hero facts={facts} actions={actions} />
        </div>
      ) : (
        children
      )}
    </>
  );
}
