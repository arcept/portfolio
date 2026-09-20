// The narration controller: owns the <audio> element, the animation-frame loop, playback rate, seeking,
// remembered position and lock-screen controls. Framework-free — React talks to it through NarrationProvider.
//
// TWO CHANNELS, so React never re-renders per frame:
//   • discrete state — subscribe() / getSnapshot(): changes a few times a minute (play/pause, the current
//     sentence or chapter, speed, error). Safe to feed to useSyncExternalStore.
//   • frames — subscribeFrame() / getFrame(): called every animation frame while playing, and once on every
//     seek or pause. It carries the time and the active word; the UI writes it straight to the DOM (classes,
//     one CSS variable) and must not set React state from it. The frame object is reused: read it, don't keep it.
//
// One audio element per page, created here, never autoplayed: audio only starts from play().
// Everything the browser provides (audio, requestAnimationFrame, storage, media session) can be injected,
// which is how the tests run this in Node.

import {
  activeWordAt,
  buildTimeline,
  chapterSeekTime,
  clamp,
  progressAt,
  wordIndexAt,
  wordSeekTime,
} from './timeline.mjs';

export const RATES = [1, 1.25, 1.5];
export const SKIP_SECONDS = 10;
// Stop just short of the very end so a seek there doesn't leave the audio in an ambiguous "ended" state.
const END_MARGIN = 0.05;

/**
 * @typedef {{ kind: 'blocked' | 'load', message: string }} NarrationError
 * @typedef {{ duration: number, started: boolean, playing: boolean, ended: boolean, rate: number,
 *             error: NarrationError | null, activeSentence: number, activeChapter: number }} NarrationState
 * @typedef {{ t: number, word: number, spoken: number, sentence: number, chapter: number, progress: number }} NarrationFrame
 *   `word` is the active word (-1 in a silence); `spoken` is the last word that has started (so words 0..spoken have been said).
 */

export class NarrationController {
  /**
   * @param {import('./timeline.mjs').Narration} narration
   * @param {{ audioUrl: string,
   *           createAudio?: () => HTMLAudioElement,
   *           raf?: (cb: FrameRequestCallback) => number, caf?: (id: number) => void,
   *           storage?: Pick<Storage, 'getItem' | 'setItem'> | null, storageKey?: string,
   *           mediaSession?: MediaSession | null, MediaMetadata?: typeof MediaMetadata }} options
   */
  constructor(narration, options) {
    const g = globalThis;
    this.tl = buildTimeline(narration);
    this.audioUrl = options.audioUrl;
    this._raf = options.raf ?? ((cb) => g.requestAnimationFrame(cb));
    this._caf = options.caf ?? ((id) => g.cancelAnimationFrame(id));
    this._storage = options.storage === undefined ? safeSessionStorage() : options.storage;
    this._storageKey = options.storageKey ?? 'narration';
    this._mediaSession = options.mediaSession === undefined ? (g.navigator?.mediaSession ?? null) : options.mediaSession;
    this._MediaMetadata = options.MediaMetadata ?? g.MediaMetadata;

    this.audio = (options.createAudio ?? (() => new g.Audio()))();
    this.audio.preload = 'none';
    this._srcSet = false;
    this._t = 0; // the time to use until the audio is loaded (a restored position)
    this._loopId = 0;
    this._destroyed = false;

    /** @type {NarrationState} */
    this._state = { duration: this.tl.duration, started: false, playing: false, ended: false, rate: 1, error: null, activeSentence: -1, activeChapter: -1 };
    /** @type {NarrationFrame} */
    this._frame = { t: 0, word: -1, spoken: -1, sentence: -1, chapter: -1, progress: 0 };
    this._stateListeners = new Set();
    this._frameListeners = new Set();

    this._tick = () => {
      this._emit();
      this._loopId = this.audio.paused ? 0 : this._raf(this._tick);
    };
    this._on = {
      play: () => {
        this._set({ started: true, playing: true, ended: false, error: null });
        this._startLoop();
        this._syncMediaSession();
      },
      pause: () => {
        this._stopLoop();
        this._set({ playing: false });
        this._emit();
        this._save();
        this._syncMediaSession();
      },
      ended: () => {
        this._stopLoop();
        this._set({ playing: false, ended: true });
        this._emit();
        this._save();
        this._syncMediaSession();
      },
      seeked: () => this._emit(),
      timeupdate: () => {
        if (this.audio.paused) this._emit();
      },
      error: () => {
        this._stopLoop();
        this._set({ playing: false, error: { kind: 'load', message: 'The audio could not be loaded. The transcript still reads in full.' } });
      },
    };
    for (const [name, handler] of Object.entries(this._on)) this.audio.addEventListener(name, handler);

    this._restore();
    this._bindMediaSession();
    this._emit();
  }

  // ---------------------------------------------------------------- state

  /** Discrete state. The same object until something changes, so it works with useSyncExternalStore. */
  getSnapshot = () => this._state;

  /** @param {() => void} listener @returns {() => void} unsubscribe */
  subscribe = (listener) => {
    this._stateListeners.add(listener);
    return () => this._stateListeners.delete(listener);
  };

  /** The latest frame (reused object). */
  getFrame = () => this._frame;

  /** @param {(frame: NarrationFrame) => void} listener @returns {() => void} unsubscribe */
  subscribeFrame = (listener) => {
    this._frameListeners.add(listener);
    return () => this._frameListeners.delete(listener);
  };

  /** Current playback time in seconds. */
  getTime() {
    return this._srcSet ? this.audio.currentTime : this._t;
  }

  // -------------------------------------------------------------- commands

  /** Start or resume. Must be called from a user gesture; a refusal is reported as `error.kind === 'blocked'`. */
  async play() {
    this._load();
    if (this._state.ended || this.getTime() >= this.tl.duration - END_MARGIN) this._setTime(0);
    if (this._state.error?.kind === 'blocked') this._set({ error: null });
    try {
      await this.audio.play();
    } catch (err) {
      if (err && err.name === 'AbortError') return; // interrupted by a pause or a new load: not a failure
      this._set({
        playing: false,
        error: err && err.name === 'NotAllowedError'
          ? { kind: 'blocked', message: 'Playback was blocked. Tap play again.' }
          : { kind: 'load', message: 'The audio could not be played. The transcript still reads in full.' },
      });
    }
  }

  pause() {
    this.audio.pause();
  }

  toggle() {
    return this.audio.paused ? this.play() : this.pause();
  }

  /** Jump to `t` seconds; with `{ play: true }` also start playing (a click on a word or chapter). */
  seek(t, { play = false } = {}) {
    this._load();
    this._setTime(clamp(t, 0, Math.max(0, this.tl.duration - END_MARGIN)));
    if (this._state.ended) this._set({ ended: false });
    this._emit();
    this._save();
    if (play && this.audio.paused) return this.play();
    return undefined;
  }

  skip(seconds) {
    return this.seek(this.getTime() + seconds);
  }

  seekToChapter(index, { play = true } = {}) {
    return this.seek(chapterSeekTime(this.tl, index), { play });
  }

  seekToWord(index, { play = true } = {}) {
    return this.seek(wordSeekTime(this.tl, index), { play });
  }

  setRate(rate) {
    this.audio.playbackRate = rate;
    this._set({ rate });
    this._save();
  }

  cycleRate() {
    this.setRate(RATES[(RATES.indexOf(this._state.rate) + 1) % RATES.length]);
  }

  /** Stop everything and release the audio. The controller can't be used afterwards. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._stopLoop();
    this._save();
    for (const [name, handler] of Object.entries(this._on)) this.audio.removeEventListener(name, handler);
    this.audio.pause();
    if (this._srcSet) {
      this.audio.removeAttribute?.('src');
      this.audio.load?.();
    }
    this._clearMediaSession();
    this._stateListeners.clear();
    this._frameListeners.clear();
  }

  // -------------------------------------------------------------- internals

  _load() {
    if (this._srcSet) return;
    this._srcSet = true;
    this.audio.src = this.audioUrl;
    this.audio.playbackRate = this._state.rate;
    if (this._t > 0) this.audio.currentTime = this._t;
  }

  _setTime(t) {
    this._t = t;
    if (this._srcSet) this.audio.currentTime = t;
  }

  _startLoop() {
    this._stopLoop();
    this._loopId = this._raf(this._tick);
  }

  _stopLoop() {
    if (this._loopId) this._caf(this._loopId);
    this._loopId = 0;
  }

  /** Merge into the discrete state, and tell subscribers if anything actually changed. */
  _set(patch) {
    let changed = false;
    for (const key of Object.keys(patch)) {
      if (this._state[key] !== patch[key]) changed = true;
    }
    if (!changed) return;
    this._state = { ...this._state, ...patch };
    for (const listener of this._stateListeners) listener();
  }

  /** Work out where we are, publish the frame, and update the discrete state if the sentence or chapter moved. */
  _emit() {
    const t = this.getTime();
    const tl = this.tl;
    const i = wordIndexAt(tl, t);
    const f = this._frame;
    f.t = t;
    f.spoken = i;
    f.word = activeWordAt(tl, t);
    f.sentence = i >= 0 ? tl.wordSentence[i] : -1;
    f.chapter = f.sentence >= 0 ? tl.sentences[f.sentence].chapter : -1;
    f.progress = progressAt(tl, t);
    for (const listener of this._frameListeners) listener(f);

    const movedOn = f.sentence !== this._state.activeSentence;
    this._set({ activeSentence: f.sentence, activeChapter: f.chapter });
    if (movedOn && this._state.playing) this._save();
  }

  // Remember position and speed for this visit only (sessionStorage), so reopening picks up where you left off.
  _save() {
    if (!this._storage || this._destroyed) return;
    try {
      this._storage.setItem(this._storageKey, JSON.stringify({ t: this.getTime(), rate: this._state.rate }));
    } catch {
      /* storage blocked or full: remembering is a convenience */
    }
  }

  _restore() {
    if (!this._storage) return;
    try {
      const saved = JSON.parse(this._storage.getItem(this._storageKey) ?? 'null');
      if (!saved) return;
      if (RATES.includes(saved.rate)) this._state = { ...this._state, rate: saved.rate };
      // A finished (or nearly finished) listen starts over rather than resuming in the last second.
      if (Number.isFinite(saved.t) && saved.t > 0 && saved.t < this.tl.duration - 2) this._t = saved.t;
    } catch {
      /* unreadable: start from the beginning */
    }
  }

  _bindMediaSession() {
    const ms = this._mediaSession;
    if (!ms || !this._MediaMetadata) return;
    const handlers = {
      play: () => this.play(),
      pause: () => this.pause(),
      seekbackward: () => this.skip(-SKIP_SECONDS),
      seekforward: () => this.skip(SKIP_SECONDS),
      seekto: (details) => this.seek(details.seekTime),
    };
    try {
      ms.metadata = new this._MediaMetadata({ title: this.tl.title });
      for (const [action, handler] of Object.entries(handlers)) {
        try {
          ms.setActionHandler(action, handler);
        } catch {
          /* this browser doesn't support that action */
        }
      }
    } catch {
      /* no media session here */
    }
  }

  _syncMediaSession() {
    if (this._mediaSession) this._mediaSession.playbackState = this._state.playing ? 'playing' : 'paused';
  }

  _clearMediaSession() {
    const ms = this._mediaSession;
    if (!ms) return;
    for (const action of ['play', 'pause', 'seekbackward', 'seekforward', 'seekto']) {
      try {
        ms.setActionHandler(action, null);
      } catch {
        /* unsupported */
      }
    }
    try {
      ms.metadata = null;
    } catch {
      /* unsupported */
    }
  }
}

function safeSessionStorage() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null; // access can throw when site data is blocked
  }
}
