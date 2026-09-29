'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { ABT_ATTR } from '@/app/about/theme';

// What lies behind the selected work's cards (Work.js), which the frosted glass blurs and the solid
// card covers: faint contour lines drifting across the section, faded out behind the list's text.
//
// One canvas, fixed to the viewport, drawn only while the section is in view and only within its
// bounds, over the page's own colour. Without WebGL the section is just the page's colour.

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 uRes;     // viewport, css px
uniform float uDpr;
uniform float uTime;
uniform vec2 uSection; // the section's top and bottom, css px from the viewport's top
uniform vec3 uBase;
uniform vec3 uInk;
uniform float uLight;
uniform vec4 uQuiet;   // the list, where the lines fade out
out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

float sdBox(vec2 p, vec2 b) {
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  if (p.y < uSection.x || p.y > uSection.y) { fragColor = vec4(0.0); return; }
  vec2 bp = p - vec2(0.0, uSection.x);
  vec2 q = bp / 720.0 + vec2(uTime * 0.012, -uTime * 0.008);
  float k = fbm(q) * 10.0;
  float g = abs(fract(k - 0.5) - 0.5) / max(fwidth(k), 1e-4);
  float line = 1.0 - min(g, 1.0);
  float strength = uLight > 0.5 ? 0.051 : 0.066;
  if (uQuiet.z > 0.0) {
    float dq = sdBox(p - uQuiet.xy - uQuiet.zw * 0.5, uQuiet.zw * 0.5);
    strength *= mix(0.1, 1.0, smoothstep(-20.0, 90.0, dq));
  }
  fragColor = vec4(mix(uBase, uInk, line * strength), 1.0);
}`;

// A CSS colour (any syntax) as [r, g, b] in 0..1.
function toRGB(ctx, value, fallback) {
  ctx.fillStyle = fallback;
  ctx.fillStyle = value || fallback;
  const hex = ctx.fillStyle;
  if (hex.startsWith('#')) return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const nums = hex.match(/[\d.]+/g) || [0, 0, 0];
  return nums.slice(0, 3).map((v) => Number(v) / 255);
}

export default function Behind() {
  const host = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = host.current;
    const section = node?.closest('.hx-w');
    if (!node || !section) return undefined;

    let renderer;
    try {
      renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) });
    } catch {
      return undefined;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    node.appendChild(gl.canvas);

    const scratch = document.createElement('canvas').getContext('2d');
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uDpr: { value: renderer.dpr },
        uTime: { value: 0 },
        uSection: { value: [0, 0] },
        uBase: { value: [0, 0, 0] },
        uInk: { value: [1, 1, 1] },
        uLight: { value: 0 },
        uQuiet: { value: [0, 0, 0, 0] },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      u.uRes.value = [window.innerWidth, window.innerHeight];
    };
    resize();
    window.addEventListener('resize', resize);

    // The page's colours, read from the section's tokens (they change with the theme).
    const readColours = () => {
      const css = getComputedStyle(section);
      u.uBase.value = toRGB(scratch, css.getPropertyValue('--abt-base').trim(), '#0b0d17');
      u.uInk.value = toRGB(scratch, css.getPropertyValue('--abt-ink').trim(), '#eef0fb');
      u.uLight.value = document.documentElement.getAttribute(ABT_ATTR) === 'light' ? 1 : 0;
    };
    readColours();
    const themeWatcher = new MutationObserver(readColours);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: [ABT_ATTR] });

    let frame = 0;
    let visible = false;
    const start = performance.now();
    const render = (now) => {
      frame = requestAnimationFrame(render);
      if (!visible) return;
      const box = section.getBoundingClientRect();
      u.uSection.value = [box.top, box.bottom];
      u.uTime.value = reduced ? 0 : (now - start) / 1000;
      const list = section.querySelector('.hx-w-list');
      const q = list?.getBoundingClientRect();
      u.uQuiet.value = q ? [q.left, q.top, q.width, q.height] : [0, 0, 0, 0];
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(render);

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      node.style.visibility = visible ? 'visible' : 'hidden';
    });
    seen.observe(section);

    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      themeWatcher.disconnect();
      window.removeEventListener('resize', resize);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
    };
  }, [reduced]);

  return <div className="hx-w-behind" ref={host} aria-hidden="true" />;
}
