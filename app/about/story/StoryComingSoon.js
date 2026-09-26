'use client';

import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1];

const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1, ease: EASE, delay },
});

// Until the Story is written: what it will hold, and the way back.
export default function StoryComingSoon() {
  return (
    <main className="story-soon">
      <motion.p className="abt-label" {...enter(0.1)}>
        <span className="abt-label__index">Story</span>
        <motion.span
          className="abt-label__rule"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        />
        <span>Coming soon</span>
      </motion.p>
      <motion.h1 className="story-soon__title" {...enter(0.2)}>
        The longer version
        <br />
        is still being written.
      </motion.h1>
      <motion.p className="story-soon__lead" {...enter(0.32)}>
        This is where the rest will live: how I became a designer, how I think, how I lead and where I fell short, and why I stepped away. It is not ready
        yet. Until it is, the About page has the short version.
      </motion.p>
      <motion.div className="story-soon__actions" {...enter(0.44)}>
        <a href="/about" className="story-soon__btn">
          <span aria-hidden="true">←</span> Back to About
        </a>
        <a href="/#work" className="story-soon__link">
          Show me the work <span aria-hidden="true">↗</span>
        </a>
      </motion.div>
    </main>
  );
}
