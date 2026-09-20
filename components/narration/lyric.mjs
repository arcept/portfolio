// The lyric-style highlight: turns a stream of frames (see controller.mjs) into class changes on the
// transcript's own DOM. It never re-renders anything — it only toggles classes and sets one CSS variable —
// so ~590 words cost almost nothing per frame.
//
// Four visual states (styles in narration.css):
//   sentences not yet read  → muted           .nr-s
//   sentences already read  → secondary       .nr-s.is-done
//   the current sentence    → full ink        .nr-s.is-cur, with its already-spoken words in the accent (.nr-w.is-spoken)
//   the active word         → accent, heavier .nr-w.is-on, with a 2px underline that fills via --f (0–100)
//
// FOLLOWING. While following, each new sentence scrolls into place (about a third of the way down the panel).
// When the reader scrolls by hand, following stops and STAYS stopped: nothing yanks the panel back while
// they read ahead or behind. It starts again only when they ask (resume: the "Follow along" button, a word,
// a chapter) or when they scroll the current sentence back into view (resumeQuiet, no scroll needed).
//
// It takes plain objects with `classList`, `style`, `offsetTop` and `getBoundingClientRect`, so it runs in
// Node tests with fakes.

import { clamp } from './timeline.mjs';

// Where the current sentence sits in the panel when following: about a third of the way down.
export const FOLLOW_POSITION = 0.34;
// A jump of more than this many words is a seek: re-mark everything instead of stepping.
const STEP_LIMIT = 2;

/**
 * @param {{ words: any[], sentences: any[], chapters: any[], panel: any,
 *           timeline: import('./timeline.mjs').Timeline,
 *           reduceMotion?: () => boolean }} options
 */
export function createLyricSync({ words, sentences, chapters, panel, timeline, reduceMotion = () => false }) {
  let lastSpoken = -1;
  let curOn = -1;
  let curSentence = -2; // -2 so the very first frame always paints
  let curChapter = -2;
  let following = true;

  function scrollToCurrent() {
    const el = sentences[curSentence];
    if (!el) return;
    const top = el.offsetTop - panel.clientHeight * FOLLOW_POSITION;
    panel.scrollTo({ top: Math.max(0, top), behavior: reduceMotion() ? 'auto' : 'smooth' });
  }

  function markSpoken(spoken) {
    if (spoken === lastSpoken) return;
    if (lastSpoken < 0 || Math.abs(spoken - lastSpoken) > STEP_LIMIT) {
      for (let k = 0; k < words.length; k++) words[k].classList.toggle('is-spoken', k <= spoken);
    } else if (spoken > lastSpoken) {
      for (let k = lastSpoken + 1; k <= spoken; k++) words[k].classList.add('is-spoken');
    } else {
      for (let k = spoken + 1; k <= lastSpoken; k++) words[k].classList.remove('is-spoken');
    }
    lastSpoken = spoken;
  }

  return {
    /** Apply a frame. */
    update(frame) {
      markSpoken(frame.spoken);

      if (frame.word !== curOn) {
        if (curOn >= 0) {
          words[curOn].classList.remove('is-on');
          words[curOn].style.removeProperty('--f');
        }
        if (frame.word >= 0) words[frame.word].classList.add('is-on');
        curOn = frame.word;
      }
      if (curOn >= 0) {
        const s = timeline.starts[curOn];
        const e = timeline.ends[curOn];
        words[curOn].style.setProperty('--f', (clamp((frame.t - s) / Math.max(0.05, e - s), 0, 1) * 100).toFixed(1));
      }

      if (frame.sentence !== curSentence) {
        curSentence = frame.sentence;
        for (let k = 0; k < sentences.length; k++) {
          sentences[k].classList.toggle('is-done', k < curSentence);
          sentences[k].classList.toggle('is-cur', k === curSentence);
        }
        if (curSentence >= 0 && following) scrollToCurrent();
      }

      if (frame.chapter !== curChapter) {
        curChapter = frame.chapter;
        for (let k = 0; k < chapters.length; k++) chapters[k].classList.toggle('is-cur', k === curChapter);
      }
    },

    /** The reader took over the scrolling: stop following until they ask for it back. */
    pause() {
      following = false;
    },

    /** Follow again, and scroll to the current sentence now. */
    resume() {
      following = true;
      scrollToCurrent();
    },

    /** Follow again without scrolling (the current sentence is already in view, or a seek is about to scroll). */
    resumeQuiet() {
      following = true;
    },

    /**
     * Where the current sentence is relative to what the reader can see in the panel:
     * 'visible', 'above', 'below', or 'none' before the first word.
     */
    position() {
      const el = sentences[curSentence];
      if (!el) return 'none';
      const box = el.getBoundingClientRect();
      const view = panel.getBoundingClientRect();
      if (box.bottom < view.top) return 'above';
      if (box.top > view.bottom) return 'below';
      return 'visible';
    },

    get following() {
      return following;
    },
  };
}
