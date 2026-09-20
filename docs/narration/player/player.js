(function () {
  var root = document.getElementById('nar');
  if (!root) return;
  var audio = root.querySelector('audio');
  var DUR = parseFloat(root.getAttribute('data-duration')) || 0;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var panel = root.querySelector('.nar-panel');
  var words = [].slice.call(root.querySelectorAll('.w'));
  var sents = [].slice.call(root.querySelectorAll('.ts'));
  var chaps = [].slice.call(root.querySelectorAll('.tc'));
  var chips = [].slice.call(root.querySelectorAll('.nar-chip'));
  var chipBox = root.querySelector('.nar-chips');
  var range = root.querySelector('.nar-range');
  var tNow = root.querySelector('.t-now');
  var tEnd = root.querySelector('.t-end');
  var sub = root.querySelector('.nar-sub');
  var followBtn = root.querySelector('.nar-follow');
  var speedBtn = root.querySelector('[data-act="speed"]');
  var expandBtn = root.querySelector('[data-act="expand"]');
  var mini = root.querySelector('.nar-mini');
  var miniBar = mini.querySelector('.bar i');
  var miniChap = mini.querySelector('.now b');
  var miniText = mini.querySelector('.now span');
  var miniTime = mini.querySelector('.t');
  var subDefault = sub.textContent;

  var S = words.map(function (w) { return +w.getAttribute('data-s'); });
  var E = words.map(function (w) { return +w.getAttribute('data-e'); });
  var wSent = words.map(function (w) { return sents.indexOf(w.parentNode); });
  var sChap = sents.map(function (s) { return +s.getAttribute('data-ci'); });
  var chapStart = chaps.map(function (c) { return +c.getAttribute('data-start'); });

  var lastI = -1, curOn = -1, curS = -1, curC = -1;
  var holdUntil = 0, dragging = false, started = false, raf = 0, miniVisible = false;

  function fmt(t) {
    t = Math.max(0, Math.round(t));
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }

  function idxAt(t) {
    var lo = 0, hi = S.length - 1, r = -1;
    while (lo <= hi) {
      var m = (lo + hi) >> 1;
      if (S[m] <= t) { r = m; lo = m + 1; } else { hi = m - 1; }
    }
    return r;
  }

  function follow(el) {
    if (performance.now() < holdUntil) return;
    var top = el.offsetTop - panel.clientHeight * 0.34;
    panel.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    followBtn.hidden = true;
  }

  function setChapter(c) {
    curC = c;
    chaps.forEach(function (el, k) { el.classList.toggle('cur', k === c); });
    chips.forEach(function (el, k) {
      if (k === c) { el.setAttribute('aria-current', 'true'); } else { el.removeAttribute('aria-current'); }
    });
    if (c >= 0 && chips[c]) {
      var chip = chips[c];
      chipBox.scrollTo({ left: chip.offsetLeft - chipBox.clientWidth / 2 + chip.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      miniChap.textContent = chip.textContent;
    }
  }

  function sync(t, force) {
    var i = idxAt(t);
    if (force || i !== lastI) {
      var k;
      if (force || lastI < 0 || Math.abs(i - lastI) > 2) {
        for (k = 0; k < words.length; k++) words[k].classList.toggle('p', k <= i);
      } else if (i > lastI) {
        for (k = lastI + 1; k <= i; k++) words[k].classList.add('p');
      } else {
        for (k = i + 1; k <= lastI; k++) words[k].classList.remove('p');
      }
      lastI = i;
    }
    var on = (i >= 0 && t < E[i] + 0.03) ? i : -1;
    if (on !== curOn) {
      if (curOn >= 0) { words[curOn].classList.remove('on'); words[curOn].style.removeProperty('--f'); }
      if (on >= 0) words[on].classList.add('on');
      curOn = on;
    }
    if (on >= 0) {
      words[on].style.setProperty('--f', (clamp((t - S[on]) / Math.max(0.05, E[on] - S[on]), 0, 1) * 100).toFixed(1));
    }
    var s = i >= 0 ? wSent[i] : -1;
    if (force || s !== curS) {
      curS = s;
      sents.forEach(function (el, k) {
        el.classList.toggle('done', k < s);
        el.classList.toggle('cur', k === s);
      });
      if (s >= 0) {
        miniText.textContent = sents[s].textContent;
        var c = sChap[s];
        if (c !== curC) setChapter(c);
        follow(sents[s]);
      } else if (curC !== -1) {
        setChapter(-1);
        miniChap.textContent = 'Narration';
        miniText.textContent = '';
      }
    }
    var frac = DUR ? clamp(t / DUR, 0, 1) : 0;
    if (!dragging) range.value = Math.round(frac * 1000);
    range.style.setProperty('--p', (frac * 100).toFixed(2) + '%');
    range.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(DUR));
    tNow.textContent = fmt(t);
    miniTime.textContent = fmt(t) + ' / ' + fmt(DUR);
    miniBar.style.width = (frac * 100).toFixed(2) + '%';
  }

  function tick() {
    sync(audio.currentTime);
    if (!audio.paused) raf = requestAnimationFrame(tick);
  }

  function seek(t, play) {
    audio.currentTime = clamp(t, 0, Math.max(0, DUR - 0.05));
    sync(audio.currentTime, true);
    if (play && audio.paused) toggle();
  }

  function toggle() {
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { sub.textContent = 'Playback was blocked. Tap play again.'; });
    } else {
      audio.pause();
    }
  }

  function updateMini() {
    mini.hidden = !(started && !miniVisible);
  }

  audio.addEventListener('play', function () {
    started = true;
    root.classList.add('is-playing');
    root.querySelectorAll('.nar-play').forEach(function (b) { b.setAttribute('aria-label', 'Pause narration'); });
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    updateMini();
  });
  function stopped() {
    root.classList.remove('is-playing');
    root.querySelectorAll('.nar-play').forEach(function (b) { b.setAttribute('aria-label', 'Play narration'); });
    cancelAnimationFrame(raf);
    sync(audio.currentTime);
  }
  audio.addEventListener('pause', stopped);
  audio.addEventListener('ended', stopped);
  audio.addEventListener('seeked', function () { sync(audio.currentTime); });
  audio.addEventListener('timeupdate', function () { if (audio.paused) sync(audio.currentTime); });
  audio.addEventListener('error', function () { sub.textContent = 'The audio could not be loaded. The transcript below still reads in full.'; });

  root.querySelectorAll('.nar-play').forEach(function (b) { b.addEventListener('click', toggle); });

  // scrubber
  range.addEventListener('pointerdown', function () { dragging = true; });
  range.addEventListener('pointerup', function () { dragging = false; });
  range.addEventListener('input', function () { seek(range.value / 1000 * DUR, false); });
  range.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      seek(audio.currentTime + (e.key === 'ArrowRight' ? 5 : -5), false);
    }
  });

  // chapters + transcript
  chips.forEach(function (chip, k) {
    chip.addEventListener('click', function () { seek(chapStart[k] - 0.05, true); holdUntil = 0; });
  });
  words.forEach(function (w, k) {
    w.addEventListener('click', function () { holdUntil = 0; seek(S[k], true); });
  });

  // buttons
  var speeds = [1, 1.25, 1.5], si = 0;
  root.querySelector('[data-act="back"]').addEventListener('click', function () { seek(audio.currentTime - 10, false); });
  root.querySelector('[data-act="fwd"]').addEventListener('click', function () { seek(audio.currentTime + 10, false); });
  speedBtn.addEventListener('click', function () {
    si = (si + 1) % speeds.length;
    audio.playbackRate = speeds[si];
    speedBtn.textContent = speeds[si] + '\u00d7';
    speedBtn.setAttribute('aria-label', 'Playback speed ' + speeds[si] + ' times');
  });
  expandBtn.addEventListener('click', function () {
    var tall = panel.classList.toggle('tall');
    expandBtn.textContent = tall ? 'Collapse transcript' : 'Expand transcript';
    expandBtn.setAttribute('aria-expanded', tall ? 'true' : 'false');
    if (curS >= 0) { holdUntil = 0; follow(sents[curS]); }
  });

  // manual scrolling pauses auto-follow until the reader asks for it back
  ['wheel', 'touchstart', 'pointerdown'].forEach(function (ev) {
    panel.addEventListener(ev, function () {
      holdUntil = performance.now() + 5000;
      if (!audio.paused) followBtn.hidden = false;
    }, { passive: true });
  });
  followBtn.addEventListener('click', function () {
    holdUntil = 0; followBtn.hidden = true;
    if (curS >= 0) follow(sents[curS]);
  });
  setInterval(function () { if (!followBtn.hidden && performance.now() > holdUntil) followBtn.hidden = true; }, 1000);

  // mini bar when the main player has scrolled away
  mini.querySelector('.now').addEventListener('click', function () {
    root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      miniVisible = entries[0].isIntersecting;
      updateMini();
    }, { threshold: 0.05 }).observe(root.querySelector('.nar-top'));
  }

  // lock-screen / headset controls
  if ('mediaSession' in navigator && window.MediaMetadata) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: root.getAttribute('data-title') || 'Narration' });
    navigator.mediaSession.setActionHandler('play', toggle);
    navigator.mediaSession.setActionHandler('pause', toggle);
    navigator.mediaSession.setActionHandler('seekbackward', function () { seek(audio.currentTime - 10, false); });
    navigator.mediaSession.setActionHandler('seekforward', function () { seek(audio.currentTime + 10, false); });
  }

  tEnd.textContent = fmt(DUR);
  sync(0, true);
  panel.scrollTop = 0;
  followBtn.hidden = true;
  sub.textContent = subDefault;
})();
