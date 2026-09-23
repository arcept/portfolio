'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/components/i18n/LangProvider';
import MobileMenu from './MobileMenu';

// The site's links. They appear in the bar on wide screens and in the full-screen menu on phones: add one here and it
// shows in both. `note` is the short line under it in the menu. An item with no `href` is shown but does not act —
// Contact waits for its own page.
const NAV_LINKS = [
  { label: 'Work', href: '/#work', note: 'Selected case studies' },
  { label: 'About', href: '/about', note: 'The person behind them' },
  { label: 'Contact', href: null, note: 'Coming soon' },
];

const CLOSE_MS = 700; // how long the menu takes to wipe away

export default function Nav({ actions }) {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); // the menu exists
  const [open, setOpen] = useState(false); // the menu is showing (drives the animation)
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });
  const burger = useRef(null);
  const timer = useRef(0);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 4);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMenu = () => {
    window.clearTimeout(timer.current);
    // The wipe grows from the middle of the button, far enough to reach the farthest corner.
    const box = burger.current.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    setOrigin({ x, y, r: Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))) });
    setMounted(true);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setOpen(true)));
  };

  const closeMenu = useCallback(({ refocus = true, instant = false } = {}) => {
    setOpen(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMounted(false), instant ? 0 : CLOSE_MS);
    if (refocus) burger.current?.focus({ preventScroll: true });
  }, []);

  // Choosing a link: close the menu, then go (unless it was a new-tab click).
  const go = useCallback(
    (event, href) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
      event.preventDefault();
      closeMenu({ refocus: false });
      window.setTimeout(() => window.location.assign(href), 420);
    },
    [closeMenu]
  );

  // The menu is for phones: if the window grows past that while it is open, drop it.
  useEffect(() => {
    if (!mounted) return undefined;
    const wide = window.matchMedia('(min-width: 641px)');
    const check = () => wide.matches && closeMenu({ refocus: false, instant: true });
    wide.addEventListener('change', check);
    return () => wide.removeEventListener('change', check);
  }, [mounted, closeMenu]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <nav className={`site-nav ${scrolled ? 'is-scrolled' : ''}${open ? ' is-menu-open' : ''}`}>
      <div className="site-nav__inner">
        <a href="/" className="site-nav__name">Manik Madaan</a>
        <div className="site-nav__links">
          {NAV_LINKS.map((link) =>
            link.href ? (
              <a key={link.label} href={link.href} className="site-nav__link">
                {link.label}
              </a>
            ) : (
              <span key={link.label} className="site-nav__link site-nav__link--inert">
                {link.label}
              </span>
            )
          )}
          {actions}
          <button
            ref={burger}
            type="button"
            className="site-nav__menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={mounted ? 'site-menu' : undefined}
            aria-label={open ? t('ui.menuClose', 'Close menu') : t('ui.menuOpen', 'Open menu')}
            onClick={() => (open ? closeMenu() : openMenu())}
          >
            <i />
            <i />
          </button>
        </div>
      </div>
      {mounted && <MobileMenu open={open} links={NAV_LINKS} origin={origin} onClose={closeMenu} onGo={go} />}
    </nav>
  );
}
