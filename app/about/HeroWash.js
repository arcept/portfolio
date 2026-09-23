'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { ABT_ATTR } from './theme';

// The colour behind the opening: green, purple and blue carried by layered noise that keeps flowing
// on its own, the way the case studies' hero backdrop does, with an ember bloom answering the pointer
// on top of it. Drawn with straight alpha over the page background, so the same shader serves both
// themes — it only reads different colours.
//
// Colours come from the stylesheet (--abt-wash-*, plain hex) and are eased on a theme change.

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;       // 0..1, y up
uniform float uPointerActive;
uniform float uMotion;       // 0 when the visitor asked for reduced motion
uniform float uFade;         // the wash easing in on load
uniform vec3 uA;     // green — the cycle runs A, B, C and back to A
uniform vec3 uB;     // purple
uniform vec3 uC;     // blue
uniform vec3 uBloom; // the ember accent under the pointer
uniform float uStrength;

in vec2 vUv;
out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

// Simplex noise — smoother and less grid-bound than value noise, which is what lets the colour
// fields drift without looking like they are sliding on rails.
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
  m = m * m;
  m = m * m;
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

void main() {
  float ratio = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv - 0.5;
  p.x *= ratio;

  float t = uTime * 0.1 * uMotion;

  // Each field is pushed by the one before it, so the colours fold through each other instead of
  // travelling in parallel.
  float n1 = snoise(p * 0.85 + vec2(t * 0.22, -t * 0.3));
  float n2 = snoise(p * 1.15 + vec2(-t * 0.17, t * 0.26) + n1 * 0.35);
  float n3 = snoise(p * 0.65 + vec2(t * 0.12, t * 0.2) + n2 * 0.3);

  // One colour at a time. The palette turns over a slow cycle — green settles into purple, purple
  // into blue — so the opening is a single hue at any moment rather than three competing at once.
  float s = fract(uTime * 0.016 * uMotion) * 3.0;
  vec3 tone = mix(uA, uB, smoothstep(0.0, 1.0, clamp(s, 0.0, 1.0)));
  tone = mix(tone, uC, smoothstep(0.0, 1.0, clamp(s - 1.0, 0.0, 1.0)));
  tone = mix(tone, uA, smoothstep(0.0, 1.0, clamp(s - 2.0, 0.0, 1.0)));

  // The noise only shapes where the colour is dense, never what colour it is.
  float shape = max(smoothstep(-0.45, 0.45, n1), smoothstep(0.05, 0.75, n2) * 0.85);
  shape = max(shape, smoothstep(0.0, 0.7, n3) * 0.7);

  vec3 col = tone;
  float alpha = shape * 0.5;

  // The pointer bloom: the one warm moment on the page, at full strength.
  vec2 ptr = vec2(uPointer.x * ratio, uPointer.y) - vec2(0.5 * ratio, 0.5);
  float bloom = exp(-length(p - ptr) * 1.6) * uPointerActive;
  // Added rather than max'd: the field is dense enough now that a max would swallow the bloom
  // wherever the colour was already strong, which is most of the canvas.
  col = mix(col, uBloom, bloom);
  alpha = clamp(alpha + bloom * 0.34, 0.0, 1.0);

  // Strongest behind the statement, gone before the reading columns.
  alpha *= smoothstep(0.04, 0.52, vUv.y) * uFade * uStrength;

  // Dither, so the soft gradients don't band.
  alpha += (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  fragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}`;

function readColor(styles, name, fallback) {
  const hex = /^#([0-9a-f]{6})$/i.exec(styles.getPropertyValue(name).trim());
  if (!hex) return fallback;
  const n = parseInt(hex[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function HeroWash() {
  const host = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = host.current;
    if (!node) return undefined;

    let renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.75) });
    } catch {
      return undefined; // no WebGL: the opening simply has no colour behind it
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
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uPointer: { value: [0.62, 0.66] },
        uPointerActive: { value: 0 },
        uMotion: { value: reduced ? 0 : 1 },
        uFade: { value: 0 },
        uA: { value: [0.23, 0.44, 0.88] },
        uB: { value: [0.16, 0.66, 0.47] },
        uC: { value: [0.49, 0.36, 0.94] },
        uBloom: { value: [1, 0.42, 0.24] },
        uStrength: { value: 1 },
      },
    });
    // Blending onto a transparent canvas leaves colour premultiplied by alpha, so the canvas is
    // declared premultiplied to match. Alpha also needs its own factors: ogl's `transparent` blends
    // it with the colour factors, which squares it. Without both, what reaches the screen is darker
    // and weaker than the shader wrote — invisible on a dark page, grey mud on a light one.
    program.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;

    const target = { a: [...u.uA.value], b: [...u.uB.value], c: [...u.uC.value], bloom: [...u.uBloom.value], strength: 1 };
    const readTokens = () => {
      const styles = getComputedStyle(node);
      target.a = readColor(styles, '--abt-wash-a', target.a);
      target.b = readColor(styles, '--abt-wash-b', target.b);
      target.c = readColor(styles, '--abt-wash-c', target.c);
      target.bloom = readColor(styles, '--abt-wash-bloom', target.bloom);
      const strength = parseFloat(styles.getPropertyValue('--abt-wash-strength'));
      target.strength = Number.isFinite(strength) ? strength : 1;
    };
    readTokens();
    u.uA.value = [...target.a];
    u.uB.value = [...target.b];
    u.uC.value = [...target.c];
    u.uBloom.value = [...target.bloom];
    u.uStrength.value = target.strength;

    const themeWatcher = new MutationObserver(readTokens);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: [ABT_ATTR] });

    const resize = () => {
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      u.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    const sizeWatcher = new ResizeObserver(resize);
    sizeWatcher.observe(node);

    const pointerTarget = [0.62, 0.66];
    let pointerOn = 0;
    const onPointer = (event) => {
      if (reduced) return;
      const box = node.getBoundingClientRect();
      pointerTarget[0] = (event.clientX - box.left) / box.width;
      pointerTarget[1] = 1 - (event.clientY - box.top) / box.height;
      pointerOn = 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let onScreen = true;
    const viewWatcher = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    viewWatcher.observe(node);

    let frame = 0;
    let last = performance.now();
    const step = (a, b, k) => a + (b - a) * k;
    const render = (now) => {
      frame = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!onScreen || document.hidden) return;

      u.uTime.value = now / 1000;
      u.uFade.value = step(u.uFade.value, 1, dt * 1.1);
      u.uPointerActive.value = step(u.uPointerActive.value, pointerOn, dt * 2.6);
      u.uPointer.value[0] = step(u.uPointer.value[0], pointerTarget[0], dt * 2.8);
      u.uPointer.value[1] = step(u.uPointer.value[1], pointerTarget[1], dt * 2.8);
      for (let i = 0; i < 3; i += 1) {
        u.uA.value[i] = step(u.uA.value[i], target.a[i], dt * 3.5);
        u.uB.value[i] = step(u.uB.value[i], target.b[i], dt * 3.5);
        u.uC.value[i] = step(u.uC.value[i], target.c[i], dt * 3.5);
        u.uBloom.value[i] = step(u.uBloom.value[i], target.bloom[i], dt * 3.5);
      }
      u.uStrength.value = step(u.uStrength.value, target.strength, dt * 3.5);
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      themeWatcher.disconnect();
      sizeWatcher.disconnect();
      viewWatcher.disconnect();
      window.removeEventListener('pointermove', onPointer);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
    };
  }, [reduced]);

  return <div className="abt-wash" ref={host} aria-hidden="true" />;
}
