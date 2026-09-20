'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { EASE, useReduce } from '@/components/case-study-kit/Motion';
import { useT } from '@/components/i18n/LangProvider';

/* ------------------------------------------------------------- Lightbox */

// Full-size view of a screenshot. Portalled to <body> because the sections it is opened from are
// transformed (scroll animation), which would otherwise trap a fixed-position overlay.
function Lightbox({ items, index, onIndex, onClose }) {
  const reduce = useReduce();
  const t = useT();
  const item = index === null ? null : items[index];
  const closeRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The key handler must see the latest props without the effect (focus, scroll lock) re-running.
  const latest = useRef({});
  latest.current = { count: items.length, onIndex, onClose };
  const step = useCallback((dir) => latest.current.onIndex((i) => (i + dir + latest.current.count) % latest.current.count), []);
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') latest.current.onClose();
      else if (e.key === 'ArrowRight' && latest.current.count > 1) step(1);
      else if (e.key === 'ArrowLeft' && latest.current.count > 1) step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [isOpen, step]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          className="px-lb"
          role="dialog"
          aria-modal="true"
          aria-label={t('ui.screenshot', 'Screenshot')}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <button ref={closeRef} type="button" className="px-lb__close" aria-label={t('ui.close', 'Close')} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {items.length > 1 && (
            <>
              <button type="button" className="px-lb__nav px-lb__nav--prev" aria-label={t('ui.prevShot', 'Previous screenshot')} onClick={(e) => { e.stopPropagation(); step(-1); }}>
                ←
              </button>
              <button type="button" className="px-lb__nav px-lb__nav--next" aria-label={t('ui.nextShot', 'Next screenshot')} onClick={(e) => { e.stopPropagation(); step(1); }}>
                →
              </button>
            </>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={item.src}
              className="px-lb__figure"
              initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={item.src} alt={item.alt} width={item.width} height={item.height} />
              <figcaption>
                {items.length > 1 && (
                  <span className="px-lb__count">
                    {index + 1} / {items.length}
                  </span>
                )}
                {item.caption}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9.5 2H14v4.5M6.5 14H2V9.5M14 2 9.5 6.5M2 14l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------------------------------------- Gallery */

const TILE = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: EASE } },
};

// With reduced motion the tiles still pass through the same states (the server renders the hidden
// one), but arrive instantly.
const TILE_STILL = { hidden: TILE.hidden, show: { ...TILE.show, transition: { duration: 0 } } };

// Every screenshot is a tile with the same shape — the frame crops to the top of the screen — set
// side by side in a grid; clicking one opens it full size. An item with `placeholder` in place of
// `src` holds a tile's place until its image exists.
//
// `fit` says how an image sits in its frame:
//   'cover'   (default) fills the 5:4 frame, cropped to the top — right for full-screen screenshots;
//   'contain' shows the whole image inside the 5:4 frame — right for cropped UI panels;
//   'natural' makes the frame the image's own shape — right for wide diagrams and strips, which a 5:4
//             frame would crop or shrink to a sliver.
// An item can override the gallery's `fit`. `caption` is one caption under the whole gallery (use it
// when a set of images is explained together); `maxWidth` keeps a lone image from filling the column.
export function Gallery({ items, columns = 3, fit = 'cover', caption, maxWidth }) {
  const reduce = useReduce();
  const t = useT();
  const [open, setOpen] = useState(null);

  const zoomable = items.filter((item) => item.src);
  const zoomIndex = (item) => zoomable.indexOf(item);

  return (
    <div className="px-gallery" style={{ '--cols': columns, ...(maxWidth ? { maxWidth } : {}) }}>
      <motion.div
        className="px-gallery__track"
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.12 } } }}
      >
        {items.map((item) => {
          const mode = item.fit ?? fit;
          return (
            <motion.figure key={item.src ?? item.placeholder} className="px-tile" variants={reduce ? TILE_STILL : TILE}>
              {item.src ? (
                <button
                  type="button"
                  className={`px-tile__frame is-${mode}`}
                  style={mode === 'natural' ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
                  onClick={() => setOpen(zoomIndex(item))}
                  aria-label={t('ui.enlarge', 'Enlarge: {alt}', { alt: item.alt })}
                >
                  <img src={item.src} alt="" width={item.width} height={item.height} loading="lazy" />
                  <span className="px-tile__zoom">
                    <ZoomIcon />
                  </span>
                </button>
              ) : (
                <div className="px-tile__frame px-tile__frame--empty">
                  <span className="px-tile__tag">{t('ui.visualPlaceholder', 'Visual placeholder')}</span>
                  <span>{item.placeholder}</span>
                </div>
              )}
              {item.caption && <figcaption className="px-tile__caption">{item.caption}</figcaption>}
            </motion.figure>
          );
        })}
      </motion.div>
      {caption && <p className="px-gallery__caption">{caption}</p>}
      <Lightbox items={zoomable} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </div>
  );
}
Gallery.lxSelfReveal = true;

/* ------------------------------------------------------------- Sequence */

// A short animated walk through related screens: one frame that cycles through them on its own
// once it is on screen (paused while hovered or focused), with a list beside it that shows where
// you are and lets you jump. Clicking the frame opens the current screen full size. `wide` frames
// landscape screens (5:4) instead of phone-shaped ones.
// items: [{ src, alt, width, height, label, caption }]
export function Sequence({ items, interval = 3600, wide = false }) {
  const reduce = useReduce();
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-15% 0px -15% 0px' });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(null);
  const [tick, setTick] = useState(0);

  const playing = inView && !paused && !reduce && zoom === null;

  // Advance on a timer; `tick` restarts it after a manual jump so a click isn't immediately overridden.
  // The progress bar is keyed the same way, so it and the timer always start together.
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % items.length), interval);
    return () => window.clearTimeout(timer);
  }, [playing, active, tick, interval, items.length]);

  const current = items[active];
  const jump = (i) => {
    setActive(i);
    setTick((t) => t + 1);
  };

  return (
    <div
      ref={ref}
      className={`px-seq${wide ? ' px-seq--wide' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button type="button" className="px-seq__stage" onClick={() => setZoom(active)} aria-label={t('ui.enlarge', 'Enlarge: {alt}', { alt: current.alt })}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={current.src}
            src={current.src}
            alt=""
            width={current.width}
            height={current.height}
            initial={reduce ? false : { opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </AnimatePresence>
        <span className="px-tile__zoom">
          <ZoomIcon />
        </span>
      </button>

      <ol className="px-seq__list">
        {items.map((item, i) => (
          <li key={item.src}>
            <button type="button" className={`px-seq__item${i === active ? ' is-active' : ''}`} aria-current={i === active} onClick={() => jump(i)}>
              <span className="px-seq__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="px-seq__label">{item.label}</span>
              <span className="px-seq__bar" aria-hidden="true">
                <i
                  key={i === active ? `on-${tick}-${active}-${paused}` : 'off'}
                  style={i === active ? { animationDuration: `${interval}ms`, animationPlayState: playing ? 'running' : 'paused' } : undefined}
                  className={i === active ? 'is-running' : undefined}
                />
              </span>
              <AnimatePresence initial={false}>
                {i === active && (
                  <motion.span
                    className="px-seq__caption"
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <span>{item.caption}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </li>
        ))}
      </ol>

      <Lightbox items={items} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />
    </div>
  );
}
Sequence.lxSelfReveal = true;
