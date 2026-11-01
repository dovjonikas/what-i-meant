// art-cat.js: the station cat, a grey-brown tabby asleep on the desk, curled on the corner
// of the logbook under the lamp: the round haunch at the back, the head tucked at the
// front of the curl with its ears up, its chin on its pale paws, and the ringed tail
// wrapped round the front. art-room.js calls paintCat every frame.
//
// The body and the head are painted once into small sprites, one as the lamp lights them
// and one as the night leaves them. Each frame lays the night copy down and the lit copy
// over it as strongly as the lamp burns, the same way the room fades between the two.
// Only what moves is drawn per frame, and only with flat fills: the ears, the paws and
// the tail.
//
// What it does: it breathes; its ears turn toward the radio while it receives (s.rx);
// tapped (s.poked.cat), it pushes a paw forward, lifts its head and settles again; in the
// storm it curls tighter with its tail over its nose and lays its ears back, flatter at a
// flash; now and then the tip of its tail twitches.

import { css, mix, rgb, clamp, bump, mark, rng, paper, line } from './art-kit.js';

// Its colours in the lamp's light. In the dark each one sinks into the room's night colour.
const FUR = {
  base: '#857464',
  light: '#c2ad94',
  under: '#4f4239',
  stripe: '#352a24',
  pale: '#e8ddcc',
  earIn: '#c4928a',
  nose: '#a2625a',
};
const WARM = '#ffd49c';

// Its size on a 390 px wide phone: as long as the logbook is wide, a grown cat next to
// the mug.
const LEN = 86;
const TALL = 36;

const sets = new Map();

/**
 * The colours for one light: as they are under the lamp, or sunk into the night's colour
 * with only a trace of their own left, by the same sum as the rest of the room, so in the
 * dark the cat is no brighter than the logbook it lies on.
 */
function palette(M, lit) {
  const out = {};
  for (const [name, hex] of Object.entries(FUR)) out[name] = lit ? rgb(hex) : mix(mix(hex, M.room, 0.86), '#04060c', 0.12);
  return out;
}

/** A small canvas with its origin at (ox, oy), painted once. */
function sprite(w, h, ox, oy, scale, draw) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * scale);
  c.height = Math.ceil(h * scale);
  const g = c.getContext('2d');
  g.scale(scale, scale);
  g.save();
  g.translate(ox, oy);
  draw(g);
  g.restore();
  // The same paper grain as the room, so the cat is painted on the same paper.
  paper(g, w, h, 7, 0.8);
  return { canvas: c, w, h, ox, oy };
}

/** The body and head sprites for this look and size, lit and dark, made once. */
function spritesFor(M, W, H, scale) {
  const key = `${M.room}|${W.toFixed(2)}|${scale}`;
  if (sets.has(key)) return sets.get(key);
  if (sets.size > 6) sets.clear();
  const r = W * 0.165;
  const set = { r, lit: palette(M, true), dark: palette(M, false) };
  for (const light of ['lit', 'dark']) {
    const p = set[light];
    const rim = light === 'lit' ? css(WARM, 0.55) : css(M.edge, 0.4);
    set[`body-${light}`] = sprite(W * 1.04 + 6, H * 1.1 + 6, W * 0.47 + 3, H * 1.07 + 3, scale, (g) => paintBody(g, W, H, p, rim, light === 'lit' ? WARM : M.edge));
    set[`head-${light}`] = sprite(r * 2.75 + 4, r * 2.05 + 4, r * 1.5 + 2, r * 1.0 + 2, scale, (g) => paintHead(g, r, p, rim, light === 'lit'));
  }
  sets.set(key, set);
  return set;
}

/** The body's outline: the curl seen from the side, the haunch high at the back (right). */
function bodyPath(g, W, H, dx = 0, dy = 0) {
  const P = (u, v) => [dx + u * W, dy + v * H];
  g.moveTo(...P(-0.4, 0));
  // Up behind the head to the shoulders, a slight dip at the waist, then the haunch.
  g.bezierCurveTo(...P(-0.46, -0.48), ...P(-0.38, -0.84), ...P(-0.18, -0.92));
  g.bezierCurveTo(...P(-0.06, -0.97), ...P(0, -0.9), ...P(0.08, -0.94));
  g.bezierCurveTo(...P(0.16, -1.01), ...P(0.3, -1.03), ...P(0.4, -0.92));
  g.bezierCurveTo(...P(0.52, -0.8), ...P(0.56, -0.6), ...P(0.53, -0.38));
  g.bezierCurveTo(...P(0.51, -0.16), ...P(0.46, -0.03), ...P(0.37, 0));
  g.closePath();
}

/** A stripe along part of an ellipse (factor f of its radii, from angle a0 to a1, in turns of pi). */
function arcStripe(g, cx, cy, rx, ry, f, a0, a1, w) {
  const at = (a) => [cx + Math.cos(a * Math.PI) * rx * f, cy + Math.sin(a * Math.PI) * ry * f];
  const a = at(a0);
  const b = at(a1);
  const m = at((a0 + a1) / 2);
  stripe(g, a, [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2], b, w);
}

/** A tabby stripe: a curve that starts `w` wide and thins to a point, like real markings. */
function stripe(g, a, c, b, w) {
  const left = [];
  const right = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const x = (1 - s) ** 2 * a[0] + 2 * s * (1 - s) * c[0] + s * s * b[0];
    const y = (1 - s) ** 2 * a[1] + 2 * s * (1 - s) * c[1] + s * s * b[1];
    const tx = 2 * (1 - s) * (c[0] - a[0]) + 2 * s * (b[0] - c[0]);
    const ty = 2 * (1 - s) * (c[1] - a[1]) + 2 * s * (b[1] - c[1]);
    const len = Math.hypot(tx, ty) || 1;
    const half = (w / 2) * (1 - s * 0.85);
    left.push([x - (ty / len) * half, y + (tx / len) * half]);
    right.push([x + (ty / len) * half, y - (tx / len) * half]);
  }
  g.beginPath();
  [...left, ...right.reverse()].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
}

/** A soft round light or shade inside whatever is clipped. */
function soft(g, x, y, r, color, alpha) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, css(color, alpha));
  grad.addColorStop(1, css(color, 0));
  g.fillStyle = grad;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}

function paintBody(g, W, H, p, rim, glowColor) {
  g.fillStyle = css(p.base);
  g.beginPath();
  bodyPath(g, W, H);
  g.fill();
  g.save();
  g.clip();
  // Round: lit from the lamp above, sinking into shadow where it meets the desk.
  soft(g, W * 0.08, -H * 1.15, W * 0.8, p.light, 0.7);
  const under = g.createLinearGradient(0, -H * 0.5, 0, 0);
  under.addColorStop(0, css(p.under, 0));
  under.addColorStop(1, css(p.under, 0.9));
  g.fillStyle = under;
  g.fillRect(-W, -H * 0.5, W * 2, H * 0.6);
  // The hind leg: a round thigh on the flank, with a shadowed crease where it folds.
  const tx = W * 0.27;
  const ty = -H * 0.46;
  const trx = W * 0.215;
  const try_ = H * 0.43;
  soft(g, tx + trx * 0.1, ty - try_ * 0.5, trx * 1.2, p.light, 0.35);
  g.lineCap = 'round';
  g.strokeStyle = css(p.under, 0.8);
  g.lineWidth = Math.max(1, H * 0.06);
  g.beginPath();
  g.ellipse(tx, ty, trx, try_, -0.12, Math.PI * 0.5, Math.PI * 1.22);
  g.stroke();
  // Tabby markings that follow the body: a dark line along the spine, broken bands that
  // wrap round the thigh, and wavy stripes from the spine down the ribs, no two alike.
  g.lineWidth = Math.max(1.2, H * 0.085);
  g.strokeStyle = css(p.stripe, 0.55);
  g.beginPath();
  g.moveTo(-W * 0.2, -H * 0.86);
  g.bezierCurveTo(-W * 0.06, -H * 0.91, W * 0.02, -H * 0.85, W * 0.1, -H * 0.89);
  g.bezierCurveTo(W * 0.2, -H * 0.95, W * 0.36, -H * 0.94, W * 0.47, -H * 0.66);
  g.stroke();
  g.fillStyle = css(p.stripe, 0.66);
  const sw = Math.max(1.3, H * 0.08);
  for (const [f, a0, a1, w] of [[0.94, 1.22, 1.5, 1], [0.92, 1.6, 1.98, 0.9], [0.68, 1.12, 1.42, 0.85], [0.7, 1.55, 1.85, 0.8], [0.42, 1.2, 1.62, 0.7]]) {
    arcStripe(g, tx + W * 0.01, ty, trx, try_, f, a0, a1, sw * w);
  }
  for (const [u, top, bottom, w, bend] of [[-0.28, -0.84, -0.48, 0.9, 0.03], [-0.19, -0.89, -0.62, 1, 0.045], [-0.17, -0.55, -0.4, 0.7, 0.02], [-0.09, -0.88, -0.42, 0.95, 0.05], [0, -0.86, -0.56, 0.8, 0.035]]) {
    stripe(g, [u * W, top * H], [(u + bend) * W, ((top + bottom) / 2) * H], [(u + bend * 0.4) * W, bottom * H], sw * w);
  }
  // The pale chest under the chin.
  g.fillStyle = css(p.pale, 0.9);
  g.beginPath();
  g.ellipse(-W * 0.34, -H * 0.2, W * 0.09, H * 0.22, 0.1, 0, Math.PI * 2);
  g.fill();
  // Fur: short flecks that flow round the curl.
  const rand = rng(9);
  g.lineWidth = 0.7;
  for (let i = 0; i < 46; i++) {
    const x = (-0.42 + rand() * 0.94) * W;
    const y = -(0.15 + rand() * 0.85) * H;
    const a = Math.atan2(y + H * 0.3, x - W * 0.05) + Math.PI / 2;
    const len = 1.2 + rand() * 1.4;
    g.strokeStyle = css(i % 3 ? p.light : p.stripe, i % 3 ? 0.22 : 0.2);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  // Light from above along the top of the back: the outline less itself moved down.
  g.fillStyle = rim;
  g.beginPath();
  g.rect(-W, -H * 2, W * 2, H * 3);
  bodyPath(g, W, H, -W * 0.012, H * 0.07);
  g.fill('evenodd');
  g.restore();
  // The lamp (or the window) warms the whole top a little.
  g.save();
  g.globalCompositeOperation = 'source-atop';
  soft(g, W * 0.1, -H * 1.4, W * 1.2, glowColor, 0.12);
  g.restore();
}

/** The head's outline, facing the viewer three-quarters, its front (muzzle) to the left. */
function headPath(g, r, dx = 0, dy = 0) {
  const P = (u, v) => [dx + u * r, dy + v * r];
  g.moveTo(...P(-0.98, 0.1));
  g.bezierCurveTo(...P(-1.02, -0.5), ...P(-0.55, -0.9), ...P(0.02, -0.88));
  g.bezierCurveTo(...P(0.58, -0.86), ...P(1, -0.52), ...P(0.98, 0.02));
  g.bezierCurveTo(...P(0.97, 0.42), ...P(0.66, 0.78), ...P(0.12, 0.84));
  g.bezierCurveTo(...P(-0.42, 0.88), ...P(-0.92, 0.62), ...P(-0.98, 0.1));
  g.closePath();
}

function paintHead(g, r, p, rim, lit) {
  const P = (u, v) => [u * r, v * r];
  g.fillStyle = css(p.base);
  g.beginPath();
  headPath(g, r);
  // Tufts of fur at the cheeks, the ruff a cat has under its ears.
  g.moveTo(...P(-0.95, 0.24));
  g.lineTo(...P(-1.13, 0.44));
  g.lineTo(...P(-0.86, 0.52));
  g.moveTo(...P(0.95, 0.26));
  g.lineTo(...P(1.1, 0.46));
  g.lineTo(...P(0.84, 0.52));
  g.fill();
  g.save();
  g.beginPath();
  headPath(g, r);
  g.clip();
  soft(g, r * 0.15, -r * 1.1, r * 1.5, p.light, 0.8);
  const under = g.createLinearGradient(0, r * 0.15, 0, r * 0.9);
  under.addColorStop(0, css(p.under, 0));
  under.addColorStop(1, css(p.under, 0.55));
  g.fillStyle = under;
  g.fillRect(-r * 1.2, r * 0.15, r * 2.4, r * 0.8);
  // The pale muzzle (two whisker pads) and chin.
  g.fillStyle = css(p.pale, 0.95);
  for (const [u, v, rx, ry] of [[-0.33, 0.44, 0.22, 0.17], [-0.01, 0.46, 0.2, 0.16], [-0.17, 0.68, 0.22, 0.13]]) {
    g.beginPath();
    g.ellipse(u * r, v * r, rx * r, ry * r, 0, 0, Math.PI * 2);
    g.fill();
  }
  // The tabby's M on the forehead, lines running back over the crown, and a dark line
  // from the corner of each eye along the cheek.
  g.strokeStyle = css(p.stripe, 0.85);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.lineWidth = Math.max(0.8, r * 0.075);
  g.beginPath();
  g.moveTo(...P(-0.48, -0.3));
  g.lineTo(...P(-0.35, -0.6));
  g.lineTo(...P(-0.14, -0.36));
  g.lineTo(...P(0.07, -0.6));
  g.lineTo(...P(0.2, -0.3));
  for (const [u0, v0, u1, v1] of [[-0.26, -0.68, -0.2, -0.88], [-0.05, -0.7, 0.02, -0.9], [0.16, -0.66, 0.3, -0.86], [0.4, -0.5, 0.62, -0.7]]) {
    g.moveTo(...P(u0, v0));
    g.lineTo(...P(u1, v1));
  }
  g.moveTo(...P(-0.74, -0.12));
  g.quadraticCurveTo(...P(-0.86, -0.02), ...P(-0.94, 0.08));
  g.moveTo(...P(0.52, -0.12));
  g.quadraticCurveTo(...P(0.68, -0.08), ...P(0.84, 0.02));
  g.moveTo(...P(-0.84, 0.22));
  g.quadraticCurveTo(...P(-0.74, 0.3), ...P(-0.62, 0.32));
  g.stroke();
  // Eyes shut: each a soft curve, slanting up toward the outer corner.
  g.strokeStyle = css(mix(p.stripe, '#000000', 0.3), 0.95);
  g.lineWidth = Math.max(0.9, r * 0.085);
  g.beginPath();
  g.moveTo(...P(-0.28, -0.04));
  g.quadraticCurveTo(...P(-0.5, 0.1), ...P(-0.73, -0.13));
  g.moveTo(...P(0.1, -0.04));
  g.quadraticCurveTo(...P(0.3, 0.08), ...P(0.5, -0.13));
  g.stroke();
  // The nose, a small rounded triangle above the muzzle.
  g.fillStyle = css(p.nose);
  g.beginPath();
  g.moveTo(...P(-0.31, 0.13));
  g.quadraticCurveTo(...P(-0.18, 0.08), ...P(-0.05, 0.13));
  g.lineTo(...P(-0.18, 0.28));
  g.closePath();
  g.fill();
  g.fillStyle = rim;
  g.beginPath();
  g.rect(-r * 2, -r * 2, r * 4, r * 4);
  headPath(g, r, -r * 0.03, r * 0.11);
  g.fill('evenodd');
  g.restore();
  // Whiskers, fine and pale, fanning out from the muzzle.
  g.strokeStyle = css(p.pale, lit ? 0.6 : 0.3);
  g.lineWidth = 0.5;
  g.beginPath();
  for (const [u, v] of [[-1.42, 0.26], [-1.45, 0.45], [-1.38, 0.63]]) {
    g.moveTo(...P(-0.52, 0.44));
    g.quadraticCurveTo(...P(-0.95, 0.36 + v * 0.1), ...P(u, v));
  }
  for (const [u, v] of [[1.18, 0.38], [1.16, 0.56]]) {
    g.moveTo(...P(0.2, 0.46));
    g.quadraticCurveTo(...P(0.7, 0.42), ...P(u, v));
  }
  g.stroke();
}

/** One ear, drawn each frame in the head's frame, its base hidden under the head. */
function ear(ctx, x, y, angle, tall, wide, inner, c, rim) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = c.earOut;
  ctx.beginPath();
  ctx.moveTo(-wide / 2, 0);
  ctx.quadraticCurveTo(-wide * 0.42, -tall * 0.55, -wide * 0.06, -tall);
  ctx.quadraticCurveTo(0, -tall * 1.03, wide * 0.07, -tall * 0.97);
  ctx.quadraticCurveTo(wide * 0.36, -tall * 0.5, wide / 2, 0);
  ctx.closePath();
  ctx.fill();
  const iw = wide * inner;
  ctx.fillStyle = c.earIn;
  ctx.beginPath();
  ctx.moveTo(-iw * 0.5, -tall * 0.04);
  ctx.quadraticCurveTo(-iw * 0.4, -tall * 0.5, -wide * 0.04, -tall * 0.8);
  ctx.quadraticCurveTo(iw * 0.28, -tall * 0.45, iw * 0.5, -tall * 0.04);
  ctx.closePath();
  ctx.fill();
  // The edge facing the lamp catches its light.
  ctx.strokeStyle = rim;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(wide * 0.07, -tall * 0.95);
  ctx.quadraticCurveTo(wide * 0.36, -tall * 0.5, wide * 0.48, -tall * 0.05);
  ctx.stroke();
  ctx.restore();
}

/** Points along the tail: from under the haunch, round the front of the body, to the tip. */
function tailPoints(a, c, b, n = 16) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    out.push([(1 - s) ** 2 * a[0] + 2 * s * (1 - s) * c[0] + s * s * b[0], (1 - s) ** 2 * a[1] + 2 * s * (1 - s) * c[1] + s * s * b[1]]);
  }
  return out;
}

function stroke(ctx, pts, from = 0, dy = 0, to = pts.length - 1) {
  ctx.beginPath();
  for (let i = from; i <= to; i++) (i === from ? ctx.moveTo(pts[i][0], pts[i][1] + dy) : ctx.lineTo(pts[i][0], pts[i][1] + dy));
  ctx.stroke();
}

/**
 * The tail: a shadow where it lies against the body, fur, a lit top, dark rings, a dark
 * tip. `from` and `to` draw only a stretch of it again (over the chin in the storm),
 * its rings where they were and without the tip.
 */
function tail(ctx, pts, tw, c, from = 0, to = pts.length - 1) {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (!from) {
    ctx.strokeStyle = c.under;
    ctx.lineWidth = tw * 0.6;
    stroke(ctx, pts, 0, -tw * 0.45);
  }
  ctx.strokeStyle = c.base;
  ctx.lineWidth = tw;
  stroke(ctx, pts, from, 0, to);
  ctx.strokeStyle = c.lightA;
  ctx.lineWidth = tw * 0.4;
  stroke(ctx, pts, from, -tw * 0.22, to);
  let along = 0;
  for (let i = 1; i <= from; i++) along += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  ctx.lineCap = 'butt';
  ctx.strokeStyle = c.ring;
  ctx.lineWidth = tw * 0.96;
  ctx.setLineDash([tw * 0.34, tw * 0.8]);
  ctx.lineDashOffset = along;
  stroke(ctx, pts, from, 0, to);
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.lineCap = 'round';
  if (to < pts.length - 1) return;
  ctx.strokeStyle = c.tip;
  ctx.lineWidth = tw * 0.98;
  stroke(ctx, pts, Math.max(from, pts.length - 3));
}

let heard = 0;
let heardT = null;

/** How much the cat is listening: eased, so its ears turn rather than jump. */
function listening(t, rx) {
  const dt = heardT == null ? 1 : clamp(t - heardT, 0, 0.1);
  heardT = t;
  heard += ((rx ? 1 : 0) - heard) * Math.min(1, dt * 4);
  return heard;
}

/** Paints the cat and returns its tap area. */
export function paintCat(ctx, L, M, t, s, mood) {
  if (s.cat === false) return {};
  const lamp = clamp(s.lamp ?? 1);
  const flash = clamp(s.flash ?? 0);
  const storm = mood === 'storm';
  const W = LEN * L.k;
  const H = TALL * L.k;
  const cx = L.U(0.705);
  const base = L.Y(0.985);
  const listen = listening(t, s.rx);
  const poke = s.poked?.cat != null ? t - s.poked.cat : -1;
  const stretch = poke >= 0 && poke < 3.4 ? bump(poke, 0, 3.4, 0.7, 1.1) : 0;
  const alert = Math.max(listen, stretch);
  const lift = Math.max(stretch, listen * 0.4);
  const breath = Math.sin(t * 1.3);
  const sx = (storm ? 0.88 : 1) * (1 + stretch * 0.12);
  const sy = (storm ? 1.06 : 1) * (1 - stretch * 0.1) * (1 + breath * 0.03);
  const scale = Math.min(2, Math.abs(ctx.getTransform().a) || 1);
  const S = spritesFor(M, W, H, scale);
  const r = S.r;
  // The few colours drawn per frame, mixed between the dark and the lit look.
  const at = (name, a = 1) => css(mix(S.dark[name], S.lit[name], lamp), a);
  const c = {
    base: at('base'),
    lightA: at('light', 0.5),
    ring: at('stripe', 0.62),
    tip: css(mix(mix(S.dark.stripe, S.lit.stripe, lamp), mix(S.dark.base, S.lit.base, lamp), 0.2)),
    pale: at('pale'),
    under: at('under', 0.55),
    earIn: at('earIn'),
    // The ears stand in the lamp's light, so they are as light as the top of the head.
    earOut: css(mix(mix(S.dark.base, S.lit.base, lamp), mix(S.dark.light, S.lit.light, lamp), 0.4)),
  };
  const rim = css(mix(M.edge, WARM, lamp), 0.35 + 0.25 * lamp);

  ctx.save();
  ctx.translate(cx, base);
  // Its shadow on the desk, darkest right under it.
  ctx.fillStyle = css('#000000', 0.22);
  ctx.beginPath();
  ctx.ellipse(W * 0.03, H * 0.02, W * 0.56 * sx, H * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css('#000000', 0.2);
  ctx.beginPath();
  ctx.ellipse(0, 0, W * 0.44 * sx, H * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.scale(sx, sy);
  const body = (light) => {
    const b = S[`body-${light}`];
    ctx.drawImage(b.canvas, -b.ox, -b.oy, b.w, b.h);
  };
  body('dark');
  if (lamp > 0.01) {
    ctx.globalAlpha = lamp;
    body('lit');
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // The head at the front of the curl, chin tucked; it lifts when it wakes or listens. In
  // the storm it burrows lower.
  const hx = -W * 0.33 * sx - stretch * W * 0.04;
  const hy = -H * ((storm ? 0.48 : 0.6) + lift * 0.4) + breath * 0.012 * H;
  const tilt = (storm ? -0.22 : -0.1) + lift * 0.3;
  // A lifted head needs a neck: fur from the chest up under the chin, the pale bib in front.
  if (lift > 0.02) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = c.base;
    ctx.lineWidth = r * 0.95;
    line(ctx, -W * 0.3 * sx, -H * 0.42, hx + r * 0.1, hy + r * 0.35);
    ctx.strokeStyle = c.pale;
    ctx.lineWidth = r * 0.5;
    line(ctx, -W * 0.33 * sx, -H * 0.3, hx - r * 0.12, hy + r * 0.55);
  }

  // The tail, wrapped round the front; in the storm curled up over the nose.
  const twitch = Math.sin(t * 0.7) > 0.93 ? Math.sin(t * 9) * W * 0.025 : 0;
  const tw = H * 0.21;
  const pts = storm
    ? tailPoints([W * 0.43 * sx, -H * 0.1], [-W * 0.1, H * 0.05], [-W * 0.56 * sx, -H * 0.3 + twitch])
    : tailPoints([W * 0.43 * sx, -H * 0.1], [0, H * 0.12], [-W * 0.5 * sx, -H * 0.22 + twitch]);
  tail(ctx, pts, tw, c);

  // The front paws under the chin, one pushed forward in a stretch; tucked away in the storm.
  const reach = stretch * W * 0.18;
  for (const [u, v, rx, ry, far] of storm ? [] : [[-0.29, -0.17, 0.06, 0.085, true], [-0.39, -0.12, 0.068, 0.095, false]]) {
    const px = u * W * sx - (far ? 0 : reach);
    const py = v * H;
    const prx = rx * W * (far ? 1 : 1 + stretch * 0.5);
    ctx.fillStyle = far ? css(mix(mix(S.dark.pale, S.lit.pale, lamp), mix(S.dark.base, S.lit.base, lamp), 0.25)) : c.pale;
    ctx.beginPath();
    ctx.ellipse(px, py, prx, ry * H, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.under;
    ctx.lineWidth = Math.max(0.7, H * 0.025);
    ctx.beginPath();
    ctx.ellipse(px, py, prx, ry * H, 0, Math.PI * 0.15, Math.PI * 0.85);
    // The toes: two small creases on the front of the paw.
    ctx.moveTo(px - prx * 0.55, py - ry * H * 0.15);
    ctx.lineTo(px - prx * 0.55, py + ry * H * 0.5);
    ctx.moveTo(px - prx * 0.1, py - ry * H * 0.3);
    ctx.lineTo(px - prx * 0.1, py + ry * H * 0.6);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(tilt);
  // Ears: up when calm, turned forward to the radio when it receives (more of the inside
  // shows, and the near one flicks now and then), laid back in the storm.
  const flat = storm ? 0.45 + 0.55 * flash : 0;
  const flick = listen * (Math.sin(t * 2.3) > 0.94 ? Math.sin(t * 30) * 0.12 : 0);
  const tall = r * (0.8 + alert * 0.1 - flat * 0.42);
  const wide = r * 0.64;
  ear(ctx, r * 0.42, -r * 0.62, 0.24 + flat * 0.95 - alert * 0.1, tall * 0.94, wide * 0.92, 0.3 + alert * 0.25, c, rim);
  ear(ctx, -r * 0.5, -r * 0.56, -0.32 - flat * 0.95 + alert * 0.14 + flick, tall, wide, 0.5 + alert * 0.25, c, rim);
  const head = (light) => {
    const h = S[`head-${light}`];
    ctx.drawImage(h.canvas, -h.ox, -h.oy, h.w, h.h);
  };
  head('dark');
  if (lamp > 0.01) {
    ctx.globalAlpha = lamp;
    head('lit');
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // In the storm the tail is pulled up over the chin, the nose tucked down into it.
  if (storm) tail(ctx, pts, tw, c, pts.length - 9, pts.length - 3);
  ctx.restore();

  const top = base + hy - r * 1.75;
  mark('cat', cx - W * 0.58, top, W * 1.14, base + H * 0.1 - top, 'room');
  return { cat: { x: cx, y: base - H * 0.5, r: Math.max(26, W * 0.55) } };
}
