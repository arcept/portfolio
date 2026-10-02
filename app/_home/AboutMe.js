'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useSpring } from 'motion/react';
import ResumeDialog from '@/app/about/resume/ResumeDialog';
import NameSticker from './NameSticker';
import Glow from './Glow';
import useTheme from './useTheme';
import { FACE } from './fonts';
import portrait from './art/portrait-3.webp';

// The homepage's closing section, which stands in for the site footer: a short letter about Manik beside
// a video of him at his desk (wide screens only), the ways onward (the About page first, then the résumé, LinkedIn and
// contact), the page's last line, and "Manik Madaan" across the whole width, its feet cut off by the
// page's edge. Behind it all a grainy red glow rises from the foot (Glow.js), after midu.design's hero;
// the name lights up where the glow is. It follows the theme. Built in the About section lab (option G).

const EASE = [0.16, 1, 0.3, 1];
const STAR = 'M12 0C12.6 6.6 17.4 11.4 24 12 17.4 12.6 12.6 17.4 12 24 11.4 17.4 6.6 12.6 0 12 6.6 11.4 11.4 6.6 12 0Z';

const LETTER = [
  'I’m Manik Madaan, a product design leader based in Delhi NCR. I’ve lived and studied in India, Italy and the US, and each place added a perspective I couldn’t have found in one.',
  'My work has crossed studios, agencies and startups, from hands-on screens to building design teams and their systems. I’m most useful when a problem is complicated and another feature won’t fix it.',
  'The tools keep changing: Photoshop, then prototypes, then systems, and now AI, which turns an interface into a working product. What stays is the habit of noticing, questioning and simplifying.',
];

const LINKS = {
  about: '/about',
  contact: '/contact',
  linkedin: 'https://www.linkedin.com/in/manikmadaan/',
  email: 'contact@arcept.in',
};

// The glow's colours (edge, body, foot), and the pale tint the name is filled with.
const WAVE = ['#ff4537', '#e41f18', '#fe887b'];
const TINT = '#d9b6b6';

const rise = (delay = 0, y = 24) => ({
  initial: { opacity: 0, y, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1, ease: EASE, delay },
});

// `lead` is anything that opens the section above the letter, on the same glow (a case study's "Up
// next", components/case-study-kit/CaseStudyEnd.js).
export default function AboutMe({ lead }) {
  const sign = useRef(null);
  const signed = useInView(sign, { once: true, amount: 1 });
  // On the light ground the glow's colours go a little paler.
  const light = useTheme() === 'light';
  const wide = useWide();

  return (
    <section className="hx-me" id="about" style={{ '--hx-me-face': FACE.family, '--hx-me-tint': TINT }} aria-labelledby="hx-me-title">
      <Glow colours={WAVE} pale={light ? 0.28 : 0} className="hx-me__glow" />

      {lead && <div className="hx-me__lead">{lead}</div>}

      <motion.div className="hx-me__body" {...rise(0.05, 40)}>
        <div className="hx-me__inner">
          <header className="hx-me__head">
            <motion.img
              src={portrait.src}
              alt=""
              className="hx-me__avatar"
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
            />
            <motion.h2 className="hx-me__title" id="hx-me-title" {...rise(0.25, 12)}>
              <svg className="hx-me__star" viewBox="0 0 24 24" aria-hidden="true">
                <path d={STAR} />
              </svg>
              About me
            </motion.h2>
          </header>

          {/* No video on phones: not even fetched there. */}
          {wide && (
            <div className="hx-me__media">
              <Tilt>
                <Clip />
              </Tilt>
            </div>
          )}

          <div className="hx-me__letter">
            <div className="hx-me__paras">
              {LETTER.map((text, i) => (
                <motion.p className="hx-me__text" key={i} {...rise(0.15 + i * 0.1)}>
                  {text}
                </motion.p>
              ))}
            </div>

            <div className="hx-me__sign" ref={sign}>
              <NameSticker ready={signed} index={1} />
            </div>

            <motion.ul className="hx-me__links" {...rise(0.2)}>
              <li>
                <a href={LINKS.about} className="abt-link hx-me__link">
                  <span className="abt-link__label">More about me</span>
                  <span className="abt-link__arrow" aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <ResumeDialog className="hx-me__link">Résumé</ResumeDialog>
              </li>
              <li>
                <a href={LINKS.linkedin} className="abt-link hx-me__link" target="_blank" rel="noopener noreferrer">
                  <span className="abt-link__label">LinkedIn</span>
                  <span className="abt-link__arrow" aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={LINKS.contact} className="abt-link hx-me__link">
                  <span className="abt-link__label">Contact</span>
                </a>
              </li>
            </motion.ul>
          </div>
        </div>
      </motion.div>

      <div className="hx-me__base">
        <FootRow />
        <Wordmark />
      </div>
    </section>
  );
}

// Whether the window is wide enough for the video (900px and up). Not until it has mounted, so a phone
// never starts fetching it.
function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px)');
    const read = () => setWide(query.matches);
    read();
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);
  return wide;
}

// Leans a few degrees towards a mouse pointer over it and lifts a little, springing back when it
// leaves. Touch never moves it, and nor does it for visitors who ask for less motion.
function Tilt({ children }) {
  const still = useReducedMotion();
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const y = useSpring(0, spring);
  const move = (e) => {
    if (still || e.pointerType !== 'mouse') return;
    const box = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - box.left) / box.width - 0.5) * 8);
    rotateX.set(-((e.clientY - box.top) / box.height - 0.5) * 8);
    y.set(-6);
  };
  const leave = () => {
    rotateX.set(0);
    rotateY.set(0);
    y.set(0);
  };
  return (
    <motion.div className="hx-me__tilt" style={{ rotateX, rotateY, y, transformPerspective: 900 }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.div>
  );
}

// The video: silent, looping, no controls. The street photograph shows until it plays, and stays if it
// never does (or for visitors who ask for less motion). It only plays while it is near the screen.
function Clip() {
  const box = useRef(null);
  const video = useRef(null);
  const still = useReducedMotion();
  const near = useInView(box, { margin: '200px 0px' });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v || still) return;
    if (near) v.play().catch(() => {});
    else v.pause();
  }, [near, still]);

  return (
    <motion.div
      ref={box}
      className="hx-me__clip"
      role="img"
      aria-label="An animated illustration of Manik in a pink T-shirt, drawing at his desk and waving."
      initial={{ opacity: 0, y: 32, clipPath: 'inset(8% 10% 8% 10% round 24px)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
    >
      <img className="hx-me__still" src="/home/about-me-still.webp" alt="" width={720} height={1280} />
      {!still && (
        <video
          ref={video}
          className={`hx-me__video${playing ? ' is-playing' : ''}`}
          src="/home/about-me.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
        />
      )}
    </motion.div>
  );
}

// The page's last line, in three columns of two lines: the way back to the top over the time in New
// Delhi (live, to the second), a line about the work over the email, and the cookie settings over the
// copyright.
function FootRow() {
  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <div className="hx-me__foot">
      <div className="hx-me__col hx-me__col--start">
        <a href="#top" onClick={toTop}>
          Back to top <span aria-hidden="true">↑</span>
        </a>
        <span>
          New Delhi <Clock /> <span className="hx-me__zone">[GMT +5:30]</span>
        </span>
      </div>
      <div className="hx-me__col hx-me__col--mid">
        <span>
          Designing from India, for teams anywhere{' '}
          <svg className="hx-me__foot-star" viewBox="0 0 24 24" aria-hidden="true">
            <path d={STAR} />
          </svg>
        </span>
        <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
      </div>
      <div className="hx-me__col hx-me__col--end">
        <button type="button" onClick={() => window.openCookieSettings?.()}>
          Cookie settings
        </button>
        <span>© 2026 Manik Madaan</span>
      </div>
    </div>
  );
}

// The time in New Delhi, ticking each second. Blank until it has mounted, so the page the server sends
// never disagrees with the one the browser draws.
function Clock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const tick = () => setNow(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <time className="hx-me__clock">{now ?? ' '}</time>;
}

// "Manik Madaan" on one line, sized to run exactly the width it is given (measured once the face has
// loaded, and again whenever the width changes). It rises in once seen.
//
// Blurred towards its foot: the name is drawn four times, one copy over another, sharp and then at 2,
// 4 and 8px of blur, each shown only in its own band, so they crossfade from sharp at half the visible
// height of the letters to 8px at the page's edge. The glow behind stays sharp; the stack is
// colour-dodged over it as one layer (home.css).
const BLUR_STEPS = [0, 2, 4, 8];

function Wordmark() {
  const box = useRef(null);
  const stack = useRef(null);
  const word = useRef(null);

  useEffect(() => {
    const b = box.current;
    const st = stack.current;
    const w = word.current;
    if (!b || !st || !w) return undefined;
    const fit = () => {
      st.style.fontSize = '100px';
      st.style.fontSize = `${(100 * b.clientWidth) / w.scrollWidth}px`;
    };
    const sizer = new ResizeObserver(fit);
    sizer.observe(b);
    document.fonts?.ready.then(fit);
    fit();
    return () => sizer.disconnect();
  }, []);

  return (
    <div className="hx-me__namebox" ref={box}>
      <motion.div
        className="hx-me__stack"
        ref={stack}
        aria-hidden="true"
        initial={{ y: '30%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
      >
        {BLUR_STEPS.map((px, i) => (
          <p key={px} ref={i === 0 ? word : undefined} className="hx-me__name" style={{ filter: px ? `blur(${px}px)` : undefined, ...band(i) }}>
            Manik Madaan
          </p>
        ))}
      </motion.div>
    </div>
  );
}

// Where each copy shows, down the name's own box (line-height 1, so 0% is the top of the line and 100%
// its foot). The letters show from their tops, about 22% down, to the page's edge at 82% (the stack
// is pushed 18% below it), so half their visible height is at 52%: sharp above that, then a band per
// step to 82%, each fading in over the one before.
const EDGES = [52, 62, 72, 82];
function band(i) {
  const last = BLUR_STEPS.length - 1;
  let mask;
  if (i === 0) mask = `linear-gradient(to bottom, #000 ${EDGES[0]}%, transparent ${EDGES[1]}%)`;
  else if (i === last) mask = `linear-gradient(to bottom, transparent ${EDGES[i - 1]}%, #000 ${EDGES[i]}%)`;
  else mask = `linear-gradient(to bottom, transparent ${EDGES[i - 1]}%, #000 ${EDGES[i]}%, transparent ${EDGES[i + 1]}%)`;
  return { WebkitMaskImage: mask, maskImage: mask };
}
