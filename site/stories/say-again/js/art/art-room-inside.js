// art-room-inside.js: the inside of the coast radio station, seen from the operator's
// chair: the wall, the long window with the screws, latches and worn paint of its frame,
// binoculars on the sill, the desk top, the cork board (a tide table, the channel list, a
// photo of a boat), the spare headset on its hook, the wall clock's case with its UTC
// plate, and the son's drawing taped to the window. What stands on the desk is in
// art-room-desk.js. art-room.js paints this twice, once as the lamp lights
// it (warm) and once in the dark of the night outside, and fades between the two as the
// lamp turns.

import { css, mix, roundRect, rng, mark, line, poly } from './art-kit.js';
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
  brass: '#a8844a',
  plate: '#b8b4a8',
  black: '#303136',
  leather: '#4a3e35',
  steel: '#8c8e90',
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
  frameWear(ctx, L, tone);

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
  headset(ctx, L, tone, lit, edge);
  clockCase(ctx, L, tone);
  binoculars(ctx, L, tone, lit);
  drawing(ctx, L, lit, amb);
  paintDesk(ctx, L, tone, lit);
}

/** Screws in the frame, a latch on each post, and paint worn pale where hands and elbows go. */
function frameWear(ctx, L, tone) {
  const k = L.k;
  const screw = (x, y) => {
    const r = Math.max(0.8, 1.2 * k);
    ctx.fillStyle = tone('#24180f', 0.6);
    ctx.beginPath();
    ctx.arc(x + 0.3, y + 0.4, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tone(LIT.frameHi, 0.6);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tone('#24180f', 0.7);
    ctx.lineWidth = 0.5;
    line(ctx, x - r * 0.6, y + r * 0.2, x + r * 0.6, y - r * 0.2);
  };
  const midHead = (L.headY + L.glassY) / 2;
  const step = L.posts[1] - L.posts[0];
  for (const px of L.posts) {
    screw(px, L.glassY + 9 * k);
    screw(px, L.sillY - 9 * k);
    screw(px + step / 3, midHead);
    screw(px + (step * 2) / 3, midHead);
    // A latch: a brass plate with its handle turned down, shut.
    const ly = L.glassY + (L.sillY - L.glassY) * 0.52;
    ctx.fillStyle = tone(LIT.brass, 0.9);
    roundRect(ctx, px - L.post * 0.28, ly - 6 * k, L.post * 0.56, 12 * k, 1.5 * k);
    ctx.fill();
    ctx.strokeStyle = tone(mix(LIT.brass, '#ffffff', 0.25));
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.4, 2 * k);
    line(ctx, px, ly - 2 * k, px + 0.6 * k, ly + 9 * k);
    ctx.lineCap = 'butt';
    ctx.fillStyle = tone('#3a2a14', 0.8);
    ctx.beginPath();
    ctx.arc(px, ly - 2 * k, Math.max(0.8, 1.3 * k), 0, Math.PI * 2);
    ctx.fill();
  }
  // Worn paint: the sill pale in the middle where the operator leans, chips along the frame.
  const rand = rng(52);
  ctx.fillStyle = tone(LIT.frameHi, 0.14);
  ctx.beginPath();
  ctx.ellipse(L.U(0.48), L.sillY + L.sillTopH * 0.5, L.colW * 0.22, L.sillTopH * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tone('#fff0d8', 0.2);
  ctx.fillRect(0, L.sillY + L.sillTopH - 1, L.w, 1);
  ctx.fillStyle = tone(LIT.frameHi, 0.3);
  for (let x = rand() * 30; x < L.w; x += 18 + rand() * 40) {
    ctx.fillRect(x, L.headY + 1 + rand() * (L.glassY - L.headY - 3), 1 + rand() * 2.5, 1);
    ctx.fillRect(x + rand() * 20, L.sillY + 1 + rand() * (L.sillTopH - 2), 1 + rand() * 3, 1);
  }
}

/** A sheet pinned to the board: its shadow, `draw` for what is on it, then the pin. */
function pinned(ctx, L, tone, x, y, w, h, rot, pin, draw) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.fillStyle = tone('#000000', 0.25);
  ctx.fillRect(-w / 2 + 1, -h / 2 + 1.3, w, h);
  draw(-w / 2, -h / 2, w, h);
  ctx.restore();
  const r = Math.max(1.3, 1.9 * L.k);
  ctx.fillStyle = tone('#000000', 0.3);
  ctx.beginPath();
  ctx.arc(x + w / 2 + 0.8, y + r + 1.4, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tone(pin);
  ctx.beginPath();
  ctx.arc(x + w / 2, y + r + 0.6, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tone('#ffffff', 0.45);
  ctx.fillRect(x + w / 2 - r * 0.45, y + r * 0.35, r * 0.5, r * 0.5);
}

function corkBoard(ctx, L, tone) {
  const b = L.cork;
  const k = L.k;
  ctx.fillStyle = tone('#000000', 0.3);
  ctx.fillRect(b.x + 2, b.y + 3, b.w, b.h);
  ctx.fillStyle = tone(LIT.corkFrame);
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = tone(LIT.frameHi, 0.35);
  ctx.fillRect(b.x, b.y, b.w, 1);
  const f = Math.max(2, k * 3);
  ctx.fillStyle = tone(LIT.cork);
  ctx.fillRect(b.x + f, b.y + f, b.w - f * 2, b.h - f * 2);
  // Cork speckle, and the small holes of pins long gone.
  const rand = rng(8);
  ctx.fillStyle = tone('#6a4a28', 0.5);
  for (let i = 0; i < b.w * b.h * 0.04; i++) ctx.fillRect(b.x + f + rand() * (b.w - f * 2), b.y + f + rand() * (b.h - f * 2), 1, 1);
  ctx.fillStyle = tone('#3a2614', 0.5);
  for (let i = 0; i < 9; i++) ctx.fillRect(b.x + f + rand() * (b.w - f * 2), b.y + f + rand() * (b.h - f * 2), 1.2, 1.2);
  const at = (u, v) => [b.x + u * b.w, b.y + v * b.h];
  // The tide table: a header, columns of times and heights, and the curve of the tide.
  pinned(ctx, L, tone, ...at(0.06, 0.13), b.w * 0.3, b.h * 0.76, -0.04, '#c83a2e', (x, y, w, h) => {
    ctx.fillStyle = tone('#f2ece0');
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = tone('#3a6aa8');
    ctx.fillRect(x + 1.5, y + 2, w - 3, h * 0.12);
    ctx.fillStyle = tone('#4a5a7a', 0.6);
    for (let r = 0; r < 4; r++) {
      const ry = y + h * (0.26 + r * 0.1);
      ctx.fillRect(x + 2, ry, w * 0.22, 0.8);
      ctx.fillRect(x + w * 0.38, ry, w * 0.18, 0.8);
      ctx.fillRect(x + w * 0.68, ry, w * 0.2, 0.8);
    }
    ctx.strokeStyle = tone('#3a6aa8', 0.85);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const px = x + 2 + ((w - 4) * i) / 12;
      const py = y + h * 0.8 - Math.sin((i / 12) * Math.PI * 2.2) * h * 0.09;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
  });
  // The channel list: 16 at the top in red, the working channels under it.
  pinned(ctx, L, tone, ...at(0.4, 0.1), b.w * 0.25, b.h * 0.64, 0.035, '#2e6ac8', (x, y, w, h) => {
    ctx.fillStyle = tone('#f4e6b0');
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = tone('#c0392b');
    ctx.font = `bold ${Math.max(4, 6 * k).toFixed(1)}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText('16', x + 2, y + h * 0.1);
    ctx.textBaseline = 'alphabetic';
    ctx.fillRect(x + w * 0.55, y + h * 0.18, w * 0.35, 1);
    ctx.fillStyle = tone('#4a4a5a', 0.65);
    for (let r = 0; r < 4; r++) {
      const ry = y + h * (0.42 + r * 0.13);
      ctx.fillRect(x + 2, ry, w * 0.18, 1);
      ctx.fillRect(x + w * 0.32, ry, w * (0.35 + ((r * 0.37) % 0.25)), 0.7);
    }
  });
  // A photo of a fishing boat at sea, in a white border.
  pinned(ctx, L, tone, ...at(0.7, 0.17), b.w * 0.24, b.h * 0.66, -0.05, '#e0b030', (x, y, w, h) => {
    ctx.fillStyle = tone('#f0ece4');
    ctx.fillRect(x, y, w, h);
    const ix = x + 1.5;
    const iy = y + 1.5;
    const iw = w - 3;
    const ih = h * 0.72;
    ctx.fillStyle = tone('#9ab8d0');
    ctx.fillRect(ix, iy, iw, ih * 0.55);
    ctx.fillStyle = tone('#e8c8a0');
    ctx.fillRect(ix, iy + ih * 0.42, iw, ih * 0.13);
    ctx.fillStyle = tone('#2f5a80');
    ctx.fillRect(ix, iy + ih * 0.55, iw, ih * 0.45);
    ctx.fillStyle = tone('#b83a2e');
    poly(ctx, [[ix + iw * 0.25, iy + ih * 0.6], [ix + iw * 0.8, iy + ih * 0.6], [ix + iw * 0.72, iy + ih * 0.72], [ix + iw * 0.32, iy + ih * 0.72]]);
    ctx.fill();
    ctx.fillStyle = tone('#f4f0e8');
    ctx.fillRect(ix + iw * 0.45, iy + ih * 0.47, iw * 0.18, ih * 0.13);
  });
  mark('cork board', b.x, b.y, b.w + 2, b.h + 3, 'room');
}

/**
 * The spare headset hung on a hook: the band over the hook, the two ear cups, the boom
 * microphone, and the coiled cord hanging down toward the window.
 */
function headset(ctx, L, tone, lit, edge) {
  const { x, y, r: R } = L.headset;
  const k = L.k;
  ctx.fillStyle = tone(LIT.brass);
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.2, 1.8 * k), 0, Math.PI * 2);
  ctx.fill();
  // The cord first, so the cup hides where it goes in: coil after coil down to a plug.
  const cupY = y + R + 3 * k;
  const cupH = 11.5 * k;
  const end = L.headY - 5 * k;
  ctx.strokeStyle = tone(LIT.black);
  ctx.lineWidth = Math.max(0.7, 0.9 * k);
  ctx.beginPath();
  const top = cupY + cupH * 0.8;
  const turns = Math.max(4, Math.round((end - top) / (2.6 * k)));
  for (let i = 0; i <= turns * 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const px = x + R + 1.5 * k + Math.sin(a) * 2.2 * k;
    const py = top + ((end - top) * i) / (turns * 10) + Math.cos(a) * 0.9 * k;
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.fillStyle = tone(LIT.steel);
  ctx.fillRect(x + R + 0.6 * k, end, 1.8 * k, 4 * k);
  // The band: wire, then the leather pad over the top, lit along its upper edge.
  ctx.strokeStyle = tone(LIT.black);
  ctx.lineWidth = Math.max(1.4, 2 * k);
  ctx.beginPath();
  ctx.arc(x, y + R, R, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = tone(LIT.leather);
  ctx.lineWidth = Math.max(2.4, 3.6 * k);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y + R, R, Math.PI * 1.25, Math.PI * 1.75);
  ctx.stroke();
  ctx.strokeStyle = tone('#ffe2b8', lit ? 0.35 : 0.15);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y + R, R + 1.2 * k, Math.PI * 1.32, Math.PI * 1.62);
  ctx.stroke();
  // The window's light from below catches the inside of the band and the cups' undersides.
  ctx.strokeStyle = edge;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y + R, R - 1 * k, Math.PI * 1.04, Math.PI * 1.96);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = tone(LIT.steel);
  ctx.lineWidth = Math.max(1, 1.4 * k);
  for (const side of [-1, 1]) line(ctx, x + side * R, y + R, x + side * R, cupY);
  // The ear cups, their soft cushions facing each other.
  for (const side of [-1, 1]) {
    const cx = x + side * R;
    const cy = cupY + cupH / 2;
    ctx.fillStyle = tone(LIT.black);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 4.4 * k, cupH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tone('#45464c');
    ctx.beginPath();
    ctx.ellipse(cx - side * 2.6 * k, cy, 2 * k, cupH * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tone('#ffffff', lit ? 0.25 : 0.12);
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3.6 * k, cupH * 0.42, 0, Math.PI * 1.15, Math.PI * 1.6);
    ctx.stroke();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 4.4 * k, cupH / 2, 0, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
  }
  // The boom microphone from the left cup, curving in, with its foam ball.
  ctx.strokeStyle = tone(LIT.black);
  ctx.lineWidth = Math.max(0.8, 1.1 * k);
  ctx.beginPath();
  ctx.moveTo(x - R, cupY + cupH * 0.7);
  ctx.quadraticCurveTo(x - R * 0.9, cupY + cupH * 1.9, x - R * 0.15, cupY + cupH * 1.75);
  ctx.stroke();
  ctx.fillStyle = tone('#1c1c1f');
  ctx.beginPath();
  ctx.arc(x - R * 0.15, cupY + cupH * 1.75, Math.max(1.3, 1.9 * k), 0, Math.PI * 2);
  ctx.fill();
  mark('headset', x - R - 5 * k, y - 2, R * 2 + 10 * k, end + 4 * k - y + 2, 'room');
}

/** Binoculars on the sill, put down after a look at the water, the strap over the edge. */
function binoculars(ctx, L, tone, lit) {
  const b = L.binoculars;
  const k = L.k;
  const bw = b.w / 2;
  const h = b.w * 0.44;
  const y0 = b.y - h;
  ctx.fillStyle = tone('#000000', 0.3);
  ctx.beginPath();
  ctx.ellipse(b.x + b.w / 2 + 1, b.y, b.w * 0.56, 1.6 * k, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = tone(LIT.leather);
  ctx.lineWidth = Math.max(0.9, 1.3 * k);
  ctx.beginPath();
  ctx.moveTo(b.x + bw * 0.25, b.y - h * 0.3);
  ctx.bezierCurveTo(b.x - bw * 0.1, b.y + L.sillFront + 7 * k, b.x + b.w * 1.05, b.y + L.sillFront + 8 * k, b.x + b.w - bw * 0.25, b.y - h * 0.3);
  ctx.stroke();
  for (let i = 0; i < 2; i++) {
    const x = b.x + i * bw;
    ctx.fillStyle = tone('#2b2d30');
    roundRect(ctx, x + 0.5, y0, bw - 1, h, bw * 0.3);
    ctx.fill();
    ctx.fillStyle = tone('#1a1b1e');
    ctx.fillRect(x + 0.5, y0 + h * 0.18, bw - 1, h * 0.12);
    const lx = x + bw / 2;
    const ly = y0 + h * 0.6;
    ctx.fillStyle = tone('#0b0d12');
    ctx.beginPath();
    ctx.arc(lx, ly, bw * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tone('#5a5d62');
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // The lamp, small and curved, in each lens.
    ctx.strokeStyle = tone('#ffe0b0', lit ? 0.8 : 0.3);
    ctx.beginPath();
    ctx.arc(lx, ly, bw * 0.2, Math.PI * 1.55, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.fillStyle = tone('#3a3c40');
  roundRect(ctx, b.x + bw - bw * 0.28, y0 - h * 0.14, bw * 0.56, h * 0.34, k);
  ctx.fill();
  mark('binoculars', b.x - 1, y0 - h * 0.15, b.w + 2, b.y + L.sillFront + 8 * k - (y0 - h * 0.15), 'room');
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
  // A small plate under it: the station keeps UTC, as the ships do.
  const pw = c.w * 0.3;
  const ph = 6.5 * L.k;
  const px = c.x + c.w / 2 - pw / 2;
  const py = c.y + c.h + 3 * L.k;
  ctx.fillStyle = tone('#000000', 0.3);
  roundRect(ctx, px + 1, py + 1.2, pw, ph, L.k);
  ctx.fill();
  ctx.fillStyle = tone(LIT.plate);
  roundRect(ctx, px, py, pw, ph, L.k);
  ctx.fill();
  ctx.fillStyle = tone('#2a2a2e');
  ctx.font = `bold ${(4.8 * L.k).toFixed(1)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UTC', px + pw / 2, py + ph / 2 + 0.4);
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
  mark('clock', c.x, c.y, c.w + 2, py + ph + 1.2 - c.y, 'room');
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
