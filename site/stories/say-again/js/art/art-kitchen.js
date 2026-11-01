// art-kitchen.js: the 'kitchen' scene, the ending. Morning sun; the father (teal) and the
// son (yellow) side on at the kitchen table, the old radio lying between them, two mugs,
// and through the window the town's roofs, the water, and far off on the dune the mast
// with its red light. s.hand (0..1) moves the father's hand across the table until it
// rests on the son's.
//
// Sizes come from real ones: a 1.8 m father, a son of about eight, a table 75 cm high,
// chairs 45 cm, the radio as long as a forearm.

import { cachedLayer, put, paper, css, mix, rng, roundRect, poly, line, mark, glowSprite, stamp, blink, clamp, smooth, lerp, vGrad } from './art-kit.js';
import { ridge, forestBand, water, mast, sky as paintSky } from './art-coast.js';
import { seatedSide, oldRadioLying, SON, FATHER, lightPaint } from './art-people.js';

/** Where everything is, in pixels, from a 1.8 m father sized to the screen. */
function layout(view) {
  const { w, h, colW, colX } = view;
  const S = Math.min(colW, h * 0.47);
  const H = S * 0.95;
  const m = H / 1.8;
  const cx = colX + colW / 2;
  const floorY = h * 0.8;
  const tableTop = floorY - 0.75 * m;
  const seat = floorY - 0.45 * m;
  const win = { x: cx - 0.58 * m, y: floorY - 2.3 * m, w: 1.16 * m, h: 1.3 * m };
  return {
    w, h, colW, colX, cx, H, m, floorY, tableTop, seat, win,
    table: { x0: cx - 0.43 * m, x1: cx + 0.43 * m },
    dad: { x: cx - 0.66 * m, y: seat },
    son: { x: cx + 0.6 * m, y: seat - 0.09 * m, H: H * 0.72 },
  };
}

const lights = new Map();

export function paintKitchen(ctx, view, t, s, dpr) {
  const L = layout(view);
  const bg = cachedLayer('kitchen-bg', view, dpr, (g) => {
    lights.set(`${view.w}x${view.h}`, room(g, L));
    paper(g, view.w, view.h, 21, 0.8);
  });
  put(ctx, bg, view);
  // The mast's light far off across the water.
  const ml = lights.get(`${view.w}x${view.h}`);
  if (ml) stamp(ctx, glowSprite('#ff4030'), ml.x, ml.y, Math.max(4, 0.03 * L.m), 0.9 * blink(t));

  const hand = smooth(clamp(s.hand ?? 0));
  const paint = lightPaint('#5a4a52', 0.96, 1.05);
  const rim = '#ffe2b0';
  const front = L.tableTop + 0.05 * L.m;
  // The son's near hand rests on the table, a little toward the middle.
  const sonHand = [L.cx + 0.13 * L.m, front];
  const dadRest = [L.cx - 0.27 * L.m, front];
  const dadOn = [sonHand[0] - 0.03 * L.m, front - 0.035 * L.m];
  const dadHand = [lerp(dadRest[0], dadOn[0], hand), lerp(dadRest[1], dadOn[1], hand) - Math.sin(hand * Math.PI) * 0.06 * L.m];
  const dadMug = [L.cx - 0.3 * L.m, L.tableTop - 0.02 * L.m];
  const sonMug = [L.cx + 0.3 * L.m, L.tableTop - 0.02 * L.m];
  const breath = (t / 4.2) % 1;
  const dadO = {
    x: L.dad.x, y: L.dad.y, H: L.H, face: 1, look: FATHER, lean: 0.14 + 0.16 * hand, floorY: L.floorY, paint, rim, breath,
    // His far hand round the handle side of his mug, behind it.
    hands: [[dadMug[0] - 0.075 * L.m, dadMug[1] - 0.04 * L.m], dadHand],
  };
  const sonO = {
    x: L.son.x, y: L.son.y, H: L.son.H, face: -1, child: true, look: SON, lean: 0.2, floorY: L.floorY, paint, rim, breath: (breath + 0.4) % 1,
    hands: [[sonMug[0] + 0.075 * L.m, sonMug[1] - 0.03 * L.m], sonHand],
  };

  seatedSide(ctx, { ...dadO, part: 'legs' });
  seatedSide(ctx, { ...sonO, part: 'legs' });
  const fg = cachedLayer('kitchen-table', view, dpr, (g) => {
    table(g, L);
    mugAt(g, dadMug, L.m, '#eae6dc', '#2f5a9a');
    mugAt(g, sonMug, L.m, '#f2d36a', '#c8402e');
    const radio = oldRadioLying(g, L.cx - 0.2 * L.m, L.tableTop - 0.035 * L.m, 0.27 * L.m, paint);
    mark('radio', radio.x - 2, radio.y - 2, radio.w + 4, radio.h + 4, 'high');
  });
  put(ctx, fg, view);
  const son = seatedSide(ctx, { ...sonO, part: 'upper' });
  const dad = seatedSide(ctx, { ...dadO, part: 'upper' });
  mark('father head', dad.head[0] - dad.headR * 1.3, dad.head[1] - dad.headR * 1.4, dad.headR * 2.6, dad.headR * 2.8, 'high');
  mark('son head', son.head[0] - son.headR * 1.3, son.head[1] - son.headR * 1.7, son.headR * 2.6, son.headR * 3, 'high');
  mark('hands', Math.min(dadHand[0], sonHand[0]) - 8, Math.min(dadHand[1], sonHand[1]) - 8, Math.abs(dadHand[0] - sonHand[0]) + 16, 20, 'high');
  return { hands: { x: sonHand[0] - 20, y: sonHand[1] - 20, w: 40, h: 40 } };
}

/** The kitchen: wall, window and the view, curtains, a shelf, the floor, the chairs. */
function room(g, L) {
  const { w, h, m, win, floorY } = L;
  g.fillStyle = vGrad(g, 0, floorY, ['#d9c6a6', '#efe2c8', '#e6d4b4']);
  g.fillRect(0, 0, w, floorY);
  // A darker band low on the wall, where chairs knock it.
  g.fillStyle = css('#d8c4a0', 0.6);
  g.fillRect(0, floorY - 0.9 * m, w, 0.9 * m);
  g.strokeStyle = css('#bba684', 0.5);
  g.lineWidth = 1;
  line(g, 0, floorY - 0.9 * m, w, floorY - 0.9 * m);
  const light = windowView(g, L);
  g.fillStyle = css('#f6f0e2');
  const f = Math.max(4, 0.05 * m);
  g.fillRect(win.x - f, win.y - f, win.w + f * 2, f);
  g.fillRect(win.x - f, win.y, f, win.h);
  g.fillRect(win.x + win.w, win.y, f, win.h);
  g.fillRect(win.x + win.w / 2 - f / 2, win.y, f, win.h);
  g.fillRect(win.x - f, win.y + win.h * 0.32, win.w + f * 2, f * 0.7);
  g.fillStyle = css('#e2d6c0');
  g.fillRect(win.x - f * 2, win.y + win.h, win.w + f * 4, f * 1.4);
  g.fillStyle = css('#000000', 0.08);
  g.fillRect(win.x - f * 2, win.y + win.h + f * 1.4, win.w + f * 4, f * 0.8);
  // A pot of herbs on the sill.
  const px = win.x + win.w * 0.12;
  g.fillStyle = css('#c0663e');
  poly(g, [[px - 0.05 * m, win.y + win.h], [px + 0.05 * m, win.y + win.h], [px + 0.06 * m, win.y + win.h - 0.1 * m], [px - 0.06 * m, win.y + win.h - 0.1 * m]]);
  g.fill();
  g.fillStyle = css('#5f8a52');
  const r = rng(4);
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    g.ellipse(px + (r() - 0.5) * 0.12 * m, win.y + win.h - 0.12 * m - r() * 0.08 * m, 0.03 * m, 0.02 * m, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  // Short curtains at the sides, light coming through them.
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? win.x - f * 2 - 0.12 * m : win.x + win.w + f * 2;
    g.fillStyle = css('#f4e6c8', 0.85);
    g.beginPath();
    g.moveTo(x0, win.y - f * 2);
    g.lineTo(x0 + 0.12 * m, win.y - f * 2);
    g.quadraticCurveTo(x0 + 0.06 * m + side * 0.03 * m, win.y + win.h * 0.6, x0 + 0.12 * m, win.y + win.h + f);
    g.lineTo(x0, win.y + win.h + f);
    g.closePath();
    g.fill();
    g.strokeStyle = css('#d8c09a', 0.6);
    for (let i = 1; i < 4; i++) line(g, x0 + i * 0.03 * m, win.y - f, x0 + i * 0.03 * m + side * 0.01 * m, win.y + win.h);
  }
  g.fillStyle = css('#b89a70');
  g.fillRect(win.x - f * 2 - 0.16 * m, win.y - f * 2.6, win.w + f * 4 + 0.32 * m, Math.max(2, f * 0.5));
  // Jars at the other end of the sill.
  [['#e8c070', 0.1], ['#c86040', 0.13], ['#f0ece0', 0.09]].forEach(([c, hh], i) => {
    const jx = win.x + win.w * 0.68 + i * 0.1 * m;
    g.fillStyle = css(c, 0.92);
    roundRect(g, jx, win.y + win.h - hh * m, 0.075 * m, hh * m, 0.015 * m);
    g.fill();
    g.fillStyle = css('#8a7050');
    g.fillRect(jx, win.y + win.h - hh * m - 0.015 * m, 0.075 * m, 0.02 * m);
  });
  // A lamp hanging over the table.
  g.strokeStyle = css('#4a3a30');
  g.lineWidth = 1;
  const lampY = Math.max(64, win.y - 0.42 * m);
  line(g, L.cx, 0, L.cx, lampY);
  g.fillStyle = css('#c85a3a');
  poly(g, [[L.cx - 0.04 * m, lampY], [L.cx + 0.04 * m, lampY], [L.cx + 0.16 * m, lampY + 0.12 * m], [L.cx - 0.16 * m, lampY + 0.12 * m]]);
  g.fill();
  g.fillStyle = css('#a8462c');
  g.fillRect(L.cx - 0.16 * m, lampY + 0.11 * m, 0.32 * m, 0.015 * m);
  // The floor: boards running away, lit where the sun falls.
  g.fillStyle = vGrad(g, floorY, h, ['#a87850', '#7a5236']);
  g.fillRect(0, floorY, w, h - floorY);
  g.strokeStyle = css('#5a3a24', 0.25);
  for (let i = 1; i < 8; i++) {
    const y = floorY + (h - floorY) * (i / 8) ** 1.5;
    line(g, 0, y, w, y);
  }
  g.fillStyle = css('#000000', 0.12);
  g.fillRect(0, floorY, w, 3);
  // Morning light from the window lying on the floor, fading as it comes forward.
  const pool = g.createLinearGradient(0, floorY, 0, h);
  pool.addColorStop(0, css('#ffe8b8', 0.28));
  pool.addColorStop(1, css('#ffe8b8', 0));
  g.fillStyle = pool;
  poly(g, [[win.x, floorY + 0.03 * m], [win.x + win.w, floorY + 0.03 * m], [win.x + win.w + 0.4 * m, h], [win.x - 0.4 * m, h]]);
  g.fill();
  chair(g, L, L.dad.x, L.seat, 1);
  chair(g, L, L.son.x, L.seat, -1);
  // A cushion on the son's chair so he reaches the table.
  g.fillStyle = css('#8a5a8a');
  roundRect(g, L.son.x - 0.2 * m, L.seat - 0.09 * m, 0.34 * m, 0.09 * m, 0.03 * m);
  g.fill();
  mark('kitchen window', win.x, win.y, win.w, win.h, 'high');
  return light;
}

/** Through the window: the morning sky, the far dune with pines and the mast, the water, roofs. */
function windowView(g, L) {
  const { win, m } = L;
  g.save();
  g.beginPath();
  g.rect(win.x, win.y, win.w, win.h);
  g.clip();
  paintSky(g, win.x, win.y, win.w, win.h, ['#8fb8de', '#c4d8e6', '#f2e4c4']);
  const shore = win.y + win.h * 0.56;
  const dune = ridge(g, win.x - 10, win.x + win.w + 10, shore, win.h * 0.07, 0.02, 33, css('#cdb88e'), shore + 6);
  const mx = L.cx + 0.12 * m;
  forestBand(g, win.x - 10, win.x + win.w + 10, (x) => dune(x) + win.h * 0.02, win.h * 0.07, css('#6c8868'), 3, [[mx - 0.04 * m, mx + 0.04 * m]]);
  // The mast, small and far, on the dune across the water.
  const top = shore - win.h * 0.3;
  const light = mast(g, mx, dune(mx) + 2, top, { red: '#c8463a', white: '#f2ece6', night: '#8a9aa8', dim: 0.15, wide: 0.06 });
  mark('far mast', light.x - 6, light.y - 4, 12, dune(mx) - light.y + 4, 'high');
  water(g, win.x, shore + 3, win.w, win.h * 0.3, ['#a8c4d4', '#7ea4bc'], '#ffffff', 5, 0.25);
  // Roofs of the town below the window, red tiles in the sun.
  const r = rng(8);
  const roofBase = win.y + win.h;
  for (let x = win.x - 0.1 * m; x < win.x + win.w; x += 0.2 * m + r() * 0.15 * m) {
    const rw = 0.22 * m + r() * 0.12 * m;
    const ry = roofBase - win.h * (0.1 + r() * 0.08);
    g.fillStyle = css('#efe2cc');
    g.fillRect(x, ry, rw, roofBase - ry);
    g.fillStyle = css(r() < 0.5 ? '#b8513c' : '#a8442f');
    poly(g, [[x - 0.02 * m, ry + 1], [x + rw / 2, ry - rw * 0.32], [x + rw + 0.02 * m, ry + 1]]);
    g.fill();
    g.fillStyle = css('#8a3a2a', 0.5);
    poly(g, [[x + rw / 2, ry - rw * 0.32], [x + rw + 0.02 * m, ry + 1], [x + rw / 2, ry + 1]]);
    g.fill();
  }
  g.restore();
  return { x: light.x, y: light.y };
}

function chair(g, L, x, seat, face) {
  const { m, floorY } = L;
  const back = x - face * 0.2 * m;
  const fwd = x + face * 0.2 * m;
  g.strokeStyle = css('#7a5236');
  g.lineCap = 'round';
  g.lineWidth = Math.max(2, 0.035 * m);
  line(g, back, floorY, back, seat - 0.45 * m);
  line(g, fwd, floorY, fwd, seat);
  g.lineWidth = Math.max(1.5, 0.025 * m);
  line(g, back, seat - 0.2 * m, back + face * 0.01 * m, seat - 0.2 * m);
  line(g, back - face * 0.005 * m, seat - 0.4 * m, back + face * 0.02 * m, seat - 0.4 * m);
  g.fillStyle = css('#8a5e3e');
  g.fillRect(Math.min(back, fwd) - 0.02 * m, seat - 0.02 * m, 0.44 * m, 0.04 * m);
  g.lineCap = 'butt';
}

/** The table, side on: an oilcloth with a checked pattern, hanging a little over the edge. */
function table(g, L) {
  const { m, tableTop, floorY } = L;
  const { x0, x1 } = L.table;
  const depth = 0.07 * m;
  g.strokeStyle = css('#6a4630');
  g.lineWidth = Math.max(3, 0.05 * m);
  line(g, x0 + 0.06 * m, tableTop, x0 + 0.06 * m, floorY);
  line(g, x1 - 0.06 * m, tableTop, x1 - 0.06 * m, floorY);
  g.strokeStyle = css('#5a3a26');
  line(g, x0 + 0.11 * m, tableTop, x0 + 0.11 * m, floorY - 0.02 * m);
  line(g, x1 - 0.11 * m, tableTop, x1 - 0.11 * m, floorY - 0.02 * m);
  // The top, seen a little from above, then the cloth hanging down the front.
  const top = [[x0 + depth * 0.4, tableTop - depth], [x1 - depth * 0.4, tableTop - depth], [x1, tableTop], [x0, tableTop]];
  g.fillStyle = css('#f4ece0');
  poly(g, top);
  g.fill();
  const hang = 0.12 * m;
  g.fillRect(x0 - 0.01 * m, tableTop, x1 - x0 + 0.02 * m, hang);
  // Checks: red squares on the white, darker where they cross.
  g.save();
  g.beginPath();
  g.rect(x0 - 0.01 * m, tableTop, x1 - x0 + 0.02 * m, hang);
  g.clip();
  const c = 0.06 * m;
  g.fillStyle = css('#c85a4c', 0.5);
  for (let x = x0 - c; x < x1 + c; x += c * 2) g.fillRect(x, tableTop, c, hang);
  for (let y = tableTop; y < tableTop + hang; y += c * 2) g.fillRect(x0 - c, y, x1 - x0 + c * 2, c);
  g.restore();
  g.save();
  poly(g, top);
  g.clip();
  g.fillStyle = css('#c85a4c', 0.4);
  for (let i = 0; i < 4; i += 2) g.fillRect(x0, tableTop - depth + (depth * i) / 4, x1 - x0, depth / 4);
  for (let x = x0 - c; x < x1 + c; x += c * 2) {
    poly(g, [[x, tableTop], [x + c, tableTop], [x + c + depth * 0.4, tableTop - depth], [x + depth * 0.4, tableTop - depth]]);
    g.fill();
  }
  g.restore();
  g.fillStyle = css('#000000', 0.1);
  g.fillRect(x0 - 0.01 * m, tableTop + hang - 2, x1 - x0 + 0.02 * m, 2);
  mark('table', x0, tableTop - depth, x1 - x0, hang + depth, 'high');
}

function mugAt(g, [x, y], m, body, rim) {
  const w = 0.08 * m;
  const hh = 0.095 * m;
  g.strokeStyle = css(body);
  g.lineWidth = Math.max(1.5, w * 0.14);
  g.beginPath();
  g.ellipse(x + w * 0.55, y - hh * 0.5, w * 0.22, hh * 0.25, 0, -Math.PI / 2, Math.PI / 2);
  g.stroke();
  g.fillStyle = vGrad(g, y - hh, y, [body, mix(body, '#000000', 0.15)]);
  roundRect(g, x - w / 2, y - hh, w, hh, w * 0.12);
  g.fill();
  g.fillStyle = css(rim);
  g.fillRect(x - w / 2, y - hh, w, Math.max(1.5, hh * 0.1));
  // Steam: the tea is hot.
  g.strokeStyle = css('#ffffff', 0.35);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x - w * 0.1, y - hh - 2);
  g.bezierCurveTo(x - w * 0.4, y - hh - 0.06 * m, x + w * 0.3, y - hh - 0.08 * m, x, y - hh - 0.14 * m);
  g.stroke();
  mark('mug', x - w, y - hh - 0.15 * m, w * 2, hh + 0.15 * m, 'high');
}
