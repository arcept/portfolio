'use client';

import { motion } from 'motion/react';
import LensesIntro from './LensesIntro';
import Principles from './Principles';

// Section 02. The intro and the books, then six lenses argued as three principles — an index on
// wide screens, a deck of cards on phones (see Principles.js). The copy lives in lenses-content.js.

const EASE = [0.16, 1, 0.3, 1];

export default function Lenses() {
  return (
    <section className="abt-lenses" id="how-i-work" aria-labelledby="abt-lenses-title">
      <LensesIntro />

      <Principles />

      <motion.p
        className="abt-source"
        initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        The six-part structure and the principle titles are drawn from Irene Pereyra’s <em>Universal Principles of UX</em>.
        The interpretations and applications are my own.
      </motion.p>
    </section>
  );
}
