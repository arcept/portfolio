'use client';

import { motion } from 'motion/react';
import OrbGlyph from './OrbGlyph';
import KeysGlyph from './KeysGlyph';
import PyramidGlyph from './PyramidGlyph';
import GlassGlyph from './GlassGlyph';

// A reserved place for an icon or illustration that does not exist yet: a dashed frame at the size
// the artwork will take, labelled with what goes there. Decorative, so hidden from assistive tech.
// `still` skips the slot's own entrance when a parent is already animating it. `art` names finished
// artwork to show in place of the placeholder (see lenses-content.js).
//
// `active` (optional): whether this slot's principle is the one in focus. An inactive slot rests at
// 80% size and 80% opacity, and springs to full size when activated; the artwork slows down while
// inactive and plays a flourish on activation. Left undefined,
// the slot is simply always at full size.
export default function IconSlot({ label, size = 'md', art, active, still = false, className = '' }) {
  const motionProps = still
    ? {}
    : {
        initial: { opacity: 0, scale: 0.86, rotate: -4 },
        whileInView: { opacity: 1, scale: 1, rotate: 0 },
        viewport: { once: true, amount: 0.5 },
        transition: { type: 'spring', stiffness: 220, damping: 18 },
      };

  return (
    <motion.span
      className={`abt-slot abt-slot--${size}${art ? ' abt-slot--art' : ''} ${className}`}
      aria-hidden="true"
      {...motionProps}
      {...(active === undefined
        ? {}
        : {
            initial: false,
            animate: { scale: active ? 1 : 0.8, opacity: active ? 1 : 0.8 },
            transition: { type: 'spring', stiffness: 320, damping: 17, mass: 0.8 },
          })}
    >
      {art === 'orb' ? (
        <OrbGlyph active={active} />
      ) : art === 'pyramid' ? (
        <PyramidGlyph active={active} />
      ) : art === 'keys' ? (
        <KeysGlyph active={active} />
      ) : art === 'glass' ? (
        <GlassGlyph active={active} />
      ) : (
      <span className="abt-slot__label">
        {size === 'sm' ? 'Icon' : <>{size === 'lg' ? 'Illustration' : 'Spot illustration'}<br />{label}</>}
      </span>
      )}
    </motion.span>
  );
}
