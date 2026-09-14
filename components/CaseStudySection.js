'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// Shared by SeeMore below — lets non-contiguous collapsible chunks inside a
// single section (extra paragraphs here, a pull-quote there) all react to
// the same "See more" toggle without threading state through page.js.
const SeeMoreContext = createContext({ expanded: false });

// Wrap any part of a section's body that should hide behind "See more" on
// mobile (desktop always shows everything — there's room, via the sticky
// sidebar layout). Content stays in the DOM either way, just visually
// hidden via CSS, so nothing here removes it from the page for SEO or a
// screen reader with CSS disabled.
export function SeeMore({ children }) {
  const { expanded } = useContext(SeeMoreContext);
  return (
    <div className="cs-article-more" data-collapsed={expanded ? undefined : 'true'}>
      {children}
    </div>
  );
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="cs-article-see-more__chevron"
      style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Shared by SkillsQuestions — a small "+"/"−" toggle button (24px per
// Figma), mobile-only. Desktop hides the button and force-shows the
// questions panel via CSS regardless of this state.
function ToggleGlyph({ expanded }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: expanded ? 0 : 1 }} />
      <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Same SSR/reduced-motion mismatch guard as Reveal.js: the server always
// renders the motion.section branch, so the client's first paint has to
// match it exactly, even when the OS has reduced motion on — otherwise
// React gets stuck on the opacity: 0 hidden state. The section fades/rises
// in, scrubbed directly to scroll position rather than a fixed-duration
// timer — it reads as abrupt otherwise: a fast scroll covers a lot of
// distance inside a short wall-clock animation, so a time-based fade
// barely gets going before it's already done.
export default function CaseStudySection({
  id,
  number,
  eyebrow,
  category,
  questions,
  heading,
  hasMore = false,
  children,
}) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shouldReduceMotion = mounted && prefersReducedMotion;

  const [questionsExpanded, setQuestionsExpanded] = useState(false);
  const [bodyExpanded, setBodyExpanded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 50%'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [16, 0]);

  const marginalia = (
    <div className="cs-article-marginalia">
      <div className="cs-article-marginalia__head">
        <p className="cs-article-marginalia__category">{category}</p>
        <button
          type="button"
          className="cs-article-marginalia__toggle"
          aria-expanded={questionsExpanded}
          aria-label={questionsExpanded ? 'Hide questions' : 'Show questions'}
          onClick={() => setQuestionsExpanded((v) => !v)}
        >
          <ToggleGlyph expanded={questionsExpanded} />
        </button>
      </div>
      <div className="cs-article-marginalia__questions" data-collapsed={questionsExpanded ? undefined : 'true'}>
        <p className="cs-article-marginalia__label">Questions</p>
        {questions.map((question) => (
          <p key={question} className="cs-article-marginalia__question">
            {question}
          </p>
        ))}
      </div>
    </div>
  );

  const body = (
    <div className="cs-article-body">
      <div className="cs-article-heading-group">
        <div className="cs-article-number">
          <span className="cs-article-number__index">{number}</span>
          <span className="cs-article-number__label">{eyebrow}</span>
        </div>
        <h2 className="cs-article-heading">{heading}</h2>
      </div>

      <SeeMoreContext.Provider value={{ expanded: bodyExpanded }}>{children}</SeeMoreContext.Provider>

      {hasMore && (
        <button
          type="button"
          className="cs-article-see-more"
          aria-expanded={bodyExpanded}
          onClick={() => setBodyExpanded((v) => !v)}
        >
          {bodyExpanded ? 'See less' : 'See more'}
          <ChevronIcon expanded={bodyExpanded} />
        </button>
      )}
    </div>
  );

  if (shouldReduceMotion) {
    return (
      <section className="cs-article-section" id={id}>
        {marginalia}
        {body}
      </section>
    );
  }

  return (
    <motion.section ref={ref} className="cs-article-section" id={id} style={{ opacity, y }}>
      {marginalia}
      {body}
    </motion.section>
  );
}
