'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';

// The photograph is not given a column of its own. It appears beside the pointer while the visitor
// is actually over the sentences about him, and follows with a little lag, so the person arrives
// with the words rather than as a separate exhibit. Wrap it around the text alone.
//
// Where there is no hover (touch, and reduced motion) the photograph is shown in place instead —
// .abt-hovershot--static in about.css — so it is never only available to a mouse.
export default function HoverPortrait({ children }) {
  const { zoneProps, shot } = useHoverShot({ src: '/about/manik-street.jpg', width: 1500, height: 2000, priority: true });
  return (
    <div className="abt-hoverzone" {...zoneProps}>
      {children}
      {shot}
    </div>
  );
}

// The photograph that follows the pointer, as a hook so other parts of the page can use the same
// treatment on an element of their own: spread `zoneProps` onto the element to hover and render `shot`
// anywhere. By default the photograph appears only over the lines of that element's first child (the
// sentences); `whole` makes the whole element count, and `enabled: false` turns it off.
export function useHoverShot({ src, width, height, whole = false, enabled = true, className = '', priority = false }) {
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const area = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  // A little tilt from how fast the pointer is travelling sideways.
  const tilt = useTransform(sx, (value) => (value - x.get()) * 0.05);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!enabled) setShown(false);
  }, [enabled]);

  // True only when the pointer is over a line of the text itself. A Range gives one rect per line,
  // so the ragged right edge, the gap under the last line and the space around the paragraph are all
  // outside — the photograph belongs to the sentences, not to the column's empty space.
  const overText = (clientX, clientY) => {
    if (whole) return true;
    const text = area.current?.firstElementChild;
    if (!text) return false;
    const range = document.createRange();
    range.selectNodeContents(text);
    for (const r of range.getClientRects()) {
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return true;
    }
    return false;
  };

  const track = (event) => {
    if (event.pointerType === 'touch' || !enabled) return;
    if (!overText(event.clientX, event.clientY)) {
      if (shown) setShown(false);
      return;
    }
    x.set(event.clientX);
    y.set(event.clientY);
    if (!shown) {
      // The springs rest at 0,0 until they are given a position, so without this the photograph
      // flies in from the top-left corner the first time. Jump sets them with no travel.
      sx.jump(event.clientX);
      sy.jump(event.clientY);
      setShown(true);
    }
  };

  const zoneProps = { ref: area, onPointerMove: track, onPointerLeave: () => setShown(false) };

  // Rendered into <body>: a transformed ancestor (the parallax, the entrance animations) becomes the
  // containing block for position:fixed, and the photograph would drift away from the cursor.
  const shot =
    mounted &&
    createPortal(
      <AnimatePresence>
        {shown && (
          <motion.figure
            className={`abt-hovershot ${className}`}
            style={{ left: sx, top: sy, rotate: tilt }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            <Image src={src} alt="" width={width} height={height} sizes="320px" priority={priority} />
          </motion.figure>
        )}
      </AnimatePresence>,
      document.body
    );

  return { zoneProps, shot };
}

// The photographs, for anyone who cannot hover (touch, and reduced motion): a swipeable horizontal
// set rather than the single portrait the cursor follows on desktop. It arrives the way everything
// else on this page arrives: nothing is simply present when it comes into view.
const GALLERY = [
  {
    src: '/about/gallery/street.jpg',
    width: 1500,
    height: 2000,
    alt: 'Manik Madaan standing in the middle of a wet street at dusk, string lights overhead.',
  },
  {
    src: '/about/gallery/bangkok.jpg',
    width: 675,
    height: 900,
    alt: 'Manik Madaan crossing a footbridge above traffic in Bangkok, carrying tote bags, the skyline behind him.',
  },
  {
    src: '/about/gallery/cafe.jpg',
    width: 675,
    height: 900,
    alt: 'Manik Madaan sitting in a café, mid-sip from a blue cup, looking off to the side.',
  },
  {
    src: '/about/gallery/novatr-team.jpg',
    width: 675,
    height: 900,
    alt: 'Manik Madaan and three former colleagues, arms around each other, in their office.',
  },
];

export function TouchGallery() {
  const box = useRef(null);
  const shown = useInView(box, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={box}
      className="abt-gallery-wrap"
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 30, filter: shown ? 'blur(0px)' : 'blur(8px)' }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: shown ? 1.3 : 0 }}
    >
      <div className="abt-gallery">
        {GALLERY.map((photo, i) => (
          <figure className="abt-gallery__slide" key={photo.src}>
            <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="320px" />
            {/* On the corner of the first photograph only, where it used to sit on the single portrait. */}
            {i === 0 && (
              <span className="abt-portrait-heart" aria-hidden="true">
                <img src="/about/stickers/heart.png" alt="" width={194} height={154} />
              </span>
            )}
          </figure>
        ))}
      </div>
    </motion.div>
  );
}
