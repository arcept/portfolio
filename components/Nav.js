'use client';

import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 4);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-nav__inner">
        <a href="/" className="site-nav__name">Manik Madaan</a>
        <div className="site-nav__links">
          <a href="/#work">Work</a>
          <a href="/#about">About</a>
          <a href="mailto:manikdesigns@yahoo.com">Contact</a>
        </div>
      </div>
    </nav>
  );
}
