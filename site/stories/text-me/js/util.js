// util.js: small helpers shared by the painter, the effects and the life lines view:
// a seeded random generator (so a scene looks the same on every visit), smooth 1D noise
// for hill and mountain edges, and colour maths.

/** Seeded random numbers in [0, 1) (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Smooth 1D noise in [0, 1]. Octaves add finer bumps on top of the big shape; `rough`
 * is how much each finer octave counts. Used for every ridge and hill line.
 */
export function noise1D(seed) {
  const rand = rng(seed);
  const table = Array.from({ length: 256 }, rand);
  const smooth = (t) => t * t * (3 - 2 * t);
  const at = (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[i & 255];
    return a + (table[(i + 1) & 255] - a) * smooth(f);
  };
  return (x, octaves = 4, rough = 0.5) => {
    let sum = 0;
    let amp = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += at(x * 2 ** o + o * 17.3) * amp;
      norm += amp;
      amp *= rough;
    }
    return sum / norm;
  };
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToCss([r, g, b], alpha = 1) {
  const c = (v) => Math.round(Math.min(255, Math.max(0, v)));
  return alpha >= 1 ? `rgb(${c(r)} ${c(g)} ${c(b)})` : `rgb(${c(r)} ${c(g)} ${c(b)} / ${alpha})`;
}

/** Mixes two colours given as hex strings or [r, g, b]; t = 0 gives a, t = 1 gives b. */
export function mix(a, b, t) {
  const A = typeof a === 'string' ? hexToRgb(a) : a;
  const B = typeof b === 'string' ? hexToRgb(b) : b;
  return [0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t);
}

/**
 * Turns colour saturation up or down around the colour's own brightness. v = 1 leaves it,
 * v = 0 makes it grey. The story uses this to drain and restore colour between acts.
 */
export function vivid(c, v) {
  const [r, g, b] = typeof c === 'string' ? hexToRgb(c) : c;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return [y + (r - y) * v, y + (g - y) * v, y + (b - y) * v];
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** WCAG relative luminance of an [r, g, b] colour, 0 for black to 1 for white. */
export function luminance([r, g, b]) {
  const f = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast ratio between two [r, g, b] colours: 1 is none, 21 is black on white. */
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Moves a colour toward dark or light until it reads on `back` (contrast of at least 3.5). */
export function readable(rgb, back) {
  // Go toward whichever end, dark or light, can stand out more from this background.
  const dark = [20, 24, 38];
  const light = [252, 249, 242];
  const toward = contrast(dark, back) >= contrast(light, back) ? dark : light;
  let c = rgb;
  for (let i = 0; i < 12 && contrast(c, back) < 3.5; i += 1) c = mix(c, toward, 0.15);
  return c;
}
