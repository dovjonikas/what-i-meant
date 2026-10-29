// props.js: the things standing in a scene: houses, blocks of flats, trees, a pier, cars,
// lamps; people.js draws the people.
// Every prop draws as a flat silhouette; `rim` adds a thin light edge on the side the light
// comes from, which is most of what makes a flat shape look lit.
//
// drawProp(ctx, item, pen) picks the function by item.kind. Positions and sizes follow the
// rules at the top of painter.js; `y` is where the prop stands.

import { rng } from './util.js';
import { pinePath } from './painter.js';
import { drawPerson } from './people.js';
import { jar, arm, grip } from './closeups.js';

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

  // A car from behind or from the side; `lights` adds glowing rear lights.
  car(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.2);
    const h = w * 0.34; // a car is about three times as long as it is tall
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      roundRect(ctx, x - w / 2, y - h * 0.62, w, h * 0.5, w * 0.06);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - w * 0.3, y - h * 0.6);
      ctx.lineTo(x - w * 0.18, y - h);
      ctx.lineTo(x + w * 0.2, y - h);
      ctx.lineTo(x + w * 0.34, y - h * 0.6);
      ctx.closePath();
      ctx.fill();
      for (const dx of [-0.3, 0.3]) {
        ctx.beginPath();
        ctx.arc(x + dx * w, y - h * 0.12, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (it.inside) {
      ctx.fillStyle = pen.tone(it.inside, 0, 0.55);
      ctx.fillRect(x - w * 0.14, y - h * 0.94, w * 0.3, h * 0.3);
    }
    if (it.lights) {
      ctx.globalCompositeOperation = 'screen';
      for (const dx of [-0.46, 0.46]) glow(ctx, x + dx * w, y - h * 0.4, w * 0.25, pen.tone(it.lights, 0, 0.6), pen.tone(it.lights, 0, 0));
    }
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

  bench(ctx, it, pen) {
    const x = pen.X(it.x);
    const y = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.2);
    withRim(ctx, it, pen, (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x - w / 2, y - w * 0.22, w, w * 0.05);
      ctx.fillRect(x - w / 2, y - w * 0.4, w, w * 0.05);
      ctx.fillRect(x - w * 0.45, y - w * 0.22, w * 0.04, w * 0.22);
      ctx.fillRect(x + w * 0.41, y - w * 0.22, w * 0.04, w * 0.22);
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

  // A desk seen from behind the person at it, so the open laptop's lit screen faces us.
  // `y` is the floor, `w` the desk width, `top` the desk height. Next to a person of
  // height H a desk is about 0.43 H tall and a laptop about a quarter of the desk wide.
  desk(ctx, it, pen) {
    const x = pen.X(it.x);
    const floor = pen.Y(it.y);
    const w = pen.S(it.w ?? 0.4);
    const top = floor - pen.S(it.top ?? 0.26);
    const screen = it.screen ?? '#9fc4ff';
    const lw = w * 0.28;
    const lh = lw * 0.64;
    const lx = x + w * (it.laptop ?? 0.12);
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, lx, top - lh * 0.5, w * 0.9, pen.tone(screen, 0, 0.3), pen.tone(screen, 0, 0));
    ctx.globalCompositeOperation = 'source-over';
    const wood = pen.tone(it.color ?? '#0c0f18');
    ctx.fillStyle = wood;
    ctx.fillRect(x - w / 2, top, w, Math.max(3, w * 0.035));
    ctx.fillRect(x - w * 0.46, top, w * 0.035, floor - top);
    ctx.fillRect(x + w * 0.425, top, w * 0.035, floor - top);
    ctx.fillRect(lx - lw / 2, top - lh, lw, lh);
    ctx.fillStyle = pen.tone(screen, 0, 0.95);
    ctx.fillRect(lx - lw / 2 + lw * 0.05, top - lh + lh * 0.07, lw * 0.9, lh * 0.82);
    ctx.fillStyle = wood;
    ctx.fillRect(lx - lw * 0.56, top - 2, lw * 1.12, 2);
  },

  // A person (see people.js). The stage draws people on a moving layer instead, so they
  // breathe and wave; this still version is for the checks.
  // Close-ups of hands (closeups.js).
  jar,
  arm,
  grip,

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
