'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// Mobile-only body clamp height — a natural top-down trim (whatever content
// falls within this many pixels, text or embed or mid-image, stays visible)
// rather than curating which blocks are "allowed" to show while collapsed.
// Landed on 820px after checking it against every section: long ones
// (System, five-plus embeds) land close to the 15-20%-of-full-length the
// brief asked for, and short ones (Leading It) mostly clear the 700-1000px
// floor without needing much trimming at all — either way nothing here
// hides a live embed on purpose or shows one on purpose; it's just wherever
// 820px of the section's real content happens to land.
const BODY_CLAMP_PX = 820;

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
  children,
}) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shouldReduceMotion = mounted && prefersReducedMotion;

  const [questionsExpanded, setQuestionsExpanded] = useState(false);
  const [bodyExpanded, setBodyExpanded] = useState(false);

  // Whether this section's content is even tall enough to need clamping —
  // measured against the real DOM height (scrollHeight keeps reporting the
  // full height even while CSS is clamping it), not curated per section, so
  // a short section (e.g. Decisions) simply never grows a "See more" button.
  const bodyContentRef = useRef(null);
  const [needsClamp, setNeedsClamp] = useState(false);
  useEffect(() => {
    const el = bodyContentRef.current;
    if (!el) return undefined;
    const check = () => setNeedsClamp(el.scrollHeight > BODY_CLAMP_PX);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

      <div ref={bodyContentRef} className="cs-article-body-content" data-clamp={needsClamp && !bodyExpanded ? 'true' : undefined}>
        {children}
      </div>

      {needsClamp && (
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
