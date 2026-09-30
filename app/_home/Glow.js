'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

// The ground under the homepage's closing section (AboutMe.js): a glow that rises from the foot of the
// section in a slow, uneven wave, its edge broken into grain, after midu.design's hero (Paper Shaders'
// grain gradient, "wave"): the horizon is cos(.5x − 4t) · sin(1.5x + 2t), fine noise is added to the
// shape before it is cut into colour, and the colours run from the edge's to the palest at the foot. It
// drifts on its own while on screen and climbs as the end of the page comes up. `pale` takes its colours
// part of the way to white (the light theme). Drawn on a canvas that fills the section, over its ground;
// without WebGL there is just the ground.
//
// The mouse leaves a trail across the section, as it does over the hero (the same path and sizes as
// backdrops/auroraContours.js): a blob moving slowly, a tapering streak on a fast sweep, draining away
// once it stops. Inside it, barely there, faint contour lines over two fainter bands of the colour, its
// edge fading out into the same grain. Only with a mouse, and not at all with reduced motion.

const MASK_SIZE = 220; // width of the blob, in CSS pixels, when moving slowly
const TRAIL_LINGER = 0.5; // seconds the trail takes to drain once the mouse stops
const STREAK = 0.35; // seconds of the path a fast sweep leaves as a tapering streak
const POINTS = 24; // how much of the path is kept
const CONTOUR_LINES = 0.26; // the strength of the contours' lines
const CONTOUR_BANDS = [0.03, 0.07]; // the strengths of their two alternating bands

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 uRes;      // the canvas, css px
uniform float uDpr;
uniform float uTime;
uniform float uLine;    // where the horizon sits, as a share of the height from the foot
uniform float uUnit;    // css px per unit of the wave
uniform float uGrain;
uniform vec3 uC0;       // the edge
uniform vec3 uC1;       // the body
uniform vec3 uC2;       // the foot, palest
uniform float uPale;    // how far the colours go towards white (on the light ground)
uniform vec3 uTrail[${POINTS}]; // the mouse's path: x, y (css px from the bottom left) and radius
uniform float uTrailCount;
uniform vec4 uTrailBox; // the box the trail can reach
out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * snoise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

// How far a point is from the mouse's path, as a chain of tapering strokes (negative inside).
float trail(vec2 p) {
  float d = 1e5;
  int n = int(uTrailCount);
  for (int i = 0; i < ${POINTS}; i++) {
    if (i >= n) break;
    vec3 a = uTrail[i];
    if (i + 1 < n) {
      vec3 b = uTrail[i + 1];
      vec2 ab = b.xy - a.xy;
      float h = clamp(dot(p - a.xy, ab) / max(dot(ab, ab), 1e-3), 0.0, 1.0);
      d = min(d, length(p - a.xy - ab * h) - mix(a.z, b.z, h));
    } else {
      d = min(d, length(p - a.xy) - a.z);
    }
  }
  return d;
}

// The glow's colour for a shape value: cut into the three colours, its edge in grain.
vec4 paint(float shape) {
  float aa = fwidth(shape);
  float s = clamp(shape - 0.5 / 3.0, 0.0, 1.0);
  float total = smoothstep(0.0, 1.0 + 2.0 * aa, clamp(s * 3.0, 0.0, 1.0));
  float mixer = s * 2.0;
  vec3 col = mix(uC0, uC1, smoothstep(0.0, 1.0, clamp(mixer, 0.0, 1.0)));
  col = mix(col, uC2, smoothstep(0.0, 1.0, clamp(mixer - 1.0, 0.0, 1.0)));
  col = mix(col, vec3(1.0), uPale);
  return vec4(col * total, total);
}

void main() {
  vec2 px = gl_FragCoord.xy / uDpr;                 // css px, from the bottom left
  float x = (px.x - uRes.x * 0.5) / uUnit;
  float y = (px.y - uRes.y * uLine) / uUnit;
  float t = 0.1 * (uTime * 0.8 + 7.0);

  // Midu's horizon, its swing at 96% of theirs.
  float wave = 0.96 * cos(0.5 * x - 4.0 * t) * sin(1.5 * x + 2.0 * t) * (0.75 + 0.25 * cos(6.0 * t));
  float shape = 1.0 - smoothstep(-1.0, 1.0, y + wave);

  // The grain: structured noise at the scale of a pixel or two, fixed to the page, pushed into the
  // shape before it is cut into colour, so the edges break into speckle rather than blur.
  float n = 0.6 * snoise(px * 0.55) * snoise(px * 0.21) + 0.4 * (hash(floor(px)) - 0.5);
  shape += uGrain * n;

  // The mouse's trail: the path's distance, its edge crawling with noise, and no hard edge at all: it
  // fades out over about 100px, broken up by the same grain as the glow, so it dissolves into speckle.
  float mask = 0.0;
  if (uTrailCount > 0.5 && px.x > uTrailBox.x && px.y > uTrailBox.y && px.x < uTrailBox.z && px.y < uTrailBox.w) {
    vec2 q = px / 900.0;
    float wob = (fbm(q * 7.0 + vec2(uTime * 0.5, -uTime * 0.4)) * 0.5 + snoise(q * 15.0 - uTime * 0.8) * 0.2) * 22.0;
    mask = 1.0 - smoothstep(-75.0, 25.0, trail(px) + wob + n * 60.0);
    mask *= mask;
  }

  // Worked out for every pixel, with no branching, so the grain's edge smoothing (which compares
  // neighbouring pixels) stays clean.
  vec4 glow = paint(shape);

  // Inside the trail: faint lines over two fainter alternating bands of the colour, drifting slowly,
  // laid over the glow.
  float h = fbm(px / 560.0 + vec2(uTime * 0.015, -uTime * 0.01)) * 11.0;
  float band = mod(floor(h), 2.0);
  float line = 1.0 - min(abs(fract(h - 0.5) - 0.5) / max(fwidth(h), 1e-4), 1.0);
  vec3 tone = mix(uC1, vec3(1.0), uPale);
  vec3 ink = mix(uC0, vec3(1.0), uPale * 0.5);
  float a = mix(${CONTOUR_BANDS[0].toFixed(3)}, ${CONTOUR_BANDS[1].toFixed(3)}, band);
  float la = line * ${CONTOUR_LINES.toFixed(3)};
  vec4 inside = vec4(tone * a, a);
  inside = vec4(ink * la, la) + inside * (1.0 - la);
  inside = inside + glow * (1.0 - inside.a);
  fragColor = mix(glow, inside, mask);
}`;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export default function Glow({ colours, pale = 0, className }) {
  const host = useRef(null);
  const still = useReducedMotion();
  const palette = useRef(colours);
  palette.current = colours;
  const paleness = useRef(pale);
  paleness.current = pale;

  useEffect(() => {
    const node = host.current;
    const section = node?.parentElement;
    if (!node || !section) return undefined;

    let renderer;
    try {
      renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) });
    } catch {
      return undefined;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    node.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uDpr: { value: renderer.dpr },
        uTime: { value: 0 },
        uLine: { value: 0 },
        uUnit: { value: 360 },
        uGrain: { value: 0.09 },
        uC0: { value: [0, 0, 0] },
        uC1: { value: [0, 0, 0] },
        uC2: { value: [0, 0, 0] },
        uPale: { value: 0 },
        uTrail: { value: new Array(POINTS * 3).fill(0) },
        uTrailCount: { value: 0 },
        uTrailBox: { value: [0, 0, 0, 0] },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;

    const resize = () => {
      const { width, height } = node.getBoundingClientRect();
      renderer.setSize(width, height);
      u.uRes.value = [width, height];
      // The wave's scale follows the width, as Midu's follows the window, up to a point: wider, its
      // peaks would climb higher too.
      u.uUnit.value = Math.min(420, Math.max(220, width / 4));
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(node);
    resize();

    // The mouse over the page, in css px from the canvas's bottom left.
    const pointer = { x: 0, y: 0, at: -1e9 };
    const move = (e) => {
      if (e.pointerType !== 'mouse') return;
      const box = node.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = box.bottom - e.clientY;
      pointer.at = performance.now();
    };
    const hover = window.matchMedia('(hover: hover)').matches;
    if (!still && hover) window.addEventListener('pointermove', move, { passive: true });

    // The path it has just taken: the newest point lives longest, so a stopped mouse drains slowly;
    // older points make a streak's tapering tail.
    const pts = [];
    let lastX = null;
    let lastY = null;
    const track = (now) => {
      const t = now / 1000;
      if (now - pointer.at < 60) {
        const moved = lastX === null ? 99 : Math.hypot(pointer.x - lastX, pointer.y - lastY);
        if (moved > 1) {
          if (pts.length) pts[0].life = STREAK;
          pts.unshift({ x: pointer.x, y: pointer.y, at: t, life: TRAIL_LINGER });
          if (pts.length > POINTS) pts.pop();
          lastX = pointer.x;
          lastY = pointer.y;
        }
      }
      const out = u.uTrail.value;
      let n = 0;
      let x0 = 1e6;
      let y0 = 1e6;
      let x1 = -1e6;
      let y1 = -1e6;
      for (let i = 0; i < pts.length; i += 1) {
        const age = t - pts[i].at;
        if (age > pts[i].life) {
          pts.length = i;
          break;
        }
        const r = (MASK_SIZE / 2) * Math.sqrt(1 - age / pts[i].life);
        out[n * 3] = pts[i].x;
        out[n * 3 + 1] = pts[i].y;
        out[n * 3 + 2] = r;
        x0 = Math.min(x0, pts[i].x - r - 80);
        y0 = Math.min(y0, pts[i].y - r - 80);
        x1 = Math.max(x1, pts[i].x + r + 80);
        y1 = Math.max(y1, pts[i].y + r + 80);
        n += 1;
      }
      u.uTrailCount.value = n;
      if (n) u.uTrailBox.value = [x0, y0, x1, y1];
    };

    let frame = 0;
    let visible = false;
    const start = performance.now();
    const render = (now) => {
      frame = requestAnimationFrame(render);
      if (!visible) return;
      // How far the end of the section has come up: 0 while its foot is still 60% of its height below
      // the window, 1 once its foot reaches the window's. The horizon climbs from 80px below the foot to
      // 234px above it, whatever the section's height; with the peaks on top the glow reaches about the
      // letter's last paragraph.
      const box = section.getBoundingClientRect();
      const rise = still ? 1 : Math.min(1, Math.max(0, 1 - (box.bottom - window.innerHeight) / (box.height * 0.6)));
      u.uLine.value = (-80 + 314 * rise) / Math.max(1, box.height);
      u.uTime.value = still ? 0 : (now - start) / 1000;
      const [c0, c1, c2] = palette.current.map(hex);
      u.uC0.value = c0;
      u.uC1.value = c1;
      u.uC2.value = c2;
      u.uPale.value = paleness.current;
      if (!still) track(now);
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(render);

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    seen.observe(section);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      seen.disconnect();
      sizer.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
    };
  }, [still]);

  return <div className={className} ref={host} aria-hidden="true" />;
}
