'use client';

import { motion } from 'motion/react';
import ResumeDialog from '@/app/about/resume/ResumeDialog';
import { PAIRS } from '@/app/about/lenses-content';
import Glow from '@/app/_home/Glow';
import useTheme from '@/app/_home/useTheme';
import { FACE } from '@/app/_home/fonts';
import { FootRow, Wordmark } from '@/app/_home/AboutMe';
import portrait from '@/app/_home/art/portrait-3.webp';
import ChannelList from './ChannelList';
import Clock from './Clocks';
import Topics from './Topics';
import { doto } from './clock-font';
import { EASE, PAGES, pad } from './data';

// The Contact page. The four ways to reach me set big (after the full-screen menu) beside the
// portrait, star and headline from the homepage's ending; under them a bento row of frosted tiles, the
// résumé first; and the homepage's ending to close: the red grainy wave across the full width, the
// three-column last line and "Manik Madaan" cut off by the page's edge.

const WAVE = ['#ff4537', '#e41f18', '#fe887b'];
const TINT = '#d9b6b6';
const STAR = 'M12 0C12.6 6.6 17.4 11.4 24 12 17.4 12.6 12.6 17.4 12 24 11.4 17.4 6.6 12.6 0 12 6.6 11.4 11.4 6.6 12 0Z';

const PLACES = [
  { name: 'India', note: 'Delhi NCR, now' },
  { name: 'Italy', note: 'Lived and studied' },
  { name: 'United States', note: 'Lived and studied' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// Tiles come in as they scroll into view.
const tile = (i) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: EASE, delay: i * 0.06 },
});

export default function ContactHybrid() {
  // On the light ground the glow keeps most of its red: going far towards white washed it out.
  const light = useTheme() === 'light';

  return (
    <main className={`hx-me cth ${doto.variable}`} style={{ '--hx-me-face': FACE.family, '--hx-me-tint': TINT }}>
      <Glow colours={WAVE} pale={light ? 0.06 : 0} className="hx-me__glow" />

      <div className="cth__top">
        <header className="cth__head">
          <motion.div className="cth__who" {...fade(0.05)}>
            <motion.img
              src={portrait.src}
              alt=""
              className="cth__avatar"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            />
            <span className="cth__kicker">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={STAR} />
              </svg>
              Contact
            </span>
          </motion.div>
          <motion.h1 className="cth__title" {...fade(0.15)}>
            Got a complicated problem? <span>Let’s talk it through.</span>
          </motion.h1>
        </header>

        <ChannelList />
      </div>

      <section className="cth__bento" aria-label="More about getting in touch">
        <motion.div className="cth__tile cth__resume" {...tile(0)}>
          <img className="cth__resume-art" src="/about/resume/illustration.webp" alt="" />
          <div className="cth__resume-body">
            <h2 className="cth__tile-kicker">Résumé</h2>
            <p className="cth__resume-title">Experience, skills and education.</p>
            <p className="cth__resume-line">A designed one for reading, and an ATS-friendly one for job portals.</p>
            <ResumeDialog className="cth__resume-btn">Download résumé</ResumeDialog>
          </div>
        </motion.div>

        <motion.figure className="cth__tile cth__person" {...tile(1)}>
          <img src="/home/about-me-still.webp" alt="Manik in a pink T-shirt on a street strung with lights." />
          <figcaption>
            <span className="cth__tile-kicker">Who you’re writing to</span>
            <span className="cth__person-name">Manik Madaan</span>
            <span className="cth__meta">Product design leader · Delhi NCR</span>
          </figcaption>
        </motion.figure>

        <motion.div className="cth__tile cth__clock" {...tile(2)}>
          <Clock />
        </motion.div>

        <motion.nav className="cth__tile cth__pages" aria-label="Pages" {...tile(3)}>
          <h2 className="cth__tile-kicker">Pages</h2>
          <ul>
            {PAGES.map((p) => (
              <li key={p.label}>
                <a href={p.href}>
                  <span className="cth__page-label" data-text={p.label}>
                    <span>{p.label}</span>
                  </span>
                  <span className="cth__page-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>

        <motion.div className="cth__tile cth__topics" {...tile(4)}>
          <Topics />
        </motion.div>

        <motion.div className="cth__tile cth__principles" {...tile(5)}>
          <h2 className="cth__tile-kicker">How I work</h2>
          <ol>
            {PAIRS.map((p, i) => (
              <li key={p.id}>
                <span className="cth__p-num" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span>
                  <span className="cth__p-title">{p.title}</span>
                  <span className="cth__meta">{p.note}</span>
                </span>
              </li>
            ))}
          </ol>
          <a className="cth__more" href="/about#how-i-work">
            Read how I work <span aria-hidden="true">→</span>
          </a>
        </motion.div>

        <motion.div className="cth__tile cth__places" {...tile(6)}>
          <h2 className="cth__tile-kicker">Where I’ve lived</h2>
          <span className="cth__maps" aria-hidden="true">
            <span className="cth__map cth__map--west" />
            <span className="cth__map cth__map--asia" />
          </span>
          <ul>
            {PLACES.map((p, i) => (
              <li key={p.name} className={i === 0 ? 'is-now' : ''}>
                <span className="cth__place">{p.name}</span>
                <span className="cth__meta">{p.note}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <div className="hx-me__base">
        <FootRow />
        <Wordmark />
      </div>
    </main>
  );
}
