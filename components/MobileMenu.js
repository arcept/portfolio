'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/components/i18n/LangProvider';
import './mobile-menu.css';

// The phone menu: a full-screen layer that a circle wipes open from the hamburger button. The bar (brand, language,
// theme, the button) stays above it, so the switches keep working and the button turns into the close mark in place.
//
// Rendered by Nav, which owns whether it is mounted and open. Everything here is behaviour and markup:
//   - focus moves in when it opens and back to the button when it closes; Tab cycles between the bar and the menu
//   - Escape closes; the page behind cannot scroll; a finger or pointer moving over it lights up a soft spotlight
//   - choosing a link closes the menu first, then goes there, so the page never jumps under an open menu

const ARROW = (
  <svg className="mm__arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 17 17 7M8.5 7H17v8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TICKER = 'Manik Madaan · Product design leadership · ';

export default function MobileMenu({ open, links, origin, onClose, onGo }) {
  const t = useT();
  const root = useRef(null);
  const frame = useRef(0);

  // While it exists: the page behind does not scroll.
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = before;
    };
  }, []);

  // Once it is showing: focus goes in, Escape closes, and Tab stays between the bar and the menu.
  useEffect(() => {
    if (!open) return undefined;
    const first = root.current?.querySelector('.mm__link');
    const id = window.setTimeout(() => first?.focus({ preventScroll: true }), 120);
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

  // A finger (or pointer) moving over the menu drags a soft spotlight after it.
  const track = (event) => {
    const el = root.current;
    if (!el || frame.current) return;
    const { clientX, clientY } = event;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      el.style.setProperty('--mx', `${clientX}px`);
      el.style.setProperty('--my', `${clientY}px`);
    });
  };
  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);

  return createPortal(
    <div
      ref={root}
      id="site-menu"
      className={`mm${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('ui.menu', 'Menu')}
      style={{ '--ox': `${origin.x}px`, '--oy': `${origin.y}px`, '--r': `${origin.r}px` }}
      onPointerMove={track}
      onPointerDown={track}
    >
      <div className="mm__glow" aria-hidden="true" />
      <div className="mm__spot" aria-hidden="true" />

      <ul className="mm__list">
        {links.map((link, i) => {
          const Tag = link.href ? 'a' : 'span';
          return (
            <li key={link.label} className="mm__item" style={{ '--i': i }}>
              <Tag
                className={`mm__link${link.href ? '' : ' mm__link--inert'}`}
                href={link.href || undefined}
                // aria-label names a link; on the inert span it is prohibited, so that one carries
                // its name as text instead (everything else here is decorative and hidden).
                aria-label={link.href ? link.label : undefined}
                onClick={link.href ? (event) => onGo(event, link.href) : undefined}
              >
                {!link.href && <span className="sr-only">{link.label}</span>}
                <span className="mm__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="mm__rise" aria-hidden="true">
                  <span className="mm__enter">
                    <span className="mm__roll">
                      <span className="mm__word">{link.label}</span>
                      <span className="mm__word mm__word--alt">{link.label}</span>
                    </span>
                  </span>
                </span>
                <span className="mm__note" aria-hidden="true">{link.note}</span>
                {link.href ? ARROW : null}
              </Tag>
            </li>
          );
        })}
      </ul>

      <div className="mm__ticker" aria-hidden="true">
        <div className="mm__ticker-track">
          <span>{TICKER.repeat(3)}</span>
          <span>{TICKER.repeat(3)}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
