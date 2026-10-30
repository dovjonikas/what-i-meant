// props.js: the things standing in a scene: houses, blocks of flats, trees, a pier, cars,
// lamps; people.js draws the people.
// Every prop draws as a flat silhouette; `rim` adds a thin light edge on the side the light
// comes from, which is most of what makes a flat shape look lit.
//
// drawProp(ctx, item, pen) picks the function by item.kind. Positions and sizes follow the
// rules at the top of painter.js; `y` is where the prop stands.

import { rng } from './util.js';
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

  pine(ctx, it, pen) {
    const rand = rng(it.seed ?? 5);
    const h = pen.S(it.h);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      pinePath(ctx, pen.X(it.x), pen.Y(it.y), h, h * (it.width ?? 0.3), rng(it.seed ?? 5));
      ctx.fill();
    });
    rand();
  },

  // A leafy tree: a trunk and a crown of overlapping circles.
  tree(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const h = pen.S(it.h);
    withRim(ctx, it, pen, (fill) => {
      const rand = rng(it.seed ?? 9);
      ctx.fillStyle = fill;
      ctx.fillRect(x - h * 0.025, y - h * 0.5, h * 0.05, h * 0.5);
      for (let i = 0; i < 9; i++) {
        const a = rand() * Math.PI * 2;
        const d = rand() * h * 0.18;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d * 1.3, y - h * 0.68 + Math.sin(a) * d, h * (0.14 + rand() * 0.1), 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (it.fruit) {
      const rand = rng((it.seed ?? 9) + 1);
      ctx.fillStyle = pen.tone(it.fruit);
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(x + (rand() - 0.5) * h * 0.5, y - h * 0.68 + (rand() - 0.5) * h * 0.35, h * 0.018, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  // A small country house: walls, a pitched roof, a chimney, one or two windows.
  house(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.3);
    const h = w * (it.tall ?? 0.55);
    const roofH = w * 0.38;
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.beginPath();
      ctx.moveTo(x - w * 0.58, y - h);
      ctx.lineTo(x, y - h - roofH);
      ctx.lineTo(x + w * 0.58, y - h);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x + w * 0.18, y - h - roofH * 0.95, w * 0.07, roofH * 0.6);
    });
    if (it.roof) {
      ctx.fillStyle = pen.tone(it.roof, it.haze ?? 0);
      ctx.beginPath();
      ctx.moveTo(x - w * 0.58, y - h);
      ctx.lineTo(x, y - h - roofH);
      ctx.lineTo(x + w * 0.58, y - h);
      ctx.lineTo(x + w * 0.5, y - h + w * 0.03);
      ctx.lineTo(x, y - h - roofH + w * 0.05);
      ctx.lineTo(x - w * 0.5, y - h + w * 0.03);
      ctx.closePath();
      ctx.fill();
    }
    for (const [i, win] of (it.windows ?? [{ x: -0.22 }, { x: 0.18 }]).entries()) {
      const wx = x + win.x * w;
      const ws = w * (win.s ?? 0.16);
      const wy = y - h * 0.62;
      const lit = win.lit ?? it.lit;
      if (lit) glow(ctx, wx + ws / 2, wy + ws / 2, ws * 2.6, pen.tone(lit, 0, 0.35), pen.tone(lit, 0, 0));
      ctx.fillStyle = lit ? pen.tone(lit) : pen.tone(it.dark ?? '#0b0e18', it.haze ?? 0, 0.6);
      ctx.fillRect(wx, wy, ws, ws);
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
      ctx.fillStyle = pen.tone(it.color ?? '#141826', it.haze ?? 0);
      ctx.fillRect(wx + ws / 2 - 0.6, wy, 1.2, ws);
      ctx.fillRect(wx, wy + ws / 2 - 0.6, ws, 1.2);
      if (i === 0 && it.door) {
        const dw = w * 0.14;
        const dx = x + it.door * w;
        if (it.doorLit) glow(ctx, dx + dw / 2, y - h * 0.3, w * 0.5, pen.tone(it.doorLit, 0, 0.3), pen.tone(it.doorLit, 0, 0));
        ctx.fillStyle = it.doorLit ? pen.tone(it.doorLit) : pen.tone(it.dark ?? '#0b0e18', 0, 0.7);
        ctx.fillRect(dx, y - h * 0.62, dw, h * 0.62);
      }
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
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = rand() < (it.litShare ?? 0.25);
        ctx.fillStyle = on ? pen.tone(it.lit ?? '#ffcf7a', 0, 0.85) : pen.tone('#000000', 0, 0.25);
        ctx.fillRect(x - w / 2 + c * cw + cw * 0.28, y - h + r * rh + rh * 0.3, cw * 0.44, rh * 0.4);
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
  },

  // A bus stop shelter: a roof on two posts and a sign.
  busstop(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.22);
    const h = w * 0.75;
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2, y - h, w, w * 0.06);
      ctx.fillRect(x - w / 2, y - h, w * 0.04, h);
      ctx.fillRect(x + w / 2 - w * 0.04, y - h, w * 0.04, h);
      ctx.fillRect(x - w / 2, y - h * 0.38, w, w * 0.03);
      ctx.fillRect(x + w * 0.62, y - h * 1.15, w * 0.025, h * 1.15);
      ctx.beginPath();
      ctx.arc(x + w * 0.635, y - h * 1.15, w * 0.07, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  // A bus seen from the side, windows lit from inside.
  bus(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.6);
    const h = w * 0.3;
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      roundRect(ctx, x - w / 2, y - h - w * 0.03, w, h, w * 0.03);
      ctx.fill();
    });
    ctx.fillStyle = pen.tone(it.lit ?? '#ffe2a8', 0, 0.8);
    for (let i = 0; i < 7; i++) ctx.fillRect(x - w / 2 + w * (0.05 + i * 0.13), y - h * 0.92, w * 0.1, h * 0.38);
    ctx.fillStyle = pen.tone('#07090f');
    for (const dx of [-0.32, 0.3]) {
      ctx.beginPath();
      ctx.arc(x + dx * w, y - w * 0.03, w * 0.05, 0, Math.PI * 2);
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
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2, y - seat, w, plank);
      ctx.fillRect(x - w / 2, y - seat * 1.8, w, plank);
      ctx.fillRect(x - w * 0.45, y - seat * 1.8, plank * 0.8, seat * 1.8);
      ctx.fillRect(x + w * 0.45 - plank * 0.8, y - seat * 1.8, plank * 0.8, seat * 1.8);
    });
  },

  fence(ctx, it, pen) {
    const x0 = pen.X(it.x);
    const x1 = pen.X(it.x2);
    const y = pen.Y(it.y);
    const h = pen.S(it.h ?? 0.05);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      for (let x = x0; x <= x1; x += h * 0.45) ctx.fillRect(x, y - h, h * 0.12, h);
      ctx.fillRect(x0, y - h * 0.75, x1 - x0, h * 0.1);
      ctx.fillRect(x0, y - h * 0.35, x1 - x0, h * 0.1);
    });
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
    ctx.fillStyle = pen.tone(it.color);
    ctx.fillRect(0, y0, pen.right, y1 - y0);
    if (it.trim) {
      ctx.fillStyle = pen.tone(it.trim);
      ctx.fillRect(0, y0 - Math.max(2, pen.S(0.008)), pen.right, Math.max(2, pen.S(0.012)));
    }
    if (it.planks) {
      ctx.fillStyle = pen.tone('#000000', 0, 0.16);
      for (let i = 1; i <= it.planks; i += 1) {
        const k = (i / (it.planks + 1)) ** 1.6;
        ctx.fillRect(0, y0 + (y1 - y0) * k, pen.right, 1);
      }
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
        ctx.fillStyle = pen.tone(color);
        ctx.beginPath();
        ctx.ellipse(sx, y - s * 0.22, s * 0.42, s * 0.24, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(sx - s * 0.42, y - s * 0.24, s * 0.84, s * 0.16);
        ctx.fillStyle = pen.tone('#e9e3d8', 0.1);
        ctx.fillRect(sx - s * 0.44, y - s * 0.08, s * 0.88, s * 0.08);
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

  figure(ctx, it, pen) {
    drawPerson(ctx, it, pen);
  },

  // Several people at once: { kind: 'people', list: [ {x, y, h, who, pose, ...}, ... ] }.
  people(ctx, it, pen) {
    for (const p of it.list) drawPerson(ctx, { rim: it.rim, rimSide: it.rimSide, ...p }, pen);
  },
};

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
