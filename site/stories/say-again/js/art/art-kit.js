// art-kit.js: the small tools every painting in Say Again shares: seeded randomness (so a
// picture looks the same on every visit), smooth noise for hill lines, colour maths, the
// paper grain laid over each cached layer, soft glow sprites, and the list of "marks":
// boxes around the things that matter, which dev/art.html?check compares with the column.
//
// Nothing here is imported from story 01; a few helpers are copied in spirit so the two
// stories can change on their own.

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

/** Smooth 1D noise in [0, 1]; more octaves add finer bumps on top of the big shape. */
export function noise1D(seed) {
  const rand = rng(seed);
  const table = Array.from({ length: 256 }, rand);
  const at = (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[i & 255];
    return a + (table[(i + 1) & 255] - a) * f * f * (3 - 2 * f);
  };
  return (x, octaves = 3, rough = 0.5) => {
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

/**
 * The mast's aviation light: on for about a second, off a little longer, slow in and
 * out like a big bulb, never snapping. The same rhythm in every scene that shows it.
 */
export function blink(t) {
  const p = (((t % 2.4) + 2.4) % 2.4) / 2.4;
  if (p < 0.06) return smooth(p / 0.06);
  if (p < 0.4) return 1;
  if (p < 0.55) return 1 - smooth((p - 0.4) / 0.15);
  return 0;
}

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
/** 0 before `a`, 1 after `b`, smooth in between: for things that arrive in turn. */
export const ramp = (t, a, b) => smooth(clamp((t - a) / (b - a)));
/** A smooth bump: 0 before a, up by a + rise, down from b - fall to 0 at b. */
export const bump = (t, a, b, rise = 0.5, fall = 0.6) => Math.min(smooth(clamp((t - a) / rise)), 1 - smooth(clamp((t - (b - fall)) / fall)));

export function rgb(c) {
  if (Array.isArray(c)) return c;
  const h = c.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mixes two colours (hex or [r, g, b]); t = 0 gives a, t = 1 gives b. */
export function mix(a, b, t) {
  const A = rgb(a);
  const B = rgb(b);
  return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
}

export function css(c, alpha = 1) {
  const [r, g, b] = rgb(c).map((v) => Math.round(clamp(v, 0, 255)));
  return alpha >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${Math.max(0, alpha).toFixed(3)})`;
}

/** A vertical gradient from a list of colours, spread evenly from y0 to y1. */
export function vGrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), css(c)));
  return g;
}

/** A soft round glow, its colour fading to nothing at radius r. */
export function glow(ctx, x, y, r, color, alpha = 1) {
  if (r <= 0 || alpha <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, css(color, alpha));
  g.addColorStop(0.35, css(color, alpha * 0.4));
  g.addColorStop(1, css(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

const sprites = new Map();

/**
 * A glow painted once into a small canvas and stamped with drawImage after that: much
 * cheaper per frame than a new radial gradient for every town window.
 */
export function glowSprite(color) {
  if (sprites.has(color)) return sprites.get(color);
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, css(color, 1));
  grad.addColorStop(0.25, css(color, 0.45));
  grad.addColorStop(0.6, css(color, 0.12));
  grad.addColorStop(1, css(color, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  sprites.set(color, c);
  return c;
}

export function stamp(ctx, sprite, x, y, r, alpha = 1) {
  if (alpha <= 0.002 || r <= 0) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

export function roundRect(ctx, x, y, w, h, r) {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

export function poly(ctx, pts, close = true) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  if (close) ctx.closePath();
}

export function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

let grain = null;

/** One square of paper grain, made once and tiled: one speck per CSS pixel. */
function grainTile() {
  if (grain) return grain;
  const size = 160;
  grain = document.createElement('canvas');
  grain.width = grain.height = size;
  const g = grain.getContext('2d');
  const img = g.createImageData(size, size);
  const rand = rng(2026);
  for (let i = 0; i < size * size; i++) {
    const v = rand();
    const light = v > 0.5;
    img.data[i * 4] = light ? 255 : 16;
    img.data[i * 4 + 1] = light ? 248 : 12;
    img.data[i * 4 + 2] = light ? 236 : 30;
    // Most specks are faint and a few stand out, like the tooth of real paper.
    img.data[i * 4 + 3] = Math.round((Math.abs(v - 0.5) * 2) ** 3 * 24);
  }
  g.putImageData(img, 0, 0);
  return grain;
}

/**
 * Lays paper grain over what is already painted (and nowhere else, so a layer with a
 * hole for the window keeps its hole), plus a few broad patches where the paint is a
 * little thicker. It keeps the big soft gradients from banding and from looking like a
 * screen fill.
 */
export function paper(ctx, w, h, seed = 1, strength = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = strength;
  ctx.translate(-(seed * 37) % 160, -(seed * 53) % 160);
  ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
  ctx.fillRect(0, 0, w + 160, h + 160);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const rand = rng(seed * 13 + 5);
  for (let i = 0; i < 8; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = (0.2 + rand() * 0.4) * Math.max(w, h);
    const tone = rand() < 0.5 ? '#fff8ee' : '#140e20';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, css(tone, 0.04 * strength));
    g.addColorStop(1, css(tone, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

/**
 * A canvas the size of the view, at up to twice the CSS pixel size: sharper than that is
 * not visible on a soft painting, and three times the pixels would cost a phone a lot of
 * memory for every cached layer.
 */
export function makeLayer(view, dpr) {
  const c = document.createElement('canvas');
  const k = Math.min(2, dpr);
  c.width = Math.max(1, Math.round(view.w * k));
  c.height = Math.max(1, Math.round(view.h * k));
  const g = c.getContext('2d');
  g.scale(k, k);
  return { canvas: c, ctx: g };
}

const layers = new Map();
let uses = 0;

/**
 * A still layer, painted once per scene, look and screen size, then reused every frame.
 * A handful are kept so a cross-fade between two scenes does not repaint either; the
 * oldest are emptied, which frees their memory on a phone straight away.
 */
export function cachedLayer(key, view, dpr, paint) {
  const full = `${key}|${view.w}x${view.h}|${view.colX}|${Math.min(2, dpr)}`;
  let hit = layers.get(full);
  if (!hit) {
    const { canvas, ctx } = makeLayer(view, dpr);
    paint(ctx);
    hit = { canvas };
    layers.set(full, hit);
    while (layers.size > 14) {
      let oldest = null;
      for (const [k, v] of layers) if (!oldest || v.used < oldest[1].used) oldest = [k, v];
      oldest[1].canvas.width = oldest[1].canvas.height = 0;
      layers.delete(oldest[0]);
    }
  }
  hit.used = ++uses;
  return hit.canvas;
}

export function clearLayers() {
  for (const v of layers.values()) v.canvas.width = v.canvas.height = 0;
  layers.clear();
}

/** Draws a cached layer over the whole view. */
export function put(ctx, layer, view, alpha = 1) {
  if (alpha <= 0.002) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(layer, 0, 0, view.w, view.h);
  ctx.globalAlpha = 1;
}

/**
 * Marks: while `marks.on` is true, every painter adds a box around each thing that matters,
 * with the rule it must keep: 'col' inside the column and the frame, 'room' inside the
 * column between the buttons and the console, 'high' inside the column and clear of the
 * buttons and of the two lines of text at the bottom.
 */
export const marks = { on: false, list: [] };

export function mark(name, x, y, w, h, rule = 'col') {
  if (marks.on) marks.list.push({ name, x, y, w, h, rule });
}

/** A Scots pine as the coast has them: a bare, slightly crooked trunk and a flat crown of clumps. */
export function scotsPine(ctx, x, base, h, rand, lean = 0) {
  const trunkW = Math.max(1, h * 0.035);
  const top = base - h;
  const bend = (rand() - 0.5) * h * 0.12 + lean * h;
  ctx.beginPath();
  ctx.moveTo(x - trunkW, base);
  ctx.quadraticCurveTo(x - trunkW + bend * 0.3, base - h * 0.5, x + bend - trunkW * 0.5, top + h * 0.22);
  ctx.lineTo(x + bend + trunkW * 0.5, top + h * 0.22);
  ctx.quadraticCurveTo(x + trunkW + bend * 0.3, base - h * 0.5, x + trunkW, base);
  ctx.closePath();
  ctx.fill();
  const cx = x + bend;
  // The crown: a few flat pads of needles on alternate sides, the top one smallest, each
  // a row of small lumps so its edge is ragged like a real pine's.
  const pads = 4 + Math.floor(rand() * 3);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = Math.max(0.8, trunkW * 0.7);
  for (let i = 0; i < pads; i++) {
    const a = i / (pads - 1);
    const side = i === 0 ? 0 : i % 2 ? 1 : -1;
    const width = h * (0.16 + a * 0.22) * (0.85 + rand() * 0.3);
    const px = cx + side * h * (0.04 + a * 0.08) + (rand() - 0.5) * h * 0.04;
    const py = top + h * (0.05 + a * 0.24);
    // The branch from the trunk out to the pad, so the crown hangs on something.
    line(ctx, cx, py + h * 0.07, px, py + width * 0.1);
    const lumps = 5 + Math.floor(rand() * 3);
    ctx.beginPath();
    for (let j = 0; j < lumps; j++) {
      const u = j / (lumps - 1) - 0.5;
      const r = width * (0.2 + rand() * 0.1) * (1 - Math.abs(u) * 0.6);
      const ly = py - r * 0.2 + (rand() - 0.5) * r * 0.5;
      ctx.moveTo(px + u * width + r, ly);
      ctx.ellipse(px + u * width, ly, r, r * 0.68, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

/** A low, round mountain pine on the dune: a few overlapping lumps. */
export function dunePine(ctx, x, base, w, rand) {
  ctx.beginPath();
  const n = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const a = i / (n - 1);
    const r = w * (0.18 + rand() * 0.14) * (1 - Math.abs(a - 0.5) * 0.8);
    ctx.moveTo(x + (a - 0.5) * w * 0.8 + r, base - r * 0.7);
    ctx.ellipse(x + (a - 0.5) * w * 0.8, base - r * 0.7, r, r * 0.8, 0, 0, Math.PI * 2);
  }
  ctx.fill();
}
