'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNarration, useNarrationState } from './NarrationProvider';
import { approxDuration } from './timeline.mjs';
import { useT } from '@/components/i18n/LangProvider';

// The narration's chrome around the player: the floating card (a small player by default, expandable to the
// full transcript), the "Listen" trigger in the hero, and the per-section "Listen to this part" buttons. The
// audio itself lives in NarrationProvider, so changing the card's size never touches playback.
//
//   mode 'closed'    nothing on screen
//   mode 'mini'      the small player: play/pause, what is being said, a way to expand, a way to close
//   mode 'expanded'  the full card: controls, scrubber, chapter dots and the transcript
//
//   <NarrationProvider …>
//     <NarrationUIProvider>
//       … <NarrationTrigger duration={247.4} /> … <ListenButton index={1} … /> …
//       <NarrationPanel>…player…</NarrationPanel>
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
  const [mode, setMode] = useState('closed');

  const showMini = useCallback(() => setMode((m) => (m === 'closed' ? 'mini' : m)), []);
  const expand = useCallback(() => setMode('expanded'), []);
  const collapse = useCallback(() => setMode('mini'), []);
  const dismiss = useCallback(() => setMode('closed'), []);

  // ?listen=1&t=62 opens the full card and parks the audio at that moment. It never starts playing by itself.
  useEffect(() => {
    if (!deepLink) return;
    setMode('expanded');
    if (deepLink.t > 0) ensure().then((controller) => controller.seek(deepLink.t)).catch(() => {});
    clearDeepLink();
  }, [deepLink, clearDeepLink, ensure]);

  // However the voice starts (the hero button, a section's button, the lock screen), the small player appears,
  // so it never plays with no controls in sight. Closing it stops the audio first, so this doesn't undo that.
  useEffect(() => {
    if (state.playing) showMini();
  }, [state.playing, showMini]);

  const value = useMemo(
    () => ({ mode, open: mode === 'expanded', showMini, expand, collapse, dismiss }),
    [mode, showMini, expand, collapse, dismiss]
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

/**
 * The button in the hero. One press shows the small player and starts the voice (a press is what allows sound to
 * start); pressed again it pauses. It starts loading the narration as soon as it is approached.
 */
export function NarrationTrigger({ duration, className = '' }) {
  const { showMini } = useNarrationUI();
  const { ensure } = useNarration();
  const state = useNarrationState();
  const t = useT();
  const warm = () => ensure().catch(() => {});
  const minutes = Math.max(1, Math.round(duration / 60));
  const label = state.playing ? t('nr.pauseShort', 'Pause the short version') : t('nr.listenShort', 'Listen to the short version');
  return (
    <button
      type="button"
      className={`nr-trigger${state.playing ? ' is-playing' : ''} ${className}`.trim()}
      aria-label={state.playing ? label : t('nr.listenShortAbout', '{label}, about {minutes} minutes', { label, minutes })}
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      onClick={() => {
        showMini();
        ensure().then((controller) => controller.toggle()).catch(() => {});
      }}
    >
      <WaveIcon />
      <span className="nr-trigger__label">{label}</span>
      <span className="nr-trigger__time">
        {t('nr.approx', approxDuration(duration), { n: minutes })}
        {t('nr.audioTag', '')}
      </span>
    </button>
  );
}

/**
 * "Listen to this part": plays from the start of one chapter, and the small player takes over, so the reader
 * can keep reading the page while listening. `index` is the chapter's position in the
 * narration; the label is rendered on the server so it shows before anything loads.
 */
export function ListenButton({ index, label, length }) {
  const { ensure } = useNarration();
  const t = useT();
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
    <button ref={ref} type="button" className="nr-listen" onClick={onClick} aria-label={active ? t('nr.pauseNarration', 'Pause narration') : t('nr.listenPartAria', 'Listen to this part: {label}, {length}', { label, length })}>
      <span className="nr-listen__icon" aria-hidden="true">
        {active ? (
          <svg viewBox="0 0 16 16"><rect x="4" y="3" width="3" height="10" rx="0.8" /><rect x="9" y="3" width="3" height="10" rx="0.8" /></svg>
        ) : (
          <svg viewBox="0 0 16 16"><path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.4-4.8a.6.6 0 0 0 0-1L5.92 2.7a.6.6 0 0 0-.92.5Z" /></svg>
        )}
      </span>
      <span>{active ? t('nr.pause', 'Pause') : t('nr.listenPart', 'Listen to this part')}</span>
      <span className="nr-listen__time">{length}</span>
    </button>
  );
}
