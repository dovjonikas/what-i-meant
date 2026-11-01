// art-stairs.js: the 'stairs' scene. Dawn after the storm, the hall at home seen from the
// front door: the stairs go straight up ahead, and the son sits on the fifth step in his
// yellow pyjamas, holding his grandfather's radio, its antenna up. The light from the open
// door behind us lies along the floor and up the first steps, with the father's long
// shadow in it, reaching toward him.
//
// s.p (0..1) brings the colour in: at 0 everything is cold grey-blue; the son's yellow
// arrives first (he is the first person in colour in the whole game), then the rest of the
// hall warms. The hall is built in metres and seen through a simple perspective, so the
// steps, the door and the boy keep true sizes against each other.

import { cachedLayer, put, paper, css, mix, poly, line, mark, clamp, ramp, roundRect } from './art-kit.js';
import { sonOnStair } from './art-people.js';

const EYE = 1.45;
const HALF = 0.62;
const Z0 = 2.2;
const RISE = 0.18;
const RUN = 0.25;
const STEPS = 14;
const SEAT_STEP = 5;
// How near the camera the walls, floor and ceiling start: close enough that their ends
// fall off even a wide computer screen.
const NEAR = 0.22;

function camera(view) {
  const { h, colW, colX } = view;
  const f = Math.min(colW * 1.3, h * 0.62);
  const cx = colX + colW / 2;
  const cy = h * 0.4;
  const P = (X, Y, Z) => [cx + (f * X) / Z, cy + (f * (EYE - Y)) / Z];
  return { f, cx, cy, P };
}

export function paintStairs(ctx, view, t, s, dpr) {
  const p = clamp(s.p ?? 0);
  const cam = camera(view);
  const warm = cachedLayer('stairs-warm', view, dpr, (g) => {
    hall(g, view, cam);
    paper(g, view.w, view.h, 31, 0.8);
  });
  const cold = cachedLayer('stairs-cold', view, dpr, (g) => chill(g, view, warm));
  // The hall warms after the son has his colour.
  put(ctx, cold, view, 1);
  put(ctx, warm, view, ramp(p, 0.3, 1));

  const son = sonPlace(cam);
  const kidWarm = cachedLayer('stairs-son', view, dpr, (g) => {
    const got = sonOnStair(g, { ...son, paint: (hex, dark = 0) => css(mix(hex, '#000000', dark)), t: 0 });
    mark('son', got.box.x, got.box.y, got.box.w, got.box.h, 'high');
    mark('radio', got.radio.x - 2, got.radio.y - 2, got.radio.w + 4, got.radio.h + 4, 'high');
  });
  const kidCold = cachedLayer('stairs-son-cold', view, dpr, (g) => chill(g, view, kidWarm));
  // Breathing: the boy rises and settles a little, from where he sits.
  const breath = 1 + Math.sin(t * 1.5) * 0.006;
  ctx.save();
  ctx.translate(0, son.seatY);
  ctx.scale(1, breath);
  ctx.translate(0, -son.seatY);
  put(ctx, kidCold, view, 1);
  put(ctx, kidWarm, view, ramp(p, 0.02, 0.4));
  ctx.restore();
  return { son: { x: son.x - son.H * 0.2, y: son.seatY - son.H * 0.75, w: son.H * 0.4, h: son.feetY - son.seatY + son.H * 0.75 } };
}

/** Where the boy sits: on the fifth step, feet on the one below, his size from his distance. */
function sonPlace(cam) {
  const zSeat = Z0 + (SEAT_STEP - 1) * RUN + RUN * 0.45;
  const zFeet = Z0 + (SEAT_STEP - 2) * RUN + RUN * 0.55;
  const [x, seatY] = cam.P(-0.04, SEAT_STEP * RISE, zSeat);
  const [, feetY] = cam.P(0, (SEAT_STEP - 1) * RISE, zFeet);
  return { x, seatY, feetY, H: (cam.f / zSeat) * 1.28 };
}

/**
 * Paints `src` again in the cold grey-blue of before the colour comes back: all colour
 * out, a grey-blue in, a little darker. Blend modes also paint where the layer was empty,
 * so last the result is cut back to the shape of `src`.
 */
function chill(g, view, src) {
  g.save();
  g.drawImage(src, 0, 0, view.w, view.h);
  g.globalCompositeOperation = 'saturation';
  g.fillStyle = '#808080';
  g.fillRect(0, 0, view.w, view.h);
  g.globalCompositeOperation = 'color';
  g.fillStyle = css('#5a6c88', 0.55);
  g.fillRect(0, 0, view.w, view.h);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = '#b4bccb';
  g.fillRect(0, 0, view.w, view.h);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(src, 0, 0, view.w, view.h);
  g.restore();
}

/** The hall in its full colours: walls, ceiling, stairs, floor, the door's light and shadow. */
function hall(g, view, cam) {
  const { P } = cam;
  const { w, h } = view;
  const zTop = Z0 + STEPS * RUN;
  const zBack = zTop + 0.9;
  const zCeil = Z0 + 1.0;
  const fill = (pts, color) => {
    poly(g, pts);
    g.fillStyle = color;
    g.fill();
  };
  // Upstairs, still dark: the back wall with a small window letting the dawn in.
  g.fillStyle = css('#3a3440');
  g.fillRect(0, 0, w, h);
  fill([P(-HALF, STEPS * RISE, zBack), P(HALF, STEPS * RISE, zBack), P(HALF, 5.2, zBack), P(-HALF, 5.2, zBack)], css('#6a5a58'));
  const win = [P(-0.22, 2.75, zBack), P(0.22, 2.75, zBack), P(0.22, 3.45, zBack), P(-0.22, 3.45, zBack)];
  fill(win, css('#f4d8a8'));
  g.strokeStyle = css('#4a3c38');
  g.lineWidth = 2;
  line(g, (win[0][0] + win[2][0]) / 2, win[0][1], (win[0][0] + win[2][0]) / 2, win[2][1]);
  fill([P(-HALF, STEPS * RISE, zTop), P(HALF, STEPS * RISE, zTop), P(HALF, STEPS * RISE, zBack), P(-HALF, STEPS * RISE, zBack)], css('#7a5a44'));
  // The side walls, lighter near the door.
  for (const side of [-1, 1]) {
    const x = side * HALF;
    const grad = g.createLinearGradient(P(x, 0, 0.6)[0], 0, P(x, 0, zBack)[0], 0);
    grad.addColorStop(0, css('#efe0c2'));
    grad.addColorStop(0.55, css('#d6c09c'));
    grad.addColorStop(1, css('#7a6a64'));
    fill([P(x, 0, NEAR), P(x, 0, zBack), P(x, 5.2, zBack), P(x, 5.2, NEAR)], grad);
    // The skirting board up along the stairs.
    g.strokeStyle = css('#a88a68');
    g.lineWidth = 2;
    poly(g, [P(x, 0.1, NEAR), P(x, 0.1, Z0), P(x, STEPS * RISE + 0.1, zTop), P(x, STEPS * RISE + 0.1, zBack)], false);
    g.stroke();
  }
  // The stairs, from the top down so nearer steps cover farther ones.
  const runner = 0.33;
  for (let i = STEPS - 1; i >= 0; i--) {
    const z = Z0 + i * RUN;
    const y0 = i * RISE;
    const y1 = (i + 1) * RISE;
    const shade = i / STEPS;
    fill([P(-HALF, y1, z), P(HALF, y1, z), P(HALF, y1, z + RUN), P(-HALF, y1, z + RUN)], css(mix('#b07a50', '#5a4038', shade * 0.8)));
    fill([P(-HALF, y0, z), P(HALF, y0, z), P(HALF, y1, z), P(-HALF, y1, z)], css(mix('#9a6844', '#4a3632', shade * 0.8)));
    // A blue runner up the middle, held by brass rods.
    fill([P(-runner, y1, z), P(runner, y1, z), P(runner, y1, z + RUN), P(-runner, y1, z + RUN)], css(mix('#5e7090', '#2e3444', shade * 0.8)));
    fill([P(-runner, y0, z), P(runner, y0, z), P(runner, y1, z), P(-runner, y1, z)], css(mix('#4e5e7c', '#262c3a', shade * 0.8)));
    g.strokeStyle = css(mix('#d8b060', '#6a5a40', shade));
    g.lineWidth = Math.max(0.8, (cam.f / z) * 0.012);
    line(g, ...P(-runner, y0 + 0.01, z), ...P(runner, y0 + 0.01, z));
    // The nosing's lit edge.
    g.strokeStyle = css(mix('#e8c090', '#6a5040', shade), 0.7);
    g.lineWidth = 1;
    line(g, ...P(-HALF, y1, z), ...P(HALF, y1, z));
  }
  // The floor of the hall: boards running toward the stairs.
  fill([P(-HALF, 0, NEAR), P(HALF, 0, NEAR), P(HALF, 0, Z0), P(-HALF, 0, Z0)], css('#9a6e4a'));
  g.strokeStyle = css('#6a4a32', 0.4);
  g.lineWidth = 1;
  for (let x = -HALF; x <= HALF; x += 0.14) line(g, ...P(x, 0, NEAR), ...P(x, 0, Z0));
  // The ceiling of the hall, and the thick edge where the stairwell opens above.
  fill([P(-HALF, 2.5, NEAR), P(HALF, 2.5, NEAR), P(HALF, 2.5, zCeil), P(-HALF, 2.5, zCeil)], css('#e2d4bc'));
  fill([P(-HALF, 2.5, zCeil), P(HALF, 2.5, zCeil), P(HALF, 2.78, zCeil), P(-HALF, 2.78, zCeil)], css('#c8b494'));
  const [lx, ly] = P(0, 2.5, 2.4);
  g.fillStyle = css('#f2ece0');
  g.beginPath();
  g.ellipse(lx, ly + 4, (cam.f / 2.4) * 0.14, (cam.f / 2.4) * 0.05, 0, 0, Math.PI * 2);
  g.fill();
  handrail(g, cam);
  coats(g, cam);
  doorLight(g, cam);
}

/** A wooden handrail on brackets up the right-hand wall. */
function handrail(g, { P, f }) {
  const x = HALF - 0.05;
  const zTop = Z0 + STEPS * RUN;
  g.strokeStyle = css('#7a4e30');
  g.lineCap = 'round';
  g.lineWidth = Math.max(2, (f / Z0) * 0.04);
  line(g, ...P(x, 0.9, Z0 - 0.1), ...P(x, STEPS * RISE + 0.9, zTop));
  g.lineWidth = Math.max(1, (f / Z0) * 0.015);
  g.strokeStyle = css('#5a5048');
  for (let i = 1; i < STEPS; i += 4) {
    const z = Z0 + i * RUN;
    const y = i * RISE + 0.9 + RISE * 0.5;
    line(g, ...P(x, y, z), ...P(HALF, y - 0.04, z));
  }
  g.lineCap = 'butt';
}

/** A framed picture and a light switch on the left wall, the father's boots below. */
function coats(g, { P, f }) {
  const x = -HALF;
  const frame = [P(x, 1.25, 1.75), P(x, 1.25, 2.15), P(x, 1.65, 2.15), P(x, 1.65, 1.75)];
  poly(g, frame);
  g.fillStyle = css('#6a4a34');
  g.fill();
  const inner = [P(x, 1.29, 1.79), P(x, 1.29, 2.11), P(x, 1.61, 2.11), P(x, 1.61, 1.79)];
  poly(g, inner);
  g.fillStyle = css('#8fb0c4');
  g.fill();
  poly(g, [P(x, 1.29, 1.79), P(x, 1.29, 2.11), P(x, 1.4, 2.11), P(x, 1.4, 1.79)]);
  g.fillStyle = css('#d8c49a');
  g.fill();
  poly(g, [P(x, 1.05, 2.3), P(x, 1.05, 2.36), P(x, 1.13, 2.36), P(x, 1.13, 2.3)]);
  g.fillStyle = css('#f4efe4');
  g.fill();
  const [bx, by] = P(-HALF + 0.12, 0, 1.9);
  const s = f / 1.9;
  g.fillStyle = css('#3a302a');
  for (const dx of [0, 0.13]) {
    roundRect(g, bx + dx * s, by - s * 0.12, s * 0.1, s * 0.12, s * 0.02);
    g.fill();
    g.beginPath();
    g.ellipse(bx + dx * s + s * 0.05, by - s * 0.01, s * 0.07, s * 0.025, 0, 0, Math.PI * 2);
    g.fill();
  }
}

/**
 * The light from the open door behind us: a long warm patch on the floor and the first
 * steps, and inside it the father's shadow, reaching toward the boy.
 */
function doorLight(g, { P, f }) {
  const lit = [P(-0.42, 0, 0.6), P(0.48, 0, 0.6), P(0.36, 0, Z0), P(-0.3, 0, Z0)];
  g.save();
  g.globalCompositeOperation = 'screen';
  poly(g, lit);
  g.fillStyle = css('#ffd8a0', 0.3);
  g.fill();
  for (let i = 0; i < 3; i++) {
    const z = Z0 + i * RUN;
    poly(g, [P(-0.3, i * RISE, z), P(0.36, i * RISE, z), P(0.33, (i + 1) * RISE, z), P(-0.28, (i + 1) * RISE, z)]);
    g.fillStyle = css('#ffd8a0', 0.22 - i * 0.06);
    g.fill();
  }
  g.restore();
  // The shadow of a man standing in the door with the low sun behind him: long, along the
  // floor and up the first steps, the head two steps below the boy's feet. On the stairs
  // it lies on the slope through the steps' inner corners, close enough to their faces.
  const S = (X, Z) => P(X, Math.max(0, Z - Z0) * (RISE / RUN), Z);
  g.fillStyle = css('#2a2028', 0.28);
  for (const [a, b] of [[-0.11, -0.01], [0.04, 0.15]]) {
    poly(g, [S(a, 0.4), S(b, 0.4), S(b - 0.03, 1.55), S(a + 0.03, 1.55)]);
    g.fill();
  }
  const body = [[-0.15, 1.5], [0.17, 1.5], [0.15, 1.75], [0.22, 2.25], [0.2, 2.38], [0.05, 2.42], [0.05, 2.5],
    [-0.03, 2.5], [-0.03, 2.42], [-0.18, 2.38], [-0.2, 2.25], [-0.13, 1.75]];
  poly(g, body.map(([x, z]) => S(x, z)));
  g.fill();
  const head = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    head.push(S(0.01 + Math.cos(a) * 0.1, 2.68 + Math.sin(a) * 0.2));
  }
  poly(g, head);
  g.fill();
}
