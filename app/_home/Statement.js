'use client';

import { Fragment, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'motion/react';
import { FACE } from './fonts';
import portrait from './art/portrait-chip.webp';
import art from './art/statement-art.webp';
import wide from './art/statement-art-wide.webp';

gsap.registerPlugin(ScrollTrigger);

// The statement, as runs of words, key phrases (underlined) and small emblems set in the line between
// them.
const STATEMENT = [
  'A beautiful answer to',
  { key: 'the wrong question' },
  'is still wrong.',
  { icon: 'star' },
  'I’ve spent over a decade leading design teams,',
  { icon: 'portrait' },
  'untangling complex problems, and shaping products that make sense to people and to the businesses behind them. I use',
  { key: 'evidence' },
  'to challenge assumptions,',
  { key: 'intuition' },
  'to connect the dots, and',
  { key: 'craft' },
  'to make the result feel effortless.',
  { icon: 'burst' },
  'I’m most interested in the moment a team stops asking, “What should we make?” and starts asking,',
  { key: '“What needs to change?”' },
];
const TICKS = 34;
const HOLD = 0.5; // how long it holds on screen, in screen heights of scroll

// Under the hero: a full-width band, following the site's theme, with an illustration on the left and
// the statement in a column beside it, played by the scroll (GSAP ScrollTrigger). It starts faint and
// each word lights up to full as the scroll reaches it, from as the text comes into view, the key
// phrases underlined as their words light; the section holds, centred on screen, until they all
// have, then lets the page go on.
// A ruler down the side fills as it plays. With reduced motion it is simply there, whole.
export default function Statement() {
  const section = useRef(null);
  const text = useRef(null);
  const ruler = useRef(null);
  const still = useReducedMotion();

  useEffect(() => {
    if (still) return undefined;
    let ctx;
    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        const words = [...text.current.querySelectorAll('.hx-st__w')];
        const keys = [...text.current.querySelectorAll('.hx-st__key')];
        // It holds with its content centred on the screen for half a screen's scroll. The words start
        // lighting earlier, as the text comes up into view, and are all lit as the hold ends.
        const hold = Math.round(window.innerHeight * HOLD);
        ScrollTrigger.create({ trigger: section.current, start: 'center center', end: `+=${hold}`, pin: true });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: text.current,
            start: 'top 80%',
            endTrigger: section.current,
            end: `center center-=${hold}`,
            scrub: 0.5,
            onUpdate: (self) => ruler.current?.style.setProperty('--p', self.progress.toFixed(4)),
          },
        });

        // A key phrase's underline is drawn in with its own words, never ahead of them.
        const underline = (key, at, span) =>
          tl.fromTo(key, { backgroundSize: '0% 0.06em' }, { backgroundSize: '100% 0.06em', duration: span, ease: 'power1.out' }, at);

        tl.fromTo(words, { opacity: 0.14 }, { opacity: 1, duration: 0.25, stagger: 0.06 }, 0);
        keys.forEach((k) => {
          const own = k.querySelectorAll('.hx-st__w');
          underline(k, words.indexOf(own[0]) * 0.06, own.length * 0.06 + 0.2);
        });
        tl.fromTo('.hx-st__icon', { scale: 0.3, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.3, stagger: 0.9, ease: 'back.out(2)' }, 0.1);
      }, section);
    };
    build();
    // Rebuilt when the column's width changes (the pinned length depends on it).
    let width = text.current.offsetWidth;
    let timer = 0;
    const watch = new ResizeObserver(() => {
      if (Math.abs(text.current.offsetWidth - width) < 2) return;
      width = text.current.offsetWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 200);
    });
    watch.observe(text.current);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      window.clearTimeout(timer);
      watch.disconnect();
      ctx?.revert();
    };
  }, [still]);

  // Words each in their own span, so they can light up one at a time.
  const words = (run, at) =>
    run.split(' ').map((word, i, all) => (
      <Fragment key={`${at}-${i}`}>
        <span className="hx-st__w">{word}</span>
        {i < all.length - 1 ? ' ' : null}
      </Fragment>
    ));

  return (
    <section ref={section} className="hx-st" aria-label="What I do">
      <div className="hx-st__inner">
        {/* It rises and opens out of a narrower crop as the section comes into view. */}
        <motion.div
          className="hx-st__art"
          initial={{ opacity: 0, y: 40, clipPath: 'inset(10% 14% 10% 14% round 24px)' }}
          whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* On a phone, the landscape version, as a low banner above the words. */}
          <picture>
            <source media="(max-width: 700px)" srcSet={wide.src} width={wide.width} height={wide.height} />
            <img
              src={art.src}
              width={art.width}
              height={art.height}
              alt="Illustration of a red-arched workshop: a woodworking bench, a CNC machine, travel photos and plants, with steps leading out to hills at dusk."
              loading="lazy"
              decoding="async"
            />
          </picture>
        </motion.div>
        <p ref={text} className="hx-st__text" style={{ fontFamily: FACE.family, fontWeight: 500 }}>
          {STATEMENT.map((part, at) => {
            // Runs are joined by a space; the parts are inline, so the line breaks between words.
            if (typeof part === 'string') return <Fragment key={at}>{words(part, at)} </Fragment>;
            if (part.key) {
              return (
                <Fragment key={at}>
                  <span className="hx-st__key">{words(part.key, at)}</span>{' '}
                </Fragment>
              );
            }
            return (
              <Fragment key={at}>
                <Icon kind={part.icon} />{' '}
              </Fragment>
            );
          })}
        </p>
        <div ref={ruler} className="hx-st__ruler" aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => (
            <i key={i} style={{ '--i': i / (TICKS - 1) }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// The small emblems set between the words: the logo's star, the portrait, a burst.
function Icon({ kind }) {
  return (
    <span className={`hx-st__w hx-st__icon hx-st__icon--${kind}`} aria-hidden="true">
      {kind === 'portrait' ? (
        <img src={portrait.src} alt="" width={portrait.width} height={portrait.height} />
      ) : (
        <svg viewBox="0 0 24 24">
          {kind === 'star' ? (
            <path d="M12 0C12.6 6.6 17.4 11.4 24 12 17.4 12.6 12.6 17.4 12 24 11.4 17.4 6.6 12.6 0 12 6.6 11.4 11.4 6.6 12 0Z" />
          ) : (
            Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x="11" y="1" width="2" height="8" rx="1" transform={`rotate(${i * 30} 12 12)`} />
            ))
          )}
        </svg>
      )}
    </span>
  );
}
