'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './tip.css';

// A designed tooltip that follows the pointer over anything in `scope` carrying `data-tip` (its words)
// and `data-tip-color` (its colour: the case study's, at full saturation, `tip` in cases.js). Only on screens with a fine pointer that can
// hover; touch screens never see it. Drawn in a portal on <body>, since a transformed ancestor would
// pin a fixed element to itself instead of the viewport.
//
//   pill    — a solid pill in the colour, white words.
//   arrow   — the pill with a white circle and an arrow at its end (only where there's somewhere to go:
//             not on a tile marked aria-disabled, like the ones coming soon).
export const TIP_STYLES = [
  { slug: 'pill', name: 'Pill' },
  { slug: 'arrow', name: 'Pill + arrow' },
];

export const TipStyle = createContext('pill');

export default function Tip({ scope }) {
  const kind = useContext(TipStyle);
  const box = useRef(null);
  const [on, setOn] = useState(false);
  const [tip, setTip] = useState({ label: '', color: '', go: true });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const root = scope.current;
    if (!root || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const move = (e) => {
      const target = e.target.closest?.('[data-tip]');
      if (!target || !root.contains(target)) {
        setOn(false);
        return;
      }
      const label = target.dataset.tip;
      const color = target.dataset.tipColor;
      const go = target.getAttribute('aria-disabled') !== 'true';
      setTip((t) => (t.label === label && t.color === color && t.go === go ? t : { label, color, go }));
      setOn(true);
      if (box.current) box.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    const leave = () => setOn(false);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', leave, { passive: true });
    return () => {
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', leave);
    };
  }, [scope]);

  if (!ready) return null;
  return createPortal(
    <div ref={box} className={`wt wt--${kind}`} data-on={on ? 'true' : 'false'} style={{ '--tip': tip.color }} aria-hidden="true">
      <span className="wt__body">
        <span className="wt__label">{tip.label}</span>
        {kind === 'arrow' && tip.go && (
          <span className="wt__go">
            <svg viewBox="0 0 16 16">
              <path d="M5 11 11 5M6 5h5v5" />
            </svg>
          </span>
        )}
      </span>
    </div>,
    document.body,
  );
}
