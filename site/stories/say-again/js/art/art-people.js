// art-people.js: the two people Say Again shows, and the old radio between them. Nobody
// has eyes or a mouth, so anyone can be them; each keeps one colour for life: the son in
// yellow (pyjamas, a tuft of hair that never lies down), the father in deep teal (his work
// jacket). Sizes follow real bodies: `H` is always the person's standing height in pixels,
// so a child next to an adult, a chair, a table or a door stays in proportion.
//
// Two ways of drawing them: side on, sitting at a table (the kitchen), and from the front,
// sitting on a stair holding the radio (the stairs). `paint(hex)` lets a scene pass every
// colour through its light (or through the grey of the stairs before colour arrives).

import { css, mix, roundRect, poly, line } from './art-kit.js';

export const SON = { top: '#f2c230', legs: '#e7b52a', cuff: '#f8dc7a', hair: '#8a5a34', skin: '#f0c6a4' };
export const FATHER = { top: '#1f5c66', legs: '#2c3139', cuff: '#174a52', hair: '#2b231d', skin: '#d9a886', boots: '#24211f', collar: '#16454d' };

/** A limb: a capsule that narrows from width wa at a to wb at b. */
export function limb(ctx, [ax, ay], [bx, by], wa, wb, fill) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(ax + (nx * wa) / 2, ay + (ny * wa) / 2);
  ctx.lineTo(bx + (nx * wb) / 2, by + (ny * wb) / 2);
  // Round ends bulge outward: past b at one end, back past a at the other.
  ctx.arc(bx, by, wb / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
  ctx.lineTo(ax - (nx * wa) / 2, ay - (ny * wa) / 2);
  ctx.arc(ax, ay, wa / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true);
  ctx.closePath();
  ctx.fill();
}

/**
 * Where the elbow goes when the shoulder is at s and the hand at h, for an upper arm a
 * and a forearm b long: the elbow bends down and back, as a sitting person's does.
 */
export function elbow(s, h, a, b, bendSign = 1) {
  const dx = h[0] - s[0];
  const dy = h[1] - s[1];
  const d = Math.min(a + b - 0.01, Math.max(Math.abs(a - b) + 0.01, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx);
  const off = Math.acos((a * a + d * d - b * b) / (2 * a * d));
  const ang = base + off * bendSign;
  return [s[0] + Math.cos(ang) * a, s[1] + Math.sin(ang) * a];
}

/**
 * A person sitting side on. o: { x, y } the hip on the seat, H standing height, face (1
 * looks right, -1 left), child, look (SON or FATHER), lean (radians forward), floorY,
 * hands: [far, near] targets in screen pixels (or null for the lap), paint(hex, dark),
 * rim (a light colour for the edge the window lights), breath (0..1 of a breath).
 * Returns the points that matter: head, hands.
 */
export function seatedSide(ctx, o) {
  const { H, face = 1, child = false, look } = o;
  const P = (hex, dark = 0) => o.paint(hex, dark);
  const R = {
    torso: H * (child ? 0.29 : 0.3),
    neck: H * (child ? 0.03 : 0.04),
    head: H * (child ? 0.083 : 0.064),
    thigh: H * (child ? 0.22 : 0.245),
    shin: H * (child ? 0.25 : 0.255),
    upper: H * (child ? 0.16 : 0.175),
    fore: H * (child ? 0.15 : 0.165),
    chest: H * (child ? 0.115 : 0.135),
    limb: H * (child ? 0.07 : 0.062),
  };
  const lean = (o.lean ?? 0.08) + Math.sin((o.breath ?? 0) * Math.PI * 2) * 0.008;
  // Work in the person's own frame: hip at 0, facing +x; flip for facing left.
  const toWorld = ([x, y]) => [o.x + x * face, o.y + y];
  const toLocal = ([x, y]) => [(x - o.x) * face, y - o.y];
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale(face, 1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const up = [Math.sin(lean), -Math.cos(lean)];
  const shoulder = [up[0] * R.torso, up[1] * R.torso];
  const neckTop = [shoulder[0] + up[0] * R.neck, shoulder[1] + up[1] * R.neck];
  const headC = [neckTop[0] + up[0] * R.head * 0.9 + R.head * 0.12, neckTop[1] + up[1] * R.head * 0.9];
  const knee = [R.thigh, -R.limb * 0.2];
  const floorLocal = o.floorY - o.y;
  // The shin hangs from the knee; it reaches the floor only if it is long enough.
  const footY = Math.min(floorLocal - R.limb * 0.25, knee[1] + R.shin);
  const dangle = footY < floorLocal - R.limb * 0.4;
  const foot = [knee[0] + (dangle ? -R.shin * 0.08 : R.shin * 0.06), footY];
  const hands = (o.hands ?? [null, null]).map((hnd, i) => (hnd ? toLocal(hnd) : [R.thigh * (0.55 + i * 0.12), -R.limb * 0.9]));
  const s2 = [shoulder[0] - R.chest * 0.05, shoulder[1] + R.chest * 0.18];

  // `part: 'legs'` draws only the legs and 'upper' the rest, so a table can go between.
  if (o.part !== 'upper') {
    limb(ctx, [R.limb * 0.1, -R.limb * 0.2], [knee[0] - R.limb * 0.2, knee[1] - R.limb * 0.1], R.limb * 1.45, R.limb * 1.15, P(look.legs, 0.3));
    limb(ctx, [knee[0] - R.limb * 0.2, knee[1]], [foot[0] - R.limb * 0.2, foot[1]], R.limb * 1.1, R.limb * 0.85, P(look.legs, 0.3));
    shoe(ctx, [foot[0] - R.limb * 0.2, foot[1]], R, child ? P(look.cuff, 0.3) : P(look.boots ?? '#2a2a2a', 0.3));
    limb(ctx, [0, -R.limb * 0.1], knee, R.limb * 1.55, R.limb * 1.2, P(look.legs, 0.08));
    limb(ctx, knee, foot, R.limb * 1.15, R.limb * 0.9, P(look.legs, 0.12));
    shoe(ctx, foot, R, child ? P(look.cuff, 0.05) : P(look.boots ?? '#2a2a2a'));
  }
  if (o.part === 'legs') {
    ctx.restore();
    return { head: toWorld(headC), headR: R.head, hands: hands.map(toWorld), shoulder: toWorld(shoulder), foot: toWorld(foot) };
  }
  // The far arm, in shadow behind the body.
  const farE = elbow(s2, hands[0], R.upper, R.fore, 1);
  limb(ctx, s2, farE, R.limb * 1.05, R.limb * 0.95, P(look.top, 0.32));
  limb(ctx, farE, hands[0], R.limb * 0.95, R.limb * 0.8, P(look.top, 0.32));
  hand(ctx, hands[0], R, P(look.skin, 0.25), farE);

  // The body: a rounded back, a chest, the belly over the lap.
  const rim = o.rim ? css(o.rim, 0.75) : null;
  const torsoPath = (dx = 0, dy = 0) => {
    const back = -R.chest * 0.5;
    ctx.beginPath();
    ctx.moveTo(back + dx, -R.limb * 0.4 + dy);
    ctx.quadraticCurveTo(back - R.chest * 0.08 + up[0] * R.torso * 0.5 + dx, up[1] * R.torso * 0.55 + dy, shoulder[0] - R.chest * 0.38 + dx, shoulder[1] + R.chest * 0.08 + dy);
    ctx.quadraticCurveTo(shoulder[0] - R.chest * 0.1 + dx, shoulder[1] - R.chest * 0.12 + dy, shoulder[0] + R.chest * 0.3 + dx, shoulder[1] + R.chest * 0.08 + dy);
    ctx.quadraticCurveTo(shoulder[0] + R.chest * 0.62 + up[0] * -R.torso * 0.2 + dx, shoulder[1] + R.torso * 0.45 + dy, R.chest * 0.52 + dx, -R.limb * 0.6 + dy);
    ctx.lineTo(R.chest * 0.6 + dx, R.limb * 0.3 + dy);
    ctx.lineTo(back + dx, R.limb * 0.3 + dy);
    ctx.closePath();
  };
  if (rim) {
    ctx.fillStyle = rim;
    torsoPath(-1.4, -0.6);
    ctx.fill();
  }
  ctx.fillStyle = P(look.top);
  torsoPath();
  ctx.fill();
  // Clothes: the father's jacket has a collar, a zip and a pocket; the son's pyjamas a
  // lighter neckline.
  ctx.strokeStyle = P(child ? look.cuff : look.collar, 0);
  ctx.lineWidth = Math.max(1, R.limb * 0.28);
  line(ctx, shoulder[0] - R.chest * 0.25, shoulder[1] + R.chest * 0.02, shoulder[0] + R.chest * 0.22, shoulder[1] + R.chest * 0.04);
  if (!child) {
    ctx.lineWidth = Math.max(0.8, R.limb * 0.12);
    ctx.strokeStyle = P(look.top, 0.25);
    line(ctx, shoulder[0] + R.chest * 0.38, shoulder[1] + R.chest * 0.3, R.chest * 0.48, -R.limb * 0.7);
  }

  // Neck and head: skin, an ear, and hair over the back and top of the head.
  limb(ctx, shoulder, neckTop, R.head * 0.62, R.head * 0.58, P(look.skin, 0.12));
  if (rim) {
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(headC[0] - 1.3, headC[1] - 0.6, R.head, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = P(look.skin);
  ctx.beginPath();
  ctx.ellipse(headC[0], headC[1], R.head * 0.96, R.head, 0, 0, Math.PI * 2);
  ctx.fill();
  // A slight nose and chin make the face side read without any features.
  ctx.beginPath();
  ctx.moveTo(headC[0] + R.head * 0.9, headC[1] - R.head * 0.05);
  ctx.quadraticCurveTo(headC[0] + R.head * 1.12, headC[1] + R.head * 0.12, headC[0] + R.head * 0.88, headC[1] + R.head * 0.28);
  ctx.fill();
  ctx.fillStyle = P(look.hair);
  ctx.beginPath();
  ctx.ellipse(headC[0] - R.head * 0.12, headC[1] - R.head * 0.12, R.head * 0.98, R.head * 0.95, 0, Math.PI * 0.62, Math.PI * 1.98);
  ctx.quadraticCurveTo(headC[0] + R.head * 0.3, headC[1] - R.head * 0.55, headC[0] - R.head * 0.3, headC[1] + R.head * 0.1);
  ctx.closePath();
  ctx.fill();
  if (child) {
    // The tuft that never lies down.
    ctx.strokeStyle = P(look.hair);
    ctx.lineWidth = Math.max(1.2, R.head * 0.16);
    ctx.beginPath();
    ctx.moveTo(headC[0] - R.head * 0.1, headC[1] - R.head * 0.9);
    ctx.quadraticCurveTo(headC[0] + R.head * 0.05, headC[1] - R.head * 1.45, headC[0] + R.head * 0.4, headC[1] - R.head * 1.3);
    ctx.stroke();
  }
  ctx.fillStyle = P(look.skin, 0.18);
  ctx.beginPath();
  ctx.ellipse(headC[0] - R.head * 0.1, headC[1] + R.head * 0.05, R.head * 0.17, R.head * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  // The near arm last, in front of the body.
  const s1 = [shoulder[0] + R.chest * 0.02, shoulder[1] + R.chest * 0.2];
  const nearE = elbow(s1, hands[1], R.upper, R.fore, 1);
  limb(ctx, s1, nearE, R.limb * 1.15, R.limb * 1.0, P(look.top, 0.05));
  limb(ctx, nearE, hands[1], R.limb * 1.0, R.limb * 0.85, P(look.top, 0.05));
  ctx.fillStyle = P(look.cuff);
  const cuffAt = [nearE[0] + (hands[1][0] - nearE[0]) * 0.86, nearE[1] + (hands[1][1] - nearE[1]) * 0.86];
  ctx.beginPath();
  ctx.arc(cuffAt[0], cuffAt[1], R.limb * 0.46, 0, Math.PI * 2);
  ctx.fill();
  hand(ctx, hands[1], R, P(look.skin), nearE);
  ctx.restore();
  return { head: toWorld(headC), headR: R.head, hands: hands.map(toWorld), shoulder: toWorld(shoulder), foot: toWorld(foot) };
}

function hand(ctx, [x, y], R, fill, from) {
  const a = Math.atan2(y - from[1], x - from[0]);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x + Math.cos(a) * R.limb * 0.3, y + Math.sin(a) * R.limb * 0.3, R.limb * 0.62, R.limb * 0.42, a, 0, Math.PI * 2);
  ctx.fill();
}

function shoe(ctx, [x, y], R, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x + R.limb * 0.45, y, R.limb * 0.95, R.limb * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The son sitting on a stair, seen from the front: feet on the step below, knees up, the
 * old radio hugged upright against them, its long antenna up past his head. Small and
 * tired: shoulders down, head tipped to one side. o: { x, seatY (where he sits), feetY
 * (the step his feet are on), H, paint, t }. Returns the box around him and the radio's.
 */
export function sonOnStair(ctx, o) {
  const { x, seatY, feetY, H } = o;
  const P = (hex, dark = 0) => o.paint(hex, dark);
  const look = SON;
  const torso = H * 0.27;
  const sh = seatY - torso;
  const shW = H * 0.11;
  const headR = H * 0.082;
  const limbW = H * 0.068;
  // Knees up and apart, feet together on the step below: a child sitting, not standing.
  const kneeY = seatY - H * 0.085;
  const knees = [[x - H * 0.118, kneeY], [x + H * 0.118, kneeY + H * 0.006]];
  const feet = [[x - H * 0.05, feetY], [x + H * 0.055, feetY]];
  ctx.lineCap = 'round';
  // Soft shadows where he sits and where his feet are.
  ctx.fillStyle = 'rgb(20 12 16 / 0.22)';
  ctx.beginPath();
  ctx.ellipse(x, seatY + H * 0.005, H * 0.15, H * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(x, feetY + H * 0.004, H * 0.13, H * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  // The body, hips wide on the step, shoulders rounded forward.
  ctx.fillStyle = P(look.top, 0.06);
  ctx.beginPath();
  ctx.moveTo(x - H * 0.1, seatY);
  ctx.quadraticCurveTo(x - H * 0.115, sh + torso * 0.45, x - shW, sh + H * 0.025);
  ctx.quadraticCurveTo(x - shW * 0.7, sh - H * 0.008, x, sh - H * 0.004);
  ctx.quadraticCurveTo(x + shW * 0.7, sh - H * 0.008, x + shW, sh + H * 0.025);
  ctx.quadraticCurveTo(x + H * 0.115, sh + torso * 0.45, x + H * 0.1, seatY);
  ctx.closePath();
  ctx.fill();
  // Thighs come forward and up from the hips to the knees; shins go down to the step below.
  knees.forEach((k, i) => {
    const hip = [x + (i ? 1 : -1) * H * 0.05, seatY - H * 0.02];
    limb(ctx, hip, k, limbW * 1.45, limbW * 1.3, P(look.legs, i ? 0.04 : 0.1));
  });
  knees.forEach((k, i) => {
    limb(ctx, k, [feet[i][0], feet[i][1] - limbW * 0.35], limbW * 1.2, limbW * 0.95, P(look.legs, i ? 0.1 : 0.16));
    ctx.fillStyle = P(look.cuff, 0.06);
    ctx.beginPath();
    ctx.ellipse(feet[i][0], feet[i][1] - limbW * 0.18, limbW * 0.62, limbW * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  knees.forEach((k, i) => {
    ctx.fillStyle = P(look.legs, i ? 0 : 0.05);
    ctx.beginPath();
    ctx.ellipse(k[0], k[1], limbW * 0.8, limbW * 0.74, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // Head first, tipped away from the antenna, so the radio and the arms come in front.
  const neckY = sh - H * 0.004;
  const hx = x - H * 0.012;
  const hy = neckY - headR * 0.92;
  ctx.fillStyle = P(look.skin, 0.12);
  ctx.fillRect(hx - headR * 0.28, neckY - headR * 0.35, headR * 0.56, headR * 0.45);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(-0.2);
  ctx.fillStyle = P(look.skin);
  ctx.beginPath();
  ctx.ellipse(0, 0, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P(look.skin, 0.14);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * headR * 0.92, headR * 0.12, headR * 0.15, headR * 0.23, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Hair: a cap over the top with a fringe, and the tuft that never lies down.
  ctx.fillStyle = P(look.hair);
  ctx.beginPath();
  ctx.ellipse(0, -headR * 0.1, headR * 0.98, headR * 0.92, 0, Math.PI * 1.02, Math.PI * 1.98);
  ctx.quadraticCurveTo(headR * 0.55, -headR * 0.3, headR * 0.05, -headR * 0.42);
  ctx.quadraticCurveTo(-headR * 0.5, -headR * 0.24, -headR * 0.97, -headR * 0.08);
  ctx.fill();
  ctx.strokeStyle = P(look.hair);
  ctx.lineWidth = Math.max(1.2, headR * 0.17);
  ctx.beginPath();
  ctx.moveTo(headR * 0.05, -headR * 0.95);
  ctx.quadraticCurveTo(headR * 0.12, -headR * 1.5, headR * 0.5, -headR * 1.4);
  ctx.stroke();
  ctx.restore();
  // The radio, upright on his knees against his chest, the antenna leaning off to the side.
  const rw = H * 0.078;
  const rh = H * 0.2;
  const rx = x - rw / 2 + H * 0.01;
  const ry = seatY - H * 0.035 - rh;
  const ant = oldRadioFront(ctx, rx, ry, rw, rh, H * 0.52, 0.36, P);
  // Arms down from the shoulders, elbows out over the knees, hands round the radio.
  const hands = [[rx - limbW * 0.05, ry + rh * 0.55], [rx + rw + limbW * 0.05, ry + rh * 0.45]];
  [[x - shW * 0.88, sh + H * 0.03], [x + shW * 0.88, sh + H * 0.03]].forEach((s, i) => {
    const out = i ? 1 : -1;
    // Elbows resting on the knees.
    const el = [knees[i][0] - out * H * 0.01, knees[i][1] - H * 0.035];
    limb(ctx, s, el, limbW * 1.05, limbW * 0.92, P(look.top, i ? 0.02 : 0.08));
    limb(ctx, el, hands[i], limbW * 0.92, limbW * 0.78, P(look.top, i ? 0.02 : 0.08));
    ctx.fillStyle = P(look.cuff, 0.04);
    const c = [el[0] + (hands[i][0] - el[0]) * 0.8, el[1] + (hands[i][1] - el[1]) * 0.8];
    ctx.beginPath();
    ctx.arc(c[0], c[1], limbW * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P(look.skin, 0.04);
    ctx.beginPath();
    ctx.ellipse(hands[i][0], hands[i][1], limbW * 0.4, limbW * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  const top = Math.min(hy - headR * 1.6, ant.tipY);
  const half = Math.max(shW, H * 0.12) + limbW;
  return {
    box: { x: x - half, y: top, w: Math.max(half * 2, ant.tipX - x + half), h: feetY - top + limbW },
    radio: { x: rx, y: ant.tipY, w: Math.max(rw, ant.tipX - rx + 2), h: ry + rh - ant.tipY },
    antenna: ant,
  };
}

/**
 * The grandfather's radio from the front: a dark olive case with a speaker grille, a
 * small lit dial, two knobs on top, and a long thin antenna from the top corner, leaning
 * by `lean` radians. Returns where the antenna's tip is.
 */
export function oldRadioFront(ctx, x, y, w, h, antLen, lean, P) {
  const case_ = P('#4f5a44');
  const ax = x + w * 0.8;
  const tipX = ax + Math.sin(lean) * antLen;
  const tipY = y - Math.cos(lean) * antLen;
  ctx.strokeStyle = P('#b8bcc0', 0.1);
  ctx.lineWidth = Math.max(1, w * 0.07);
  line(ctx, ax, y, tipX, tipY);
  ctx.lineWidth = Math.max(1.4, w * 0.12);
  line(ctx, ax, y, ax + Math.sin(lean) * antLen * 0.25, y - Math.cos(lean) * antLen * 0.25);
  ctx.fillStyle = P('#d8dcdc');
  ctx.beginPath();
  ctx.arc(tipX, tipY, Math.max(1.2, w * 0.08), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P('#30362c');
  ctx.fillRect(x + w * 0.15, y - h * 0.05, w * 0.18, h * 0.06);
  ctx.fillRect(x + w * 0.45, y - h * 0.04, w * 0.14, h * 0.05);
  ctx.fillStyle = case_;
  roundRect(ctx, x, y, w, h, w * 0.14);
  ctx.fill();
  ctx.fillStyle = P('#6a7660');
  ctx.fillRect(x + w * 0.08, y + h * 0.03, w * 0.84, h * 0.02);
  // The grille: a column of slots.
  ctx.fillStyle = P('#262b22');
  for (let i = 0; i < 6; i++) ctx.fillRect(x + w * 0.18, y + h * (0.42 + i * 0.075), w * 0.64, Math.max(0.8, h * 0.03));
  // The dial, a warm little window.
  ctx.fillStyle = P('#e8d9a8');
  ctx.fillRect(x + w * 0.18, y + h * 0.13, w * 0.64, h * 0.14);
  ctx.fillStyle = P('#b0403a');
  ctx.fillRect(x + w * 0.5, y + h * 0.13, Math.max(0.8, w * 0.04), h * 0.14);
  return { tipX, tipY };
}

/**
 * The radio lying on its back on a table, seen side on and a little from above: a long
 * low box with the knobs at one end and the antenna lying along the table. Returns its box.
 */
export function oldRadioLying(ctx, x, y, len, P) {
  const hgt = len * 0.3;
  const top = len * 0.12;
  ctx.fillStyle = 'rgb(0 0 0 / 0.18)';
  ctx.beginPath();
  ctx.ellipse(x + len / 2, y + 1, len * 0.6, top * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  // The antenna, pulled out halfway, lying across the table.
  ctx.strokeStyle = P('#b8bcc0', 0.1);
  ctx.lineWidth = Math.max(1, len * 0.025);
  line(ctx, x + len * 0.96, y - hgt * 0.55, x + len * 1.55, y - top * 0.3);
  ctx.fillStyle = P('#d8dcdc');
  ctx.beginPath();
  ctx.arc(x + len * 1.55, y - top * 0.3, Math.max(1, len * 0.03), 0, Math.PI * 2);
  ctx.fill();
  // The face (now facing up), then the side.
  ctx.fillStyle = P('#5c6850');
  poly(ctx, [[x + top * 0.4, y - hgt], [x + len + top * 0.4, y - hgt], [x + len, y - hgt + top], [x, y - hgt + top]]);
  ctx.fill();
  ctx.fillStyle = P('#262b22');
  for (let i = 0; i < 5; i++) {
    const u = 0.42 + i * 0.09;
    poly(ctx, [[x + len * u + top * 0.32, y - hgt + top * 0.2], [x + len * u + top * 0.32 + len * 0.03, y - hgt + top * 0.2], [x + len * u + len * 0.03 + top * 0.08, y - hgt + top * 0.8], [x + len * u + top * 0.08, y - hgt + top * 0.8]]);
    ctx.fill();
  }
  ctx.fillStyle = P('#e8d9a8');
  poly(ctx, [[x + len * 0.12 + top * 0.32, y - hgt + top * 0.2], [x + len * 0.3 + top * 0.32, y - hgt + top * 0.2], [x + len * 0.3 + top * 0.08, y - hgt + top * 0.8], [x + len * 0.12 + top * 0.08, y - hgt + top * 0.8]]);
  ctx.fill();
  ctx.fillStyle = P('#4a543f');
  roundRect(ctx, x, y - hgt + top, len, hgt - top, len * 0.04);
  ctx.fill();
  ctx.fillStyle = P('#30362c');
  ctx.fillRect(x + len, y - hgt * 0.7, len * 0.05, hgt * 0.22);
  ctx.fillRect(x + len, y - hgt * 0.35, len * 0.04, hgt * 0.18);
  return { x, y: y - hgt, w: len * 1.6, h: hgt + 2 };
}

/** Mixes a person colour into a scene's light; scenes pass this (or their own) as `paint`. */
export function lightPaint(shade, light, vivid = 1) {
  return (hex, dark = 0) => {
    const lit = mix(mix(hex, shade, 1 - light), '#000000', dark);
    const y = 0.2126 * lit[0] + 0.7152 * lit[1] + 0.0722 * lit[2];
    return css([y + (lit[0] - y) * vivid, y + (lit[1] - y) * vivid, y + (lit[2] - y) * vivid]);
  };
}
