// art-room.js: the 'room' scene, inside the station at night, looking out of the long
// window at the mast, the water and the town. Five looks (s.mood): calm, fog, clear,
// storm and evening. The still parts are painted once into cached layers; each frame adds
// what moves: the town's windows as the caller lights them, the son's window, the mast's
// light, fog, waves, lightning, the lamp and the clock. The parts have their own files:
// art-room-outside.js (the view), art-room-glass.js (the window glass), art-room-inside.js
// and art-room-desk.js (the room and the desk), art-room-life.js (deer, moths, boats) and
// art-cat.js (the cat).
//
// Everything that matters sits between the buttons (y = 60) and the top of the radio
// console (y = 0.56 h); the desk runs on below so the console stands on it.

import { cachedLayer, put, glowSprite, stamp, css, mix, rng, mark, paper, blink, clamp, poly } from './art-kit.js';
import { paintInside } from './art-room-inside.js';
import { paintOutside, outsideGeo, fogLayer, MOODS } from './art-room-outside.js';
import { paintDeer, paintMoths, paintTow, windowSpill } from './art-room-life.js';
import { paintCat } from './art-cat.js';
import { paintSteam } from './art-room-desk.js';
import { glassEffects } from './art-room-glass.js';

const TOP = 60;
const geos = new Map();

/** Where the town's windows and the mast's light are: worked out once per screen size. */
function geoFor(L) {
  const key = `${L.w}x${L.h}|${L.colX}`;
  if (!geos.has(key)) {
    if (geos.size > 6) geos.clear();
    geos.set(key, outsideGeo(L));
  }
  return geos.get(key);
}

/** Where everything in the room is, in CSS pixels, for this screen. */
export function roomLayout(view) {
  const { w, h, colW, colX } = view;
  const bottom = 0.56 * h;
  const Z = bottom - TOP;
  const U = (u) => colX + u * colW;
  const Y = (z) => TOP + z * Z;
  const k = Math.min(colW / 390, Z / 412);
  const post = Math.max(8, 12 * k);
  const p0 = U(0.03);
  const p1 = U(0.97);
  const step = p1 - p0;
  const posts = [];
  for (let x = p0; x > -step; x -= step) posts.unshift(x);
  for (let x = p1; x < w + step; x += step) posts.push(x);
  const headY = Y(0.165);
  const glassY = Y(0.19);
  const sillY = Y(0.835);
  const panes = [];
  for (let i = 0; i < posts.length - 1; i++) panes.push({ x: posts[i] + post / 2, y: glassY, w: posts[i + 1] - posts[i] - post, h: sillY - glassY });
  const glass = { x: p0 + post / 2, y: glassY, w: step - post, h: sillY - glassY };
  const dw = colW * 0.24;
  const dh = dw * 0.76;
  const lampBase = [U(0.875), Y(0.965)];
  return {
    w, h, k, colW, colX, U, Y, Z, bottom,
    post, posts, panes, glass, headY, glassY, sillY,
    sillTopH: Math.max(4, 7 * k),
    sillFront: Math.max(3, 5 * k),
    deskY: Y(0.885),
    cork: { x: U(0.07), y: Y(0.02), w: colW * 0.28, h: Math.min(Z * 0.125, colW * 0.15) },
    clock: { x: U(0.72), y: Y(0.04), w: colW * 0.19, h: Math.min(Z * 0.08, colW * 0.085) },
    drawing: { x: U(0.05), y: sillY - dh + 2 * k, w: dw, h: dh, angle: -0.035 },
    mug: { x: U(0.22), y: Y(0.975) - 27 * k, w: 21 * k, h: 27 * k },
    thermos: { x: U(0.055), base: Y(0.975), w: 15 * k, h: 46 * k },
    headset: { x: U(0.47), y: Y(0.03), r: 12 * k },
    binoculars: { x: U(0.48), y: sillY + Math.max(4, 7 * k) * 0.7, w: 24 * k },
    book: { x: U(0.4), y: Y(0.905), w: colW * 0.27, h: Z * 0.085 },
    lamp: {
      base: lampBase,
      baseR: 17 * k,
      elbow: [U(0.95), Y(0.79)],
      pivot: [U(0.795), Y(0.735)],
      mouth: [U(0.745), Y(0.8)],
      shadeR: 15 * k,
      arm: Math.max(1.6, 2.6 * k),
      pool: [U(0.56), Y(0.985)],
    },
  };
}

/** Paints the room and returns its hit areas. */
export function paintRoom(ctx, view, t, s, dpr) {
  const mood = MOODS[s.mood] ? s.mood : 'calm';
  const M = MOODS[mood];
  const L = roomLayout(view);
  const lamp = clamp(s.lamp ?? 1);
  const flash = clamp(s.flash ?? 0);
  const town = clamp(s.town ?? 1);
  const kid = clamp(s.kid ?? 0);

  const outside = cachedLayer(`room-out-${mood}`, view, dpr, (g) => {
    paintOutside(g, L, M);
    paper(g, view.w, view.h, 3);
  });
  L.out = geoFor(L);
  put(ctx, outside, view);

  movingOutside(ctx, L, M, t, view, dpr, mood);
  townLights(ctx, L, M, town, kid, t, mood);
  mastLight(ctx, L, M, t, mood);
  windowSpill(ctx, L, lamp);
  paintTow(ctx, L, t, s, mood);
  if (flash > 0.01) lightning(ctx, L, flash, t);
  const deerHits = paintDeer(ctx, L, M, t, s, mood);
  glassEffects(ctx, L, M, t, view, dpr, mood, lamp);

  const dark = cachedLayer(`room-dark-${mood}`, view, dpr, (g) => {
    paintInside(g, L, M, false);
    paper(g, view.w, view.h, 5);
  });
  const lit = cachedLayer(`room-lit-${mood}`, view, dpr, (g) => {
    paintInside(g, L, M, true);
    paper(g, view.w, view.h, 5);
    lampFalloff(g, L);
  });
  put(ctx, dark, view);
  put(ctx, lit, view, lamp);
  paintSteam(ctx, L, t, lamp);
  const catHits = paintCat(ctx, L, M, t, s, mood);
  if (lamp > 0.01) lampGlow(ctx, L, lamp, view, dpr);
  paintMoths(ctx, L, t, s, mood);
  clockDigits(ctx, L, s.clock ?? '', lamp);
  if (flash > 0.01) {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = css('#8fa4d8', flash * 0.22);
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.globalCompositeOperation = 'source-over';
  }

  const lp = L.lamp;
  const hit = {
    lamp: { x: (lp.pivot[0] + lp.mouth[0]) / 2, y: (lp.pivot[1] + lp.mouth[1]) / 2, r: Math.max(26, 30 * L.k) },
    drawing: { x: L.drawing.x, y: L.drawing.y, w: L.drawing.w, h: L.drawing.h },
    window: { ...L.glass },
    ...deerHits,
    ...catHits,
  };
  mark('window', L.glass.x, L.glass.y, L.glass.w, L.glass.h, 'room');
  mark('lamp hit', hit.lamp.x - hit.lamp.r, hit.lamp.y - hit.lamp.r, hit.lamp.r * 2, hit.lamp.r * 2, 'room');
  return hit;
}

/**
 * The lamp's light falls off with distance: the lit copy of the room is kept near the lamp
 * and fades out toward the far corners, where the dark copy under it shows.
 */
function lampFalloff(g, L) {
  const [x, y] = L.lamp.pool;
  const R = L.colW * 0.8;
  const cy = y - L.Z * 0.04;
  // Wider than tall: the light spreads along the desk more than up the wall.
  g.save();
  g.translate(x, cy);
  g.scale(1, 0.72);
  g.translate(-x, -cy);
  const grad = g.createRadialGradient(x, cy, 0, x, cy, R);
  grad.addColorStop(0, 'rgb(0 0 0 / 1)');
  grad.addColorStop(0.2, 'rgb(0 0 0 / 0.85)');
  grad.addColorStop(0.5, 'rgb(0 0 0 / 0.38)');
  grad.addColorStop(0.8, 'rgb(0 0 0 / 0.1)');
  grad.addColorStop(1, 'rgb(0 0 0 / 0)');
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = grad;
  g.fillRect(-L.w, -L.h, L.w * 3, L.h * 3);
  g.restore();
}

/** The bulb in the shade and the warm cone it throws onto the desk. */
function lampGlow(ctx, L, lamp, view, dpr) {
  const layer = cachedLayer('room-lampfx', view, dpr, (g) => {
    const p = L.lamp;
    const [mx, my] = p.mouth;
    const [px, py] = p.pool;
    g.globalCompositeOperation = 'lighter';
    // The cone of light through the air, laid on in a few widening passes so its sides are
    // soft and it reads as light, not as a shape. (A blur filter would do it in one pass,
    // but Safari ignores canvas filters.)
    const cone = g.createLinearGradient(mx, my, px, py);
    cone.addColorStop(0, css('#ffb860', 0.06));
    cone.addColorStop(1, css('#ffb860', 0));
    g.fillStyle = cone;
    for (let i = 0; i < 4; i++) {
      const spread = L.colW * (0.14 + i * 0.05);
      const r = p.shadeR * (0.5 + i * 0.15);
      poly(g, [[mx - r, my - r * 0.3], [mx + r * 0.7, my + r * 0.6], [px + spread * 0.55, L.h * 0.62], [px - spread, L.h * 0.6]]);
      g.fill();
    }
    const pool = g.createRadialGradient(px, py, 0, px, py, L.colW * 0.4);
    pool.addColorStop(0, css('#ffcf8a', 0.3));
    pool.addColorStop(1, css('#ffcf8a', 0));
    g.fillStyle = pool;
    g.fillRect(px - L.colW * 0.4, py - L.colW * 0.4, L.colW * 0.8, L.colW * 0.8);
    const bulb = g.createRadialGradient(mx, my, 0, mx, my, p.shadeR * 2.6);
    bulb.addColorStop(0, css('#fff4d8', 0.95));
    bulb.addColorStop(0.3, css('#ffd08a', 0.45));
    bulb.addColorStop(1, css('#ffb060', 0));
    g.fillStyle = bulb;
    g.fillRect(mx - p.shadeR * 2.6, my - p.shadeR * 2.6, p.shadeR * 5.2, p.shadeR * 5.2);
  });
  ctx.globalCompositeOperation = 'lighter';
  put(ctx, layer, view, lamp);
  ctx.globalCompositeOperation = 'source-over';
}

/** Lights in the town's windows (s.town of them, in a fixed order) and the son's torch. */
function townLights(ctx, L, M, town, kid, t, mood) {
  const { list, kid: kw } = L.out.windows;
  const n = Math.round(town * list.length);
  const warm = glowSprite(M.windowLight);
  const fog = mood === 'fog';
  const reflect = M.reflect;
  const base = L.out.shoreY;
  // In fog only the glow of a window gets through, never its shape.
  ctx.fillStyle = css(M.windowLight, 0.95);
  if (!fog) {
    for (const wn of list) if (wn.order < n) ctx.fillRect(wn.x - wn.w / 2, wn.y - wn.h / 2, wn.w, wn.h);
  }
  for (const wn of list) {
    if (wn.order >= n) continue;
    stamp(ctx, warm, wn.x, wn.y, fog ? 13 * L.k : 4 * L.k, fog ? 0.2 : 0.4);
    // Only some lights reach the water as a reflection; all of them would make stripes.
    if (reflect && wn.order % 2 === 0) reflection(ctx, wn.x, base, reflect * L.k, t, wn.order, M.windowLight, 0.45);
  }
  if (kid > 0.01) {
    // A torch under a blanket: not steady like a lamp, it wavers.
    const f = 0.78 + 0.12 * Math.sin(t * 6.1) + 0.07 * Math.sin(t * 13.7 + 1.3) + 0.03 * Math.sin(t * 29);
    const b = kid * f;
    // Whiter than the town's lamps, so it can be told apart even among them.
    stamp(ctx, glowSprite('#fff2c8'), kw.x, kw.y, (fog ? 16 : 9) * L.k, 0.6 * b);
    ctx.fillStyle = css('#fffbea', Math.min(1, b));
    ctx.fillRect(kw.x - kw.w / 2 - 0.3, kw.y - kw.h / 2 - 0.3, kw.w + 0.6, kw.h + 0.6);
    if (reflect) reflection(ctx, kw.x, base, reflect * L.k * 1.2, t, 99, '#fff2c8', 0.7 * b);
  }
  mark('son window', kw.x - 3, kw.y - 3, 6, 6, 'room');
}

const streaks = new Map();

/** A soft vertical streak, made once per colour: a light's reflection on still water. */
function streakSprite(color) {
  if (streaks.has(color)) return streaks.get(color);
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 64;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 64);
  v.addColorStop(0, css(color, 0.9));
  v.addColorStop(0.4, css(color, 0.35));
  v.addColorStop(1, css(color, 0));
  g.fillStyle = v;
  g.fillRect(0, 0, 8, 64);
  // Soft at the sides too: cut the edges away.
  const hz = g.createLinearGradient(0, 0, 8, 0);
  hz.addColorStop(0, 'rgb(0 0 0 / 1)');
  hz.addColorStop(0.5, 'rgb(0 0 0 / 0)');
  hz.addColorStop(1, 'rgb(0 0 0 / 1)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = hz;
  g.fillRect(0, 0, 8, 64);
  streaks.set(color, c);
  return c;
}

/** A light's reflection in the water below the shore, broken into a few swaying pieces. */
function reflection(ctx, x, base, len, t, seed, color, alpha) {
  const sprite = streakSprite(color);
  ctx.globalAlpha = Math.min(1, alpha);
  const parts = 3;
  for (let j = 0; j < parts; j++) {
    const sway = Math.sin(t * 1.1 + seed * 1.7 + j * 1.3) * (0.4 + j * 0.5);
    const y0 = base + 2 + (len * j) / parts;
    ctx.drawImage(sprite, 0, (64 * j) / parts, 8, 64 / parts, x - 2.5 + sway, y0, 5, len / parts);
  }
  ctx.globalAlpha = 1;
}

function mastLight(ctx, L, M, t, mood) {
  const { x, y } = L.out.light;
  const b = blink(t + 0.7);
  const red = glowSprite('#ff3a2c');
  // In fog the light lights the fog itself: a wide red glow round the top of the mast.
  if (mood === 'fog') stamp(ctx, red, x, y, 80 * L.k, 0.45 * b + 0.05);
  stamp(ctx, red, x, y, 13 * L.k, 0.9 * b);
  ctx.fillStyle = css(mix('#5a1a18', '#ff6a52', b));
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.4, 1.8 * L.k), 0, Math.PI * 2);
  ctx.fill();
  mark('mast light', x - 4, y - 4, 8, 8, 'room');
}

/** Fog drifting across, rain falling outside, waves breaking white in the storm. */
function movingOutside(ctx, L, M, t, view, dpr, mood) {
  const g = L.glass;
  if (mood === 'fog') {
    const layer = cachedLayer('room-fog', view, dpr, (c) => fogLayer(c, L, M));
    const ox = (t * 5) % view.w;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(layer, -ox, 0, view.w, view.h);
    ctx.drawImage(layer, view.w - ox, 0, view.w, view.h);
    ctx.globalAlpha = 1;
  }
  if (mood === 'storm') {
    // White caps: each one a crest that rises, curls over and fades, nearer ones bigger.
    const rand = rng(17);
    const top = L.out.shoreY + 3;
    ctx.strokeStyle = css('#c8d6ee', 0.55);
    ctx.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const x = rand() * view.w;
      const v = rand() ** 0.8;
      const speed = 0.4 + rand() * 0.6;
      const phase = rand() * 6.28;
      const y = top + (L.out.duneAt(x) - 4 - top) * v;
      if (y < top) continue;
      const a = Math.sin(t * speed + phase);
      if (a < 0.3) continue;
      const len = (3 + v * 9) * L.k;
      const drift = ((t * speed * 3) % 6) - 3;
      ctx.globalAlpha = ((a - 0.3) / 0.7) * (0.5 + v * 0.5);
      ctx.lineWidth = 0.8 + v * 0.8;
      ctx.beginPath();
      ctx.moveTo(x - len / 2 + drift, y + 0.6);
      ctx.quadraticCurveTo(x + drift, y - 1.2 - v, x + len / 2 + drift, y + 0.3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineCap = 'butt';
    // Rain falling outside, slanting in the wind.
    ctx.strokeStyle = css('#a8b8d8', 0.22);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const r2 = rng(23);
    for (let i = 0; i < 70; i++) {
      const x0 = r2() * (view.w + 80);
      const sp = 380 + r2() * 160;
      const y = ((r2() * 1000 + t * sp) % (g.h + 40)) + g.y - 20;
      const x = x0 - ((y - g.y) * 0.35) - ((t * sp * 0.35) % 1);
      ctx.moveTo(x, y);
      ctx.lineTo(x - 5, y + 14);
    }
    ctx.stroke();
  }
  if (mood === 'clear') {
    // A few stars twinkle; the rest are still in the painting.
    const rand = rng(5);
    for (let i = 0; i < 14; i++) {
      const x = rand() * view.w;
      const y = g.y + (L.out.shoreY - g.y) * rand() ** 1.6 * 0.85;
      const a = 0.5 + 0.5 * Math.sin(t * (0.8 + rand() * 1.5) + rand() * 6.28);
      ctx.fillStyle = css('#ffffff', 0.25 + a * 0.6);
      ctx.fillRect(x, y, 1.3, 1.3);
    }
  }
}

/** Lightning: the sky goes white and, at the brightest, a bolt comes down over the water. */
function lightning(ctx, L, flash, t) {
  const g = L.glass;
  ctx.save();
  // The flash lights the sky and the water; the dune in front stays a dark shape.
  ctx.beginPath();
  ctx.moveTo(0, g.y);
  for (let x = 0; x <= L.w + 4; x += 4) ctx.lineTo(x, L.out.duneAt(x));
  ctx.lineTo(L.w, g.y);
  ctx.closePath();
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  const sky = ctx.createLinearGradient(0, g.y, 0, L.out.duneTop);
  sky.addColorStop(0, css('#dce4ff', flash * 0.75));
  sky.addColorStop(0.7, css('#9aa8d8', flash * 0.35));
  sky.addColorStop(1, css('#9aa8d8', flash * 0.15));
  ctx.fillStyle = sky;
  ctx.fillRect(0, g.y, L.w, L.out.duneTop - g.y);
  ctx.restore();
  if (flash < 0.35) return;
  // The same bolt for the length of one flash; a new one after a few seconds.
  const rand = rng(Math.floor(t / 3) * 7 + 3);
  let x = g.x + g.w * (0.1 + rand() * 0.45);
  let y = g.y;
  const pts = [[x, y]];
  while (y < L.out.shoreY - 2) {
    y += 6 + rand() * 12;
    x += (rand() - 0.5) * 14;
    pts.push([x, Math.min(y, L.out.shoreY - 2)]);
  }
  ctx.lineJoin = 'round';
  ctx.strokeStyle = css('#c8d4ff', flash * 0.4);
  ctx.lineWidth = 5;
  poly(ctx, pts, false);
  ctx.stroke();
  ctx.strokeStyle = css('#ffffff', flash);
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

// Seven-segment digits for the station clock, as on a green glowing display.
const SEGMENTS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g' };

function clockDigits(ctx, L, text, lamp) {
  const c = L.clock;
  const pad = 6 * L.k;
  const dh = c.h - pad * 2;
  const dw = dh * 0.52;
  const gap = dh * 0.16;
  const chars = (text || '--:--').slice(0, 5).split('');
  const widths = chars.map((ch) => (ch === ':' ? dh * 0.22 : dw));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let x = c.x + (c.w - total) / 2;
  const y = c.y + pad;
  const on = css('#6ee6c8', 0.85);
  const ghost = css('#6ee6c8', 0.05);
  const th = Math.max(1.3, dh * 0.13);
  const seg = (name, ox) => {
    const sk = (yy) => ox + (dh - (yy - y)) * 0.08;
    const L2 = (x0, y0, x1, y1) => {
      ctx.beginPath();
      ctx.moveTo(sk(y0) + x0, y0);
      ctx.lineTo(sk(y1) + x1, y1);
      ctx.stroke();
    };
    const m = y + dh / 2;
    if (name === 'a') L2(th, y, dw - th, y);
    if (name === 'b') L2(dw, y + th, dw, m - th * 0.6);
    if (name === 'c') L2(dw, m + th * 0.6, dw, y + dh - th);
    if (name === 'd') L2(th, y + dh, dw - th, y + dh);
    if (name === 'e') L2(0, m + th * 0.6, 0, y + dh - th);
    if (name === 'f') L2(0, y + th, 0, m - th * 0.6);
    if (name === 'g') L2(th, m, dw - th, m);
  };
  ctx.lineCap = 'round';
  ctx.lineWidth = th;
  stamp(ctx, glowSprite('#4ad8b8'), c.x + c.w / 2, c.y + c.h / 2, c.w * 0.55, 0.12 + 0.08 * (1 - lamp));
  chars.forEach((ch, i) => {
    if (ch === ':') {
      ctx.fillStyle = on;
      ctx.fillRect(x + widths[i] / 2 - th / 2 + dh * 0.03, y + dh * 0.28, th, th);
      ctx.fillRect(x + widths[i] / 2 - th / 2, y + dh * 0.64, th, th);
    } else {
      ctx.strokeStyle = ghost;
      for (const s of 'abcdefg') seg(s, x);
      ctx.strokeStyle = on;
      for (const s of SEGMENTS[ch] ?? '') seg(s, x);
    }
    x += widths[i] + gap;
  });
  ctx.lineCap = 'butt';
}
