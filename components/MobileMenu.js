'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/components/i18n/LangProvider';
import { menuSans } from './menu-font';
import './mobile-menu.css';

// The phone menu: the page stays in view, dimmed and blurred, and a rounded sheet rises from the foot of the screen,
// where a thumb can reach it. Work is a wide card and About and Contact sit side by side under it, each over a
// picture (Contact, with nowhere to go yet, is hatched); the two ways to get in touch are buttons at the foot, over a
// faint warm glow. The bar (brand, language, theme, the button) stays above it, so the switches keep working and the
// button turns into the close mark in place.
//
// Rendered by Nav, which owns whether it is mounted and open. Everything here is behaviour and markup:
//   - focus moves in when it opens and back to the button when it closes; Tab cycles between the bar and the menu
//   - Escape or a tap on the dimmed page closes; the page behind cannot scroll
//   - choosing a link closes the menu first, then goes there, so the page never jumps under an open menu

const EMAIL = 'contact@arcept.in';
const LINKEDIN = 'https://www.linkedin.com/in/manikmadaan/';

// Each link's picture, by label.
const PICTURES = {
  Work: '/about/sabbatical/set2-landscape.jpg',
  About: '/about/portrait-collage.jpg',
};

export default function MobileMenu({ open, links, onClose, onGo }) {
  const t = useT();
  const root = useRef(null);

  // While it exists: the page behind does not scroll.
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = before;
    };
  }, []);

  // Once it is showing: focus goes to the sheet itself (not a card: focusing a card mid-animation is what made iOS
  // Safari stop drawing it), Escape closes, and Tab stays between the bar and the menu.
  useEffect(() => {
    if (!open) return undefined;
    const sheet = root.current?.querySelector('.ms__sheet');
    const id = window.setTimeout(() => sheet?.focus({ preventScroll: true }), 120);
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'Tab') {
        // The menu sits at the end of the page, so the browser's own Tab order would walk off into the page behind it.
        // Tab is handled here instead: through the bar, then the menu, round again.
        const inBar = [...document.querySelectorAll('.site-nav a[href], .site-nav button')].filter((el) => el.offsetParent !== null);
        const inMenu = [...(root.current?.querySelectorAll('a[href]') ?? [])];
        const all = [...inBar, ...inMenu];
        const at = all.indexOf(document.activeElement);
        // From the sheet itself, Tab goes to the first card, Shift-Tab to the last link.
        if (at === -1 && root.current?.contains(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? inMenu[inMenu.length - 1] : inMenu[0])?.focus();
          return;
        }
        const next = event.shiftKey ? (at <= 0 ? all.length - 1 : at - 1) : at === -1 || at === all.length - 1 ? 0 : at + 1;
        event.preventDefault();
        all[next]?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const [first, ...rest] = links;

  return createPortal(
    <div ref={root} id="site-menu" className={`ms ${menuSans.variable}${open ? ' is-open' : ''}`}>
      <button type="button" className="ms__scrim" aria-label={t('ui.menuClose', 'Close menu')} tabIndex={-1} onClick={() => onClose()} />
      <div className="ms__sheet" role="dialog" aria-modal="true" aria-label={t('ui.menu', 'Menu')} tabIndex={-1}>
        <span className="ms__glow" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="ms__handle" aria-hidden="true" />
        <p className="ms__kicker" aria-hidden="true">
          {t('ui.menu', 'Menu')}
        </p>

        <div className="ms__grid">
          <Card link={first} wide i={0} onGo={onGo} />
          {rest.map((link, n) => (
            <Card key={link.label} link={link} i={n + 1} onGo={onGo} />
          ))}
        </div>

        <div className="ms__actions">
          <a href={`mailto:${EMAIL}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            Email
          </a>
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
              <path d="M8 10.5V16M8 7.8v.1M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1 1 2.1 2.6V16" />
            </svg>
            LinkedIn
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

// One link as a card: its picture darkened under the words, the label and its note, and an arrow. A link with no
// `href` is shown, hatched, but does not act.
function Card({ link, wide, i, onGo }) {
  const src = PICTURES[link.label];
  const className = `ms__card${wide ? ' ms__card--wide' : ''}${link.href ? '' : ' is-inert'}`;
  const inside = (
    <>
      {src ? <img src={src} alt="" /> : <span className="ms__soon" aria-hidden="true" />}
      <span className="ms__cardtext">
        <span className="ms__label">{link.label}</span>
        <span className="ms__note">{link.note}</span>
      </span>
      {link.href && (
        <span className="ms__arrow" aria-hidden="true">
          ↗
        </span>
      )}
    </>
  );
  if (!link.href) {
    return (
      <span className={className} style={{ '--i': i }}>
        {inside}
      </span>
    );
  }
  return (
    <a href={link.href} className={className} style={{ '--i': i }} onClick={(event) => onGo(event, link.href)}>
      {inside}
    </a>
  );
}
