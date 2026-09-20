import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NarrationController, RATES } from './controller.mjs';

const narration = JSON.parse(fs.readFileSync(new URL('../../public/case-studies/placement-hub/narration/narration.json', import.meta.url), 'utf8'));

// ---- the browser, faked -------------------------------------------------------------------------
class FakeAudio {
  constructor() {
    this.currentTime = 0; this.paused = true; this.playbackRate = 1; this.src = ''; this.preload = '';
    this.rejectWith = null; this.listeners = {}; this.playCalls = 0;
  }
  addEventListener(n, f) { (this.listeners[n] ??= new Set()).add(f); }
  removeEventListener(n, f) { this.listeners[n]?.delete(f); }
  dispatch(n) { for (const f of [...(this.listeners[n] ?? [])]) f(); }
  play() {
    this.playCalls++;
    if (this.rejectWith) return Promise.reject(Object.assign(new Error(this.rejectWith), { name: this.rejectWith }));
    this.paused = false; this.dispatch('play'); return Promise.resolve();
  }
  pause() { if (!this.paused) { this.paused = true; this.dispatch('pause'); } }
  removeAttribute() { this.src = ''; }
  load() {}
  listenerCount() { return Object.values(this.listeners).reduce((n, s) => n + s.size, 0); }
}

// requestAnimationFrame that only runs when the test says so.
class Frames {
  constructor() { this.pending = new Map(); this.next = 1; }
  raf = (cb) => { const id = this.next++; this.pending.set(id, cb); return id; };
  caf = (id) => { this.pending.delete(id); };
  get scheduled() { return this.pending.size; }
  // Advance the audio by `seconds` of wall time (respecting playback rate), then run one frame.
  advance(audio, seconds) {
    if (!audio.paused) {
      audio.currentTime += seconds * audio.playbackRate;
      if (audio.currentTime >= narration.duration) { audio.currentTime = narration.duration; audio.paused = true; audio.dispatch('ended'); }
    }
    const due = [...this.pending]; this.pending.clear();
    for (const [, cb] of due) cb(0);
  }
}

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
}
class FakeMediaSession { constructor() { this.handlers = {}; this.metadata = null; this.playbackState = 'none'; } setActionHandler(a, h) { this.handlers[a] = h; } }
class FakeMetadata { constructor(init) { Object.assign(this, init); } }

function make(extra = {}) {
  const audio = new FakeAudio();
  const frames = new Frames();
  const storage = extra.storage === undefined ? new MemoryStorage() : extra.storage;
  const mediaSession = extra.mediaSession === undefined ? new FakeMediaSession() : extra.mediaSession;
  const c = new NarrationController(narration, { audioUrl: '/x/narration.mp3', createAudio: () => audio, raf: frames.raf, caf: frames.caf, storage, mediaSession, MediaMetadata: FakeMetadata });
  return { c, audio, frames, storage, mediaSession };
}
const tl = (c) => c.tl;

// ---- behaviour ------------------------------------------------------------------------------------
test('never autoplays, and loads nothing until asked', () => {
  const { c, audio } = make();
  assert.equal(audio.playCalls, 0);
  assert.equal(audio.src, '', 'the audio file is not requested at construction');
  assert.equal(audio.paused, true);
  assert.deepEqual([c.getSnapshot().started, c.getSnapshot().playing], [false, false]);
});

test('play() starts from a gesture: loads the file, marks started/playing, runs the frame loop', async () => {
  const { c, audio, frames } = make();
  await c.play();
  assert.equal(audio.src, '/x/narration.mp3');
  assert.deepEqual([c.getSnapshot().started, c.getSnapshot().playing], [true, true]);
  assert.equal(frames.scheduled, 1);
  c.pause();
  assert.equal(c.getSnapshot().playing, false);
  assert.equal(frames.scheduled, 0, 'the loop stops on pause');
});

test('frames carry the active word as time advances, and do not re-render discrete subscribers per frame', async () => {
  const { c, audio, frames } = make();
  await c.seek(tl(c).chapters[1].start + 0.5, {}); // just inside the second chapter's first sentence, before any per-frame checks
  await c.play();
  let discrete = 0; c.subscribe(() => discrete++);
  const seen = new Set(); let frameCalls = 0;
  c.subscribeFrame((f) => { frameCalls++; if (f.word >= 0) seen.add(f.word); });
  for (let i = 0; i < 120; i++) frames.advance(audio, 1 / 60); // two seconds at 60 fps
  assert.equal(frameCalls, 120, 'one frame callback per animation frame');
  assert.ok(seen.size >= 3, 'the highlight moved through several words');
  assert.ok(discrete <= 2, `discrete state changed ${discrete} times in 2 s — it must not be per frame`);
});

test('discrete state follows the sentence and chapter', async () => {
  const { c, audio, frames } = make();
  await c.play();
  frames.advance(audio, tl(c).chapters[1].start + 1); // a second into the second chapter
  assert.equal(c.getSnapshot().activeChapter, 1);
  assert.ok(c.getSnapshot().activeSentence >= 0);
});

test('a word click seeks to that word and plays; a chapter chip seeks 0.05 s early and plays', async () => {
  const { c, audio } = make();
  await c.seekToWord(100);
  assert.equal(audio.currentTime, tl(c).words[100].s);
  assert.equal(audio.paused, false);
  audio.pause();
  await c.seekToChapter(4);
  assert.ok(Math.abs(audio.currentTime - (tl(c).chapters[4].start - 0.05)) < 1e-9);
  assert.equal(c.getFrame().chapter >= 3, true, 'the frame reflects the seek immediately, before the browser reports it');
  assert.equal(audio.paused, false);
});

test('skip ±10 s clamps at both ends', () => {
  const { c, audio } = make();
  c.seek(5); c.skip(-10);
  assert.equal(audio.currentTime, 0);
  c.seek(narration.duration - 3); c.skip(10);
  assert.ok(audio.currentTime <= narration.duration - 0.05 + 1e-9 && audio.currentTime > narration.duration - 0.2);
});

test('speed cycles 1 → 1.25 → 1.5 → 1 and reaches the audio element', () => {
  const { c, audio } = make();
  const seen = [];
  for (let i = 0; i < 4; i++) { c.cycleRate(); seen.push(c.getSnapshot().rate); }
  assert.deepEqual(seen, [1.25, 1.5, 1, 1.25]);
  assert.equal(audio.playbackRate, 1.25);
  assert.deepEqual(RATES, [1, 1.25, 1.5]);
});

test('the end of the audio returns to a replayable state and keeps the transcript at the end', async () => {
  const { c, audio, frames } = make();
  c.seek(narration.duration - 1);
  await c.play();
  frames.advance(audio, 2);
  const s = c.getSnapshot();
  assert.deepEqual([s.playing, s.ended, s.started], [false, true, true]);
  assert.equal(c.getFrame().chapter, 7, 'still on the last chapter');
  assert.equal(frames.scheduled, 0);
  await c.play(); // replay starts over
  assert.ok(audio.currentTime < 1);
  assert.equal(c.getSnapshot().ended, false);
});

test('a blocked play() is reported as a hint, and trying again clears it', async () => {
  const { c, audio } = make();
  audio.rejectWith = 'NotAllowedError';
  await c.play();
  assert.deepEqual([c.getSnapshot().error?.kind, c.getSnapshot().playing], ['blocked', false]);
  audio.rejectWith = null;
  await c.play();
  assert.equal(c.getSnapshot().error, null);
  assert.equal(c.getSnapshot().playing, true);
});

test('an AbortError (a pause or reload interrupting play) is not an error', async () => {
  const { c, audio } = make();
  audio.rejectWith = 'AbortError';
  await c.play();
  assert.equal(c.getSnapshot().error, null);
});

test('an audio load failure is reported in one line and playback stops', async () => {
  const { c, audio } = make();
  await c.play();
  audio.dispatch('error');
  assert.equal(c.getSnapshot().error.kind, 'load');
  assert.equal(c.getSnapshot().playing, false);
  assert.match(c.getSnapshot().error.message, /transcript/i);
});

test('position and speed are remembered for the visit and restored; a finished listen starts over', async () => {
  const first = make();
  first.c.seek(90); first.c.cycleRate();
  const second = make({ storage: first.storage });
  assert.equal(second.c.getTime(), 90, 'restored without loading the audio');
  assert.equal(second.audio.src, '');
  assert.equal(second.c.getSnapshot().rate, 1.25);
  await second.c.play();
  assert.equal(second.audio.currentTime, 90, 'and applied when playback starts');
  assert.equal(second.audio.playbackRate, 1.25);

  first.c.seek(narration.duration - 0.5);
  const third = make({ storage: first.storage });
  assert.equal(third.c.getTime(), 0);
});

test('works with no storage at all', () => {
  const { c } = make({ storage: null });
  c.seek(30);
  assert.equal(c.getTime(), 30);
});

test('lock-screen controls: metadata, handlers, playback state', async () => {
  const { c, audio, mediaSession } = make();
  assert.equal(mediaSession.metadata.title, narration.title);
  assert.deepEqual(Object.keys(mediaSession.handlers).sort(), ['pause', 'play', 'seekbackward', 'seekforward', 'seekto']);
  await mediaSession.handlers.play();
  assert.equal(mediaSession.playbackState, 'playing');
  mediaSession.handlers.seekforward();
  assert.ok(audio.currentTime >= 10);
  mediaSession.handlers.seekto({ seekTime: 42 });
  assert.equal(audio.currentTime, 42);
  mediaSession.handlers.pause();
  assert.equal(mediaSession.playbackState, 'paused');
});

test('destroy stops the loop, removes every listener and clears the media session', async () => {
  const { c, audio, frames, mediaSession } = make();
  await c.play();
  c.destroy();
  assert.equal(frames.scheduled, 0);
  assert.equal(audio.listenerCount(), 0);
  assert.equal(mediaSession.handlers.play, null);
  c.destroy(); // idempotent
});

test('seeking while paused publishes the frame right away', () => {
  const { c } = make();
  const got = [];
  c.subscribeFrame((f) => got.push(f.word));
  const target = 250;
  c.seek((tl(c).words[target].s + tl(c).words[target].e) / 2);
  assert.equal(got.at(-1), target);
});

test('frames report the active word and the last word that has started', () => {
  const { c } = make();
  const w = tl(c).words[200];
  c.seek((w.s + w.e) / 2);
  assert.equal(c.getFrame().word, 200);
  assert.equal(c.getFrame().spoken, 200);
  // in the silence after a sentence: nothing is active, but the sentence's last word has been spoken
  const sentence = tl(c).sentences[10];
  c.seek(tl(c).words[sentence.lastWord].e + 0.15);
  assert.equal(c.getFrame().word, -1);
  assert.equal(c.getFrame().spoken, sentence.lastWord);
  c.seek(0);
  assert.equal(c.getFrame().spoken, -1);
});
