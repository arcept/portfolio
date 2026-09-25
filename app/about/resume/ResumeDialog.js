'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { track } from '@/components/track';
import { GATE_ENDPOINT, ILLUSTRATION, RESUME_FILES, RESUME_GATE } from './config';

const EASE = [0.16, 1, 0.3, 1];
const REMEMBER = 'abt-resume-visitor'; // name and email, so a returning visitor is not asked twice

// A test submission (contact+test@…, or the name "Test") is recorded but sends no notification.
const isTest = (name, email) => /\+test@/i.test(email) || name.trim().toLowerCase() === 'test';

// The "Download résumé" action and its dialog: a centred, two-column modal over the dimmed page, an
// illustration edge to edge on the left (with its credit), the form on the right. It confirms the
// visitor wants the résumé and (with the gate on) takes a name and email. The designed résumé, for
// reading, is what they get; ticking the box adds the ATS-friendly one, for job portals. On download:
// a short loader, then a sheet drops into the tray, and the file (or both) downloads.
export default function ResumeDialog({ children, className = '' }) {
  const [open, setOpen] = useState(false);
  const opener = useRef(null);

  const show = () => {
    setOpen(true);
    track('resume_dialog_open');
  };

  return (
    <>
      <button type="button" ref={opener} className={`abt-link abt-link--button ${className}`} onClick={show} aria-haspopup="dialog">
        <span className="abt-link__label">{children}</span>
        <span className="abt-link__arrow" aria-hidden="true">
          ↓
        </span>
      </button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          opener.current?.focus();
        }}
      />
    </>
  );
}

function Dialog({ open, onClose }) {
  const [host, setHost] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ats, setAts] = useState(false);
  const [phase, setPhase] = useState('form'); // form → loading → done
  const [error, setError] = useState('');
  const panel = useRef(null);
  const first = useRef(null);
  const uid = useId();

  // Rendered into the page's .abt root (not <body>) so it keeps the page's theme tokens; the root has
  // no transform, so position:fixed is the viewport.
  useEffect(() => setHost(document.querySelector('.abt') ?? document.body), []);

  useEffect(() => {
    if (!open) return undefined;
    setPhase('form');
    setError('');
    try {
      const saved = JSON.parse(localStorage.getItem(REMEMBER) || 'null');
      if (saved) {
        setName(saved.name || '');
        setEmail(saved.email || '');
      }
    } catch {}
    const t = setTimeout(() => first.current?.focus(), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        // Keep focus inside the dialog.
        const items = panel.current.querySelectorAll('button, input, a[href]');
        const list = [...items].filter((el) => !el.disabled);
        if (!list.length) return;
        const [a, z] = [list[0], list[list.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    // Lock the page's scroll without it jumping: hiding the scrollbar would widen the page by the
    // scrollbar's width and shift everything right, so that width is kept as padding while locked.
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const pad = root.style.paddingRight;
    const bar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (bar > 0) root.style.paddingRight = `${bar}px`;
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      root.style.overflow = overflow;
      root.style.paddingRight = pad;
    };
  }, [open, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (RESUME_GATE) {
      if (!name.trim()) return setError('Please add your name.');
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Please add a valid email.');
    }
    setError('');
    setPhase('loading');
    const files = ats ? ['design', 'ats'] : ['design'];
    track('resume_download_start', { files: files.join('+'), gated: RESUME_GATE });

    if (RESUME_GATE) {
      try {
        localStorage.setItem(REMEMBER, JSON.stringify({ name: name.trim(), email: email.trim() }));
      } catch {}
      if (GATE_ENDPOINT) {
        // text/plain keeps this a "simple" request, which Apps Script accepts without a CORS preflight.
        fetch(GATE_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            files: files.join('+'),
            test: isTest(name, email),
            page: location.pathname,
            referrer: document.referrer || '',
          }),
        }).catch(() => {});
      }
    }

    await wait(900); // the loader
    setPhase('done');
    await wait(700); // the sheet lands in the tray
    for (const [i, key] of files.entries()) {
      if (i) await wait(600); // a second download straight after the first is often blocked
      download(RESUME_FILES[key]);
      track('resume_download', { file: key });
    }
  };

  if (!host) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="rsm"
          // The veil and its blur ease in together, and out again, rather than the blur snapping on.
          initial={{ opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          onPointerDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panel}
            className="rsm__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-t`}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <button type="button" className="rsm__close" onClick={onClose} aria-label="Close">
              ×
            </button>

            {/* Left (on phones, top): the illustration edge to edge, its credit over the foot of it. */}
            <figure className="rsm__art">
              <picture>
                <source media="(max-width: 720px)" srcSet={ILLUSTRATION.wide} />
                <motion.img
                  src={ILLUSTRATION.src}
                  alt=""
                  width={ILLUSTRATION.width}
                  height={ILLUSTRATION.height}
                  initial={{ scale: 1.08, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </picture>
              <figcaption className="rsm__credit">
                {ILLUSTRATION.credit} <br className="rsm__creditbr" />
                inspired by{' '}
                {ILLUSTRATION.inspiredBy.map((c, i, all) => (
                  <span key={c.href}>
                    {i > 0 && (i === all.length - 1 ? ' and ' : ', ')}
                    <a href={c.href} target="_blank" rel="noopener noreferrer">
                      {c.name}
                    </a>
                  </span>
                ))}{' '}
                on Dribbble
              </figcaption>
            </figure>

            <div className="rsm__body">
            <AnimatePresence mode="wait" initial={false}>
              {phase === 'form' ? (
                <motion.form
                  key="form"
                  className="rsm__form"
                  onSubmit={submit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="rsm__kicker">Résumé</p>
                  <h2 className="rsm__title" id={`${uid}-t`}>
                    Download My Résumé
                  </h2>
                  <p className="rsm__lede">For reading: the designed résumé, one to two pages.</p>

                  {RESUME_GATE && (
                    <div className="rsm__fields">
                      <label className="rsm__field">
                        <span>Name</span>
                        <input ref={first} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </label>
                      <label className="rsm__field">
                        <span>Email</span>
                        <input type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </label>
                    </div>
                  )}

                  <label className="rsm__check">
                    <input ref={RESUME_GATE ? undefined : first} type="checkbox" checked={ats} onChange={(e) => setAts(e.target.checked)} />
                    <span className="rsm__box" aria-hidden="true">
                      <svg viewBox="0 0 16 16">
                        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                      </svg>
                    </span>
                    <span className="rsm__checktext">
                      <strong>Also include the version for job portals</strong>
                      <em>(ATS-friendly résumé) Plain, single-column text that applicant tracking systems read cleanly.</em>
                    </span>
                  </label>

                  {error && (
                    <p className="rsm__error" role="alert">
                      {error}
                    </p>
                  )}

                  <button type="submit" className="rsm__go">
                    Download {ats ? 'both' : 'résumé'}
                    <span aria-hidden="true">↓</span>
                  </button>
                  {RESUME_GATE && <p className="rsm__fine">Only so I know who is reading. No newsletters, ever.</p>}
                </motion.form>
              ) : (
                <motion.div
                  key="send"
                  className="rsm__send"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  aria-live="polite"
                >
                  <Tray phase={phase} count={ats ? 2 : 1} />
                  <p className="rsm__sendtitle">{phase === 'loading' ? 'Preparing…' : ats ? 'Both are on their way.' : 'On its way.'}</p>
                  <p className="rsm__sendline">
                    {phase === 'loading' ? ' ' : 'If the download does not start, '}
                    {phase === 'done' && (
                      <a href={RESUME_FILES.design.src} download={RESUME_FILES.design.name}>
                        open it here
                      </a>
                    )}
                    {phase === 'done' && '.'}
                  </p>
                  {phase === 'done' && (
                    <button type="button" className="rsm__done" onClick={onClose}>
                      Done
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    host
  );
}

// The download animation: a spinner while it "prepares", then the sheet(s) drop into a tray and a
// check draws itself.
function Tray({ phase, count }) {
  const done = phase === 'done';
  return (
    <div className="rsm__tray" aria-hidden="true">
      {!done && <span className="rsm__spinner" />}
      {done &&
        Array.from({ length: count }, (_, i) => (
          <motion.span
            key={i}
            className="rsm__sheet"
            initial={{ y: -70, opacity: 0, rotate: i ? 8 : -6 }}
            animate={{ y: i ? -6 : 0, x: i ? 10 : 0, opacity: 1, rotate: i ? 6 : -3 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22, delay: i * 0.18 }}
          >
            <span />
            <span />
            <span />
          </motion.span>
        ))}
      <span className="rsm__traybox" />
      {done && (
        <motion.svg className="rsm__tick" viewBox="0 0 24 24" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.35 + (count - 1) * 0.18 }}>
          <motion.path d="M6 12.5 10.2 16.5 18 8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.45 + (count - 1) * 0.18 }} />
        </motion.svg>
      )}
    </div>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function download({ src, name }) {
  const a = document.createElement('a');
  a.href = src;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
