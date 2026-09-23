'use client';

import { useId, useRef } from 'react';
import { motion, useInView } from 'motion/react';

// The Great Mental Models, three volumes, drawn from Manik's own SVG (dark and light versions) with
// the background removed so the stack sits on the page itself. The two versions differ only in the
// cover's upper tones and the shadow, which are theme tokens here (--abt-book-* in about.css).
// Each volume is its own group so the stack can be built bottom-up, one book landing on the next.

const VOLUMES = [
  {
    n: '3',
    sub: 'Systems and Mathematics',
    body: 'M101 627 Q103 614 119 612 L1492 612 Q1507 613 1509 630 L1509 738 Q1507 752 1491 753 L119 753 Q101 750 101 736Z',
    top: 'M101 627 Q103 614 119 612 L1492 612 Q1507 613 1509 630 L1502 641 Q1494 632 1483 632 L124 632 Q111 633 105 641Z',
    topFill: '#ee6870',
    topOpacity: 0.74,
    spine: 'M114 616 Q110 654 114 724 Q115 738 122 748',
    base: 'M106 741 Q115 751 132 752 L1487 752 Q1504 750 1508 739',
    text: { x: 273, y: 704 },
    num: { x: 192, y: 701 },
    fs: { x: 1357, y: 711 },
  },
  {
    n: '2',
    sub: 'Physics, Chemistry and Biology',
    body: 'M98 478 Q101 465 118 464 L1484 464 Q1502 466 1505 481 L1505 601 Q1503 616 1485 617 L117 617 Q98 616 98 599Z',
    top: 'M98 478 Q104 465 118 464 L1484 464 Q1502 466 1505 481 L1499 491 Q1493 483 1481 483 L121 483 Q108 484 101 491Z',
    topFill: '#f17278',
    topOpacity: 0.72,
    spine: 'M112 470 Q106 512 112 585 Q113 602 121 612',
    text: { x: 273, y: 561 },
    num: { x: 192, y: 558 },
    fs: { x: 1355, y: 568 },
  },
  {
    n: '1',
    sub: 'General Thinking Concepts',
    body: 'M93 366 Q96 352 111 350 L1494 350 Q1509 352 1511 366 L1511 449 Q1509 464 1493 465 L112 465 Q94 463 93 448Z',
    top: 'M93 366 Q96 352 111 350 L1494 350 Q1509 352 1511 366 L1505 374 Q1498 368 1489 368 L116 368 Q104 369 96 375Z',
    topFill: '#f4787d',
    topOpacity: 0.8,
    spine: 'M106 355 Q100 392 106 439 Q107 454 115 460',
    text: { x: 274, y: 421 },
    num: { x: 194, y: 419 },
    fs: { x: 1357, y: 427 },
  },
];

const INK = '#241819';

// How far a volume slides out when pulled: alternate sides, so the stack reads as handled.
const pull = (i) => ({ x: REST[i].x + (i % 2 ? -90 : 110) });

// The stack at rest: centred overall, but each volume nudged off the one below, as if set down by
// hand rather than ruled edge to edge. Bottom volume first.
const REST = [
  { x: 26, rotate: 0.5 },
  { x: -34, rotate: -0.7 },
  { x: 14, rotate: 0.4 },
];

// `landed` (optional): how many volumes are down, bottom first — for a layout that builds the stack
// from scroll. Without it the whole stack drops in once it is in view. `interactive`: a volume
// slides out of the stack while the pointer is over it, or while it is pressed on a touch screen.
export default function BookStack({ className = '', landed, interactive = false }) {
  const box = useRef(null);
  const inView = useInView(box, { once: true, amount: 0.35 });
  const shown = landed === undefined ? inView : landed > 0;
  const isDown = (i) => (landed === undefined ? inView : i < landed);
  const uid = useId().replace(/:/g, '');
  const cover = `abt-book-cover-${uid}`;
  const blur = `abt-book-blur-${uid}`;

  return (
    <div className={`abt-books ${className}`} ref={box}>
      <svg viewBox="70 250 1460 610" role="img" aria-label="The Great Mental Models, volumes one to three, stacked.">
        <defs>
          <linearGradient id={cover} x1="0" y1="0" x2="0" y2="1">
            <stop style={{ stopColor: 'var(--abt-book-c0)' }} />
            <stop offset=".2" style={{ stopColor: 'var(--abt-book-c1)' }} />
            <stop offset=".76" style={{ stopColor: 'var(--abt-book-c2)' }} />
            <stop offset="1" stopColor="#ad202c" />
          </linearGradient>
          <filter id={blur} x="-20%" y="-80%" width="140%" height="280%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* The shadow spreads as the first volume lands. Its strength is per theme, on the group. */}
        <g style={{ opacity: 'var(--abt-book-shadow-o)' }}>
          <motion.ellipse
            cx={800}
            cy={754}
            rx={700}
            ry={34}
            filter={`url(#${blur})`}
            style={{ fill: 'var(--abt-book-shadow)', transformBox: 'fill-box', transformOrigin: '50% 50%' }}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={shown ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.6 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          />
        </g>

        {VOLUMES.map((v, i) => (
          <motion.g
            key={v.n}
            initial={{ y: -420, opacity: 0, rotate: i % 2 ? 1.6 : -1.8 }}
            animate={isDown(i) ? { y: 0, x: REST[i].x, opacity: 1, rotate: REST[i].rotate } : { y: -420, opacity: 0, rotate: i % 2 ? 1.6 : -1.8 }}
            whileHover={interactive && isDown(i) ? pull(i) : undefined}
            whileTap={interactive && isDown(i) ? pull(i) : undefined}
            transition={{
              y: { type: 'spring', stiffness: 320, damping: 21, mass: 1, delay: landed === undefined ? 0.1 + i * 0.22 : 0 },
              rotate: { type: 'spring', stiffness: 260, damping: 16, delay: landed === undefined ? 0.1 + i * 0.22 : 0 },
              opacity: { duration: 0.25, delay: landed === undefined ? 0.1 + i * 0.22 : 0 },
              x: { type: 'spring', stiffness: 220, damping: 20 },
            }}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', cursor: interactive ? 'grab' : undefined }}
          >
            <g stroke="#85212c" strokeWidth="3" strokeLinejoin="round">
              <path d={v.body} fill={`url(#${cover})`} />
              <path d={v.top} fill={v.topFill} opacity={v.topOpacity} stroke="none" />
              <path d={v.spine} fill="none" stroke="#f4777a" strokeWidth="5" opacity=".85" />
              {v.base && <path d={v.base} fill="none" stroke="#84202b" strokeWidth="7" opacity=".35" />}
            </g>
            <g fill={INK} fontFamily="Arial, Helvetica, sans-serif" aria-hidden="true">
              <text x={v.text.x} y={v.text.y} fontSize="34" letterSpacing="-.4">
                <tspan fontWeight="700">The Great Mental Models</tspan>
                <tspan dx="28" fontWeight="400">|  {v.sub}</tspan>
              </text>
              <text x={v.num.x} y={v.num.y} fontSize="30" fontWeight="600" transform={`rotate(-90 ${v.num.x} ${v.num.y})`}>
                {v.n}
              </text>
              <text x={v.fs.x} y={v.fs.y} fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="700" fontSize="54">
                fs
              </text>
            </g>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
