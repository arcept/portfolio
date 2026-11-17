import { COMMENTS, LABELS } from './copy';

// The homepage's named cursor: the visitor's own pointer, drawn the way a shared design file shows each
// person in it, a coloured arrow tagged "You" (the system pointer is hidden on the page; it stays an
// arrow everywhere, links included). Its colour eases from section to section as you scroll: the
// hero's pink, the Statement's violet, a neutral ink through Selected Work, About's pink. Over a Selected
// Work tile it takes the tile's colour and the tile's own pill ("Read the case study", Tip.js) stands in
// for its tag. Hovering the portrait, the Statement or About brings up Manik's comment on it, and the
// interaction it would carry in a prototype (copy.js).
// Desktop with a mouse only: NamedCursor.js starts it, and it's switched off in config.js.

const SECTION = { hero: '#ff2e93', statement: '#a57bff', about: '#ff7ac6' };
// Selected Work's own colour, between its tiles: a neutral ink (light on the dark page, dark on the light).
const NEUTRAL = { dark: '#e9ebf8', light: '#17142a' };

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpRgb = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// White text on the colour, or ink when the colour is too light for white to read.
const inkOn = ([r, g, b]) => {
  const l = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2] > 0.36 ? '#0b0d17' : '#fff';
};

const stopColour = (s, dark) => {
  if (!s) return SECTION.hero;
  if (s.kind === 'work') return dark ? NEUTRAL.dark : NEUTRAL.light;
  return SECTION[s.kind] || SECTION.hero;
};

const arrow = (fill) =>
  `<svg class="fx-me__arrow" width="22" height="26" viewBox="0 0 22 26" aria-hidden="true"><path d="M2 2 L2 21 L7 16.5 L10.5 24 L14 22.5 L10.5 15.2 L17.5 15.2 Z" fill="${fill}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

// The things that answer the hover, and the parts each comment hangs from.
function targets() {
  const out = [];
  const box = (el) => {
    const r = el?.getBoundingClientRect();
    return r && r.width && r.height ? r : null;
  };
  const hero = document.querySelector('.hx-i-portrait-scale');
  if (box(hero)) out.push({ key: 'hero', kind: 'hero', el: hero });
  const st = document.querySelector('.hx-st__inner');
  if (box(st)) out.push({ key: 'statement', kind: 'statement', el: st, art: document.querySelector('.hx-st__art') });
  const me = document.querySelector('.hx-me__inner') || document.getElementById('about');
  if (box(me)) out.push({ key: 'about', kind: 'about', el: me, title: document.querySelector('.hx-me__title') });
  return out;
}

// Where a comment's pointed corner sits for a target (screen px), kept clear of what it's about.
function anchor(t, vw) {
  const r = t.el.getBoundingClientRect();
  if (t.kind === 'hero') return { x: r.right + 18, y: r.top + r.height * 0.36 };
  if (t.kind === 'statement') {
    const a = t.art?.getBoundingClientRect();
    return a && a.width ? { x: a.left + 16, y: a.top - 4 } : { x: r.left, y: r.top - 4 };
  }
  const a = t.title?.getBoundingClientRect();
  return a && a.width ? { x: Math.min(a.right + 14, vw - 40), y: a.top + a.height / 2 } : { x: r.left + 40, y: r.top + 40 };
}

export function createCursor({ overlay }) {
  const root = document.documentElement;
  root.classList.add('fx-no-pointer');

  // The cursor lives on its own top layer, over the nav and everything else (it's the pointer, it
  // can't go under anything).
  const layer = document.createElement('div');
  layer.className = 'fx-cursor-layer';
  const me = document.createElement('div');
  me.className = 'fx-me';
  me.innerHTML = arrow(SECTION.hero);
  const tag = document.createElement('span');
  tag.className = 'fx-tag fx-me__tag';
  tag.textContent = 'You'; // the visitor's own cursor, as a shared design file labels yours
  me.appendChild(tag);
  layer.append(me);
  document.body.appendChild(layer);
  const path = me.querySelector('path');

  // ---- The pointer.
  const place = (x, y) => {
    me.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
  };
  const ptr = { x: 0, y: 0, seen: false, over: false, tip: null };
  const move = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    ptr.over = true;
    ptr.seen = true;
    // A Selected Work tile: its colour (its pill, Tip.js, is drawn by the tile itself).
    ptr.tip = e.target?.closest?.('#work [data-tip]')?.dataset.tipColor || null;
    // Drawn at once, not on the next frame, so it never lags the mouse.
    place(ptr.x, ptr.y);
  };
  const out = (e) => {
    if (!e.relatedTarget) ptr.over = false;
  };
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerout', out);

  // ---- Comments and labels, made when first hovered.
  const parts = new Map();
  const partsFor = (t) => {
    if (parts.has(t.key)) return parts.get(t.key);
    const pin = document.createElement('div');
    pin.className = 'fx-pin';
    pin.innerHTML = '<span class="fx-pin__face">M</span><span class="fx-pin__text"></span>';
    pin.lastChild.textContent = COMMENTS[t.key] || '';
    const label = document.createElement('div');
    label.className = 'fx-label';
    label.textContent = LABELS[t.kind] || '';
    overlay.append(pin, label);
    const p = { pin, label };
    parts.set(t.key, p);
    return p;
  };

  let colour = hex(SECTION.hero);
  let shownColour = '';
  let lastHover = null;

  return {
    frame(s) {
      // Colour: the tile under the pointer's, or else eased between the sections either side of the
      // middle of the screen; either way it glides there rather than jumping.
      const dark = s.dark > 0.5;
      let want = colour;
      if (ptr.tip && ptr.over) want = hex(ptr.tip);
      else if (s.trav) {
        const a = hex(stopColour(s.stops[s.trav.seg], dark));
        const b = hex(stopColour(s.stops[Math.min(s.stops.length - 1, s.trav.seg + 1)], dark));
        want = lerpRgb(a, b, s.trav.hold);
      }
      const k = s.still ? 1 : 1 - Math.exp(-s.dt * 14);
      colour = colour.map((v, i) => v + (want[i] - v) * k);
      const rgb = colour.map(Math.round);
      const css = `rgb(${rgb.join(',')})`;
      if (css !== shownColour) {
        path.setAttribute('fill', css);
        tag.style.background = css;
        tag.style.color = inkOn(rgb);
        shownColour = css;
      }

      me.classList.toggle('is-on', ptr.seen && ptr.over);
      me.classList.toggle('is-tile', !!ptr.tip && ptr.over);

      // Hover: what's under the pointer, and its comment and label (hidden a moment after leaving).
      const list = targets();
      let hover = null;
      if (ptr.seen && ptr.over) {
        hover = list.find((t) => {
          const r = t.el.getBoundingClientRect();
          return ptr.x >= r.left && ptr.x <= r.right && ptr.y >= r.top && ptr.y <= r.bottom;
        });
      }
      if (hover) lastHover = { key: hover.key, at: s.time };
      const showKey = hover ? hover.key : lastHover && s.time - lastHover.at < 0.25 ? lastHover.key : null;
      list.forEach((t) => {
        const on = t.key === showKey;
        const p = parts.get(t.key) || (on ? partsFor(t) : null);
        if (!p) return;
        p.pin.classList.toggle('is-on', on);
        p.label.classList.toggle('is-on', on && !!p.label.textContent); // the hero has none
        if (!on) return;
        const vw = s.size.w;
        const a = anchor(t, vw);
        const pw = p.pin.offsetWidth;
        const ph = p.pin.offsetHeight;
        // The comment opens up and away from its point, flipped to the left near the right edge.
        const flip = a.x + 10 + pw > vw - 16;
        const px = flip ? a.x - pw - 8 : a.x + 10;
        const py = Math.max(8, a.y - ph - 6);
        p.pin.style.transform = `translate(${px}px, ${py}px)`;
        p.pin.classList.toggle('is-flip', flip);
        // Its label sits just above it.
        const lx = flip ? px + pw - p.label.offsetWidth : px;
        const ly = py - p.label.offsetHeight - 6;
        p.label.style.transform = `translate(${lx}px, ${ly}px)`;
      });
    },
    destroy() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', out);
      root.classList.remove('fx-no-pointer');
      layer.remove();
      parts.forEach((p) => {
        p.pin.remove();
        p.label.remove();
      });
    },
  };
}
