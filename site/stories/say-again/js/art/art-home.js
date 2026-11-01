// art-home.js: the 'home' scene, the family flat in the morning with nobody in it (the son
// has already gone to school). We stand in the hall: coats on hooks and the shoe rack on
// the left, and through the wide doorway the kitchen: the table with its checked oilcloth
// and a sheet of paper on it (a note; its words are HTML on the page, never painted
// here), the counter and sink, the window with the radiator under it, and the fridge with
// the son's drawings and magnets. Sun comes in through the kitchen window.
//
// s.night (1..3) changes small things: 1 a cereal bowl in the sink; 2 an opened cardboard
// box in the hall with DAD on it in marker and cables spilling out; 3 a kitchen drawer left
// open and an empty battery packet on the counter. Every morning the small shoes are gone
// from the rack and the slippers wait under it.

import { cachedLayer, put, paper, css, mix, rng, roundRect, poly, line, mark, vGrad, glowSprite, stamp } from './art-kit.js';
import { writeWord, paintKidDrawing } from './art-drawing.js';

function layout(view) {
  const { w, h, colW, colX } = view;
  const U = (u) => colX + u * colW;
  // Pixels per metre on three depths: the hall wall, the table, the kitchen's back wall.
  const mN = Math.min(colW / 1.7, h * 0.27);
  const mT = mN * 0.84;
  const mF = mN * 0.7;
  const floorN = h * 0.8;
  const floorT = h * 0.735;
  const floorF = h * 0.655;
  const door = { x0: U(0.285), x1: U(0.97), top: floorN - 2.05 * mN };
  // Across the kitchen's back wall: the counter, the window, the fridge, all inside the doorway.
  const win = { x: U(0.455), y: floorF - 2.18 * mF, w: U(0.705) - U(0.455), h: 1.28 * mF };
  return {
    w, h, colW, colX, U, mN, mT, mF, floorN, floorT, floorF, door, win,
    counter: { x0: door.x0 - 0.4 * mF, x1: U(0.44), top: floorF - 0.9 * mF },
    fridge: { x: U(0.735), y: floorF - 1.75 * mF, w: U(0.952) - U(0.735), h: 1.75 * mF },
    table: { cx: U(0.6), top: floorT - 0.75 * mT, half: 0.45 * mT, depth: 0.12 * mT },
  };
}

export function paintHome(ctx, view, t, s, dpr) {
  const night = [1, 2, 3].includes(s.night) ? s.night : 1;
  const L = layout(view);
  const layer = cachedLayer(`home-${night}`, view, dpr, (g) => {
    kitchen(g, L, night);
    hall(g, L, night);
    paper(g, view.w, view.h, 50 + night, 0.85);
  });
  put(ctx, layer, view);
  motes(ctx, L, t);
  const n = noteBox(L);
  return { note: { x: n.x, y: n.y, w: n.w, h: n.h } };
}

/** The sheet of paper on the table: where it lies, for the tap area and the mark. */
function noteBox(L) {
  const { table, mT } = L;
  return { x: table.cx - 0.2 * mT, y: table.top - table.depth * 0.75, w: 0.26 * mT, h: table.depth * 0.6 };
}

/** The kitchen through the doorway: back wall, window, counter, fridge, table, sun. */
function kitchen(g, L, night) {
  const { w, h, mF, mT, floorF, floorT, win, counter, fridge, table } = L;
  g.fillStyle = vGrad(g, 0, floorF, ['#e8d6ae', '#f2e4c2']);
  g.fillRect(0, 0, w, floorF);
  // Tiles behind the counter.
  g.fillStyle = css('#dfe4dc');
  g.fillRect(counter.x0, counter.top - 0.5 * mF, counter.x1 - counter.x0, 0.5 * mF);
  g.strokeStyle = css('#b8c0b6', 0.7);
  g.lineWidth = 0.8;
  const tile = 0.1 * mF;
  for (let y = counter.top - 0.5 * mF; y < counter.top; y += tile) line(g, counter.x0, y, counter.x1, y);
  for (let x = counter.x0; x < counter.x1; x += tile) line(g, x, counter.top - 0.5 * mF, x, counter.top);
  // The kitchen floor, boards running toward us.
  g.fillStyle = vGrad(g, floorF, h, ['#b88a5c', '#9a6c46']);
  g.fillRect(0, floorF, w, h - floorF);
  g.strokeStyle = css('#7a5236', 0.3);
  for (let i = 1; i < 6; i++) line(g, 0, floorF + i * 0.06 * mF * i, w, floorF + i * 0.06 * mF * i);
  // The window: morning sky, a birch branch, the frame.
  g.fillStyle = vGrad(g, win.y, win.y + win.h, ['#a8cce8', '#dbe8ec', '#f6ecd0']);
  g.fillRect(win.x, win.y, win.w, win.h);
  g.strokeStyle = css('#8a8270', 0.6);
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(win.x + win.w, win.y + win.h * 0.25);
  g.quadraticCurveTo(win.x + win.w * 0.6, win.y + win.h * 0.3, win.x + win.w * 0.35, win.y + win.h * 0.2);
  g.stroke();
  g.fillStyle = css('#c8b45a', 0.75);
  const r = rng(3);
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    g.ellipse(win.x + win.w * (0.35 + r() * 0.65), win.y + win.h * (0.15 + r() * 0.2), 2.2, 1.4, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const f = Math.max(3, 0.05 * mF);
  g.fillStyle = css('#fbf6ea');
  g.fillRect(win.x - f, win.y - f, win.w + f * 2, f);
  g.fillRect(win.x - f, win.y, f, win.h);
  g.fillRect(win.x + win.w, win.y, f, win.h);
  g.fillRect(win.x + win.w / 2 - f / 2, win.y, f, win.h);
  g.fillRect(win.x - f * 2, win.y + win.h, win.w + f * 4, f * 1.3);
  mark('kitchen window', win.x - f, win.y - f, win.w + f * 2, win.h + f * 2.3, 'high');
  // The radiator under the window.
  const rx = win.x + win.w * 0.08;
  const ry = win.y + win.h + 0.15 * mF;
  const rw = win.w * 0.84;
  const rh = 0.5 * mF;
  g.fillStyle = css('#f2eee4');
  roundRect(g, rx, ry, rw, rh, 2);
  g.fill();
  g.strokeStyle = css('#c8c0b0');
  g.lineWidth = 1;
  for (let x = rx + rw / 9; x < rx + rw - 1; x += rw / 9) line(g, x, ry + 2, x, ry + rh - 2);
  // The counter with its sink and drawers.
  g.fillStyle = css('#d8d2c4');
  g.fillRect(counter.x0, counter.top, counter.x1 - counter.x0, floorF - counter.top);
  g.fillStyle = css('#7a6450');
  g.fillRect(counter.x0 - 2, counter.top - 0.04 * mF, counter.x1 - counter.x0 + 4, 0.05 * mF);
  const sinkX = counter.x1 - 0.32 * mF;
  g.fillStyle = css('#a8b0b4');
  g.fillRect(sinkX, counter.top - 0.035 * mF, 0.26 * mF, 0.025 * mF);
  g.strokeStyle = css('#8a9094');
  g.lineWidth = Math.max(1.5, 0.02 * mF);
  g.beginPath();
  g.moveTo(sinkX + 0.2 * mF, counter.top - 0.04 * mF);
  g.lineTo(sinkX + 0.2 * mF, counter.top - 0.22 * mF);
  g.quadraticCurveTo(sinkX + 0.2 * mF, counter.top - 0.28 * mF, sinkX + 0.12 * mF, counter.top - 0.26 * mF);
  g.stroke();
  g.strokeStyle = css('#b8b0a0');
  g.lineWidth = 1;
  const drawerH = 0.2 * mF;
  for (let i = 0; i < 3; i++) {
    const y = counter.top + 0.05 * mF + i * drawerH;
    g.strokeRect(counter.x0 + 2, y, counter.x1 - counter.x0 - 4, drawerH - 2);
    g.fillStyle = css('#8a8274');
    g.fillRect((counter.x0 + counter.x1) / 2 - 0.05 * mF, y + drawerH * 0.4, 0.1 * mF, 2);
  }
  if (night === 1) {
    // A cereal bowl left in the sink, a spoon in it.
    g.fillStyle = css('#e8e2f0');
    g.beginPath();
    g.ellipse(sinkX + 0.1 * mF, counter.top - 0.05 * mF, 0.075 * mF, 0.03 * mF, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = css('#5a8ac8');
    g.fillRect(sinkX + 0.03 * mF, counter.top - 0.055 * mF, 0.14 * mF, 0.012 * mF);
    g.strokeStyle = css('#a0a4a8');
    g.lineWidth = 1.2;
    line(g, sinkX + 0.12 * mF, counter.top - 0.05 * mF, sinkX + 0.17 * mF, counter.top - 0.11 * mF);
    mark('bowl', sinkX, counter.top - 0.12 * mF, 0.2 * mF, 0.1 * mF, 'high');
  }
  if (night === 3) {
    // The top drawer pulled out, and an empty battery packet on the counter.
    // The drawer pulled out toward us: its dark inside seen from above, its front lower down.
    const y = counter.top + 0.05 * mF;
    const out = 0.12 * mF;
    g.fillStyle = css('#6a5e50');
    poly(g, [[counter.x0, y], [counter.x1, y], [counter.x1 + out * 0.3, y + out], [counter.x0 - out * 0.3, y + out]]);
    g.fill();
    g.fillStyle = css('#9a9088');
    g.fillRect(counter.x1 - 0.12 * mF, y + out * 0.3, 0.06 * mF, out * 0.4);
    g.fillStyle = css('#ece6d8');
    g.fillRect(counter.x0 - out * 0.3, y + out, counter.x1 - counter.x0 + out * 0.6, drawerH);
    g.fillStyle = css('#8a8274');
    g.fillRect((counter.x0 + counter.x1) / 2 - 0.05 * mF, y + out + drawerH * 0.4, 0.1 * mF, 2);
    const bx = L.door.x0 + 0.05 * mF;
    const by = counter.top - 0.045 * mF;
    g.save();
    g.translate(bx, by);
    g.rotate(-0.18);
    g.fillStyle = css('#2a2a2a');
    g.fillRect(0, -0.12 * mF, 0.09 * mF, 0.12 * mF);
    g.fillStyle = css('#e8b830');
    g.fillRect(0, -0.12 * mF, 0.09 * mF, 0.04 * mF);
    g.strokeStyle = css('#ffffff', 0.7);
    g.lineWidth = 0.8;
    g.strokeRect(0.015 * mF, -0.07 * mF, 0.06 * mF, 0.06 * mF);
    g.restore();
    mark('battery packet', bx - 2, by - 0.14 * mF, 0.12 * mF, 0.15 * mF, 'high');
  }
  // The fridge with the son's drawings and magnets on its door.
  g.fillStyle = css('#f4f2ec');
  roundRect(g, fridge.x, fridge.y, fridge.w, fridge.h, 0.05 * mF);
  g.fill();
  g.strokeStyle = css('#d0ccc0');
  g.lineWidth = 1;
  line(g, fridge.x, fridge.y + fridge.h * 0.36, fridge.x + fridge.w, fridge.y + fridge.h * 0.36);
  g.fillStyle = css('#c8c4b8');
  g.fillRect(fridge.x + 0.04 * mF, fridge.y + fridge.h * 0.22, 0.02 * mF, 0.14 * mF);
  // Drawings held up by magnets: sizes in fridge widths, so they keep their shape.
  const pics = [
    // The top one is the same drawing taped to the station window: the mast, the house,
    // DAD. Seen here first, in the hall, before the station makes anything of it.
    [0.18, 0.05, 0.64, 0.5, -0.05, '#fdf8ea', 'mast', '#d84a3a'],
    [0.1, 0.42, 0.5, 0.4, 0.05, '#f2f6fa', 'boat', '#3a7ad8'],
    [0.4, 0.58, 0.52, 0.5, -0.03, '#fbf2e2', 'family', '#f0c030'],
  ];
  for (const [u, v, pw, ph, rot, bg, what, magnet] of pics) {
    const px = fridge.x + u * fridge.w;
    const py = fridge.y + v * fridge.h;
    const dw = pw * fridge.w;
    const dh = ph * fridge.w;
    g.save();
    g.translate(px, py);
    g.rotate(rot);
    g.fillStyle = css(bg);
    g.fillRect(0, 0, dw, dh);
    if (what === 'mast') paintKidDrawing(g, 0, 0, dw, dh, 1);
    else crayonDoodle(g, what, dw, dh);
    g.restore();
    g.fillStyle = css(magnet);
    g.beginPath();
    g.arc(px + dw * 0.5, py + 1, Math.max(1.6, 0.025 * mF), 0, Math.PI * 2);
    g.fill();
  }
  mark('fridge', fridge.x, fridge.y, fridge.w, fridge.h, 'col');
  // Sun through the window across the floor and the table.
  g.save();
  g.globalCompositeOperation = 'screen';
  const beam = g.createLinearGradient(win.x, win.y, win.x - 0.6 * mF, floorT + 0.2 * mT);
  beam.addColorStop(0, css('#fff0c8', 0.35));
  beam.addColorStop(1, css('#fff0c8', 0.05));
  g.fillStyle = beam;
  poly(g, [[win.x, win.y + win.h * 0.1], [win.x + win.w, win.y + win.h * 0.1], [win.x + win.w - 0.5 * mF, floorT + 0.3 * mT], [win.x - 0.9 * mF, floorT + 0.3 * mT]]);
  g.fill();
  g.restore();
  table_(g, L);
}

/** The kitchen table: the same red-checked oilcloth as in the last scene, the note on it, a chair. */
function table_(g, L) {
  const { mT, floorT, table } = L;
  const { cx, top, half, depth } = table;
  // A chair on the far side, its back above the table.
  g.fillStyle = css('#9a6a44');
  g.fillRect(cx + half * 0.2, top - 0.42 * mT, 0.04 * mT, 0.42 * mT);
  g.fillRect(cx + half * 0.75, top - 0.42 * mT, 0.04 * mT, 0.42 * mT);
  g.fillRect(cx + half * 0.2, top - 0.42 * mT, half * 0.59, 0.05 * mT);
  g.fillRect(cx + half * 0.2, top - 0.25 * mT, half * 0.59, 0.03 * mT);
  g.strokeStyle = css('#6a4630');
  g.lineWidth = Math.max(3, 0.045 * mT);
  for (const dx of [-half * 0.85, half * 0.85]) line(g, cx + dx, top, cx + dx, floorT);
  const surface = [[cx - half + depth * 0.5, top - depth], [cx + half - depth * 0.5, top - depth], [cx + half, top], [cx - half, top]];
  g.fillStyle = css('#f6eee0');
  poly(g, surface);
  g.fill();
  const hang = 0.12 * mT;
  g.fillRect(cx - half - 0.01 * mT, top, half * 2 + 0.02 * mT, hang);
  g.save();
  poly(g, surface);
  g.rect(cx - half - 0.01 * mT, top, half * 2 + 0.02 * mT, hang);
  g.clip();
  const c = 0.06 * mT;
  g.fillStyle = css('#c85a4c', 0.5);
  for (let x = cx - half - c; x < cx + half + c; x += c * 2) {
    g.fillRect(x, top, c, hang);
    poly(g, [[x, top], [x + c, top], [x + c + depth * 0.5 * ((x - cx) / half), top - depth], [x + depth * 0.5 * ((x - cx) / half), top - depth]]);
    g.fill();
  }
  for (let y = top; y < top + hang; y += c * 2) g.fillRect(cx - half - c, y, half * 2 + c * 2, c);
  g.fillRect(cx - half, top - depth * 0.5, half * 2, depth * 0.25);
  g.restore();
  g.fillStyle = css('#000000', 0.12);
  g.fillRect(cx - half - 0.01 * mT, top + hang - 2, half * 2 + 0.02 * mT, 2);
  // The note: a plain sheet, folded once, lying a little crooked. Its words are not painted.
  const n = noteBox(L);
  g.fillStyle = css('#000000', 0.12);
  poly(g, [[n.x + 3, n.y + 2], [n.x + n.w + 5, n.y + 1], [n.x + n.w + 3, n.y + n.h + 2], [n.x + 1, n.y + n.h + 3]]);
  g.fill();
  g.fillStyle = css('#ffffff');
  poly(g, [[n.x + 2, n.y], [n.x + n.w + 3, n.y - 1], [n.x + n.w, n.y + n.h], [n.x, n.y + n.h + 1]]);
  g.fill();
  g.strokeStyle = css('#d8d4cc');
  g.lineWidth = 0.8;
  line(g, n.x + n.w * 0.5 + 1, n.y, n.x + n.w * 0.5, n.y + n.h);
  mark('note', n.x - 2, n.y - 3, n.w + 7, n.h + 7, 'high');
  mark('table', cx - half, top - depth, half * 2, hang + depth, 'high');
}

/** Little drawings on the fridge, as a child does them: a boat, three people (the mast drawing is art-drawing.js). */
function crayonDoodle(g, what, w, h) {
  g.lineWidth = Math.max(0.8, h * 0.06);
  g.lineCap = 'round';
  if (what === 'sun') {
    g.fillStyle = css('#f0b830');
    g.beginPath();
    g.arc(w * 0.5, h * 0.5, h * 0.22, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = css('#f0b830');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(g, w * 0.5 + Math.cos(a) * h * 0.3, h * 0.5 + Math.sin(a) * h * 0.3, w * 0.5 + Math.cos(a) * h * 0.42, h * 0.5 + Math.sin(a) * h * 0.42);
    }
  } else if (what === 'boat') {
    g.strokeStyle = css('#3a6ac8');
    line(g, w * 0.1, h * 0.8, w * 0.9, h * 0.8);
    g.fillStyle = css('#c84a3a');
    poly(g, [[w * 0.2, h * 0.6], [w * 0.8, h * 0.6], [w * 0.7, h * 0.75], [w * 0.3, h * 0.75]]);
    g.fill();
    g.strokeStyle = css('#4a3a30');
    line(g, w * 0.5, h * 0.6, w * 0.5, h * 0.15);
  } else {
    // Three people holding hands: two tall, one small; the small one yellow.
    const people = [[0.25, 0.75, '#3a7a80'], [0.5, 0.75, '#c8584c'], [0.75, 0.5, '#f0c030']];
    for (const [u, tall, col] of people) {
      g.fillStyle = css('#e8b898');
      g.beginPath();
      g.arc(w * u, h * (0.9 - tall * 0.95), h * 0.07, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = css(col);
      poly(g, [[w * u, h * (0.9 - tall * 0.85)], [w * (u - 0.08), h * 0.9], [w * (u + 0.08), h * 0.9]]);
      g.fill();
    }
  }
}

/** The hall in front: its wall with the wide doorway, the coats, the shoe rack, the floor. */
function hall(g, L, night) {
  const { w, h, mN, floorN, door, U } = L;
  // The wall, cut open for the doorway; a little darker than the sunny kitchen.
  g.save();
  g.beginPath();
  g.rect(0, 0, w, floorN);
  g.rect(door.x1, door.top, door.x0 - door.x1, floorN - door.top);
  g.clip('evenodd');
  g.fillStyle = vGrad(g, 0, floorN, ['#a8a48e', '#c4bea6', '#bab49c']);
  g.fillRect(0, 0, w, floorN);
  g.restore();
  // The ceiling, a hanging lamp, and a mirror over the coats.
  const ceil = floorN - 2.6 * mN;
  g.fillStyle = css('#8e8a76');
  g.fillRect(0, 0, w, Math.max(0, ceil));
  g.fillStyle = css('#000000', 0.08);
  g.fillRect(0, ceil, w, 3);
  const lampX = U(0.14);
  const lampY = ceil + 0.35 * mN;
  g.strokeStyle = css('#3a342c');
  g.lineWidth = 1;
  line(g, lampX, ceil, lampX, lampY);
  g.fillStyle = css('#efe6cc');
  g.beginPath();
  g.ellipse(lampX, lampY + 0.06 * mN, 0.11 * mN, 0.08 * mN, 0, Math.PI, 0);
  g.fill();
  const mx = U(0.135);
  const my = floorN - 2.02 * mN;
  g.fillStyle = css('#6a5440');
  g.beginPath();
  g.ellipse(mx, my, 0.17 * mN, 0.11 * mN, 0, 0, Math.PI * 2);
  g.fill();
  const glass = g.createLinearGradient(mx - 0.15 * mN, my - 0.1 * mN, mx + 0.15 * mN, my + 0.1 * mN);
  glass.addColorStop(0, css('#d8e0dc'));
  glass.addColorStop(0.5, css('#a8b4b0'));
  glass.addColorStop(1, css('#c8d0cc'));
  g.fillStyle = glass;
  g.beginPath();
  g.ellipse(mx, my, 0.15 * mN, 0.093 * mN, 0, 0, Math.PI * 2);
  g.fill();
  // The door frame.
  const fr = Math.max(4, 0.06 * mN);
  g.fillStyle = css('#f4efe2');
  g.fillRect(door.x0 - fr, door.top - fr, fr, floorN - door.top + fr);
  g.fillRect(door.x1, door.top - fr, fr, floorN - door.top + fr);
  g.fillRect(door.x0 - fr, door.top - fr, door.x1 - door.x0 + fr * 2, fr);
  g.fillStyle = css('#000000', 0.08);
  g.fillRect(door.x0, door.top, fr * 0.6, floorN - door.top);
  // The skirting board.
  g.fillStyle = css('#e8e2d2');
  g.fillRect(0, floorN - 0.08 * mN, door.x0 - fr, 0.08 * mN);
  g.fillRect(door.x1 + fr, floorN - 0.08 * mN, w - door.x1 - fr, 0.08 * mN);
  // The hall floor, in front of everything, boards running toward us.
  g.fillStyle = vGrad(g, floorN, h, ['#8a6444', '#6a4a32']);
  g.fillRect(0, floorN, w, h - floorN);
  g.strokeStyle = css('#4a3222', 0.3);
  g.lineWidth = 1;
  const vx = U(0.6);
  for (let i = -12; i <= 12; i++) line(g, vx + i * 0.16 * mN, floorN, vx + i * 0.16 * mN * 2.2, h);
  // The kitchen's light spilling into the hall across the floor.
  const spill = g.createLinearGradient(0, floorN, 0, h);
  spill.addColorStop(0, css('#ffe8b8', 0.25));
  spill.addColorStop(1, css('#ffe8b8', 0));
  g.fillStyle = spill;
  poly(g, [[door.x0, floorN], [door.x1, floorN], [door.x1 + 0.5 * mN, h], [door.x0 - 0.3 * mN, h]]);
  g.fill();
  // Coat hooks and coats: a grey parka and a small navy anorak.
  const hookY = floorN - 1.72 * mN;
  g.fillStyle = css('#6a5440');
  g.fillRect(U(0.02), hookY - 0.04 * mN, U(0.25) - U(0.02), 0.06 * mN);
  coat(g, U(0.085), hookY, mN, 0.95, 0.25, '#6c7278');
  coat(g, U(0.195), hookY, mN, 0.62, 0.19, '#2e3e5e');
  // The shoe rack: two shelves; on the top one a gap where the small shoes stand.
  const rx = U(0.02);
  const rw = U(0.255) - rx;
  const shelf = (y) => {
    g.fillStyle = css('#7a5a40');
    g.fillRect(rx, y, rw, 0.025 * mN);
  };
  const top = floorN - 0.34 * mN;
  g.fillStyle = css('#5a4230');
  g.fillRect(rx, top, 0.025 * mN, 0.34 * mN);
  g.fillRect(rx + rw - 0.025 * mN, top, 0.025 * mN, 0.34 * mN);
  shelf(top);
  shelf(floorN - 0.16 * mN);
  shoe(g, rx + 0.04 * mN, top, 0.13 * mN, '#3a302a');
  shoe(g, rx + 0.18 * mN, top, 0.13 * mN, '#4a4038');
  // Under the rack: big boots, and the son's slippers waiting for him.
  shoe(g, rx + 0.03 * mN, floorN - 0.16 * mN, 0.15 * mN, '#2a2622', true);
  shoe(g, rx + 0.1 * mN, floorN - 0.16 * mN, 0.15 * mN, '#24201c', true);
  // The son's slippers, small and blue, side by side in front of the rack.
  for (const dx of [0.07, 0.15]) {
    g.fillStyle = css('#6a86c0');
    g.beginPath();
    g.ellipse(rx + dx * mN, floorN + 0.03 * mN, 0.075 * mN, 0.028 * mN, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = css('#8aa2d4');
    g.beginPath();
    g.ellipse(rx + dx * mN + 0.03 * mN, floorN + 0.019 * mN, 0.04 * mN, 0.022 * mN, 0, Math.PI, 0);
    g.fill();
  }
  mark('shoe rack', rx, top - 0.12 * mN, rw, 0.46 * mN, 'high');
  if (night === 2) box(g, L);
}

function coat(g, x, y, m, len, wide, color) {
  g.fillStyle = css(color);
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x + wide * m * 0.55, y + 0.05 * m, x + wide * m * 0.5, y + len * m);
  g.lineTo(x - wide * m * 0.5, y + len * m);
  g.quadraticCurveTo(x - wide * m * 0.55, y + 0.05 * m, x, y);
  g.fill();
  g.strokeStyle = css(mix(color, '#000000', 0.3));
  g.lineWidth = 1;
  line(g, x, y + 0.12 * m, x, y + len * m);
  g.fillStyle = css(mix(color, '#000000', 0.2));
  g.beginPath();
  g.ellipse(x, y + 0.04 * m, wide * m * 0.32, 0.08 * m, 0, Math.PI, 0);
  g.fill();
}

function shoe(g, x, y, len, color, boot = false) {
  g.fillStyle = css(color);
  const hh = len * (boot ? 0.9 : 0.42);
  roundRect(g, x, y - hh, len * 0.45, hh, len * 0.1);
  g.fill();
  roundRect(g, x + len * 0.1, y - len * 0.3, len * 0.9, len * 0.3, len * 0.12);
  g.fill();
}

/** Night 2: a cardboard box, opened, DAD on it in marker, old cables spilling over its edge. */
function box(g, L) {
  const { mN, h, U } = L;
  const bw = 0.42 * mN;
  const bh = 0.28 * mN;
  const x = U(0.17);
  const bottom = h * 0.805;
  const y = bottom - bh;
  g.fillStyle = css('#000000', 0.2);
  g.beginPath();
  g.ellipse(x + bw / 2, bottom, bw * 0.6, 0.03 * mN, 0, 0, Math.PI * 2);
  g.fill();
  // Flaps folded back, the inside dark.
  g.fillStyle = css('#a07a4c');
  poly(g, [[x, y], [x - 0.08 * mN, y - 0.1 * mN], [x + bw * 0.4, y - 0.08 * mN], [x + bw * 0.45, y]]);
  g.fill();
  poly(g, [[x + bw, y], [x + bw + 0.07 * mN, y - 0.11 * mN], [x + bw * 0.55, y - 0.09 * mN], [x + bw * 0.5, y]]);
  g.fill();
  g.fillStyle = css('#5a4228');
  g.fillRect(x, y - 0.02 * mN, bw, 0.03 * mN);
  g.fillStyle = css('#c49a62');
  g.fillRect(x, y, bw, bh);
  g.fillStyle = css('#b08654');
  g.fillRect(x, y, bw, 0.02 * mN);
  g.strokeStyle = css('#e8d8b8', 0.7);
  g.lineWidth = Math.max(2, 0.03 * mN);
  line(g, x, y + bh * 0.5, x + bw, y + bh * 0.5);
  writeWord('DAD', x + bw * 0.22, y + bh * 0.26, bh * 0.42, (pts) => {
    g.strokeStyle = css('#1a1a1e');
    g.lineWidth = Math.max(1.6, bh * 0.07);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    poly(g, pts, false);
    g.stroke();
  });
  // Cables: one over the front edge to the floor, one coiled on top.
  g.strokeStyle = css('#222224');
  g.lineWidth = Math.max(1.5, 0.018 * mN);
  g.beginPath();
  g.moveTo(x + bw * 0.75, y - 0.01 * mN);
  g.bezierCurveTo(x + bw * 0.95, y + bh * 0.2, x + bw * 1.15, y + bh * 0.5, x + bw * 1.05, bottom - 0.01 * mN);
  g.bezierCurveTo(x + bw * 1.0, bottom + 0.02 * mN, x + bw * 1.25, bottom + 0.01 * mN, x + bw * 1.3, bottom - 0.005 * mN);
  g.stroke();
  g.strokeStyle = css('#6a6a70');
  g.beginPath();
  g.ellipse(x + bw * 0.35, y - 0.03 * mN, bw * 0.16, 0.035 * mN, 0.1, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(x + bw * 0.2, y - 0.02 * mN);
  g.quadraticCurveTo(x + bw * 0.05, y + bh * 0.3, x - 0.02 * mN, y + bh * 0.25);
  g.stroke();
  mark('box', x - 0.1 * mN, y - 0.14 * mN, bw * 1.35 + 0.1 * mN, bh + 0.14 * mN, 'high');
}

/** Dust drifting in the sunbeam: the one thing that moves in an empty flat. */
function motes(ctx, L, t) {
  const { win, mF, mT, floorT } = L;
  const rand = rng(77);
  for (let i = 0; i < 16; i++) {
    const v = rand();
    const yy = win.y + win.h * 0.2 + (floorT - win.y) * ((v + t * 0.01 * (0.5 + rand())) % 1);
    const xx = win.x + win.w * 0.5 - (yy - win.y) * 0.45 + Math.sin(t * 0.4 + i) * 0.1 * mF + (rand() - 0.5) * 0.5 * mT;
    const a = 0.25 + 0.35 * Math.sin(t * 0.8 + i * 1.3) ** 2;
    stamp(ctx, glowSprite('#fff4d8'), xx, yy, 2.2, a);
  }
}
