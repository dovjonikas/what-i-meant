// art-room-outside.js: what the station window looks out on, in five looks: the sky, the
// far shore with the town, the water, the near dune with its pines, and the mast just
// outside. Painted once per look and screen size; art-room.js adds the moving parts and
// needs to know where the town's windows and the mast's light ended up (outsideGeo).

import { css, mix, rng, mark, noise1D, glow } from './art-kit.js';
import { sky, stars, dipperStars, paintDipper, moon, clouds, ridge, pineRow, townLayout, paintTown, townWindows, water, mast } from './art-coast.js';

// Each look keeps a small palette: the night's blues (or the dusk's violets), the warm of
// lit windows and the mast's red. `room` is the colour the room sinks into with the lamp
// off; `edge` is the window's light on the frame.
export const MOODS = {
  calm: {
    sky: ['#070e24', '#101d42', '#22355c'],
    stars: 26,
    veil: true,
    shore: '#0b1328',
    town: { wall: '#111a30', roof: '#1f1626', church: '#141a2c', spire: '#1b1524', trees: '#0a1224', dark: '#0a0f1e' },
    water: ['#1a2a50', '#0b1530'],
    streak: '#7088c0',
    dune: '#070c18',
    pines: '#050912',
    mast: { red: '#9a2c2a', white: '#8e98b4', night: '#0a1020', dim: 0.76 },
    windowLight: '#ffc46a',
    reflect: 14,
    room: '#111a38',
    edge: '#3e5482',
    rain: 'dots',
  },
  fog: {
    sky: ['#2c3836', '#43514c', '#56645d'],
    stars: 0,
    fog: '#5c6a63',
    shore: '#4e5b55',
    town: { wall: '#4c5852', roof: '#52504e', church: '#4c5650', spire: '#4e544f', trees: '#4a5650', dark: '#46524c' },
    water: ['#4e5c56', '#2e3a37'],
    streak: '#8a9890',
    dune: '#1e2826',
    pines: '#182220',
    mast: { red: '#7a3632', white: '#8a948e', night: '#26302d', dim: 0.45, fog: 1, fogColor: '#55635c' },
    windowLight: '#ffd28e',
    reflect: 0,
    room: '#192222',
    edge: '#5c6c66',
    rain: 'dots',
  },
  clear: {
    sky: ['#0d0a2a', '#1b1d50', '#353b7a'],
    stars: 300,
    dipper: true,
    moon: true,
    shore: '#0d1030',
    town: { wall: '#141634', roof: '#25162e', church: '#181a36', spire: '#20162c', trees: '#0e1230', dark: '#0e1028' },
    water: ['#2a3070', '#0f1338'],
    streak: '#8c94dc',
    dune: '#080a1e',
    pines: '#060716',
    mast: { red: '#a03030', white: '#a0a6c8', night: '#0c0e24', dim: 0.72 },
    windowLight: '#ffc870',
    reflect: 28,
    room: '#17183a',
    edge: '#4c4e92',
    rain: null,
  },
  storm: {
    sky: ['#04070e', '#0b111f', '#19212f'],
    stars: 0,
    clouds: true,
    shore: '#0b101c',
    town: { wall: '#0f1522', roof: '#18131c', church: '#111622', spire: '#15121a', trees: '#0b101b', dark: '#0b0f19' },
    water: ['#141c2c', '#060a12'],
    streak: '#5a6a88',
    dune: '#04070d',
    pines: '#03050a',
    mast: { red: '#7a2626', white: '#76809a', night: '#080c16', dim: 0.8 },
    windowLight: '#ffbe66',
    reflect: 0,
    room: '#0d1220',
    edge: '#2c3850',
    rain: 'streaks',
  },
  evening: {
    sky: ['#231f52', '#4f3b78', '#a45e86', '#ee9a5c'],
    stars: 8,
    shore: '#2a1c3a',
    town: { wall: '#4a3448', roof: '#7a3236', church: '#5a3036', spire: '#3c2a3e', trees: '#2a2238', dark: '#2c2032', flatRoof: '#3e2c40' },
    water: ['#c47a6e', '#3e3460'],
    streak: '#ffd0a0',
    dune: '#1b1430',
    pines: '#140e25',
    mast: { red: '#c8463a', white: '#e8dce0', night: '#2a2040', dim: 0.3 },
    windowLight: '#ffcb78',
    reflect: 16,
    room: '#2a2444',
    edge: '#e8a07c',
    rain: null,
  },
};

const LAYOUT = townLayout();

/** Where the shore, the dune, the town's windows and the mast's light are, for a layout. */
export function outsideGeo(L) {
  const G = L.glass;
  const shoreY = G.y + G.h * 0.6;
  const town = { x0: G.x + G.w * 0.2, w: G.w * 0.46 };
  const n = noise1D(12);
  const duneAt = (x) => {
    const rel = Math.min(1.2, Math.max(-0.4, (x - G.x) / G.w));
    const rise = 1 / (1 + Math.exp(-(rel - 0.62) * 9));
    return G.y + G.h * (0.86 - 0.12 * rise) - n(x * 0.02, 3) * G.h * 0.035;
  };
  // The mast stands just outside, in front of the dune: its foot is below the sill.
  const mx = G.x + G.w * 0.72;
  const mastBase = G.y + G.h + 30 * L.k;
  const mastTop = G.y + G.h * 0.1;
  const H = mastBase - mastTop;
  return {
    shoreY,
    duneTop: G.y + G.h * 0.8,
    duneAt,
    town,
    mast: { x: mx, base: mastBase, top: mastTop },
    light: { x: mx, y: mastTop - H * 0.04 },
    windows: townWindows(LAYOUT, town.x0, shoreY, town.w),
  };
}

/** Paints the view out of the window. Returns the same geometry as outsideGeo. */
export function paintOutside(ctx, L, M) {
  const geo = outsideGeo(L);
  const G = L.glass;
  const { w } = L;
  const top = L.headY;
  const bottom = L.sillY + 4;
  const fog = M.fog;
  const hazy = (c, amount) => (fog ? mix(c, fog, amount) : c);

  sky(ctx, 0, top, w, geo.shoreY - top + 2, M.sky);
  if (M.stars) stars(ctx, 0, top, w, geo.shoreY - top - 8, Math.round((M.stars * w) / 430), 4, 1);
  if (M.clouds) {
    clouds(ctx, -40, w + 40, G.y + G.h * 0.12, G.h * 0.25, '#1a2232', '#3a4458', 3, 0.9, 18);
    clouds(ctx, -40, w + 40, G.y + G.h * 0.4, G.h * 0.2, '#0e1420', null, 9, 0.8, 16);
  }
  if (M.veil) {
    // Thin rain clouds drifting over a few stars.
    clouds(ctx, -40, w + 40, G.y + G.h * 0.18, G.h * 0.22, '#1c2a4c', '#2c3c62', 6, 0.35, 12);
    clouds(ctx, -40, w + 40, G.y + G.h * 0.42, G.h * 0.14, '#18264a', null, 2, 0.3, 10);
  }
  // The town's own light, a faint warm haze on the sky above it.
  const haze = ctx.createRadialGradient(geo.town.x0 + geo.town.w * 0.5, geo.shoreY, 0, geo.town.x0 + geo.town.w * 0.5, geo.shoreY, geo.town.w * 0.8);
  haze.addColorStop(0, css(M.windowLight, M === MOODS.evening ? 0 : 0.12));
  haze.addColorStop(1, css(M.windowLight, 0));
  ctx.fillStyle = haze;
  ctx.fillRect(geo.town.x0 - geo.town.w * 0.3, geo.shoreY - geo.town.w * 0.8, geo.town.w * 1.6, geo.town.w * 0.8);
  if (M.dipper) {
    const pts = dipperStars(G.x + G.w * 0.47, G.y + G.h * 0.11, Math.min(G.w * 0.024, G.h * 0.034), 0);
    paintDipper(ctx, pts, 0.95);
    for (const p of pts) mark(`star ${p.name}`, p.x - 2, p.y - 2, 4, 4, 'room');
  }
  if (M.moon) moon(ctx, G.x + G.w * 0.9, G.y + G.h * 0.22, 7 * L.k, '#f4ecd2');
  if (M === MOODS.evening) {
    // The evening star, low over the town, the first light in the sky.
    glow(ctx, G.x + G.w * 0.16, G.y + G.h * 0.3, 6, '#fff4e0', 0.5);
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(G.x + G.w * 0.16 - 1, G.y + G.h * 0.3 - 1, 2, 2);
  }

  // The far shore: low land with a line of woods, and the town on it.
  const rand = rng(3);
  const shoreFill = css(hazy(M.shore, 0.7));
  const land = ridge(ctx, -10, w + 10, geo.shoreY + 1, 5 * L.k, 0.01, 21, shoreFill, geo.shoreY + 8);
  ctx.fillStyle = shoreFill;
  for (let x = -10; x < w + 10; x += 3 + rand() * 5) {
    if (x > geo.town.x0 - 6 && x < geo.town.x0 + geo.town.w + 4) continue;
    const r = (2 + rand() * 3.5) * L.k;
    ctx.beginPath();
    ctx.ellipse(x, land(x) - r * 0.4, r, r * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const tc = M.town;
  const townColors = fog
    ? Object.fromEntries(Object.entries(tc).map(([k2, v]) => [k2, css(hazy(v, 0.55))]))
    : Object.fromEntries(Object.entries(tc).map(([k2, v]) => [k2, css(v)]));
  paintTown(ctx, LAYOUT, geo.town.x0, geo.shoreY + 1, geo.town.w, townColors);
  mark('town', geo.town.x0 - 4, geo.shoreY - geo.town.w * 0.2, geo.town.w + 8, geo.town.w * 0.2 + 2, 'room');

  water(ctx, 0, geo.shoreY + 1, w, bottom - geo.shoreY, M.water.map((c) => hazy(c, 0.4)), M.streak, 8, M === MOODS.storm ? 0.06 : 0.12);
  if (M === MOODS.evening || M === MOODS.clear) {
    // The brightest part of the sky lies on the water as a soft band.
    const band = ctx.createLinearGradient(0, geo.shoreY, 0, geo.shoreY + G.h * 0.12);
    band.addColorStop(0, css(M.sky[M.sky.length - 1], 0.45));
    band.addColorStop(1, css(M.sky[M.sky.length - 1], 0));
    ctx.fillStyle = band;
    ctx.fillRect(0, geo.shoreY + 1, w, G.h * 0.12);
  }

  // The near dune, the mast standing on it, and pines either side.
  if (fog) {
    const veil = ctx.createLinearGradient(0, top, 0, geo.shoreY + 20);
    veil.addColorStop(0, css(fog, 0.1));
    veil.addColorStop(1, css(fog, 0.55));
    ctx.fillStyle = veil;
    ctx.fillRect(0, top, w, geo.shoreY + 20 - top);
  }
  ctx.fillStyle = css(M.dune);
  ctx.beginPath();
  ctx.moveTo(-10, bottom);
  for (let x = -10; x <= w + 13; x += 3) ctx.lineTo(x, geo.duneAt(x));
  ctx.lineTo(w + 10, bottom);
  ctx.closePath();
  ctx.fill();
  // A faint lighter edge where the dune meets the sky's glow.
  ctx.strokeStyle = css(mix(M.dune, M.sky[M.sky.length - 1], 0.35), 0.6);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -10; x <= w + 13; x += 3) (x === -10 ? ctx.moveTo(x, geo.duneAt(x)) : ctx.lineTo(x, geo.duneAt(x)));
  ctx.stroke();
  pineRow(ctx, -20, w + 20, geo.duneAt, {
    seed: 14,
    color: css(M.pines),
    gap: 22 * L.k,
    hMin: G.h * 0.1,
    hMax: G.h * 0.3,
    shrubs: 0.35,
    // Keep the mast, the town's view and the drawing's corner clear of trees.
    keepClear: [[G.x - 10, G.x + G.w * 0.83]],
  });
  duneGrass(ctx, geo.duneAt, w, mix(M.dune, M.sky[M.sky.length - 1], 0.18), L.k);
  const light = mast(ctx, geo.mast.x, geo.mast.base, geo.mast.top, { ...M.mast, wide: 0.07 });
  const half = (geo.mast.base - geo.mast.top) * 0.04 + 2;
  mark('mast', geo.mast.x - half, light.y - 3, half * 2, L.sillY - light.y + 3, 'room');
  if (fog) {
    const veil = ctx.createLinearGradient(0, geo.shoreY - 30, 0, bottom);
    veil.addColorStop(0, css(fog, 0.25));
    veil.addColorStop(1, css(fog, 0.1));
    ctx.fillStyle = veil;
    ctx.fillRect(0, geo.shoreY - 30, w, bottom - geo.shoreY + 30);
  }
  return geo;
}

/** Marram grass along the top of the dune: thin blades, leaning with the sea wind. */
function duneGrass(ctx, at, w, color, k) {
  const rand = rng(19);
  ctx.strokeStyle = css(color, 0.8);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let x = -10; x < w + 10; x += 2 + rand() * 4) {
    const y = at(x) + 1.5;
    const n = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const len = (3 + rand() * 6) * k;
      const lean = (0.3 + rand() * 0.5) * len;
      ctx.moveTo(x + i, y);
      ctx.quadraticCurveTo(x + i + lean * 0.3, y - len * 0.6, x + i + lean, y - len);
    }
  }
  ctx.stroke();
}

/**
 * Fog banks for the fog look: soft, wide and see-through, painted so the left and right
 * edges join, which lets art-room.js slide two copies along for drifting fog.
 */
export function fogLayer(c, L, M) {
  const rand = rng(44);
  const G = L.glass;
  const W = L.w;
  for (let i = 0; i < 26; i++) {
    const x = rand() * W;
    const y = G.y + G.h * (0.2 + rand() * 0.7);
    const rw = G.w * (0.25 + rand() * 0.45);
    const rh = G.h * (0.04 + rand() * 0.07);
    for (const dx of [0, -W, W]) {
      const g = c.createRadialGradient(x + dx, y, 0, x + dx, y, rw);
      g.addColorStop(0, css(M.fog, 0.22));
      g.addColorStop(1, css(M.fog, 0));
      c.save();
      c.translate(x + dx, y);
      c.scale(1, rh / rw);
      c.translate(-(x + dx), -y);
      c.fillStyle = g;
      c.fillRect(x + dx - rw, y - rw, rw * 2, rw * 2);
      c.restore();
    }
  }
}
