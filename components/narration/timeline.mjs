// Pure functions over the narration timeline (public/case-studies/placement-hub/narration/narration.json).
// No DOM, no React: this file is imported by the player and run directly by the tests and validator.
//
// The timeline is chapters → paragraphs → sentences → words, each word with a start/end in seconds. The
// player needs three things fast — "which word is active at time t", "which sentence/chapter is that in",
// and the reverse ("where do I seek for this chapter/word") — so everything is flattened once into
// parallel arrays and looked up by binary search.

/**
 * @typedef {{ t: string, s: number, e: number }} Word
 * @typedef {{ start: number, end: number, words: Word[] }} Sentence
 * @typedef {{ id: string, label: string, anchor: string, start: number, end: number,
 *             paragraphs: { sentences: Sentence[] }[] }} Chapter
 * @typedef {{ engine: string, voice: string, audio: string, duration: number, title: string,
 *             chapters: Chapter[] }} Narration
 *
 * @typedef {{ start: number, end: number, firstWord: number, lastWord: number,
 *             chapter: number, paragraph: number }} FlatSentence
 * @typedef {{ id: string, label: string, anchor: string, start: number, end: number,
 *             firstSentence: number, lastSentence: number }} FlatChapter
 * @typedef {{ duration: number, title: string, engine: string, voice: string, audio: string,
 *             words: Word[], starts: Float64Array, ends: Float64Array, wordSentence: Int32Array,
 *             sentences: FlatSentence[], chapters: FlatChapter[] }} Timeline
 */

// A word stays "active" for this long after its end, so the highlight never flickers off between words.
export const ACTIVE_TAIL = 0.03;
// Chapter chips seek slightly before the first word so its onset isn't clipped.
export const CHAPTER_LEAD_IN = 0.05;

/**
 * Flatten a narration into parallel arrays for fast lookup.
 * @param {Narration} narration
 * @returns {Timeline}
 */
export function buildTimeline(narration) {
  const words = [];
  const sentences = [];
  const chapters = [];
  const sentenceOfWord = [];

  narration.chapters.forEach((chapter, ci) => {
    const firstSentence = sentences.length;
    chapter.paragraphs.forEach((paragraph, pi) => {
      paragraph.sentences.forEach((sentence) => {
        const firstWord = words.length;
        sentence.words.forEach((word) => {
          words.push(word);
          sentenceOfWord.push(sentences.length);
        });
        sentences.push({ start: sentence.start, end: sentence.end, firstWord, lastWord: words.length - 1, chapter: ci, paragraph: pi });
      });
    });
    chapters.push({
      id: chapter.id,
      label: chapter.label,
      anchor: chapter.anchor,
      start: chapter.start,
      end: chapter.end,
      firstSentence,
      lastSentence: sentences.length - 1,
    });
  });

  return {
    duration: narration.duration,
    title: narration.title,
    engine: narration.engine,
    voice: narration.voice,
    audio: narration.audio,
    words,
    starts: Float64Array.from(words, (w) => w.s),
    ends: Float64Array.from(words, (w) => w.e),
    wordSentence: Int32Array.from(sentenceOfWord),
    sentences,
    chapters,
  };
}

/**
 * The last word whose start is at or before `t`, or -1 before the first word. This is the word being
 * spoken or, in a silence, the one most recently spoken.
 * @param {Timeline} tl
 * @param {number} t seconds
 */
export function wordIndexAt(tl, t) {
  const starts = tl.starts;
  let lo = 0;
  let hi = starts.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= t) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

/**
 * The word to show as active at `t`: the word from `wordIndexAt`, but only while `t` is inside it (plus a
 * small tail); in the silences between sentences nothing is active.
 * @returns {number} word index, or -1
 */
export function activeWordAt(tl, t) {
  const i = wordIndexAt(tl, t);
  return i >= 0 && t < tl.ends[i] + ACTIVE_TAIL ? i : -1;
}

/** The sentence a word belongs to (-1 for no word). */
export function sentenceOfWord(tl, wordIndex) {
  return wordIndex >= 0 ? tl.wordSentence[wordIndex] : -1;
}

/**
 * The sentence current at `t`: that of the most recently started word, so it stays current through the
 * silence that follows it and only moves on when the next sentence's first word begins.
 */
export function sentenceIndexAt(tl, t) {
  return sentenceOfWord(tl, wordIndexAt(tl, t));
}

/** The chapter current at `t`, by the same rule (-1 before the first word). */
export function chapterIndexAt(tl, t) {
  const s = sentenceIndexAt(tl, t);
  return s >= 0 ? tl.sentences[s].chapter : -1;
}

/** Where a chapter chip seeks to. */
export function chapterSeekTime(tl, chapterIndex) {
  return Math.max(0, tl.chapters[chapterIndex].start - CHAPTER_LEAD_IN);
}

/** Where a click on a word seeks to. */
export function wordSeekTime(tl, wordIndex) {
  return tl.words[wordIndex].s;
}

/** Index of the chapter with this id, or -1. */
export function chapterIndexById(tl, id) {
  return tl.chapters.findIndex((c) => c.id === id);
}

/** Index of the chapter whose page section this is (anchor === section id), or -1. */
export function chapterIndexByAnchor(tl, anchor) {
  return tl.chapters.findIndex((c) => c.anchor === anchor);
}

/**
 * The number each chapter shows, matching the page's own section numbers: the chapters that belong to a page
 * section count 1, 2, 3…, and the intro (anchor "top") has none. Returns an array parallel to `chapters`.
 * @param {{ anchor: string }[]} chapters
 * @returns {(number | null)[]}
 */
export function sectionNumbers(chapters) {
  let n = 0;
  return chapters.map((c) => (c.anchor === 'top' ? null : ++n));
}

/** m:ss, rounded to the nearest second (the same rule for every readout, so they always agree). */
export function formatTime(t) {
  const total = Math.max(0, Math.round(Number.isFinite(t) ? t : 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** A loose length for labels: "~4 min". Whole minutes, never "4:07" — the exact time is on the player. */
export function approxDuration(seconds) {
  return `~${Math.max(1, Math.round(seconds / 60))} min`;
}

export function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x));
}

/** Fraction played, 0..1, from the timeline's duration (not the audio element's, which can report NaN early). */
export function progressAt(tl, t) {
  return tl.duration ? clamp(t / tl.duration, 0, 1) : 0;
}

/**
 * Where the audio file is: `audio` (a file name) resolved against the narration.json URL, with `?v=<version>`
 * when narration.json records one. A new render gets a new version, so browsers and CDNs never serve the old
 * audio for the new timings.
 * @param {string} jsonUrl  @param {string} audio  @param {string | undefined} version  @param {string} base
 */
export function resolveAudioUrl(jsonUrl, audio, version, base) {
  const url = new URL(audio, new URL(jsonUrl, base));
  if (version) url.searchParams.set('v', version);
  return url.toString();
}

// The one place an engine name becomes words for the disclosure line. Never hard-code an engine in the UI.
const ENGINE_LABELS = {
  kokoro: 'Kokoro, an open-source voice model',
  elevenlabs: 'ElevenLabs',
};

export function engineLabel(engine) {
  return ENGINE_LABELS[engine] ?? String(engine);
}

export function disclosure(engine) {
  return `AI-generated voice (${engineLabel(engine)}), reading a shortened version of this page.`;
}
