'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { NarrationController } from './controller.mjs';
import { resolveAudioUrl } from './timeline.mjs';
import { useLang } from '@/components/i18n/LangProvider';

// Gives the page one narration: it owns the controller (and so the single <audio> element), so the audio
// and its state survive the card changing size. Nothing is fetched until something calls
// ensure() — the trigger on first interaction — so the narration costs the page nothing to load.
//
//   <NarrationProvider src="/case-studies/placement-hub/narration/narration.json"> …page… </NarrationProvider>
//
// `src` can also be a map from language to narration.json ({ en: '…', de: '…' }): the narration in the page's
// language is used, or the English one when a language has none. Changing language replaces the narration (and
// stops the old one). Each language keeps its own remembered position.
//
// Hooks for the parts of the UI:
//   useNarration()        → { status, narration, controller, ensure, deepLink, clearDeepLink }
//   useNarrationState()   → the discrete state (playing, activeSentence, …); re-renders only when it changes
//   useNarrationFrame(fn) → fn(frame) every animation frame; write to the DOM in it, never to React state

const NarrationContext = createContext(null);

/** @type {import('./controller.mjs').NarrationState} */
const IDLE = Object.freeze({ duration: 0, started: false, playing: false, ended: false, rate: 1, error: null, activeSentence: -1, activeChapter: -1 });
const noSubscribe = () => () => {};
const getIdle = () => IDLE;

// "?listen=1&t=62" (or t=1:02) asks for the player to open at that moment. Returns null if not asked.
function parseDeepLink(search) {
  const params = new URLSearchParams(search);
  if (params.get('listen') !== '1') return null;
  const raw = params.get('t') ?? '';
  let t = 0;
  const clock = raw.match(/^(\d+):(\d{1,2})$/);
  if (clock) t = Number(clock[1]) * 60 + Number(clock[2]);
  else if (/^\d+(\.\d+)?$/.test(raw)) t = Number(raw);
  return { t };
}

export default function NarrationProvider({ src: sources, storageKey: baseKey = 'placement-hub-narration', children }) {
  const { lang } = useLang();
  const src = typeof sources === 'string' ? sources : (sources[lang] ?? sources.en);
  const storageKey = typeof sources === 'string' || !sources[lang] || lang === 'en' ? baseKey : `${baseKey}-${lang}`;
  const [status, setStatus] = useState('idle'); // idle → loading → ready | error
  const [narration, setNarration] = useState(null);
  const [controller, setController] = useState(null);
  const [deepLink, setDeepLink] = useState(null);
  const controllerRef = useRef(null);
  const loadingRef = useRef(null);
  const loadedSrc = useRef(null);

  // A different narration is wanted (the language changed): let go of the one that is loaded.
  useEffect(() => {
    if (!controllerRef.current || loadedSrc.current === src) return;
    controllerRef.current.destroy();
    controllerRef.current = null;
    loadingRef.current = null;
    loadedSrc.current = null;
    setController(null);
    setNarration(null);
    setStatus('idle');
  }, [src]);

  useEffect(() => {
    setDeepLink(parseDeepLink(window.location.search));
  }, []);

  // Release the audio when the page goes away.
  useEffect(
    () => () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    },
    []
  );

  /** Load the narration data (once) and create the controller. Safe to call repeatedly. */
  const ensure = useCallback(() => {
    if (controllerRef.current) return Promise.resolve(controllerRef.current);
    if (loadingRef.current) return loadingRef.current;
    setStatus('loading');
    loadingRef.current = fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`narration.json: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const audioUrl = resolveAudioUrl(src, data.audio, data.version, window.location.href);
        const created = new NarrationController(data, { audioUrl, storageKey });
        controllerRef.current = created;
        loadedSrc.current = src;
        setNarration(data);
        setController(created);
        setStatus('ready');
        return created;
      })
      .catch((error) => {
        loadingRef.current = null; // allow a retry
        setStatus('error');
        throw error;
      });
    return loadingRef.current;
  }, [src, storageKey]);

  const clearDeepLink = useCallback(() => setDeepLink(null), []);
  const value = useMemo(
    () => ({ status, narration, controller, ensure, deepLink, clearDeepLink }),
    [status, narration, controller, ensure, deepLink, clearDeepLink]
  );

  return <NarrationContext.Provider value={value}>{children}</NarrationContext.Provider>;
}

export function useNarration() {
  const value = useContext(NarrationContext);
  if (!value) throw new Error('useNarration must be used inside <NarrationProvider>');
  return value;
}

/** The controller's discrete state. Before the narration has loaded this is a stable idle state. */
export function useNarrationState() {
  const { controller } = useNarration();
  return useSyncExternalStore(controller ? controller.subscribe : noSubscribe, controller ? controller.getSnapshot : getIdle, getIdle);
}

/**
 * Call `callback(frame)` on every animation frame while playing, and once on every seek/pause. It is also
 * called once when the subscription starts, so the UI can paint the current position. The callback doesn't
 * need to be memoised. The frame object is reused: read it, don't keep it.
 */
export function useNarrationFrame(callback) {
  const { controller } = useNarration();
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => {
    if (!controller) return undefined;
    const run = (frame) => latest.current(frame);
    run(controller.getFrame());
    return controller.subscribeFrame(run);
  }, [controller]);
}
