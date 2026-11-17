'use client';

import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './fx.css';

// The hero's dotted ground, live: the same faint 24px dot grid as the CSS dots it replaces (same
// colour, size and fade to the edges), drawn by a shader so the dots can move. They lean away from
// the pointer (a touch drag on a phone) and ripple in a wave when the page is scrolled quickly.
// It sits in the hero's backdrop layer (Workbench.js `Canvas`), so the portrait, the magpie and
// PushDeck stay on top of it. Switched off with HERO_RIPPLE in config.js (the CSS dots come back).
// Reduced motion: one still frame. If WebGL isn't there, the CSS dots stay.

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;      // CSS px
uniform float uDpr;
uniform float uTime;
uniform vec2 uPointer;  // CSS px in the hero
uniform float uPointerOn;
uniform float uWave;    // scroll speed, eased
uniform float uDark;
uniform float uOn;
out vec4 fragColor;
const float S = 24.0;
vec2 shift(vec2 c) {
  vec2 d = c - uPointer;
  float f = exp(-dot(d, d) / (120.0 * 120.0)) * 14.0 * uPointerOn;
  vec2 o = normalize(d + 1e-4) * f;
  // A wave travelling down from the top as the page scrolls.
  o.y += sin(c.x * 0.02 - c.y * 0.012 + uTime * 6.0) * uWave;
  return o;
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  // Columns centred on the hero's middle, rows from its top (as the CSS dots: center top).
  float ox = mod(uRes.x * 0.5, S) - S * 0.5;
  vec2 q = p - vec2(ox, 0.0);
  vec2 cell = floor(q / S);
  float a = 0.0;
  float heat = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = (cell + vec2(i, j) + 0.5) * S + vec2(ox, 0.0);
    vec2 o = shift(c);
    float h = clamp(length(o) / 14.0, 0.0, 1.2);
    float r = 1.0 + h * 0.7;
    float v = 1.0 - smoothstep(r - 0.5, r + 0.5, length(p - c - o));
    if (v > a) { a = v; heat = h; }
  }
  // The CSS dots' fade: an ellipse 78% x 70% at 50% 44%, solid to 30%, gone by 88%.
  vec2 e = (p / uRes - vec2(0.5, 0.44)) / vec2(0.78, 0.70);
  float mask = 1.0 - smoothstep(0.30, 0.88, length(e));
  vec3 ink = mix(vec3(0.043, 0.051, 0.09), vec3(0.933, 0.941, 0.984), uDark);
  vec3 col = mix(ink, vec3(0.165, 0.384, 0.941), clamp(heat, 0.0, 1.0) * 0.8);
  float base = mix(0.22, 0.16, uDark);
  float alpha = a * mask * (base + heat * 0.45) * uOn;
  fragColor = vec4(col * alpha, alpha);
}`;

export default function HeroRipple() {
  const host = useRef(null);

  useEffect(() => {
    const node = host.current;
    const root = document.documentElement;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) });
    } catch {
      return undefined;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    node.appendChild(gl.canvas);
    // Working: the CSS dots step aside for these (fx.css). Marked on its own element: React rewrites
    // the hero ground's classes when the curtain lifts.
    node.classList.add('is-live');
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      depthTest: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uDpr: { value: 1 },
        uTime: { value: 0 },
        uPointer: { value: [-999, -999] },
        uPointerOn: { value: 0 },
        uWave: { value: 0 },
        uDark: { value: 1 },
        uOn: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;

    const resize = () => {
      const b = node.getBoundingClientRect();
      if (!b.width || !b.height) return;
      renderer.setSize(b.width, b.height);
      u.uRes.value = [b.width, b.height];
      u.uDpr.value = gl.canvas.width / b.width;
    };
    resize();
    const sizer = new ResizeObserver(resize);
    sizer.observe(node);

    const target = { x: -999, y: -999, at: -1e9 };
    const move = (e) => {
      const b = node.getBoundingClientRect();
      target.x = e.clientX - b.left;
      target.y = e.clientY - b.top;
      target.at = performance.now();
    };
    if (!still) window.addEventListener('pointermove', move, { passive: true });

    let seen = true;
    const sight = new IntersectionObserver(([entry]) => (seen = entry.isIntersecting));
    sight.observe(node);

    const ptr = { x: -999, y: -999 };
    let lastScroll = window.scrollY;
    let wave = 0;
    let last = performance.now();
    let frame = 0;
    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const want = 1;
      u.uOn.value += (want - u.uOn.value) * Math.min(1, dt * 3);
      if (document.hidden || !seen || (u.uOn.value < 0.001 && !want)) return;
      const dark = root.getAttribute('data-abt-theme') === 'light' ? 0 : 1;
      u.uDark.value += (dark - u.uDark.value) * Math.min(1, dt * 4);
      if (still) {
        u.uOn.value = want;
        u.uTime.value = 0;
        renderer.render({ scene: mesh });
        return;
      }
      const sy = window.scrollY;
      const speed = dt > 0 ? (sy - lastScroll) / dt : 0;
      lastScroll = sy;
      wave += (Math.max(-7, Math.min(7, speed * 0.004)) - wave) * Math.min(1, dt * 5);
      if (Math.abs(ptr.x - target.x) > 300) {
        ptr.x = target.x;
        ptr.y = target.y;
      }
      ptr.x += (target.x - ptr.x) * Math.min(1, dt * 8);
      ptr.y += (target.y - ptr.y) * Math.min(1, dt * 8);
      const active = now - target.at < 1600 ? 1 : 0;
      u.uPointerOn.value += (active - u.uPointerOn.value) * Math.min(1, dt * (active ? 5 : 1));
      u.uPointer.value = [ptr.x, ptr.y];
      u.uWave.value = wave;
      u.uTime.value = now / 1000;
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      sizer.disconnect();
      sight.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
      node.classList.remove('is-live');
    };
  }, []);

  return <div ref={host} className="hxw-ripple" />;
}
