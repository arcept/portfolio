'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

// A framed screenshot that melts into the next along a noise front when `active` changes (the
// selected work's card, Work.js). One canvas, every image loaded once as a texture; it only draws
// while a dissolve is running. Falls back to a plain crossfade where WebGL isn't available.

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uFromSize;
uniform vec2 uToSize;
uniform vec2 uPlane;
uniform float uMix;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
vec2 cover(vec2 uv, vec2 img) {
  float rp = uPlane.x / uPlane.y, ri = img.x / img.y;
  vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
  return uv * s + (1.0 - s) * vec2(0.0, 1.0); // keep the top-left: these are screens
}

void main() {
  // The incoming image drifts in from a slight zoom as it takes over.
  vec2 zoomed = (vUv - vec2(0.0, 1.0)) * (1.0 - 0.04 * (1.0 - uMix)) + vec2(0.0, 1.0);
  vec3 a = texture(uFrom, cover(vUv, uFromSize)).rgb;
  vec3 b = texture(uTo, cover(zoomed, uToSize)).rgb;
  float n = noise(vUv * vec2(uPlane.x / uPlane.y, 1.0) * 4.0);
  float n2 = noise(vUv * 18.0) * 0.25;
  float m = smoothstep(uMix * 1.3 - 0.3, uMix * 1.3, n + n2 - 0.125);
  fragColor = vec4(mix(b, a, m), 1.0);
}`;

export default function DissolveImage({ images, active, light, className }) {
  const host = useRef(null);
  const api = useRef(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return undefined;
    let renderer;
    try {
      renderer = new Renderer({ webgl: 2, alpha: false, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    } catch {
      setFailed(true);
      return undefined;
    }
    const gl = renderer.gl;
    node.appendChild(gl.canvas);

    const textures = images.map(() => new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR }));
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uFrom: { value: textures[0] },
        uTo: { value: textures[0] },
        uFromSize: { value: [images[0].w, images[0].h] },
        uToSize: { value: [images[0].w, images[0].h] },
        uPlane: { value: [1, 1] },
        uMix: { value: 1 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;
    let frame = 0;
    let shown = 0;
    let began = 0;
    const DURATION = 900;

    const draw = () => renderer.render({ scene: mesh });
    const tick = (now) => {
      const t = Math.min(1, (now - began) / DURATION);
      u.uMix.value = 1 - (1 - t) ** 3;
      draw();
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const show = (i, instant) => {
      cancelAnimationFrame(frame);
      // Interrupted mid-dissolve, it carries on from whichever picture was showing more, so nothing
      // jumps to full before dissolving again.
      if (u.uMix.value >= 0.5) {
        u.uFrom.value = u.uTo.value;
        u.uFromSize.value = u.uToSize.value;
      }
      u.uTo.value = textures[i];
      u.uToSize.value = [images[i].w, images[i].h];
      shown = i;
      if (instant) {
        u.uMix.value = 1;
        draw();
        return;
      }
      u.uMix.value = 0;
      began = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const load = (isLight) =>
      images.forEach((im, i) => {
        const img = new Image();
        img.onload = () => {
          textures[i].image = img;
          if (i === shown) draw();
        };
        img.src = im.srcLight && isLight ? im.srcLight : im.src;
      });
    load(light);

    const resize = () => {
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      u.uPlane.value = [width, height];
      draw();
    };
    resize();
    const watcher = new ResizeObserver(resize);
    watcher.observe(node);

    api.current = { show, load };
    return () => {
      api.current = null;
      cancelAnimationFrame(frame);
      watcher.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
    };
  }, [images]);

  useEffect(() => {
    api.current?.show(active, reduced);
  }, [active, reduced]);

  useEffect(() => {
    api.current?.load(light);
  }, [light]);

  if (failed) {
    return (
      <div className={className}>
        {images.map((im, i) => (
          <img
            key={im.src}
            className="hx-w-shot"
            src={im.srcLight && light ? im.srcLight : im.src}
            alt=""
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
      </div>
    );
  }
  return <div className={className} ref={host} />;
}
