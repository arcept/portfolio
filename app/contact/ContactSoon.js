'use client';

import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1];

const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1, ease: EASE, delay },
});

// Until the contact page is built: the ways to get in touch that work now, and the way back.
export default function ContactSoon() {
  return (
    <main className="contact-soon">
      <motion.p className="abt-label" {...enter(0.1)}>
        <span className="abt-label__index">Contact</span>
        <motion.span
          className="abt-label__rule"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        />
        <span>Coming soon</span>
      </motion.p>
      <motion.h1 className="contact-soon__title" {...enter(0.2)}>
        A proper contact page
        <br />
        is on its way.
      </motion.h1>
      <motion.p className="contact-soon__lead" {...enter(0.32)}>
        Until it is here, email is the quickest way to reach me, and LinkedIn works too.
      </motion.p>
      <motion.div className="contact-soon__actions" {...enter(0.44)}>
        <a href="mailto:contact@arcept.in" className="contact-soon__btn">
          contact@arcept.in <span aria-hidden="true">↗</span>
        </a>
        <a href="https://www.linkedin.com/in/manikmadaan/" className="contact-soon__link" target="_blank" rel="noopener noreferrer">
          LinkedIn <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href="/" className="contact-soon__link">
          Back to the homepage
        </a>
      </motion.div>
    </main>
  );
}
