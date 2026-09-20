'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNarration, useNarrationState } from './NarrationProvider';
import { approxDuration } from './timeline.mjs';

// The narration's chrome around the player: whether the slide-over is open, the "Listen" trigger in the hero,
// and the per-section "Listen to this part" buttons. The audio itself lives in NarrationProvider, so opening
// and closing the panel never touches playback.
//
//   <NarrationProvider …>
//     <NarrationUIProvider>
//       … <NarrationTrigger duration={247.4} /> … <ListenButton index={1} … /> …
//       <NarrationPanel>…player…</NarrationPanel> <NarrationMiniBar />
//     </NarrationUIProvider>
//   </NarrationProvider>

const UIContext = createContext(null);

/** The UI context, or null when the player is used on its own (then it is always "open"). */
export function useNarrationUIOptional() {
  return useContext(UIContext);
}

export function useNarrationUI() {
  const value = useContext(UIContext);
  if (!value) throw new Error('useNarrationUI must be used inside <NarrationUIProvider>');
  return value;
}

export function NarrationUIProvider({ children }) {
  const { deepLink, clearDeepLink, ensure } = useNarration();
  const state = useNarrationState();
  const [open, setOpen] = useState(false);
  const [miniDismissed, setMiniDismissed] = useState(false);
  const openerRef = useRef(null); // what to give focus back to when the panel closes

  const openPanel = useCallback((opener) => {
    if (opener instanceof HTMLElement) openerRef.current = opener;
    setOpen(true);
  }, []);
  const closePanel = useCallback(() => setOpen(false), []);
  const togglePanel = useCallback((opener) => {
    if (opener instanceof HTMLElement) openerRef.current = opener;
    setOpen((v) => !v);
  }, []);

  // ?listen=1&t=62 opens the panel and parks the audio at that moment. It never starts playing by itself.
  useEffect(() => {
    if (!deepLink) return;
    setOpen(true);
    if (deepLink.t > 0) ensure().then((controller) => controller.seek(deepLink.t)).catch(() => {});
    clearDeepLink();
  }, [deepLink, clearDeepLink, ensure]);

  // The mini bar can be closed; it comes back the next time the voice starts.
  useEffect(() => {
    if (state.playing) setMiniDismissed(false);
  }, [state.playing]);
  const dismissMini = useCallback(() => setMiniDismissed(true), []);

  const value = useMemo(
    () => ({ open, openPanel, closePanel, togglePanel, openerRef, miniDismissed, dismissMini }),
    [open, openPanel, closePanel, togglePanel, miniDismissed, dismissMini]
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// A small sound wave: five bars of different heights. It moves while the narration plays.
function WaveIcon() {
  return (
    <svg className="nr-wave" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {[[2, 7], [5.5, 12], [9, 15], [12.5, 10], [16, 6]].map(([x, h], i) => (
        <rect key={i} x={x - 0.9} y={9 - h / 2} width="1.8" height={h} rx="0.9" style={{ '--i': i }} />
      ))}
    </svg>
  );
}

/** The button in the hero that opens the panel. Starts loading the narration as soon as it is approached. */
export function NarrationTrigger({ duration, className = '' }) {
  const { open, togglePanel } = useNarrationUI();
  const { ensure } = useNarration();
  const state = useNarrationState();
  const warm = () => ensure().catch(() => {});
  return (
    <button
      type="button"
      className={`nr-trigger${state.playing ? ' is-playing' : ''} ${className}`.trim()}
      aria-expanded={open}
      aria-controls="nr-dock"
      aria-label={`Listen to the short version, about ${Math.round(duration / 60)} minutes`}
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      onClick={(event) => togglePanel(event.currentTarget)}
    >
      <WaveIcon />
      <span className="nr-trigger__label">Listen to the short version</span>
      <span className="nr-trigger__time">{approxDuration(duration)}</span>
    </button>
  );
}

/**
 * "Listen to this part": plays from the start of one chapter, without opening the panel — the mini bar takes
 * over, so the reader can keep reading the page while listening. `index` is the chapter's position in the
 * narration; the label is rendered on the server so it shows before anything loads.
 */
export function ListenButton({ index, label, length }) {
  const { ensure } = useNarration();
  const state = useNarrationState();
  const ref = useRef(null);
  const active = state.playing && state.activeChapter === index;

  // Load the narration data once a reader scrolls near any section, so a tap can start audio at once.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          ensure().catch(() => {});
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ensure]);

  const onClick = () => {
    ensure()
      .then((controller) => (active ? controller.pause() : controller.seekToChapter(index, { play: true })))
      .catch(() => {});
  };

  return (
    <button ref={ref} type="button" className="nr-listen" onClick={onClick} aria-label={active ? `Pause narration` : `Listen to this part: ${label}, ${length}`}>
      <span className="nr-listen__icon" aria-hidden="true">
        {active ? (
          <svg viewBox="0 0 16 16"><rect x="4" y="3" width="3" height="10" rx="0.8" /><rect x="9" y="3" width="3" height="10" rx="0.8" /></svg>
        ) : (
          <svg viewBox="0 0 16 16"><path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.4-4.8a.6.6 0 0 0 0-1L5.92 2.7a.6.6 0 0 0-.92.5Z" /></svg>
        )}
      </span>
      <span>{active ? 'Pause' : 'Listen to this part'}</span>
      <span className="nr-listen__time">{length}</span>
    </button>
  );
}
