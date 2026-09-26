'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView } from 'motion/react';
import ResumeDialog from './resume/ResumeDialog';
import useBleedEdges from './useBleedEdges';
import { neueAlte } from './wordmark-fonts';

const EASE = [0.16, 1, 0.3, 1];
const STORY_HREF = '/about/story';
// Hidden until the story page is written; /about/story shows a "coming soon" page for now.
const SHOW_STORY_BUTTON = false;

const rise = (delay = 0, y = 24) => ({
  initial: { opacity: 0, y, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// Small snapshots, tilted, under the line.
const PHOTOS = [
  { src: '/about/gallery/bangkok.jpg', rot: -7, x: 2, y: 18 },
  { src: '/about/gallery/cafe.jpg', rot: 4, x: 34, y: 0 },
  { src: '/about/gallery/street.jpg', rot: -2, x: 64, y: 26 },
];


const LINKS = [
  { key: 'work', label: 'Selected work', href: '/#work', arrow: true },
  { key: 'resume', label: 'Download résumé' },
  { key: 'email', label: 'contact@arcept.in', href: 'mailto:contact@arcept.in' },
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/manikmadaan/', arrow: true, external: true },
];

// 07 · A note before you go. The page admits it has been the short version and invites the reader to the
// story, then ends: the ground warms from the foot of the window, with the work, the résumé and the ways
// to get in touch, and the name set huge and cut off by the page's edge. It stands in for the site footer.
// Centred on the window rather than the reading column; the margin index is hidden for it.
export default function StoryBridge() {
  const button = useRef(null);
  const band = useRef(null);
  const [go, overlay] = useStoryGo();
  useBleedEdges(band);

  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <section className={`abt-end ${neueAlte.variable}`} id="story-bridge" aria-labelledby="abt-end-title">
      <motion.p className="abt-label abt-end__label" {...rise(0)}>
        A note before you go
      </motion.p>

      <motion.h2 className="abt-end__title" id="abt-end-title" {...rise(0.05)}>
        <span>That was the version</span> <span>that fits on a résumé.</span>
        <Sticker />
      </motion.h2>
      <motion.p className="abt-end__lead" {...rise(0.12)}>
        A title. A timeline. A few principles. The accepted ingredients for knowing a person on the internet. Everything above is true.{' '}
        <span className="abt-end__accent">None of it is the whole story.</span>
      </motion.p>

      <Snapshots />

      <div className="abt-end__glow" ref={band}>
        <div className="abt-end__bg" aria-hidden="true">
          <span className="abt-end__blob abt-end__blob--1" />
          <span className="abt-end__blob abt-end__blob--2" />
          <span className="abt-end__blob abt-end__blob--3" />
          <span className="abt-end__grain" />
          <p className="abt-end__word">Manik Madaan</p>
        </div>

        <motion.p className="abt-end__ask" {...rise(0.05)}>
          But do you really want to get to know me?
        </motion.p>
        {SHOW_STORY_BUTTON && (
          <motion.div className="abt-end__cta" {...rise(0.12)}>
            <a ref={button} href={STORY_HREF} className="abt-end__btn" onClick={(e) => go(e, button)}>
              Yes. I want the real story <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        )}

        <motion.ul className="abt-end__links" {...rise(0.22)}>
          {LINKS.map((l) => (
            <li key={l.key}>
              {l.key === 'resume' ? (
                <ResumeDialog className="abt-end__resume">{l.label}</ResumeDialog>
              ) : (
                <a href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {l.label}
                  {l.arrow && ' ↗'}
                  {l.external && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              )}
            </li>
          ))}
        </motion.ul>

        <div className="abt-end__foot">
          <span>
            © 2026 Manik Madaan
            <span aria-hidden="true">&nbsp;·&nbsp;</span>
            <button type="button" className="abt-end__cookies" onClick={() => window.openCookieSettings?.()}>
              Cookie settings
            </button>
          </span>
          <a href="#top" onClick={toTop}>
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
      {overlay}
    </section>
  );
}

// The hand-lettered "My Story", slapped on the headline's corner: it springs in, tilted, once in view.
function Sticker() {
  return (
    <motion.span
      className="abt-end__sticker"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
      whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay: 0.45 }}
    >
      <img src="/about/stickers/my-story.svg" alt="" width={410} height={309} />
    </motion.span>
  );
}

// The photos come in one after another. Pointing at one lifts and straightens it while the others step
// aside, so it never has to pass over a neighbour; the last one pointed at stays on top.
function Snapshots() {
  const box = useRef(null);
  const seen = useInView(box, { once: true, amount: 0.4 });
  const [hover, setHover] = useState(null);
  const [top, setTop] = useState(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!seen) return undefined;
    const t = window.setTimeout(() => setSettled(true), 1200);
    return () => window.clearTimeout(t);
  }, [seen]);

  const state = (p, n) => {
    if (!seen) return { opacity: 0, x: 0, y: 40, rotate: p.rot * 3, scale: 1 };
    if (hover === n) return { opacity: 1, x: 0, y: -14, rotate: 0, scale: 1.08 };
    if (hover !== null) return { opacity: 1, x: n < hover ? -26 : 26, y: 4, rotate: p.rot * 1.4, scale: 0.96 };
    return { opacity: 1, x: 0, y: 0, rotate: p.rot, scale: 1 };
  };

  return (
    <div className="abt-end__snaps" ref={box} aria-hidden="true" onPointerLeave={() => setHover(null)}>
      {PHOTOS.map((p, n) => (
        <motion.img
          key={p.src}
          src={p.src}
          alt=""
          className={`abt-end__snap${hover === n ? ' is-lifted' : ''}`}
          style={{ left: `${p.x}%`, top: p.y, zIndex: top === n ? 3 : 1 }}
          initial={false}
          animate={state(p, n)}
          transition={{ type: 'spring', stiffness: 220, damping: 24, delay: settled ? 0 : 0.15 + n * 0.12 }}
          onPointerEnter={() => {
            setHover(n);
            setTop(n);
          }}
        />
      ))}
    </div>
  );
}

// Going to the story page: a disc of the accent grows from the button until it fills the screen, then
// the page changes under it. Modified clicks (new tab) and visitors who ask for less motion just follow
// the link.
function useStoryGo() {
  const [origin, setOrigin] = useState(null);

  useEffect(() => {
    const reset = () => setOrigin(null);
    window.addEventListener('pageshow', reset); // coming Back to a page restored from cache
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const go = (event, ref) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
    const href = event.currentTarget.getAttribute('href');
    event.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.assign(href);
      return;
    }
    const r = (ref.current ?? event.currentTarget).getBoundingClientRect();
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    window.setTimeout(() => window.location.assign(href), 950);
  };

  const overlay = origin
    ? createPortal(
        <motion.div
          className="abt-end__overlay"
          initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
          animate={{ clipPath: `circle(150vmax at ${origin.x}px ${origin.y}px)` }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.3, 1] }}
        />,
        document.body
      )
    : null;
  return [go, overlay];
}
