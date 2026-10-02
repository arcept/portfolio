'use client';

import { useEffect, useRef, useState } from 'react';

// The article's contents nav, played by the scroll. The reading point is the middle of the window:
// the chapter it's in is the active one, and how far through that chapter it is (0 to 1) moves the nav on
// continuously rather than in jumps.
//
// The list is magnified around the reading point, as a dock is: the entry being read largest and at full
// strength, its neighbours a step down, the rest smaller and at no less than 50%, the magnification gliding
// between them. Beside it, a
// thin rail fills as you read, one gradient from the top to a glowing leading edge. Entries carry the
// chapters' short nav labels.
//
// On wide screens it stops in the middle of the window; under 900px it is a strip across the top, the active
// entry underlined by its progress and scrolled into view.

const ROW = 40; // each entry's height on wide screens (cro-nav.css)

const clamp = (v) => Math.min(1, Math.max(0, v));

export default function ChapterNav({ chapters }) {
  const root = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    const sections = chapters.map((c) => document.getElementById(c.id));
    const entries = [...el.querySelectorAll('[data-entry]')];
    const stripEntries = [...el.querySelectorAll('[data-strip-entry]')];
    const strip = el.querySelector('[data-strip]');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    let spans = [];
    const measure = () => {
      spans = sections.map((s) => {
        const r = s.getBoundingClientRect();
        return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
      });
    };

    let current = -1;
    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.5;
      let i = 0;
      spans.forEach((s, k) => {
        if (line >= s.top) i = k;
      });
      const progress = spans.map((s) => clamp((line - s.top) / (s.bottom - s.top)));
      const at = i + progress[i];

      // The lens: each entry scaled, brightened and nudged by its distance from the reading point.
      entries.forEach((entry, k) => {
        const d = at - (k + 0.5);
        const f = Math.exp(-(d * d) / 0.7);
        entry.style.setProperty('--s', (1 + 0.4 * f).toFixed(3));
        // Strength between 50% and full: full for the chapter being read, the rest by their distance from it.
        entry.style.setProperty('--o', k === i ? '1' : (0.5 + 0.5 * f).toFixed(3));
        entry.style.setProperty('--x', (8 * f).toFixed(2));
      });
      stripEntries.forEach((entry, k) => entry.style.setProperty('--p', progress[k].toFixed(3)));
      el.style.setProperty('--fill', at.toFixed(3));

      if (i !== current) {
        current = i;
        setActive(i);
        const item = stripEntries[i];
        if (strip && item && strip.scrollWidth > strip.clientWidth) {
          strip.scrollTo({ left: item.offsetLeft - 16, behavior: still.matches ? 'auto' : 'smooth' });
        }
      }
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    const onResize = () => {
      measure();
      update();
    };
    measure();
    update();
    const ro = new ResizeObserver(onResize);
    sections.forEach((s) => ro.observe(s));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [chapters]);

  const go = (e, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
  };

  const state = (k) => (k === active ? ' is-active' : k < active ? ' is-past' : '');

  return (
    <nav ref={root} className="cro-nav" aria-label="Case study sections" style={{ '--n': chapters.length, '--row': `${ROW}px` }}>
      <div className="cro-nav__list">
        <span className="cro-nav__track" aria-hidden="true">
          <span className="cro-nav__progress" />
        </span>
        {chapters.map((ch, k) => (
          <a
            key={ch.id}
            href={`#${ch.id}`}
            data-entry
            className={`cro-nav__entry${state(k)}`}
            aria-current={k === active ? 'location' : undefined}
            onClick={(e) => go(e, ch.id)}
          >
            <span className="cro-nav__label">
              <span className="cro-nav__num">{ch.number}</span>
              {ch.navLabel ?? ch.name}
            </span>
          </a>
        ))}
      </div>

      <div className="cro-nav__strip" data-strip>
        {chapters.map((ch, k) => (
          <a
            key={ch.id}
            href={`#${ch.id}`}
            data-strip-entry
            className={`cro-nav__chip${state(k)}`}
            aria-current={k === active ? 'location' : undefined}
            onClick={(e) => go(e, ch.id)}
          >
            <span className="cro-nav__num">{ch.number}</span>
            {ch.navLabel ?? ch.name}
            <span className="cro-nav__underline" aria-hidden="true" />
          </a>
        ))}
      </div>
    </nav>
  );
}
