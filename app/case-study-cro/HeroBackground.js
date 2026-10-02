'use client';

import HeroBackdrop from '@/components/case-study-kit/HeroBackdrop';
import ShaderField from './ShaderField';

// The collage hero's background, in the illustration's blue-violet, behind the title and the collage only:
// it fades out before the journey figure (cro-collage.css, .cro-col__bg). Two layers:
//   the other case studies' moving gradient (HeroBackdrop: the Velaris shader in dark, a drifting CSS wash in
//   light), as OMS has it in violet and Placement Hub in blue;
//   and over it, convergence: many faint lanes from the left narrowing into one point behind the collage,
//   dashes flowing along them, and one line carrying on past it, the teams' views meeting in one journey. The
//   lanes near the pointer brighten.

const VIOLET = ['#6d5bff', '#4f3cf0', '#17104f', '#0d0d0c'];

// Ashima Arts' 2D simplex noise (MIT), the same as the site's shader uses.
const NOISE = `
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
`;

const CONVERGENCE = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec2 vUv;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_pointerAmt;
uniform vec3 u_ink;
uniform vec3 u_accent;
uniform float u_strength;
${NOISE}
// A soft bloom behind the collage, at the right.
float bloom(vec2 uv) {
  vec2 d = (uv - vec2(0.78, 0.62)) * vec2(u_res.x / u_res.y, 1.0);
  return exp(-dot(d, d) * 3.2);
}
float hash1(float n) { return fract(sin(n * 91.345) * 47453.5453); }
void main() {
  vec2 uv = vUv;
  float ratio = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * ratio, uv.y);
  vec2 focus = vec2(0.8 * ratio, 0.56);
  vec2 m = vec2(u_pointer.x / u_res.x * ratio, u_pointer.y / u_res.y);
  float t = u_time;

  // Lanes that spread wider the further they are from the point they meet at.
  float dx = focus.x - p.x;
  float spread = 0.05 + max(dx, 0.0) * 0.6;
  float v = (p.y - focus.y) / spread;
  v += snoise(vec2(p.x * 0.9 - t * 0.02, v * 0.25)) * 0.12;
  float lanes = v * 5.0;
  float f = fract(lanes);
  float line = 1.0 - smoothstep(0.0, fwidth(lanes) * 1.2, min(f, 1.0 - f));
  float id = floor(lanes + 0.5);

  // Dashes flowing along each lane toward the meeting point, each lane at its own pace.
  float dash = fract(p.x * 4.0 - t * (0.1 + 0.06 * hash1(id)) + hash1(id + 7.0) * 9.0);
  float flow = smoothstep(0.0, 0.08, dash) * (1.0 - smoothstep(0.3, 0.55, dash));

  float before = smoothstep(0.0, 0.03, dx) * smoothstep(0.02, 0.35, dx);
  float nearPointer = u_pointerAmt * exp(-dot(p - m, p - m) * 14.0);
  float side = mix(0.45, 1.0, smoothstep(0.0, 0.8, uv.x));
  float a = line * (0.05 + 0.22 * flow + 0.25 * nearPointer) * before * side;

  // Past the meeting point, the one journey carries on.
  float spineD = abs(p.y - focus.y);
  float spine = (1.0 - smoothstep(0.0, 1.6 / u_res.y, spineD)) * smoothstep(0.0, 0.04, -dx);
  float spineFlow = smoothstep(0.0, 0.1, fract(p.x * 4.0 - t * 0.14)) * 0.5 + 0.35;
  a += spine * 0.3 * spineFlow;
  a *= u_strength;

  float d = length(p - focus);
  float glow = exp(-d * d * 18.0) * 0.18 * u_strength + bloom(uv) * 0.08 * u_strength;
  vec3 col = mix(u_ink, u_accent, clamp(flow * 0.7 + nearPointer + spine, 0.0, 1.0));
  gl_FragColor = vec4(col * a + u_accent * glow, clamp(a + glow, 0.0, 1.0));
}
`;

// The lanes are lightened in the dark, where they would sink into the gradient's violet.
const PALETTE = {
  dark: { ink: '#b4abff', accent: '#e4e0ff', strength: 0.9 },
  light: { ink: '#3a2ee0', accent: '#5a48ff', strength: 0.85 },
};

export default function HeroBackground() {
  return (
    <div className="cro-col__bg" aria-hidden="true">
      <HeroBackdrop colors={VIOLET} />
      <ShaderField fragment={CONVERGENCE} palette={PALETTE} />
    </div>
  );
}
