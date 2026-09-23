'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import AboutLink from './AboutLink';
import HoverPortrait, { StaticPortrait } from './HoverPortrait';

// The headline is authored as lines rather than measured, so each one can be masked and released on
// its own. The type is sized so these lines hold at every width (see .abt-display in about.css).
const HEADLINE = ['I design products,', 'systems, and the conditions', 'for good design to happen.'];

const CONTEXT = [
  'I have lived, studied, and worked in India and Italy, and spent time studying in Santa Fe, New Mexico. Working across countries, cultures, and disciplines changed more than my understanding of design. It changed the number of perspectives I could imagine.',
  'Today I am most useful when a problem is complicated, the system is difficult to see, and another feature is unlikely to fix it. I ask questions, look for the problem beneath the request, and try to make the complexity understandable enough for a team to act.',
  'The tools keep changing. Photoshop became After Effects. Static screens became prototypes. Prototypes became systems. AI is now helping me move from an interface to a functioning product. The tools matter, but they are still tools. What has stayed with me is the ability to notice, question, connect, simplify, and make.',
];

const EASE = [0.16, 1, 0.3, 1];

// Set this to '/about/manik-madaan-resume.pdf' once that file is in public/about/. Until then the
// action is listed but does nothing, rather than offering a download that 404s.
const RESUME = null;

// Reduced motion is handled once, by AboutMotion — these describe the full animation.
const rise = (delay) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1, ease: EASE, delay },
});

// The stickers: placed by CSS, popped in on a spring. Decorative, so they are hidden from assistive
// technology and never take the pointer.
function Sticker({ className, src, width, height, delay }) {
  return (
    <motion.span
      className={`abt-sticker ${className}`}
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay }}
    >
      <img src={src} alt="" width={width} height={height} />
    </motion.span>
  );
}

export default function Opening() {
  const section = useRef(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] });

  // The headline leaves slowly and the columns leave at their own rate, so the opening pulls apart as
  // it goes rather than sliding away as one slab.
  const headY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const headOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);
  const bodyY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

  return (
    <section className="abt-opening" id="opening" ref={section} aria-labelledby="abt-opening-title">
      <motion.div className="abt-opening__head" style={{ y: headY, opacity: headOpacity }}>
        <motion.p className="abt-label" {...rise(0.05)}>
          <span className="abt-label__index">01</span>
          <motion.span
            className="abt-label__rule"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
          />
          <span>About</span>
        </motion.p>

        <Sticker className="abt-sticker--craft" src="/about/stickers/craft.svg" width={108} height={51} delay={0.95} />

        <h1 className="abt-display" id="abt-opening-title">
          {HEADLINE.map((line, i) => (
            <span className="abt-display__mask" key={line}>
              <motion.span
                className="abt-display__line"
                initial={{ y: '110%', opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.25, ease: EASE, delay: 0.18 + i * 0.13 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
      </motion.div>

      <motion.div className="abt-opening__body" style={{ y: bodyY }}>
        <div className="abt-opening__lead">
          {/* Only the sentences carry the photograph — not the actions or the space around them. */}
          <HoverPortrait>
            <motion.p className="abt-lead" {...rise(0.62)}>
              I am Manik Madaan, a product design leader based in Delhi NCR. For more than a decade, I have worked across
              freelance practice, design studios, agencies, startups, consulting, digital products, and design leadership.
            </motion.p>
          </HoverPortrait>

          <motion.div className="abt-actions" {...rise(0.74)}>
            <AboutLink href="/#work">View selected work</AboutLink>
            {/* No destination yet: contact gets its own page. */}
            <AboutLink>Contact me</AboutLink>
            <AboutLink href={RESUME} arrow="↓" download={RESUME ? '' : undefined}>
              Download résumé
            </AboutLink>
          </motion.div>

          <Sticker className="abt-sticker--heart" src="/about/stickers/heart.png" width={194} height={154} delay={1.1} />

          <StaticPortrait />
        </div>

        <div className="abt-opening__context">
          {CONTEXT.map((paragraph, i) => (
            <motion.p key={paragraph.slice(0, 24)} {...rise(0.7 + i * 0.1)}>
              {paragraph}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
