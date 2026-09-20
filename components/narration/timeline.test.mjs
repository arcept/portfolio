import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ACTIVE_TAIL,
  activeWordAt,
  buildTimeline,
  chapterIndexAt,
  chapterIndexByAnchor,
  chapterIndexById,
  chapterSeekTime,
  disclosure,
  engineLabel,
  formatTime,
  approxDuration,
  resolveAudioUrl,
  sectionNumbers,
  progressAt,
  sentenceIndexAt,
  wordIndexAt,
  wordSeekTime,
} from './timeline.mjs';

// A small hand-made narration: two chapters, 3 sentences, with the silences the real one has
// (0.3 s between sentences in a paragraph, 1.0 s between chapters).
const w = (t, s, e) => ({ t, s, e });
const tiny = {
  engine: 'kokoro', voice: 'v', audio: 'a.mp3', duration: 10, title: 'Tiny',
  chapters: [
    { id: 'one', label: 'One', anchor: 'top', start: 0.5, end: 3.0, paragraphs: [{ sentences: [
      { start: 0.5, end: 1.5, words: [w('Hello', 0.5, 1.0), w('there.', 1.0, 1.5)] },
      { start: 1.8, end: 3.0, words: [w('Second', 1.8, 2.4), w('one.', 2.4, 3.0)] },
    ] }] },
    { id: 'two', label: 'Two', anchor: 'sec', start: 4.0, end: 5.0, paragraphs: [{ sentences: [
      { start: 4.0, end: 5.0, words: [w('Last.', 4.0, 5.0)] },
    ] }] },
  ],
};
const tl = buildTimeline(tiny);

test('buildTimeline flattens words, sentences and chapters', () => {
  assert.equal(tl.words.length, 5);
  assert.equal(tl.sentences.length, 3);
  assert.deepEqual(tl.chapters.map((c) => [c.id, c.firstSentence, c.lastSentence]), [['one', 0, 1], ['two', 2, 2]]);
  assert.deepEqual([...tl.wordSentence], [0, 0, 1, 1, 2]);
  assert.equal(tl.sentences[1].firstWord, 2);
  assert.equal(tl.sentences[1].chapter, 0);
});

test('wordIndexAt is the last word that has started', () => {
  assert.equal(wordIndexAt(tl, 0), -1, 'before the first word');
  assert.equal(wordIndexAt(tl, 0.5), 0, 'exactly at a start');
  assert.equal(wordIndexAt(tl, 0.99), 0);
  assert.equal(wordIndexAt(tl, 1.0), 1);
  assert.equal(wordIndexAt(tl, 1.6), 1, 'in a silence: the word just spoken');
  assert.equal(wordIndexAt(tl, 99), 4, 'after the end');
});

test('activeWordAt is active only while inside the word (plus a small tail)', () => {
  assert.equal(activeWordAt(tl, 0.2), -1);
  assert.equal(activeWordAt(tl, 0.75), 0);
  assert.equal(activeWordAt(tl, 1.5 + ACTIVE_TAIL - 0.001), 1, 'still active through the tail');
  assert.equal(activeWordAt(tl, 1.5 + ACTIVE_TAIL + 0.001), -1, 'gone in the silence between sentences');
  assert.equal(activeWordAt(tl, 2.1), 2);
});

test('sentence and chapter hold through a silence and move on only when the next word begins', () => {
  assert.equal(sentenceIndexAt(tl, 1.65), 0);
  assert.equal(sentenceIndexAt(tl, 1.8), 1);
  assert.equal(chapterIndexAt(tl, 3.5), 0, 'the gap between chapters stays in the earlier chapter');
  assert.equal(chapterIndexAt(tl, 4.0), 1);
  assert.equal(chapterIndexAt(tl, 0), -1);
});

test('seek times: chapters lead in by 0.05 s (never below 0); words seek to their start', () => {
  assert.equal(chapterSeekTime(tl, 1), 3.95);
  const early = buildTimeline({ ...tiny, chapters: [{ ...tiny.chapters[0], start: 0.02 }] });
  assert.equal(chapterSeekTime(early, 0), 0);
  assert.equal(wordSeekTime(tl, 3), 2.4);
});

test('chapter lookup by id and anchor', () => {
  assert.equal(chapterIndexById(tl, 'two'), 1);
  assert.equal(chapterIndexById(tl, 'nope'), -1);
  assert.equal(chapterIndexByAnchor(tl, 'sec'), 1);
});

test('formatTime rounds to the nearest second and survives NaN/Infinity/negatives', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(72.4), '1:12');
  assert.equal(formatTime(72.6), '1:13');
  assert.equal(formatTime(247.368), '4:07');
  assert.equal(formatTime(NaN), '0:00');
  assert.equal(formatTime(Infinity), '0:00');
  assert.equal(formatTime(-5), '0:00');
});

test('progressAt uses the timeline duration and clamps', () => {
  assert.equal(progressAt(tl, 5), 0.5);
  assert.equal(progressAt(tl, -1), 0);
  assert.equal(progressAt(tl, 50), 1);
  assert.equal(progressAt({ ...tl, duration: 0 }, 5), 0);
});

test('the disclosure names the engine from one mapping', () => {
  assert.equal(engineLabel('kokoro'), 'Kokoro, an open-source voice model');
  assert.equal(engineLabel('elevenlabs'), 'ElevenLabs');
  assert.equal(engineLabel('someone-else'), 'someone-else');
  assert.equal(disclosure('elevenlabs'), 'AI-generated voice (ElevenLabs), reading a shortened version of this page.');
});

// ---- against the real narration ----------------------------------------------------------------
const real = JSON.parse(fs.readFileSync(new URL('../../public/case-studies/placement-hub/narration/narration.json', import.meta.url), 'utf8'));
const rtl = buildTimeline(real);

test('real data: 590 words in 8 chapters', () => {
  assert.equal(rtl.words.length, 590);
  assert.equal(rtl.chapters.length, 8);
});

test('real data: seeking to the midpoint of every word makes exactly that word active, in its own sentence and chapter', () => {
  rtl.words.forEach((word, i) => {
    const mid = (word.s + word.e) / 2;
    assert.equal(activeWordAt(rtl, mid), i, `word ${i} "${word.t}"`);
    const s = sentenceIndexAt(rtl, mid);
    assert.equal(s, rtl.wordSentence[i]);
    assert.ok(i >= rtl.sentences[s].firstWord && i <= rtl.sentences[s].lastWord);
    assert.equal(chapterIndexAt(rtl, mid), rtl.sentences[s].chapter);
  });
});

test('real data: binary search agrees with a linear scan at 5,000 random times', () => {
  const linear = (t) => {
    let found = -1;
    for (let i = 0; i < rtl.words.length; i++) if (rtl.words[i].s <= t) found = i;
    return found;
  };
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let n = 0; n < 5000; n++) {
    const t = rand() * (real.duration + 2) - 1;
    assert.equal(wordIndexAt(rtl, t), linear(t), `t=${t}`);
  }
});

test('real data: every chapter chip seeks to a point that is in that chapter\'s lead-in or first word', () => {
  rtl.chapters.forEach((c, i) => {
    const t = chapterSeekTime(rtl, i);
    assert.ok(t <= c.start && c.start - t <= 0.0501);
    assert.ok(chapterIndexAt(rtl, c.start) === i);
  });
});

test('approxDuration is a loose whole-minute label', () => {
  assert.equal(approxDuration(247.368), '~4 min');
  assert.equal(approxDuration(150), '~3 min');
  assert.equal(approxDuration(20), '~1 min');
  assert.equal(approxDuration(0), '~1 min');
});

test('sectionNumbers matches the page: the intro has none, sections count from 1', () => {
  assert.deepEqual(sectionNumbers(tl.chapters), [null, 1]);
  assert.deepEqual(sectionNumbers(rtl.chapters), [null, 1, 2, 3, 4, 5, 6, 7]);
});

test('the audio URL sits next to narration.json and carries the version when there is one', () => {
  const base = 'https://example.com/case-study/';
  assert.equal(resolveAudioUrl('/a/b/narration.json', 'narration.mp3', undefined, base), 'https://example.com/a/b/narration.mp3');
  assert.equal(resolveAudioUrl('/a/b/narration.json?v=abc', 'narration.mp3', 'abc', base), 'https://example.com/a/b/narration.mp3?v=abc');
  assert.equal(resolveAudioUrl('/a/b/narration.json', 'narration.mp3', '', base), 'https://example.com/a/b/narration.mp3');
});
