// art-drive.js: the 'drive' scene, the dawn drive home along the coast road, without
// words: the sky over the lagoon, the far shore, the water, the road along the near
// shore, pine woods on the dune, and one small car with its headlights still on, moving
// left to right as s.p goes from 0 to 1. Far behind on the left, the mast on its dune.
//
// s.night (1..4) picks the dawn: 1 pink and calm, 2 foggy grey-gold, 3 clear gold, 4 after
// the storm, grey with one break of light.

import { cachedLayer, put, paper, css, mix, rng, poly, line, mark, glowSprite, stamp, blink, clamp, roundRect, vGrad, noise1D, scotsPine } from './art-kit.js';
import { sky, cloudBank, ridge, forestBand } from './art-coast.js';

const DAWNS = {
  1: { sky: ['#3c4674', '#8c6c98', '#e4a2a2', '#f8caa6'], sun: '#fff0d8', sunY: 0.01, water: ['#d8a2a8', '#6c6488'], far: '#6c5a7c', land: '#2e2a44', forest: '#1e1c30', road: '#8a7c8c', haze: 0.15, glint: '#ffe0d0' },
  2: { sky: ['#8a8c88', '#b4ae9a', '#ded0a8', '#e8dcb8'], sun: '#fff6dc', sunY: -0.03, water: ['#d6ccac', '#8a8a80'], far: '#a8a490', land: '#5c5e54', forest: '#40443c', road: '#9a9488', haze: 0.55, fog: '#d4ccb0', glint: '#fff4d8' },
  3: { sky: ['#4672ae', '#94b6d2', '#f0d898', '#f8be62'], sun: '#fff4c8', sunY: -0.02, water: ['#f2cc84', '#4a6a94'], far: '#5a6478', land: '#24304a', forest: '#18233a', road: '#8a8a90', haze: 0.1, glint: '#fff0b0' },
  4: { sky: ['#3a424e', '#5c6670', '#7c858e', '#9aa0a2'], sun: '#ffe8b0', sunY: -0.12, water: ['#7a848c', '#3a444e'], far: '#4a525a', land: '#262c34', forest: '#1a2028', road: '#6a6e74', haze: 0.25, storm: true, glint: '#ffe8b8' },
};

/** Where things are: the horizon, the road, the car's path, all inside the column. */
function layout(view) {
  const { w, h, colW, colX } = view;
  const k = colW / 390;
  return {
    w, h, colW, colX, k,
    horizon: h * 0.46,
    shore: h * 0.6,
    road: h * 0.645,
    sunX: colX + colW * 0.66,
    carLen: colW * 0.16,
  };
}

export function paintDrive(ctx, view, t, s, dpr) {
  const night = DAWNS[s.night] ? s.night : 1;
  const D = DAWNS[night];
  const L = layout(view);
  const bg = cachedLayer(`drive-${night}`, view, dpr, (g) => {
    L.mast = landscape(g, L, D);
    paper(g, view.w, view.h, 40 + night, 0.9);
  });
  put(ctx, bg, view);
  shimmer(ctx, L, D, t);
  gulls(ctx, L, t, night);
  // The station's light, far back on the left, still blinking.
  const ml = mastLight(L);
  stamp(ctx, glowSprite('#ff4030'), ml.x, ml.y, 5 * L.k, 0.8 * blink(t));
  const p = clamp(s.p ?? 0);
  const x = L.colX + L.colW * 0.05 + (L.colW * 0.9 - L.carLen) * p;
  const y = roadY(L, x + L.carLen / 2);
  car(ctx, x, y, L.carLen, D, t, p);
  mark('car', x - 2, y - L.carLen * 0.45, L.carLen + 4, L.carLen * 0.5, 'high');
  return { car: { x, y: y - L.carLen * 0.42, w: L.carLen, h: L.carLen * 0.42 } };
}

/** The road's line: a gentle rise and fall along the shore. */
function roadY(L, x) {
  return L.road + Math.sin((x - L.colX) / L.colW * 2.2 + 0.6) * L.h * 0.006;
}

function mastLight(L) {
  return { x: L.colX + L.colW * 0.1, y: L.horizon - L.h * 0.07 };
}

function landscape(g, L, D) {
  const { w, h, horizon, shore } = L;
  sky(g, 0, 0, w, horizon + 2, D.sky);
  // The sun's glow low on the horizon (in the storm, behind the break in the clouds).
  const sx = L.sunX;
  const sy = horizon + h * D.sunY;
  const glowR = L.colW * (D.storm ? 0.5 : 0.9);
  const sg = g.createRadialGradient(sx, sy, 0, sx, sy, glowR);
  sg.addColorStop(0, css(D.sun, D.storm ? 0.55 : 0.8));
  sg.addColorStop(0.3, css(D.sun, 0.25));
  sg.addColorStop(1, css(D.sun, 0));
  g.fillStyle = sg;
  g.fillRect(0, 0, w, horizon + 2);
  if (!D.storm && D.sunY > -0.025) {
    g.fillStyle = css(D.sun, 0.95);
    g.beginPath();
    g.arc(sx, horizon, L.colW * 0.045, Math.PI, 0);
    g.fill();
  }
  if (D.storm) stormSky(g, L, D);
  else {
    // Thin bands of cloud catching the light from below.
    cloudBank(g, -20, w + 20, h * 0.12, h * 0.17, mix(D.sky[1], D.sky[0], 0.3), 11, D.sun, 0.55);
    cloudBank(g, -20, w + 20, h * 0.26, h * 0.3, mix(D.sky[1], D.sky[2], 0.4), 12, D.sun, 0.4);
  }
  // The far shore across the lagoon: low land and woods, hazy.
  const far = ridge(g, -10, w + 10, horizon, h * 0.012, 0.012, 7, css(mix(D.far, D.sky[3], D.haze)), horizon + 4);
  forestBand(g, -10, w + 10, (x) => far(x) + 1, h * 0.012, css(mix(D.far, D.sky[3], D.haze)), 9);
  // The spit behind us on the left: a dune with the mast on it.
  const spitTop = (x) => horizon - h * 0.025 * Math.max(0, 1 - Math.abs(x - (L.colX + L.colW * 0.1)) / (L.colW * 0.45));
  g.fillStyle = css(mix(D.far, D.sky[3], D.haze * 0.6));
  g.beginPath();
  g.moveTo(-10, horizon + 3);
  for (let x = -10; x <= L.colX + L.colW * 0.6; x += 3) g.lineTo(x, spitTop(x));
  g.lineTo(L.colX + L.colW * 0.6, horizon + 3);
  g.fill();
  const ml = mastLight(L);
  g.strokeStyle = css(mix(D.far, D.sky[3], D.haze * 0.4));
  g.lineWidth = 1;
  line(g, ml.x, spitTop(ml.x), ml.x, ml.y);
  line(g, ml.x - 1.5, spitTop(ml.x), ml.x, ml.y + 6);
  line(g, ml.x + 1.5, spitTop(ml.x), ml.x, ml.y + 6);
  mark('far mast', ml.x - 3, ml.y - 3, 6, spitTop(ml.x) - ml.y + 3, 'high');
  // The lagoon, mirroring the sky, with the sun's path on it.
  g.fillStyle = vGrad(g, horizon, shore, D.water);
  g.fillRect(0, horizon + 2, w, shore - horizon);
  const rand = rng(5);
  for (let i = 0; i < 60; i++) {
    const v = rand() ** 1.4;
    const y = horizon + 3 + (shore - horizon) * v;
    g.fillStyle = css('#ffffff', 0.06 + rand() * 0.06);
    g.fillRect(rand() * w, y, (8 + rand() * 40) * (0.4 + v), 1);
  }
  const path = D.storm ? L.colX + L.colW * 0.3 : sx;
  for (let y = horizon + 3; y < shore; y += 2.5) {
    const v = (y - horizon) / (shore - horizon);
    const spread = L.colW * (0.03 + v * 0.14);
    const wdt = spread * (0.3 + rand() * 0.8);
    g.fillStyle = css(D.sun, (D.storm ? 0.35 : 0.5) * (1 - v * 0.6));
    g.fillRect(path - wdt / 2 + (rand() - 0.5) * spread, y, wdt, 1.2);
  }
  // Reeds and sand along the near shore, the road on its bank, then the pine wood.
  const n = noise1D(3);
  g.fillStyle = css(mix(D.land, D.sky[2], 0.25));
  g.beginPath();
  g.moveTo(0, h);
  for (let x = -5; x <= w + 5; x += 4) g.lineTo(x, shore - n(x * 0.02) * h * 0.012);
  g.lineTo(w, h);
  g.fill();
  g.strokeStyle = css(mix(D.land, D.sky[2], 0.1), 0.8);
  g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x < w; x += 2 + rand() * 3) {
    const base = shore + h * 0.012;
    const len = h * (0.008 + rand() * 0.016);
    g.moveTo(x, base);
    g.quadraticCurveTo(x + 1, base - len * 0.6, x + 2 + rand() * 2, base - len);
  }
  g.stroke();
  g.fillStyle = css(mix(D.road, D.sky[2], 0.15));
  g.beginPath();
  g.moveTo(-5, roadY(L, -5) - 2);
  for (let x = -5; x <= w + 5; x += 4) g.lineTo(x, roadY(L, x) - 2);
  for (let x = w + 5; x >= -5; x -= 4) g.lineTo(x, roadY(L, x) + h * 0.012);
  g.fill();
  g.strokeStyle = css('#f0e8d8', 0.35);
  g.setLineDash([6, 8]);
  g.beginPath();
  for (let x = -5; x <= w + 5; x += 4) (x === -5 ? g.moveTo(x, roadY(L, x) + h * 0.005) : g.lineTo(x, roadY(L, x) + h * 0.005));
  g.stroke();
  g.setLineDash([]);
  // The wood below the road in three layers, each nearer one darker, like a painted stage.
  const layers = [[0.045, 0.04, 0], [0.11, 0.05, 0.25], [0.2, 0.06, 0.5]];
  layers.forEach(([drop, size, dark], i) => {
    const top = (x) => roadY(L, x) + h * drop + n(x * 0.01 + 5 + i * 3) * h * 0.012;
    const c = mix(D.forest, '#000000', dark);
    g.fillStyle = css(c);
    g.beginPath();
    g.moveTo(-5, h);
    for (let x = -5; x <= w + 5; x += 4) g.lineTo(x, top(x));
    g.lineTo(w + 5, h);
    g.fill();
    forestBand(g, -10, w + 10, top, h * size, css(c), 21 + i);
  });
  // Two tall pines at the far edges, framing the road.
  const r2 = rng(6);
  g.fillStyle = css(mix(D.forest, '#000000', 0.45));
  for (const u of [-0.1, 1.08]) scotsPine(g, L.colX + L.colW * u, h * 0.9, h * 0.34, r2, u < 0.5 ? 0.05 : -0.05);
  if (D.fog) {
    // Fog lying on the water and over the far shore, thinning upward.
    const f = g.createLinearGradient(0, horizon - h * 0.12, 0, shore + h * 0.04);
    f.addColorStop(0, css(D.fog, 0));
    f.addColorStop(0.45, css(D.fog, 0.6));
    f.addColorStop(1, css(D.fog, 0.15));
    g.fillStyle = f;
    g.fillRect(0, horizon - h * 0.12, w, shore - horizon + h * 0.16);
  }
}

/** After the storm: low heavy cloud over everything but one gap, and light falling through it. */
function stormSky(g, L, D) {
  const { w, h, horizon } = L;
  const gap = { x: L.colX + L.colW * 0.3, y: h * 0.25 };
  g.save();
  g.globalCompositeOperation = 'screen';
  const rays = g.createLinearGradient(0, gap.y, 0, horizon + h * 0.1);
  rays.addColorStop(0, css(D.sun, 0.35));
  rays.addColorStop(1, css(D.sun, 0));
  g.fillStyle = rays;
  for (const [a, b] of [[-0.12, -0.05], [-0.02, 0.05], [0.08, 0.14]]) {
    poly(g, [[gap.x + a * L.colW * 0.3, gap.y], [gap.x + b * L.colW * 0.3, gap.y], [gap.x + b * L.colW * 1.6, horizon + h * 0.12], [gap.x + a * L.colW * 1.6, horizon + h * 0.12]]);
    g.fill();
  }
  g.restore();
  const glow = g.createRadialGradient(gap.x, gap.y, 0, gap.x, gap.y, L.colW * 0.22);
  glow.addColorStop(0, css('#fff2cc', 0.9));
  glow.addColorStop(1, css('#fff2cc', 0));
  g.fillStyle = glow;
  g.fillRect(gap.x - L.colW * 0.22, gap.y - L.colW * 0.22, L.colW * 0.44, L.colW * 0.44);
  // Cloud everywhere else: low dark banks, lit along their edges near the gap.
  const dark = '#3c444e';
  cloudBank(g, -20, w + 20, -20, h * 0.2, dark, 31, null, 0.95);
  cloudBank(g, -20, gap.x - L.colW * 0.13, h * 0.17, h * 0.28, '#4a525c', 32, '#f0dcb0', 0.95);
  cloudBank(g, gap.x + L.colW * 0.15, w + 20, h * 0.18, h * 0.29, '#4a525c', 33, '#f0dcb0', 0.95);
  cloudBank(g, -20, w + 20, h * 0.31, h * 0.4, '#535b64', 34, '#e8d4a8', 0.9);
}

/** A few glints on the water drifting, and the sun's path breaking and closing. */
function shimmer(ctx, L, D, t) {
  const rand = rng(9);
  ctx.fillStyle = css(D.glint, 0.7);
  for (let i = 0; i < 18; i++) {
    const v = rand();
    const y = L.horizon + 4 + (L.shore - L.horizon - 8) * v;
    const x = (D.storm ? L.colX + L.colW * 0.3 : L.sunX) + (rand() - 0.5) * L.colW * (0.1 + v * 0.35);
    const a = Math.sin(t * (0.6 + rand()) + rand() * 6.28);
    if (a < 0.5) continue;
    ctx.globalAlpha = (a - 0.5) * 2 * 0.6;
    ctx.fillRect(x + Math.sin(t * 0.3 + i) * 2, y, 2 + v * 5, 1);
  }
  ctx.globalAlpha = 1;
}

/** Two gulls gliding slowly across, wings rising and falling. */
function gulls(ctx, L, t, night) {
  if (night === 2) return;
  ctx.strokeStyle = css('#2a2a36', 0.6);
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';
  for (const [i, sp] of [[0, 9], [1, 7]]) {
    const span = L.colW * 1.3;
    const x = L.colX - L.colW * 0.15 + ((t * sp + i * 160) % span);
    const y = L.h * (0.2 + i * 0.05) + Math.sin(t * 0.5 + i) * 6;
    const flap = Math.sin(t * 3 + i * 2) * 2.5;
    const s = 5 * L.k;
    ctx.beginPath();
    ctx.moveTo(x - s, y - flap);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.5 - flap * 0.5, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.5 - flap * 0.5, x + s, y - flap);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

/**
 * The car, side on, going right: a small old hatchback, dark against the dawn, its
 * headlights still on and throwing a soft beam ahead, a red light behind.
 */
function car(ctx, x, y, len, D, t, p) {
  const hgt = len * 0.36;
  const body = mix('#2c3442', D.sky[2], 0.12);
  const wheel = len * 0.1;
  // The beam ahead along the road.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const beam = ctx.createLinearGradient(x + len, 0, x + len * 2.2, 0);
  beam.addColorStop(0, css('#ffe6b0', 0.32));
  beam.addColorStop(1, css('#ffe6b0', 0));
  ctx.fillStyle = beam;
  poly(ctx, [[x + len * 0.97, y - hgt * 0.5], [x + len * 2.2, y - hgt * 0.75], [x + len * 2.2, y + hgt * 0.15], [x + len * 0.97, y - hgt * 0.32]]);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = css('#000000', 0.28);
  ctx.beginPath();
  ctx.ellipse(x + len / 2, y + 1, len * 0.52, wheel * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body and cabin.
  ctx.fillStyle = css(body);
  roundRect(ctx, x, y - hgt * 0.62, len, hgt * 0.5, hgt * 0.14);
  ctx.fill();
  poly(ctx, [[x + len * 0.18, y - hgt * 0.6], [x + len * 0.3, y - hgt], [x + len * 0.68, y - hgt], [x + len * 0.84, y - hgt * 0.6]]);
  ctx.fill();
  // Windows, with the dawn in them, and the driver a dark shape.
  ctx.fillStyle = css(mix(D.sky[2], body, 0.45));
  poly(ctx, [[x + len * 0.23, y - hgt * 0.64], [x + len * 0.32, y - hgt * 0.93], [x + len * 0.47, y - hgt * 0.93], [x + len * 0.47, y - hgt * 0.64]]);
  ctx.fill();
  poly(ctx, [[x + len * 0.5, y - hgt * 0.64], [x + len * 0.5, y - hgt * 0.93], [x + len * 0.66, y - hgt * 0.93], [x + len * 0.79, y - hgt * 0.64]]);
  ctx.fill();
  ctx.fillStyle = css(body);
  ctx.beginPath();
  ctx.ellipse(x + len * 0.58, y - hgt * 0.76, len * 0.035, hgt * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + len * 0.54, y - hgt * 0.68, len * 0.09, hgt * 0.06);
  // A light edge along the roof from the sky.
  ctx.strokeStyle = css(D.sky[3], 0.5);
  ctx.lineWidth = 1;
  line(ctx, x + len * 0.3, y - hgt + 0.5, x + len * 0.68, y - hgt + 0.5);
  // Wheels, turning.
  const turn = p * 40;
  for (const wx of [x + len * 0.22, x + len * 0.79]) {
    ctx.fillStyle = css('#14161c');
    ctx.beginPath();
    ctx.arc(wx, y - wheel * 0.9, wheel, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css('#6a6e78');
    ctx.lineWidth = Math.max(0.8, wheel * 0.18);
    line(ctx, wx - Math.cos(turn) * wheel * 0.5, y - wheel * 0.9 - Math.sin(turn) * wheel * 0.5, wx + Math.cos(turn) * wheel * 0.5, y - wheel * 0.9 + Math.sin(turn) * wheel * 0.5);
  }
  // Headlight and tail light.
  stamp(ctx, glowSprite('#ffeec8'), x + len, y - hgt * 0.42, len * 0.16, 0.9);
  ctx.fillStyle = css('#fff6e0');
  ctx.fillRect(x + len - 2, y - hgt * 0.5, 2.5, hgt * 0.14);
  stamp(ctx, glowSprite('#ff3a2c'), x, y - hgt * 0.42, len * 0.09, 0.7);
  ctx.fillStyle = css('#e03a2a');
  ctx.fillRect(x - 0.5, y - hgt * 0.5, 2, hgt * 0.12);
}
