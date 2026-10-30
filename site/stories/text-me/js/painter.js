// painter.js: paints one scene from scenes.js into three canvases (far, middle, near) in a
// flat, layered style. Two rules make the depth: a layer farther away takes more
// of the scene's fog colour, and the bottom of every layer dissolves into mist. Last, every
// layer gets the grain of paper (paper()), so it reads as a painting, not a screen fill. A
// scene is painted once when it opens; js/fx.js animates the few things that move, on top.
//
// Coordinates in scenes.js: x is a fraction of the phone-wide column (0 left edge, 1 right
// edge; below 0 or above 1 reaches into the sides a computer shows), y is a fraction of
// the screen height, and sizes are fractions of the column width.

import { rng, noise1D, hexToRgb, mix, vivid, rgbToCss } from './util.js';
import { drawProp } from './props.js';

/**
 * Paints `scene` and returns three canvases, far to near. `view` holds the screen size in
 * CSS pixels (w, h), the pixel ratio, where the column starts (colX) and how wide it is
 * (colW), and `margin`: extra width on each side so the layers can drift without showing
 * an edge.
 */
export function paintScene(scene, view) {
  const groups = [0, 1, 2].map(() => makeCanvas(view));
  const pen = makePen(scene, view);
  paintSky(groups[0].ctx, scene, pen);
  for (const item of scene.layers) {
    const ctx = groups[item.g ?? 1].ctx;
    if (LAYERS[item.kind]) LAYERS[item.kind](ctx, item, pen);
    else drawProp(ctx, item, pen);
  }
  groups.forEach((g, i) => paper(g.ctx, pen, i));
  return groups.map((g) => g.canvas);
}

/**
 * The paper the scene is painted on: a fine grain of lighter and darker specks over
 * everything already painted (and nothing else, so the layers stay see-through), with a
 * few broad patches where the paint lies a little thicker or thinner. It keeps flat colour
 * from looking like a screen fill, and stops the soft sky gradients from banding.
 */
function paper(ctx, pen, layer) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const shift = layer * 61;
  ctx.translate(-shift, -shift);
  ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
  ctx.fillRect(0, 0, pen.right + shift, pen.view.h + shift);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const rand = rng(97 + layer * 13 + (pen.scene.seed ?? 0));
  for (let i = 0; i < 9; i++) {
    const x = rand() * pen.right;
    const y = rand() * pen.view.h;
    const r = pen.S(0.25 + rand() * 0.45);
    const tone = rand() < 0.5 ? '255 250 240' : '20 14 30';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgb(${tone} / 0.035)`);
    g.addColorStop(1, `rgb(${tone} / 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

let grain = null;

/** One square of paper grain, made once and tiled: one speck per CSS pixel. */
function grainTile() {
  if (grain) return grain;
  const size = 160;
  grain = document.createElement('canvas');
  grain.width = size;
  grain.height = size;
  const ctx = grain.getContext('2d');
  const img = ctx.createImageData(size, size);
  const rand = rng(2024);
  for (let i = 0; i < size * size; i++) {
    const v = rand();
    const light = v > 0.5;
    const a = Math.abs(v - 0.5) * 2;
    img.data[i * 4] = light ? 255 : 18;
    img.data[i * 4 + 1] = light ? 250 : 12;
    img.data[i * 4 + 2] = light ? 238 : 28;
    // Most specks are faint; a few stand out, like the tooth of real paper.
    img.data[i * 4 + 3] = Math.round(a ** 3 * 22);
  }
  ctx.putImageData(img, 0, 0);
  return grain;
}

function makeCanvas(view) {
  const canvas = document.createElement('canvas');
  const cssW = view.w + view.margin * 2;
  canvas.width = Math.round(cssW * view.dpr);
  canvas.height = Math.round(view.h * view.dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${view.h}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(view.dpr, view.dpr);
  return { canvas, ctx };
}

/**
 * The drawing kit every layer and prop gets: position helpers and `tone`, which applies the
 * scene's colour strength (vibrance) and optional fog to any colour.
 */
export function makePen(scene, view) {
  const vib = scene.vibrance ?? 1;
  const fog = hexToRgb(scene.fog || '#888888');
  return {
    view,
    scene,
    left: 0,
    right: view.w + view.margin * 2,
    X: (u) => view.margin + view.colX + u * view.colW,
    Y: (v) => v * view.h,
    S: (s) => s * view.colW,
    /** Colour with the scene's vibrance; `haze` mixes in that much fog first. */
    rgb: (c, haze = 0) => vivid(haze ? mix(c, fog, haze) : hexToRgb(c), vib),
    tone: (c, haze = 0, alpha = 1) => rgbToCss(vivid(haze ? mix(c, fog, haze) : hexToRgb(c), vib), alpha),
  };
}

function paintSky(ctx, scene, pen) {
  const stops = scene.sky;
  const end = pen.Y(scene.skyEnd ?? 0.75);
  const grad = ctx.createLinearGradient(0, 0, 0, end);
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), pen.tone(c)));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, pen.right, pen.view.h);
}

// Scenery layers. Each takes (ctx, item, pen). They span the whole width by design.
export const LAYERS = {
  // A glowing disc with a wide soft halo. Painted before the ridges, so hills can cover it.
  sun(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const r = pen.S(it.r ?? 0.07);
    const halo = pen.S(it.halo ?? 0.9);
    const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, halo);
    g.addColorStop(0, pen.tone(it.glow ?? it.color, 0, it.glowAlpha ?? 0.55));
    g.addColorStop(0.35, pen.tone(it.glow ?? it.color, 0, (it.glowAlpha ?? 0.55) * 0.35));
    g.addColorStop(1, pen.tone(it.glow ?? it.color, 0, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - halo, y - halo, halo * 2, halo * 2);
    ctx.fillStyle = pen.tone(it.color);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  },

  // A moon: the sun with a smaller, cooler halo and a faint shaded side.
  moon(ctx, it, pen) {
    LAYERS.sun(ctx, { glowAlpha: 0.22, halo: 0.45, ...it }, pen);
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const r = pen.S(it.r ?? 0.05);
    ctx.fillStyle = pen.tone('#000000', 0, 0.08);
    ctx.beginPath();
    ctx.arc(x + r * 0.25, y + r * 0.1, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  },

  stars(ctx, it, pen) {
    const rand = rng(it.seed ?? 7);
    const top = pen.Y(it.top ?? 0);
    const bottom = pen.Y(it.bottom ?? 0.5);
    const count = Math.round((it.count ?? 120) * (pen.right / 430));
    for (let i = 0; i < count; i++) {
      const y = top + (bottom - top) * rand() ** 1.6;
      const fade = 1 - (y - top) / (bottom - top);
      ctx.fillStyle = pen.tone(it.color ?? '#ffffff', 0, (0.25 + rand() * 0.6) * fade);
      const s = rand() < 0.08 ? 1.6 : 0.9;
      ctx.fillRect(rand() * pen.right, y, s, s);
    }
  },

  // A band of soft mist across the scene.
  mist(ctx, it, pen) {
    const y = pen.Y(it.y);
    const hh = pen.Y(it.h ?? 0.08);
    const g = ctx.createLinearGradient(0, y - hh, 0, y + hh);
    const c = it.color ?? pen.scene.fog;
    g.addColorStop(0, pen.tone(c, 0, 0));
    g.addColorStop(0.5, pen.tone(c, 0, it.alpha ?? 0.5));
    g.addColorStop(1, pen.tone(c, 0, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, y - hh, pen.right, hh * 2);
  },

  // Mountains or hills. `ridged` gives sharp peaks; `haze` is how far away the layer reads;
  // `mist` is how much its foot fades into fog; `trees` adds a pine tree line on the edge.
  ridge(ctx, it, pen) {
    const n = noise1D(it.seed ?? 1);
    const rand = rng((it.seed ?? 1) * 31 + 5);
    const step = 3;
    const pts = [];
    for (let px = pen.left - step; px <= pen.right + step; px += step) {
      const u = (px - pen.X(0)) / pen.view.colW;
      let k = n(u * (it.freq ?? 1.5) + 10, it.oct ?? 4, it.rough ?? 0.5);
      if (it.ridged) k = 1 - Math.abs(2 * k - 1);
      k = k ** (it.sharp ?? 1);
      pts.push([px, pen.Y(it.y) - pen.S(it.amp ?? 0.2) * k]);
    }
    const top = Math.min(...pts.map((p) => p[1]));
    const foot = pen.Y(it.y) + pen.Y(it.depth ?? 0.12);
    const grad = ctx.createLinearGradient(0, top, 0, foot);
    const haze = it.haze ?? 0;
    grad.addColorStop(0, pen.tone(it.color, haze));
    grad.addColorStop(it.hold ?? 0.45, pen.tone(it.color, haze));
    grad.addColorStop(1, pen.tone(it.color, Math.min(1, haze + (it.mist ?? 0.5))));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pen.view.h);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(pts[pts.length - 1][0], pen.view.h);
    ctx.closePath();
    ctx.fill();

    if (it.trees) {
      const t = it.trees;
      const every = pen.S(t.gap ?? 0.018);
      for (let x = pen.left; x < pen.right; x += every * (0.6 + rand() * 0.9)) {
        const i = Math.round((x - pts[0][0]) / step);
        const y = pts[Math.max(0, Math.min(pts.length - 1, i))][1];
        const hgt = pen.S(t.h ?? 0.03) * (0.6 + rand() * 0.8);
        pinePath(ctx, x, y + hgt * 0.15, hgt, hgt * 0.34, rand);
        ctx.fill();
      }
    }
    if (it.rim) {
      ctx.strokeStyle = pen.tone(it.rim, 0, it.rimAlpha ?? 0.35);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
    return pts;
  },

  // A row of pines standing on a gently uneven line, filled solid below.
  forest(ctx, it, pen) {
    const rand = rng(it.seed ?? 3);
    const n = noise1D((it.seed ?? 3) + 99);
    const base = (x) => pen.Y(it.y) - pen.S(it.lift ?? 0.03) * n((x - pen.X(0)) / pen.view.colW * 2, 3);
    const top = pen.Y(it.y) - pen.S(it.hMax ?? 0.2);
    const foot = pen.Y(it.y) + pen.Y(it.depth ?? 0.15);
    const grad = ctx.createLinearGradient(0, top, 0, foot);
    const haze = it.haze ?? 0;
    grad.addColorStop(0, pen.tone(it.color, haze));
    grad.addColorStop(0.55, pen.tone(it.color, haze));
    grad.addColorStop(1, pen.tone(it.color, Math.min(1, haze + (it.mist ?? 0.4))));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pen.left, pen.view.h);
    for (let x = pen.left; x <= pen.right; x += 4) ctx.lineTo(x, base(x));
    ctx.lineTo(pen.right, pen.view.h);
    ctx.closePath();
    ctx.fill();
    const skip = it.clear ? it.clear.map(([a, b]) => [pen.X(a), pen.X(b)]) : [];
    const gap = pen.S(it.gap ?? 0.05);
    for (let x = pen.left; x < pen.right; x += gap * (0.5 + rand())) {
      if (skip.some(([a, b]) => x > a && x < b)) continue;
      const hMin = pen.S(it.hMin ?? 0.08);
      const hgt = hMin + (pen.S(it.hMax ?? 0.2) - hMin) * rand();
      pinePath(ctx, x, base(x) + 2, hgt, hgt * (it.width ?? 0.32), rand);
      ctx.fill();
    }
  },

  // Still water: the sky's colours mirrored, a few light streaks, and an optional column
  // of glints under the sun or moon.
  water(ctx, it, pen) {
    const y0 = pen.Y(it.y);
    const y1 = pen.Y(it.y2 ?? 1);
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    const cols = it.colors ?? [pen.scene.sky[pen.scene.sky.length - 1], pen.scene.sky[0]];
    cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), pen.tone(c)));
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, pen.right, y1 - y0);
    const rand = rng(it.seed ?? 11);
    ctx.fillStyle = pen.tone(it.streak ?? '#ffffff', 0, 0.12);
    for (let i = 0; i < (it.streaks ?? 26); i++) {
      const y = y0 + (y1 - y0) * rand() ** 1.4;
      const w = pen.S(0.05 + rand() * 0.25) * (0.4 + (y - y0) / (y1 - y0));
      ctx.fillRect(rand() * pen.right, y, w, 1);
    }
    if (it.glint) {
      const x = pen.X(it.glint.x);
      ctx.fillStyle = pen.tone(it.glint.color, 0, 0.55);
      for (let y = y0 + 2; y < y1; y += 3 + (y - y0) * 0.04) {
        const spread = pen.S(0.02 + ((y - y0) / (y1 - y0)) * (it.glint.spread ?? 0.12));
        const w = spread * (0.3 + rand() * 0.9);
        ctx.fillRect(x - w / 2 + (rand() - 0.5) * spread, y, w, 1.2);
      }
    }
  },

  // Flat ground with a gentle edge: the nearest layer most scenes stand on. Grass grows
  // along its edge and in tufts across it, bigger nearer the bottom of the screen, with a
  // few dry brush strokes; `tufts: false` leaves it bare (a street, snow).
  ground(ctx, it, pen) {
    const pts = LAYERS.ridge(ctx, { amp: 0.03, freq: 0.8, oct: 2, mist: 0, depth: 0.3, ...it }, pen);
    if (it.tufts !== false) grass(ctx, it, pen, pts);
  },

  // A road from the bottom of the screen winding into the distance.
  road(ctx, it, pen) {
    const pts = it.path.map(([u, v]) => [pen.X(u), pen.Y(v)]);
    const w0 = pen.S(it.w0 ?? 0.5);
    const w1 = pen.S(it.w1 ?? 0.01);
    const left = [];
    const right = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const [x, y] = bezier(pts, t);
      const w = (w0 + (w1 - w0) * t ** 0.6) / 2;
      left.push([x - w, y]);
      right.push([x + w, y]);
    }
    const g = ctx.createLinearGradient(0, pts[pts.length - 1][1], 0, pts[0][1]);
    g.addColorStop(0, pen.tone(it.color, it.hazeFar ?? 0.6));
    g.addColorStop(1, pen.tone(it.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    left.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    right.reverse().forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fill();
  },
};

/**
 * Grass for a ground layer whose top edge is `pts`: blades along the edge (in the ground's
 * own colour, so the edge itself turns grassy, with a few catching the light), tufts
 * scattered below that grow as they come nearer, and some dry brush strokes.
 */
function grass(ctx, it, pen, pts) {
  const rand = rng((it.seed ?? 2) * 17 + 3);
  const base = pen.rgb(it.color, it.haze ?? 0);
  const sky = pen.rgb(pen.scene.sky[pen.scene.sky.length - 1]);
  const light = rgbToCss(mix(base, sky, 0.22));
  const lighter = rgbToCss(mix(base, sky, 0.12), 0.7);
  const darker = rgbToCss(mix(base, [0, 0, 0], 0.28), 0.6);
  const edge = (x) => pts[Math.max(0, Math.min(pts.length - 1, Math.round((x - pts[0][0]) / 3)))][1];
  const blades = (x, y, len, n, spread) => {
    ctx.beginPath();
    for (let b = 0; b < n; b++) {
      const dx = (b - (n - 1) / 2) * spread;
      const lean = (rand() - 0.5) * len * 0.7 + dx * 0.6;
      const tall = len * (0.6 + rand() * 0.5);
      ctx.moveTo(x + dx - 0.5, y);
      ctx.quadraticCurveTo(x + dx + lean * 0.2, y - tall * 0.6, x + dx + lean, y - tall);
      ctx.quadraticCurveTo(x + dx + lean * 0.3, y - tall * 0.5, x + dx + 0.6, y);
    }
    ctx.fill();
  };
  ctx.save();
  // Along the edge.
  for (let x = pen.left; x < pen.right; x += 3 + rand() * 5) {
    ctx.fillStyle = rand() < 0.18 ? light : rgbToCss(base);
    blades(x, edge(x) + 1.5, 2.5 + rand() * 3, 2 + Math.floor(rand() * 2), 1.2);
  }
  // Across the ground, nearer and bigger toward the bottom.
  const bottom = pen.view.h;
  const count = Math.round((pen.right / 400) * 70);
  for (let i = 0; i < count; i++) {
    const x = pen.left + rand() * (pen.right - pen.left);
    const top = edge(x) + 6;
    if (top >= bottom) continue;
    const t = rand() ** 1.4;
    const y = top + (bottom - top) * t;
    ctx.fillStyle = rand() < 0.55 ? lighter : darker;
    blades(x, y, 2.5 + t * 6, 3, 1.4 + t * 1.2);
  }
  // Dry brush: a few long, faint, slightly bent strokes.
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const x = pen.left + rand() * (pen.right - pen.left);
    const top = edge(x) + 8;
    if (top >= bottom) continue;
    const y = top + (bottom - top) * rand() ** 1.2;
    const len = 25 + rand() * 110;
    ctx.strokeStyle = rand() < 0.5 ? rgbToCss(mix(base, sky, 0.18), 0.09) : rgbToCss(mix(base, [0, 0, 0], 0.3), 0.1);
    ctx.lineWidth = 1 + rand() * 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y + (rand() - 0.5) * 3, x + len, y + (rand() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** One stylised pine: a thin top, tiers of drooping branches, a short trunk. */
export function pinePath(ctx, x, base, h, w, rand) {
  const tiers = 6 + Math.floor(rand() * 3);
  const top = base - h;
  const body = h * 0.9;
  const side = [];
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers;
    const y = top + body * t;
    const half = (w / 2) * (0.18 + 0.82 * t) * (0.85 + rand() * 0.3);
    side.push([half, y], [half * 0.4, y - (body / tiers) * 0.35]);
  }
  side.pop();
  const trunk = Math.max(0.8, w * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, top);
  for (const [dx, y] of side) ctx.lineTo(x + dx, y);
  ctx.lineTo(x + trunk, top + body);
  ctx.lineTo(x + trunk, base);
  ctx.lineTo(x - trunk, base);
  ctx.lineTo(x - trunk, top + body);
  for (let i = side.length - 1; i >= 0; i--) ctx.lineTo(x - side[i][0] * (0.9 + 0.2 * ((i * 7) % 3) / 2), side[i][1]);
  ctx.closePath();
}

function bezier(pts, t) {
  // De Casteljau: works for any number of control points.
  let p = pts;
  while (p.length > 1) {
    const next = [];
    for (let i = 0; i < p.length - 1; i++) {
      next.push([p[i][0] + (p[i + 1][0] - p[i][0]) * t, p[i][1] + (p[i + 1][1] - p[i][1]) * t]);
    }
    p = next;
  }
  return p[0];
}
