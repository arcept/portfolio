'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNarration, useNarrationFrame, useNarrationState } from './NarrationProvider';
import { useNarrationUI } from './NarrationUI';
import { formatTime } from './timeline.mjs';

// The two containers around the player.
//
// NarrationPanel — a right-hand slide-over on desktop, a full-height sheet on phones (both sit under the site
// nav, so the theme switch stays reachable). It is a NON-modal complementary region: no focus trap and no scroll
// lock, so the page stays readable and scrollable beside it, and "Go to section" works naturally. Opening moves
// focus into it, Escape or the close button closes it and gives focus back to whatever opened it.
//
// NarrationMiniBar — appears once playback has started and the panel is closed, so the voice never plays with
// no controls in sight. Its text opens the panel.
//
// The panel's content is always in the page's HTML (the transcript, for readers without JavaScript); it is only
// hidden — and made inert — while closed and hydrated.

export function NarrationPanel({ children }) {
  const { open, closePanel, openerRef } = useNarrationUI();
  const [hydrated, setHydrated] = useState(false);
  const closeRef = useRef(null);
  const dockRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => setHydrated(true), []);

  // Focus in on open; back to the opener on close (only if focus was inside, or nowhere).
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const id = window.requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
      return () => window.cancelAnimationFrame(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      const active = document.activeElement;
      if (!active || active === document.body || dockRef.current?.contains(active)) {
        const opener = openerRef.current;
        if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      }
    }
    return undefined;
  }, [open, openerRef]);

  return (
    <>
      <aside
        ref={dockRef}
        id="nr-dock"
        className={`nr-dock${open ? ' is-open' : ''}`}
        aria-label="Narration"
        inert={hydrated && !open ? true : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            closePanel();
          }
        }}
      >
        <div className="nr-dock__bar">
          <p className="nr-dock__label">Listen to the short version</p>
          <button ref={closeRef} type="button" className="nr-close" aria-label="Close narration" onClick={closePanel}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </aside>
      {/* Without JavaScript the panel can't open, so it is laid out as a plain section at the end of the page and the transcript reads as text. */}
      <noscript>
        <style>{`.nr-dock{position:static!important;transform:none!important;visibility:visible!important;width:auto!important;border:0!important;box-shadow:none!important;padding:0 24px 48px}.nr-dock .nr{height:auto}.nr-close,.nr-top,.nr-scrub,.nr-times,.nr-chips,.nr-foot{display:none!important}.nr-read{position:static}.nr-panel{position:static!important;height:auto!important;overflow:visible!important;-webkit-mask-image:none!important;mask-image:none!important}`}</style>
      </noscript>
    </>
  );
}

function sentenceText(timeline, sentenceIndex) {
  if (sentenceIndex < 0) return '';
  const s = timeline.sentences[sentenceIndex];
  return timeline.words
    .slice(s.firstWord, s.lastWord + 1)
    .map((w) => w.t)
    .join(' ');
}

export function NarrationMiniBar() {
  const { open, openPanel, miniDismissed, dismissMini } = useNarrationUI();
  const { controller } = useNarration();
  const state = useNarrationState();
  const timeRef = useRef(null);
  const barRef = useRef(null);
  const shown = state.started && !open && !miniDismissed && controller;

  const line = useMemo(() => (controller ? sentenceText(controller.tl, state.activeSentence) : ''), [controller, state.activeSentence]);
  const chapter = controller && state.activeChapter >= 0 ? controller.tl.chapters[state.activeChapter].label : 'Narration';

  useNarrationFrame((frame) => {
    if (!controller) return;
    if (timeRef.current) {
      const text = `${formatTime(frame.t)} / ${formatTime(controller.tl.duration)}`;
      if (timeRef.current.textContent !== text) timeRef.current.textContent = text;
    }
    if (barRef.current) barRef.current.style.width = `${(frame.progress * 100).toFixed(2)}%`;
  });

  // Once the mini bar (re)appears, paint the current position straight away.
  useEffect(() => {
    if (!shown) return;
    const f = controller.getFrame();
    if (timeRef.current) timeRef.current.textContent = `${formatTime(f.t)} / ${formatTime(controller.tl.duration)}`;
    if (barRef.current) barRef.current.style.width = `${(f.progress * 100).toFixed(2)}%`;
  }, [shown, controller]);

  if (!shown) return null;
  const playing = state.playing;
  return (
    <div className="nr-mini" role="region" aria-label="Narration controls">
      <button type="button" className="nr-mini__play" aria-label={playing ? 'Pause narration' : state.ended ? 'Replay narration' : 'Play narration'} onClick={() => controller.toggle()}>
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1" /><rect x="13.5" y="5" width="4" height="14" rx="1" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a.75.75 0 0 0 1.14.64l10.4-6.5a.75.75 0 0 0 0-1.28L9.14 4.86A.75.75 0 0 0 8 5.5Z" /></svg>
        )}
      </button>
      <button type="button" className="nr-mini__now" aria-label={`Open narration transcript. Now: ${chapter}`} onClick={(event) => openPanel(event.currentTarget)}>
        <b>{chapter}</b>
        <span>{line}</span>
      </button>
      <span className="nr-mini__time" ref={timeRef} aria-hidden="true" />
      <button
        type="button"
        className="nr-mini__close"
        aria-label="Close narration player"
        title="Close (pauses the narration)"
        onClick={() => {
          controller.pause();
          dismissMini();
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <span className="nr-mini__track" aria-hidden="true">
        <i ref={barRef} />
      </span>
    </div>
  );
}
