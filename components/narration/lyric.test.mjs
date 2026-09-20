import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTimeline } from './timeline.mjs';
import { createLyricSync, FOLLOW_POSITION } from './lyric.mjs';

const narration = JSON.parse(fs.readFileSync(new URL('../../public/case-studies/placement-hub/narration/narration.json', import.meta.url), 'utf8'));
const tl = buildTimeline(narration);

const el = (offsetTop = 0) => {
  const classes = new Set(); const style = new Map();
  return {
    offsetTop,
    // rect in the same coordinates as the panel's: panel spans 0..300 and is scrolled by `panel.scrollTop`
    getBoundingClientRect: function () { return { top: this.offsetTop - (this.panelRef?.scrollTop ?? 0), bottom: this.offsetTop - (this.panelRef?.scrollTop ?? 0) + 40 }; },
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)), contains: (c) => classes.has(c) },
    style: { setProperty: (k, v) => style.set(k, v), removeProperty: (k) => style.delete(k), get: (k) => style.get(k) },
  };
};

function make({ reduce = false } = {}) {
  const words = tl.words.map(() => el());
  const sentences = tl.sentences.map((s, i) => el(i * 100));
  const chapters = tl.chapters.map(() => el());
  const scrolls = [];
  const panel = { clientHeight: 300, scrollTop: 0, scrollTo: (o) => { scrolls.push(o); panel.scrollTop = o.top; }, getBoundingClientRect: () => ({ top: 0, bottom: 300 }) };
  sentences.forEach((s) => { s.panelRef = panel; });
  const sync = createLyricSync({ words, sentences, chapters, panel, timeline: tl, reduceMotion: () => reduce });
  const frame = (t) => {
    const i = (() => { let r = -1; for (let k = 0; k < tl.words.length && tl.words[k].s <= t; k++) r = k; return r; })();
    const word = i >= 0 && t < tl.words[i].e + 0.03 ? i : -1;
    const sentence = i >= 0 ? tl.wordSentence[i] : -1;
    return { t, word, spoken: i, sentence, chapter: sentence >= 0 ? tl.sentences[sentence].chapter : -1, progress: t / tl.duration };
  };
  return { words, sentences, chapters, scrolls, panel, sync, frame };
}
const midWord = (i) => (tl.words[i].s + tl.words[i].e) / 2;

test('four states: earlier sentences done, current one is-cur with its spoken words, one active word', () => {
  const m = make();
  const target = 250; // somewhere mid-page
  m.sync.update(m.frame(midWord(target)));
  const s = tl.wordSentence[target];
  assert.ok(m.sentences[s].classList.contains('is-cur'));
  assert.ok(m.sentences[s - 1].classList.contains('is-done'));
  assert.ok(!m.sentences[s + 1].classList.contains('is-done') && !m.sentences[s + 1].classList.contains('is-cur'));
  assert.ok(m.words[target].classList.contains('is-on'));
  assert.equal(m.words.filter((w) => w.classList.contains('is-on')).length, 1, 'exactly one active word');
  assert.ok(m.words[target].style.get('--f') !== undefined, 'the underline variable is set');
  assert.ok(m.words[target - 1].classList.contains('is-spoken'));
  assert.ok(!m.words[target + 1].classList.contains('is-spoken'));
  assert.equal(m.chapters.filter((c) => c.classList.contains('is-cur')).length, 1);
});

test('the underline fills 0→100 across the word', () => {
  const m = make();
  const i = 120, w = tl.words[i];
  m.sync.update(m.frame(w.s + 0.001)); const start = parseFloat(m.words[i].style.get('--f'));
  m.sync.update(m.frame((w.s + w.e) / 2)); const mid = parseFloat(m.words[i].style.get('--f'));
  m.sync.update(m.frame(w.e - 0.001)); const end = parseFloat(m.words[i].style.get('--f'));
  assert.ok(start < 5 && Math.abs(mid - 50) < 1 && end > 95, `${start} ${mid} ${end}`);
});

test('the active word clears in a silence and its variable is removed', () => {
  const m = make();
  const s = tl.sentences[8];
  m.sync.update(m.frame(midWord(s.lastWord)));
  assert.ok(m.words[s.lastWord].classList.contains('is-on'));
  m.sync.update(m.frame(tl.words[s.lastWord].e + 0.2));
  assert.ok(!m.words[s.lastWord].classList.contains('is-on'));
  assert.equal(m.words[s.lastWord].style.get('--f'), undefined);
  assert.ok(m.words[s.lastWord].classList.contains('is-spoken'), 'but it stays spoken');
});

test('a backwards seek un-marks words and un-does sentences that are no longer read', () => {
  const m = make();
  m.sync.update(m.frame(midWord(400)));
  m.sync.update(m.frame(midWord(50)));
  assert.ok(!m.words[300].classList.contains('is-spoken'));
  assert.ok(m.words[49].classList.contains('is-spoken'));
  assert.ok(!m.sentences[tl.wordSentence[400]].classList.contains('is-done'));
  assert.ok(m.sentences[tl.wordSentence[50]].classList.contains('is-cur'));
});

test('a sentence change scrolls the panel so the sentence sits about a third down', () => {
  const m = make();
  m.sync.update(m.frame(midWord(250)));
  const s = tl.wordSentence[250];
  assert.equal(m.scrolls.length, 1);
  assert.equal(m.scrolls[0].top, m.sentences[s].offsetTop - 300 * FOLLOW_POSITION);
  assert.equal(m.scrolls[0].behavior, 'smooth');
  m.sync.update(m.frame(midWord(251))); // same sentence (or next word): no extra scroll unless the sentence changed
  const sameSentence = tl.wordSentence[251] === s;
  assert.equal(m.scrolls.length, sameSentence ? 1 : 2);
});

test('reduced motion scrolls instantly', () => {
  const m = make({ reduce: true });
  m.sync.update(m.frame(midWord(250)));
  assert.equal(m.scrolls[0].behavior, 'auto');
});

test('scroll never goes above the top', () => {
  const m = make();
  m.sync.update(m.frame(midWord(1)));
  assert.equal(m.scrolls[0].top, 0);
});

test('after the reader scrolls by hand, following stays off — nothing snaps the panel back', () => {
  const m = make();
  m.sync.update(m.frame(midWord(250)));
  m.scrolls.length = 0;
  m.sync.pause();
  assert.equal(m.sync.following, false);
  for (const w of [300, 350, 400, 450]) m.sync.update(m.frame(midWord(w)));
  assert.equal(m.scrolls.length, 0, 'no scrolling however long they read elsewhere');
  assert.equal(m.sync.following, false, 'and no timer turns it back on');
});

test('resume() follows again and scrolls to the current sentence right away', () => {
  const m = make();
  m.sync.update(m.frame(midWord(250)));
  m.sync.pause();
  m.sync.update(m.frame(midWord(400)));
  m.scrolls.length = 0;
  m.sync.resume();
  assert.equal(m.sync.following, true);
  assert.equal(m.scrolls.length, 1);
  assert.equal(m.scrolls[0].top, m.sentences[tl.wordSentence[400]].offsetTop - 300 * FOLLOW_POSITION);
});

test('resumeQuiet() follows again without scrolling, and the next sentence then scrolls', () => {
  const m = make();
  m.sync.update(m.frame(midWord(250)));
  m.sync.pause();
  m.scrolls.length = 0;
  m.sync.resumeQuiet();
  assert.equal(m.scrolls.length, 0);
  m.sync.update(m.frame(midWord(400)));
  assert.equal(m.scrolls.length, 1);
});

test('position() says where the current sentence is relative to what the reader sees', () => {
  const m = make();
  assert.equal(m.sync.position(), 'none', 'before the first frame');
  m.sync.update(m.frame(midWord(250)));
  assert.equal(m.sync.position(), 'visible', 'following puts it in view');
  m.sync.pause();
  m.panel.scrollTop = 100000; // the reader scrolled far past it
  assert.equal(m.sync.position(), 'above');
  m.panel.scrollTop = 0;      // …or far back before it
  assert.equal(m.sync.position(), 'below');
});

test('seeking to every 5th word marks exactly that word active, whichever way we jump', () => {
  const m = make();
  for (let i = 0; i < tl.words.length; i += 5) {
    m.sync.update(m.frame(midWord(i)));
    assert.ok(m.words[i].classList.contains('is-on'), `word ${i}`);
    assert.equal(m.words.filter((w) => w.classList.contains('is-on')).length, 1);
    assert.equal(m.words.filter((w, k) => w.classList.contains('is-spoken') && k > i).length, 0, 'nothing beyond the active word is spoken');
  }
});
