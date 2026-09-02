'use client';

// Adapted from "Velaris" by Aman Shakya — https://21st.dev/@amanshakya307/components/velaris
// MIT licensed. Shader retained verbatim; React wrapper rewritten for this codebase.

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform vec2  u_resolution;
uniform float u_time;
uniform float u_grain;
uniform vec3  u_colors[4];
uniform vec3  u_bg;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv - 0.5;
  p.x *= ratio;

  float t = u_time * 0.1;
  float n1 = snoise(p * 0.4  + vec2( t * 0.2,  -t * 0.3));
  float n2 = snoise(p * 0.55 + vec2(-t * 0.15,  t * 0.25) + n1 * 0.25);
  float n3 = snoise(p * 0.75 + vec2( t * 0.1,  -t * 0.2)  + n2 * 0.2);

  vec3 col = u_bg;

  float dist = length(p) * 1.5;
  float vignette = 1.0 - smoothstep(0.3, 1.2, dist);

  col = mix(col, u_colors[0], smoothstep(-0.2, 0.5, n1) * 0.85);
  col = mix(col, u_colors[1], smoothstep(-0.1, 0.6, n2) * 0.7);
  col = mix(col, u_colors[2], smoothstep(-0.3, 0.4, n3) * 0.6);
  col = mix(col, u_colors[3], smoothstep(0.0, 0.7, n1 * n2) * 0.5);

  float glow = smoothstep(0.8, 0.0, dist) * 0.3;
  col += u_colors[1] * glow;
  col = mix(col * 0.2, col, vignette);

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.1;

  gl_FragColor = vec4(col, 1.0);
}
`;

const DEFAULT_COLORS = ['#86efac', '#4ade80', '#059669', '#000000'];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export default function VelarisBackground({
  bg = '#000000',
  colors = DEFAULT_COLORS,
  speed = 2.0,
  grain = 0.3,
  className = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Stable primitive dep — an inline array literal from a caller would otherwise
  // tear down and rebuild the entire GL context on every render.
  const colorKey = colors.join(',');

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', {
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) return; // .cs-hero's own gradient shows through

    // React Strict Mode (default for the app router in dev) mounts, cleans up, and
    // remounts synchronously. If a prior cleanup had forced context loss on this same
    // canvas, every GL call below would silently no-op — bail and wait for the
    // 'webglcontextrestored' handler below instead of compiling into a dead context.
    if (gl.isContextLost()) return;

    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Velaris: shader compile failed', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Velaris: program link failed', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      res: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      grain: gl.getUniformLocation(program, 'u_grain'),
      colors: gl.getUniformLocation(program, 'u_colors'),
      bg: gl.getUniformLocation(program, 'u_bg'),
    };

    // Uniforms that never change — set once, not 60x/second.
    gl.uniform1f(locs.grain, grain);
    gl.uniform3f(locs.bg, ...hexToRgb(bg));
    gl.uniform3fv(
      locs.colors,
      new Float32Array(colors.slice(0, 4).flatMap(hexToRgb)),
    );

    let elapsed = 0;

    const draw = () => {
      gl.uniform1f(locs.time, elapsed * speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(container.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(container.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(locs.res, canvas.width, canvas.height);
      draw(); // repaint immediately so resizing never flashes empty
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let running = false;
    let startedAt = 0;

    const loop = (now) => {
      elapsed = (now - startedAt) / 1000;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (running || reduceMotion.matches || document.hidden) return;
      running = true;
      startedAt = performance.now() - elapsed * 1000; // resume without a time jump
      raf = requestAnimationFrame(loop);
    };

    const pause = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    // Always paint one frame, so reduced-motion and paused states still show the gradient.
    draw();

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0 },
    );
    io.observe(container);

    const onMotionChange = () => (reduceMotion.matches ? pause() : play());
    const onVisibility = () => (document.hidden ? pause() : play());
    reduceMotion.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      reduceMotion.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibility);
      // Delete GL resources so GPU memory is freed immediately, but don't force the
      // context itself into a lost state (WEBGL_lose_context.loseContext()) — Strict
      // Mode's synchronous mount/cleanup/remount in dev reuses this same canvas, and a
      // context killed that way can't be un-killed without a fragile preventDefault/
      // restoreContext dance. The context object is reclaimed by ordinary garbage
      // collection once the canvas becomes unreachable, same as any other WebGL app.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [bg, colorKey, speed, grain]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
