// art-room-desk.js: the things on the station desk, left to right: a green steel thermos,
// the old enamel mug (with a coffee ring beside it and, each frame, steam rising), the open
// logbook with ruled pages, a red margin, the shape of handwriting (nothing to read), a
// ribbon and a yellow pencil, and the desk lamp with its springs and cord. The cat that
// sleeps on the logbook's corner is in art-cat.js.
//
// art-room-inside.js calls paintDesk twice, lit and dark, with its `tone` (a colour as
// this light shows it); paintSteam is drawn every frame by art-room.js.

import { css, mix, roundRect, poly, line, rng, mark } from './art-kit.js';

// Colours as the lamp lights them.
const LIT = {
  grain: '#2a1a10',
  mug: '#e8e4da',
  mugRim: '#2f5a9a',
  coffee: '#3a2618',
  chip: '#17171b',
  flask: '#33574a',
  flaskHi: '#7fa898',
  steel: '#a3a49e',
  steelDark: '#5f615e',
  book: '#7a3a2e',
  bookEdge: '#a8584a',
  page: '#f1e8d4',
  pageEdge: '#d6cab0',
  rule: '#7a96c0',
  margin: '#c25a52',
  ink: '#34436e',
  ribbon: '#a83434',
  pencil: '#e2b232',
  pencilSide: '#b8862a',
  wood: '#e6c898',
  eraser: '#e0897e',
  lead: '#2a2a2e',
  lamp: '#3c5a52',
  lampHi: '#9ac0b0',
  shadeIn: '#f6e2b0',
  cord: '#1e1e22',
};

/** Paints everything on the desk. `tone(hex, alpha)` is a colour in this light. */
export function paintDesk(ctx, L, tone, lit) {
  coffeeRing(ctx, L, tone);
  thermos(ctx, L, tone);
  mug(ctx, L, tone);
  logbook(ctx, L, tone);
  lamp(ctx, L, tone, lit);
}

/** A shadow on the desk under something standing on it. */
function footShadow(ctx, tone, x, y, rx, ry) {
  ctx.fillStyle = tone('#000000', 0.3);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** An old ring where a wet mug once stood, a little off from where the mug is now. */
function coffeeRing(ctx, L, tone) {
  const m = L.mug;
  ctx.strokeStyle = tone(LIT.grain, 0.22);
  ctx.lineWidth = Math.max(0.8, 1.1 * L.k);
  ctx.beginPath();
  ctx.ellipse(m.x + m.w * 1.75, m.y + m.h + 2 * L.k, m.w * 0.5, m.w * 0.16, 0, Math.PI * 0.15, Math.PI * 1.85);
  ctx.stroke();
}

/** A green steel thermos with its cup screwed on as a lid, as night shifts bring. */
function thermos(ctx, L, tone) {
  const f = L.thermos;
  const { x, w } = f;
  const base = f.base;
  const top = base - f.h;
  const capH = f.h * 0.2;
  footShadow(ctx, tone, x + w / 2 + 2, base, w * 0.75, w * 0.18);
  // The body, rounder at the shoulder, lit from the lamp on the right.
  const body = ctx.createLinearGradient(x, 0, x + w, 0);
  body.addColorStop(0, tone(mix(LIT.flask, '#000000', 0.35)));
  body.addColorStop(0.65, tone(LIT.flask));
  body.addColorStop(1, tone(mix(LIT.flask, '#000000', 0.15)));
  ctx.fillStyle = body;
  roundRect(ctx, x, top + capH * 0.8, w, f.h - capH * 0.8, w * 0.22);
  ctx.fill();
  // Ribs round the grip, the steel foot ring and a long highlight.
  ctx.strokeStyle = tone(mix(LIT.flask, '#000000', 0.45), 0.8);
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) line(ctx, x + 1, top + f.h * (0.42 + i * 0.05), x + w - 1, top + f.h * (0.42 + i * 0.05));
  ctx.fillStyle = tone(LIT.steelDark);
  ctx.fillRect(x + 0.5, base - f.h * 0.06, w - 1, f.h * 0.06);
  ctx.fillStyle = tone(LIT.flaskHi, 0.45);
  ctx.fillRect(x + w * 0.68, top + capH * 1.3, Math.max(1, w * 0.1), f.h * 0.28);
  ctx.fillRect(x + w * 0.68, top + f.h * 0.64, Math.max(1, w * 0.1), f.h * 0.22);
  // The cup on top: steel, a little wider, with a rim.
  const cap = ctx.createLinearGradient(x, 0, x + w, 0);
  cap.addColorStop(0, tone(LIT.steelDark));
  cap.addColorStop(0.7, tone(LIT.steel));
  cap.addColorStop(1, tone(mix(LIT.steel, '#000000', 0.2)));
  ctx.fillStyle = cap;
  roundRect(ctx, x - w * 0.04, top, w * 1.08, capH, w * 0.12);
  ctx.fill();
  ctx.fillStyle = tone('#000000', 0.25);
  ctx.fillRect(x - w * 0.04, top + capH * 0.72, w * 1.08, Math.max(0.8, capH * 0.12));
  ctx.fillStyle = tone('#ffffff', 0.25);
  ctx.fillRect(x - w * 0.04 + 1, top + 0.5, w * 1.08 - 2, 0.8);
  mark('thermos', x - w * 0.1, top - 1, w * 1.9, f.h + 3, 'col');
}

function mug(ctx, L, tone) {
  const m = L.mug;
  const r = m.w / 2;
  const ry = r * 0.32;
  footShadow(ctx, tone, m.x + r + 2, m.y + m.h, r * 1.3, ry * 1.1);
  // The handle, then the body of an old enamel mug with a blue rim.
  ctx.strokeStyle = tone(LIT.mug);
  ctx.lineWidth = Math.max(2, m.w * 0.13);
  ctx.beginPath();
  ctx.ellipse(m.x - m.w * 0.02, m.y + m.h * 0.45, m.w * 0.22, m.h * 0.24, 0, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  const body = ctx.createLinearGradient(m.x, 0, m.x + m.w, 0);
  body.addColorStop(0, tone(mix(LIT.mug, '#000000', 0.28)));
  body.addColorStop(0.7, tone(LIT.mug));
  body.addColorStop(1, tone(mix(LIT.mug, '#000000', 0.1)));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.lineTo(m.x, m.y + m.h);
  ctx.ellipse(m.x + r, m.y + m.h, r, ry, 0, Math.PI, 0, true);
  ctx.lineTo(m.x + m.w, m.y);
  ctx.closePath();
  ctx.fill();
  // The blue line round the foot and a shine from the lamp.
  ctx.strokeStyle = tone(LIT.mugRim, 0.9);
  ctx.lineWidth = Math.max(0.8, m.h * 0.05);
  ctx.beginPath();
  ctx.ellipse(m.x + r, m.y + m.h - ry * 0.4, r * 0.98, ry, 0, Math.PI * 0.05, Math.PI * 0.95);
  ctx.stroke();
  ctx.fillStyle = tone('#ffffff', 0.5);
  ctx.fillRect(m.x + m.w * 0.7, m.y + m.h * 0.18, Math.max(1, m.w * 0.08), m.h * 0.55);
  ctx.fillStyle = tone(LIT.mugRim);
  ctx.beginPath();
  ctx.ellipse(m.x + r, m.y, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  // A chip out of the rim at the front, where the black steel shows, as an old mug has.
  ctx.fillStyle = tone(LIT.chip, 0.9);
  poly(ctx, [[m.x + m.w * 0.3, m.y + ry * 0.75], [m.x + m.w * 0.42, m.y + ry * 0.9], [m.x + m.w * 0.4, m.y + ry + m.h * 0.07], [m.x + m.w * 0.33, m.y + ry + m.h * 0.05]]);
  ctx.fill();
  ctx.fillStyle = tone(LIT.coffee);
  ctx.beginPath();
  ctx.ellipse(m.x + r, m.y + 0.6, r * 0.84, ry * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  // The lamp caught in the coffee.
  ctx.fillStyle = tone('#ffe2b0', 0.35);
  ctx.beginPath();
  ctx.ellipse(m.x + r * 1.3, m.y + 0.4, r * 0.3, ry * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  mark('mug', m.x - m.w * 0.3, m.y - ry, m.w * 1.6, m.h + ry * 2.2, 'col');
}

/**
 * Handwriting seen from a chair away: words as wavy runs of ink with a gap between them,
 * now and then a tall letter. It is only the look of writing; nothing can be read.
 */
function scribble(ctx, x, y, len, size, rand) {
  ctx.beginPath();
  let pen = false;
  let word = 2 + rand() * 7;
  for (let d = 0; d < len; d += 0.55) {
    word -= 0.55;
    if (word < 0) {
      pen = false;
      word = 2 + rand() * 8;
      d += size * 0.9;
      continue;
    }
    // Letters go up and down unevenly; a few reach higher, like an l or a d.
    const tall = rand() < 0.06 ? -size * 0.7 : 0;
    const yy = y - size * (0.2 + rand() * 0.45) + tall;
    if (pen) ctx.lineTo(x + d, yy);
    else ctx.moveTo(x + d, yy);
    pen = true;
  }
  ctx.stroke();
}

function logbook(ctx, L, tone) {
  const b = L.book;
  const k = L.k;
  // An open logbook lying on the desk: the far edge narrower, as the desk is seen from above.
  const inset = b.w * 0.05;
  const mid = b.x + b.w / 2;
  const cover = [[b.x + inset - 2, b.y - 2], [b.x + b.w - inset + 2, b.y - 2], [b.x + b.w + 2, b.y + b.h + 2], [b.x - 2, b.y + b.h + 2]];
  ctx.fillStyle = tone('#000000', 0.28);
  poly(ctx, cover.map(([x, y]) => [x + 3, y + 3]));
  ctx.fill();
  ctx.fillStyle = tone(LIT.book);
  poly(ctx, cover);
  ctx.fill();
  ctx.strokeStyle = tone(LIT.bookEdge, 0.6);
  ctx.lineWidth = 0.8;
  line(ctx, b.x - 2, b.y + b.h + 2, b.x + b.w + 2, b.y + b.h + 2);
  // The page block's edge along the near side, then the two pages.
  ctx.fillStyle = tone(LIT.pageEdge);
  poly(ctx, [[b.x, b.y + b.h - 1], [mid, b.y + b.h], [b.x + b.w, b.y + b.h - 1], [b.x + b.w, b.y + b.h + 1], [mid, b.y + b.h + 1.6], [b.x, b.y + b.h + 1]]);
  ctx.fill();
  const left = [[b.x + inset, b.y], [mid, b.y + 1], [mid, b.y + b.h], [b.x, b.y + b.h - 1]];
  const right = [[mid, b.y + 1], [b.x + b.w - inset, b.y], [b.x + b.w, b.y + b.h - 1], [mid, b.y + b.h]];
  ctx.fillStyle = tone(LIT.page);
  poly(ctx, left);
  ctx.fill();
  ctx.fillStyle = tone(mix(LIT.page, '#c8b898', 0.3));
  poly(ctx, right);
  ctx.fill();
  // The pages curve down into the spine, so they darken toward it.
  for (const [x0, x1] of [[mid - b.w * 0.06, mid], [mid + b.w * 0.05, mid]]) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, tone('#5a4630', 0));
    g.addColorStop(1, tone('#5a4630', 0.3));
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(x0, x1), b.y + 1, Math.abs(x1 - x0), b.h - 1);
  }
  // Ruled lines and a red margin on each page, narrowing toward the far edge.
  const edgeL = (v) => b.x + inset * (1 - v);
  const edgeR = (v) => b.x + b.w - inset * (1 - v);
  const rows = 8;
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = tone(LIT.rule, 0.4);
  for (let i = 1; i < rows; i++) {
    const v = i / rows;
    const y = b.y + v * b.h;
    line(ctx, edgeL(v) + 1, y, mid - 1, y);
    line(ctx, mid + 1, y, edgeR(v) - 1, y);
  }
  ctx.strokeStyle = tone(LIT.margin, 0.45);
  const pw = (mid - b.x) * 0.2;
  line(ctx, edgeL(0) + pw, b.y + 1, edgeL(1) + pw, b.y + b.h - 1);
  line(ctx, mid + pw * 0.9, b.y + 1, mid + pw * 0.9, b.y + b.h);
  // The night's entries: a time in the margin, then a line of writing. The left page is
  // full; on the right the shift has only begun.
  const rand = rng(41);
  const size = Math.max(1.4, 1.7 * k);
  ctx.strokeStyle = tone(LIT.ink, 0.55);
  ctx.lineWidth = 0.6;
  for (let i = 1; i < rows; i++) {
    const v = i / rows;
    const y = b.y + v * b.h - 0.6;
    const lx = edgeL(v);
    scribble(ctx, lx + 2, y, pw - 4, size * 0.8, rand);
    scribble(ctx, lx + pw + 2, y, (mid - lx - pw - 5) * (0.5 + rand() * 0.45), size, rand);
    if (i < 4) {
      scribble(ctx, mid + 2, y, pw * 0.9 - 3, size * 0.8, rand);
      scribble(ctx, mid + pw + 2, y, (edgeR(v) - mid - pw - 4) * (i === 3 ? 0.35 : 0.5 + rand() * 0.45), size, rand);
    }
  }
  // A ribbon from the spine, hanging over the near edge with its end cut in a V.
  const rw = Math.max(1.6, 2.2 * k);
  ctx.fillStyle = tone(LIT.ribbon);
  poly(ctx, [[mid - rw / 2, b.y + b.h - 2], [mid + rw / 2, b.y + b.h - 2], [mid + rw / 2 + 1, b.y + b.h + 7 * k], [mid + 0.5, b.y + b.h + 5.5 * k], [mid - rw / 2 + 1, b.y + b.h + 7 * k]]);
  ctx.fill();
  pencil(ctx, tone, b.x + b.w * 0.12, b.y + b.h * 0.9, b.x + b.w * 0.44, b.y + b.h * 0.58, Math.max(2, 2.6 * k));
  mark('logbook', b.x - 2, b.y - 2, b.w + 7, b.h + 7, 'col');
}

/** A yellow pencil from its eraser (x0, y0) to its point (x1, y1), lying on the page. */
function pencil(ctx, tone, x0, y0, x1, y1, pw) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  ctx.fillStyle = tone('#000000', 0.22);
  ctx.fillRect(1, 1.2, len * 0.9, pw);
  ctx.fillStyle = tone(LIT.eraser);
  roundRect(ctx, 0, -pw / 2, len * 0.07, pw, pw * 0.35);
  ctx.fill();
  ctx.fillStyle = tone(LIT.steel);
  ctx.fillRect(len * 0.06, -pw / 2, len * 0.07, pw);
  ctx.fillStyle = tone(LIT.pencil);
  ctx.fillRect(len * 0.13, -pw / 2, len * 0.72, pw);
  // One flat of the six-sided body in shade.
  ctx.fillStyle = tone(LIT.pencilSide);
  ctx.fillRect(len * 0.13, pw * 0.12, len * 0.72, pw * 0.38);
  ctx.fillStyle = tone(LIT.wood);
  poly(ctx, [[len * 0.85, -pw / 2], [len * 0.97, -pw * 0.12], [len * 0.97, pw * 0.12], [len * 0.85, pw / 2]]);
  ctx.fill();
  ctx.fillStyle = tone(LIT.lead);
  poly(ctx, [[len * 0.95, -pw * 0.18], [len, 0], [len * 0.95, pw * 0.18]]);
  ctx.fill();
  ctx.restore();
}

/** A lamp spring: a zigzag running beside an arm, offset `off` to its side. */
function spring(ctx, a, b, off, turns) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.beginPath();
  for (let i = 0; i <= turns * 2; i++) {
    const s = 0.2 + (0.6 * i) / (turns * 2);
    const side = off + (i % 2 ? 1 : -1) * Math.abs(off) * 0.35;
    const x = a[0] + dx * s + nx * side;
    const y = a[1] + dy * s + ny * side;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
}

function lamp(ctx, L, tone, lit) {
  const p = L.lamp;
  const k = L.k;
  const metal = tone(LIT.lamp);
  // The cord from the foot to the back of the desk, where it drops down behind.
  ctx.strokeStyle = tone(LIT.cord);
  ctx.lineWidth = Math.max(1.2, 1.6 * k);
  ctx.beginPath();
  ctx.moveTo(p.base[0] + p.baseR * 0.85, p.base[1] - 1);
  ctx.bezierCurveTo(p.base[0] + p.baseR * 1.8, p.base[1] + 3 * k, L.U(0.99), p.base[1] - 2 * k, L.U(0.985), L.deskY + 1);
  ctx.stroke();
  footShadow(ctx, tone, p.base[0], p.base[1] + 2, p.baseR * 1.3, p.baseR * 0.35);
  // The heavy round foot, its top edge catching the light.
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.ellipse(p.base[0], p.base[1], p.baseR, p.baseR * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(p.base[0] - p.baseR * 0.25, p.base[1] - p.baseR * 0.35, p.baseR * 0.5, p.baseR * 0.35);
  ctx.strokeStyle = tone(LIT.lampHi, lit ? 0.6 : 0.3);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(p.base[0], p.base[1] - 0.6, p.baseR * 0.94, p.baseR * 0.26, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  // Two arms with their springs, hinged at the elbow.
  ctx.strokeStyle = metal;
  ctx.lineCap = 'round';
  ctx.lineWidth = p.arm;
  const foot = [p.base[0], p.base[1] - p.baseR * 0.3];
  line(ctx, ...foot, ...p.elbow);
  line(ctx, ...p.elbow, ...p.pivot);
  ctx.lineCap = 'butt';
  ctx.lineWidth = Math.max(0.7, p.arm * 0.3);
  ctx.strokeStyle = tone(LIT.lampHi, lit ? 0.55 : 0.25);
  spring(ctx, foot, p.elbow, p.arm * 1.3, 7);
  spring(ctx, p.elbow, p.pivot, -p.arm * 1.3, 6);
  for (const j of [p.elbow, p.pivot]) {
    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.arc(j[0], j[1], p.arm * 1.1, 0, Math.PI * 2);
    ctx.fill();
    // The wing nut that holds the joint.
    ctx.fillStyle = tone(LIT.lampHi, lit ? 0.7 : 0.3);
    ctx.beginPath();
    ctx.arc(j[0] - p.arm * 0.2, j[1] - p.arm * 0.2, p.arm * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  // The shade: a cone from the pivot opening toward the desk.
  const [ax, ay] = p.pivot;
  const [ox, oy] = p.mouth;
  const dx = ox - ax;
  const dy = oy - ay;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const back = p.shadeR * 0.35;
  ctx.fillStyle = metal;
  poly(ctx, [[ax + nx * back, ay + ny * back], [ox + nx * p.shadeR, oy + ny * p.shadeR], [ox - nx * p.shadeR, oy - ny * p.shadeR], [ax - nx * back, ay - ny * back]]);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ax, ay, back * 1.1, 0, Math.PI * 2);
  ctx.fill();
  // A broad soft shine along the shade's back, and the switch on top.
  ctx.strokeStyle = tone(LIT.lampHi, lit ? 0.35 : 0.15);
  ctx.lineWidth = Math.max(1.5, p.shadeR * 0.22);
  line(ctx, ax + nx * back * 0.4, ay + ny * back * 0.4, ox + nx * p.shadeR * 0.55, oy + ny * p.shadeR * 0.55);
  ctx.strokeStyle = tone(LIT.lampHi, lit ? 0.8 : 0.4);
  ctx.lineWidth = 1;
  line(ctx, ax + nx * back, ay + ny * back, ox + nx * p.shadeR, oy + ny * p.shadeR);
  ctx.fillStyle = tone('#1a1c1e');
  const sw = [ax + dx * 0.2 + nx * back * 1.6, ay + dy * 0.2 + ny * back * 1.6];
  roundRect(ctx, sw[0] - 1.6 * k, sw[1] - 1.4 * k, 3.2 * k, 2.8 * k, 1 * k);
  ctx.fill();
  // The mouth of the shade, seen a little from below: the inside shows.
  ctx.fillStyle = tone(lit ? LIT.shadeIn : '#30343c');
  ctx.beginPath();
  ctx.ellipse(ox, oy, p.shadeR, p.shadeR * 0.38, Math.atan2(ny, nx), 0, Math.PI * 2);
  ctx.fill();
  mark('lamp', Math.min(p.base[0] - p.baseR, ox - p.shadeR, p.pivot[0]) - 2, Math.min(p.elbow[1], ay, oy - p.shadeR) - p.arm - 2,
    Math.max(p.base[0] + p.baseR, p.elbow[0] + p.arm) - Math.min(p.base[0] - p.baseR, ox - p.shadeR) + 4,
    p.base[1] + p.baseR * 0.4 - (Math.min(p.elbow[1], ay, oy - p.shadeR) - p.arm) + 4, 'room');
}

/**
 * Steam off the coffee: two thin wisps that rise, sway and thin out. Seen only where the
 * lamp lights it. Drawn each frame, a few short strokes.
 */
export function paintSteam(ctx, L, t, lamp) {
  if (lamp < 0.05) return;
  const m = L.mug;
  const x0 = m.x + m.w / 2;
  const y0 = m.y - 1;
  const rise = 30 * L.k;
  ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    // Each wisp comes and goes: it fades out now and then and starts again.
    const life = 0.5 + 0.5 * Math.sin(t * 0.45 + i * 2.6);
    if (life < 0.08) continue;
    const pts = [];
    for (let j = 0; j <= 9; j++) {
      const p = j / 9;
      const y = y0 - p * rise;
      const sway = Math.sin(p * 5.5 - t * 1.8 + i * 2.3) * (0.6 + p * 3.2) * L.k;
      pts.push([x0 + (i - 0.5) * 3 * L.k + sway + p * (i ? 3 : -2) * L.k, y]);
    }
    // In three parts, each fainter and wider than the one below it.
    for (let part = 0; part < 3; part++) {
      ctx.strokeStyle = css('#fff3e2', 0.15 * lamp * life * (1 - part * 0.3));
      ctx.lineWidth = (1.3 + part * 0.9) * L.k;
      ctx.beginPath();
      for (let j = part * 3; j <= part * 3 + 3; j++) (j === part * 3 ? ctx.moveTo(...pts[j]) : ctx.lineTo(...pts[j]));
      ctx.stroke();
    }
  }
  ctx.lineCap = 'butt';
}
