'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];

// Same SSR guard as components/Reveal.js: the server always renders the animated branch, so the
// first client render must match it even when the OS has reduced motion on. Only after mount do
// we let the preference switch every effect off.
export function useReduce() {
  const prefers = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && prefers;
}

// Generic scroll-in: rises, un-blurs and fades as it enters the viewport. Every block in a
// section is wrapped in one of these, so a section assembles itself as you read down it.
export function Reveal({ children, className, delay = 0, y = 28, blur = 5 }) {
  const reduce = useReduce();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function Word({ children, progress, range, floor }) {
  const opacity = useTransform(progress, range, [floor, 1]);
  return (
    <motion.span style={{ opacity }} className="lx-word">
      {children}{' '}
    </motion.span>
  );
}

// Text whose words light up one after another, scrubbed to scroll position — the words you have
// scrolled past are at full contrast, the ones still to come are dim. Used for the sentences
// that carry the argument, so reading and scrolling become the same gesture.
function ScrollText({ text, className, floor = 0.16, italic = false }) {
  const ref = useRef(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] });
  const words = text.split(/\s+/).filter(Boolean);
  if (reduce) return <p className={className}>{text}</p>;
  return (
    <p ref={ref} className={className} data-italic={italic || undefined}>
      {words.map((word, i) => (
        <Word key={`${word}-${i}`} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 1.6) / words.length)]} floor={floor}>
          {word}
        </Word>
      ))}
    </p>
  );
}

export function Statement({ children }) {
  return <ScrollText className="lx-statement" text={String(children)} />;
}
Statement.lxSelfReveal = true;

export function Quote({ children }) {
  const reduce = useReduce();
  return (
    <blockquote className="lx-quote">
      <motion.span
        aria-hidden="true"
        className="lx-quote__rule"
        initial={reduce ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <ScrollText className="lx-quote__text" text={String(children)} floor={0.28} italic />
    </blockquote>
  );
}
Quote.lxSelfReveal = true;

// A heading whose words slide up out of a mask, staggered.
export function MaskText({ text, as: Tag = 'h2', className, delay = 0, immediate = false }) {
  const reduce = useReduce();
  const words = text.split(' ');
  if (reduce) return <Tag className={className}>{text}</Tag>;
  const trigger = immediate
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } };
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="lx-mask" aria-hidden="true">
            <motion.span
              className="lx-mask__inner"
              initial={{ y: '112%' }}
              variants={{ show: { y: '0%' } }}
              {...trigger}
              transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.045 }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

// Counts up to a number once it scrolls into view.
export function Count({ to, decimals = 0, prefix = '', suffix = '', duration = 1.5 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const reduce = useReduce();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setValue(to);
      return undefined;
    }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: setValue });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} className="lx-count">
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Drifts its child against the scroll, inside an overflow-hidden frame.
export function Parallax({ children, className, distance = 36, scale = 1.08 }) {
  const ref = useRef(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y, scale }} className="lx-parallax__inner">
        {children}
      </motion.div>
    </div>
  );
}

export { EASE };
