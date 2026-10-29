// closeups.js: the few close shots of hands. With no faces anywhere, hands carry the
// biggest moments: Grandma passing you a jar of jam, a newborn holding on to your finger.
// Each close-up is a prop (see props.js) filling the column; sleeves keep each person's
// colour from people.js, so you know whose hands they are.

import { LOOKS } from './people.js';

/** A jar of Grandma's jam: glass, dark red jam, a checked cloth tied over the lid. */
export function jar(ctx, it, pen) {
  const x = pen.X(it.x);
  const y = pen.Y(it.y);
  const w = pen.S(it.w ?? 0.26);
  const h = w * 1.25;
  // Glass body with jam inside.
  const jam = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  jam.addColorStop(0, pen.tone('#4a0c18'));
  jam.addColorStop(0.45, pen.tone('#8e1d2c'));
  jam.addColorStop(1, pen.tone('#3a0812'));
  ctx.fillStyle = jam;
  rounded(ctx, x - w / 2, y - h, w, h, w * 0.14);
  ctx.fill();
  ctx.fillStyle = pen.tone('#ffffff', 0, 0.22);
  rounded(ctx, x - w * 0.36, y - h * 0.86, w * 0.09, h * 0.62, w * 0.04);
  ctx.fill();
  // The cloth over the lid, with its checks, and the string.
  const top = y - h - w * 0.06;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - w * 0.62, top + w * 0.22);
  ctx.quadraticCurveTo(x - w * 0.5, top - w * 0.12, x, top - w * 0.14);
  ctx.quadraticCurveTo(x + w * 0.5, top - w * 0.12, x + w * 0.62, top + w * 0.22);
  ctx.lineTo(x + w * 0.5, top + w * 0.16);
  ctx.lineTo(x - w * 0.5, top + w * 0.16);
  ctx.closePath();
  ctx.fillStyle = pen.tone('#f4efe4');
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = pen.tone('#c8333a', 0, 0.75);
  const sq = w * 0.11;
  for (let gx = -6; gx < 6; gx += 1) {
    for (let gy = -3; gy < 3; gy += 1) {
      if ((gx + gy) % 2 === 0) ctx.fillRect(x + gx * sq, top - w * 0.2 + gy * sq, sq, sq);
    }
  }
  ctx.restore();
  ctx.strokeStyle = pen.tone('#d8c49a');
  ctx.lineWidth = Math.max(1.5, w * 0.025);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, top + w * 0.13);
  ctx.lineTo(x + w * 0.5, top + w * 0.13);
  ctx.stroke();
}

/**
 * A forearm and hand reaching in from off-screen. `from` and `to` are the elbow end and
 * the hand, in column units; `who` picks the sleeve and skin; `fingers` is 'open' (holding
 * something), 'point' (one finger out) or 'small' (a newborn's hand, curled round).
 */
export function arm(ctx, it, pen) {
  const look = LOOKS[it.who] ?? LOOKS.me;
  const [x0, y0] = [pen.X(it.from[0]), pen.Y(it.from[1])];
  const [x1, y1] = [pen.X(it.to[0]), pen.Y(it.to[1])];
  const s = pen.S(it.size ?? 0.16); // the width of the hand
  const len = Math.hypot(x1 - x0, y1 - y0);
  ctx.save();
  ctx.translate(x0, y0);
  // An arm reaching left is drawn mirrored, so the thumb stays on top either way.
  if (x1 < x0) {
    ctx.scale(-1, 1);
    ctx.rotate(Math.atan2(y1 - y0, x0 - x1));
  } else {
    ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  }
  // Sleeve, then the wrist and hand at the far end, all along the +x axis.
  ctx.fillStyle = pen.tone(it.sleeve ?? look.top);
  rounded(ctx, -s, -s * 0.42, len - s * 0.55 + s, s * 0.84, s * 0.3);
  ctx.fill();
  ctx.fillStyle = pen.tone(look.skin);
  const hx = len - s * 0.5;
  rounded(ctx, hx - s * 0.12, -s * 0.36, s * 0.5, s * 0.72, s * 0.18);
  ctx.fill();
  ctx.translate(hx + s * 0.3, 0);
  if (it.fingers === 'point') {
    // One finger held out at the middle, the others curled under, the thumb on top.
    rounded(ctx, 0, -s * 0.1, s * 0.95, s * 0.2, s * 0.1);
    ctx.fill();
    for (let i = 0; i < 3; i += 1) {
      rounded(ctx, -s * 0.05, s * 0.1 + i * s * 0.09, s * 0.3, s * 0.13, s * 0.065);
      ctx.fill();
    }
    rounded(ctx, -s * 0.22, -s * 0.36, s * 0.4, s * 0.16, s * 0.08);
    ctx.fill();
  } else if (it.fingers === 'small') {
    // A newborn's fist: a round palm and tiny curled fingers.
    ctx.beginPath();
    ctx.ellipse(s * 0.05, 0, s * 0.32, s * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (let i = 0; i < 4; i += 1) {
      rounded(ctx, -s * 0.02, -s * 0.34 + i * s * 0.18, s * (0.5 - Math.abs(i - 1.5) * 0.06), s * 0.16, s * 0.08);
      ctx.fill();
    }
    rounded(ctx, -s * 0.3, -s * 0.5, s * 0.36, s * 0.17, s * 0.085);
    ctx.fill();
  }
  ctx.restore();
}

/** Tiny fingers curled over something, drawn on top of it: the newborn's grip. */
export function grip(ctx, it, pen) {
  const look = LOOKS[it.who] ?? LOOKS.kid;
  const x = pen.X(it.x);
  const y = pen.Y(it.y);
  const s = pen.S(it.size ?? 0.05);
  ctx.fillStyle = pen.tone(look.skin);
  for (let i = 0; i < 4; i += 1) {
    rounded(ctx, x + i * s * 0.62 - s * 0.9, y - s * 0.75, s * 0.52, s * 1.5, s * 0.26);
    ctx.fill();
  }
}

function rounded(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
