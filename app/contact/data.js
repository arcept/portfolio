'use client';

import { useEffect, useState } from 'react';
import desk from '@/app/_home/art/portrait-3.webp';

// What the Contact page shows, and the small parts its pieces share.

export const EMAIL = 'contact@arcept.in';

// The ways to reach me. `photo` is the picture the peek card shows on hover, `focus` where it is cropped:
// the homepage's desk illustration for email, the About gallery for LinkedIn and Instagram, and
// PushDeck's share image (from the Playground) for GitHub.
export const CHANNELS = [
  { key: 'email', label: 'Email', handle: EMAIL, href: `mailto:${EMAIL}`, photo: desk.src, focus: 'center 38%' },
  { key: 'linkedin', label: 'LinkedIn', handle: 'in/manikmadaan', href: 'https://www.linkedin.com/in/manikmadaan/', external: true, photo: '/about/gallery/domus-convocation.jpg' },
  { key: 'github', label: 'GitHub', handle: 'github.com/arcept', href: 'https://github.com/arcept', external: true, photo: '/contact/pushdeck-preview.jpg', focus: '70% center' },
  { key: 'instagram', label: 'Instagram', handle: '@manikmadaan', href: 'https://www.instagram.com/manikmadaan/', external: true, photo: '/about/gallery/bangkok.jpg' },
];

export const PAGES = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/about' },
];

export const EASE = [0.16, 1, 0.3, 1];

// The attributes an outward link carries.
export const outward = (c) => (c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export function NewTab({ channel }) {
  return channel.external ? <span className="sr-only"> (opens in a new tab)</span> : null;
}

const IST = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Kolkata' });

// The time in Delhi, ticking each second: { h, m, s } (24-hour), or null until mounted, so the server
// and the browser agree.
export function useDelhiNow() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => {
      const parts = Object.fromEntries(IST.formatToParts(new Date()).map((p) => [p.type, p.value]));
      setNow({ h: Number(parts.hour), m: Number(parts.minute), s: Number(parts.second) });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export const pad = (n) => String(n).padStart(2, '0');

// How far the visitor's clock is from Delhi's, in words ("4 h 30 min ahead of you"), or '' when it is
// the same. Delhi is fixed at GMT +5:30.
export function offsetFromVisitor() {
  const visitor = -new Date().getTimezoneOffset(); // minutes east of GMT
  const diff = 330 - visitor;
  if (diff === 0) return 'Same time as you';
  const a = Math.abs(diff);
  const h = Math.floor(a / 60);
  const m = a % 60;
  const span = [h && `${h} h`, m && `${m} min`].filter(Boolean).join(' ');
  return `${span} ${diff > 0 ? 'ahead of' : 'behind'} you`;
}

// Copies the address; the icon turns to a tick for a moment.
export function CopyIcon({ text = EMAIL, className = '' }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return undefined;
    const id = window.setTimeout(() => setDone(false), 1600);
    return () => window.clearTimeout(id);
  }, [done]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
    } catch {}
  };

  return (
    <button type="button" className={`${className}${done ? ' is-done' : ''}`} onClick={copy} aria-label={done ? 'Email address copied' : 'Copy email address'} title={done ? 'Copied' : 'Copy'}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {done ? (
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        ) : (
          <>
            <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
            <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
          </>
        )}
      </svg>
      <span className="sr-only" aria-live="polite">
        {done ? 'Copied' : ''}
      </span>
    </button>
  );
}
