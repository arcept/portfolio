import { SKIES } from './skies';
import { TOPO } from './topo';

// ---------------------------------------------------------------- Values to tweak

const LINE_DENSITY = 11; // contour lines across the land's height; more is denser
const LINE_OPACITY = 0.5; // strength of the lines at rest: 1 full, 0.5 half
const MASK_LINES = 3.6; // strength of the lines inside the cursor's mask, on the same scale
const DRIFT_SPEED = 1; // how fast the land drifts: 1 as set, 0 still, 2 twice as fast
const MASK_SIZE = 220; // width of the cursor's blob, in CSS pixels, when moving slowly
const TRAIL_LINGER = 0.5; // seconds the mask takes to drain away once the cursor stops
const STREAK = 0.35; // seconds of the cursor's path a fast sweep leaves as a tapering streak
const WOBBLE = 0.35; // how much the mask's edge crawls: 0 a clean shape, 1 clearly liquid

// ----------------------------------------------------------------

// Aurora contours. The contour map, lit by the aurora: its curtains of light drift over the map and
// the lines they cross take their colour and glow, fading back to fine grey lines between them. The
// colours move through the four skies (Aurora, Sunset, Dusk, Jewels) about twenty seconds each, as
// the aurora does. Made for the dark, where the lines glow; on paper they are tinted rather than lit.
//
// The cursor uncovers the ground under the map (here it doesn't raise a hill, as on the plain map).
// The path it has just taken becomes a mask with a liquid, crawling edge, and inside it the bands
// between the lines fill with two alternating tones.
// Moving slowly leaves a small blob; a fast sweep, a tapering streak along the path; once the cursor
// stops the mask drains away, so a still cursor shows nothing. Only with a mouse, only over the hero,
// and not at all with reduced motion. Inside, the lines are much stronger than at rest, and the bands
// fill with two strengths of the ink.
//
// Enters: the lines draw in from the valleys up while the light comes up.
// As the hero scrolls away: the light dims as it fades out.

const ORDER = ['aurora', 'sunset', 'dusk', 'jewels'];
const HOLD = 20; // seconds per sky
const POINTS = 24; // how much of the cursor's path is kept

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const SKY = Object.fromEntries(ORDER.map((name) => [name, { light: SKIES[name].light.map(rgb), dark: SKIES[name].dark.map(rgb) }]));

// A colour token from the page (hex or rgb()), as 0..1 channels.
const token = (el, name, fallback) => {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  if (v.startsWith('#')) return rgb(v.length === 4 ? `#${[...v.slice(1)].map((c) => c + c).join('')}` : v);
  const m = v.match(/[\d.]+/g);
  return m && m.length >= 3 ? m.slice(0, 3).map((c) => +c / 255) : fallback;
};

// The cursor's recent path: where it was, how wide the mask is there, when it was there, and how long
// that point lives (the newest lives longer, so a stopped cursor drains slowly; older points make the
// tapering tail of a streak).
function makeTrail() {
  const pts = [];
  let lastX = null;
  let lastY = null;
  let tokensAt = -1;
  const colours = { base: [0.95, 0.95, 0.97], ink: [0.07, 0.08, 0.16] };
  return (u, now, dt, pointer) => {
    const t = u.uTime.value;
    const mouse = pointer && pointer.type === 'mouse' && !window.matchMedia('(hover: none)').matches;
    if (mouse && now - pointer.at < 60) {
      const moved = lastX === null ? 1 : Math.hypot(pointer.x - lastX, pointer.y - lastY);
      if (moved > 0.0008) {
        if (pts.length) pts[0].life = STREAK;
        pts.unshift({ x: pointer.x, y: pointer.y, at: t, life: TRAIL_LINGER });
        if (pts.length > POINTS) pts.pop();
        lastX = pointer.x;
        lastY = pointer.y;
      }
    }
    // Points past their life are dropped; the rest go to the shader, radius shrinking with age.
    const radius = (MASK_SIZE / 2) * u.uDpr.value / Math.max(u.uRes.value[1], 1);
    const out = u.uTrail.value;
    let n = 0;
    for (let i = 0; i < pts.length; i += 1) {
      const age = t - pts[i].at;
      if (age > pts[i].life) {
        pts.length = i;
        break;
      }
      const k = 1 - age / pts[i].life;
      out[n * 3] = pts[i].x;
      out[n * 3 + 1] = pts[i].y;
      out[n * 3 + 2] = radius * Math.sqrt(k);
      n += 1;
    }
    u.uTrailCount.value = n;
    // The box the trail (and its wobbling edge) can reach, so the shader only works out the mask
    // there and not across the whole screen.
    if (n) {
      const ar = u.uRes.value[0] / Math.max(u.uRes.value[1], 1);
      let x0 = 1e3;
      let y0 = 1e3;
      let x1 = -1e3;
      let y1 = -1e3;
      for (let i = 0; i < n; i += 1) {
        const x = (out[i * 3] - 0.5) * ar;
        const y = out[i * 3 + 1] - 0.5;
        const r = out[i * 3 + 2] + 0.05;
        x0 = Math.min(x0, x - r);
        y0 = Math.min(y0, y - r);
        x1 = Math.max(x1, x + r);
        y1 = Math.max(y1, y + r);
      }
      u.uTrailBox.value = [x0, y0, x1, y1];
    }

    // The page's own colours, read again every half second (they follow the theme switch), and
    // eased towards, so a switch fades rather than jumps.
    if (now - tokensAt > 500) {
      const first = tokensAt < 0;
      tokensAt = now;
      const page = document.querySelector('.abt') || document.documentElement;
      colours.base = token(page, '--abt-base', colours.base);
      colours.ink = token(page, '--abt-ink', colours.ink);
      if (first) {
        u.uBase.value = [...colours.base];
        u.uInk.value = [...colours.ink];
      }
    }
    const k = Math.min(1, dt * 3);
    for (let j = 0; j < 3; j += 1) {
      u.uBase.value[j] += (colours.base[j] - u.uBase.value[j]) * k;
      u.uInk.value[j] += (colours.ink[j] - u.uInk.value[j]) * k;
    }

    // The sky's three colours for this moment: each sky holds, then slowly becomes the next.
    const s = Math.max(0, t / HOLD);
    const from = SKY[ORDER[Math.floor(s) % ORDER.length]];
    const to = SKY[ORDER[(Math.floor(s) + 1) % ORDER.length]];
    const f = s % 1;
    const e = f < 0.45 ? 0 : (f - 0.45) / 0.55;
    const b = e * e * (3 - 2 * e);
    const dark = u.uDark.value;
    [u.uC0, u.uC1, u.uC2].forEach((c, i) => {
      for (let j = 0; j < 3; j += 1) {
        const x = from.light[i][j] + (from.dark[i][j] - from.light[i][j]) * dark;
        const z = to.light[i][j] + (to.dark[i][j] - to.light[i][j]) * dark;
        c.value[j] = x + (z - x) * b;
      }
    });
  };
}

export const auroraContours = {
  dpr: { desktop: 2, phone: 1.5 },
  extra: () => ({
    uC0: { value: [0, 0, 0] },
    uC1: { value: [0, 0, 0] },
    uC2: { value: [0, 0, 0] },
    uTrail: { value: new Array(POINTS * 3).fill(0) },
    uTrailCount: { value: 0 },
    uTrailBox: { value: [0, 0, 0, 0] },
    uBase: { value: [0.95, 0.95, 0.97] },
    uInk: { value: [0.07, 0.08, 0.16] },
  }),
  tick: makeTrail(),
  shader: `
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uTrail[${POINTS}];
uniform float uTrailCount;
uniform vec4 uTrailBox;
uniform vec3 uBase;
uniform vec3 uInk;
${TOPO}
// One curtain of light: brightest along a folded edge, falling off fast above it and hanging in long
// rays below, over its own stretch of the sky.
float curtain(vec2 p, float ar, float i, float t) {
  float x = p.x;
  float edge = 0.12 + 0.12 * sin(x * 1.3 + t * 0.35 + i * 2.1) + 0.06 * snoise(vec2(x * 1.1 + t * 0.2, i * 3.7));
  float d = p.y - edge;
  float band = d > 0.0 ? exp(-d * 10.0) : exp(d * 2.4);
  float rays = 0.6 + 0.4 * snoise(vec2(x * 6.0 + i * 5.0, t * 0.4 + i));
  float home = (-0.5 + i * 0.5) * ar * 0.8 + 0.25 * sin(t * 0.12 + i * 1.7);
  float reach = exp(-pow((x - home) * 1.6, 2.0));
  return band * rays * mix(0.15, 1.0, reach);
}

// How far a point is from the cursor's path, as a chain of tapering strokes (negative inside).
float trail(vec2 p) {
  float d = 1e3;
  int n = int(uTrailCount);
  for (int i = 0; i < ${POINTS}; i++) {
    if (i >= n) break;
    vec3 a = uTrail[i];
    vec2 pa = aspect(a.xy);
    if (i + 1 < n) {
      vec3 b = uTrail[i + 1];
      vec2 pb = aspect(b.xy);
      vec2 ab = pb - pa;
      float h = clamp(dot(p - pa, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
      d = min(d, length(p - pa - ab * h) - mix(a.z, b.z, h));
    } else {
      d = min(d, length(p - pa) - a.z);
    }
  }
  return d;
}

void main() {
  float t = uTime * ${DRIFT_SPEED.toFixed(3)};
  float ar = uRes.x / max(uRes.y, 1.0);
  vec2 p = aspect(vUv);
  float carry = uScroll;
  vec2 q = p;
  float h = land(q * 1.4, t);

  float count = ${LINE_DENSITY.toFixed(1)};
  float thin = lines(h, count, 1.0);
  float index = lines(h, count / 5.0, 1.3);
  float halo = lines(h, count, 7.0);

  float level = uIntro * 1.8 - 0.9;
  float reveal = 1.0 - smoothstep(level, level + 0.15, h * 0.5 + 0.1 * snoise(q * 3.0));

  // The aurora over the map: three curtains, one per colour.
  float a0 = curtain(p, ar, 0.0, uTime);
  float a1 = curtain(p, ar, 1.0, uTime + 13.0);
  float a2 = curtain(p, ar, 2.0, uTime + 29.0);
  float sum = a0 + a1 + a2;
  vec3 sky = (uC0 * a0 + uC1 * a1 + uC2 * a2) / max(sum, 1e-4);
  float light = clamp(sum, 0.0, 1.4) * smoothstep(0.0, 1.0, uIntro) * mix(1.0, 0.4, carry);

  // The ground and the plain lines are the page's own colours (its base and ink tokens).
  vec3 paper = uBase;
  vec3 grey = uInk * mix(1.0, 0.9, uDark);
  float fade = reveal * mix(1.0, 0.45, carry) * ${LINE_OPACITY.toFixed(3)};
  float thinA = mix(0.08, 0.06, uDark) + light * mix(0.2, 0.36, uDark);
  float indexA = mix(0.14, 0.12, uDark) + light * mix(0.3, 0.5, uDark);

  // Outside the mask: the lit map.
  vec3 lineCol = mix(grey, sky * mix(0.75, 1.1, uDark), clamp(light * 1.2, 0.0, 1.0));
  vec3 col = paper + sky * light * mix(0.035, 0.07, uDark);
  col = mix(col, lineCol, clamp(thin * thinA * fade, 0.0, 1.0));
  col = mix(col, lineCol, clamp(index * indexA * fade, 0.0, 1.0));
  col += sky * halo * light * 0.05 * uDark * fade;

  // The cursor's mask: the path's distance, its edge crawling with noise, fading out below the hero.
  float mask = 0.0;
  if (uTrailCount > 0.5 && p.x > uTrailBox.x && p.y > uTrailBox.y && p.x < uTrailBox.z && p.y < uTrailBox.w) {
    float wob = (fbm(p * 7.0 + vec2(uTime * 0.5, -uTime * 0.4)) * 0.5 + snoise(p * 15.0 - uTime * 0.8) * 0.2) * 0.035 * ${WOBBLE.toFixed(3)};
    float d = trail(p) + wob;
    mask = (1.0 - smoothstep(-0.004, 0.006, d)) * (1.0 - smoothstep(0.5, 0.95, uScroll)) * smoothstep(0.6, 1.0, uIntro);
  }
  if (mask > 0.001) {
    // Inside: the bands between the lines filled in two alternating tones.
    float band = mod(floor(h * count), 2.0);
    // Two clear strengths of the ink.
    vec3 toneA = mix(uBase, uInk, 0.07);
    vec3 toneB = mix(uBase, uInk, 0.22);
    vec3 inside = mix(toneA, toneB, band);
    // The aurora's light reaches in too.
    float lit = light;
    inside += sky * lit * mix(0.035, 0.07, uDark);
    vec3 insideLine = mix(grey, sky * mix(0.75, 1.1, uDark), clamp(lit * 1.2, 0.0, 1.0));
    float strength = ${MASK_LINES.toFixed(3)} / ${LINE_OPACITY.toFixed(3)};
    float tA = (mix(0.08, 0.06, uDark) + lit * mix(0.2, 0.36, uDark)) * strength;
    float iA = (mix(0.14, 0.12, uDark) + lit * mix(0.3, 0.5, uDark)) * strength;
    inside = mix(inside, insideLine, clamp(thin * tA * fade, 0.0, 1.0));
    inside = mix(inside, insideLine, clamp(index * iA * fade, 0.0, 1.0));
    col = mix(col, inside, mask);
  }

  col = mix(paper, col, smoothstep(0.0, 0.3, uIntro));
  col += grain() * 0.012 * uDark;
  fragColor = vec4(col, 1.0);
}`,
};
