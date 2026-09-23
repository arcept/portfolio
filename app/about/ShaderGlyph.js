'use client';

import { useEffect, useRef } from 'react';

// A small piece of 3D drawn by one fragment shader on a transparent canvas (see OrbGlyph.js and
// KeysGlyph.js for the shaders). The shader gets `resolution`, `time` (seconds) and `lightTheme`
// (0 or 1, from the page's theme), and may declare `uniform sampler2D legend` if `makeTexture` is
// given. It only draws while on screen, at up to 30 frames a second and at most 320px square; with
// reduced motion it draws a single still frame at `stillTime`.

const VS = `#version 300 es
in vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;

// `active` (default true): an inactive glyph turns and presses at a third of the speed and draws at half
// the frame rate; when it becomes active the shader's `since` uniform restarts from 0, so it can play
// a one-off flourish (a key press, a spin). `since` stays large when nothing has happened.
export default function ShaderGlyph({ fragment, variant, makeTexture, stillTime = 2.2, active = true }) {
  const ref = useRef(null);
  const state = useRef({ active, since: 99 });

  useEffect(() => {
    if (active && !state.current.active) state.current.since = 0;
    state.current.active = active;
  }, [active]);


  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      canvas.dataset.fallback = 'true';
      return undefined;
    }

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };

    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch (error) {
      console.error(error);
      canvas.dataset.fallback = 'true';
      return undefined;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'resolution'),
      time: gl.getUniformLocation(program, 'time'),
      lightTheme: gl.getUniformLocation(program, 'lightTheme'),
      since: gl.getUniformLocation(program, 'since'),
    };
    if (makeTexture) {
      gl.activeTexture(gl.TEXTURE0);
      makeTexture(gl);
      gl.uniform1i(gl.getUniformLocation(program, 'legend'), 0);
    }

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = false;
    let raf = 0;
    let elapsed = still ? stillTime : 0;
    let speed = state.current.active ? 1 : 0.33;
    let last = 0;
    let lastDraw = 0;

    const draw = () => {
      const css = canvas.clientWidth;
      if (!css) return;
      const size = Math.min(320, Math.round(css * Math.min(window.devicePixelRatio || 1, 2)));
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size;
        canvas.height = size;
      }
      gl.viewport(0, 0, size, size);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.resolution, size, size);
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.since, state.current.since);
      gl.uniform1f(uniforms.lightTheme, document.documentElement.getAttribute('data-abt-theme') === 'light' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const frame = (ms) => {
      raf = 0;
      if (!visible) return;
      const dt = last ? Math.min((ms - last) * 0.001, 0.1) : 0;
      speed += ((state.current.active ? 1 : 0.33) - speed) * Math.min(1, dt * 4);
      elapsed += dt * speed;
      state.current.since += dt;
      last = ms;
      if (ms - lastDraw >= (state.current.active ? 33 : 66)) {
        lastDraw = ms;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };

    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        last = 0;
        return;
      }
      if (still) draw();
      else if (!raf) raf = requestAnimationFrame(frame);
    });
    watcher.observe(canvas);

    // A still frame has to be redrawn when the theme or the size changes; a playing one does it itself.
    const redraw = () => still && visible && draw();
    const themeWatcher = new MutationObserver(redraw);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-abt-theme'] });
    const sizeWatcher = new ResizeObserver(redraw);
    sizeWatcher.observe(canvas);

    // The context is deliberately not lost on cleanup: React's development double-mount would hand
    // the second mount a dead context on the same canvas.
    return () => {
      if (raf) cancelAnimationFrame(raf);
      watcher.disconnect();
      themeWatcher.disconnect();
      sizeWatcher.disconnect();
    };
  }, [fragment, makeTexture, stillTime]);

  return <canvas ref={ref} className={`abt-glyph abt-glyph--${variant}`} aria-hidden="true" />;
}
