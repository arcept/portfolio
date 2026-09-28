'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';

// The engine under the hero's background: one full-size WebGL surface drawn by a fragment shader.
// It hands the shader these inputs:
//   uRes       the surface's size in pixels
//   uTime      seconds since it started (held still with reduced motion)
//   uPointer   where the pointer is, 0..1 across the surface (y up), eased
//   uPointerOn 1 while the pointer is moving over the page, easing to 0 a while after it stops
//   uPointerVel how fast and which way it is moving
//   uScroll    0..1 as the hero scrolls away (GSAP, in Scene): the background quietens as it fades
//   uDark      0 in the light theme, 1 in the dark, eased when the theme switches
//   uIntro     0..1 over the first seconds after `ready` (the loading curtain has lifted): its entrance
//   uDpr       device pixels per CSS pixel on the surface, for sizes given in CSS pixels
// `extra` adds uniforms of its own, and `tick(uniforms, now, dt, pointer)` updates them every frame
// (`pointer` is the raw pointer: x, y, when it last moved and its type). It is drawn only while `watch` (an element; by default the surface itself)
// is on screen and the tab is showing, and at half the frame rate when nothing needs it smoother:
// always on a phone, and elsewhere while the pointer is still and the page isn't scrolling (its drift
// is slow enough not to show the difference).

const VERTEX = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

export const HEAD = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform vec2 uPointerVel;
uniform float uScroll;
uniform float uDark;
uniform float uIntro;
uniform float uDpr;
in vec2 vUv;
out vec4 fragColor;

vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
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
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * snoise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return s;
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
// A fine film grain, moving each frame.
float grain() { return hash12(gl_FragCoord.xy + fract(uTime * 7.0) * 311.0) - 0.5; }
// Aspect-correct coordinates, centred: x across the width, y from -0.5 to 0.5.
vec2 aspect(vec2 uv) { return (uv - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0); }
`;

const STILL_TIME = 14; // the moment a still frame is taken from, with reduced motion

export default function Backdrop({ shader, theme, scroll, dpr = { desktop: 1.5, phone: 1 }, intro = 2.4, extra, tick, watch, ready = true }) {
  const host = useRef(null);
  const live = useRef({ theme, ready });
  live.current = { theme, ready };
  const still = useReducedMotion();

  useEffect(() => {
    const node = host.current;
    const phone = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
    let renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, dpr: Math.min(window.devicePixelRatio || 1, phone ? dpr.phone : dpr.desktop), antialias: false });
    } catch {
      return undefined;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    node.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: HEAD + shader,
      depthTest: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uPointer: { value: [0.5, 0.5] },
        uPointerOn: { value: 0 },
        uPointerVel: { value: [0, 0] },
        uScroll: { value: 0 },
        uDark: { value: live.current.theme === 'dark' ? 1 : 0 },
        uIntro: { value: still ? 1 : 0 },
        uDpr: { value: 1 },
        ...(extra?.() || {}),
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;

    // Sized to its box; the surface is only rebuilt when the size really changes (a phone's toolbars
    // fire resizes mid-scroll).
    let size = '';
    let dirty = true;
    const resize = () => {
      const box = node.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const next = `${Math.round(box.width)}x${Math.round(box.height)}`;
      if (next === size) return;
      size = next;
      renderer.setSize(box.width, box.height);
      u.uRes.value = [gl.canvas.width, gl.canvas.height];
      u.uDpr.value = gl.canvas.height / box.height;
      dirty = true;
    };
    resize();
    const sizer = new ResizeObserver(resize);
    sizer.observe(node);

    // The pointer, over the whole page (the surface sits under everything, so it never gets it
    // directly). A touch drag counts too.
    const target = { x: 0.5, y: 0.5, at: -1e9, type: 'mouse' };
    const move = (e) => {
      const box = node.getBoundingClientRect();
      target.x = (e.clientX - box.left) / box.width;
      target.y = 1 - (e.clientY - box.top) / box.height;
      target.at = performance.now();
      target.type = e.pointerType;
    };
    if (!still) window.addEventListener('pointermove', move, { passive: true });

    // Not drawn while it is out of sight.
    let seen = true;
    const sight = new IntersectionObserver(([entry]) => (seen = entry.isIntersecting));
    sight.observe(watch?.current || node);

    let born = performance.now();
    let last = born;
    let frame = 0;
    const px = { x: 0.5, y: 0.5 };
    let count = 0;
    const render = (now) => {
      frame = requestAnimationFrame(render);
      if (document.hidden || !seen) {
        last = now;
        return;
      }
      const dark = live.current.theme === 'dark' ? 1 : 0;
      const scrolled = scroll?.current?.value ?? 0;
      // Half the frame rate when nothing calls for more (every other frame skipped).
      const idle = phone || (now - target.at > 1000 && scrolled === u.uScroll.value && u.uIntro.value >= 1);
      count += 1;
      if (!still && idle && count % 2) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (still) {
        // One frame, redrawn only when something it shows has changed.
        if (!dirty && u.uDark.value === dark && u.uScroll.value === scrolled) return;
        u.uDark.value = dark;
        u.uScroll.value = scrolled;
        u.uTime.value = STILL_TIME;
        u.uIntro.value = 1;
        tick?.(u, now, dt, null);
        renderer.render({ scene: mesh });
        dirty = false;
        return;
      }

      const k = Math.min(1, dt * 6);
      const vx = (target.x - px.x) * k;
      const vy = (target.y - px.y) * k;
      px.x += vx;
      px.y += vy;
      u.uPointer.value = [px.x, px.y];
      u.uPointerVel.value = [vx / Math.max(dt, 1e-3), vy / Math.max(dt, 1e-3)];
      const active = now - target.at < 2200 ? 1 : 0;
      u.uPointerOn.value += (active - u.uPointerOn.value) * Math.min(1, dt * (active ? 4 : 0.8));
      u.uDark.value += (dark - u.uDark.value) * Math.min(1, dt * 3);
      u.uScroll.value = scrolled;
      // Its entrance waits for the page's loading curtain to lift (`ready`).
      if (!live.current.ready) born = now;
      const f = Math.min(1, (now - born) / 1000 / intro);
      u.uIntro.value = 1 - (1 - f) ** 3;
      u.uTime.value = (now - born) / 1000;
      tick?.(u, now, dt, target);
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      sizer.disconnect();
      sight.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
    };
    // The shader is fixed; the theme and `ready` are read live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shader, still]);

  return <div className="hx-i-backdrop" ref={host} aria-hidden="true" />;
}
