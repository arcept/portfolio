'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// The margin rail: a full-height sticky column, so the index keeps its place near the top while the
// way back up sits at the foot of the viewport, out of the reading.
export default function AboutIndex({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);
  const [away, setAway] = useState(false); // scrolled far enough that "back to top" is worth offering

  useEffect(() => {
    const nodes = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!nodes.length) return undefined;
    // The section covering the upper third of the viewport is the one being read.
    const watcher = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    nodes.forEach((node) => watcher.observe(node));
    return () => watcher.disconnect();
  }, [sections]);

  useEffect(() => {
    const onScroll = () => setAway(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div className="abt-rail">
      <nav className="abt-index" aria-label="Sections">
        <ol>
          {sections.map((section, i) => {
            const current = section.id === active;
            return (
              <li key={section.id}>
                <a href={`#${section.id}`} className="abt-index__link" aria-current={current ? 'true' : undefined}>
                  <span className="abt-index__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="abt-index__label">{section.label}</span>
                  {current && (
                    <motion.span
                      className="abt-index__marker"
                      aria-hidden="true"
                      layoutId="abt-index-marker"
                      transition={{ type: 'spring', stiffness: 460, damping: 38 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <button type="button" className="abt-totop" onClick={toTop} data-away={away || undefined}>
        <span className="abt-totop__arrow" aria-hidden="true">↑</span>
        <span>Back to top</span>
      </button>
    </div>
  );
}
