'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const sections = [
  {
    label: 'Problem',
    body: "Novatr's flagship course page had strong traffic but weak conversions, and four teams disagreed on why.",
  },
  {
    label: 'Approach',
    body: 'I reframed the goal from improve conversion to understand hesitation, using analytics as an empathy tool instead of a dashboard. The data showed visitors reading deep into the page, then pausing before the form. They were interested, not disengaged.',
  },
  {
    label: 'What changed',
    body: "We reduced pre-form commitment, moved proof closer to the decision point, and shifted the team's shared metric from conversion to form starts.",
  },
  {
    label: 'Outcome',
    body: 'Form starts and conversion both improved. The bigger shift was cultural: marketing, design, sales, and engineering started sharing one language for user behavior, and CRO became an ongoing rhythm instead of a one-off fix.',
  },
  {
    label: 'Reflection',
    body: "I'd build the measurement framework into every landing page from day one, not retrofit it onto the highest-stakes page after the fact. Treating analytics as an empathy tool, not a report, is the instinct I'd install first.",
  },
];

export default function TLDR() {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="tldr">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="tldr-trigger"
        aria-expanded={open}
      >
        Read the 60-second version
        <motion.span
          className="tldr-chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          ↓
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div className="reflection-box tldr-box">
          {sections.map(({ label, body }) => (
            <div key={label} className="tldr-section">
              <p className="tldr-label">{label}</p>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
