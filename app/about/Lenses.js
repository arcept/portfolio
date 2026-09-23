'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import AboutLink from './AboutLink';

// Section 02. Six lenses, but never as a list of six: they are argued in three pairs, each with a
// framing thought that holds still on the desktop while its two positions pass. Only one reasoning
// is open at a time, so the section cannot sprawl.

const EASE = [0.16, 1, 0.3, 1];

const PAIRS = [
  {
    id: 'framing',
    title: 'Start with a question.',
    note: 'A brief names a request. People give it context.',
    lenses: [
      {
        id: 'consider',
        name: 'Consider',
        statement: 'I question what the brief assumes.',
        summary: 'Design is not neutral. Every decision makes something easier to see and something else easier to ignore.',
        reasoning:
          'Words matter. First impressions matter. A beautiful interface can create trust, but appearance cannot rescue a product that misunderstands its user. Before solving the brief, I ask what the brief has already decided for us, who benefits from that framing, and what has been left outside it.',
      },
      {
        id: 'empathize',
        name: 'Empathize',
        statement: 'I listen to people without asking them to design the answer.',
        summary: 'Users reveal needs, frustrations, habits, and context. They should not have to prescribe the product.',
        reasoning:
          'The user comes first, but empathy is not a feature poll. My responsibility is to understand someone’s reality closely, then step back far enough to avoid confusing my first idea with their best outcome.',
      },
    ],
  },
  {
    id: 'evidence',
    title: 'Evidence needs interpretation.',
    note: 'Finding the problem takes more than counting what happened.',
    lenses: [
      {
        id: 'define',
        name: 'Define',
        statement: 'I begin with the problem, not the feature.',
        summary: 'Before adding something, I ask whether we are solving the right problem at the right level.',
        reasoning:
          'Is the failure inside the interface, the process, the organization, or the system connecting them? Sometimes the most valuable design work is not producing an answer. It is making the situation clear enough for the right answer to emerge.',
        evidence: { href: '/case-study-oms', label: 'The OMS case study' },
      },
      {
        id: 'research',
        name: 'Research',
        statement: 'I look at the data, and at what it cannot see.',
        summary: 'Data can show what happened. It does not always explain what the experience meant.',
        reasoning:
          'William Bruce Cameron wrote that not everything that counts can be counted. Data can reveal where people stop, return, convert, or fail. It may not fully explain hesitation, trust, embarrassment, emotional effort, or the moment someone decides a product is not meant for them. I use data, research, conversations, observation, context, and experience together. None deserves to become the whole truth by itself.',
      },
    ],
  },
  {
    id: 'release',
    title: 'Make it clear. Let it meet reality.',
    note: 'Craft and release need room in the same decision.',
    lenses: [
      {
        id: 'design',
        name: 'Design',
        statement: 'I use systems to create clarity.',
        summary: 'Simplicity does not mean pretending the underlying complexity has disappeared.',
        reasoning:
          'I introduce complexity only when it is necessary and accept that some complexity cannot be removed. Sometimes friction protects people. Sometimes “less” becomes empty. A complicated system may need an honest interface rather than the illusion that it is simple.',
        evidence: { href: '/case-study-placement', label: 'The Placement Hub case study' },
      },
      {
        id: 'validate',
        name: 'Validate',
        statement: 'I care about quality, and about releasing.',
        summary: 'Done is better than perfect when done means ready to learn.',
        reasoning:
          'I care about details because they influence comprehension, confidence, and behaviour. I also know that perfection can become another way of avoiding release. A released product can meet reality, be misunderstood, and improve. An unreleased perfect product can only remain an idea.',
      },
    ],
  },
];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.9, ease: EASE, delay },
});

export default function Lenses() {
  // One reasoning at a time, across the whole section.
  const [open, setOpen] = useState(null);

  return (
    <section className="abt-lenses" id="how-i-work" aria-labelledby="abt-lenses-title">
      <motion.p className="abt-label" {...rise()}>
        <span className="abt-label__index">02</span>
        <span className="abt-label__rule" aria-hidden="true" />
        <span>How I work</span>
      </motion.p>

      <motion.h2 className="abt-display abt-display--section" id="abt-lenses-title" {...rise(0.05)}>
        When the answer is not obvious.
      </motion.h2>

      <div className="abt-lenses__intro">
        <motion.p {...rise(0.1)}>
          Design began for me as something visual. I cared about balance, typography, colour, and the strange
          satisfaction of moving something by a few pixels until it finally felt right. Then I studied design and
          discovered that I had understood only its surface.
        </motion.p>
        <motion.p {...rise(0.16)}>
          Design was also how something worked, whom it worked for, what it asked of them, what it made easier, and what
          it quietly made difficult. That discovery changed the direction of my life.
        </motion.p>
      </div>

      <SectionImage />

      {/* Desktop: framing sticks, positions pass. Phones: one pair per panel, swiped sideways. */}
      <div className="abt-pairs">
        {PAIRS.map((pair, i) => (
          <Pair key={pair.id} pair={pair} index={i} open={open} setOpen={setOpen} />
        ))}
      </div>

      <motion.p className="abt-source" {...rise()}>
        The six-part structure and the principle titles are drawn from Irene Pereyra’s <em>Universal Principles of UX</em>.
        The interpretations and applications are my own.
      </motion.p>
    </section>
  );
}

function Pair({ pair, index, open, setOpen }) {
  return (
    <article className="abt-pair" aria-labelledby={`pair-${pair.id}`}>
      <motion.header className="abt-pair__frame" {...rise()}>
        <span className="abt-pair__count" aria-hidden="true">{String(index + 1).padStart(2, '0')} / 03</span>
        <h3 className="abt-pair__title" id={`pair-${pair.id}`}>{pair.title}</h3>
        <p className="abt-pair__note">{pair.note}</p>
      </motion.header>

      <div className="abt-pair__lenses">
        {pair.lenses.map((lens, i) => (
          <Lens key={lens.id} lens={lens} delay={i * 0.08} open={open} setOpen={setOpen} />
        ))}
      </div>
    </article>
  );
}

function Lens({ lens, delay, open, setOpen }) {
  const isOpen = open === lens.id;

  return (
    <motion.div className="abt-lens" {...rise(delay)}>
      <p className="abt-lens__name">{lens.name}</p>
      <h4 className="abt-lens__statement">{lens.statement}</h4>
      <p className="abt-lens__summary">{lens.summary}</p>

      <button
        type="button"
        className="abt-lens__toggle"
        aria-expanded={isOpen}
        aria-controls={`reasoning-${lens.id}`}
        onClick={() => setOpen(isOpen ? null : lens.id)}
      >
        <span className="abt-lens__toggle-label">{isOpen ? 'Close the reasoning' : 'Read the reasoning'}</span>
        <span className="abt-lens__toggle-mark" aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`reasoning-${lens.id}`}
            className="abt-lens__reasoning"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <p>{lens.reasoning}</p>
            {lens.evidence && (
              <p className="abt-lens__evidence">
                <AboutLink href={lens.evidence.href}>{lens.evidence.label}</AboutLink>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// The brief for this section's artwork, kept on the page as a note to ourselves. No frame is drawn
// until there is a real image to put in it.
function SectionImage() {
  const box = useRef(null);
  const shown = useInView(box, { once: true, amount: 0.3 });

  return (
    <motion.p
      className="abt-artnote"
      ref={box}
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 30, filter: shown ? 'blur(0px)' : 'blur(8px)' }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      Artwork to come · a tangle of fine lines resolving left to right into ordered, evenly spaced bands, on the page
      background, no text
    </motion.p>
  );
}
