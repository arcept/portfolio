'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLang, useT } from './LangProvider';

// Small flags, drawn so they look the same on every device. A language without one shows the globe (English, the
// page's own language).
const FLAGS = {
  de: (
    <svg className="cs-lang__flag" width="18" height="13" viewBox="0 0 16 12" aria-hidden="true">
      <rect width="16" height="4" fill="#000" />
      <rect y="4" width="16" height="4" fill="#dd0000" />
      <rect y="8" width="16" height="4" fill="#ffce00" />
    </svg>
  ),
  it: (
    <svg className="cs-lang__flag" width="18" height="13" viewBox="0 0 16 12" aria-hidden="true">
      <rect width="5.34" height="12" fill="#009246" />
      <rect x="5.33" width="5.34" height="12" fill="#fff" />
      <rect x="10.66" width="5.34" height="12" fill="#ce2b37" />
    </svg>
  ),
};

const Globe = () => (
  <svg className="cs-lang__globe" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1.8 8h12.4M8 1.8c1.9 1.7 2.9 3.8 2.9 6.2S9.9 12.5 8 14.2C6.1 12.5 5.1 10.4 5.1 8S6.1 3.5 8 1.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const Mark = ({ code }) => FLAGS[code] ?? <Globe />;

// The language menu, beside the theme switch: a small button ("DE ▾") that opens a short list right below it, in the
// site's own style. It follows the listbox pattern: arrow keys move, Enter or Space chooses, Escape closes and
// gives focus back, a click outside closes.
export default function LangSwitch() {
  const { lang, languages, setLang, preload } = useLang();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const button = useRef(null);
  const list = useRef(null);
  const id = useId();

  useEffect(() => {
    if (open) list.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const away = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  if (languages.length < 2) return null;
  const current = languages.find((l) => l.code === lang) ?? languages[0];

  const show = () => {
    setActive(Math.max(0, languages.findIndex((l) => l.code === lang)));
    languages.forEach((l) => preload(l.code));
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus({ preventScroll: true });
  };
  const choose = (code) => {
    setLang(code);
    close();
  };

  const onListKey = (event) => {
    const last = languages.length - 1;
    if (event.key === 'ArrowDown') setActive((i) => (i >= last ? 0 : i + 1));
    else if (event.key === 'ArrowUp') setActive((i) => (i <= 0 ? last : i - 1));
    else if (event.key === 'Home') setActive(0);
    else if (event.key === 'End') setActive(last);
    else if (event.key === 'Enter' || event.key === ' ') choose(languages[active].code);
    else if (event.key === 'Escape') close();
    else if (event.key === 'Tab') return close(false);
    else return undefined;
    event.preventDefault();
    return undefined;
  };

  return (
    <div className="cs-lang" ref={root}>
      <button
        ref={button}
        type="button"
        className="cs-lang__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`${t('ui.language', 'Language')}: ${current.label}`}
        onClick={() => (open ? close() : show())}
        onPointerEnter={() => languages.forEach((l) => preload(l.code))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            show();
          }
        }}
      >
        <Mark code={current.code} />
        <span className="cs-lang__code" aria-hidden="true">{current.short}</span>
        <svg className="cs-lang__caret" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="m2 3.8 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          id={id}
          className="cs-lang__menu"
          role="listbox"
          tabIndex={-1}
          aria-label={t('ui.language', 'Language')}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onListKey}
          onBlur={(event) => !root.current?.contains(event.relatedTarget) && setOpen(false)}
          onMouseDown={(event) => event.preventDefault()}
        >
          {languages.map((l, i) => (
            <li
              key={l.code}
              id={`${id}-${i}`}
              role="option"
              lang={l.code}
              aria-selected={l.code === lang}
              className={`cs-lang__item${i === active ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(l.code)}
            >
              <Mark code={l.code} />
              <span>{l.label}</span>
              {l.code === lang && (
                <svg className="cs-lang__check" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
