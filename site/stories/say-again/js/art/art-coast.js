// art-coast.js: the outside world of Say Again, in pieces the scenes put together: sky,
// stars, the Little Dipper, a thin moon, cloud banks, the town across the water with its
// red roofs and windows, the water, dune lines with pines, and the red-and-white radio
// mast. The room's window, the drive and the kitchen window all use these, so the coast
// looks like one place from every side.

import { rng, noise1D, mix, css, vGrad, scotsPine, dunePine, line, poly } from './art-kit.js';

/** A sky gradient over a box. */
export function sky(ctx, x, y, w, h, stops) {
  ctx.fillStyle = vGrad(ctx, y, y + h, stops);
  ctx.fillRect(x, y, w, h);
}

/** Stars thinning toward the horizon. A few are bigger, a few warmer. */
export function stars(ctx, x, y, w, h, count, seed, alpha = 1) {
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    const sy = y + h * rand() ** 1.5;
    const fade = 1 - (sy - y) / h;
    const big = rand() < 0.07;
    ctx.fillStyle = css(rand() < 0.2 ? '#ffe6c4' : '#e8eeff', alpha * (0.25 + rand() * 0.6) * (0.3 + 0.7 * fade));
    const s = big ? 1.5 : 0.9;
    ctx.fillRect(x + rand() * w, sy, s, s);
  }
}

// The Little Dipper as the sky has it (right ascension in hours, declination in degrees,
// brightness as magnitude), so whoever knows it finds it: Polaris at the end of the
// handle, Kochab and Pherkad at the outer edge of the bowl.
const DIPPER = [
  ['Polaris', 2.53, 89.26, 2.0],
  ['Yildun', 17.54, 86.58, 4.4],
  ['epsilon', 16.77, 82.04, 4.2],
  ['zeta', 15.73, 77.79, 4.3],
  ['eta', 16.29, 75.76, 4.9],
  ['Pherkad', 15.35, 71.83, 3.0],
  ['Kochab', 14.85, 74.16, 2.1],
];

/**
 * Where the Little Dipper's stars fall in a box: projected around the pole as you see
 * it facing north, turned by the sidereal time `lst` (hours) so the bowl hangs where it
 * looks best. Returns [{ name, x, y, mag }].
 */
export function dipperStars(cx, cy, scale, lst = 21.5) {
  return DIPPER.map(([name, ra, dec, mag]) => {
    const r = 90 - dec;
    const ha = ((lst - ra) * 15 * Math.PI) / 180;
    // Facing north, stars turn anticlockwise round the pole: west is to the left.
    return { name, x: cx - r * Math.sin(ha) * scale, y: cy - r * Math.cos(ha) * scale, mag };
  });
}

export function paintDipper(ctx, pts, alpha = 1) {
  for (const p of pts) {
    const size = p.mag < 2.5 ? 2.1 : p.mag < 3.5 ? 1.6 : 1.2;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3.2);
    g.addColorStop(0, css('#f4f2ff', alpha * (p.mag < 2.5 ? 0.5 : 0.28)));
    g.addColorStop(1, css('#f4f2ff', 0));
    ctx.fillStyle = g;
    ctx.fillRect(p.x - size * 3.2, p.y - size * 3.2, size * 6.4, size * 6.4);
    ctx.fillStyle = css(p.name === 'Kochab' ? '#ffe2c0' : '#ffffff', alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A thin waxing moon: the lit edge on the right, a faint ghost of the rest. */
export function moon(ctx, x, y, r, color = '#f3ecd6', alpha = 1) {
  const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 5);
  g.addColorStop(0, css(color, 0.14 * alpha));
  g.addColorStop(1, css(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
  ctx.fillStyle = css(color, 0.07 * alpha);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(color, alpha);
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2);
  ctx.ellipse(x, y, r * 0.62, r, 0, Math.PI / 2, -Math.PI / 2, true);
  ctx.fill();
}

/** A bank of soft, flat clouds: overlapping ellipses with lighter tops. */
export function clouds(ctx, x0, x1, y, h, color, light, seed, alpha = 1, count = 14) {
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    const cx = x0 + (x1 - x0) * rand();
    const cy = y + (rand() - 0.5) * h;
    const rw = (x1 - x0) * (0.08 + rand() * 0.18);
    const rh = h * (0.12 + rand() * 0.22);
    ctx.fillStyle = css(color, alpha * (0.5 + rand() * 0.4));
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
    if (light) {
      ctx.fillStyle = css(light, alpha * 0.18);
      ctx.beginPath();
      ctx.ellipse(cx, cy - rh * 0.35, rw * 0.8, rh * 0.45, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * A long bank of cloud: a lumpy top edge, a flatter underside, darker below than above,
 * with an optional lit rim along the top. Layers of these make an overcast sky.
 */
export function cloudBank(ctx, x0, x1, top, bottom, color, seed, rim = null, alpha = 1) {
  const n = noise1D(seed);
  const n2 = noise1D(seed + 7);
  const hgt = bottom - top;
  const lower = (x) => bottom - hgt * 0.25 * n2(x * 0.008, 2);
  // The ends round off, so a bank that stops inside the picture does not end in a cut.
  const taper = Math.min(60, (x1 - x0) / 3);
  const upper = (x) => {
    const u = top + hgt * 0.55 * (1 - n(x * 0.012, 4, 0.55) ** 1.5);
    const k = Math.sqrt(Math.max(0, Math.min(1, (x - x0) / taper, (x1 - x) / taper)));
    return lower(x) - (lower(x) - u) * k;
  };
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, css(mix(color, '#ffffff', 0.08), alpha));
  g.addColorStop(1, css(mix(color, '#000000', 0.15), alpha));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x0, lower(x0));
  for (let x = x0; x <= x1; x += 4) ctx.lineTo(x, upper(x));
  for (let x = x1; x >= x0; x -= 6) ctx.lineTo(x, lower(x));
  ctx.closePath();
  ctx.fill();
  if (rim) {
    ctx.strokeStyle = css(rim, 0.35 * alpha);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 4) (x === x0 ? ctx.moveTo(x, upper(x) + 1) : ctx.lineTo(x, upper(x) + 1));
    ctx.stroke();
  }
}

/**
 * A hill or dune line from x0 to x1 around base y, filled down to `bottom`. Returns a
 * function giving the line's height at any x, so pines and houses can stand on it.
 */
export function ridge(ctx, x0, x1, y, amp, freq, seed, fill, bottom) {
  const n = noise1D(seed);
  const at = (x) => y - amp * n((x - x0) * freq + 3, 3, 0.45);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1 + 3; x += 3) ctx.lineTo(x, at(x));
  ctx.lineTo(x1, bottom);
  ctx.closePath();
  ctx.fill();
  return at;
}

/** Scots pines along a line, skipping the spans in `keepClear` ([[x0, x1], ...]). */
export function pineRow(ctx, x0, x1, ground, opts) {
  const rand = rng(opts.seed ?? 5);
  const gap = opts.gap ?? 14;
  ctx.fillStyle = opts.color;
  for (let x = x0; x < x1; x += gap * (0.5 + rand())) {
    const h = opts.hMin + (opts.hMax - opts.hMin) * rand();
    if ((opts.keepClear ?? []).some(([a, b]) => x > a - h * 0.3 && x < b + h * 0.3)) {
      rand();
      continue;
    }
    if (rand() < (opts.shrubs ?? 0.3)) dunePine(ctx, x, ground(x) + 1, h * 0.6, rand);
    else scotsPine(ctx, x, ground(x) + 2, h, rand, opts.lean ?? 0);
  }
}

/**
 * A wood seen from far off: a band of round pine crowns along a ground line, a few taller
 * ones standing out. From a distance pines merge into this; single trees would read as palms.
 */
export function forestBand(ctx, x0, x1, ground, h, color, seed, keepClear = []) {
  const rand = rng(seed);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0, ground(x0) + 2);
  for (let x = x0; x <= x1; x += 3) ctx.lineTo(x, ground(x) - h * 0.25);
  ctx.lineTo(x1, ground(x1) + 2);
  ctx.closePath();
  ctx.fill();
  for (let x = x0; x < x1; x += h * (0.35 + rand() * 0.4)) {
    if (keepClear.some(([a, b]) => x > a && x < b)) continue;
    const tall = rand() < 0.15 ? 1.5 : 1;
    const r = h * (0.28 + rand() * 0.18) * tall;
    const cy = ground(x) - h * 0.3 * tall - r * 0.3;
    ctx.beginPath();
    ctx.ellipse(x, cy, r, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    if (tall > 1) ctx.fillRect(x - 0.6, cy, 1.2, ground(x) - cy);
  }
}

/**
 * The town across the water, laid out once in its own units: x from 0 to 1 along the
 * shore, heights in the same units. Each window has an `order`: when the caller turns
 * the town's lights down, windows go dark in that order, always the same. One window,
 * `kid`, is the son's room: the house stands a little apart at the east end of town.
 */
export function townLayout() {
  const rand = rng(31);
  const houses = [];
  let x = 0.02;
  while (x < 0.8) {
    const kind = rand();
    const w = kind < 0.15 ? 0.11 : 0.045 + rand() * 0.035;
    const wall = kind < 0.15 ? 0.06 : 0.03 + rand() * 0.02;
    const roof = kind < 0.15 ? 0.012 : wall * (0.6 + rand() * 0.4);
    houses.push({ x, w, wall, roof, flat: kind < 0.15, floors: kind < 0.15 ? 4 : wall > 0.042 ? 2 : 1 });
    x += w + 0.004 + rand() * 0.02;
    if (rand() < 0.2) x += 0.03;
  }
  // The church: a red brick nave and a tower with a spire, in the middle of town.
  const church = { x: 0.42, w: 0.07, wall: 0.04, tower: 0.13 };
  const keep = houses.filter((hh) => hh.x + hh.w < church.x - 0.005 || hh.x > church.x + church.w + 0.005);
  // The family's house, apart from the rest, nearer the water.
  const home = { x: 0.88, w: 0.06, wall: 0.042, roof: 0.035, floors: 2, home: true };
  keep.push(home);
  const windows = [];
  for (const hh of keep) {
    const cols = Math.max(1, Math.round(hh.w / 0.022));
    for (let f = 0; f < hh.floors; f++) {
      for (let c = 0; c < cols; c++) {
        if (hh.home) continue;
        if (rand() < 0.35) continue;
        windows.push({
          x: hh.x + (c + 0.5) * (hh.w / cols) - 0.004,
          y: (f + 0.55) * (hh.wall / hh.floors),
          w: 0.008,
          h: 0.009,
          order: rand(),
        });
      }
    }
  }
  windows.sort((a, b) => a.order - b.order).forEach((wn, i) => (wn.order = i));
  // The son's room: upstairs, facing the water. Downstairs is dark: everyone is asleep.
  const kid = { x: home.x + home.w * 0.62, y: home.wall * 0.72, w: 0.009, h: 0.01 };
  const asleep = { x: home.x + home.w * 0.25, y: home.wall * 0.28, w: 0.009, h: 0.01 };
  return { houses: keep, church, home, windows, kid, asleep };
}

/**
 * Paints the town's walls and roofs on a shore line at `base`, `w` px wide starting at
 * x0. `c` holds the colours: wall, roof, dark (for unlit windows), spire.
 */
export function paintTown(ctx, layout, x0, base, w, c) {
  const X = (u) => x0 + u * w;
  const S = (u) => u * w;
  const rand = rng(77);
  // Trees between and behind the houses, so the town sits in green, not on a ruler line.
  ctx.fillStyle = c.trees;
  for (let u = -0.02; u < 1.0; u += 0.025 + rand() * 0.03) {
    const r = S(0.018 + rand() * 0.02);
    ctx.beginPath();
    ctx.ellipse(X(u), base - r * 0.7, r, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const { church } = layout;
  ctx.fillStyle = c.church ?? c.roof;
  ctx.fillRect(X(church.x), base - S(church.wall), S(church.w), S(church.wall));
  poly(ctx, [[X(church.x - 0.004), base - S(church.wall)], [X(church.x + church.w * 0.5), base - S(church.wall + 0.028)], [X(church.x + church.w + 0.004), base - S(church.wall)]]);
  ctx.fillStyle = c.roof;
  ctx.fill();
  const tx = church.x + church.w * 0.72;
  ctx.fillStyle = c.church ?? c.wall;
  ctx.fillRect(X(tx), base - S(church.tower), S(0.018), S(church.tower));
  poly(ctx, [[X(tx - 0.002), base - S(church.tower)], [X(tx + 0.009), base - S(church.tower + 0.06)], [X(tx + 0.02), base - S(church.tower)]]);
  ctx.fillStyle = c.spire ?? c.roof;
  ctx.fill();
  for (const hh of layout.houses) {
    const top = base - S(hh.wall);
    ctx.fillStyle = c.wall;
    ctx.fillRect(X(hh.x), top, S(hh.w), S(hh.wall));
    ctx.fillStyle = hh.flat ? c.flatRoof ?? c.wall : c.roof;
    if (hh.flat) ctx.fillRect(X(hh.x - 0.002), top - S(hh.roof), S(hh.w + 0.004), S(hh.roof));
    else {
      poly(ctx, [[X(hh.x - 0.005), top + 0.5], [X(hh.x + hh.w * 0.5), top - S(hh.roof)], [X(hh.x + hh.w + 0.005), top + 0.5]]);
      ctx.fill();
    }
    if (c.lit) {
      // In daylight the lit side of each roof and wall is a little lighter.
      ctx.fillStyle = c.lit;
      ctx.fillRect(X(hh.x + hh.w * 0.5), top, S(hh.w * 0.5), S(hh.wall));
    }
  }
  ctx.fillStyle = c.dark;
  for (const wn of layout.windows) ctx.fillRect(X(wn.x), base - S(wn.y) - S(wn.h) / 2, Math.max(1, S(wn.w)), Math.max(1, S(wn.h)));
  for (const k of [layout.kid, layout.asleep]) ctx.fillRect(X(k.x), base - S(k.y) - S(k.h) / 2, Math.max(1, S(k.w)), Math.max(1, S(k.h)));
}

/** Where each town window is on screen: [{ x, y, w, h, order }] plus the kid's one. */
export function townWindows(layout, x0, base, w) {
  const place = (wn) => ({ ...wn, x: x0 + (wn.x + wn.w / 2) * w, y: base - wn.y * w, w: Math.max(1, wn.w * w), h: Math.max(1, wn.h * w) });
  return { list: layout.windows.map(place), kid: place(layout.kid) };
}

/** Water: a gradient with faint horizontal streaks, longer nearer the viewer. */
export function water(ctx, x, y, w, h, stops, streak, seed, streakAlpha = 0.1) {
  ctx.fillStyle = vGrad(ctx, y, y + h, stops);
  ctx.fillRect(x, y, w, h);
  const rand = rng(seed);
  for (let i = 0; i < 18 + w / 12; i++) {
    const t = rand() ** 1.3;
    const sy = y + h * t;
    const len = (6 + rand() * 40) * (0.4 + t);
    ctx.fillStyle = css(streak, streakAlpha * (0.5 + rand()));
    ctx.fillRect(x + rand() * w, sy, len, 1);
  }
}

/**
 * The radio mast: a guyed lattice tower painted in red and white bands, narrowing a
 * little toward the top, with a small platform and two dipoles near the top. `c` gives
 * red, white and the night tone mixed into both (`dim`, 0 for daylight, 1 for a black
 * silhouette), and `fog` (0..1) fades it upward into the fog. Returns where the light is.
 */
export function mast(ctx, x, base, top, c) {
  const H = base - top;
  const wb = Math.max(4, H * (c.wide ?? 0.05));
  const wt = Math.max(2, wb * 0.4);
  const bands = 7;
  const at = (t) => [x - (wb + (wt - wb) * t) / 2, x + (wb + (wt - wb) * t) / 2, base - H * t];
  const colorAt = (t, red) => {
    let col = mix(red ? c.red : c.white, c.night, c.dim);
    if (c.fog) col = mix(col, c.fogColor, Math.min(0.9, c.fog * (0.55 + t * 0.35)));
    return col;
  };
  // Guy wires first, behind the tower.
  ctx.lineWidth = 0.6;
  for (const [h0, spread] of [[0.42, 0.42], [0.8, 0.62]]) {
    const [, , gy] = at(h0);
    ctx.strokeStyle = css(colorAt(h0, false), 0.35);
    line(ctx, x, gy, x - H * spread * 0.5, base + H * 0.02);
    line(ctx, x, gy, x + H * spread * 0.5, base + H * 0.02);
  }
  ctx.lineCap = 'round';
  for (let b = 0; b < bands; b++) {
    const t0 = b / bands;
    const t1 = (b + 1) / bands;
    // An odd number of bands, so the top and the bottom are both red, as on real masts.
    ctx.strokeStyle = css(colorAt((t0 + t1) / 2, b % 2 === 0));
    const [l0, r0, y0] = at(t0);
    const [l1, r1, y1] = at(t1);
    ctx.lineWidth = Math.max(1, wb * 0.16);
    line(ctx, l0, y0, l1, y1);
    line(ctx, r0, y0, r1, y1);
    ctx.lineWidth = Math.max(0.6, wb * 0.07);
    const steps = 3;
    for (let s = 0; s < steps; s++) {
      const a = s / steps;
      const b2 = (s + 1) / steps;
      const ya = y0 + (y1 - y0) * a;
      const yb = y0 + (y1 - y0) * b2;
      const la = l0 + (l1 - l0) * a;
      const ra = r0 + (r1 - r0) * a;
      const lb = l0 + (l1 - l0) * b2;
      const rb = r0 + (r1 - r0) * b2;
      line(ctx, la, ya, rb, yb);
      line(ctx, ra, ya, lb, yb);
      line(ctx, la, ya, ra, ya);
    }
  }
  // Platform and dipoles near the top, then the lightning rod the light sits on.
  const [pl, pr, py] = at(0.86);
  ctx.strokeStyle = css(colorAt(0.9, true));
  ctx.lineWidth = Math.max(1, wb * 0.12);
  line(ctx, pl - wb * 0.35, py, pr + wb * 0.35, py);
  const [, , dy] = at(0.93);
  line(ctx, x - wb * 0.7, dy, x + wb * 0.7, dy);
  ctx.lineWidth = Math.max(0.8, wb * 0.08);
  line(ctx, x, top, x, top - H * 0.035);
  return { x, y: top - H * 0.04, H };
}
