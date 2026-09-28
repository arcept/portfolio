// The contour map under the aurora contours: its land, and the lines drawn across it.
export const TOPO = `
// Broad, smooth land: three octaves, not five, so the lines sweep rather than wriggle.
float land(vec2 q, float t) {
  vec2 d = vec2(t * 0.018, -t * 0.012);
  float h = snoise(q * 0.5 + d) * 0.6 + snoise(q * 1.05 - d + 4.0) * 0.28 + snoise(q * 2.1 + d * 2.0 + 9.0) * 0.1;
  h += 0.25 * snoise(q * 0.22 - t * 0.01);
  return h;
}

// One set of contour lines: thin, even, antialiased by their own rate of change.
float lines(float h, float count, float width) {
  float v = h * count;
  float f = abs(fract(v - 0.5) - 0.5);
  float w = fwidth(v) * width;
  return 1.0 - smoothstep(w * 0.5, w * 1.5, f);
}
`;
