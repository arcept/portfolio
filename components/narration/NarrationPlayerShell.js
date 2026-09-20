'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNarration, useNarrationFrame, useNarrationState } from './NarrationProvider';
import { useNarrationUIOptional } from './NarrationUI';
import { SKIP_SECONDS } from './controller.mjs';
import { createLyricSync } from './lyric.mjs';
import { formatTime } from './timeline.mjs';
import { ForwardIcon, PauseIcon, PlayIcon, RewindIcon } from './NarrationIcons';

// The interactive part of the player, kept deliberately quiet: rewind / play / forward, a speed button, one thin
// scrubber with a small dot at each chapter, and a line naming the chapter you are in. The transcript below it is
// the main event, and it follows the voice.
//
// Anything that changes every frame (the clock, the scrubber, the highlighted word) is written straight to the
// DOM through refs; React state only changes for things that happen a few times a minute.

const REDUCED = '(prefers-reduced-motion: reduce)';
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.(REDUCED).matches;

const ArrowIcon = ({ up }) => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={up ? { transform: 'rotate(180deg)' } : undefined}>
    <path d="M8 3v9M4 8.5l4 4 4-4" />
  </svg>
);

/**
 * @param {{ meta: { title: string, duration: number, disclosure: string,
 *                   chapters: { id: string, label: string, anchor: string, start: number, number: number | null }[] },
 *           className?: string, children: import('react').ReactNode }} props
 */
export default function NarrationPlayerShell({ meta, className = '', children }) {
  const { status, controller, ensure } = useNarration();
  // Whether the player is on screen: the card's state when there is a card, otherwise always.
  const ui = useNarrationUIOptional();
  const open = ui ? ui.open : true;
  const state = useNarrationState();
  const [followHint, setFollowHint] = useState(null); // null, or where the current sentence is: 'above' | 'below'

  const panelRef = useRef(null);
  const rangeRef = useRef(null);
  const nowRef = useRef(null);
  const lyricRef = useRef(null);
  const draggingRef = useRef(false);
  const shownSecond = useRef('');
  const scrollFrame = useRef(0);
  const playingRef = useRef(false);
  playingRef.current = state.playing;

  // Start loading the narration as soon as the player is on screen, so the first tap on play is instant
  // (some browsers only allow audio to start straight from a tap, not after a network wait).
  useEffect(() => {
    if (open) ensure().catch(() => {});
  }, [open, ensure]);

  // Run a command on the controller, loading it first if a tap beat the load.
  const run = useCallback((command) => (controller ? Promise.resolve(command(controller)) : ensure().then(command)).catch(() => {}), [controller, ensure]);

  // ---- follow hint: show "Follow along" only when the reader has left the voice behind ------------------
  const refreshFollowHint = useCallback(() => {
    const sync = lyricRef.current;
    if (!sync) return;
    if (sync.following) return setFollowHint(null);
    const where = sync.position();
    setFollowHint(playingRef.current && (where === 'above' || where === 'below') ? where : null);
  }, []);

  // ---- the lyric highlight -----------------------------------------------------------------------
  useEffect(() => {
    const panel = panelRef.current;
    if (!controller || !panel) return undefined;
    const tl = controller.tl;
    const pick = (selector, attr, count) => {
      const list = new Array(count);
      panel.querySelectorAll(selector).forEach((el) => {
        list[Number(el.dataset[attr])] = el;
      });
      return list;
    };
    const words = pick('[data-w]', 'w', tl.words.length);
    const sentences = pick('[data-s]', 's', tl.sentences.length);
    const chapters = pick('section[data-c]', 'c', tl.chapters.length);
    // If the markup and the timeline disagree the highlight would land on the wrong words: better none.
    if ([...words, ...sentences, ...chapters].some((el) => !el)) {
      console.warn('Narration transcript does not match narration.json; the lyric highlight is off.');
      return undefined;
    }
    const sync = createLyricSync({ words, sentences, chapters, panel, timeline: tl, reduceMotion: prefersReducedMotion });
    lyricRef.current = sync;
    sync.update(controller.getFrame());
    return () => {
      lyricRef.current = null;
      window.cancelAnimationFrame(scrollFrame.current);
    };
  }, [controller]);

  // The hint depends on where the voice is and whether it is playing.
  useEffect(() => {
    refreshFollowHint();
  }, [state.activeSentence, state.playing, refreshFollowHint]);

  // ---- per-frame DOM writes (never React state) ---------------------------------------------------
  useNarrationFrame((frame) => {
    const clock = formatTime(frame.t);
    if (nowRef.current && shownSecond.current !== clock) {
      shownSecond.current = clock;
      nowRef.current.textContent = clock;
      rangeRef.current?.setAttribute('aria-valuetext', `${clock} of ${formatTime(meta.duration)}`);
    }
    const range = rangeRef.current;
    if (range) {
      if (!draggingRef.current) range.value = String(Math.round(frame.progress * 1000));
      range.style.setProperty('--p', `${(frame.progress * 100).toFixed(2)}%`);
    }
    lyricRef.current?.update(frame);
  });

  // ---- taking over the scrolling -------------------------------------------------------------------
  // Manual scrolling is detected from the reader's own input (wheel, touch, pointer, keys) — never from the
  // scroll event, which also fires for our own smooth scrolling. From then on the panel is theirs.
  const takeOver = useCallback(() => {
    lyricRef.current?.pause();
    refreshFollowHint();
  }, [refreshFollowHint]);

  const onScroll = useCallback(() => {
    if (scrollFrame.current) return;
    scrollFrame.current = window.requestAnimationFrame(() => {
      scrollFrame.current = 0;
      refreshFollowHint();
    });
  }, [refreshFollowHint]);

  const followAgain = useCallback(() => {
    setFollowHint(null);
    lyricRef.current?.resume();
  }, []);

  // A seek (a word, a chapter dot) is itself a request to follow: the sentence change will scroll.
  const seekAndFollow = useCallback(
    (command) => {
      lyricRef.current?.resumeQuiet();
      setFollowHint(null);
      run(command);
    },
    [run]
  );

  const onPanelClick = (event) => {
    const word = event.target instanceof Element ? event.target.closest('[data-w]') : null;
    if (word) seekAndFollow((c) => c.seekToWord(Number(word.dataset.w)));
  };

  // ---- scrubber ---------------------------------------------------------------------------------------
  const onRangeInput = (event) => {
    const t = (Number(event.currentTarget.value) / 1000) * meta.duration;
    lyricRef.current?.resumeQuiet();
    run((c) => c.seek(t));
  };
  const onRangeKeyDown = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 5 : -5;
    lyricRef.current?.resumeQuiet();
    run((c) => c.skip(delta));
  };

  const playing = state.playing;
  const playLabel = playing ? 'Pause narration' : state.ended ? 'Replay narration' : 'Play narration';
  const problem = status === 'error' ? 'The narration audio could not be loaded. The transcript below still reads in full.' : state.error?.message;
  const total = formatTime(meta.duration);
  const chapter = meta.chapters[state.activeChapter] ?? meta.chapters[0];

  return (
    <div className={`nr${playing ? ' is-playing' : ''}${className ? ` ${className}` : ''}`} role="group" aria-label="Narration player">
      <div className="nr-controls">
        <button type="button" className="nr-skip" aria-label={`Back ${SKIP_SECONDS} seconds`} title={`Back ${SKIP_SECONDS} seconds`} onClick={() => run((c) => c.skip(-SKIP_SECONDS))}>
          <RewindIcon />
        </button>
        <button type="button" className="nr-play" aria-label={playLabel} onClick={() => run((c) => c.toggle())}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="nr-skip" aria-label={`Forward ${SKIP_SECONDS} seconds`} title={`Forward ${SKIP_SECONDS} seconds`} onClick={() => run((c) => c.skip(SKIP_SECONDS))}>
          <ForwardIcon />
        </button>
        <button type="button" className="nr-speed" aria-label={`Playback speed ${state.rate} times. Change speed`} onClick={() => run((c) => c.cycleRate())}>
          {state.rate}×
        </button>
      </div>

      <div className="nr-scrub">
        <input
          ref={rangeRef}
          className="nr-range"
          type="range"
          min={0}
          max={1000}
          step={1}
          defaultValue={0}
          aria-label="Seek narration"
          aria-valuetext={`0:00 of ${total}`}
          onInput={onRangeInput}
          onKeyDown={onRangeKeyDown}
          onPointerDown={() => (draggingRef.current = true)}
          onPointerUp={() => (draggingRef.current = false)}
          onPointerCancel={() => (draggingRef.current = false)}
          onBlur={() => (draggingRef.current = false)}
        />
        {/* A small dot at each chapter after the first; each is also a button that jumps there. */}
        <div className="nr-marks">
          {meta.chapters.map((c, i) =>
            i === 0 ? null : (
              <button
                key={c.id}
                type="button"
                className={`nr-mark${state.activeChapter === i ? ' is-current' : ''}`}
                style={{ left: `calc(7px + (100% - 14px) * ${c.start / meta.duration})` }}
                aria-label={`Jump to ${c.label}`}
                aria-current={state.activeChapter === i ? 'true' : undefined}
                title={c.label}
                onClick={() => seekAndFollow((ctl) => ctl.seekToChapter(i))}
              >
                <i />
              </button>
            )
          )}
        </div>
      </div>

      <div className="nr-meta">
        <span ref={nowRef}>0:00</span>
        <span className="nr-meta__chapter" aria-live="off">
          {chapter.number !== null && <b>{String(chapter.number).padStart(2, '0')}</b>}
          {chapter.label}
        </span>
        <span>{total}</span>
      </div>

      {problem && (
        <p className="nr-status" role="status">
          {problem}
        </p>
      )}

      <div className="nr-read">
        <div
          ref={panelRef}
          className="nr-panel"
          role="region"
          aria-label="Narration transcript"
          tabIndex={0}
          onClick={onPanelClick}
          onScroll={onScroll}
          onWheel={takeOver}
          onTouchStart={takeOver}
          onPointerDown={takeOver}
          onKeyDown={(e) => ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key) && takeOver()}
        >
          {children}
        </div>
        {followHint && (
          <button type="button" className="nr-follow" onClick={followAgain}>
            <ArrowIcon up={followHint === 'above'} />
            Follow along
          </button>
        )}
      </div>

      <p className="nr-foot">{meta.disclosure}</p>
    </div>
  );
}
