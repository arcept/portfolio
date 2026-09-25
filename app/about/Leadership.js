'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { LEADERSHIP } from './lenses-content';
import useFullBleed from './useFullBleed';

const EASE = [0.16, 1, 0.3, 1];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// Section 03. A card that runs almost the width of the window (the page's column is offset by the
// rail, so it measures where it would sit and pulls itself out), holding its content to a centred
// column. Headline and subheading across the top, with the hand-lettered "When I lead" beside the
// headline; then three columns — the admission, the paragraph, and a slot for a testimonial. On
// phones the columns stack and the admission sits behind a button. The card is in the opposite theme
// to the page: light on the dark page, dark on the light page.
export default function Leadership() {
  const copy = LEADERSHIP;
  const card = useRef(null);
  const head = useRef(null);
  const anchor = useRef(null);
  const title = useRef(null);
  const [open, setOpen] = useState(false);
  const progress = useLitProgress(head);
  useFullBleed(card, 52);
  useTightWidth(anchor, title);

  return (
    <section className="abt-leadership" id="leadership" aria-labelledby="abt-leadership-title">
      <motion.div className="ldr" ref={card} {...rise(0)}>
        <div className="ldr__inner">
          <p className="abt-label">
            <span className="abt-label__index">03</span>
            <span className="abt-label__rule" aria-hidden="true" />
            <span>{copy.label}</span>
          </p>

          <div className="ldr__head" ref={head}>
            <div className="ldr__anchor" ref={anchor}>
              <motion.span
                className="abt-sticker ldr__sticker"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay: 0.6 }}
              >
                <img src="/about/stickers/when-i-lead.svg" alt="" width={416} height={299} />
              </motion.span>
              <h2 className="ldr__title" id="abt-leadership-title" ref={title}>
                <LitWords text={copy.headline} progress={progress} />
              </h2>
            </div>
            <motion.p className="ldr__sub" {...rise(0.1)}>
              {copy.subheading}
            </motion.p>
          </div>

          <div className="ldr__cols">
            <motion.p className="ldr__body" {...rise(0.05)}>
              {copy.body}
            </motion.p>

            <motion.div className={`ldr__harder${open ? ' is-open' : ''}`} {...rise(0.12)}>
              <button
                type="button"
                className="ldr__toggle"
                aria-expanded={open}
                aria-controls="ldr-harder-text"
                onClick={() => setOpen((v) => !v)}
              >
                <span>{open ? 'Close' : 'The harder part'}</span>
                <span className="ldr__mark" aria-hidden="true" />
              </button>
              <div className="ldr__fold" id="ldr-harder-text">
                <p>{copy.harder}</p>
              </div>
            </motion.div>

            <motion.figure className="ldr__quote" {...rise(0.2)}>
              <p className="ldr__quotekicker">Testimonial slot</p>
              <blockquote className="ldr__quotetext">
                A short, specific answer from someone who worked with you, for example a designer you led.
              </blockquote>
              <figcaption className="ldr__quotewho">Name · Role</figcaption>
            </motion.figure>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// 0 when the block's top is 85% of the way down the viewport, 1 when its bottom reaches the middle.
function useLitProgress(ref) {
  const progress = useMotionValue(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      progress.set(Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.35 + r.height))));
    };
    update();
    const sizes = new ResizeObserver(update);
    sizes.observe(el);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      sizes.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref, progress]);
  return progress;
}

// Words that go from dim to lit as `progress` (0..1) passes through them, in order. Visitors who ask
// for less motion get them fully lit (see .ldr__title in about.css).
function LitWords({ text, progress }) {
  const words = text.split(' ');
  return words.map((word, i) => (
    <LitWord key={`${word}-${i}`} progress={progress} from={i / words.length} to={(i + 1) / words.length}>
      {word}
    </LitWord>
  ));
}

function LitWord({ progress, from, to, children }) {
  const opacity = useTransform(progress, [from, to], [0.16, 1]);
  return (
    <>
      <motion.span className="ldr__word" style={{ opacity }}>
        {children}
      </motion.span>{' '}
    </>
  );
}

// Shrinks `ref` to the widest line of the text in `textRef`, so the sticker anchored to its corner
// sits beside the words instead of at the far edge of the space the wrapped text could have used.
function useTightWidth(ref, textRef) {
  useEffect(() => {
    const box = ref.current;
    const text = textRef.current;
    if (!box || !text) return undefined;
    const fit = () => {
      box.style.width = '';
      const range = document.createRange();
      range.selectNodeContents(text);
      const start = box.getBoundingClientRect().left;
      let right = 0;
      for (const r of range.getClientRects()) right = Math.max(right, r.right);
      if (right > start) box.style.width = `${Math.ceil(right - start) + 2}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    // A viewport-width listener, not a ResizeObserver on the document: the document's content-box
    // height changes on every layout shift anywhere on the page (not just real resizes), which would
    // refire this and thrash `box.style.width` mid-scroll.
    window.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
      box.style.width = '';
    };
  }, [ref, textRef]);
}
