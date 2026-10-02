'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScrollTrigger, gsap, prefersStill, useIsoLayoutEffect } from './gsap';

// Chapter 03's design detail, its second half: the live course page's syllabus form before and after it lost
// two fields (job title, years of experience; the specialisation stayed, as sales still needed it). Two ways
// to show it:
//   dial    the chosen one (2026-10-03): the form rebuilt with a dial from more information to more leads, a
//           field at a time, marking where we landed; its meters are illustrative, not measured
//   toggle  kept, out of sight, to compare again: the form rebuilt; Before / After, the two fields folding
//           away, a count of the fields
// ?compare on the URL (the same that brings back the "In brief" switcher) shows a switch between them above
// the form, and ?form= picks one. Each plays once as it comes into view, then the reader has it.

const OPTIONS = [
  { id: 'toggle', label: 'A · Before / After' },
  { id: 'dial', label: 'B · Trade-off dial' },
];
const CHOSEN = 'dial';

// The form's fields, top to bottom. `cut` is the dial step a field goes at (job title first, then years of
// experience, which is where we landed, then the specialisation, a step too far).
const FIELDS = [
  { id: 'name', label: 'Your Name', hint: 'Enter your Full Name' },
  { id: 'phone', label: 'Phone Number', hint: 'Enter your Mobile Number', kind: 'phone' },
  { id: 'email', label: 'Email', hint: 'Email Address', kind: 'email' },
  { id: 'years', label: 'Years of experience', hint: 'Select Years of experience', kind: 'select', cut: 2 },
  { id: 'job', label: 'Job Title', hint: 'Job Title', cut: 1 },
  { id: 'spec', label: 'Specialisation', hint: 'Select specialisation', kind: 'pick', cut: 3 },
];
const LANDED = 2;
const shownAt = (step) => FIELDS.filter((f) => !f.cut || f.cut > step);

const BENEFITS = [
  '45+ assignments',
  '1 RIBA-structured capstone project',
  '7+ software licences',
  'Career counselling and interview prep',
  'Certificate of Achievement',
  'Lifelong access to course content',
];
const INTRO = {
  old: 'Enter your details to download the course syllabus.',
  new: 'Our academic counsellor will reach out to you within the next 24 hours between 10am-10pm IST.',
};

// Plays `intro` once, when the piece is well into view; or, for a reader who wants less motion, runs `still`.
// Whatever `intro` returns (a tween, or a list of them) is stopped if the piece goes before it has played.
function useIntro(root, intro, still) {
  useIsoLayoutEffect(() => {
    if (prefersStill()) {
      still();
      return undefined;
    }
    let playing = [];
    const play = () => {
      playing = [].concat(intro());
    };
    // Already in view (an option just switched to), it plays now; otherwise when it gets there.
    if (root.current.getBoundingClientRect().top < window.innerHeight * 0.65) {
      play();
      return () => playing.forEach((t) => t.kill());
    }
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top 65%', once: true, onEnter: play });
    return () => {
      st.kill();
      playing.forEach((t) => t.kill());
    };
  }, []);
}

function Chevron() {
  return (
    <svg className="cro-nf__chev" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 4.5 L6 7.5 L9 4.5" />
    </svg>
  );
}

// The syllabus form, rebuilt at its own proportions (sizes in the card's units, --u). `step` is how many
// fields have gone; `labelled` and `tone` give it the new form's look.
function NovForm({ step = 0, labelled = false, tone = 'old' }) {
  const shown = shownAt(step);
  return (
    <div className="cro-nf__fit">
      <div className={`cro-nf__card is-${tone}${labelled ? ' is-labelled' : ''}`} aria-hidden="true">
        <div className="cro-nf__side">
          <p className="cro-nf__kicker">Download Syllabus</p>
          <p className="cro-nf__course">BIM Professional Course</p>
          <dl className="cro-nf__meta">
            <div>
              <dt>Next Cohort</dt>
              <dd>January, 2024</dd>
            </div>
            <div>
              <dt>Program Duration</dt>
              <dd>6 Months, online (5-6 hours/week)</dd>
            </div>
          </dl>
          <p className="cro-nf__perks-title">Premium course benefits</p>
          <ul className="cro-nf__perks">
            {BENEFITS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="cro-nf__main">
          <svg className="cro-nf__close" viewBox="0 0 14 14">
            <path d="M2 2 L12 12 M12 2 L2 12" />
          </svg>
          <p className="cro-nf__intro">{INTRO[tone]}</p>
          <div className="cro-nf__fields">
            {FIELDS.map(({ id, label, hint, kind }) => (
              <div key={id} className={`cro-nf__row${shown.some((f) => f.id === id) ? '' : ' is-gone'}`}>
                <div className="cro-nf__row-in">
                  <span className="cro-nf__label">{label}</span>
                  <span className={`cro-nf__input${kind ? ` is-${kind}` : ''}`}>
                    {kind === 'phone' && (
                      <span className="cro-nf__code">
                        <i />
                        <Chevron />
                      </span>
                    )}
                    {kind === 'email' && (
                      <svg className="cro-nf__mail" viewBox="0 0 16 12">
                        <path d="M1 1 H15 V11 H1 Z M1 1 L8 6.5 L15 1" />
                      </svg>
                    )}
                    <span className="cro-nf__hint">
                      {kind === 'phone' && <b>+91</b>}
                      {hint}
                    </span>
                    {(kind === 'select' || (kind === 'pick' && labelled)) && <Chevron />}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <hr className="cro-nf__rule" />
          <span className="cro-nf__submit">
            Submit <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- A · Before / After

function Toggle() {
  const root = useRef(null);
  const [after, setAfter] = useState(false);
  const touched = useRef(false);
  useIntro(
    root,
    () => gsap.delayedCall(1.2, () => !touched.current && setAfter(true)),
    () => setAfter(true)
  );
  const choose = (v) => {
    touched.current = true;
    setAfter(v);
  };
  const count = shownAt(after ? LANDED : 0).length;

  return (
    <div className="cro-nf is-toggle" ref={root}>
      <div className="cro-nf__bar">
        <div className="cro-form__switch" role="group" aria-label="Which form">
          <button type="button" aria-pressed={!after} onClick={() => choose(false)}>
            Before
          </button>
          <button type="button" aria-pressed={after} onClick={() => choose(true)}>
            After
          </button>
        </div>
        <p className="cro-nf__count" aria-live="polite">
          <b key={count}>{count}</b> fields
        </p>
      </div>
      <NovForm step={after ? LANDED : 0} labelled={after} tone={after ? 'new' : 'old'} />
      <ul className={`cro-nf__changes${after ? ' is-after' : ''}`}>
        <li className="is-cut">Years of experience</li>
        <li className="is-cut">Job title</li>
        <li className="is-kept">Specialisation, kept: sales still needed it</li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- B · Trade-off dial

// Illustrative levels for the meters at each step, not measurements: the effort follows the field count; what
// sales learns falls a little per field and a lot when the specialisation goes.
const KNOWS = [1, 0.86, 0.72, 0.3];
const SAYS = [
  'Everything sales asked for, and the most to fill in.',
  'Job title goes.',
  'Where we landed: job title and years of experience go. The specialisation stays, as sales still needed it.',
  'A step too far: sales still needed the specialisation.',
];

function Dial() {
  const root = useRef(null);
  const [step, setStep] = useState(0);
  const touched = useRef(false);
  useIntro(
    root,
    () => [1, 2].map((s, i) => gsap.delayedCall(0.9 * (i + 1), () => !touched.current && setStep(s))),
    () => setStep(LANDED)
  );
  const count = shownAt(step).length;

  return (
    <div className="cro-nf is-dial" ref={root}>
      <div className="cro-nf-dial">
        <div className="cro-nf-dial__ends" aria-hidden="true">
          <span>More information</span>
          <span>More leads</span>
        </div>
        <div className="cro-nf-dial__track" style={{ '--p': step / 3, '--landed': LANDED / 3 }}>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={step}
            aria-label="Fields on the form, from more information to more leads"
            aria-valuetext={`${count} fields`}
            onChange={(e) => {
              touched.current = true;
              setStep(Number(e.target.value));
            }}
          />
          <span className="cro-nf-dial__mark" aria-hidden="true" />
        </div>
        <ol className="cro-nf-dial__ticks" aria-hidden="true">
          {[0, 1, 2, 3].map((s) => (
            <li key={s} className={s === step ? 'is-on' : undefined} style={{ '--s': s / 3 }}>
              {shownAt(s).length} fields
              {s === LANDED && <em>Where we landed</em>}
            </li>
          ))}
        </ol>
        <div className="cro-nf-dial__meters">
          <p>
            <span>Effort to finish</span>
            <i style={{ '--v': count / 6 }} />
          </p>
          <p>
            <span>What sales learns up front</span>
            <i style={{ '--v': KNOWS[step] }} />
          </p>
        </div>
        <p className={`cro-nf-dial__says${step === LANDED ? ' is-landed' : ''}${step === 3 ? ' is-over' : ''}`} aria-live="polite">
          {SAYS[step]}
        </p>
      </div>
      <NovForm step={step} />
    </div>
  );
}

// ---------------------------------------------------------------- the piece

const BY = { toggle: Toggle, dial: Dial };
const SOURCE = {
  toggle: 'Rebuilt from the live form.',
  dial: 'Rebuilt from the live form; the steps between are for comparison, and the meters are illustrative.',
};

export default function FormFields({ caption }) {
  const params = useSearchParams();
  const compare = params.has('compare');
  const asked = params.get('form');
  const [option, setOption] = useState(OPTIONS.some((o) => o.id === asked) ? asked : CHOSEN);
  const Option = BY[option];
  // The options differ in height, so the triggers further down the page are measured again.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ScrollTrigger.refresh();
  }, [option]);
  return (
    <figure className="cro-nf-wrap">
      {compare && (
        <div className="cro-nf__options" role="group" aria-label="Options to compare">
          <span>Option</span>
          <div className="cro-form__switch">
            {OPTIONS.map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={option === id} onClick={() => setOption(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <Option key={option} />
      <figcaption className="cro-form__caption">
        {SOURCE[option]} {caption}
      </figcaption>
    </figure>
  );
}
