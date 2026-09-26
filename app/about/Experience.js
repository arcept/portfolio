'use client';

import { Fragment, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EXPERIENCE_HEADLINES, EXPERIENCE_INTRO, ROLES } from './experience-content';
import SabbaticalGap from './SabbaticalGap';

const EASE = [0.16, 1, 0.3, 1];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// Roles whose dates or place are still to be confirmed simply omit them on the page.
const Dates = ({ role }) => (role.dates ? <span className="xp-dates">{role.dates}</span> : null);
const Place = ({ role }) => (role.place ? <span className="xp-place">{role.place}</span> : null);

// A logotype at the same visual weight as the others: `size` is the side of a square with the ink
// everyone gets, and each mark is scaled toward the same covered area (its box times `logoInk`) — a long thin wordmark comes out wider and lower, a dense compact one smaller — then capped
// at maxWidth. The file is used as a mask, painted in the company's colour for this theme (brand, via
// --brand-l / --brand-d) or the page's ink. A mark with `logoTile` sits on its coloured tile. Roles
// without a logo show their name in the display serif.
const INK_REF = 0.4;

export function Logotype({ role, size = 30, maxWidth = 160, className = '' }) {
  if (!role.logo && !role.logoSquare) {
    return (
      <span className={`xp-wordmark xp-wordmark--text ${className}`} style={{ fontSize: size * 0.46, maxWidth }}>
        {role.company}
      </span>
    );
  }
  // A finished square badge, or a mark on its coloured tile (Leo Burnett): the same footprint for
  // every company that has one, so they line up. A plain string is one badge for both themes; an
  // {light, dark} pair (there being no real company mark to badge yet) swaps with the page instead.
  const side = Math.round(Math.min(size * 0.93, maxWidth));
  if (role.logoSquare?.light) {
    return (
      <span className="xp-wordmark xp-wordmark--square xp-wordmark--squaretheme" role="img" aria-label={role.company} style={{ width: side, height: side }}>
        <img className="xp-wordmark__square xp-wordmark__square--light" src={role.logoSquare.light} alt="" width={side} height={side} />
        <img className="xp-wordmark__square xp-wordmark__square--dark" src={role.logoSquare.dark} alt="" width={side} height={side} />
      </span>
    );
  }
  if (role.logoSquare) {
    return <img className={`xp-wordmark xp-wordmark--square ${className}`} src={role.logoSquare} alt={role.company} width={side} height={side} style={{ width: side, height: side }} />;
  }
  const tiled = Boolean(role.logoTile);
  const ink = role.logoInk ?? INK_REF;
  const ratio = role.logoRatio;
  // Width follows sqrt(ratio) (equal area); ink density is only partly corrected (the 0.3 power),
  // since fully equalising it makes the densest marks look undersized.
  let w = size * Math.sqrt(ratio) * (INK_REF / ink) ** 0.3;
  w *= role.logoScale ?? 1;
  if (w > maxWidth) w = maxWidth;
  let h = w / ratio;
  if (tiled) w = h = side;
  const colours = { '--brand-l': role.brand?.light ?? undefined, '--brand-d': role.brand?.dark ?? undefined };
  const mask = { WebkitMaskImage: `url(${role.logo})`, maskImage: `url(${role.logo})` };

  if (tiled) {
    return (
      <span className={`xp-wordmark xp-wordmark--tile ${className}`} role="img" aria-label={role.company} style={{ width: w, height: h, background: role.logoTile, ...colours }}>
        <span className="xp-wordmark__mark" style={mask} />
      </span>
    );
  }
  // Multi-colour marks: the real artwork (per theme) when showing brand colours, the mask in ink.
  if (role.logoArt) {
    return (
      <span className={`xp-wordmark xp-wordmark--art ${className}`} role="img" aria-label={role.company} style={{ width: w, height: h }}>
        <span className="xp-wordmark__ink" style={mask} />
        <img className="xp-wordmark__art xp-wordmark__art--light" src={role.logoArt.light} alt="" />
        <img className="xp-wordmark__art xp-wordmark__art--dark" src={role.logoArt.dark} alt="" />
      </span>
    );
  }
  return <span className={`xp-wordmark ${className}`} role="img" aria-label={role.company} style={{ width: w, height: h, ...mask, ...colours }} />;
}


// Section 04. Every role is a row on one shared grid — badge, company (with any earlier or product name
// and what the company is), position, dates and place. The first five, down to Leo Burnett, are full
// size; the earlier ones are smaller and folded behind a button. A row opens on hover (mouse) or tap to
// a one-line summary and the story. On phones the position and dates stack under the company.
export default function Experience() {
  const [open, setOpen] = useState(null);
  const [all, setAll] = useState(false);
  const recent = ROLES.findIndex((r) => r.id === 'leoburnett') + 1;
  const rows = ROLES.map((role, i) => ({ role, i })).filter(({ i }) => all || i < recent);

  return (
    <section className="abt-experience xp-logos-brand" id="experience" aria-labelledby="abt-experience-title">
      <div className="xp-head">
        <motion.p className="abt-label" {...rise()}>
          <span className="abt-label__index">04</span>
          <span className="abt-label__rule" aria-hidden="true" />
          <span>Experience</span>
        </motion.p>
        <div className="xp-head__title">
          <motion.span
            className="abt-sticker xp-sticker"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay: 0.5 }}
          >
            <img src="/about/stickers/work-experience.svg" alt="" />
          </motion.span>
          <motion.h2 className="xp-headline" id="abt-experience-title" {...rise(0.05)}>
            {EXPERIENCE_HEADLINES[0]}
          </motion.h2>
        </div>
        <motion.p className="xp-intro" {...rise(0.12)}>
          {EXPERIENCE_INTRO}
        </motion.p>
      </div>

      <ol className="xp-ledger__list">
        {rows.map(({ role, i }) => {
          const on = open === role.id;
          const early = i >= recent;
          return (
            <Fragment key={role.id}>
              <motion.li
                className={`xp-row${on ? ' is-open' : ''}${early ? ' xp-row--early' : ''}`}
                {...rise(early ? (i - recent) * 0.05 : Math.min(i, 5) * 0.04)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(role.id)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}
              >
                <button
                  type="button"
                  className="xp-row__button"
                  aria-expanded={on}
                  aria-controls={`xp-${role.id}`}
                  onClick={() => setOpen(on ? null : role.id)}
                >
                  <span className="xp-row__logo">
                    <span
                      className={`xp-badge${role.logoSquare || role.logoTile ? ' xp-badge--icon' : ''}`}
                      style={{ '--xp-i': i }}
                    >
                      <Logotype role={role} size={early ? 42 : 58} maxWidth={170} />
                    </span>
                  </span>
                  <span className="xp-row__main">
                    <span className="xp-row__company">{role.company}</span>
                    {(role.product || role.formerly) && (
                      <span className="xp-row__alias">{role.formerly ? `Previously ${role.formerly}` : role.product}</span>
                    )}
                    <span className="xp-row__what">{role.descriptor}</span>
                    <span className="xp-row__title">{role.role}</span>
                  </span>
                  <span className="xp-row__right">
                    <span className="xp-row__role">{role.role}</span>
                    <span className="xp-row__meta">
                      <Dates role={role} />
                      <Place role={role} />
                    </span>
                  </span>
                  <span className="xp-row__mark" aria-hidden="true" />
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`xp-${role.id}`}
                      className="xp-row__story"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <p className="xp-row__kind">{role.descriptor}</p>
                      <p className="xp-row__lead">{role.line}</p>
                      <p>{role.story}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
              {/* The sabbatical sits between the current independent practice and Novatr. */}
              {role.id === 'independent-now' && <SabbaticalGap />}
            </Fragment>
          );
        })}
      </ol>

      <div className="xp-ledger__more">
        <button
          type="button"
          className="xp-ledger__morebtn"
          aria-expanded={all}
          onClick={() => {
            setAll(!all);
            setOpen(null);
          }}
        >
          {all ? 'Fewer roles' : 'Earlier roles'} <span aria-hidden="true">{all ? '−' : '+'}</span>
        </button>
      </div>
    </section>
  );
}
