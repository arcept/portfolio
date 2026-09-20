'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { EASE, useReduce } from '@/components/placement/Motion';
import { STEPS } from './storySteps';

const LAST = STEPS.length; // the closing card sits after the last step

function jumpTo(id) {
  window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 60);
}

function Words({ text, className }) {
  const words = text.split(' ');
  return (
    <h2 className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          <span className="st-mask">
            <motion.span initial={{ y: '112%' }} animate={{ y: '0%' }} transition={{ duration: 0.75, ease: EASE, delay: 0.05 + i * 0.04 }}>
              {word}
            </motion.span>
          </span>{' '}
        </span>
      ))}
    </h2>
  );
}

// "Read the 2-minute version": the trigger button, and the full-screen story it opens — one idea
// per step, animated, with the arrow keys / swipe / buttons to move and Esc to leave.
export default function StoryLauncher({ className, fontClass = '', children }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [mounted, setMounted] = useState(false);
  const reduce = useReduce();
  const dialog = useRef(null);
  useEffect(() => setMounted(true), []);

  const go = (next) => {
    const target = Math.max(0, Math.min(LAST, next));
    setDir(target >= step ? 1 : -1);
    setStep(target);
  };
  const close = useCallback(() => setOpen(false), []);

  // The key handler must see the current step without the effect (focus, scroll lock) re-running.
  const latest = useRef({});
  latest.current = { step, go };

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const onKey = (e) => {
      const { step: now, go: move } = latest.current;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') move(now + 1);
      else if (e.key === 'ArrowLeft') move(now - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open, close]);

  const start = () => {
    setStep(0);
    setDir(1);
    setOpen(true);
  };

  const current = step < LAST ? STEPS[step] : null;

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialog}
          className={`st ${fontClass}`.trim()}
          role="dialog"
          aria-modal="true"
          aria-label="The 2-minute version"
          tabIndex={-1}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="st__glow" aria-hidden="true" />

          <header className="st__top">
            <div className="st__progress" role="presentation">
              {[...STEPS, null].map((s, i) => (
                <button key={i} type="button" className={`st__seg${i < step ? ' is-done' : ''}${i === step ? ' is-now' : ''}`} onClick={() => go(i)} aria-label={s ? `Go to: ${s.kicker}` : 'Go to the end'}>
                  <i />
                </button>
              ))}
            </div>
            <div className="st__meta">
              <span className="st__where" aria-live="polite">
                {current ? (
                  <>
                    <b>{String(step + 1).padStart(2, '0')}</b> {current.kicker}
                  </>
                ) : (
                  'The 2-minute version'
                )}
              </span>
              <button type="button" className="st__close" onClick={close} aria-label="Close the 2-minute version">
                <span>Esc</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </header>

          <motion.main
            className="st__stage"
            drag={reduce ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            dragDirectionLock
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(step + 1);
              else if (info.offset.x > 70) go(step - 1);
            }}
          >
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                className="st__step"
                custom={dir}
                variants={{
                  enter: (d) => ({ opacity: 0, x: reduce ? 0 : d * 64, filter: reduce ? 'none' : 'blur(8px)' }),
                  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
                  leave: (d) => ({ opacity: 0, x: reduce ? 0 : d * -64, filter: reduce ? 'none' : 'blur(8px)' }),
                }}
                initial="enter"
                animate="center"
                exit="leave"
                transition={{ duration: 0.45, ease: EASE }}
              >
                {current ? (
                  <>
                    <div className="st__copy">
                      <p className="st__kicker">
                        <span>{String(step + 1).padStart(2, '0')}</span>
                        {current.kicker}
                      </p>
                      <Words text={current.title} className="st__title" />
                      <motion.p className="st__body" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}>
                        {current.body}
                      </motion.p>
                      <motion.button
                        type="button"
                        className="st__more"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        onClick={() => {
                          close();
                          jumpTo(current.id);
                        }}
                      >
                        Read this section in full <span aria-hidden="true">↗</span>
                      </motion.button>
                    </div>
                    <div className="st__visual">{current.visual}</div>
                  </>
                ) : (
                  <div className="st__end">
                    <p className="st__kicker">That’s the short version</p>
                    <Words text="The rest is in the detail." className="st__title st__title--end" />
                    <motion.div className="st__actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}>
                      <button type="button" className="st__btn st__btn--primary" onClick={close}>
                        Read the full case study
                      </button>
                      <button
                        type="button"
                        className="st__btn"
                        onClick={() => {
                          close();
                          jumpTo('prototype');
                        }}
                      >
                        Try the prototype ↓
                      </button>
                      <button type="button" className="st__btn st__btn--quiet" onClick={() => go(0)}>
                        Watch again
                      </button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.main>

          <footer className="st__nav">
            <button type="button" className="st__btn st__btn--quiet" onClick={() => go(step - 1)} disabled={step === 0}>
              ← Back
            </button>
            <span className="st__hint">← → to move · Esc to close</span>
            {step < LAST ? (
              <button type="button" className="st__btn st__btn--primary" onClick={() => go(step + 1)}>
                {step === LAST - 1 ? 'Finish' : 'Next'} →
              </button>
            ) : (
              <span />
            )}
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button type="button" className={className} onClick={start} aria-haspopup="dialog">
        {children}
      </button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
