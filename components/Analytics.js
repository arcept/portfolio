'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { track } from './track';
import './analytics.css';

export const GA_ID = 'G-1LQQSMLTH3';
const KEY = 'site-cookie-consent'; // 'granted' | 'denied'

// GA4 for the whole site, behind a consent card. Google's Consent Mode starts everything "denied":
// nothing is stored and nothing identifying is sent until the visitor accepts. The choice is
// remembered; "Cookie settings" in the footer (or window.openCookieSettings()) brings the card back.
//
// Besides GA4's own page views, scrolls and outbound clicks, this records: a page view on each
// client-side route change, read depth per page (and case study opens), section-index clicks, and
// clicks on email and LinkedIn links. Page-specific events go through
// track() (components/track.js).
export default function Analytics() {
  const [ask, setAsk] = useState(false);
  const path = usePathname();

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    if (saved === 'granted') consent('granted');
    else if (!saved) setAsk(true);
    window.openCookieSettings = () => setAsk(true);
    return () => delete window.openCookieSettings;
  }, []);

  // Route changes inside the app (the first load is counted by the config call).
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', { page_path: path, page_location: location.href, page_title: document.title });
  }, [path]);

  // How far each page is read (25/50/75/100%), once per mark per page; case studies are named.
  useEffect(() => {
    const marks = new Set();
    const study = path.startsWith('/case-study') ? path.replace(/^\/|\/$/g, '') : null;
    if (study) track('case_study_open', { study });
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max <= 0) return;
      const pct = (scrollY / max) * 100;
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m - 1 && !marks.has(m)) {
          marks.add(m);
          track('read_depth', { percent: m, page: path, ...(study ? { study } : {}) });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [path]);

  // Contact links, wherever they are.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.startsWith('mailto:')) track('contact_click', { method: 'email' });
      else if (/linkedin\.com/i.test(href)) track('contact_click', { method: 'linkedin' });
      else if (href.startsWith('#') && a.closest('nav')) track('section_nav', { section: href.slice(1), page: path });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [path]);

  const choose = (value) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    consent(value);
    setAsk(false);
  };

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />

      {ask && (
        <div className="ck" role="dialog" aria-live="polite" aria-label="Cookies">
          <p className="ck__title">Mind if I learn a little?</p>
          <p className="ck__text">
            With your okay, this site keeps a few anonymous notes, like which pages get read, so I can make it better.
            Nothing is saved unless you say yes.
          </p>
          <div className="ck__actions">
            <button type="button" className="ck__btn ck__btn--yes" onClick={() => choose('granted')}>
              Sure
            </button>
            <button type="button" className="ck__btn" onClick={() => choose('denied')}>
              No, thanks
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function consent(value) {
  const apply = () => {
    window.gtag('consent', 'update', { analytics_storage: value });
    if (value === 'granted') window.gtag('event', 'page_view', { page_location: location.href, page_title: document.title });
  };
  if (typeof window.gtag === 'function') apply();
  else window.addEventListener('load', apply, { once: true });
}
