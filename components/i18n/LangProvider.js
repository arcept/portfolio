'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Page language, without separate pages. English is the source: it is written in the page itself, so it is in
// the HTML and needs nothing loaded. Another language is a dictionary of translated pieces keyed by name,
// loaded the first time it is chosen; any key a dictionary does not have simply shows the English, so a
// language can be added a piece at a time.
//
//   <LangProvider languages={[{ code: 'en', label: 'English', short: 'EN' }, …]} loaders={{ de: () => import('./de') }}>
//   const t = useT();
//   t('hero.title', 'Making Placement Visible')            → the German, or the English when there is none
//   t('ui.aboutSection', 'About the {name} section', { name })
//   t.list('problem.cols', [{ label: 'Stage' }, …])          → the same list with each item's text fields replaced
//   <T k="problem.p1">English <strong>JSX</strong></T>      → a piece of rich text
//
// The choice lasts for the visit (sessionStorage) and can be set by a link (?lang=de). English is always the
// starting point; the browser's own language is deliberately not consulted.

const KEY = 'cs-lang';
const DEFAULT = 'en';

const Ctx = createContext(null);

const fill = (text, vars) => (vars && typeof text === 'string' ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m)) : text);

const english = (() => {
  const t = (_key, fallback, vars) => fill(fallback, vars);
  t.list = (_key, items) => items;
  return t;
})();
const ENGLISH = { lang: DEFAULT, languages: [], setLang: () => {}, preload: () => {}, t: english };

export function LangProvider({ languages, loaders, children }) {
  const [lang, setLangState] = useState(DEFAULT);
  const [dict, setDict] = useState(null);
  const cache = useRef({});
  const codes = useMemo(() => languages.map((l) => l.code), [languages]);

  const load = useCallback(
    (code) => {
      if (code === DEFAULT) return Promise.resolve(null);
      if (!cache.current[code]) cache.current[code] = loaders[code]().then((m) => m.default ?? m);
      return cache.current[code];
    },
    [loaders]
  );
  const preload = useCallback((code) => codes.includes(code) && load(code).catch(() => {}), [codes, load]);

  const setLang = useCallback(
    async (code, { remember = true } = {}) => {
      if (!codes.includes(code)) return;
      try {
        const loaded = await load(code);
        setDict(loaded);
        setLangState(code);
      } catch {
        delete cache.current[code]; // could not load: stay where we are, and allow a retry
        return;
      }
      if (!remember) return;
      try {
        window.sessionStorage.setItem(KEY, code);
      } catch {
        /* storage blocked: the choice just isn't kept across a reload */
      }
      const url = new URL(window.location.href);
      if (code === DEFAULT) url.searchParams.delete('lang');
      else url.searchParams.set('lang', code);
      window.history.replaceState(window.history.state, '', url);
    },
    [codes, load]
  );

  // Start from a link's ?lang=, else what was chosen earlier this visit.
  useEffect(() => {
    let wanted = new URLSearchParams(window.location.search).get('lang');
    if (!wanted) {
      try {
        wanted = window.sessionStorage.getItem(KEY);
      } catch {
        /* storage blocked */
      }
    }
    if (wanted && wanted !== DEFAULT && codes.includes(wanted)) setLang(wanted, { remember: false });
  }, [codes, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = DEFAULT;
    };
  }, [lang]);

  const t = useMemo(() => {
    const f = (key, fallback, vars) => fill(dict && key in dict ? dict[key] : fallback, vars);
    // A list of objects (a table's columns, a gallery's items): the dictionary supplies only the text fields,
    // by position; everything else (sizes, image paths, flags) stays as the English list has it.
    f.list = (key, items) => {
      const over = dict?.[key];
      return over ? items.map((item, i) => (over[i] ? { ...item, ...over[i] } : item)) : items;
    };
    return f;
  }, [dict]);

  const value = useMemo(() => ({ lang, languages, setLang, preload, t }), [lang, languages, setLang, preload, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** { lang, languages, setLang, preload, t }. Outside a provider (any other page) it is English. */
export function useLang() {
  return useContext(Ctx) ?? ENGLISH;
}

/** The translate function. Outside a provider it returns the English it is given, so shared components need no changes. */
export function useT() {
  return useLang().t;
}

/** A piece of rich text: `<T k="problem.p1">English with <strong>markup</strong></T>`. */
export function T({ k, children }) {
  return <>{useT()(k, children)}</>;
}
