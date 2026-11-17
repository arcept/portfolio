'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { navSans } from './nav-font';
import { ICONS, ITEMS, PAGES, Star, isActive, usePath, useScroll, useTone } from './nav/parts';
import PhoneNav from './nav/PhoneNav';
import './nav/nav.css';

// The site's nav above 640px (phones keep the bar and menu, nav/PhoneNav.js). A page opens with a frosted capsule at the top (the Lens, calmed down: matte glass, one
// hairline edge, a faint top highlight, no glare or tilt). Once you start reading, the capsule lifts away and the
// same material rises at the foot of the screen as the Dock: icons that swell under the pointer, and a ring that
// fills as you read. Back at the top, they swap back. Only one is ever on screen (the other is inert).
const DOCK_AT = 160; // px scrolled before the dock takes over

// `actions` are the page's own controls (theme switch, language), shown in whichever of the two is on screen.
// `active`: this is the nav on screen, so it, not the phone bar, tells the page when it is away or docked.
function WideNav({ actions, active = true }) {
  const capsule = useRef(null);
  const dock = useRef(null);
  const links = useRef(null);
  const path = usePath();
  const { y, progress } = useScroll();
  const docked = y > DOCK_AT;
  const capTone = useTone(capsule);
  const dockTone = useTone(dock, { y: useCallback(() => window.innerHeight - 40, []) });

  // The capsule is gone while docked: things pinned under it move up into its place.
  useEffect(() => {
    if (!active) return undefined;
    const html = document.documentElement;
    html.toggleAttribute('data-nav-hidden', docked);
    html.toggleAttribute('data-nav-docked', docked);
    return () => {
      html.removeAttribute('data-nav-hidden');
      html.removeAttribute('data-nav-docked');
    };
  }, [docked, active]);

  // The capsule's indicator glides to the link being pointed at, and back to the current page.
  const [mark, setMark] = useState(null);
  const place = useCallback((el) => {
    const host = links.current;
    if (!host) return;
    const target = el || host.querySelector('a[aria-current="page"]');
    setMark(target ? { x: target.offsetLeft, w: target.offsetWidth } : null);
  }, []);
  useEffect(() => {
    place();
    const again = () => place();
    window.addEventListener('resize', again);
    document.fonts?.ready.then(again);
    return () => window.removeEventListener('resize', again);
  }, [place, path]);

  const onMove = (e) => {
    if (e.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    dock.current?.querySelectorAll('.snav__item').forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.setProperty('--s', (1 + 0.35 * Math.max(0, 1 - d / 110)).toFixed(3));
    });
  };
  const onLeave = () => dock.current?.querySelectorAll('.snav__item').forEach((el) => el.style.setProperty('--s', '1'));

  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const R = 15;
  const C = 2 * Math.PI * R;

  return (
    <nav aria-label="Site" className={`snav ${navSans.variable}${docked ? ' is-docked' : ''}`}>
      {/* At the top: the capsule. */}
      <div className="snav__top">
        <div ref={capsule} className="snav__capsule snav-glass" data-tone={capTone} inert={docked || undefined}>
          <a href="/" className="snav__name" aria-label="Manik Madaan, home">
            <span className="snav__orb" aria-hidden="true">
              <Star />
            </span>
            <span className="snav__name-text">Manik Madaan</span>
          </a>
          <div ref={links} className="snav__links" onPointerLeave={() => place()} onBlur={() => place()}>
            {mark && <span className="snav__mark" style={{ '--x': `${mark.x}px`, '--w': `${mark.w}px` }} aria-hidden="true" />}
            {PAGES.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive(link, path) ? 'page' : undefined}
                onPointerEnter={(e) => place(e.currentTarget)}
                onFocus={(e) => place(e.currentTarget)}
              >
                {link.label}
              </a>
            ))}
          </div>
          {actions && !docked && <div className="snav__actions">{actions}</div>}
        </div>
      </div>

      {/* Reading: the dock. */}
      <div ref={dock} className="snav__dock snav-glass" data-tone={dockTone} inert={!docked || undefined} onPointerMove={onMove} onPointerLeave={onLeave}>
        <ul className="snav__row">
          {ITEMS.map((item) => (
            <li key={item.label} className="snav__item">
              <a href={item.href} aria-current={isActive(item, path) ? 'page' : undefined}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS[item.label]}
                </svg>
                <span className="snav__label">{item.label}</span>
              </a>
            </li>
          ))}
          <li className="snav__sep" aria-hidden="true" />
          <li className="snav__item">
            <button type="button" onClick={toTop} aria-label={`Back to top (${Math.round(progress * 100)}% read)`}>
              <svg viewBox="0 0 36 36" className="snav__ring" aria-hidden="true">
                <circle cx="18" cy="18" r={R} className="snav__ring-track" />
                <circle cx="18" cy="18" r={R} className="snav__ring-fill" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - progress) }} />
                <path d="M18 23v-10M13.5 17.5 18 13l4.5 4.5" className="snav__ring-arrow" />
              </svg>
              <span className="snav__label" aria-hidden="true">
                {Math.round(progress * 100)}%
              </span>
            </button>
          </li>
          {actions && docked && <li className="snav__actions">{actions}</li>}
        </ul>
      </div>
    </nav>
  );
}

// Phones (up to 640px) get the bar and its menu as they were; wider screens the capsule and dock. Both are in the
// page's HTML and CSS shows one (nav/phone-nav.css), so neither flashes in. Once the width is known, only the one on
// screen writes to the page and holds the page's controls, and it follows the window across the line.
const PHONE = '(max-width: 640px)';

function usePhone() {
  const [phone, setPhone] = useState(null); // null until known (the static HTML)
  useEffect(() => {
    const query = window.matchMedia(PHONE);
    const sync = () => setPhone(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return phone;
}

export default function Nav({ actions }) {
  const phone = usePhone();
  return (
    <>
      <PhoneNav actions={phone === false ? null : actions} active={phone === true} />
      <WideNav actions={phone === true ? null : actions} active={phone === false} />
    </>
  );
}
