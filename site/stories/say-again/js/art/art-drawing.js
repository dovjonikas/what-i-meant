// art-drawing.js: the son's crayon drawing (the mast with its red light, the sea, the house
// with the yellow window, dashed lines between them, and the word DAD with an arrow to
// the mast) and the hand letters it and the marker on the box in the hall are written in.
// The room scene tapes a small copy of the drawing to the window; the 'drawing' scene
// shows it close up, taped to the night glass, with the real mast's light blinking behind.

import { rng, css, mix, glowSprite, stamp, mark, roundRect, blink } from './art-kit.js';

// Letters as strokes in a box one unit high; x runs to the letter's width. A child and a
// marker both write in strokes, so the letters are drawn, not typed.
// Only the letters the pictures need: DAD on the drawing and on the box in the hall.
const GLYPHS = {
  D: { w: 0.62, s: [[[0, 0], [0, 1]], [[0, 0], [0.3, 0.03], [0.53, 0.2], [0.62, 0.5], [0.53, 0.8], [0.3, 0.97], [0, 1]]] },
  A: { w: 0.72, s: [[[0, 1], [0.36, 0], [0.72, 1]], [[0.16, 0.6], [0.56, 0.6]]] },
};

/**
 * Writes `word` from (x, y) (top left), letters `size` px high, each stroke passed to
 * `pen(points)`. `wobble` 0..1 is how much a child's hand moves letters off the line.
 * Returns where the word ends.
 */
export function writeWord(word, x, y, size, pen, wobble = 0, seed = 3) {
  const rand = rng(seed);
  let cx = x;
  for (const ch of word) {
    const g = GLYPHS[ch];
    if (!g) {
      cx += size * 0.5;
      continue;
    }
    const k = size * (1 + (rand() - 0.5) * 0.25 * wobble);
    const dy = (rand() - 0.5) * size * 0.16 * wobble;
    const tilt = (rand() - 0.5) * 0.18 * wobble;
    const at = ([u, v]) => [cx + u * k + (v - 0.5) * k * tilt, y + dy + v * k + (size - k)];
    for (const s of g.s) pen(s.map(at));
    cx += (g.w + 0.26) * k;
  }
  return cx;
}

/** A line wobbled the way a crayon moves: split into short pieces, each nudged a little. */
function wobbly(pts, step, amount, rand) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let j = 0; j < n; j++) {
      const t = j / n;
      out.push([x0 + (x1 - x0) * t + (rand() - 0.5) * amount, y0 + (y1 - y0) * t + (rand() - 0.5) * amount]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * Paints the drawing into a box. `light` 0..1 dims it toward the room's dark (1 is full
 * daylight colour). Everything is in units of the box, so the small copy on the window
 * and the close-up are the same drawing.
 */
export function paintKidDrawing(ctx, x, y, w, h, light = 1, dark = '#101830') {
  const rand = rng(9);
  const P = (u, v) => [x + u * w, y + v * h];
  const shade = (c) => css(mix(c, dark, 1 - light));
  // The paper: a page from a lined school notebook, the margin line in red.
  ctx.fillStyle = shade('#f3eddd');
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = Math.max(0.5, h * 0.004);
  ctx.strokeStyle = css(mix('#8fb0d6', dark, 1 - light), 0.7);
  for (let v = 0.12; v < 1; v += 0.075) {
    ctx.beginPath();
    ctx.moveTo(x, y + v * h);
    ctx.lineTo(x + w, y + v * h);
    ctx.stroke();
  }
  ctx.strokeStyle = css(mix('#d98282', dark, 1 - light), 0.75);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.09, y);
  ctx.lineTo(x + w * 0.09, y + h);
  ctx.stroke();

  // The crayon goes on its own sheet, so the paper's tooth can show through it after.
  const sheet = document.createElement('canvas');
  const k = Math.max(1, Math.min(3, ctx.getTransform().a));
  sheet.width = Math.ceil(w * k) + 2;
  sheet.height = Math.ceil(h * k) + 2;
  const g = sheet.getContext('2d');
  g.scale(k, k);
  g.translate(-x, -y);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const thick = h * 0.022;
  const stroke = (pts, color, width = thick, passes = 3) => {
    for (let p = 0; p < passes; p++) {
      g.strokeStyle = css(mix(color, dark, 1 - light), 0.5 + p * 0.12);
      g.lineWidth = width * (0.55 + p * 0.2);
      const line = wobbly(pts, width * 2.2, width * 0.55, rand);
      g.beginPath();
      line.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
    }
  };
  const dot = ([px, py], r, color) => {
    g.fillStyle = css(mix(color, dark, 1 - light), 0.9);
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.arc(px + (rand() - 0.5) * r * 0.4, py + (rand() - 0.5) * r * 0.4, r * (0.75 + rand() * 0.3), 0, Math.PI * 2);
      g.fill();
    }
  };
  // Back-and-forth scribble inside a shape, the way a child colours in.
  const hatch = (pts, color, gap = thick * 0.9) => {
    g.save();
    g.beginPath();
    pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.closePath();
    g.clip();
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs) - gap;
    const x1 = Math.max(...xs) + gap;
    const y0 = Math.min(...ys) - gap;
    const y1 = Math.max(...ys) + gap;
    const zig = [];
    for (let yy = y0, flip = 0; yy < y1; yy += gap, flip ^= 1) {
      zig.push(flip ? [x1, yy] : [x0, yy]);
      zig.push(flip ? [x0, yy + gap * 0.5] : [x1, yy + gap * 0.5]);
    }
    stroke(zig, color, gap * 1.2, 2);
    g.restore();
  };

  // Sand under the mast and the house, and the sea along the bottom.
  hatch([P(0.05, 0.86), P(0.3, 0.8), P(0.6, 0.79), P(0.97, 0.77), P(0.97, 0.88), P(0.05, 0.9)], '#e3b860');
  const sea = [];
  for (let u = 0.04; u <= 0.97; u += 0.065) sea.push(P(u, 0.9), P(u + 0.032, 0.86));
  hatch([P(0.03, 0.88), ...sea.filter((_, i) => i % 2), P(0.97, 0.9), P(0.97, 0.98), P(0.03, 0.98)], '#7fb0e6');
  stroke(sea, '#2f63c4');
  const sea2 = [];
  for (let u = 0.07; u <= 0.95; u += 0.08) sea2.push(P(u, 0.955), P(u + 0.04, 0.925));
  stroke(sea2, '#2f63c4', thick * 0.8);

  // The house: walls, a red roof, a door, and the yellow window that is lit.
  hatch([P(0.13, 0.5), P(0.24, 0.38), P(0.36, 0.5)], '#d8432f');
  stroke([P(0.11, 0.51), P(0.24, 0.37), P(0.38, 0.51)], '#a62b22');
  stroke([P(0.14, 0.5), P(0.14, 0.81), P(0.35, 0.8), P(0.35, 0.5)], '#4a3a33');
  hatch([P(0.18, 0.56), P(0.27, 0.56), P(0.27, 0.66), P(0.18, 0.66)], '#ffd23a', thick * 0.7);
  stroke([P(0.18, 0.56), P(0.27, 0.56), P(0.27, 0.66), P(0.18, 0.66), P(0.18, 0.56)], '#d79a12', thick * 0.8);
  stroke([P(0.29, 0.8), P(0.29, 0.69), P(0.33, 0.69), P(0.33, 0.8)], '#4a3a33', thick * 0.8);

  // The mast: a tall ladder of crosses, red stripes, and the red light on top.
  const mx = 0.79;
  const top = 0.13;
  const foot = 0.79;
  stroke([P(mx - 0.055, foot), P(mx - 0.012, top)], '#33333d');
  stroke([P(mx + 0.055, foot), P(mx + 0.012, top)], '#33333d');
  for (let i = 0; i < 6; i++) {
    const a = top + ((foot - top) * i) / 6;
    const b = top + ((foot - top) * (i + 1)) / 6;
    const wa = 0.012 + (0.043 * (a - top)) / (foot - top);
    const wb = 0.012 + (0.043 * (b - top)) / (foot - top);
    if (i % 2 === 0) hatch([P(mx - wa, a), P(mx + wa, a), P(mx + wb, b), P(mx - wb, b)], '#e2402e', thick * 0.8);
    stroke([P(mx - wa, a), P(mx + wb, b)], '#33333d', thick * 0.6, 2);
    stroke([P(mx + wa, a), P(mx - wb, b)], '#33333d', thick * 0.6, 2);
  }
  dot(P(mx, top - 0.035), h * 0.035, '#e8241c');
  for (const [du, dv] of [[-0.06, -0.03], [0.06, -0.03], [-0.045, -0.085], [0.045, -0.085], [0, -0.1]]) {
    stroke([P(mx + du * 0.55, top - 0.035 + dv * 0.55), P(mx + du, top - 0.035 + dv)], '#e8241c', thick * 0.6, 2);
  }

  // Dashed lines from the house to the mast: the two of them talking.
  for (const [lift, ofs] of [[0.16, 0], [0.27, 0.05]]) {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const u = 0.29 + (mx - 0.07 - 0.29) * t;
      const v = 0.5 - ofs + (top + 0.06 - 0.5 + ofs) * t - lift * Math.sin(Math.PI * t) * 0.6;
      pts.push(P(u, v));
    }
    for (let i = 0; i < pts.length - 1; i += 2) stroke([pts[i], pts[i + 1]], '#2f63c4', thick * 0.7, 2);
  }

  // DAD, big as a child writes it, and an arrow from it to the mast.
  const end = writeWord('DAD', x + w * 0.14, y + h * 0.12, h * 0.15, (pts) => stroke(pts, '#2a3a8a', thick * 0.95), 1, 4);
  const from = (end - x) / w + 0.04;
  const arrow = [P(from, 0.22), P(from + 0.08, 0.17), P(0.6, 0.15), P(0.69, 0.16)];
  stroke(arrow, '#2a3a8a', thick * 0.85);
  stroke([P(0.65, 0.115), P(0.695, 0.16), P(0.65, 0.205)], '#2a3a8a', thick * 0.85);

  // Paper tooth: specks punched out of the crayon, more where it went on lightly.
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-out';
  const n = Math.round((sheet.width * sheet.height) / 9);
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgb(0 0 0 / ${(0.25 + rand() * 0.6).toFixed(2)})`;
    g.fillRect(rand() * sheet.width, rand() * sheet.height, 1 + rand() * k, 1);
  }
  ctx.drawImage(sheet, x, y, sheet.width / k, sheet.height / k);
}

/** A strip of clear tape, a little crooked, over a corner. */
export function tape(ctx, x, y, w, h, angle, light = 1, dark = '#101830') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = css(mix('#efe6c8', dark, 1 - light), 0.55);
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = css('#ffffff', 0.12 * light);
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.3);
  ctx.restore();
}

/**
 * The close-up: the drawing taped to the station's window at night, the town's lights and
 * the mast's red light out of focus behind the glass. Painted once; `lights` adds the
 * blinking red light each frame.
 */
export function paintDrawingScene(ctx, view) {
  const { w, h, colW, colX } = view;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0b1124');
  g.addColorStop(0.55, '#16203e');
  g.addColorStop(1, '#0c1222');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Town lights far behind the glass, out of focus.
  const rand = rng(12);
  const warm = glowSprite('#ffc777');
  for (let i = 0; i < 26; i++) {
    const bx = rand() * w;
    const by = h * (0.62 + rand() * 0.08);
    stamp(ctx, warm, bx, by, 8 + rand() * 14, 0.18 + rand() * 0.25);
  }
  // Raindrops on the glass around the page.
  for (let i = 0; i < 70; i++) {
    const dx = rand() * w;
    const dy = rand() * h;
    const r = 0.8 + rand() * 2.2;
    ctx.fillStyle = css('#9fb4e0', 0.18);
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css('#e8f0ff', 0.35);
    ctx.fillRect(dx - r * 0.4, dy - r * 0.5, Math.max(0.6, r * 0.4), Math.max(0.6, r * 0.4));
  }
  const box = drawingBox(view);
  ctx.save();
  ctx.translate(box.cx, box.cy);
  ctx.rotate(box.angle);
  // A soft shadow where the page lifts off the glass.
  ctx.fillStyle = css('#000000', 0.35);
  roundRect(ctx, -box.w / 2 + 3, -box.h / 2 + 5, box.w, box.h, 2);
  ctx.fill();
  // The lamp in the room lights the page warmly from the right.
  paintKidDrawing(ctx, -box.w / 2, -box.h / 2, box.w, box.h, 0.92, '#2a2030');
  const lampLight = ctx.createLinearGradient(-box.w / 2, 0, box.w / 2, 0);
  lampLight.addColorStop(0, css('#1a1830', 0.28));
  lampLight.addColorStop(1, css('#ffb060', 0.1));
  ctx.fillStyle = lampLight;
  ctx.fillRect(-box.w / 2, -box.h / 2, box.w, box.h);
  const tw = box.w * 0.16;
  const th = box.h * 0.07;
  tape(ctx, -box.w / 2 + tw * 0.25, -box.h / 2 + th * 0.2, tw, th, -0.7);
  tape(ctx, box.w / 2 - tw * 0.25, -box.h / 2 + th * 0.2, tw, th, 0.65);
  tape(ctx, -box.w / 2 + tw * 0.25, box.h / 2 - th * 0.2, tw, th, 0.7);
  tape(ctx, box.w / 2 - tw * 0.25, box.h / 2 - th * 0.2, tw, th, -0.6);
  ctx.restore();
  const half = Math.abs(Math.sin(box.angle)) * box.h / 2 + Math.abs(Math.cos(box.angle)) * box.w / 2;
  const halfH = Math.abs(Math.sin(box.angle)) * box.w / 2 + Math.abs(Math.cos(box.angle)) * box.h / 2;
  mark('drawing page', box.cx - half - 4, box.cy - halfH - 4, half * 2 + 8, halfH * 2 + 8, 'high');
  return box;
}

export function drawingBox({ w, h, colW, colX }) {
  const pw = colW * 0.86;
  const ph = pw * 0.76;
  return { cx: colX + colW / 2, cy: Math.max(56 + ph / 2 + 20, h * 0.42), w: pw, h: ph, angle: -0.025 };
}

/** The real mast's light, out of focus behind the page: a red blur that comes and goes. */
export function drawingLights(ctx, view, t) {
  const box = drawingBox(view);
  const on = blink(t);
  const x = box.cx + box.w * 0.36;
  const y = box.cy - box.h / 2 - Math.min(40, (box.cy - box.h / 2 - 60) * 0.6);
  stamp(ctx, glowSprite('#ff3a2e'), x, y, 26, 0.75 * on);
}
