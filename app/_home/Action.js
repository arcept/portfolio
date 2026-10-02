'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';

const SPRING = { stiffness: 260, damping: 18, mass: 0.5 };

// Leans towards a mouse pointer over it and springs back when it leaves. Touch never moves it.
function Magnetic({ children, pull = 0.28 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    const box = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - box.left - box.width / 2) * pull);
    y.set((e.clientY - box.top - box.height / 2) * pull);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.span className="hx-magnet" style={{ x: sx, y: sy }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.span>
  );
}

// A way onward: a pill with the arrow in a disc. On hover the rainbow rises through it and the arrow
// turns to point the way. A downward one (a link further down the page) instead drops out of its disc
// as its twin drops in from above (home.css). A way back ('←') has its disc first, and its arrow
// nudges back on hover.
export default function Action({ href, arrow = '↗', variant = 'primary', onClick, children }) {
  const back = arrow === '←';
  return (
    <Magnetic>
      <a href={href} className={`hx-btn hx-btn--${variant}${back ? ' hx-btn--back' : ''}`} onClick={onClick}>
        <span className="hx-btn__label">
          <span>{children}</span>
        </span>
        <span className="hx-btn__icon" aria-hidden="true">
          <span className="hx-btn__arrow">{arrow === '↓' || back ? arrow : '→'}</span>
          {arrow === '↓' && <span className="hx-btn__arrow hx-btn__arrow--next">↓</span>}
        </span>
      </a>
    </Magnetic>
  );
}
