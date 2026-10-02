'use client';

import { useEffect, useRef } from 'react';
import { THEME_ATTR } from '@/components/theme/theme';

// A full-bleed WebGL layer for the hero's background (HeroBackground.js). It draws `fragment` over a
// transparent canvas, so the page's own colour shows through, and hands it:
//   u_res        the canvas size, in device pixels
//   u_time       seconds, slowed by the caller's own maths
//   u_pointer    the pointer, in device pixels from the bottom left; u_pointerAmt eases 0 → 1 while it's over
//   u_ink, u_accent, u_strength   the palette for the current theme (`palette.dark` / `palette.light`)
// Like the site's own shader (components/VelarisBackground.jsx) it pauses off screen and in a hidden tab, and
// with reduced motion it paints one still frame.

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const rgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

export default function ShaderField({ fragment, palette }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl || gl.isContextLost()) return undefined;
    gl.getExtension('OES_standard_derivatives');

    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ShaderField: compile failed', gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) return undefined;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const u = (name) => gl.getUniformLocation(program, name);
    const loc = {
      res: u('u_res'),
      time: u('u_time'),
      pointer: u('u_pointer'),
      pointerAmt: u('u_pointerAmt'),
      ink: u('u_ink'),
      accent: u('u_accent'),
      strength: u('u_strength'),
    };

    const root = document.documentElement;
    const setPalette = () => {
      const p = root.getAttribute(THEME_ATTR) === 'light' ? palette.light : palette.dark;
      gl.uniform3f(loc.ink, ...rgb(p.ink));
      gl.uniform3f(loc.accent, ...rgb(p.accent));
      gl.uniform1f(loc.strength, p.strength);
    };
    setPalette();

    let dpr = 1;
    let elapsed = 0;
    const pointer = { x: 0, y: 0, amt: 0, target: 0 };
    const draw = () => {
      gl.uniform1f(loc.time, elapsed);
      gl.uniform2f(loc.pointer, pointer.x, pointer.y);
      gl.uniform1f(loc.pointerAmt, pointer.amt);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const themeWatch = new MutationObserver(() => {
      setPalette();
      draw();
    });
    themeWatch.observe(root, { attributes: true, attributeFilter: [THEME_ATTR] });

    // The pointer, only where one can hover: followed loosely, and eased in and out as it enters and leaves.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      pointer.target = inside ? 1 : 0;
      pointer.tx = (e.clientX - r.left) * dpr;
      pointer.ty = (r.bottom - e.clientY) * dpr;
      if (pointer.amt === 0) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onLeave = () => {
      pointer.target = 0;
    };
    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let running = false;
    let last = 0;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      if (pointer.tx !== undefined) {
        pointer.x += (pointer.tx - pointer.x) * 0.08;
        pointer.y += (pointer.ty - pointer.y) * 0.08;
      }
      pointer.amt += (pointer.target - pointer.amt) * 0.05;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || still.matches || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()));
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? pause() : play());
    const onMotion = () => (still.matches ? pause() : play());
    document.addEventListener('visibilitychange', onVisibility);
    still.addEventListener('change', onMotion);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      themeWatch.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      still.removeEventListener('change', onMotion);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [fragment, palette]);

  return <canvas ref={ref} className="cro-shader" aria-hidden="true" />;
}
