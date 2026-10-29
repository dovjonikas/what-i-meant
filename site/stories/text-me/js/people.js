// people.js: how the people in the story look and how they are drawn.
//
// Nobody has eyes or a mouth, so any player can be them. What makes each one somebody is
// the rest: every person keeps one colour and one piece of clothing for their whole life
// (Mom's red coat, Dad's green jacket, Grandma's yellow headscarf, your orange top), and the
// life lines view draws their line in the same colour, so a dot there is a person you know.
//
// Figures are drawn flat with a soft shadow side and a light edge on the side the light
// comes from. At night they sink toward the scene's dark colour, so a person under a lamp
// still reads as a person and a person in the dark reads as a silhouette.

import { hexToRgb, mix, rgbToCss, vivid } from './util.js';

const mixHex = (a, b, t) => '#' + mix(a, b, t).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
import { drawDog } from './pets.js';

// One look per person. `mark` is their colour in the life lines (their top, unless noted).
// `old` replaces parts of the look once they are old.
export const LOOKS = {
  me: { top: '#e8913a', legs: '#2e3a55', hair: '#a8824c', skin: '#efc3a2', old: { hair: '#d4cec4' } },
  mom: { top: '#c9473f', legs: '#3b3346', hair: '#7a4a2c', hairStyle: 'long', skin: '#f0c4a2', coat: true, old: { hair: '#cfc8bf', hairStyle: 'bun' } },
  dad: { top: '#4e6a48', legs: '#3a3833', hair: '#2a2420', skin: '#d6a07e', broad: true, old: { hair: '#cdc8c0' } },
  grandma: { top: '#7b5b8e', legs: '#5a4a5a', scarf: '#e0a83e', skin: '#efcaae', coat: true, mark: '#e0a83e' },
  grandpa: { top: '#8b6a4b', legs: '#4a4038', hair: '#dcd8d0', cap: '#5a4b3c', skin: '#e2b08e' },
  friend: { top: '#f2c94c', legs: '#2c4a6b', hair: '#c79a55', skin: '#f2c8a6' },
  partner: { top: '#5b8fd0', legs: '#2f3340', hair: '#1f1a18', hairStyle: 'long', skin: '#c98d68' },
  kid: { top: '#f0a347', legs: '#3e5a7a', hair: '#c9a46a', skin: '#f0c4a2' },
  goose: { mark: '#b9c6d8' },
  dog: { coat: '#b9773f', light: '#f1dcbc', mark: '#c98a4b', collar: '#c8333a' },
  // People who pass through: friends at the fire, strangers.
  a: { top: '#3f8f8a', legs: '#2c2c36', hair: '#1e1a18', skin: '#c48a64' },
  b: { top: '#d6d0c4', legs: '#3a4256', hair: '#8a5a32', hairStyle: 'long', skin: '#f0c8a8' },
  c: { top: '#8a3a5a', legs: '#26262e', hair: '#2a2220', skin: '#e0b090' },
  d: { top: '#5a5f9a', legs: '#2e2e38', hair: '#c8a060', skin: '#f2cdb0' },
  stranger: { top: '#7a8a9a', legs: '#3a3f4a', hair: '#2a2622', skin: '#d9a888' },
};

/** The colour a person's line and dot get in the life lines view. */
export function markOf(id) {
  const look = LOOKS[id];
  return look ? look.mark ?? look.top : '#e9e4da';
}

/**
 * Draws one person. Item fields: x, y (feet), h (standing height, in column widths),
 * who (a key of LOOKS), age ('child', 'adult', 'old'), pose (stand, walk, wave, sit, phone,
 * hand, push, reach, carry, bike), face (-1 faces left), back (seen from behind), bend,
 * stride, and any look field to override (top, hair, ...). `t` is time in seconds, for
 * breathing, shifting weight and waving; leave it at 0 for a still. `step` is how far the
 * legs have gone round (radians) while the person walks, runs or pedals, and `moving`
 * says whether they are moving right now (fx.js works both out from the person's track).
 */
export function drawPerson(ctx, it, pen, t = 0, step = 0, moving = false) {
  const base = LOOKS[it.who] ?? LOOKS.stranger;
  const look = { ...base, ...(it.age === 'old' ? base.old : null), ...it.look };
  const light = it.light ?? pen.scene.light ?? sceneLight(pen.scene);
  const shade = hexToRgb(pen.scene.shade ?? pen.scene.sky[0]);
  const face = it.face ?? 1;
  const litSide = (it.rimSide ?? pen.scene.lightFrom ?? 1) * face;
  // A colour as it looks in this scene's light, with a darker twin for the shadow side.
  const paint = (hex, dark = 0) => {
    const c = mix(mix(hexToRgb(hex), shade, 1 - light), [0, 0, 0], dark);
    return rgbToCss(vivid(c, pen.scene.vibrance ?? 1));
  };
  const h = pen.S(it.h ?? 0.2);
  const k = {
    h,
    t,
    step,
    moving,
    litSide,
    child: it.age === 'child',
    old: it.age === 'old',
    look,
    paint,
    // Fills across the body: shadow side darker, lit side as is.
    fill: (hex) => {
      const g = ctx.createLinearGradient(-h * 0.16 * litSide, 0, h * 0.16 * litSide, 0);
      g.addColorStop(0, paint(hex, 0.32));
      g.addColorStop(0.6, paint(hex, 0.04));
      g.addColorStop(1, paint(hex, 0));
      return g;
    },
    rim: it.rim ? rgbToCss(vivid(hexToRgb(it.rim), pen.scene.vibrance ?? 1), it.rimAlpha ?? 0.85) : null,
  };
  ctx.save();
  ctx.translate(pen.X(it.x), pen.Y(it.y));
  if (face === -1) ctx.scale(-1, 1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pose = it.pose ?? 'stand';
  if (it.who === 'dog') drawDog(ctx, it, k);
  else if (pose === 'sit') sitting(ctx, k, it);
  else if (pose === 'bike') onBike(ctx, k, it);
  else standing(ctx, k, it, pose);
  ctx.restore();
}

function sceneLight(scene) {
  const [r, g, b] = hexToRgb(scene.sky[scene.sky.length - 1]);
  return Math.min(1, Math.max(0.28, (0.2126 * r + 0.7152 * g + 0.0722 * b) / 190));
}

// Body measurements as fractions of height, for adults and children.
function body(k) {
  const { h, child } = k;
  const headR = h * (child ? 0.1 : 0.075);
  const shoulderY = -h + headR * 2 + h * (child ? 0.025 : 0.035);
  return {
    headR,
    shoulderY,
    hipY: -h * (child ? 0.45 : 0.47),
    shoulderW: h * (child ? 0.085 : k.look.broad ? 0.135 : 0.118),
    hipW: h * (child ? 0.075 : 0.085),
    limb: h * (child ? 0.075 : 0.062),
  };
}

function standing(ctx, k, it, pose) {
  const { h, t, step, moving } = k;
  const b = body(k);
  const seed = (it.x ?? 0) * 9;
  const breathe = Math.sin(t * 1.7 + seed) * h * 0.004;
  // Standing still, people shift their weight a little; walking, they bob with each step.
  const sway = moving ? 0 : Math.sin(t * 0.55 + seed) * h * 0.008;
  const bob = moving ? -Math.abs(Math.sin(step)) * h * 0.02 : 0;
  // Legs: back one first, in the shadow colour. A walking leg swings and lifts its foot.
  let legs;
  if (moving) {
    const s = Math.sin(step);
    const lift = (v) => -Math.max(0, v) * h * 0.05;
    legs = [[-s * h * 0.13, lift(-Math.cos(step))], [s * h * 0.13, lift(Math.cos(step))]];
  } else if (pose === 'walk' || it.stride) {
    legs = [[-h * 0.13, 0], [h * 0.13, 0]];
  } else {
    legs = [[-h * 0.045 + sway, 0], [h * 0.045 + sway, 0]];
  }
  limb(ctx, k, k.look.legs, [-h * 0.03 + sway, b.hipY + bob], legs[0], b.limb * 1.15, 0.25);
  shoe(ctx, k, legs[0]);
  limb(ctx, k, k.look.legs, [h * 0.03 + sway, b.hipY + bob], legs[1], b.limb * 1.15, 0);
  shoe(ctx, k, legs[1]);

  ctx.save();
  ctx.translate(sway, b.hipY + breathe + bob);
  ctx.rotate(it.bend ?? (k.old ? 0.2 : pose === 'phone' ? 0.07 : 0));
  const sy = b.shoulderY - b.hipY;
  const arms = armPose(pose, k, b, sy, t);
  limb(ctx, k, k.look.top, arms.back[0], arms.back[1], b.limb, 0.28, arms.back[2]);
  hand(ctx, k, arms.back[2] ?? arms.back[1], 0.25);
  torso(ctx, k, b, sy);
  head(ctx, k, b, sy, it);
  limb(ctx, k, k.look.top, arms.front[0], arms.front[1], b.limb, 0, arms.front[2]);
  hand(ctx, k, arms.front[2] ?? arms.front[1], 0);
  if (pose === 'phone') phone(ctx, k, arms.front[2] ?? arms.front[1]);
  if (pose === 'carry') bundle(ctx, k, b, sy);
  if (k.old) {
    // The walking stick, in the back hand.
    const [cx, cy] = arms.back[2] ?? arms.back[1];
    ctx.strokeStyle = k.paint('#3a2a20', 0.2);
    ctx.lineWidth = Math.max(1.2, h * 0.018);
    line(ctx, cx, cy, cx - h * 0.03, -b.hipY - breathe);
  }
  ctx.restore();
}

/** Arm positions per pose, relative to the hip: [shoulder, hand] or [shoulder, elbow, hand]. */
function armPose(pose, k, b, sy, t) {
  const { h } = k;
  const s = b.shoulderW * 0.82;
  const down = (side, dx = 0) => [[side * s, sy + h * 0.02], [side * (s + h * 0.02) + dx, h * 0.07]];
  switch (pose) {
    case 'wave': {
      const a = Math.sin(t * 5) * 0.28;
      return { back: down(-1), front: [[s, sy + h * 0.02], [s + h * 0.08, sy - h * 0.1], [s + h * 0.1 + Math.sin(a) * h * 0.08, sy - h * 0.22]] };
    }
    case 'walk': {
      // Arms swing against the legs while moving.
      const a = k.moving ? Math.sin(k.step) * h * 0.1 : h * 0.08;
      return { back: [[-s, sy + h * 0.02], [-s + a, h * 0.04]], front: [[s, sy + h * 0.02], [s - a + h * 0.02, h * 0.04]] };
    }
    case 'hand':
      return { back: down(-1), front: [[s, sy + h * 0.02], [s + h * 0.17, h * 0.12]] };
    case 'reach':
      return { back: down(-1), front: [[s, sy + h * 0.02], [s + h * 0.27, sy + h * 0.14]] };
    case 'push':
      return { back: [[-s * 0.6, sy + h * 0.02], [-s - h * 0.04, sy + h * 0.3]], front: [[s, sy + h * 0.02], [s + h * 0.2, sy + h * 0.32]] };
    case 'phone':
      return { back: down(-1), front: [[s, sy + h * 0.02], [s + h * 0.03, sy + h * 0.2], [s + h * 0.07, sy + h * 0.08]] };
    case 'carry':
      return { back: down(-1), front: [[s, sy + h * 0.02], [s + h * 0.02, sy + h * 0.2], [s - h * 0.04, sy + h * 0.16]] };
    default:
      return { back: down(-1), front: down(1) };
  }
}

function torso(ctx, k, b, sy) {
  const { h, look } = k;
  const coat = look.coat ? h * 0.2 : 0;
  const hw = look.coat ? b.hipW * 1.3 : b.hipW;
  ctx.fillStyle = k.fill(look.top);
  ctx.beginPath();
  ctx.moveTo(-b.shoulderW, sy + h * 0.04);
  ctx.quadraticCurveTo(-b.shoulderW, sy, -b.shoulderW + h * 0.04, sy);
  ctx.lineTo(b.shoulderW - h * 0.04, sy);
  ctx.quadraticCurveTo(b.shoulderW, sy, b.shoulderW, sy + h * 0.04);
  ctx.lineTo(hw, h * 0.02 + coat);
  ctx.lineTo(-hw, h * 0.02 + coat);
  ctx.closePath();
  ctx.fill();
  if (k.rim) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = k.rim;
    ctx.lineWidth = Math.max(1, h * 0.012);
    const e = b.shoulderW * k.litSide;
    line(ctx, e, sy + h * 0.05, hw * k.litSide, h * 0.01 + coat);
    ctx.globalAlpha = 1;
  }
  if (look.neck) {
    ctx.fillStyle = k.paint(look.neck);
    ctx.fillRect(-b.shoulderW * 0.55, sy - h * 0.01, b.shoulderW * 1.1, h * 0.045);
  }
}

function head(ctx, k, b, sy, it) {
  const { h, look, litSide } = k;
  const r = b.headR;
  const cy = sy - h * 0.025 - r;
  const cx = h * 0.01;
  const hairStyle = look.hair && !look.scarf ? look.hairStyle ?? 'short' : null;
  // Long hair falls behind the head and shoulders, so it is drawn first.
  if (hairStyle === 'long') {
    ctx.fillStyle = k.paint(look.hair, 0.14);
    ctx.beginPath();
    ctx.moveTo(cx - r * 1.05, cy - r * 0.2);
    ctx.quadraticCurveTo(cx - r * 1.35, cy + r * 1.6, cx - r * 0.75, cy + r * 2.4);
    ctx.lineTo(cx + r * 0.15, cy + r * 2.2);
    ctx.quadraticCurveTo(cx + r * 0.1, cy + r * 1.1, cx + r * 0.2, cy + r * 0.2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = k.paint(look.skin, 0.12);
  ctx.fillRect(cx - r * 0.35, cy + r * 0.6, r * 0.7, h * 0.04);
  // The face: skin, shaded on the side away from the light. No eyes, no mouth.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = k.paint(look.skin, 0.3);
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = k.paint(look.skin);
  ctx.beginPath();
  ctx.arc(cx + litSide * r * 0.28, cy - r * 0.08, r * 0.95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (look.scarf) {
    // A headscarf: covers the head and tucks behind, leaving the face.
    ctx.fillStyle = k.fill(look.scarf);
    ctx.beginPath();
    ctx.arc(cx - r * 0.12, cy - r * 0.05, r * 1.12, Math.PI * 0.62, Math.PI * 2.08);
    ctx.lineTo(cx - r * 1.25, cy + r * 1.05);
    ctx.closePath();
    ctx.fill();
  } else if (look.hair) {
    ctx.fillStyle = k.paint(look.hair, 0.04);
    ctx.beginPath();
    if (it.back) {
      // From behind: hair over the whole head, a little wider than it.
      ctx.arc(cx, cy - r * 0.04, r * 1.1, 0, Math.PI * 2);
    } else {
      // Hair has volume: its outline is a little bigger than the head and sits back
      // and up. It covers the crown and the back, comes down over the forehead in a
      // fringe, and stops at a hairline in front of the ear and at the nape.
      const R = r * 1.13;
      const ox = cx - r * 0.07;
      const oy = cy - r * 0.08;
      const front = -0.45;
      const nape = hairStyle === 'long' ? Math.PI * 0.62 : Math.PI * 0.74;
      ctx.moveTo(ox + R * Math.cos(front), oy + R * Math.sin(front));
      ctx.arc(ox, oy, R, front, nape, true);
      ctx.lineTo(cx - r * 0.42, cy + r * 0.52);
      ctx.quadraticCurveTo(cx - r * 0.12, cy + r * 0.32, cx - r * 0.05, cy + r * 0.02);
      // The fringe: two soft scallops across the forehead.
      ctx.quadraticCurveTo(cx + r * 0.2, cy - r * 0.3, cx + r * 0.42, cy - r * 0.46);
      ctx.quadraticCurveTo(cx + r * 0.66, cy - r * 0.36, ox + R * Math.cos(front), oy + R * Math.sin(front));
    }
    ctx.closePath();
    ctx.fill();
    if (hairStyle === 'bun') {
      ctx.beginPath();
      ctx.arc(cx - r * 0.9, cy - r * 0.6, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!it.back) {
      // A soft shine on the lit side of the hair, so it reads as hair and not a cap.
      ctx.strokeStyle = k.paint(mixHex(look.hair, '#ffffff', 0.22));
      ctx.lineWidth = Math.max(1, r * 0.09);
      ctx.beginPath();
      ctx.arc(cx - r * 0.07, cy - r * 0.08, r * 0.78, litSide > 0 ? -1.9 : -2.5, litSide > 0 ? -1.35 : -1.95);
      ctx.stroke();
    }
  }
  if (look.cap) {
    ctx.fillStyle = k.paint(look.cap);
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.15, r * 1.08, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx, cy - r * 0.25, r * 1.5, r * 0.22);
  }
  if (k.rim) {
    ctx.strokeStyle = k.rim;
    ctx.lineWidth = Math.max(1, h * 0.012);
    ctx.beginPath();
    // Only along the face and jaw; on the hair it would read as a helmet's edge.
    ctx.arc(cx, cy, r * 1.02, litSide > 0 ? -0.25 : Math.PI - 0.9, litSide > 0 ? 0.9 : Math.PI + 0.25);
    ctx.stroke();
  }
}

function limb(ctx, k, hex, from, to, width, dark, end) {
  ctx.strokeStyle = k.paint(hex, dark + 0.06);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  if (end) ctx.lineTo(end[0], end[1]);
  ctx.stroke();
}

function hand(ctx, k, [x, y], dark) {
  ctx.fillStyle = k.paint(k.look.skin, dark + 0.05);
  ctx.beginPath();
  ctx.arc(x, y, k.h * (k.child ? 0.038 : 0.03), 0, Math.PI * 2);
  ctx.fill();
}

function shoe(ctx, k, [x, y]) {
  ctx.fillStyle = k.paint('#22222a', 0.1);
  ctx.beginPath();
  ctx.ellipse(x + k.h * 0.02, y - k.h * 0.012, k.h * 0.045, k.h * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();
}

function phone(ctx, k, [x, y]) {
  const s = k.h * 0.05;
  const g = ctx.createRadialGradient(x, y - s, 0, x, y - s, k.h * 0.3);
  g.addColorStop(0, 'rgb(200 225 255 / 0.4)');
  g.addColorStop(1, 'rgb(200 225 255 / 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - k.h * 0.3, y - s - k.h * 0.3, k.h * 0.6, k.h * 0.6);
  ctx.fillStyle = '#dcebff';
  ctx.fillRect(x - s * 0.3, y - s * 1.1, s * 0.6, s);
}

function bundle(ctx, k, b, sy) {
  ctx.fillStyle = k.fill('#f3efe6');
  ctx.beginPath();
  ctx.ellipse(b.shoulderW * 0.6, sy + k.h * 0.14, k.h * 0.1, k.h * 0.06, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function sitting(ctx, k, it) {
  const { h, t } = k;
  const b = body(k);
  const seat = -h * 0.27;
  const breathe = Math.sin(t * 1.7 + (it.x ?? 0) * 9) * h * 0.004;
  if (!it.back) {
    // Seen from behind, the legs are hidden under the desk or the bench.
    limb(ctx, k, k.look.legs, [-h * 0.02, seat], [h * 0.2, seat], b.limb * 1.2, 0.2, [h * 0.22, 0]);
    shoe(ctx, k, [h * 0.22, 0]);
    limb(ctx, k, k.look.legs, [0, seat], [h * 0.22, seat - h * 0.01], b.limb * 1.2, 0, [h * 0.25, 0]);
    shoe(ctx, k, [h * 0.25, 0]);
  }
  ctx.save();
  ctx.translate(0, seat + breathe);
  ctx.rotate(it.bend ?? 0.05);
  const sy = b.shoulderY - b.hipY;
  limb(ctx, k, k.look.top, [-b.shoulderW * 0.7, sy + h * 0.02], [h * 0.12, -h * 0.02], b.limb, 0.25);
  torso(ctx, k, b, sy);
  head(ctx, k, b, sy, it);
  limb(ctx, k, k.look.top, [b.shoulderW * 0.8, sy + h * 0.02], [h * 0.17, -h * 0.03], b.limb, 0);
  hand(ctx, k, [h * 0.17, -h * 0.03], 0);
  ctx.restore();
}

// On a bike: the wheels turn and the feet go round the pedals as `step` grows.
function onBike(ctx, k, it) {
  const { h, step } = k;
  const b = body(k);
  const wr = h * 0.2;
  const metal = k.paint('#2a2f3a');
  for (const dx of [-h * 0.34, h * 0.34]) {
    ctx.strokeStyle = metal;
    ctx.lineWidth = Math.max(1.4, h * 0.022);
    ctx.beginPath();
    ctx.arc(dx, -wr, wr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = Math.max(0.6, h * 0.007);
    for (let i = 0; i < 3; i += 1) {
      const a = step * 0.7 + (i * Math.PI) / 3;
      line(ctx, dx - Math.cos(a) * wr * 0.92, -wr - Math.sin(a) * wr * 0.92, dx + Math.cos(a) * wr * 0.92, -wr + Math.sin(a) * wr * 0.92);
    }
  }
  const hip = [-h * 0.08, -wr * 2.35];
  const crank = [-h * 0.02, -wr];
  const pedal = (a) => [crank[0] + Math.cos(a) * h * 0.07, crank[1] + Math.sin(a) * h * 0.07];
  // A leg from the hip to a pedal, the knee pushed forward and up.
  const leg = (p, dark) => {
    const knee = [(hip[0] + p[0]) / 2 + h * 0.08, (hip[1] + p[1]) / 2 - h * 0.03];
    limb(ctx, k, k.look.legs, hip, knee, b.limb * 1.1, dark, p);
  };
  leg(pedal(step + Math.PI), 0.25);
  ctx.strokeStyle = k.paint('#c8473e');
  ctx.lineWidth = Math.max(1.6, h * 0.03);
  line(ctx, -h * 0.34, -wr, -h * 0.02, -wr);
  line(ctx, -h * 0.02, -wr, h * 0.22, -wr * 2.1);
  line(ctx, -h * 0.34, -wr, -h * 0.08, -wr * 2.2);
  line(ctx, h * 0.34, -wr, h * 0.24, -wr * 2.5);
  leg(pedal(step), 0);
  ctx.save();
  ctx.translate(hip[0], hip[1]);
  ctx.rotate(0.35);
  const sy = b.shoulderY - b.hipY;
  torso(ctx, k, b, sy);
  head(ctx, k, b, sy, it);
  ctx.restore();
  limb(ctx, k, k.look.top, [h * 0.04, hip[1] - h * 0.3], [h * 0.22, -wr * 2.55], b.limb, 0);
  hand(ctx, k, [h * 0.22, -wr * 2.55], 0);
}

function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}
