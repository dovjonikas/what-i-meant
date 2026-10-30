// closeups.js: the few close shots of hands. With no faces anywhere, hands carry the
// biggest moments: Grandma passing you a jar of jam, a newborn holding on to your finger.
// Each close-up is a prop (see props.js) filling the column; sleeves keep each person's
// colour from people.js, so you know whose hands they are.

import { LOOKS } from './people.js';
import { NAMES } from './names.js';
import { mix } from './util.js';

const mixHex = (a, b, t) => '#' + mix(a, b, t).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

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
    // A loose fist with one finger held out, the thumb resting along it: a round palm,
    // three curled fingers as soft knuckles, and the creases between them.
    ctx.beginPath();
    ctx.ellipse(-s * 0.06, s * 0.03, s * 0.36, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(s * 0.2, s * 0.02 + i * s * 0.12, s * 0.105, 0, Math.PI * 2);
      ctx.fill();
    }
    rounded(ctx, s * 0.05, -s * 0.27, s * 0.62, s * 0.19, s * 0.095);
    ctx.fill();
    ctx.save();
    ctx.rotate(-0.12);
    rounded(ctx, -s * 0.24, -s * 0.38, s * 0.46, s * 0.17, s * 0.085);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgb(120 70 50 / 0.25)';
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      const cy = s * 0.02 + i * s * 0.12 - s * 0.06;
      ctx.beginPath();
      ctx.moveTo(s * 0.12, cy);
      ctx.lineTo(s * 0.29, cy);
      ctx.stroke();
    }
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
    // The thumb comes off the side of the palm at a slant, toward the fingertips.
    ctx.save();
    ctx.translate(-s * 0.2, -s * 0.3);
    ctx.rotate(-0.55);
    rounded(ctx, -s * 0.04, -s * 0.085, s * 0.38, s * 0.17, s * 0.085);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * A family photo album lying open: two pages, photos with white borders stuck on at a
 * slant. `spread` says which pages: 'dog' (the last: the dog in every photo and under each,
 * in Mom's round handwriting, his name, the one the player gave him in names.js), 'old'
 * (before you: Mom small with Grandma, Grandpa peeling her an apple, Mom and Dad young on
 * the pier, their wedding, gone the colour of old photos) or 'you' (Mom asleep with you
 * on her chest, you and the puppy in his box, the dog at the gate, Dad and the dog in the
 * garden). No words on the first two: the photos say it. `coat` is the dog's colour.
 */
export function album(ctx, it, pen) {
  const x = pen.X(it.x);
  const y = pen.Y(it.y);
  const w = pen.S(it.w ?? 0.9);
  const h = w * 0.7;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(it.tilt ?? -0.04);
  // Cover, then the two pages with the fold between them.
  ctx.fillStyle = pen.tone(it.cover ?? '#5a2a2a');
  rounded(ctx, -w * 0.52, -h * 0.52, w * 1.04, h * 1.04, w * 0.02);
  ctx.fill();
  ctx.fillStyle = pen.tone(it.page ?? '#efe6d2');
  ctx.fillRect(-w * 0.49, -h * 0.48, w * 0.98, h * 0.96);
  const fold = ctx.createLinearGradient(-w * 0.05, 0, w * 0.05, 0);
  fold.addColorStop(0, pen.tone('#000000', 0, 0));
  fold.addColorStop(0.5, pen.tone('#000000', 0, 0.22));
  fold.addColorStop(1, pen.tone('#000000', 0, 0));
  ctx.fillStyle = fold;
  ctx.fillRect(-w * 0.05, -h * 0.48, w * 0.1, h * 0.96);
  const coat = it.coat ?? '#a0673c';
  const which = it.spread ?? 'dog';
  if (which !== 'dog') {
    spread(ctx, pen, which, w, h, coat);
    ctx.restore();
    return;
  }
  const shots = it.shots ?? [
    [-0.27, -0.24, -0.06, '#8fc7e0', '#5aa06a', 'sit'],
    [0.24, -0.25, 0.05, '#f2c27a', '#7a9a52', 'run'],
    [-0.25, 0.2, 0.04, '#d8dde6', '#f4f2ee', 'lie'],
    [0.26, 0.18, -0.05, '#9cc3a8', '#4e8a5a', 'sit'],
  ];
  const pw = w * 0.3;
  const ph = pw * 0.72;
  for (const [u, v, tilt, sky, grass, pose] of shots) {
    ctx.save();
    ctx.translate(u * w, v * h - h * 0.05);
    ctx.rotate(tilt);
    ctx.fillStyle = pen.tone('#000000', 0, 0.16);
    ctx.fillRect(-pw / 2 + 2, -ph / 2 + 3, pw, ph);
    ctx.fillStyle = pen.tone('#fbf8f2');
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    const iw = pw * 0.88;
    const ih = ph * 0.84;
    ctx.fillStyle = pen.tone(sky);
    ctx.fillRect(-iw / 2, -ph / 2 + pw * 0.06, iw, ih);
    ctx.fillStyle = pen.tone(grass);
    ctx.fillRect(-iw / 2, -ph / 2 + pw * 0.06 + ih * 0.62, iw, ih * 0.38);
    // The dog in each one: a round body, a head, an ear and a tail.
    const d = ih * 0.22;
    const gy = -ph / 2 + pw * 0.06 + ih * 0.8;
    ctx.fillStyle = pen.tone(coat);
    ctx.beginPath();
    if (pose === 'lie') ctx.ellipse(0, gy - d * 0.3, d * 1.1, d * 0.42, 0, 0, Math.PI * 2);
    else if (pose === 'run') ctx.ellipse(0, gy - d * 0.7, d * 1, d * 0.45, -0.15, 0, Math.PI * 2);
    else ctx.ellipse(-d * 0.1, gy - d * 0.6, d * 0.55, d * 0.75, -0.5, 0, Math.PI * 2);
    ctx.fill();
    const head = pose === 'lie' ? [d * 1, gy - d * 0.5] : pose === 'run' ? [d * 1, gy - d * 1.15] : [d * 0.35, gy - d * 1.35];
    ctx.beginPath();
    ctx.arc(head[0], head[1], d * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pen.tone('#2a1a10');
    ctx.beginPath();
    ctx.arc(head[0] + d * 0.38, head[1] + d * 0.05, d * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Her writing under it: his name, a little crooked, in the colour of a biro.
    ctx.save();
    ctx.translate(u * w, v * h - h * 0.05 + ph / 2 + w * 0.045);
    ctx.rotate(tilt * 0.6);
    ctx.font = `400 ${Math.round(w * 0.05)}px Recursive, cursive`;
    ctx.fontVariationSettings = '"CASL" 1, "CRSV" 1, "slnt" -12';
    ctx.textAlign = 'center';
    ctx.fillStyle = pen.tone('#2b3a78', 0, 0.85);
    ctx.fillText(NAMES.dog === 'puppy' ? 'Biscuit' : NAMES.dog, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

// The photos on the first two spreads: where each sits [u, v, tilt] and what is in it.
const SPREADS = {
  old: [[-0.27, -0.24, -0.05, 'grandma'], [0.25, -0.24, 0.04, 'apple'], [-0.25, 0.2, 0.05, 'pier'], [0.26, 0.19, -0.04, 'wedding']],
  you: [[-0.26, -0.24, 0.04, 'asleep'], [0.25, -0.25, -0.05, 'box'], [-0.26, 0.19, -0.04, 'gate'], [0.25, 0.2, 0.05, 'garden']],
};

function spread(ctx, pen, page, w, h, coat) {
  const pw = w * 0.3;
  const ph = pw * 0.76;
  const old = page === 'old';
  for (const [u, v, tilt, what] of SPREADS[page]) {
    ctx.save();
    ctx.translate(u * w, v * h - h * 0.02);
    ctx.rotate(tilt);
    ctx.fillStyle = pen.tone('#000000', 0, 0.16);
    ctx.fillRect(-pw / 2 + 2, -ph / 2 + 3, pw, ph);
    ctx.fillStyle = pen.tone(old ? '#f1e6cc' : '#fbf8f2');
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    const iw = pw * 0.88;
    const ih = ph * 0.86;
    const top = -ph / 2 + pw * 0.06;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-iw / 2, top, iw, ih);
    ctx.clip();
    snap(ctx, pen, what, iw, ih, top, coat);
    if (old) {
      // Gone the colour of old photos: warm, a little faded.
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = pen.tone('#e6cc9a');
      ctx.fillRect(-iw / 2, top, iw, ih);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgb(255 246 228 / 0.2)';
      ctx.fillRect(-iw / 2, top, iw, ih);
    }
    ctx.restore();
    if (old) {
      // The little black corners old albums held photos in.
      ctx.fillStyle = pen.tone('#2a2020');
      const k = pw * 0.12;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        ctx.beginPath();
        ctx.moveTo((sx * pw) / 2, (sy * ph) / 2);
        ctx.lineTo((sx * pw) / 2 - sx * k, (sy * ph) / 2);
        ctx.lineTo((sx * pw) / 2, (sy * ph) / 2 - sy * k);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

/** One photo's picture, in a box iw by ih whose top is at `top`, centred on x 0. */
function snap(ctx, pen, what, iw, ih, top, coat) {
  const T = (hex) => pen.tone(hex);
  const left = -iw / 2;
  const ground = top + ih * 0.86;
  const bg = (sky, grass, at = 0.66) => {
    ctx.fillStyle = T(sky);
    ctx.fillRect(left, top, iw, ih);
    ctx.fillStyle = T(grass);
    ctx.fillRect(left, top + ih * at, iw, ih * (1 - at));
  };
  // A person in the photo: legs, body, head, hair; `o` changes the parts.
  const fig = (who, x, tall, o = {}) => {
    const look = { ...LOOKS[who], ...o };
    const bw = tall * 0.3;
    const gy = o.gy ?? ground;
    ctx.fillStyle = T(look.legs);
    if (!o.dress) {
      ctx.fillRect(x - bw * 0.36, gy - tall * 0.46, bw * 0.3, tall * 0.46);
      ctx.fillRect(x + bw * 0.06, gy - tall * 0.46, bw * 0.3, tall * 0.46);
    }
    ctx.fillStyle = T(o.dress ?? look.top);
    ctx.beginPath();
    ctx.moveTo(x - bw * (o.dress ? 0.7 : 0.5), gy - (o.dress ? 0 : tall * 0.4));
    ctx.lineTo(x - bw * 0.44, gy - tall * 0.76);
    ctx.quadraticCurveTo(x, gy - tall * 0.82, x + bw * 0.44, gy - tall * 0.76);
    ctx.lineTo(x + bw * (o.dress ? 0.7 : 0.5), gy - (o.dress ? 0 : tall * 0.4));
    ctx.closePath();
    ctx.fill();
    const r = tall * 0.12;
    const hy = gy - tall * 0.88;
    if (look.hairStyle === 'long' || o.long) {
      ctx.fillStyle = T(look.hair);
      ctx.fillRect(x - r * 1.05, hy - r * 0.2, r * 2.1, r * 2);
    }
    ctx.fillStyle = T(look.skin);
    ctx.beginPath();
    ctx.arc(x, hy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = T(look.scarf ?? look.cap ?? look.hair);
    ctx.beginPath();
    if (o.back) ctx.arc(x, hy, r * 1.06, 0, Math.PI * 2);
    else ctx.arc(x, hy - r * 0.1, r * 1.06, Math.PI * (look.scarf ? 0.85 : 1.02), Math.PI * (look.scarf ? 2.15 : 1.98));
    ctx.fill();
    if (look.cap) ctx.fillRect(x, hy - r * 0.3, r * 1.4, r * 0.3);
  };
  const pup = (x, gy, d, pose = 'sit', face = 1) => {
    ctx.fillStyle = T(coat);
    ctx.beginPath();
    if (pose === 'run') ctx.ellipse(x, gy - d * 0.8, d * 1, d * 0.45, -0.15 * face, 0, Math.PI * 2);
    else ctx.ellipse(x - d * 0.1 * face, gy - d * 0.6, d * 0.55, d * 0.75, -0.5 * face, 0, Math.PI * 2);
    ctx.fill();
    const head = pose === 'run' ? [x + d * face, gy - d * 1.2] : [x + d * 0.35 * face, gy - d * 1.35];
    ctx.beginPath();
    ctx.arc(head[0], head[1], d * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = T('#2a1a10');
    ctx.beginPath();
    ctx.arc(head[0] + d * 0.38 * face, head[1] + d * 0.05, d * 0.09, 0, Math.PI * 2);
    ctx.fill();
  };
  switch (what) {
    case 'grandma':
      // Mom about five, holding Grandma's hand.
      bg('#cfdcc8', '#98b078');
      fig('grandma', -iw * 0.12, ih * 0.64);
      fig('mom', iw * 0.15, ih * 0.4, { hairStyle: 'short' });
      ctx.strokeStyle = T(LOOKS.mom.skin);
      ctx.lineWidth = Math.max(1, ih * 0.035);
      ctx.beginPath();
      ctx.moveTo(-iw * 0.04, ground - ih * 0.3);
      ctx.lineTo(iw * 0.09, ground - ih * 0.24);
      ctx.stroke();
      break;
    case 'apple': {
      // Grandpa on a bench peeling an apple in one curl, Mom small beside him, watching.
      bg('#d8dcc8', '#a2b07e');
      ctx.fillStyle = T('#6a4a30');
      ctx.fillRect(-iw * 0.42, ground - ih * 0.2, iw * 0.5, ih * 0.05);
      ctx.fillRect(-iw * 0.38, ground - ih * 0.15, ih * 0.03, ih * 0.15);
      ctx.fillRect(iw * 0.02, ground - ih * 0.15, ih * 0.03, ih * 0.15);
      fig('grandpa', -iw * 0.2, ih * 0.5, { gy: ground - ih * 0.12, legs: '#4a4038' });
      ctx.fillStyle = T('#d8342a');
      ctx.beginPath();
      ctx.arc(-iw * 0.06, ground - ih * 0.36, ih * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = T('#d8342a');
      ctx.lineWidth = Math.max(0.8, ih * 0.02);
      ctx.beginPath();
      ctx.moveTo(-iw * 0.05, ground - ih * 0.32);
      for (let i = 1; i <= 6; i += 1) ctx.lineTo(-iw * 0.05 + Math.sin(i * 1.7) * ih * 0.025, ground - ih * 0.32 + i * ih * 0.035);
      ctx.stroke();
      fig('mom', iw * 0.22, ih * 0.38, { hairStyle: 'short' });
      break;
    }
    case 'pier':
      // Mom and Dad young, from behind, at the end of the pier, the lake at sundown.
      bg('#f0c89a', '#6f8fae', 0.5);
      ctx.fillStyle = T('#5a3c26');
      ctx.beginPath();
      ctx.moveTo(-iw * 0.12, top + ih * 0.66);
      ctx.lineTo(iw * 0.12, top + ih * 0.66);
      ctx.lineTo(iw * 0.3, top + ih);
      ctx.lineTo(-iw * 0.3, top + ih);
      ctx.closePath();
      ctx.fill();
      fig('mom', -iw * 0.06, ih * 0.34, { gy: top + ih * 0.7, back: true, long: true, legs: LOOKS.mom.top });
      fig('dad', iw * 0.08, ih * 0.36, { gy: top + ih * 0.7, back: true, legs: LOOKS.dad.top });
      break;
    case 'wedding':
      // Their wedding: Mom in white with red flowers, Dad in a green suit.
      bg('#e8e2d6', '#c8c0b0', 0.8);
      fig('dad', iw * 0.13, ih * 0.7, { legs: '#24433a' });
      fig('mom', -iw * 0.13, ih * 0.66, { dress: '#fbf7ee' });
      ctx.fillStyle = T('#ffffff');
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(-iw * 0.13, ground - ih * 0.66);
      ctx.quadraticCurveTo(-iw * 0.32, ground - ih * 0.4, -iw * 0.26, ground - ih * 0.2);
      ctx.lineTo(-iw * 0.15, ground - ih * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = T('#c8342e');
      for (const [bx, by] of [[0, 0], [0.025, -0.02], [-0.02, -0.025], [0.01, -0.045]]) {
        ctx.beginPath();
        ctx.arc(-iw * 0.03 + bx * iw, ground - ih * 0.36 + by * ih, ih * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'asleep': {
      // Mom asleep on the pillow, her hair over it, you new on her chest, her arm round you.
      bg('#dfe4ea', '#c4ccd8', 0.55);
      ctx.fillStyle = T('#f4f1ea');
      ctx.beginPath();
      ctx.ellipse(-iw * 0.24, top + ih * 0.45, iw * 0.26, ih * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = T(LOOKS.mom.hair);
      ctx.beginPath();
      ctx.ellipse(-iw * 0.3, top + ih * 0.44, iw * 0.15, ih * 0.13, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = T(LOOKS.mom.skin);
      ctx.beginPath();
      ctx.arc(-iw * 0.18, top + ih * 0.47, ih * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = T('#c9473f');
      ctx.beginPath();
      ctx.moveTo(-iw * 0.2, top + ih);
      ctx.quadraticCurveTo(-iw * 0.12, top + ih * 0.6, iw * 0.5, top + ih * 0.62);
      ctx.lineTo(iw * 0.5, top + ih);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = T('#f6f1e7');
      ctx.beginPath();
      ctx.ellipse(iw * 0.06, top + ih * 0.6, iw * 0.13, ih * 0.08, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = T(LOOKS.me.skin);
      ctx.beginPath();
      ctx.arc(-iw * 0.06, top + ih * 0.57, ih * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = T(LOOKS.mom.skin);
      ctx.lineWidth = Math.max(1, ih * 0.05);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-iw * 0.12, top + ih * 0.72);
      ctx.quadraticCurveTo(iw * 0.04, top + ih * 0.74, iw * 0.14, top + ih * 0.64);
      ctx.stroke();
      break;
    }
    case 'box':
      // You at five, crouched by the box, the puppy's head over the edge.
      bg('#bfe0ea', '#6fae6a');
      ctx.fillStyle = T('#b8895a');
      ctx.fillRect(iw * 0.02, ground - ih * 0.3, iw * 0.3, ih * 0.3);
      ctx.fillStyle = T('#9c7048');
      ctx.fillRect(iw * 0.02, ground - ih * 0.33, iw * 0.3, ih * 0.04);
      pup(iw * 0.16, ground - ih * 0.18, ih * 0.13, 'sit', -1);
      ctx.fillStyle = T('#b8895a');
      ctx.fillRect(iw * 0.02, ground - ih * 0.2, iw * 0.3, ih * 0.2);
      fig('me', -iw * 0.16, ih * 0.42, { hairStyle: 'short' });
      break;
    case 'gate':
      // Him at the gate after school, waiting.
      bg('#f2d6a8', '#8aa66a', 0.6);
      ctx.fillStyle = T('#efe6d4');
      for (let i = 0; i < 7; i += 1) ctx.fillRect(-iw * 0.45 + i * iw * 0.15, ground - ih * 0.42, iw * 0.05, ih * 0.42);
      ctx.fillRect(-iw * 0.5, ground - ih * 0.32, iw, ih * 0.04);
      pup(-iw * 0.02, ground, ih * 0.16, 'sit', 1);
      break;
    default:
      // Dad in the garden throwing a stick, the dog flying after it.
      bg('#cfe6f0', '#7ab06a');
      fig('dad', -iw * 0.2, ih * 0.66);
      ctx.strokeStyle = T('#6a4a2c');
      ctx.lineWidth = Math.max(1, ih * 0.025);
      ctx.beginPath();
      ctx.moveTo(iw * 0.25, top + ih * 0.22);
      ctx.lineTo(iw * 0.35, top + ih * 0.18);
      ctx.stroke();
      pup(iw * 0.16, ground - ih * 0.1, ih * 0.13, 'run', 1);
  }
}

/**
 * A child's red trainer, seen from the side, close: the white sole and toe, the laces, and
 * along the heel the tooth marks a puppy left in it years ago. `x`, `y` are the middle of
 * the sole; `w` its length. `bitten: false` leaves the heel whole.
 */
export function trainer(ctx, it, pen) {
  const x = pen.X(it.x);
  const y = pen.Y(it.y);
  const w = pen.S(it.w ?? 0.5);
  const h = w * 0.42;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(it.tilt ?? -0.08);
  // The upper: high at the heel (left), low at the toe (right).
  const upper = () => {
    ctx.beginPath();
    ctx.moveTo(-w * 0.48, 0);
    ctx.lineTo(-w * 0.5, -h * 0.82);
    ctx.quadraticCurveTo(-w * 0.44, -h * 1.02, -w * 0.3, -h * 0.94);
    ctx.quadraticCurveTo(-w * 0.12, -h * 0.66, w * 0.08, -h * 0.72);
    ctx.quadraticCurveTo(w * 0.36, -h * 0.66, w * 0.48, -h * 0.28);
    ctx.lineTo(w * 0.5, 0);
    ctx.closePath();
  };
  ctx.fillStyle = pen.tone(it.color ?? '#b8473a');
  upper();
  ctx.fill();
  // Worn patches, lighter.
  ctx.fillStyle = pen.tone('#ffffff', 0, 0.08);
  ctx.beginPath();
  ctx.ellipse(-w * 0.05, -h * 0.4, w * 0.16, h * 0.18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // The white toe cap and sole.
  ctx.fillStyle = pen.tone('#efe8dc');
  ctx.beginPath();
  ctx.moveTo(w * 0.22, 0);
  ctx.quadraticCurveTo(w * 0.24, -h * 0.4, w * 0.44, -h * 0.34);
  ctx.quadraticCurveTo(w * 0.53, -h * 0.18, w * 0.52, 0);
  ctx.closePath();
  ctx.fill();
  rounded(ctx, -w * 0.52, -h * 0.14, w * 1.06, h * 0.2, h * 0.1);
  ctx.fill();
  ctx.fillStyle = pen.tone('#8a8276');
  ctx.fillRect(-w * 0.5, h * 0.03, w * 1.02, Math.max(1, h * 0.03));
  // Laces: short white crosses up the tongue.
  ctx.strokeStyle = pen.tone('#f4efe6');
  ctx.lineWidth = Math.max(1.2, h * 0.05);
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i += 1) {
    const lx = -w * 0.06 + i * w * 0.075;
    const ly = -h * 0.68 + i * h * 0.04;
    ctx.beginPath();
    ctx.moveTo(lx - w * 0.03, ly - h * 0.06);
    ctx.lineTo(lx + w * 0.03, ly + h * 0.06);
    ctx.moveTo(lx + w * 0.03, ly - h * 0.06);
    ctx.lineTo(lx - w * 0.03, ly + h * 0.06);
    ctx.stroke();
  }
  if (it.bitten !== false) {
    // Chewed by a puppy: bites taken out of the heel and its collar, the pale foam showing
    // in them, loose threads at their edges, rows of small tooth dents round them, and
    // the scuffs of teeth dragged across the red.
    const bites = [[-0.5, -0.6, 0.07], [-0.5, -0.78, 0.062], [-0.44, -0.95, 0.06], [-0.35, -0.95, 0.045], [-0.5, -0.36, 0.045]];
    ctx.save();
    upper();
    ctx.clip();
    ctx.strokeStyle = pen.tone('#e9a08e', 0, 0.55);
    ctx.lineWidth = Math.max(0.8, w * 0.005);
    ctx.lineCap = 'round';
    for (const [x0, y0, x1, y1] of [[-0.42, -0.5, -0.32, -0.62], [-0.4, -0.42, -0.3, -0.5], [-0.38, -0.74, -0.3, -0.8], [-0.44, -0.24, -0.36, -0.3]]) {
      ctx.beginPath();
      ctx.moveTo(x0 * w, y0 * h);
      ctx.lineTo(x1 * w, y1 * h);
      ctx.stroke();
    }
    for (const [u, v, r] of bites) {
      ctx.fillStyle = pen.tone('#ecdcbf');
      ctx.beginPath();
      ctx.arc(u * w, v * h, r * w, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pen.tone('#5a1a14', 0, 0.5);
      ctx.lineWidth = Math.max(1, w * 0.006);
      ctx.beginPath();
      ctx.arc(u * w, v * h, r * w, 0, Math.PI * 2);
      ctx.stroke();
      // The dents of the teeth that did it, in an arc just past the bite.
      for (let i = 0; i < 5; i += 1) {
        const a = -0.9 + i * 0.45;
        const dx = u * w + Math.cos(a) * r * w * 1.55;
        const dy = v * h + Math.sin(a) * r * w * 1.55;
        ctx.fillStyle = pen.tone('#5a1a14', 0, 0.7);
        ctx.beginPath();
        ctx.ellipse(dx, dy, w * 0.007, w * 0.011, a, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pen.tone('#e9a08e', 0, 0.5);
        ctx.beginPath();
        ctx.ellipse(dx + Math.cos(a) * w * 0.006, dy + Math.sin(a) * w * 0.006, w * 0.004, w * 0.007, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    // Threads hanging loose from the torn edges.
    ctx.lineCap = 'round';
    for (const [u, v, r] of bites) {
      for (let i = 0; i < 3; i += 1) {
        const a = Math.PI * (0.7 + i * 0.3);
        const bx = u * w + Math.cos(a) * r * w;
        const by = v * h + Math.sin(a) * r * w;
        ctx.strokeStyle = pen.tone(i === 1 ? '#f4efe6' : '#b8473a');
        ctx.lineWidth = Math.max(0.7, w * 0.004);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + Math.cos(a) * w * 0.02, by + Math.sin(a) * w * 0.012 + w * 0.01, bx + Math.cos(a) * w * 0.012, by + w * 0.026);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

/**
 * A newborn's blanket, soft folds filling a corner of the picture: `w` is its size.
 * `head: true` puts the baby in it: a small round head in a knitted hat at the top end.
 */
export function swaddle(ctx, it, pen) {
  const x = pen.X(it.x);
  const y = pen.Y(it.y);
  const w = pen.S(it.w ?? 0.6);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(it.tilt ?? -0.4);
  ctx.fillStyle = pen.tone(it.color ?? '#f4efe6');
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.5, w * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pen.tone(it.fold ?? '#c9bfae', 0, 0.7);
  ctx.lineWidth = Math.max(1.2, w * 0.012);
  ctx.lineCap = 'round';
  for (const [a, b, c, d, e, f] of [[-0.3, -0.08, -0.05, -0.2, 0.22, -0.12], [-0.28, 0.08, 0, -0.02, 0.3, 0.06], [-0.12, 0.2, 0.1, 0.12, 0.34, 0.18]]) {
    ctx.beginPath();
    ctx.moveTo(a * w, b * w);
    ctx.quadraticCurveTo(c * w, d * w, e * w, f * w);
    ctx.stroke();
  }
  if (it.head) {
    const [hx, hy, r] = [w * 0.33, -w * 0.02, w * 0.12];
    ctx.fillStyle = pen.tone(LOOKS.kid.skin);
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.fill();
    // The hat, soft yellow, with a little turned-up brim.
    ctx.fillStyle = pen.tone(it.hat ?? '#f2d27a');
    ctx.beginPath();
    ctx.arc(hx + r * 0.12, hy, r * 1.04, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pen.tone(it.hat ?? '#f2d27a', 0.15);
    ctx.fillRect(hx + r * 0.02, hy - r * 1.02, r * 0.22, r * 2.04);
    // The blanket folded up under the chin.
    ctx.fillStyle = pen.tone(it.color ?? '#f4efe6');
    ctx.beginPath();
    ctx.ellipse(hx - r * 0.95, hy, r * 0.5, r * 1.1, 0, 0, Math.PI * 2);
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
  // A shade pinker than the grown-up hand they hold, with a thin line round each, so the
  // small fingers read on top of the big one.
  ctx.fillStyle = pen.tone(mixHex(look.skin, '#f2a39a', 0.25));
  ctx.strokeStyle = 'rgb(150 90 70 / 0.4)';
  ctx.lineWidth = Math.max(0.8, s * 0.08);
  for (let i = 0; i < 4; i += 1) {
    rounded(ctx, x + i * s * 0.62 - s * 0.9, y - s * 0.75, s * 0.52, s * 1.5, s * 0.26);
    ctx.fill();
    ctx.stroke();
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
