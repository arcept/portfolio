'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// Shared shape for the redesigned OMS case study body: a numbered eyebrow,
// a sticky "Skills & Questions" marginalia column, a heading, and freeform
// body content (paragraphs, statements, image slots) as children. The
// section fades/rises in, scrubbed directly to scroll position rather than
// a fixed-duration timer — it reads as abrupt otherwise: a fast scroll
// covers a lot of distance inside a short wall-clock animation, so a
// time-based fade barely gets going before it's already done.
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
  // Same SSR/reduced-motion mismatch guard as Reveal.js: the server always
  // renders the motion.section branch, so the client's first paint has to
  // match it exactly, even when the OS has reduced motion on — otherwise
  // React gets stuck on the opacity: 0 hidden state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shouldReduceMotion = mounted && prefersReducedMotion;

  // Progress 0 -> the section's top is at the viewport's bottom edge (just
  // arriving). Progress 1 -> the section's top has scrolled up to 50% down
  // from the viewport's top edge. Fully scrubbed: opacity tracks whatever
  // this value is at any given scroll position, forwards or backwards.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 50%'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [16, 0]);

  const marginalia = (
    <div className="cs-article-marginalia">
      <p className="cs-article-marginalia__category">{category}</p>
      <p className="cs-article-marginalia__label">Questions</p>
      {questions.map((question) => (
        <p key={question} className="cs-article-marginalia__question">
          {question}
        </p>
      ))}
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

      {children}
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
