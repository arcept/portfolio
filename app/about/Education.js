'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { ANSWERS, EDUCATION_HEADLINES, SCHOOLS } from './education-content';
import { hand } from './fonts';
import { useHoverShot } from './HoverPortrait';

const EASE = [0.16, 1, 0.3, 1];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// One step per school; the answer ends on Milan's.
const STEPS = SCHOOLS;

// Every row's logo sits in a slot this wide, so the years, degrees and schools line up down the list.
const SLOT = 170;

// Section 05. The section is a single sentence, "Design is…", corrected once per
// school: each earlier answer stays on the page, struck through, like a correction in a notebook, and
// the current one sits large beneath them. The answer moves on as the section scrolls up the screen,
// and ends on Milan's; pointing at or tapping a school in the list beside it jumps there. The label,
// headline and sticker sit in their own row over the sentence, and the list starts level with it. The
// DROPPED OUT stamp and the merit badge ride on their answer while it is the current one (not once it
// is struck through), with a handwritten note under the
// answer in view, and under the answer the school it belongs to: its logo, name, degree, years and place.
export default function Education() {
  const headline = EDUCATION_HEADLINES[0];
  const id = 'abt-education-title';
  const stage = useRef(null);
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  const main = useRef(null);
  const phone = usePhone();
  // Wide screens: from when the section's top is 70% down the screen to when its bottom reaches the
  // middle. Phones, where the list sits under the sentence: while the sentence itself is on screen, so
  // the answer never changes out of sight.
  const { scrollYProgress } = useScroll(
    phone
      ? { target: main, offset: ['start 0.75', 'end 0.35'] }
      : { target: stage, offset: ['start 0.7', 'end 0.5'] }
  );
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const n = reduced ? STEPS.length - 1 : Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length)));
    setAt((cur) => (cur === n ? cur : n));
  });
  const pick = (i) => setAt(i);
  const current = STEPS[at];
  const [first, rest] = splitHeadline(headline);
  // While the master's is the step shown, hovering anywhere in the sentence column brings up a small
  // photograph from the convocation in Milan, following the pointer as the portrait in the opening does.
  const convocation = useHoverShot({
    src: '/about/gallery/domus-convocation.jpg',
    width: 1535,
    height: 1024,
    whole: true,
    enabled: current.id === 'domus',
    className: 'abt-hovershot--small',
  });

  return (
    <section className={`abt-education ed-accent ${hand.variable}`} id="education" aria-labelledby={id}>
    <div className="ed-b" ref={stage}>
      <div className="ed-b__head">
        <motion.p className="abt-label" {...rise()}>
          <span className="abt-label__index">05</span>
          <span className="abt-label__rule" aria-hidden="true" />
          <span>Education</span>
        </motion.p>
        <motion.h2 className="ed-b__headline" id={id} {...rise(0.05)}>
          {first}
          {/* A zero-width anchor at the end of the first line: the sticker hangs off it, into the empty
              space to the right of that line, clear of the words. */}
          <span className="ed-b__stickeranchor" aria-hidden="true">
            <motion.span
              className="ed-sticker-slot ed-b__sticker"
              initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay: 0.6 }}
            >
              <img src="/about/stickers/education.svg" alt="" width={737} height={334} />
            </motion.span>
          </span>
          {rest && (
            <>
              <br />
              {rest}
            </>
          )}
        </motion.h2>
      </div>

      <div
        className="ed-b__main"
        ref={(el) => {
          main.current = el;
          convocation.zoneProps.ref.current = el;
        }}
        onPointerMove={convocation.zoneProps.onPointerMove}
        onPointerLeave={convocation.zoneProps.onPointerLeave}
      >
        {convocation.shot}
        <div className="ed-b__answers">
          <Ghosts>
            {STEPS.map((g, k) => (
              <div key={g.id} className="ed-b__ghoststep">
                {STEPS.slice(0, k).map((o) => (
                  <p key={o.id} className="ed-b__old">
                    {ANSWERS[o.answer]}
                  </p>
                ))}
                <p className="ed-b__now">
                  {ANSWERS[g.answer]}
                  <AnswerMarks step={g} />
                </p>
              </div>
            ))}
          </Ghosts>
          <div className="ed-b__live" aria-live="polite">
          {STEPS.slice(0, at).map((s) => (
            <motion.p key={s.id} layout className="ed-b__old" transition={{ duration: 0.6, ease: EASE }}>
              <span className="ed-b__oldtext">
                {ANSWERS[s.answer]}
                <motion.span
                  className="ed-b__strike"
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                />
              </span>
            </motion.p>
          ))}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={current.id}
              layout
              className="ed-b__now"
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {ANSWERS[current.answer]}
              <AnswerMarks step={current} />
            </motion.p>
          </AnimatePresence>
          </div>
        </div>

        <div className="ed-b__factsbox">
          <Ghosts>
            {STEPS.map((g) => (
              <div key={g.id} className="ed-b__facts">
                <Facts step={g} />
              </div>
            ))}
          </Ghosts>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            className="ed-b__facts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Facts step={current} />
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      <ol className="ed-b__list">
        {SCHOOLS.map((s, i) => (
          <motion.li key={s.id} {...rise(0.1 + i * 0.06)}>
            <button
              type="button"
              className={`ed-b__school${i === at ? ' is-on' : ''}${i < at ? ' is-past' : ''}${s.emphasis ? ' is-major' : ''}${s.small ? ' is-small' : ''}`}
              aria-pressed={i === at}
              onClick={() => pick(i)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && pick(i)}
            >
              <SchoolMarks school={s} size={52} slot={SLOT} />
              <span className="ed-b__schooltext">
                <span className="ed-b__years">{s.years}</span>
                <span className="ed-b__programme">{s.programme}</span>
                <span className="ed-b__schoolname">
                  <strong>{s.schoolLead ?? s.school}</strong>
                  {s.schoolLead && s.school.slice(s.schoolLead.length)}
                  {s.formerly && ` (formerly ${s.formerly})`}
                  , {s.place}
                </span>
                {s.status && <span className="ed-b__status">{s.status}</span>}
                {s.major && <DegreeBadge className="ed-row__badge" label={s.major} />}
                {s.award && <MeritBadge className="ed-row__badge" />}
              </span>
            </button>
          </motion.li>
        ))}
      </ol>
    </div>
    </section>
  );
}

// Under the answer: the school it belongs to, the handwritten note, and the line.
function Facts({ step }) {
  return (
    <>
    {step.logos?.length > 0 && (
      <div className={`ed-b__source${step.sourceLogos ? ' ed-b__source--stacked' : ''}`}>
        <SchoolMarks school={step.sourceLogos ? { ...step, logos: step.sourceLogos } : step} size={40} maxWidth={step.sourceLogos ? 420 : 200} />
        <span className="ed-b__sourcetext">
          <span>
            <strong>{step.schoolLead ?? step.school}</strong>
            {step.schoolLead && step.school.slice(step.schoolLead.length)}
          </span>
          <span className="ed-b__sourcemeta">
            {step.programme} · {step.years} · {step.place}
          </span>
        </span>
      </div>
    )}
    <span className="ed-b__hand" aria-hidden="true">
      {NOTES[step.id]}
    </span>
    <p className="ed-b__line">
      {step.answerNote && <span className="ed-b__note">{step.answerNote}. </span>}
      {step.line}
    </p>
    </>
  );
}

// Invisible copies of the tallest things the column can hold, laid in the same grid cell as the real
// content, so the column is always as tall as its tallest step, whichever step is showing.
function Ghosts({ children }) {
  return (
    <div className="ed-b__ghost" aria-hidden="true">
      {children}
    </div>
  );
}

// The headline in two lines, broken at the comma nearest its middle ("Four schools, three continents, /
// one changing answer."); one line if it has no comma.
function splitHeadline(text) {
  const mid = text.length / 2;
  let best = -1;
  for (let i = text.indexOf(', '); i !== -1; i = text.indexOf(', ', i + 1)) {
    if (best === -1 || Math.abs(i - mid) < Math.abs(best - mid)) best = i;
  }
  return best === -1 ? [text, null] : [text.slice(0, best + 1), text.slice(best + 2)];
}

// The institution's lockup at the same visual weight as the others: `size` is the side of a square with
// the ink everyone gets; each lockup is scaled toward the same covered area (box times `ink`), so a long
// thin wordmark comes out wider and lower, a compact one smaller. One file per theme. With `slot`, the marks sit centred in a box of that fixed
// width, so whatever follows them lines up from row to row however wide each lockup is.
const INK_REF = 0.25;

function SchoolMarks({ school, size = 44, maxWidth = 220, slot }) {
  const n = school.logos.length;
  if (slot) maxWidth = Math.min(maxWidth, slot);
  return (
    <span className={`ed-marks${slot ? ' ed-marks--slot' : ''}`} style={slot ? { width: slot } : undefined}>
      {school.logos.map((l) => {
        if (!l.src) {
          return (
            <span key={l.name} className="ed-mark" role="img" aria-label={l.name} style={{ width: size, height: size, fontSize: size * 0.3 }}>
              {l.mono}
            </span>
          );
        }
        let w = size * Math.sqrt(l.ratio) * (INK_REF / l.ink) ** 0.3 * (l.scale ?? 1);
        w = Math.min(w, maxWidth / n);
        const h = w / l.ratio;
        const dims = { width: Math.round(w), height: Math.round(h) };
        return (
          <span key={l.name} className="ed-logo" role="img" aria-label={l.name} style={dims}>
            <img className="ed-logo__light" src={`/about/logos/edu/${l.src}-light.png`} alt="" {...dims} />
            <img className="ed-logo__dark" src={`/about/logos/edu/${l.src}-dark.png`} alt="" {...dims} />
          </span>
        );
      })}
    </span>
  );
}

// Handwritten under the answer in view.
const NOTES = {
  northcap: 'best decision I ever made',
  pearl: 'where design stopped being decoration',
  santafe: 'a few months, a long way from home',
  domus: 'Milan taught as much as the modules',
};

// What rides along on a school's answer: the DROPPED OUT stamp on engineering's, the merit badge
// on Pearl's.
function AnswerMarks({ step }) {
  return (
    <>
      {step.id === 'northcap' && (
        <motion.span
          className="ed-stamp ed-dropped"
          aria-label="Dropped out after two years"
          initial={{ opacity: 0, scale: 2.4, rotate: -22 }}
          animate={{ opacity: 0.9, scale: 1, rotate: -8 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.9 }}
        >
          Dropped out
          <small>after 2 years</small>
        </motion.span>
      )}
      {step.award && <MeritBadge className="ed-answerbadge" />}
    </>
  );
}

// The merit scholarship as a modern badge: a gold pill with a medal mark and the words in plain type,
// a light glint crossing it every few seconds. It springs in when it first appears.
function MeritBadge({ className = '', label = 'Merit scholarship' }) {
  return (
    <motion.span
      className={`ed-badge ${className}`}
      initial={{ opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.3 }}
    >
      <svg className="ed-badge__medal" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M6 1.5h3l1 4-2.2 1.4zM14 1.5h-3l-1 4 2.2 1.4z" fill="currentColor" opacity="0.55" />
        <circle cx="10" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 8.6l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="currentColor" />
      </svg>
      {label}
    </motion.span>
  );
}

// The master's degree as a badge: the same pill shape as the merit badge, but in the page's ink rather
// than gold (a dark pill on the light page, a light one on the dark), with a mortarboard and a thin gold
// ring that runs round its edge.
function DegreeBadge({ className = '', label = 'Master’s degree' }) {
  return (
    <motion.span
      className={`ed-degree ${className}`}
      initial={{ opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.3 }}
    >
      <svg className="ed-degree__cap" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 3.5 1.5 7.8 10 12.1l8.5-4.3z" fill="currentColor" />
        <path d="M5 9.9v3.4c1.3 1.3 3 2 5 2s3.7-.7 5-2V9.9L10 12.4z" fill="currentColor" opacity="0.7" />
        <path d="M17.2 8.5v4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      {label}
    </motion.span>
  );
}

// Whether the layout is the stacked, phone one (the same breakpoint as the stylesheet).
function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return phone;
}
