// props.js: the things standing in a scene: houses, blocks of flats, trees, a pier, cars,
// lamps; people.js draws the people.
// Every prop draws as a flat shape with a few tones of its own colour on it (planks, trim,
// shade: see tint()), and a soft shadow on the ground under it where it stands; `rim` adds
// a thin light edge on the side the light comes from, which is most of what makes a flat
// shape look lit. Small irregularities (a seam with a gap, a picket a little taller) are
// on purpose: they keep the scenes looking made by hand.
//
// drawProp(ctx, item, pen) picks the function by item.kind. Positions and sizes follow the
// rules at the top of painter.js; `y` is where the prop stands.

import { rng, mix, rgbToCss } from './util.js';
import { pinePath } from './painter.js';
import { drawPerson, LOOKS } from './people.js';
import { jar, arm, grip, album, trainer, swaddle } from './closeups.js';

export function drawProp(ctx, it, pen) {
  const fn = PROPS[it.kind];
  if (!fn) throw new Error(`Unknown scene item: ${it.kind}`);
  ctx.save();
  fn(ctx, it, pen);
  ctx.restore();
}

/** Draws `shape` twice: once shifted toward the light in the rim colour, then on top. */
function withRim(ctx, it, pen, shape) {
  if (it.rim) {
    ctx.save();
    ctx.translate((it.rimSide ?? 1) * (it.rimW ?? 1.4), -0.6);
    shape(pen.tone(it.rim, 0, it.rimAlpha ?? 0.8));
    ctx.restore();
  }
  shape(pen.tone(it.color ?? '#141826', it.haze ?? 0));
}

/**
 * The prop's own colour, lightened toward its light (k > 0, toward the rim colour) or
 * darkened (k < 0): the few extra tones that give a flat shape its planks, trim and shade.
 */
function tint(pen, it, k, alpha = 1, hex = it.color ?? '#141826') {
  const base = pen.rgb(hex, it.haze ?? 0);
  const to = k > 0 ? pen.rgb(it.rim ?? '#ffffff') : [0, 0, 0];
  return rgbToCss(mix(base, to, Math.abs(k)), alpha);
}

/** A soft shadow on the ground under something standing there, `w` wide. */
function footShadow(ctx, x, y, w, alpha = 0.3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.14);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  g.addColorStop(0, `rgb(0 0 0 / ${alpha})`);
  g.addColorStop(1, 'rgb(0 0 0 / 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -w / 2, w, w);
  ctx.restore();
}

/** Light lying on the ground in front of a lit window or door: a flat, soft pool. */
function spill(ctx, x, y, w, css0, css1) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.translate(x, y);
  ctx.scale(1, 0.18);
  glow(ctx, 0, 0, w / 2, css0, css1);
  ctx.restore();
}

const mixHex = (a, b, t) => '#' + mix(a, b, t).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

function glow(ctx, x, y, r, css0, css1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, css0);
  g.addColorStop(1, css1);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

const PROPS = {
  // A soft pool of light, for lamps, windows and fires.
  glow(ctx, it, pen) {
    ctx.globalCompositeOperation = it.blend ?? 'screen';
    glow(ctx, pen.X(it.x), pen.Y(it.y), pen.S(it.r ?? 0.2), pen.tone(it.color, 0, it.alpha ?? 0.5), pen.tone(it.color, 0, 0));
  },

  // A pine, darker on the side away from the light.
  pine(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const h = pen.S(it.h);
    const w = h * (it.width ?? 0.3);
    const side = it.rimSide ?? 1;
    const shape = () => pinePath(ctx, x, y, h, w, rng(it.seed ?? 5));
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      shape();
      ctx.fill();
    });
    ctx.save();
    shape();
    ctx.clip();
    const g = ctx.createLinearGradient(x + side * w * 0.5, 0, x - side * w * 0.5, 0);
    g.addColorStop(0.35, 'rgb(0 0 0 / 0)');
    g.addColorStop(1, 'rgb(0 0 0 / 0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(x - w, y - h, w * 2, h);
    ctx.restore();
  },

  // A leafy tree: a trunk that forks up into the crown, and a crown of leafy clumps, lit
  // on top and on the side the light comes from, darker underneath, with small dabs of
  // leaves painted over it. `fruit` hangs apples in it.
  tree(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const h = pen.S(it.h);
    const side = it.rimSide ?? 1;
    const top = y - h * 0.68;
    // The crown's clumps, picked once so every pass below draws the same shape.
    const rand = rng(it.seed ?? 9);
    const clumps = [];
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * h * 0.18;
      clumps.push([x + Math.cos(a) * d * 1.3, top + Math.sin(a) * d, h * (0.14 + rand() * 0.1)]);
    }
    // Smaller bumps along the top give the outline its leaves.
    for (const [cx, cy, r] of clumps.slice(0, 9)) {
      if (cy > top + h * 0.02) continue;
      const a = -Math.PI * (0.25 + rand() * 0.5);
      clumps.push([cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, r * 0.32]);
    }
    const lean = (rand() - 0.5) * h * 0.04;
    const trunk = () => {
      ctx.beginPath();
      ctx.moveTo(x - h * 0.034, y);
      ctx.quadraticCurveTo(x - h * 0.02, y - h * 0.3, x + lean - h * 0.016, y - h * 0.5);
      ctx.lineTo(x + lean + h * 0.016, y - h * 0.5);
      ctx.quadraticCurveTo(x + h * 0.02, y - h * 0.3, x + h * 0.034, y);
      ctx.closePath();
      ctx.fill();
      // Two branches forking off into the crown.
      ctx.lineCap = 'round';
      ctx.lineWidth = h * 0.02;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + lean * 0.6, y - h * 0.36);
        ctx.quadraticCurveTo(x + dir * h * 0.05, y - h * 0.45, x + dir * h * 0.12, top + h * 0.06);
        ctx.stroke();
      }
    };
    const crown = () => {
      ctx.beginPath();
      for (const [cx, cy, r] of clumps) {
        ctx.moveTo(cx + r, cy);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
    };
    footShadow(ctx, x, y, h * 0.42, 0.22);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = fill;
      trunk();
      crown();
      ctx.fill();
    });
    // The trunk in bark brown, under the crown.
    const bark = it.trunk ? pen.tone(it.trunk, it.haze ?? 0) : rgbToCss(mix(pen.rgb(it.color, it.haze ?? 0), [44, 30, 24], 0.45));
    ctx.fillStyle = bark;
    ctx.strokeStyle = bark;
    trunk();
    ctx.fillStyle = pen.tone(it.color, it.haze ?? 0);
    crown();
    ctx.fill();
    // Inside the crown, clump by clump from the top down: each lower clump laps over the
    // ones above it and catches the light along its upper edge, which shows the crown's
    // shape the way a painter would. Then shade underneath, and a few flecks of leaves.
    ctx.save();
    crown();
    ctx.clip();
    const lit = tint(pen, it, 0.14);
    const body = pen.tone(it.color, it.haze ?? 0);
    for (const [cx, cy, r] of [...clumps].sort((a, b) => a[1] - b[1])) {
      ctx.fillStyle = lit;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx - side * r * 0.16, cy + r * 0.2, r * 0.97, 0, Math.PI * 2);
      ctx.fill();
    }
    const under = ctx.createLinearGradient(0, top - h * 0.1, 0, top + h * 0.3);
    under.addColorStop(0, 'rgb(0 0 0 / 0)');
    under.addColorStop(1, 'rgb(0 0 0 / 0.3)');
    ctx.fillStyle = under;
    ctx.fillRect(x - h, top - h * 0.5, h * 2, h);
    const dabs = rng((it.seed ?? 9) + 5);
    for (let i = 0; i < 18; i++) {
      const [cx, cy, r] = clumps[Math.floor(dabs() * clumps.length)];
      const a = -Math.PI * (0.15 + dabs() * 0.7);
      const d = r * (0.55 + dabs() * 0.35);
      ctx.fillStyle = tint(pen, it, 0.2, 0.5);
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, h * (0.01 + dabs() * 0.008), h * 0.006, side * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (it.fruit) {
      const rand = rng((it.seed ?? 9) + 1);
      for (let i = 0; i < 10; i++) {
        const fx = x + (rand() - 0.5) * h * 0.5;
        const fy = top + (rand() - 0.5) * h * 0.35;
        const r = h * 0.019;
        ctx.fillStyle = pen.tone(it.fruit);
        ctx.beginPath();
        ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgb(255 245 225 / 0.55)';
        ctx.beginPath();
        ctx.arc(fx + side * r * 0.35, fy - r * 0.35, r * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  // A small country house, gable end on: plank walls on a low stone base, a roof edge
  // with its shadow under it, a chimney with a cap, framed windows with sills, a door on a
  // step, and a small window up in the gable. Lit windows glow and light the ground in
  // front of them. `roof` colours the roof edge.
  house(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.3);
    const h = w * (it.tall ?? 0.55);
    const roofH = w * 0.38;
    const top = y - h;
    const side = it.rimSide ?? 1;
    const thin = Math.max(0.7, w * 0.005);
    const chimney = [x + w * 0.18, top - roofH * 0.95, w * 0.07, roofH * 0.6];
    const gable = () => {
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x - w / 2, top);
      ctx.lineTo(x, top - roofH);
      ctx.lineTo(x + w / 2, top);
      ctx.lineTo(x + w / 2, y);
      ctx.closePath();
    };
    footShadow(ctx, x, y, w * 1.2, 0.3);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      // The walls reach up under the roof, so no seam shows between them.
      ctx.fillRect(x - w / 2, top - 2, w, h + 2);
      ctx.beginPath();
      ctx.moveTo(x - w * 0.58, top);
      ctx.lineTo(x, top - roofH);
      ctx.lineTo(x + w * 0.58, top);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(...chimney);
      ctx.fillRect(chimney[0] - w * 0.012, chimney[1] - w * 0.016, chimney[2] + w * 0.024, w * 0.022);
    });
    // On the wall and gable: shade on the side away from the light, the planks, and the
    // shadow the roof edge throws.
    ctx.save();
    gable();
    ctx.clip();
    const shade = ctx.createLinearGradient(x + side * w * 0.5, 0, x - side * w * 0.5, 0);
    shade.addColorStop(0, 'rgb(0 0 0 / 0)');
    shade.addColorStop(1, 'rgb(0 0 0 / 0.2)');
    ctx.fillStyle = shade;
    ctx.fillRect(x - w / 2, top - roofH, w, h + roofH);
    const rand = rng(it.seed ?? Math.round(it.x * 997));
    ctx.fillStyle = tint(pen, it, -0.32, 0.55);
    const plank = Math.max(3.5, h / 12);
    for (let py = y - plank; py > top - roofH; py -= plank) {
      // Each plank seam drawn in a few pieces, as a hand would, with small gaps.
      for (let px = x - w / 2; px < x + w / 2; ) {
        const run = w * (0.15 + rand() * 0.35);
        ctx.fillRect(px, py + (rand() - 0.5) * 0.4, run - (rand() < 0.3 ? 2 : 0), thin);
        px += run;
      }
    }
    ctx.strokeStyle = 'rgb(0 0 0 / 0.32)';
    ctx.lineWidth = w * 0.045;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, top + w * 0.035);
    ctx.lineTo(x, top - roofH + w * 0.035);
    ctx.lineTo(x + w * 0.6, top + w * 0.035);
    ctx.stroke();
    ctx.restore();
    // The stone base, and the corner boards.
    ctx.fillStyle = tint(pen, it, -0.28);
    ctx.fillRect(x - w / 2, y - h * 0.07, w, h * 0.07);
    ctx.fillStyle = tint(pen, it, 0.07);
    ctx.fillRect(x - w / 2, top, w * 0.03, h * 0.93);
    ctx.fillRect(x + w / 2 - w * 0.03, top, w * 0.03, h * 0.93);
    // The chimney's shaded side.
    ctx.fillStyle = 'rgb(0 0 0 / 0.22)';
    ctx.fillRect(side > 0 ? chimney[0] : chimney[0] + chimney[2] / 2, chimney[1], chimney[2] / 2, chimney[3]);
    // The roof edge: a band along both slopes, with the tiles' ends ticked along it.
    const edge = it.roof ? pen.tone(it.roof, it.haze ?? 0) : tint(pen, it, -0.2);
    ctx.fillStyle = edge;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, top + w * 0.008);
    ctx.lineTo(x, top - roofH - w * 0.012);
    ctx.lineTo(x + w * 0.6, top + w * 0.008);
    ctx.lineTo(x + w * 0.5, top + w * 0.035);
    ctx.lineTo(x, top - roofH + w * 0.045);
    ctx.lineTo(x - w * 0.5, top + w * 0.035);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgb(0 0 0 / 0.25)';
    ctx.lineWidth = thin;
    for (const dir of [-1, 1]) {
      for (let t = 0.08; t < 0.98; t += 0.07) {
        const ex = x + dir * w * 0.6 * t;
        const ey = top - roofH + (roofH + w * 0.008) * t;
        line(ctx, ex, ey - w * 0.012, ex + dir * w * 0.012, ey + w * 0.03);
      }
    }
    ctx.strokeStyle = it.roof ? pen.tone(it.roof, 0.15, 0.9) : tint(pen, it, 0.15);
    ctx.lineWidth = Math.max(0.8, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, top + w * 0.008);
    ctx.lineTo(x, top - roofH - w * 0.012);
    ctx.lineTo(x + w * 0.6, top + w * 0.008);
    ctx.stroke();
    // The small window up in the gable.
    const gs = w * 0.07;
    ctx.fillStyle = tint(pen, it, 0.1);
    ctx.fillRect(x - gs / 2 - thin * 1.5, top - roofH * 0.48 - thin * 1.5, gs + thin * 3, gs + thin * 3);
    ctx.fillStyle = it.attic ? pen.tone(it.attic) : pen.tone(it.dark ?? '#0b0e18', it.haze ?? 0, 0.6);
    ctx.fillRect(x - gs / 2, top - roofH * 0.48, gs, gs);
    // The door, on a step, with its frame and handle.
    if (it.door) {
      const dw = w * 0.14;
      const dx = x + it.door * w;
      const dh = h * 0.62;
      if (it.doorLit) {
        glow(ctx, dx + dw / 2, y - h * 0.3, w * 0.5, pen.tone(it.doorLit, 0, 0.3), pen.tone(it.doorLit, 0, 0));
        spill(ctx, dx + dw / 2, y, dw * 2.6, pen.tone(it.doorLit, 0, 0.3), pen.tone(it.doorLit, 0, 0));
      }
      ctx.fillStyle = tint(pen, it, 0.1);
      ctx.fillRect(dx - thin * 2, y - dh - thin * 2, dw + thin * 4, dh + thin * 2);
      ctx.fillStyle = it.doorLit ? pen.tone(it.doorLit) : tint(pen, it, -0.35);
      ctx.fillRect(dx, y - dh, dw, dh);
      if (!it.doorLit) {
        ctx.fillStyle = 'rgb(0 0 0 / 0.18)';
        ctx.fillRect(dx + dw * 0.18, y - dh * 0.88, dw * 0.64, dh * 0.3);
        ctx.fillRect(dx + dw * 0.18, y - dh * 0.5, dw * 0.64, dh * 0.38);
        ctx.fillStyle = tint(pen, it, 0.3);
        ctx.beginPath();
        ctx.arc(dx + dw * 0.8, y - dh * 0.48, Math.max(0.8, dw * 0.06), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = tint(pen, it, 0.05);
      ctx.fillRect(dx - dw * 0.15, y - h * 0.035, dw * 1.3, h * 0.035);
    }
    for (const win of it.windows ?? [{ x: -0.22 }, { x: 0.18 }]) {
      const wx = x + win.x * w;
      const ws = w * (win.s ?? 0.16);
      const wy = y - h * 0.62;
      const lit = win.lit ?? it.lit;
      if (lit) {
        glow(ctx, wx + ws / 2, wy + ws / 2, ws * 2.6, pen.tone(lit, 0, 0.35), pen.tone(lit, 0, 0));
        spill(ctx, wx + ws / 2, y + h * 0.02, ws * 3, pen.tone(lit, 0, 0.16), pen.tone(lit, 0, 0));
      }
      // The frame, then the glass: warm and brighter low down where a lamp is, or dark
      // with a pale streak of reflected sky.
      const f = Math.max(1.2, ws * 0.09);
      ctx.fillStyle = tint(pen, it, 0.12);
      ctx.fillRect(wx - f, wy - f, ws + f * 2, ws + f * 2);
      if (lit) {
        const g = ctx.createLinearGradient(0, wy, 0, wy + ws);
        g.addColorStop(0, pen.tone(lit, 0.06));
        g.addColorStop(1, pen.tone(mixHex(lit, '#fff8e6', 0.45)));
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = pen.tone(it.dark ?? '#0b0e18', it.haze ?? 0, 0.75);
      }
      ctx.fillRect(wx, wy, ws, ws);
      if (!lit) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(wx, wy, ws, ws);
        ctx.clip();
        ctx.strokeStyle = tint(pen, it, 0.5, 0.18);
        ctx.lineWidth = ws * 0.18;
        line(ctx, wx + ws * 0.1, wy + ws * 1.1, wx + ws * 0.9, wy - ws * 0.1);
        ctx.restore();
      }
      if (win.who) {
        // Somebody standing at the window, seen from outside: head and shoulders.
        ctx.fillStyle = pen.tone(it.color ?? '#141826');
        ctx.beginPath();
        ctx.arc(wx + ws * 0.5, wy + ws * 0.5, ws * 0.17, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(wx + ws * 0.5, wy + ws * 1.02, ws * 0.32, ws * 0.36, 0, Math.PI, 0);
        ctx.fill();
      }
      ctx.fillStyle = tint(pen, it, 0.12);
      ctx.fillRect(wx + ws / 2 - f * 0.4, wy, f * 0.8, ws);
      ctx.fillRect(wx, wy + ws / 2 - f * 0.4, ws, f * 0.8);
      // The sill, a little wider than the frame, with its shadow under it.
      ctx.fillStyle = 'rgb(0 0 0 / 0.25)';
      ctx.fillRect(wx - f * 1.6, wy + ws + f * 1.9, ws + f * 3.2, f * 0.9);
      ctx.fillStyle = tint(pen, it, 0.18);
      ctx.fillRect(wx - f * 1.8, wy + ws + f * 0.8, ws + f * 3.6, f * 1.1);
    }
  },

  // A five-storey block of flats with a grid of windows, some lit.
  flats(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.45);
    const h = pen.S(it.h ?? 0.32);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2, y - h, w, h);
    });
    const rand = rng(it.seed ?? 21);
    const rows = it.rows ?? 5;
    const cols = it.cols ?? 8;
    const cw = w / cols;
    const rh = h / rows;
    ctx.fillStyle = tint(pen, it, 0.12);
    ctx.fillRect(x - w / 2 - 2, y - h - 3, w + 4, 3);
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = tint(pen, it, 0.07);
      ctx.fillRect(x - w / 2, y - h + (r + 1) * rh - 1, w, 1.2);
      for (let c = 0; c < cols; c++) {
        const on = rand() < (it.litShare ?? 0.25);
        const wx = x - w / 2 + c * cw + cw * 0.28;
        const wy = y - h + r * rh + rh * 0.3;
        if (on) {
          // A lit window: warm, a little brighter at the bottom, one side half drawn.
          const g = ctx.createLinearGradient(0, wy, 0, wy + rh * 0.4);
          g.addColorStop(0, pen.tone(it.lit ?? '#ffcf7a', 0, 0.75));
          g.addColorStop(1, pen.tone(mixHex(it.lit ?? '#ffcf7a', '#fff6e0', 0.4), 0, 0.95));
          ctx.fillStyle = g;
          ctx.fillRect(wx, wy, cw * 0.44, rh * 0.4);
          ctx.fillStyle = 'rgb(60 30 20 / 0.35)';
          ctx.fillRect(rand() < 0.5 ? wx : wx + cw * 0.3, wy, cw * 0.14, rh * 0.4);
        } else {
          ctx.fillStyle = pen.tone('#000000', 0, 0.25);
          ctx.fillRect(wx, wy, cw * 0.44, rh * 0.4);
        }
      }
    }
    if (it.dark !== undefined) {
      // One window that stays dark on purpose: the player's own flat.
      const [r, c] = it.dark;
      ctx.fillStyle = pen.tone('#05070d');
      ctx.fillRect(x - w / 2 + c * cw + cw * 0.28, y - h + r * rh + rh * 0.3, cw * 0.44, rh * 0.4);
    }
  },

  // A city skyline: blocks of different heights with lit windows and a few masts.
  city(ctx, it, pen) {
    const rand = rng(it.seed ?? 13);
    const y = pen.Y(it.y);
    let x = pen.left - 10;
    const fill = pen.tone(it.color, it.haze ?? 0);
    while (x < pen.right) {
      const bw = pen.S(0.04 + rand() * 0.09);
      const gap = pen.S(rand() * (it.gap ?? 0.01));
      const bh = pen.S(it.hMin ?? 0.06) + rand() * pen.S((it.hMax ?? 0.22) - (it.hMin ?? 0.06));
      ctx.fillStyle = fill;
      ctx.fillRect(x, y - bh, bw, bh + pen.Y(0.3));
      if (rand() < 0.12) ctx.fillRect(x + bw / 2, y - bh - pen.S(0.04), 1, pen.S(0.04));
      if (it.lit) {
        for (let wy = y - bh + 4; wy < y - 3; wy += 5) {
          for (let wx = x + 2; wx < x + bw - 3; wx += 4) {
            if (rand() < (it.litShare ?? 0.12)) {
              ctx.fillStyle = pen.tone(it.lit, 0, 0.5 + rand() * 0.5);
              ctx.fillRect(wx, wy, 1.6, 2);
            }
          }
        }
      }
      x += bw + gap;
    }
  },

  // A wooden pier going out over the water, drawn in simple perspective.
  pier(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const len = pen.Y(it.len ?? 0.12);
    const wNear = pen.S(it.w ?? 0.32);
    const wFar = wNear * 0.45;
    const lean = pen.S(it.lean ?? 0.08);
    const at = (t) => [x + lean * t, y - len * t, wNear + (wFar - wNear) * t];
    // The posts' dark reflections in the water.
    ctx.fillStyle = 'rgb(0 0 0 / 0.2)';
    for (const dir of [-1, 1]) ctx.fillRect(x + dir * wNear / 2 - (dir > 0 ? 3 : 0), y, 3, pen.S(0.09));
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(x - wNear / 2, y);
      ctx.lineTo(x + wNear / 2, y);
      ctx.lineTo(x + lean + wFar / 2, y - len);
      ctx.lineTo(x + lean - wFar / 2, y - len);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i <= 4; i++) {
        const t = i / 4;
        const px = x + lean * t;
        const pw = wNear + (wFar - wNear) * t;
        const py = y - len * t;
        ctx.fillRect(px - pw / 2, py, 2.4 - t, pen.S(0.04) * (1 - t * 0.6));
        ctx.fillRect(px + pw / 2 - 2, py, 2.4 - t, pen.S(0.04) * (1 - t * 0.6));
      }
    });
    // Boards across the deck, closer together further out.
    ctx.strokeStyle = tint(pen, it, -0.35, 0.6);
    ctx.lineWidth = 1;
    for (let i = 1; i < 16; i += 1) {
      const t = 1 - (1 - i / 16) ** 1.25;
      const [px, py, pw] = at(t);
      line(ctx, px - pw / 2 + 1, py, px + pw / 2 - 1, py);
    }
    ctx.strokeStyle = tint(pen, it, 0.18, 0.35);
    for (let i = 1; i < 16; i += 2) {
      const t = 1 - (1 - i / 16) ** 1.25 + 0.004;
      const [px, py, pw] = at(t);
      line(ctx, px - pw / 2 + 1, py + 1, px + pw / 2 - 1, py + 1);
    }
    // The edge of the deck facing us.
    ctx.fillStyle = tint(pen, it, -0.4);
    ctx.fillRect(x - wNear / 2, y, wNear, pen.S(0.012));
  },

  // A bus stop shelter: a roof on two posts, a glass back with a bench in front of it, and
  // the stop's sign on its own pole.
  busstop(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.22);
    const h = w * 0.75;
    // The glass, faintly lit by the sky.
    ctx.fillStyle = tint(pen, it, 0.35, 0.16);
    ctx.fillRect(x - w / 2, y - h, w, h * 0.96);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2 - w * 0.02, y - h - w * 0.02, w * 1.04, w * 0.07);
      ctx.fillRect(x - w / 2, y - h, w * 0.04, h);
      ctx.fillRect(x + w / 2 - w * 0.04, y - h, w * 0.04, h);
      ctx.fillRect(x - w / 2, y - h * 0.38, w, w * 0.03);
      ctx.fillRect(x + w * 0.62, y - h * 1.15, w * 0.025, h * 1.15);
      ctx.beginPath();
      ctx.arc(x + w * 0.635, y - h * 1.15, w * 0.07, 0, Math.PI * 2);
      ctx.fill();
    });
    // The roof's lit edge, and the sign's face.
    ctx.fillStyle = tint(pen, it, 0.3);
    ctx.fillRect(x - w / 2 - w * 0.02, y - h - w * 0.02, w * 1.04, Math.max(0.8, w * 0.012));
    ctx.fillStyle = tint(pen, it, 0.45);
    ctx.beginPath();
    ctx.arc(x + w * 0.635, y - h * 1.15, w * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tint(pen, it, -0.2);
    ctx.fillRect(x + w * 0.635 - w * 0.025, y - h * 1.15 - w * 0.006, w * 0.05, w * 0.012);
  },

  // A bus seen from the side, its front to the left: a sloped windscreen, the folding
  // door behind it, a row of windows lit from inside, a stripe along its side, and wheels
  // in their arches.
  bus(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.6);
    const h = w * 0.3;
    const bottom = y - w * 0.03;
    const left = x - w / 2;
    footShadow(ctx, x, y, w * 1.05, 0.32);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      roundRect(ctx, left, bottom - h, w, h, w * 0.03);
      ctx.fill();
    });
    const lit = pen.tone(it.lit ?? '#ffe2a8', 0, 0.8);
    // The windscreen, then the door, then the passenger windows.
    ctx.fillStyle = lit;
    ctx.beginPath();
    ctx.moveTo(left + w * 0.012, bottom - h * 0.48);
    ctx.lineTo(left + w * 0.02, bottom - h * 0.92);
    ctx.lineTo(left + w * 0.06, bottom - h * 0.92);
    ctx.lineTo(left + w * 0.06, bottom - h * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pen.tone(it.lit ?? '#ffe2a8', 0, 0.55);
    ctx.fillRect(left + w * 0.075, bottom - h * 0.9, w * 0.075, h * 0.82);
    ctx.fillStyle = tint(pen, it, -0.3);
    ctx.fillRect(left + w * 0.111, bottom - h * 0.9, Math.max(1, w * 0.004), h * 0.82);
    ctx.fillStyle = lit;
    for (let i = 0; i < 6; i++) ctx.fillRect(left + w * (0.18 + i * 0.13), bottom - h * 0.9, w * 0.11, h * 0.38);
    // The stripe, the destination sign over the windscreen, and the lamps.
    ctx.fillStyle = tint(pen, it, 0.22, 0.85);
    ctx.fillRect(left + w * 0.16, bottom - h * 0.4, w * 0.83, h * 0.06);
    ctx.fillStyle = pen.tone('#ffb84a', 0, 0.9);
    ctx.fillRect(left + w * 0.015, bottom - h * 0.97, w * 0.05, h * 0.04);
    ctx.fillStyle = pen.tone('#fff1c8');
    ctx.fillRect(left + w * 0.004, bottom - h * 0.24, w * 0.01, h * 0.08);
    ctx.fillStyle = pen.tone('#c8333a');
    ctx.fillRect(left + w - w * 0.012, bottom - h * 0.32, w * 0.01, h * 0.1);
    for (const dx of [-0.32, 0.3]) {
      ctx.fillStyle = pen.tone('#05070d', 0, 0.85);
      ctx.beginPath();
      ctx.arc(x + dx * w, bottom, w * 0.064, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = pen.tone('#07090f');
      ctx.beginPath();
      ctx.arc(x + dx * w, bottom, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = tint(pen, it, 0.35, 0.6);
      ctx.beginPath();
      ctx.arc(x + dx * w, bottom, w * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // A car from the side, front to the right (`face: -1` turns it round). A rounded roof and
  // bonnet, wheel arches, a door line, the side windows (lit warm by `inside`), and a soft
  // highlight along its shoulder from the scene's light. `lights` is the colour of the red
  // rear lights; with them on, the headlights burn warm yellow (`head`) and throw a beam
  // onto the road ahead, `beam` column widths long (0 for the lamps only).
  car(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.2);
    const face = it.face ?? 1;
    // Drawn in the car's own units: 1 is the car's length, x forward, y up from the road.
    // A car is about three times as long as it is tall (the roof is at 0.34).
    ctx.translate(x, y);
    ctx.scale(face * w, w);
    const wheels = [-0.31, 0.32];
    const wheelR = 0.088;
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(-0.49, -0.07);
      ctx.quadraticCurveTo(-0.505, -0.15, -0.475, -0.19);
      ctx.quadraticCurveTo(-0.44, -0.215, -0.39, -0.22);
      ctx.quadraticCurveTo(-0.3, -0.33, -0.18, -0.338);
      ctx.lineTo(0.06, -0.34);
      ctx.quadraticCurveTo(0.14, -0.335, 0.24, -0.225);
      ctx.quadraticCurveTo(0.42, -0.205, 0.48, -0.17);
      ctx.quadraticCurveTo(0.505, -0.13, 0.5, -0.07);
      ctx.closePath();
    };
    // The same rim as withRim, with its shift turned into the car's units.
    const shape = (fill) => {
      ctx.fillStyle = fill;
      body();
      ctx.fill();
      // The sill between the wheels, low to the road.
      ctx.fillRect(-0.47, -0.08, 0.94, 0.04);
    };
    if (it.rim) {
      ctx.save();
      ctx.translate(((it.rimSide ?? 1) * face * (it.rimW ?? 1.4)) / w, -0.6 / w);
      shape(pen.tone(it.rim, 0, it.rimAlpha ?? 0.8));
      ctx.restore();
    }
    shape(pen.tone(it.color ?? '#141826', it.haze ?? 0));
    // Wheel arches: a darker hollow round each wheel, then the tyre and a pale hub.
    for (const dx of wheels) {
      ctx.fillStyle = pen.tone('#05070d', 0, 0.85);
      ctx.beginPath();
      ctx.arc(dx, -wheelR, wheelR * 1.22, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = pen.tone('#0b0d14');
      ctx.beginPath();
      ctx.arc(dx, -wheelR, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pen.tone(it.rim ?? '#8a93a8', 0.3, 0.55);
      ctx.beginPath();
      ctx.arc(dx, -wheelR, wheelR * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    // The side windows with the pillar between them, lit warm from inside or dark glass.
    const glass = it.inside ? pen.tone(it.inside, 0, 0.62) : pen.tone(it.rim ?? '#8a93a8', 0.4, 0.22);
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.moveTo(-0.34, -0.225);
    ctx.quadraticCurveTo(-0.27, -0.305, -0.17, -0.312);
    ctx.lineTo(-0.05, -0.314);
    ctx.lineTo(-0.05, -0.225);
    ctx.closePath();
    ctx.moveTo(-0.02, -0.225);
    ctx.lineTo(-0.02, -0.314);
    ctx.lineTo(0.05, -0.314);
    ctx.quadraticCurveTo(0.12, -0.31, 0.2, -0.225);
    ctx.closePath();
    ctx.fill();
    // A line of light along the shoulder, and the door lines below the windows.
    ctx.strokeStyle = pen.tone(it.rim ?? '#8a93a8', 0, 0.38);
    ctx.lineWidth = 0.008;
    ctx.beginPath();
    ctx.moveTo(-0.44, -0.205);
    ctx.quadraticCurveTo(0, -0.215, 0.42, -0.19);
    ctx.stroke();
    ctx.strokeStyle = pen.tone('#000000', 0, 0.35);
    ctx.lineWidth = 0.006;
    for (const dx of [-0.035, 0.21]) line(ctx, dx, -0.22, dx + (dx > 0 ? 0.01 : 0), -0.09);
    if (!it.lights) return;
    // Lights: the red ones at the back, the warm yellow ones at the front with their beam.
    ctx.globalCompositeOperation = 'screen';
    const rear = it.lights;
    const head = it.head ?? '#ffc640';
    glow(ctx, -0.49, -0.16, 0.13, pen.tone(rear, 0, 0.55), pen.tone(rear, 0, 0));
    const beam = (it.beam ?? 0.75 * (it.w ?? 0.2)) / (it.w ?? 0.2);
    if (beam > 0) {
      const cone = ctx.createLinearGradient(0.49, 0, 0.49 + beam, 0);
      cone.addColorStop(0, pen.tone(head, 0, 0.55));
      cone.addColorStop(0.55, pen.tone(head, 0, 0.16));
      cone.addColorStop(1, pen.tone(head, 0, 0));
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(0.49, -0.17);
      ctx.lineTo(0.49 + beam, -0.13);
      ctx.lineTo(0.49 + beam, 0.02);
      ctx.lineTo(0.49, -0.11);
      ctx.closePath();
      ctx.fill();
      // Where the beam lands on the road.
      ctx.save();
      ctx.translate(0.49 + beam * 0.45, 0);
      ctx.scale(1, 0.12);
      glow(ctx, 0, 0, beam * 0.42, pen.tone(head, 0, 0.38), pen.tone(head, 0, 0));
      ctx.restore();
    }
    glow(ctx, 0.48, -0.15, 0.16, pen.tone(head, 0, 0.75), pen.tone(head, 0, 0));
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = pen.tone(rear);
    ctx.fillRect(-0.5, -0.185, 0.018, 0.05);
    ctx.fillStyle = pen.tone('#fff6d8');
    ctx.beginPath();
    ctx.ellipse(0.483, -0.152, 0.014, 0.022, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  // A street lamp with its cone of light and the pool it makes on the ground.
  lamp(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const h = pen.S(it.h ?? 0.4);
    const light = it.light ?? '#ffcf86';
    ctx.globalCompositeOperation = 'screen';
    const cone = ctx.createLinearGradient(0, y - h, 0, y);
    cone.addColorStop(0, pen.tone(light, 0, 0.32));
    cone.addColorStop(1, pen.tone(light, 0, 0.04));
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(x + h * 0.16, y - h * 0.97);
    ctx.lineTo(x + h * 0.16 + h * 0.3, y);
    ctx.lineTo(x + h * 0.16 - h * 0.3, y);
    ctx.closePath();
    ctx.fill();
    glow(ctx, x + h * 0.16, y - h * 0.97, h * 0.22, pen.tone(light, 0, 0.7), pen.tone(light, 0, 0));
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = pen.tone(it.color ?? '#10131d');
    ctx.fillRect(x - 1.2, y - h, 2.4, h);
    ctx.fillRect(x, y - h, h * 0.18, 2);
    ctx.fillStyle = pen.tone(light);
    ctx.fillRect(x + h * 0.12, y - h + 1.5, h * 0.08, 2.5);
  },

  // A wooden bench. `seat` is the seat's height (column widths); by default it grows with
  // the width. A person sitting on a chair (people.js) has the seat at 0.27 of their height.
  bench(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.2);
    const seat = it.seat ? pen.S(it.seat) : w * 0.22;
    const plank = Math.max(2, Math.min(w * 0.05, seat * 0.2));
    footShadow(ctx, x, y, w * 1.1, 0.26);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2, y - seat, w, plank);
      ctx.fillRect(x - w / 2, y - seat * 1.8, w, plank);
      ctx.fillRect(x - w / 2 + plank * 0.3, y - seat * 1.5, w - plank * 0.6, plank * 0.7);
      ctx.fillRect(x - w * 0.45, y - seat * 1.8, plank * 0.8, seat * 1.8);
      ctx.fillRect(x + w * 0.45 - plank * 0.8, y - seat * 1.8, plank * 0.8, seat * 1.8);
      // The front legs, splayed a little.
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + dir * w * 0.38, y - seat);
        ctx.lineTo(x + dir * (w * 0.38 + plank * 0.7), y - seat);
        ctx.lineTo(x + dir * (w * 0.41 + plank * 0.7), y);
        ctx.lineTo(x + dir * w * 0.41, y);
        ctx.closePath();
        ctx.fill();
      }
    });
    // The light along the top of the seat and the back, and the grain of the wood.
    ctx.fillStyle = tint(pen, it, 0.3, 0.8);
    ctx.fillRect(x - w / 2, y - seat, w, Math.max(0.8, plank * 0.25));
    ctx.fillRect(x - w / 2, y - seat * 1.8, w, Math.max(0.8, plank * 0.25));
    ctx.fillStyle = 'rgb(0 0 0 / 0.25)';
    ctx.fillRect(x - w / 2, y - seat + plank * 0.7, w, Math.max(0.6, plank * 0.3));
  },

  // A picket fence from `x` to `x2`: two rails, and pointed pickets in front of them, each
  // a little different, as if set by hand.
  fence(ctx, it, pen) {
    const x0 = pen.X(it.x);
    const x1 = pen.X(it.x2);
    const y = pen.Y(it.y);
    const h = pen.S(it.h ?? 0.05);
    const pw = h * 0.13;
    withRim(ctx, it, pen, (fill) => {
      const rand = rng(it.seed ?? 17);
      ctx.fillStyle = fill;
      ctx.fillRect(x0, y - h * 0.75, x1 - x0, h * 0.1);
      ctx.fillRect(x0, y - h * 0.35, x1 - x0, h * 0.1);
      for (let x = x0; x <= x1; x += h * 0.45) {
        const ph = h * (0.93 + rand() * 0.08);
        const tilt = (rand() - 0.5) * h * 0.04;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + tilt, y - ph + pw * 0.6);
        ctx.lineTo(x + pw / 2 + tilt, y - ph);
        ctx.lineTo(x + pw + tilt, y - ph + pw * 0.6);
        ctx.lineTo(x + pw, y);
        ctx.closePath();
        ctx.fill();
      }
    });
    // The rails sit behind the pickets: a little shadow where they meet.
    ctx.fillStyle = 'rgb(0 0 0 / 0.22)';
    ctx.fillRect(x0, y - h * 0.65, x1 - x0, Math.max(0.6, h * 0.03));
    ctx.fillRect(x0, y - h * 0.25, x1 - x0, Math.max(0.6, h * 0.03));
  },

  // A garden gate between two fence runs; `x` is the gate's middle, `open` swings it.
  gate(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const h = pen.S(it.h ?? 0.08);
    const w = h * 1.1;
    PROPS.fence(ctx, { ...it, x2: it.x - (w / 2) / pen.view.colW, x: it.from ?? -0.1 }, pen);
    PROPS.fence(ctx, { ...it, x: it.x + (w / 2) / pen.view.colW, x2: it.to ?? 1.1 }, pen);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2 - h * 0.1, y - h * 1.15, h * 0.14, h * 1.15);
      ctx.fillRect(x + w / 2 - h * 0.04, y - h * 1.15, h * 0.14, h * 1.15);
      const open = it.open ?? 0;
      const gw = w * (1 - open * 0.6);
      ctx.fillRect(x - w / 2, y - h * 0.8, gw, h * 0.1);
      ctx.fillRect(x - w / 2, y - h * 0.35, gw, h * 0.1);
      for (let i = 0; i <= 4; i += 1) ctx.fillRect(x - w / 2 + (gw * i) / 4 - h * 0.04, y - h * 0.95, h * 0.08, h * 0.95);
    });
  },

  // A dog lead hanging from a post: a loop and a clip.
  leash(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const s = pen.S(it.s ?? 0.06);
    ctx.strokeStyle = pen.tone(it.color ?? '#c8333a');
    ctx.lineWidth = Math.max(1.5, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s * 0.4, y + s * 0.8, x + s * 0.4, y + s * 1.3, x + s * 0.05, y + s * 1.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.1, s * 0.16, s * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = pen.tone('#b8bcc4');
    ctx.fillRect(x, y + s * 1.68, s * 0.12, s * 0.2);
  },

  // A cardboard box with its flaps open.
  box(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.1);
    withRim(ctx, { color: '#b48552', ...it }, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2, y - w * 0.7, w, w * 0.7);
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - w * 0.7);
      ctx.lineTo(x - w * 0.75, y - w * 0.95);
      ctx.lineTo(x - w * 0.25, y - w * 0.95);
      ctx.closePath();
      ctx.moveTo(x + w / 2, y - w * 0.7);
      ctx.lineTo(x + w * 0.75, y - w * 0.95);
      ctx.lineTo(x + w * 0.25, y - w * 0.95);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = pen.tone('#000000', 0, 0.12);
    ctx.fillRect(x - w / 2, y - w * 0.7, w, w * 0.12);
  },

  // A camp fire: logs, flames and a warm pool of light.
  fire(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const s = pen.S(it.s ?? 0.06);
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, x, y - s * 0.4, s * 7, pen.tone('#ff9a4a', 0, 0.45), pen.tone('#ff9a4a', 0, 0));
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = pen.tone('#ffb655');
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y);
    ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.7, x - s * 0.05, y - s * 1.25);
    ctx.quadraticCurveTo(x + s * 0.05, y - s * 0.6, x + s * 0.2, y - s * 0.95);
    ctx.quadraticCurveTo(x + s * 0.55, y - s * 0.45, x + s * 0.5, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pen.tone('#fff0c4');
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.25, s * 0.18, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pen.tone('#1a120d');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.25);
    ctx.fillRect(-s * 0.7, -s * 0.08, s * 1.4, s * 0.16);
    ctx.rotate(-0.5);
    ctx.fillRect(-s * 0.7, -s * 0.08, s * 1.4, s * 0.16);
    ctx.restore();
  },

  // A kitchen at night seen from outside through its window, painted only inside `rect`
  // [x0, y0, x1, y1] (the house wall painted after it frames it): a warm wall, cupboards
  // along the top right, a lamp hanging at `lamp` [x, y] with its light on the wall, and a
  // clock at `clock` [x, y] showing `time` [hours, minutes].
  kitchen(ctx, it, pen) {
    const [u0, v0, u1, v1] = it.rect;
    const x0 = pen.X(u0);
    const y0 = pen.Y(v0);
    const w = pen.X(u1) - x0;
    const h = pen.Y(v1) - y0;
    ctx.beginPath();
    ctx.rect(x0, y0, w, h);
    ctx.clip();
    const wall = ctx.createLinearGradient(0, y0, 0, y0 + h);
    wall.addColorStop(0, pen.tone(it.wall ?? '#9a6538'));
    wall.addColorStop(1, pen.tone(it.floor ?? '#5e3a22'));
    ctx.fillStyle = wall;
    ctx.fillRect(x0, y0, w, h);
    const [lx, ly] = [pen.X(it.lamp[0]), pen.Y(it.lamp[1])];
    const light = it.light ?? '#ffcf86';
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, lx, ly + pen.S(0.04), pen.S(0.5), pen.tone(light, 0, 0.5), pen.tone(light, 0, 0));
    ctx.globalCompositeOperation = 'source-over';
    // Cupboards: a row of doors with small knobs.
    const wood = pen.tone(it.wood ?? '#4a2d18');
    const cx0 = pen.X(it.cupboards?.[0] ?? 0.54);
    const cx1 = pen.X(it.cupboards?.[1] ?? 0.9);
    const ch = pen.S(0.13);
    ctx.fillStyle = wood;
    ctx.fillRect(cx0, y0, cx1 - cx0, ch);
    ctx.fillStyle = pen.tone('#000000', 0, 0.3);
    const doors = Math.max(2, Math.round((cx1 - cx0) / pen.S(0.11)));
    for (let i = 1; i < doors; i += 1) ctx.fillRect(cx0 + ((cx1 - cx0) * i) / doors - 0.6, y0, 1.2, ch);
    ctx.fillStyle = pen.tone('#d8b27a', 0, 0.8);
    for (let i = 0; i < doors; i += 1) ctx.fillRect(cx0 + ((cx1 - cx0) * (i + 0.5)) / doors - 1, y0 + ch * 0.8, 2, 2);
    // The clock: a pale face, the hour marks, two hands.
    if (it.clock) {
      const [kx, ky] = [pen.X(it.clock[0]), pen.Y(it.clock[1])];
      const r = pen.S(it.clockR ?? 0.04);
      ctx.fillStyle = pen.tone('#2a1a10');
      ctx.beginPath();
      ctx.arc(kx, ky, r * 1.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pen.tone('#f1e6cf');
      ctx.beginPath();
      ctx.arc(kx, ky, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pen.tone('#5a4636');
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        ctx.fillRect(kx + Math.sin(a) * r * 0.78 - 0.7, ky - Math.cos(a) * r * 0.78 - 0.7, 1.4, 1.4);
      }
      const [hh, mm] = it.time ?? [1, 6];
      ctx.strokeStyle = pen.tone('#1c1410');
      ctx.lineCap = 'round';
      const hand = (a, len, wid) => {
        ctx.lineWidth = wid;
        line(ctx, kx, ky, kx + Math.sin(a) * len, ky - Math.cos(a) * len);
      };
      hand((((hh % 12) + mm / 60) / 12) * Math.PI * 2, r * 0.5, Math.max(1.4, r * 0.12));
      hand((mm / 60) * Math.PI * 2, r * 0.75, Math.max(1, r * 0.07));
    }
    // The lamp on its cord: a dark shade, bright underneath.
    ctx.strokeStyle = pen.tone('#1a120c');
    ctx.lineWidth = 1.2;
    line(ctx, lx, y0, lx, ly);
    const sw = pen.S(0.06);
    ctx.fillStyle = pen.tone('#2c1c12');
    ctx.beginPath();
    ctx.moveTo(lx - sw * 0.35, ly);
    ctx.lineTo(lx + sw * 0.35, ly);
    ctx.lineTo(lx + sw * 0.6, ly + sw * 0.45);
    ctx.lineTo(lx - sw * 0.6, ly + sw * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pen.tone('#fff0c8');
    ctx.fillRect(lx - sw * 0.5, ly + sw * 0.42, sw, sw * 0.08);
  },

  // The inside of a dark room: a wall with one window cut out, so the layers painted
  // before it show through the window as the view outside.
  room(ctx, it, pen) {
    const [u0, v0, u1, v1] = it.window;
    const x0 = pen.X(u0);
    const y0 = pen.Y(v0);
    const x1 = pen.X(u1);
    const y1 = pen.Y(v1);
    ctx.fillStyle = pen.tone(it.color);
    ctx.beginPath();
    ctx.rect(0, 0, pen.right, pen.view.h);
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    ctx.fill('evenodd');
    ctx.fillStyle = pen.tone(it.frame ?? it.color);
    const bar = Math.max(3, pen.S(0.012));
    ctx.fillRect((x0 + x1) / 2 - bar / 2, y0, bar, y1 - y0);
    ctx.fillRect(x0, y0 + (y1 - y0) * 0.42, x1 - x0, bar);
    ctx.fillRect(x0 - bar, y1, x1 - x0 + bar * 2, bar * 1.6);
  },

  // A band of wall or floor across the whole width, from `y` down to `y2`, in `color`.
  // `planks` draws that many floorboard seams, closer together toward the back; `trim`
  // a skirting line along the top edge.
  band(ctx, it, pen) {
    const y0 = pen.Y(it.y);
    const y1 = pen.Y(it.y2 ?? 1);
    const rand = rng(it.seed ?? Math.round(it.y * 1000) + 11);
    ctx.fillStyle = pen.tone(it.color);
    ctx.fillRect(0, y0, pen.right, y1 - y0);
    if (it.planks) {
      // Floorboards: each row of boards a shade lighter or darker than the next, the
      // seams between the rows, and the joints where one board ends and the next begins.
      const seams = [y0];
      for (let i = 1; i <= it.planks; i += 1) seams.push(y0 + (y1 - y0) * (i / (it.planks + 1)) ** 1.6);
      seams.push(y1);
      for (let i = 0; i < seams.length - 1; i += 1) {
        const [a, b] = [seams[i], seams[i + 1]];
        ctx.fillStyle = rand() < 0.5 ? 'rgb(255 245 230 / 0.035)' : 'rgb(0 0 0 / 0.05)';
        ctx.fillRect(0, a, pen.right, b - a);
        ctx.fillStyle = 'rgb(0 0 0 / 0.14)';
        for (let x = rand() * 120; x < pen.right; x += 70 + rand() * 120) ctx.fillRect(x, a, 1, b - a);
        if (i > 0) {
          ctx.fillStyle = 'rgb(0 0 0 / 0.16)';
          ctx.fillRect(0, a, pen.right, 1);
          ctx.fillStyle = 'rgb(255 245 230 / 0.06)';
          ctx.fillRect(0, a + 1, pen.right, 1);
        }
      }
    } else if (y1 - y0 > pen.view.h * 0.2) {
      // A wall: a little darker low down, away from the ceiling light, with the faint
      // up-and-down strokes of a painted wall.
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, 'rgb(255 248 235 / 0.05)');
      g.addColorStop(1, 'rgb(0 0 0 / 0.08)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y0, pen.right, y1 - y0);
      ctx.lineCap = 'round';
      for (let i = 0; i < 40; i += 1) {
        const x = rand() * pen.right;
        const y = y0 + rand() * (y1 - y0);
        ctx.strokeStyle = rand() < 0.5 ? 'rgb(255 248 235 / 0.035)' : 'rgb(0 0 0 / 0.03)';
        ctx.lineWidth = 2 + rand() * 4;
        line(ctx, x, y, x + (rand() - 0.5) * 6, y + 30 + rand() * 90);
      }
    }
    if (it.trim) {
      ctx.fillStyle = pen.tone(it.trim);
      ctx.fillRect(0, y0 - Math.max(2, pen.S(0.008)), pen.right, Math.max(2, pen.S(0.012)));
      ctx.fillStyle = 'rgb(255 248 235 / 0.18)';
      ctx.fillRect(0, y0 - Math.max(2, pen.S(0.008)), pen.right, 1);
    }
  },

  // A blackboard on the wall: `x` its middle, `y` its bottom edge, `w` and `h` its size.
  // Chalk on it (letters, a sum, a small sun) and the ledge with two bits of chalk.
  board(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.5);
    const h = pen.S(it.h ?? 0.2);
    const edge = Math.max(3, w * 0.025);
    ctx.fillStyle = pen.tone(it.frame ?? '#7a5534');
    ctx.fillRect(x - w / 2 - edge, y - h - edge, w + edge * 2, h + edge * 2);
    ctx.fillStyle = pen.tone(it.color ?? '#2f4a3c');
    ctx.fillRect(x - w / 2, y - h, w, h);
    // The ledge and its chalk.
    ctx.fillStyle = pen.tone(it.frame ?? '#7a5534');
    ctx.fillRect(x - w / 2 - edge * 1.5, y + edge * 0.6, w + edge * 3, edge * 1.2);
    ctx.fillStyle = pen.tone('#f3efe4');
    ctx.fillRect(x - w * 0.3, y + edge * 0.2, w * 0.05, edge * 0.5);
    ctx.fillRect(x + w * 0.18, y + edge * 0.2, w * 0.035, edge * 0.5);
    // Chalk: a tall A, B and C, a sum underneath, and a sun in the corner.
    const u = h / 10;
    const at = (cx, cy) => [x - w / 2 + cx * u, y - h + cy * u];
    ctx.strokeStyle = pen.tone('#eef2ea', 0, 0.72);
    ctx.lineWidth = Math.max(1.2, u * 0.32);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const path = (pts) => {
      ctx.beginPath();
      pts.forEach(([cx, cy], i) => (i ? ctx.lineTo(...at(cx, cy)) : ctx.moveTo(...at(cx, cy))));
      ctx.stroke();
    };
    path([[1.6, 4.6], [2.6, 1.6], [3.6, 4.6]]);
    path([[2.1, 3.4], [3.1, 3.4]]);
    path([[4.6, 4.6], [4.6, 1.6], [5.6, 1.9], [5.6, 2.8], [4.6, 3.1], [5.8, 3.5], [5.7, 4.4], [4.6, 4.6]]);
    ctx.beginPath();
    ctx.arc(...at(7.6, 3.1), u * 1.5, Math.PI * 0.25, Math.PI * 1.75);
    ctx.stroke();
    path([[1.8, 7.2], [3, 7.2]]);
    path([[2.4, 6.6], [2.4, 7.8]]);
    path([[4.2, 6.8], [5.4, 6.8]]);
    path([[4.2, 7.6], [5.4, 7.6]]);
    const [sx, sy] = at(w / u - 2.4, 2.6);
    ctx.beginPath();
    ctx.arc(sx, sy, u * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, sx + Math.cos(a) * u * 1.3, sy + Math.sin(a) * u * 1.3, sx + Math.cos(a) * u * 1.9, sy + Math.sin(a) * u * 1.9);
    }
  },

  // Sun through a window: a pale shaft from `from` [x0, x1, y] (the window's bottom
  // corners) down to `to` [x0, x1, y] on the floor, brightest where it lands.
  sunbeam(ctx, it, pen) {
    const [a0, a1, ay] = it.from;
    const [b0, b1, by] = it.to;
    const light = it.color ?? '#ffe6a8';
    ctx.globalCompositeOperation = 'screen';
    const shaft = ctx.createLinearGradient(0, pen.Y(ay), 0, pen.Y(by));
    shaft.addColorStop(0, pen.tone(light, 0, it.alpha ?? 0.16));
    shaft.addColorStop(1, pen.tone(light, 0, (it.alpha ?? 0.16) * 0.5));
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(pen.X(a0), pen.Y(ay));
    ctx.lineTo(pen.X(a1), pen.Y(ay));
    ctx.lineTo(pen.X(b1), pen.Y(by));
    ctx.lineTo(pen.X(b0), pen.Y(by));
    ctx.closePath();
    ctx.fill();
    // The patch of sun on the floor.
    ctx.fillStyle = pen.tone(light, 0, (it.alpha ?? 0.16) * 1.2);
    const d = pen.S(it.patch ?? 0.05);
    ctx.beginPath();
    ctx.moveTo(pen.X(b0), pen.Y(by));
    ctx.lineTo(pen.X(b1), pen.Y(by));
    ctx.lineTo(pen.X(b1) + d * 1.6, pen.Y(by) + d);
    ctx.lineTo(pen.X(b0) + d * 1.6, pen.Y(by) + d);
    ctx.closePath();
    ctx.fill();
  },

  // A school chair seen straight on: a wooden back rest and seat on a metal frame. `y` is
  // the floor, `h` the height of the back (about half a child's height). `broken: true`
  // has one front leg snapped off: the chair sags toward that corner and the leg lies on
  // the floor in front of it.
  chair(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const s = pen.S(it.h ?? 0.12);
    const wood = pen.tone(it.color ?? '#a8743f');
    const metal = pen.tone(it.metal ?? '#3f4b5a');
    const bar = Math.max(1.4, s * 0.05);
    ctx.translate(x, y);
    ctx.scale(it.face ?? 1, 1);
    if (it.broken) {
      // The snapped leg, lying on the floor in front.
      ctx.save();
      ctx.translate(s * 0.12, s * 0.05);
      ctx.rotate(-0.2);
      ctx.fillStyle = metal;
      ctx.fillRect(0, -bar / 2, s * 0.42, bar);
      ctx.restore();
      ctx.translate(-s * 0.3, 0);
      ctx.rotate(0.09);
      ctx.translate(s * 0.3, 0);
    }
    // The back legs stand a little further off, so their feet are a little higher; they run
    // up into the posts of the back rest.
    ctx.fillStyle = pen.tone(it.metal ?? '#3f4b5a', 0.25);
    for (const side of [-1, 1]) ctx.fillRect(side * s * 0.26 - bar / 2, -s, bar, s * 0.96);
    ctx.fillStyle = wood;
    ctx.fillRect(-s * 0.31, -s, s * 0.62, s * 0.2);
    // The seat, then the front legs: the right one only a stub when broken.
    ctx.fillRect(-s * 0.34, -s * 0.52, s * 0.68, s * 0.07);
    ctx.fillStyle = metal;
    ctx.fillRect(-s * 0.31 - bar / 2, -s * 0.46, bar, s * 0.46);
    ctx.fillRect(s * 0.31 - bar / 2, -s * 0.46, bar, it.broken ? s * 0.1 : s * 0.46);
    if (it.rim) {
      ctx.fillStyle = pen.tone(it.rim, 0, 0.6);
      ctx.fillRect(-s * 0.34, -s * 0.52, s * 0.68, Math.max(1, s * 0.015));
      ctx.fillRect(-s * 0.31, -s, s * 0.62, Math.max(1, s * 0.015));
    }
  },

  // A desk seen from behind the person at it, so the open laptop's lit screen faces us.
  // `y` is the floor, `w` the desk width, `top` the desk height. Next to a person of
  // height H a desk is about 0.43 H tall and a laptop about a quarter of the desk wide.
  // `screen: null` is a desk with no laptop (a school desk); `rim` lights its top edge.
  desk(ctx, it, pen) {
    const x = pen.X(it.x);
    const floor = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.4);
    const top = floor - pen.S(it.top ?? 0.26);
    const screen = it.screen === null ? null : it.screen ?? '#9fc4ff';
    const lw = w * 0.28;
    const lh = lw * 0.64;
    const lx = x + w * (it.laptop ?? 0.12);
    if (screen) {
      ctx.globalCompositeOperation = 'screen';
      glow(ctx, lx, top - lh * 0.5, w * 0.9, pen.tone(screen, 0, 0.3), pen.tone(screen, 0, 0));
      ctx.globalCompositeOperation = 'source-over';
    }
    const wood = pen.tone(it.color ?? '#0c0f18');
    ctx.fillStyle = wood;
    ctx.fillRect(x - w / 2, top, w, Math.max(3, w * 0.035));
    ctx.fillRect(x - w * 0.46, top, w * 0.035, floor - top);
    ctx.fillRect(x + w * 0.425, top, w * 0.035, floor - top);
    if (it.rim) {
      ctx.fillStyle = pen.tone(it.rim, 0, 0.7);
      ctx.fillRect(x - w / 2, top, w, Math.max(1, w * 0.008));
    }
    if (!screen) return;
    ctx.fillStyle = wood;
    ctx.fillRect(lx - lw / 2, top - lh, lw, lh);
    ctx.fillStyle = pen.tone(screen, 0, 0.95);
    ctx.fillRect(lx - lw / 2 + lw * 0.05, top - lh + lh * 0.07, lw * 0.9, lh * 0.82);
    ctx.fillStyle = wood;
    ctx.fillRect(lx - lw * 0.56, top - 2, lw * 1.12, 2);
  },

  // A child's bed seen from the side, with somebody asleep in it: the head on the pillow
  // and the blanket over the rest, in their own colour (people.js), so you know who it is.
  // `y` is the floor and `top` the top of the mattress, both down the screen, so a dog
  // lying on the blanket can stand at `top` at any screen size.
  bed(ctx, it, pen) {
    const x = pen.X(it.x);
    const floor = pen.Y(it.y);
    const top = pen.Y(it.top);
    const w = pen.S(it.w ?? 0.6);
    const left = x - w / 2;
    const deep = floor - top;
    const wood = pen.tone(it.color ?? '#5a3a26');
    const look = LOOKS[it.who ?? 'me'];
    // Head board, legs and the frame under the mattress.
    ctx.fillStyle = wood;
    ctx.fillRect(left - w * 0.02, top - deep * 1.1, w * 0.05, floor - top + deep * 1.1);
    ctx.fillRect(left + w * 0.95, top - deep * 0.25, w * 0.04, floor - top + deep * 0.25);
    ctx.fillRect(left, top + deep * 0.3, w, deep * 0.28);
    ctx.fillStyle = pen.tone(it.sheet ?? '#e8e2d6');
    ctx.fillRect(left + w * 0.03, top, w * 0.92, deep * 0.3);
    // The pillow and the head on it, then the blanket in a long soft hump.
    ctx.beginPath();
    ctx.ellipse(left + w * 0.13, top - deep * 0.08, w * 0.09, deep * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    const hx = left + w * 0.16;
    const hy = top - deep * 0.3;
    const r = w * 0.05;
    ctx.fillStyle = pen.tone(look.skin);
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pen.tone(look.hair ?? '#3a2a20');
    ctx.beginPath();
    ctx.arc(hx - r * 0.15, hy - r * 0.1, r * 1.05, Math.PI * 0.55, Math.PI * 1.75);
    ctx.closePath();
    ctx.fill();
    const blanket = pen.tone(it.blanket ?? look.top);
    ctx.fillStyle = blanket;
    ctx.beginPath();
    ctx.moveTo(left + w * 0.19, top + deep * 0.05);
    ctx.quadraticCurveTo(left + w * 0.22, top - deep * 0.55, left + w * 0.42, top - deep * 0.5);
    ctx.quadraticCurveTo(left + w * 0.62, top - deep * 0.45, left + w * 0.97, top - deep * 0.04);
    ctx.lineTo(left + w * 0.97, top + deep * 0.62);
    ctx.quadraticCurveTo(left + w * 0.6, top + deep * 0.72, left + w * 0.19, top + deep * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pen.tone('#000000', 0, 0.18);
    ctx.lineWidth = Math.max(1, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(left + w * 0.3, top - deep * 0.2);
    ctx.quadraticCurveTo(left + w * 0.5, top + deep * 0.05, left + w * 0.62, top + deep * 0.4);
    ctx.stroke();
    if (it.rim) {
      ctx.strokeStyle = pen.tone(it.rim, 0, 0.55);
      ctx.lineWidth = Math.max(1, w * 0.008);
      ctx.beginPath();
      ctx.moveTo(left + w * 0.24, top - deep * 0.42);
      ctx.quadraticCurveTo(left + w * 0.42, top - deep * 0.56, left + w * 0.62, top - deep * 0.4);
      ctx.stroke();
    }
  },

  // Stairs going up to the left, from `x` (the bottom step) to `x2`, panelled underneath,
  // with a low dark opening there where things go missing. `y` is the floor, `top` the
  // landing, down the screen.
  stairs(ctx, it, pen) {
    const x0 = pen.X(it.x);
    const x1 = pen.X(it.x2);
    const floor = pen.Y(it.y);
    const top = pen.Y(it.top);
    const n = it.steps ?? 9;
    const thick = pen.S(0.05);
    // The panelled side under the stairs, then the opening into the dark at the bottom.
    ctx.fillStyle = pen.tone(it.under ?? '#a8784e');
    ctx.beginPath();
    ctx.moveTo(x1, floor);
    ctx.lineTo(x1, top + thick);
    ctx.lineTo(x0, floor);
    ctx.closePath();
    ctx.fill();
    const lineAt = (x) => floor - ((x0 - x) / (x0 - x1)) * (floor - top - thick);
    const [o0, o1] = [x1 + (x0 - x1) * 0.14, x1 + (x0 - x1) * 0.64];
    const mouth = (x) => lineAt(x) + (floor - lineAt(x)) * 0.32;
    ctx.fillStyle = pen.tone(it.dark ?? '#0c0806');
    ctx.beginPath();
    ctx.moveTo(o0, floor);
    ctx.lineTo(o0, mouth(o0));
    ctx.lineTo(o1, mouth(o1));
    ctx.lineTo(o1, floor);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pen.tone(it.color ?? '#6b4428');
    ctx.lineWidth = Math.max(2, pen.S(0.012));
    ctx.stroke();
    // The steps, one block each, and the lit edge of every tread.
    const dx = (x0 - x1) / n;
    const dy = (floor - top) / n;
    ctx.fillStyle = pen.tone(it.color ?? '#6b4428');
    ctx.beginPath();
    ctx.moveTo(x0, floor);
    for (let i = 0; i < n; i += 1) {
      ctx.lineTo(x0 - i * dx, floor - (i + 1) * dy);
      ctx.lineTo(x0 - (i + 1) * dx, floor - (i + 1) * dy);
    }
    ctx.lineTo(x1, top + thick);
    ctx.lineTo(x0 - dx * 0.2, floor);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pen.tone(it.rim ?? '#e8c48c', 0, 0.75);
    for (let i = 0; i < n; i += 1) ctx.fillRect(x0 - (i + 1) * dx, floor - (i + 1) * dy, dx, Math.max(1, dy * 0.12));
    // The banister: a rail along the stairs on posts.
    const rail = pen.S(0.2);
    ctx.strokeStyle = pen.tone(it.color ?? '#6b4428', 0.1);
    ctx.lineWidth = Math.max(1.5, pen.S(0.012));
    ctx.beginPath();
    ctx.moveTo(x0 - dx * 0.5, floor - dy - rail);
    ctx.lineTo(x1, top - rail);
    ctx.stroke();
    ctx.lineWidth = Math.max(1, pen.S(0.006));
    for (let i = 0; i < n; i += 2) {
      const px = x0 - (i + 0.5) * dx;
      const py = floor - (i + 1) * dy;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - rail);
      ctx.stroke();
    }
  },

  // A row of shoes by the door, one of each pair gone: `list` gives each pair's colour,
  // `gone` which shoe of each is missing (0 the left, 1 the right, -1 neither).
  shoes(ctx, it, pen) {
    const y = pen.Y(it.y);
    const s = pen.S(it.s ?? 0.06);
    const step = (pen.X(it.x2) - pen.X(it.x)) / it.list.length;
    it.list.forEach((color, i) => {
      for (const side of [0, 1]) {
        if ((it.gone?.[i] ?? 0) === side) continue;
        const sx = pen.X(it.x) + step * (i + 0.3 + side * 0.42);
        // A trainer side on, toe to the right: the upper, the opening at the heel, a few
        // laces, and the pale sole.
        ctx.fillStyle = 'rgb(0 0 0 / 0.25)';
        ctx.beginPath();
        ctx.ellipse(sx, y, s * 0.5, s * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pen.tone(color);
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.42, y - s * 0.06);
        ctx.lineTo(sx + s * 0.44, y - s * 0.06);
        ctx.quadraticCurveTo(sx + s * 0.5, y - s * 0.2, sx + s * 0.18, y - s * 0.24);
        ctx.lineTo(sx - s * 0.1, y - s * 0.36);
        ctx.lineTo(sx - s * 0.38, y - s * 0.36);
        ctx.quadraticCurveTo(sx - s * 0.46, y - s * 0.2, sx - s * 0.42, y - s * 0.06);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgb(0 0 0 / 0.35)';
        ctx.beginPath();
        ctx.ellipse(sx - s * 0.24, y - s * 0.35, s * 0.13, s * 0.035, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pen.tone('#f4efe6', 0.1, 0.8);
        ctx.lineWidth = Math.max(0.7, s * 0.03);
        for (let l = 0; l < 3; l += 1) line(ctx, sx - s * 0.04 + l * s * 0.09, y - s * 0.33 + l * s * 0.04, sx + s * 0.02 + l * s * 0.09, y - s * 0.27 + l * s * 0.04);
        ctx.fillStyle = pen.tone('#e9e3d8', 0.1);
        ctx.fillRect(sx - s * 0.44, y - s * 0.08, s * 0.9, s * 0.08);
      }
    });
  },

  // Bags on the floor, packed to leave: `list` is [dx, w, h, colour, kind] per bag, from
  // `x` along the floor at `y`; kind 'duffel' (soft, with straps) or 'case' (a suitcase).
  bags(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    for (const [dx, w0, h0, color, kind] of it.list) {
      const bx = x + pen.S(dx);
      const w = pen.S(w0);
      const h = pen.S(h0);
      ctx.fillStyle = pen.tone(color);
      ctx.strokeStyle = pen.tone(color, 0.35);
      ctx.lineWidth = Math.max(1.2, w * 0.05);
      if (kind === 'case') {
        roundRect(ctx, bx - w / 2, y - h, w, h, w * 0.08);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx - w * 0.18, y - h);
        ctx.lineTo(bx - w * 0.18, y - h - h * 0.12);
        ctx.lineTo(bx + w * 0.18, y - h - h * 0.12);
        ctx.lineTo(bx + w * 0.18, y - h);
        ctx.stroke();
        ctx.fillStyle = pen.tone(color, 0.2);
        ctx.fillRect(bx - w / 2, y - h * 0.55, w, Math.max(1, h * 0.05));
      } else {
        ctx.beginPath();
        ctx.ellipse(bx, y - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(bx, y - h * 0.95, w * 0.26, h * 0.32, 0, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = pen.tone(color, 0.2);
        ctx.fillRect(bx - w * 0.4, y - h * 0.62, w * 0.8, Math.max(1, h * 0.06));
      }
      if (it.rim) {
        ctx.fillStyle = pen.tone(it.rim, 0, 0.5);
        ctx.fillRect(bx - w * 0.36, y - h * (kind === 'case' ? 1 : 0.96), w * 0.72, Math.max(1, h * 0.04));
      }
    }
  },

  // A door in an inside wall: `y` the floor, `h` its height, with a lit pane up top, or
  // `under`: shut, with the light of the room behind it showing along the bottom.
  door(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.2);
    const h = pen.S(it.h ?? 0.5);
    ctx.fillStyle = pen.tone(it.frame ?? '#f2e6cc');
    ctx.fillRect(x - w / 2 - w * 0.07, y - h - w * 0.07, w * 1.14, h + w * 0.07);
    ctx.fillStyle = pen.tone(it.color ?? '#6b4428');
    ctx.fillRect(x - w / 2, y - h, w, h);
    if (it.pane) {
      glow(ctx, x, y - h * 0.8, w * 0.9, pen.tone(it.pane, 0, 0.25), pen.tone(it.pane, 0, 0));
      ctx.fillStyle = pen.tone(it.pane);
      ctx.fillRect(x - w * 0.3, y - h * 0.9, w * 0.6, h * 0.22);
    }
    ctx.fillStyle = pen.tone('#e8c48c');
    ctx.beginPath();
    ctx.arc(x + w * 0.34, y - h * 0.48, Math.max(1.5, w * 0.04), 0, Math.PI * 2);
    ctx.fill();
    if (it.under) {
      glow(ctx, x, y, w * 0.9, pen.tone(it.under, 0, 0.35), pen.tone(it.under, 0, 0));
      ctx.fillStyle = pen.tone(it.under);
      ctx.fillRect(x - w / 2, y - 2, w, 2);
    }
  },

  // A person (see people.js). The stage draws people on a moving layer instead, so they
  // breathe and wave; this still version is for the checks.
  // Close-ups of hands (closeups.js).
  jar,
  arm,
  grip,
  album,
  trainer,
  swaddle,

  // The small things that make a room somebody's home, each placed by the scene: a plant
  // in a pot ('plant', `tall` for one with long leaves), a picture on the wall ('frame',
  // `pic` [sky, hill], or `paper` for a child's drawing pinned up, `draw` saying of what:
  // a house, a family, a dog, a rainbow, a flower, a boat, a fish; or `photo`, a photo of
  // the people in the story: a list of [who, age] standing in a row, the dog as 'dog', or
  // 'piggyback' for you carrying the partner), a shelf of books
  // ('shelf'), a mug with steam ('mug'), a rug ('rug'), a string of small warm lights
  // ('lights'), coats on hooks ('hooks', each coat in its owner's colour), a bedside lamp
  // ('lamp'), a desk lamp on its bent arm ('desklamp'), a window box of flowers ('flowers'). `dim` (0 to 1) sinks them toward `shade`
  // for a room at night. Sizes are in column widths.
  cozy(ctx, it, pen) {
    const dim = it.dim ?? 0;
    const c = (hex, alpha = 1) => pen.tone(mixHex(hex, it.shade ?? '#0b0f1c', dim), it.haze ?? 0, alpha);
    const r = rng(it.seed ?? 5);
    for (const thing of it.items) {
      const x = pen.X(thing.x);
      // `up` (column widths) lifts a thing off a floor line: onto a desk, a sill, a table.
      const y = pen.Y(thing.y) - pen.S(thing.up ?? 0);
      const S = (v) => pen.S(v);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      switch (thing.is) {
        case 'plant': {
          // The pot, its rim, then the leaves fanning up from the soil.
          const sz = S(thing.s ?? 0.08);
          const leafs = thing.tall ? ['#3f7a4f', '#5b9a62', '#2f6545'] : ['#3f7a4f', '#5b9a62', '#76ad6c', '#2f6545'];
          const n = thing.tall ? 6 : 9;
          for (let i = 0; i < n; i += 1) {
            const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * (thing.tall ? 0.9 : 2.3) + (r() - 0.5) * 0.25;
            const len = sz * (thing.tall ? 0.95 + r() * 0.5 : 0.45 + r() * 0.3);
            ctx.save();
            ctx.translate(x, y - sz * 0.5);
            ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = c(leafs[i % leafs.length]);
            ctx.beginPath();
            ctx.ellipse(0, -len / 2, thing.tall ? sz * 0.07 : sz * 0.16, len / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.fillStyle = c(thing.pot ?? '#b5643c');
          ctx.beginPath();
          ctx.moveTo(x - sz * 0.32, y - sz * 0.5);
          ctx.lineTo(x + sz * 0.32, y - sz * 0.5);
          ctx.lineTo(x + sz * 0.24, y);
          ctx.lineTo(x - sz * 0.24, y);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = c(mixHex(thing.pot ?? '#b5643c', '#000000', 0.22));
          ctx.fillRect(x - sz * 0.35, y - sz * 0.56, sz * 0.7, sz * 0.1);
          break;
        }
        case 'frame': {
          const w = S(thing.w ?? 0.1);
          const h = S(thing.h ?? 0.08);
          ctx.fillStyle = 'rgb(0 0 0 / 0.18)';
          ctx.fillRect(x - w / 2 + 2, y - h / 2 + 3, w, h);
          if (thing.paper) {
            // A child's drawing pinned up, in crayon.
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(thing.tilt ?? 0);
            ctx.fillStyle = c('#f8f3e6');
            ctx.fillRect(-w / 2, -h / 2, w, h);
            crayon(ctx, thing.draw ?? 'house', w, h, c, thing.pic);
            ctx.fillStyle = c('#c9473f');
            ctx.beginPath();
            ctx.arc(0, -h * 0.5, Math.max(1, w * 0.04), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            break;
          }
          ctx.fillStyle = c(thing.frame ?? '#4a3322');
          ctx.fillRect(x - w / 2, y - h / 2, w, h);
          ctx.fillStyle = c('#efe6d4');
          const m = Math.max(1.5, w * 0.08);
          ctx.fillRect(x - w / 2 + m, y - h / 2 + m, w - m * 2, h - m * 2);
          const [sky, hill] = thing.pic ?? ['#9cc4e0', '#5b9a62'];
          const ix = x - w / 2 + m * 1.8;
          const iy = y - h / 2 + m * 1.8;
          const iw = w - m * 3.6;
          const ih = h - m * 3.6;
          if (thing.photo) {
            snapshot(ctx, thing.photo, ix, iy, iw, ih, c, sky, hill);
            break;
          }
          ctx.fillStyle = c(sky);
          ctx.fillRect(ix, iy, iw, ih);
          ctx.fillStyle = c(hill);
          ctx.beginPath();
          ctx.moveTo(ix, iy + ih);
          ctx.lineTo(ix, iy + ih * 0.62);
          ctx.quadraticCurveTo(ix + iw * 0.4, iy + ih * 0.3, ix + iw, iy + ih * 0.66);
          ctx.lineTo(ix + iw, iy + ih);
          ctx.closePath();
          ctx.fill();
          if (thing.sun) {
            ctx.fillStyle = c(thing.sun);
            ctx.beginPath();
            ctx.arc(ix + iw * 0.72, iy + ih * 0.3, Math.max(1, ih * 0.14), 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'shelf': {
          const w = S(thing.w ?? 0.26);
          const t = Math.max(2, S(0.012));
          const book = ['#c9473f', '#2f5a4e', '#e0a83e', '#5b8fd0', '#7b5b8e', '#d6d0c4', '#8b6a4b'];
          let bx = x - w / 2 + S(0.01);
          const n = thing.books ?? 7;
          for (let i = 0; i < n; i += 1) {
            const bw = S(0.014 + r() * 0.01);
            const bh = S(0.045 + r() * 0.025);
            ctx.fillStyle = c(book[(i + (thing.seed ?? 0)) % book.length]);
            if (i === n - 1) {
              // The last one leans.
              ctx.save();
              ctx.translate(bx, y);
              ctx.rotate(0.3);
              ctx.fillRect(0, -bh, bw, bh);
              ctx.restore();
            } else ctx.fillRect(bx, y - bh, bw, bh);
            ctx.fillStyle = c('#ffffff', 0.25);
            if (i !== n - 1) ctx.fillRect(bx + bw * 0.2, y - bh * 0.8, bw * 0.6, Math.max(0.6, bh * 0.06));
            bx += bw + 0.6;
          }
          ctx.fillStyle = c(thing.wood ?? '#6b4a2e');
          ctx.fillRect(x - w / 2, y, w, t);
          ctx.fillStyle = 'rgb(0 0 0 / 0.16)';
          ctx.fillRect(x - w / 2, y + t, w, t * 0.8);
          ctx.fillStyle = c(thing.wood ?? '#6b4a2e');
          for (const side of [-1, 1]) ctx.fillRect(x + side * w * 0.36 - t * 0.4, y + t, t * 0.8, t * 2.2);
          break;
        }
        case 'mug': {
          const sz = S(thing.s ?? 0.035);
          ctx.strokeStyle = c(thing.color ?? '#e9e2d4');
          ctx.lineWidth = Math.max(1, sz * 0.14);
          ctx.beginPath();
          ctx.arc(x + sz * 0.5, y - sz * 0.5, sz * 0.24, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
          ctx.fillStyle = c(thing.color ?? '#e9e2d4');
          ctx.fillRect(x - sz * 0.45, y - sz, sz * 0.9, sz);
          if (thing.steam !== false) {
            ctx.strokeStyle = c('#ffffff', 0.5);
            ctx.lineWidth = Math.max(0.8, sz * 0.1);
            for (const dx of [-0.15, 0.18]) {
              ctx.beginPath();
              ctx.moveTo(x + sz * dx, y - sz * 1.2);
              ctx.quadraticCurveTo(x + sz * (dx - 0.25), y - sz * 1.6, x + sz * dx, y - sz * 2);
              ctx.quadraticCurveTo(x + sz * (dx + 0.25), y - sz * 2.4, x + sz * dx, y - sz * 2.8);
              ctx.stroke();
            }
          }
          break;
        }
        case 'rug': {
          const w = S(thing.w ?? 0.5);
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(1, thing.flat ?? 0.2);
          ctx.fillStyle = c(thing.color ?? '#b5643c');
          ctx.beginPath();
          ctx.ellipse(0, 0, w / 2, w / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = c(mixHex(thing.color ?? '#b5643c', '#f6ead2', 0.45));
          ctx.lineWidth = w * 0.03;
          ctx.beginPath();
          ctx.ellipse(0, 0, w * 0.4, w * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = w * 0.015;
          ctx.beginPath();
          ctx.ellipse(0, 0, w * 0.28, w * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }
        case 'lights': {
          // A cord hanging in a curve, small bulbs along it, each with its own warm glow.
          const x2 = pen.X(thing.x2);
          const y2 = pen.Y(thing.y2 ?? thing.y);
          const sag = pen.Y(thing.sag ?? 0.04);
          const at = (t) => [x + (x2 - x) * t, y + (y2 - y) * t + Math.sin(Math.PI * t) * sag];
          ctx.strokeStyle = c('#1c1612', 0.8);
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i <= 24; i += 1) {
            const [px, py] = at(i / 24);
            if (i) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
          }
          ctx.stroke();
          const n = thing.n ?? 9;
          for (let i = 0; i < n; i += 1) {
            const [px, py] = at((i + 0.5) / n);
            ctx.globalCompositeOperation = 'screen';
            glow(ctx, px, py + 3, S(0.05), pen.tone(thing.color ?? '#ffcf86', 0, 0.42), pen.tone(thing.color ?? '#ffcf86', 0, 0));
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = pen.tone(thing.color ?? '#ffe2a8');
            ctx.beginPath();
            ctx.ellipse(px, py + 3, 1.8, 2.4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'hooks': {
          // A rail with pegs, and on them the coats of the people who live here.
          const coats = thing.coats ?? [];
          const gap = S(0.08);
          const w = gap * (coats.length + 0.6);
          ctx.fillStyle = c('#6b4a2e');
          ctx.fillRect(x - w / 2, y - S(0.008), w, S(0.016));
          coats.forEach((hex, i) => {
            const cx = x - w / 2 + gap * (i + 0.8);
            ctx.fillStyle = c('#3a2a1e');
            ctx.fillRect(cx - 1, y - S(0.004), 2, S(0.018));
            if (!hex) return;
            const long = S(i % 2 ? 0.17 : 0.2);
            ctx.fillStyle = c(hex);
            ctx.beginPath();
            ctx.moveTo(cx - S(0.012), y + S(0.012));
            ctx.quadraticCurveTo(cx - S(0.04), y + S(0.02), cx - S(0.04), y + S(0.05));
            ctx.lineTo(cx - S(0.034), y + long);
            ctx.lineTo(cx + S(0.034), y + long);
            ctx.lineTo(cx + S(0.04), y + S(0.05));
            ctx.quadraticCurveTo(cx + S(0.04), y + S(0.02), cx + S(0.012), y + S(0.012));
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = c(mixHex(hex, '#000000', 0.25));
            ctx.fillRect(cx - 0.5, y + S(0.03), 1, long - S(0.035));
            ctx.fillRect(cx - S(0.034), y + long - S(0.01), S(0.068), S(0.01));
          });
          break;
        }
        case 'lamp': {
          // A bedside table with a lamp on it, its light on the wall.
          const sz = S(thing.s ?? 0.16);
          ctx.globalCompositeOperation = 'screen';
          glow(ctx, x, y - sz * 0.95, sz * 1.2, pen.tone('#ffb35c', 0, 0.3), pen.tone('#ffb35c', 0, 0));
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = c('#5a3d28');
          ctx.fillRect(x - sz * 0.42, y - sz * 0.5, sz * 0.84, sz * 0.5);
          ctx.fillStyle = c('#4a3020');
          ctx.fillRect(x - sz * 0.46, y - sz * 0.54, sz * 0.92, sz * 0.06);
          ctx.fillStyle = 'rgb(0 0 0 / 0.25)';
          ctx.fillRect(x - sz * 0.3, y - sz * 0.3, sz * 0.6, 1);
          ctx.fillStyle = c('#d8cbb4');
          ctx.fillRect(x - sz * 0.04, y - sz * 0.82, sz * 0.08, sz * 0.28);
          ctx.fillStyle = pen.tone('#ffd9a0');
          ctx.beginPath();
          ctx.moveTo(x - sz * 0.14, y - sz * 1.12);
          ctx.lineTo(x + sz * 0.14, y - sz * 1.12);
          ctx.lineTo(x + sz * 0.24, y - sz * 0.82);
          ctx.lineTo(x - sz * 0.24, y - sz * 0.82);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'desklamp': {
          // A lamp on a bent arm, its shade tipped down at the desk, warm light under it.
          const sz = S(thing.s ?? 0.14);
          const dir = thing.face ?? 1;
          const head = [x + dir * sz * 0.42, y - sz * 0.92];
          ctx.globalCompositeOperation = 'screen';
          glow(ctx, head[0] + dir * sz * 0.12, y - sz * 0.1, sz * 1.5, pen.tone('#ffc77a', 0, 0.42), pen.tone('#ffc77a', 0, 0));
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = c(thing.color ?? '#c9b48a');
          ctx.beginPath();
          ctx.ellipse(x, y - sz * 0.03, sz * 0.2, sz * 0.06, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = c(thing.color ?? '#c9b48a');
          ctx.lineWidth = Math.max(1.2, sz * 0.05);
          ctx.beginPath();
          ctx.moveTo(x, y - sz * 0.05);
          ctx.lineTo(x - dir * sz * 0.08, y - sz * 0.62);
          ctx.lineTo(head[0], head[1]);
          ctx.stroke();
          ctx.save();
          ctx.translate(head[0], head[1]);
          ctx.rotate(dir * 0.5);
          ctx.fillStyle = c(thing.color ?? '#c9b48a');
          ctx.beginPath();
          ctx.moveTo(-sz * 0.08, -sz * 0.04);
          ctx.lineTo(sz * 0.08, -sz * 0.04);
          ctx.lineTo(sz * 0.2, sz * 0.2);
          ctx.lineTo(-sz * 0.2, sz * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = pen.tone('#fff0c8');
          ctx.beginPath();
          ctx.ellipse(0, sz * 0.2, sz * 0.19, sz * 0.045, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'flowers': {
          // A window box: the planter, leaves, and flowers in a few colours.
          const w = S(thing.w ?? 0.5);
          const h = S(0.04);
          const blooms = thing.colors ?? ['#e86a6a', '#f4d35e', '#f6f0e6', '#d784b8'];
          for (let i = 0; i < w / 4; i += 1) {
            const fx = x - w / 2 + r() * w;
            const fy = y - h * (0.6 + r() * 0.9);
            ctx.fillStyle = c(r() < 0.5 ? '#3f7a4f' : '#5b9a62');
            ctx.beginPath();
            ctx.ellipse(fx, fy + h * 0.4, S(0.008), S(0.016), (r() - 0.5) * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
          for (let i = 0; i < w / 7; i += 1) {
            const fx = x - w / 2 + S(0.01) + r() * (w - S(0.02));
            const fy = y - h * (0.7 + r() * 0.9);
            ctx.fillStyle = c(blooms[Math.floor(r() * blooms.length)]);
            ctx.beginPath();
            ctx.arc(fx, fy, Math.max(1.2, S(0.0085)), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = c(thing.box ?? '#7a4e30');
          ctx.fillRect(x - w / 2, y - h * 0.5, w, h);
          ctx.fillStyle = 'rgb(0 0 0 / 0.2)';
          ctx.fillRect(x - w / 2, y + h * 0.5, w, h * 0.3);
          break;
        }
        default:
          throw new Error(`Unknown cozy thing: ${thing.is}`);
      }
      ctx.restore();
    }
  },

  figure(ctx, it, pen) {
    drawPerson(ctx, it, pen);
  },

  // Several people at once: { kind: 'people', list: [ {x, y, h, who, pose, ...}, ... ] }.
  people(ctx, it, pen) {
    for (const p of it.list) drawPerson(ctx, { rim: it.rim, rimSide: it.rimSide, ...p }, pen);
  },
};

/**
 * What a child draws, on a sheet `w` by `h` centred on the origin, coloured through `c`:
 * a house in the sun, the family holding hands, the dog, a rainbow, a big flower, a boat,
 * a fish with bubbles. Thick, simple strokes, the way crayons go.
 */
function crayon(ctx, what, w, h, c, pic) {
  const m = Math.min(w, h);
  const stroke = (css, width) => {
    ctx.strokeStyle = c(css);
    ctx.lineWidth = Math.max(0.8, m * width);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };
  const blob = (x, y, r, css) => {
    ctx.fillStyle = c(css);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.8, r), 0, Math.PI * 2);
    ctx.fill();
  };
  const sun = (x, y) => blob(x, y, m * 0.13, '#f4c542');
  const grass = () => {
    stroke('#5aa04e', 0.07);
    line(ctx, -w * 0.42, h * 0.36, w * 0.42, h * 0.36);
  };
  switch (what) {
    case 'family': {
      // Two tall and one small, hand in hand, under the sun.
      sun(w * 0.3, -h * 0.26);
      const people = [[-w * 0.24, 1, '#c9473f'], [0, 1, '#2f5a4e'], [w * 0.2, 0.62, '#e8a33c']];
      people.forEach(([px, k, css]) => {
        blob(px, h * (0.28 - 0.48 * k), m * 0.08 * (0.7 + 0.3 * k), '#d9a074');
        ctx.fillStyle = c(css);
        ctx.beginPath();
        ctx.moveTo(px, h * (0.33 - 0.42 * k));
        ctx.lineTo(px - w * 0.07 * k, h * 0.3);
        ctx.lineTo(px + w * 0.07 * k, h * 0.3);
        ctx.closePath();
        ctx.fill();
      });
      stroke('#3a2a1e', 0.03);
      line(ctx, -w * 0.18, h * 0.08, -w * 0.06, h * 0.08);
      line(ctx, w * 0.06, h * 0.08, w * 0.15, h * 0.16);
      grass();
      break;
    }
    case 'dog': {
      ctx.fillStyle = c('#b9773f');
      ctx.beginPath();
      ctx.ellipse(-w * 0.02, h * 0.06, w * 0.22, h * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      blob(w * 0.22, -h * 0.1, m * 0.15, '#b9773f');
      blob(w * 0.16, -h * 0.02, m * 0.07, '#7a4a24');
      stroke('#b9773f', 0.06);
      for (const lx of [-0.16, -0.06, 0.06, 0.14]) line(ctx, w * lx, h * 0.14, w * lx, h * 0.3);
      line(ctx, -w * 0.22, h * 0.02, -w * 0.34, -h * 0.12);
      blob(w * 0.27, -h * 0.12, m * 0.025, '#2a1a10');
      grass();
      break;
    }
    case 'rainbow': {
      const bands = ['#e05a4e', '#f4c542', '#5aa04e', '#5b8fd0'];
      bands.forEach((css, i) => {
        stroke(css, 0.07);
        ctx.beginPath();
        ctx.arc(0, h * 0.3, w * (0.38 - i * 0.07), Math.PI, 0);
        ctx.stroke();
      });
      blob(-w * 0.34, h * 0.28, m * 0.1, '#d8e4ee');
      blob(-w * 0.24, h * 0.3, m * 0.12, '#d8e4ee');
      blob(w * 0.3, h * 0.28, m * 0.11, '#d8e4ee');
      break;
    }
    case 'flower': {
      sun(-w * 0.3, -h * 0.28);
      stroke('#5aa04e', 0.06);
      line(ctx, w * 0.06, h * 0.36, w * 0.06, -h * 0.02);
      ctx.fillStyle = c('#5aa04e');
      ctx.beginPath();
      ctx.ellipse(-w * 0.04, h * 0.2, w * 0.09, h * 0.04, -0.5, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        blob(w * 0.06 + Math.cos(a) * m * 0.16, -h * 0.12 + Math.sin(a) * m * 0.16, m * 0.1, pic?.[0] ?? '#d784b8');
      }
      blob(w * 0.06, -h * 0.12, m * 0.09, '#f4c542');
      break;
    }
    case 'boat': {
      sun(w * 0.3, -h * 0.28);
      ctx.fillStyle = c('#5b8fd0');
      ctx.fillRect(-w * 0.44, h * 0.18, w * 0.88, h * 0.24);
      ctx.fillStyle = c('#c9473f');
      ctx.beginPath();
      ctx.moveTo(-w * 0.26, h * 0.06);
      ctx.lineTo(w * 0.22, h * 0.06);
      ctx.lineTo(w * 0.14, h * 0.2);
      ctx.lineTo(-w * 0.18, h * 0.2);
      ctx.closePath();
      ctx.fill();
      stroke('#3a2a1e', 0.03);
      line(ctx, -w * 0.02, h * 0.06, -w * 0.02, -h * 0.3);
      ctx.fillStyle = c('#f6f0e6');
      ctx.strokeStyle = c('#8a8a9a');
      ctx.beginPath();
      ctx.moveTo(-w * 0.01, -h * 0.28);
      ctx.lineTo(w * 0.2, h * 0.02);
      ctx.lineTo(-w * 0.01, h * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'fish': {
      ctx.fillStyle = c('#cfe3f2');
      ctx.fillRect(-w * 0.44, -h * 0.4, w * 0.88, h * 0.8);
      ctx.fillStyle = c(pic?.[0] ?? '#e8a33c');
      ctx.beginPath();
      ctx.ellipse(-w * 0.04, 0, w * 0.2, h * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.14, 0);
      ctx.lineTo(w * 0.32, -h * 0.14);
      ctx.lineTo(w * 0.32, h * 0.14);
      ctx.closePath();
      ctx.fill();
      blob(-w * 0.14, -h * 0.03, m * 0.03, '#2a1a10');
      stroke('#5b8fd0', 0.03);
      for (const [bx, by, br] of [[-0.3, -0.18, 0.04], [-0.34, -0.3, 0.025]]) {
        ctx.beginPath();
        ctx.arc(w * bx, h * by, m * br, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    default: {
      // A house in the sun, on the grass.
      const [a, b] = pic ?? ['#e8a33c', '#5b8fd0'];
      blob(-w * 0.22, -h * 0.18, m * 0.14, a);
      ctx.fillStyle = c(b);
      ctx.fillRect(w * 0.02, -h * 0.02, w * 0.3, h * 0.3);
      ctx.beginPath();
      ctx.moveTo(-w * 0.02, -h * 0.02);
      ctx.lineTo(w * 0.17, -h * 0.22);
      ctx.lineTo(w * 0.36, -h * 0.02);
      ctx.closePath();
      ctx.fill();
      grass();
    }
  }
}

/**
 * A photo of the people in the story, inside the box ix, iy, iw, ih: sky and grass, and
 * the people in a row in their own colours (people.js), the children smaller, the dog at
 * their feet; or 'piggyback': you with the partner on your back, her arms round your neck.
 */
function snapshot(ctx, what, ix, iy, iw, ih, c, sky, grass) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(ix, iy, iw, ih);
  ctx.clip();
  ctx.fillStyle = c(sky);
  ctx.fillRect(ix, iy, iw, ih);
  ctx.fillStyle = c(grass);
  ctx.fillRect(ix, iy + ih * 0.78, iw, ih * 0.22);
  const ground = iy + ih * 0.9;
  const person = (who, x, tall, lean = 0) => {
    const look = LOOKS[who] ?? LOOKS.stranger;
    const bw = tall * 0.3;
    const head = tall * 0.13;
    ctx.save();
    ctx.translate(x, ground);
    ctx.rotate(lean);
    ctx.fillStyle = c(look.legs);
    ctx.fillRect(-bw * 0.36, -tall * 0.46, bw * 0.3, tall * 0.46);
    ctx.fillRect(bw * 0.06, -tall * 0.46, bw * 0.3, tall * 0.46);
    ctx.fillStyle = c(look.top);
    ctx.beginPath();
    ctx.moveTo(-bw * 0.5, -tall * 0.4);
    ctx.lineTo(-bw * 0.46, -tall * 0.76);
    ctx.quadraticCurveTo(0, -tall * 0.82, bw * 0.46, -tall * 0.76);
    ctx.lineTo(bw * 0.5, -tall * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c(look.skin);
    ctx.beginPath();
    ctx.arc(0, -tall * 0.87, head, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c(look.scarf ?? look.hair ?? '#3a2a20');
    ctx.beginPath();
    ctx.arc(0, -tall * 0.89, head * 1.05, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    if (look.hairStyle === 'long') ctx.fillRect(-head * 1.02, -tall * 0.9, head * 0.5, head * 1.7);
    ctx.restore();
  };
  if (what === 'piggyback') {
    // You, laughing under the weight; her on your back, arms round your neck, legs out.
    const tall = ih * 0.62;
    const x = ix + iw * 0.5;
    const her = LOOKS.partner;
    ctx.fillStyle = c(her.legs);
    ctx.save();
    ctx.translate(x, ground - tall * 0.5);
    ctx.fillRect(-tall * 0.34, -tall * 0.06, tall * 0.22, tall * 0.08);
    ctx.fillRect(tall * 0.12, -tall * 0.06, tall * 0.22, tall * 0.08);
    ctx.restore();
    person('me', x, tall);
    ctx.fillStyle = c(her.top);
    ctx.beginPath();
    ctx.ellipse(x - tall * 0.06, ground - tall * 0.84, tall * 0.14, tall * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c(her.skin);
    ctx.beginPath();
    ctx.arc(x - tall * 0.1, ground - tall * 1.02, tall * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c(her.hair);
    ctx.beginPath();
    ctx.arc(x - tall * 0.1, ground - tall * 1.04, tall * 0.12, Math.PI * 0.9, Math.PI * 2.05);
    ctx.fill();
    ctx.fillRect(x - tall * 0.22, ground - tall * 1.04, tall * 0.07, tall * 0.2);
    ctx.strokeStyle = c(her.top);
    ctx.lineWidth = Math.max(1, tall * 0.07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - tall * 0.12, ground - tall * 0.86);
    ctx.quadraticCurveTo(x + tall * 0.02, ground - tall * 0.76, x + tall * 0.12, ground - tall * 0.8);
    ctx.stroke();
  } else {
    const n = what.length;
    what.forEach(([who, age], i) => {
      const x = ix + iw * ((i + 0.5) / n);
      if (who === 'dog') {
        const d = ih * 0.12;
        ctx.fillStyle = c(LOOKS.dog.coat);
        ctx.beginPath();
        ctx.ellipse(x, ground - d * 0.9, d * 1.1, d * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + d * 0.9, ground - d * 1.5, d * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - d * 0.8, ground - d * 0.6, d * 0.25, d * 0.6);
        ctx.fillRect(x + d * 0.5, ground - d * 0.6, d * 0.25, d * 0.6);
        return;
      }
      // Leaning in toward the middle, the way people stand for a photo.
      const lean = (i - (n - 1) / 2) * -0.06;
      person(who, x, ih * (age === 'child' ? 0.42 : 0.66), lean);
    });
  }
  ctx.restore();
}

function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
