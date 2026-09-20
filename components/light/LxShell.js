'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import { DARK_PAGE } from '@/components/theme/theme';
import { EASE, useReduce } from './LxMotion';

// The page wrapper: the fixed header (with the theme switch, which flips to the dark version of
// the case study), the scroll-progress line, and the section rail.
export default function LxShell({ sections, fontClass = '', children }) {
  const [activeId, setActiveId] = useState(null);
  const reduce = useReduce();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const targets = sections.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveId(entry.target.id)),
      { rootMargin: '-38% 0px -58% 0px', threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const go = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const activeIndex = sections.findIndex((s) => s.id === activeId);
  const active = activeIndex >= 0 ? sections[activeIndex] : null;

  return (
    <div className={`lx ${fontClass}`.trim()}>
      <header className="lx-bar">
        <div className="lx-bar__inner">
          <a href="/" className="lx-bar__back">
            <span aria-hidden="true">←</span> All work
          </a>

          <div className="lx-bar__where" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active ? active.id : 'intro'}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {active ? (
                  <>
                    <b>{String(activeIndex + 1).padStart(2, '0')}</b> {active.label}
                  </>
                ) : (
                  'Placement Hub · Case study'
                )}
              </motion.span>
            </AnimatePresence>
          </div>

          <ThemeSwitch page="light" siblingHref={DARK_PAGE} variant="lx" />
        </div>
        <motion.div className="lx-progress" style={{ scaleX: progress }} aria-hidden="true" />
      </header>

      <nav className="lx-rail" aria-label="Case study sections">
        {sections.map(({ id, label }, i) => (
          <a key={id} href={`#${id}`} className={`lx-rail__link${activeId === id ? ' is-active' : ''}`} onClick={(e) => go(e, id)}>
            <span className="lx-rail__label">{label}</span>
            <span className="lx-rail__num">{String(i + 1).padStart(2, '0')}</span>
          </a>
        ))}
      </nav>

      {children}
    </div>
  );
}
