'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNarration, useNarrationFrame, useNarrationState } from './NarrationProvider';
import { useNarrationUI } from './NarrationUI';
import { ForwardIcon, PauseIcon, PlayIcon, RewindIcon } from './NarrationIcons';
import { SKIP_SECONDS } from './controller.mjs';
import { formatTime } from './timeline.mjs';

// The floating card. It is ONE element that is a small player by default and grows, up and to the left, into the
// full player (controls, scrubber, chapters, transcript); on phones the small player is a bar along the bottom and
// the full one a sheet under the site nav. Growing and shrinking never touches the audio.
//
// It is a NON-modal complementary region: no focus trap and no scroll lock, so the page stays readable and
// scrollable beside it, and "Go to section" works naturally. Expanding moves focus to its collapse button;
// Escape or that button shrinks it back and returns focus to the button that expanded it. Whichever part is not
// showing is inert, so it can't be tabbed into.
//
// The full player's content (the transcript) is always in the page's HTML, for readers without JavaScript; it is
// only hidden, and made inert, while the card is not expanded and the page has hydrated.

function sentenceText(timeline, sentenceIndex) {
  if (sentenceIndex < 0) return '';
  const s = timeline.sentences[sentenceIndex];
  return timeline.words
    .slice(s.firstWord, s.lastWord + 1)
    .map((w) => w.t)
    .join(' ');
}

const Svg = ({ children }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/**
 * The small player: what the card is when it is not expanded. Two rows: what is being said (with expand and
 * close) above, and the transport (back, play, forward, and a bar you can click or drag to seek) below.
 */
function MiniRow({ expandRef }) {
  const { expand, dismiss } = useNarrationUI();
  const { controller } = useNarration();
  const state = useNarrationState();
  const elapsedRef = useRef(null);
  const rangeRef = useRef(null);
  const draggingRef = useRef(false);
  const shownSecond = useRef('');

  const line = useMemo(() => (controller ? sentenceText(controller.tl, state.activeSentence) : ''), [controller, state.activeSentence]);
  const chapter = controller && state.activeChapter >= 0 ? controller.tl.chapters[state.activeChapter].label : 'Narration';
  const duration = controller ? controller.tl.duration : 0;

  useNarrationFrame((frame) => {
    if (!controller) return;
    const clock = formatTime(frame.t);
    if (elapsedRef.current && shownSecond.current !== clock) {
      shownSecond.current = clock;
      elapsedRef.current.textContent = clock;
      rangeRef.current?.setAttribute('aria-valuetext', `${clock} of ${formatTime(controller.tl.duration)}`);
    }
    const range = rangeRef.current;
    if (range) {
      if (!draggingRef.current) range.value = String(Math.round(frame.progress * 1000));
      range.style.setProperty('--p', `${(frame.progress * 100).toFixed(2)}%`);
    }
  });

  const playing = state.playing;
  return (
    <div className="nr-dock__mini">
      <div className="nr-mini__top">
        {/* The words are also a bigger target for the same action as the expand button next to them. */}
        <div className="nr-mini__now" onClick={expand}>
          <b>{chapter}</b>
          <span>{line}</span>
        </div>
        <button ref={expandRef} type="button" className="nr-mini__btn" aria-label={`Expand narration transcript. Now: ${chapter}`} title="Show the transcript" onClick={expand}>
          <Svg><path d="m4 10 4-4 4 4" /></Svg>
        </button>
        <button
          type="button"
          className="nr-mini__btn"
          aria-label="Close narration player"
          title="Close (pauses the narration)"
          onClick={() => {
            controller?.pause();
            dismiss();
          }}
        >
          <Svg><path d="m3.5 3.5 9 9M12.5 3.5l-9 9" /></Svg>
        </button>
      </div>

      <div className="nr-mini__bottom">
        <button type="button" className="nr-mini__skip" aria-label={`Back ${SKIP_SECONDS} seconds`} title={`Back ${SKIP_SECONDS} seconds`} disabled={!controller} onClick={() => controller?.skip(-SKIP_SECONDS)}>
          <RewindIcon />
        </button>
        <button
          type="button"
          className="nr-mini__play"
          aria-label={playing ? 'Pause narration' : state.ended ? 'Replay narration' : 'Play narration'}
          disabled={!controller}
          onClick={() => controller?.toggle()}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="nr-mini__skip" aria-label={`Forward ${SKIP_SECONDS} seconds`} title={`Forward ${SKIP_SECONDS} seconds`} disabled={!controller} onClick={() => controller?.skip(SKIP_SECONDS)}>
          <ForwardIcon />
        </button>
        <span className="nr-mini__clock" ref={elapsedRef}>0:00</span>
        <input
          ref={rangeRef}
          className="nr-mini__seek"
          type="range"
          min={0}
          max={1000}
          step={1}
          defaultValue={0}
          aria-label="Seek narration"
          disabled={!controller}
          onInput={(event) => controller?.seek((Number(event.currentTarget.value) / 1000) * duration)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
            event.preventDefault();
            controller?.skip(event.key === 'ArrowRight' ? 5 : -5);
          }}
          onPointerDown={() => (draggingRef.current = true)}
          onPointerUp={() => (draggingRef.current = false)}
          onPointerCancel={() => (draggingRef.current = false)}
          onBlur={() => (draggingRef.current = false)}
        />
        <span className="nr-mini__clock">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export function NarrationPanel({ children }) {
  const { mode, collapse } = useNarrationUI();
  const expanded = mode === 'expanded';
  const [hydrated, setHydrated] = useState(false);
  const collapseRef = useRef(null);
  const expandRef = useRef(null);
  const dockRef = useRef(null);
  const wasExpanded = useRef(false);

  useEffect(() => setHydrated(true), []);

  // Focus in on expanding; back to the expand button on shrinking (only if focus was inside, or nowhere).
  useEffect(() => {
    if (expanded) {
      wasExpanded.current = true;
      const id = window.requestAnimationFrame(() => collapseRef.current?.focus({ preventScroll: true }));
      return () => window.cancelAnimationFrame(id);
    }
    if (wasExpanded.current) {
      wasExpanded.current = false;
      const active = document.activeElement;
      if (!active || active === document.body || dockRef.current?.contains(active)) expandRef.current?.focus({ preventScroll: true });
    }
    return undefined;
  }, [expanded]);

  return (
    <>
      <aside
        ref={dockRef}
        id="nr-dock"
        className="nr-dock"
        data-mode={mode}
        aria-label="Narration"
        inert={hydrated && mode === 'closed' ? true : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && expanded) {
            event.stopPropagation();
            collapse();
          }
        }}
      >
        <div className="nr-dock__miniwrap" inert={hydrated && mode !== 'mini' ? true : undefined}>
          <MiniRow expandRef={expandRef} />
        </div>
        <div className="nr-dock__full" inert={hydrated && !expanded ? true : undefined}>
          <div className="nr-dock__bar">
            <p className="nr-dock__label">Listen to the short version</p>
            <button ref={collapseRef} type="button" className="nr-collapse" aria-label="Shrink to the small player" title="Shrink" onClick={collapse}>
              <Svg><path d="m4 6 4 4 4-4" /></Svg>
            </button>
          </div>
          {children}
        </div>
      </aside>
      {/* Without JavaScript the card can't open, so it is laid out as a plain section at the end of the page and the transcript reads as text. */}
      <noscript>
        <style>{`.nr-dock{position:static!important;display:block!important;width:auto!important;height:auto!important;opacity:1!important;visibility:visible!important;transform:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important;padding:0 24px 48px}.nr-dock__miniwrap{display:none!important}.nr-dock__full{opacity:1!important;visibility:visible!important}.nr-dock .nr{height:auto}.nr-collapse,.nr-controls,.nr-scrub,.nr-meta,.nr-foot{display:none!important}.nr-read{position:static}.nr-panel{position:static!important;height:auto!important;overflow:visible!important;-webkit-mask-image:none!important;mask-image:none!important}`}</style>
      </noscript>
    </>
  );
}
