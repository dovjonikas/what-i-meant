// art-room-inside.js: the inside of the coast radio station, seen from the operator's
// chair: the wall, the long window and its frame, the desk top under it, the cork board
// and the wall clock's case, and the son's drawing taped to the window. What stands on
// the desk is in art-room-desk.js. art-room.js paints this twice, once as the lamp lights
// it (warm) and once in the dark of the night outside, and fades between the two as the
// lamp turns.

import { css, mix, roundRect, rng, mark } from './art-kit.js';
import { paintKidDrawing, tape } from './art-drawing.js';
import { paintDesk } from './art-room-desk.js';

// Colours as the lamp lights them. In the dark each one sinks into the night's own colour.
const LIT = {
  wallTop: '#5a4232',
  wall: '#a07a5a',
  frame: '#5e4430',
  frameHi: '#c8a27a',
  sill: '#8a6a4c',
  sillTop: '#d2b08a',
  under: '#6e5240',
  deskFar: '#7a5234',
  deskNear: '#4a3020',
  grain: '#2a1a10',
  cork: '#b88a54',
  corkFrame: '#6a4a30',
  note: '#efe6d2',
  noteLine: '#8a8aa0',
  photo: '#55708a',
  clockBox: '#15161a',
  clockRim: '#4a4440',
};

/** Paints the inside. `lit` true is the lamp's light; false is the night with `amb` its colour. */
export function paintInside(ctx, L, mood, lit) {
  const amb = mood.room;
  // In the dark only a trace of each thing's own colour is left; the night's blue is the rest.
  const tone = (c, a = 1) => (lit ? css(c, a) : css(mix(mix(c, amb, 0.86), '#04060c', 0.12), a));
  const edge = lit ? css('#ffd8a0', 0.35) : css(mood.edge, 0.45);
  const { w, h, k } = L;

  // The wall, darker toward the ceiling.
  const wall = ctx.createLinearGradient(0, 0, 0, L.deskY);
  wall.addColorStop(0, tone(LIT.wallTop));
  wall.addColorStop(1, tone(LIT.wall));
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, L.deskY + 2);

  // The window: head, sill and posts, then the panes cut out so the night shows through.
  ctx.fillStyle = tone(LIT.frame);
  ctx.fillRect(0, L.headY, w, L.glassY - L.headY);
  for (const px of L.posts) ctx.fillRect(px - L.post / 2, L.headY, L.post, L.sillY - L.headY);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (const p of L.panes) ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.restore();
  // Edges of the frame that catch the light: from outside at night, from the lamp when on.
  ctx.fillStyle = edge;
  ctx.fillRect(0, L.glassY - 1, w, 1);
  for (const px of L.posts) {
    ctx.fillRect(px + L.post / 2 - 1, L.glassY, 1, L.sillY - L.glassY);
    ctx.fillRect(px - L.post / 2, L.glassY, 1, L.sillY - L.glassY);
  }
  // The sill: its top face, then its front edge.
  ctx.fillStyle = tone(LIT.sillTop);
  ctx.fillRect(0, L.sillY, w, L.sillTopH);
  ctx.fillStyle = tone(LIT.sill);
  ctx.fillRect(0, L.sillY + L.sillTopH, w, L.sillFront);
  ctx.fillStyle = tone(LIT.under);
  ctx.fillRect(0, L.sillY + L.sillTopH + L.sillFront, w, L.deskY - (L.sillY + L.sillTopH + L.sillFront));
  ctx.fillStyle = tone('#000000', 0.25);
  ctx.fillRect(0, L.sillY + L.sillTopH + L.sillFront, w, 2);

  // The desk top, running on under the console so the console seems to stand on it.
  const desk = ctx.createLinearGradient(0, L.deskY, 0, h);
  desk.addColorStop(0, tone(LIT.deskFar));
  desk.addColorStop(1, tone(LIT.deskNear));
  ctx.fillStyle = desk;
  ctx.fillRect(0, L.deskY, w, h - L.deskY);
  ctx.fillStyle = tone('#000000', 0.3);
  ctx.fillRect(0, L.deskY, w, 2);
  const rand = rng(41);
  ctx.strokeStyle = tone(LIT.grain, 0.14);
  ctx.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    const y = L.deskY + 6 + (h - L.deskY) * rand() ** 1.3;
    const x = rand() * w;
    const len = 60 + rand() * 220;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y + (rand() - 0.5) * 4, x + len, y + (rand() - 0.5) * 3);
    ctx.stroke();
  }

  corkBoard(ctx, L, tone);
  clockCase(ctx, L, tone);
  drawing(ctx, L, lit, amb);
  paintDesk(ctx, L, tone, lit);
}

function corkBoard(ctx, L, tone) {
  const b = L.cork;
  ctx.fillStyle = tone('#000000', 0.3);
  ctx.fillRect(b.x + 2, b.y + 3, b.w, b.h);
  ctx.fillStyle = tone(LIT.corkFrame);
  ctx.fillRect(b.x, b.y, b.w, b.h);
  const f = Math.max(2, L.k * 3);
  ctx.fillStyle = tone(LIT.cork);
  ctx.fillRect(b.x + f, b.y + f, b.w - f * 2, b.h - f * 2);
  // Cork speckle.
  const rand = rng(8);
  ctx.fillStyle = tone('#6a4a28', 0.5);
  for (let i = 0; i < b.w * b.h * 0.04; i++) ctx.fillRect(b.x + f + rand() * (b.w - f * 2), b.y + f + rand() * (b.h - f * 2), 1, 1);
  // Pinned papers: a frequency list, a duty roster, a small photo of the sea.
  const notes = [
    [0.07, 0.16, 0.3, 0.68, -0.05, LIT.note],
    [0.42, 0.12, 0.26, 0.5, 0.04, '#f2e2a0'],
    [0.73, 0.2, 0.2, 0.56, -0.03, LIT.photo],
  ];
  notes.forEach(([u, v, nw, nh, rot, col], i) => {
    const x = b.x + u * b.w;
    const y = b.y + v * b.h;
    ctx.save();
    ctx.translate(x + (nw * b.w) / 2, y + (nh * b.h) / 2);
    ctx.rotate(rot);
    ctx.fillStyle = tone(col);
    ctx.fillRect((-nw * b.w) / 2, (-nh * b.h) / 2, nw * b.w, nh * b.h);
    if (i < 2) {
      ctx.fillStyle = tone(LIT.noteLine, 0.6);
      for (let r = 0.2; r < 0.9; r += 0.16) ctx.fillRect((-nw * b.w) / 2 + 3, (-nh * b.h) / 2 + r * nh * b.h, nw * b.w * (0.5 + ((r * 7) % 0.4)), 1);
    } else {
      ctx.fillStyle = tone('#a8c0d0');
      ctx.fillRect((-nw * b.w) / 2 + 2, (-nh * b.h) / 2 + 2, nw * b.w - 4, nh * b.h * 0.45);
      ctx.fillStyle = tone('#2a4a6a');
      ctx.fillRect((-nw * b.w) / 2 + 2, (-nh * b.h) / 2 + 2 + nh * b.h * 0.45, nw * b.w - 4, nh * b.h * 0.3);
    }
    ctx.restore();
    ctx.fillStyle = tone(['#c83a2e', '#2e6ac8', '#e0b030'][i]);
    ctx.beginPath();
    ctx.arc(x + (nw * b.w) / 2, y + 1.5, Math.max(1.4, L.k * 2), 0, Math.PI * 2);
    ctx.fill();
  });
  mark('cork board', b.x, b.y, b.w + 2, b.h + 3, 'room');
}

function clockCase(ctx, L, tone) {
  const c = L.clock;
  ctx.fillStyle = tone('#000000', 0.35);
  roundRect(ctx, c.x + 2, c.y + 3, c.w, c.h, 3 * L.k);
  ctx.fill();
  ctx.fillStyle = tone(LIT.clockRim);
  roundRect(ctx, c.x, c.y, c.w, c.h, 3 * L.k);
  ctx.fill();
  ctx.fillStyle = css('#07090c');
  roundRect(ctx, c.x + 2.5 * L.k, c.y + 2.5 * L.k, c.w - 5 * L.k, c.h - 5 * L.k, 2 * L.k);
  ctx.fill();
  mark('clock', c.x, c.y, c.w + 2, c.h + 3, 'room');
}

function drawing(ctx, L, lit, amb) {
  const d = L.drawing;
  ctx.save();
  ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
  ctx.rotate(d.angle);
  ctx.fillStyle = css('#000000', 0.3);
  ctx.fillRect(-d.w / 2 + 2, -d.h / 2 + 3, d.w, d.h);
  // The lamp reaches it only faintly; the window's night light does the rest.
  paintKidDrawing(ctx, -d.w / 2, -d.h / 2, d.w, d.h, lit ? 0.8 : 0.3, amb);
  const tw = d.w * 0.22;
  const th = Math.max(4, d.h * 0.09);
  tape(ctx, -d.w / 2 + tw * 0.2, -d.h / 2, tw, th, -0.6, lit ? 0.9 : 0.35, amb);
  tape(ctx, d.w / 2 - tw * 0.2, -d.h / 2, tw, th, 0.6, lit ? 0.9 : 0.35, amb);
  tape(ctx, -d.w / 2 + tw * 0.2, d.h / 2, tw, th, 0.6, lit ? 0.9 : 0.35, amb);
  tape(ctx, d.w / 2 - tw * 0.2, d.h / 2, tw, th, -0.6, lit ? 0.9 : 0.35, amb);
  ctx.restore();
  mark('drawing', d.x - 3, d.y - 3, d.w + 6, d.h + 6, 'room');
}
