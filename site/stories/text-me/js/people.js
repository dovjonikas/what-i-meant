// people.js: how the people in the story look and how they are drawn.
//
// Nobody has eyes or a mouth, so any player can be them. What makes each one somebody is
// the rest: every person keeps one colour and one piece of clothing for their whole life
// (Mom's red coat, Dad's green jacket, Grandma's yellow headscarf, your orange top), and the
// life lines view draws their line in the same colour, so a dot there is a person you know.
//
// Each of them is also told apart by the cut of their clothes and a few small things, the
// same all their life: your hoodie with its strings and the tuft of hair that never lies
// down, Mom's coat with lapels and buttons and her earrings, Dad's zip-up jacket and his
// beard, Grandma's cardigan and the knot of her headscarf, Grandpa's waistcoat over a shirt
// and his moustache, the best friend's beanie and stripe, the partner's knit and earrings,
// the kid's stripes and tuft. A little warmth in the cheek and an ear make a head somebody's.
//
// Figures are drawn flat with a soft shadow side and a light edge on the side the light
// comes from, arms and legs narrowing to the wrist and ankle, and a soft shadow on the
// ground under them. At night they sink toward the scene's dark colour, so a person under a
// lamp still reads as a person and a person in the dark reads as a silhouette.

import { hexToRgb, mix, rgbToCss, vivid } from './util.js';

const mixHex = (a, b, t) => '#' + mix(a, b, t).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
import { drawDog } from './pets.js';

// One look per person. `mark` is their colour in the life lines (their top, unless noted).
// `old` replaces parts of the look once they are old. Red is Mom's alone (the dog's collar
// is teal for that reason), and Dad's green is dark enough to stay apart from her red for
// players who cannot tell red from green.
export const LOOKS = {
  me: { wear: 'hoodie', tuft: true, top: '#d9772e', legs: '#2e3a55', hair: '#a8824c', skin: '#efc3a2', old: { hair: '#d4cec4' } },
  mom: { wear: 'coat', earring: '#e7c46a', top: '#c9473f', legs: '#3b3346', hair: '#7a4a2c', hairStyle: 'long', skin: '#f0c4a2', coat: true, old: { hair: '#cfc8bf', hairStyle: 'bun' } },
  dad: { wear: 'jacket', beard: true, top: '#2f5a4e', legs: '#3a3833', hair: '#2a2420', skin: '#d6a07e', broad: true, old: { hair: '#cdc8c0' } },
  grandma: { wear: 'cardigan', top: '#7b5b8e', legs: '#5a4a5a', scarf: '#e0a83e', skin: '#efcaae', coat: true, mark: '#e0a83e' },
  grandpa: { wear: 'vest', moustache: true, top: '#8b6a4b', legs: '#4a4038', hair: '#dcd8d0', cap: '#5a4b3c', skin: '#e2b08e' },
  friend: { wear: 'stripe', beanie: '#34466a', top: '#f2c94c', legs: '#2c4a6b', hair: '#c79a55', skin: '#f2c8a6' },
  partner: { wear: 'knit', earring: '#e7c46a', top: '#5b8fd0', legs: '#2f3340', hair: '#1f1a18', hairStyle: 'long', skin: '#c98d68' },
  kid: { wear: 'stripes', tuft: true, top: '#f0a347', legs: '#3e5a7a', hair: '#c9a46a', skin: '#f0c4a2' },
  goose: { mark: '#b9c6d8' },
  dog: { coat: '#b9773f', light: '#f1dcbc', mark: '#2f8fa3', collar: '#2f8fa3' },
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
 * hand, push, reach, carry, bike, hips, cross, shrug, pet), face (-1 faces left), back (seen
 * from behind), bend, squat (0 to 1, a crouch), laugh (shoulders shaking), hands ('peel',
 * for somebody sitting), stride, and any look field to override (top, hair, ...). fx.js
 * adds flip (the face, eased through a turn) and poseFrom and poseK (the arms on their way
 * from the last pose to this one). `t` is time in seconds, for
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
    light,
    child: it.age === 'child',
    old: it.age === 'old',
    look,
    paint,
    // A colour in the scene's light with an alpha, for soft touches like a cheek.
    tint: (hex, alpha) => rgbToCss(vivid(mix(hexToRgb(hex), shade, 1 - light), pen.scene.vibrance ?? 1), alpha),
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
  const flip = it.flip ?? face;
  if (flip !== 1) ctx.scale(Math.sign(flip || 1) * Math.max(0.12, Math.abs(flip)), 1);
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
  // Everyone breathes at their own rate. `mood: 'sad'` is grief in the body, the cues that
  // read without a face: slower breath, a lean forward, a slower and wider sway.
  const sad = it.mood === 'sad';
  const rate = (1.5 + ((seed * 7.3) % 1) * 0.5) * (sad ? 0.7 : 1);
  const breathe = Math.sin(t * rate + seed) * h * 0.004;
  // Standing still, people shift their weight a little; walking, they bob with each step.
  const sway = moving ? 0 : Math.sin(t * (sad ? 0.4 : 0.55) + seed) * h * (sad ? 0.011 : 0.008);
  // Laughing: the shoulders shake in small quick hops.
  const bob = moving ? -Math.abs(Math.sin(step)) * h * (sad ? 0.009 : 0.02) : it.laugh ? -Math.abs(Math.sin(t * 13)) * h * 0.007 : 0;
  // A crouch lowers the hips and bends the knees forward.
  const squat = it.squat ?? 0;
  const drop = squat * h * 0.2;
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
  const leg = (hx, foot, dark) => {
    const hip = [hx + sway, b.hipY + bob + drop];
    const knee = [(hip[0] + foot[0]) / 2 + squat * h * 0.15, (hip[1] + foot[1]) / 2 - squat * h * 0.02];
    limb(ctx, k, k.look.legs, hip, knee, b.limb * 1.3, dark, foot);
    shoe(ctx, k, foot);
  };
  if (!it.noShadow) groundShadow(ctx, k, sway, h * (moving || pose === 'walk' || it.stride ? 0.48 : 0.34));
  leg(-h * 0.03, legs[0], 0.25);
  leg(h * 0.03, legs[1], 0);

  ctx.save();
  ctx.translate(sway, b.hipY + breathe + bob + drop);
  ctx.rotate((it.bend ?? (k.old ? 0.2 : pose === 'phone' ? 0.07 : 0)) + (sad ? 0.09 : 0) - (it.laugh ? 0.05 : 0));
  const sy = b.shoulderY - b.hipY;
  let arms = armPose(pose, k, b, sy, t);
  if (it.poseFrom && it.poseK < 1 && !['sit', 'bike'].includes(it.poseFrom)) {
    arms = blendArms(armPose(it.poseFrom, k, b, sy, t), arms, it.poseK);
  }
  limb(ctx, k, k.look.top, arms.back[0], arms.back[1], b.limb, 0.28, arms.back[2]);
  cuff(ctx, k, arms.back, b.limb, 0.28);
  hand(ctx, k, arms.back[2] ?? arms.back[1], 0.25);
  torso(ctx, k, b, sy, it.back);
  head(ctx, k, b, sy, it);
  limb(ctx, k, k.look.top, arms.front[0], arms.front[1], b.limb, 0, arms.front[2]);
  cuff(ctx, k, arms.front, b.limb, 0);
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
  // At rest an arm hangs with a soft bend: the elbow a little back, the hand a little forward.
  const down = (side, dx = 0) => [
    [side * s, sy + h * 0.02],
    [side * (s + h * 0.012) - h * 0.008, sy + (h * 0.07 - sy) * 0.47],
    [side * (s + h * 0.016) + h * 0.012 + dx, h * 0.065],
  ];
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
    case 'hips': {
      // Hands on the hips, elbows out: not having it.
      const arm = (side) => [[side * s, sy + h * 0.02], [side * (s + h * 0.085), sy + h * 0.17], [side * h * 0.085, -h * 0.01]];
      return { back: arm(-1), front: arm(1) };
    }
    case 'cross':
      // Arms folded over the chest.
      return {
        back: [[-s, sy + h * 0.02], [-s - h * 0.012, sy + h * 0.19], [s * 0.55, sy + h * 0.13]],
        front: [[s, sy + h * 0.02], [s + h * 0.012, sy + h * 0.2], [-s * 0.55, sy + h * 0.15]],
      };
    case 'shrug': {
      // Both hands up and open: what did I do.
      const arm = (side) => [[side * s, sy + h * 0.02], [side * (s + h * 0.06), sy + h * 0.15], [side * (s + h * 0.13), sy + h * 0.03]];
      return { back: arm(-1), front: arm(1) };
    }
    case 'pet':
      // Reaching down in front, to a dog's head.
      return { back: down(-1, h * 0.04), front: [[s, sy + h * 0.02], [s + h * 0.12, sy + h * 0.2], [s + h * 0.22, sy + h * 0.33]] };
    default:
      return { back: down(-1), front: down(1) };
  }
}

/** The arms part of the way from one pose to the next, every joint on a straight line. */
function blendArms(a, b, k) {
  const three = (arm) => (arm.length === 3 ? arm : [arm[0], [(arm[0][0] + arm[1][0]) / 2, (arm[0][1] + arm[1][1]) / 2], arm[1]]);
  const mixArm = (p, q) => {
    const [from, to] = [three(p), three(q)];
    return from.map((pt, i) => [pt[0] + (to[i][0] - pt[0]) * k, pt[1] + (to[i][1] - pt[1]) * k]);
  };
  return { back: mixArm(a.back, b.back), front: mixArm(a.front, b.front) };
}

function torso(ctx, k, b, sy, back = false) {
  const { h, look } = k;
  const coat = look.coat ? h * 0.2 : 0;
  const hw = look.coat ? b.hipW * 1.3 : b.hipW;
  const hem = h * 0.02 + coat;
  // The top narrows a little at the waist and sits out again over the hips.
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(-b.shoulderW, sy + h * 0.065);
    ctx.quadraticCurveTo(-b.shoulderW, sy, -b.shoulderW + h * 0.065, sy);
    ctx.lineTo(b.shoulderW - h * 0.065, sy);
    ctx.quadraticCurveTo(b.shoulderW, sy, b.shoulderW, sy + h * 0.065);
    ctx.quadraticCurveTo(b.shoulderW * 0.86, sy * 0.45, hw, hem);
    ctx.lineTo(-hw, hem);
    ctx.quadraticCurveTo(-b.shoulderW * 0.86, sy * 0.45, -b.shoulderW, sy + h * 0.04);
    ctx.closePath();
  };
  if (look.wear === 'hoodie') hood(ctx, k, b, sy);
  ctx.fillStyle = k.fill(look.top);
  shape();
  ctx.fill();
  if (!back) {
    ctx.save();
    shape();
    ctx.clip();
    clothes(ctx, k, b, sy, hw, hem);
    ctx.restore();
  }
  // A little shade along the hem, where the cloth turns under.
  const fold = ctx.createLinearGradient(0, hem - h * 0.07, 0, hem);
  fold.addColorStop(0, 'rgb(0 0 0 / 0)');
  fold.addColorStop(1, 'rgb(0 0 0 / 0.2)');
  ctx.fillStyle = fold;
  shape();
  ctx.fill();
  if (look.coat && !back) {
    // A coat's front edge, from the collar down.
    ctx.strokeStyle = k.paint(look.top, 0.35);
    ctx.lineWidth = Math.max(0.7, h * 0.008);
    line(ctx, h * 0.012, sy + h * 0.035, h * 0.022, hem - h * 0.005);
  }
  if (k.rim) {
    // Relative to the alpha already set, so a faded figure (a memory) stays faded.
    const a0 = ctx.globalAlpha;
    ctx.globalAlpha = a0 * 0.5;
    ctx.save();
    shape();
    ctx.clip();
    ctx.beginPath();
    ctx.rect(k.litSide > 0 ? b.shoulderW * 0.35 : -h, sy, h - b.shoulderW * 0.35, hem - sy - h * 0.025);
    ctx.clip();
    ctx.strokeStyle = k.rim;
    ctx.lineWidth = Math.max(2, h * 0.026);
    shape();
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = a0;
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
  if (!it.back) {
    // A little warmth in the cheek, on the side the face is turned to.
    const bx = cx + r * 0.4;
    const by = cy + r * 0.32;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, r * 0.42);
    g.addColorStop(0, k.tint('#e9806a', k.child ? 0.5 : 0.34));
    g.addColorStop(1, k.tint('#e9806a', 0));
    ctx.fillStyle = g;
    ctx.fillRect(bx - r * 0.42, by - r * 0.42, r * 0.84, r * 0.84);
  }
  ctx.restore();

  if (look.scarf) {
    // A headscarf: covers the head and tucks behind, leaving the face.
    ctx.fillStyle = k.fill(look.scarf);
    ctx.beginPath();
    ctx.arc(cx - r * 0.12, cy - r * 0.05, r * 1.12, Math.PI * 0.62, Math.PI * 2.08);
    ctx.lineTo(cx - r * 1.25, cy + r * 1.05);
    ctx.closePath();
    ctx.fill();
    if (!it.back) {
      // Tied under the chin, the two ends hanging.
      ctx.fillStyle = k.paint(look.scarf, 0.12);
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.1, cy + r * 1.02, r * 0.2, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.2, cy + r * 1.05);
      ctx.lineTo(cx - r * 0.42, cy + r * 1.55);
      ctx.lineTo(cx - r * 0.18, cy + r * 1.5);
      ctx.lineTo(cx + r * 0.02, cy + r * 1.08);
      ctx.closePath();
      ctx.fill();
    }
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
    if (look.tuft && !look.beanie) {
      // The tuft on the crown that never lies down.
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.42, cy - r * 1.0);
      ctx.quadraticCurveTo(cx - r * 0.3, cy - r * 1.5, cx + r * 0.05, cy - r * 1.42);
      ctx.quadraticCurveTo(cx - r * 0.12, cy - r * 1.24, cx + r * 0.05, cy - r * 1.0);
      ctx.closePath();
      ctx.fill();
    }
    if (hairStyle === 'bun') {
      ctx.beginPath();
      ctx.arc(cx - r * 0.9, cy - r * 0.6, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!it.back && hairStyle === 'short') {
      // A strand's edge across the crown, and the ear just in front of the hairline.
      ctx.strokeStyle = k.paint(look.hair, 0.22);
      ctx.lineWidth = Math.max(0.6, r * 0.07);
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.05, r * 0.82, -2.35, -1.75);
      ctx.stroke();
      ctx.fillStyle = k.paint(look.skin, 0.16);
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.5, cy + r * 0.14, r * 0.15, r * 0.21, 0.2, 0, Math.PI * 2);
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
  if (!it.back && look.beard) {
    // A short beard along the jaw, up to the ear: the face above it stays bare.
    ctx.fillStyle = k.paint(mixHex(look.hair, look.skin, 0.18), 0.04);
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy + r * 0.28);
    ctx.quadraticCurveTo(cx - r * 0.4, cy + r * 0.98, cx + r * 0.25, cy + r * 1.05);
    ctx.quadraticCurveTo(cx + r * 0.8, cy + r * 0.95, cx + r * 0.9, cy + r * 0.52);
    ctx.quadraticCurveTo(cx + r * 0.55, cy + r * 0.76, cx + r * 0.12, cy + r * 0.7);
    ctx.quadraticCurveTo(cx - r * 0.22, cy + r * 0.62, cx - r * 0.3, cy + r * 0.28);
    ctx.closePath();
    ctx.fill();
  }
  if (!it.back && look.moustache) {
    ctx.fillStyle = k.paint(look.hair, 0.04);
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.55, cy + r * 0.4, r * 0.3, r * 0.11, -0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!it.back && look.earring) {
    ctx.fillStyle = k.paint(look.earring);
    ctx.beginPath();
    ctx.arc(cx - r * 0.46, cy + r * 0.48, Math.max(0.7, r * 0.1), 0, Math.PI * 2);
    ctx.fill();
  }
  if (look.beanie) {
    // A beanie pulled down to the ears, with its turned-up edge.
    ctx.fillStyle = k.paint(look.beanie, 0.04);
    ctx.beginPath();
    ctx.arc(cx - r * 0.04, cy - r * 0.1, r * 1.14, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = k.paint(look.beanie, 0.2);
    ctx.fillRect(cx - r * 1.16, cy - r * 0.32, r * 2.24, r * 0.34);
    ctx.fillStyle = k.paint(mixHex(look.beanie, '#ffffff', 0.25), 0.04);
    ctx.beginPath();
    ctx.arc(cx - r * 0.04, cy - r * 1.22, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
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

/**
 * An arm or a leg from `from` through `to` (and on to `end`), a little thicker than
 * `width` at the top and narrower at the wrist or ankle, with rounded joints: one filled
 * shape, so a faded figure has no darker overlaps at the elbow or knee.
 */
function limb(ctx, k, hex, from, to, width, dark, end) {
  const pts = end ? [from, to, end] : [from, to];
  const n = pts.length - 1;
  const half = (i) => (width * (1.12 - 0.34 * (i / n))) / 2;
  ctx.fillStyle = k.paint(hex, dark + 0.06);
  ctx.beginPath();
  for (let i = 0; i < n; i += 1) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    const ra = half(i);
    const rb = half(i + 1);
    // Every piece is wound the same way as the round joints, so they fill as one shape.
    ctx.moveTo(ax - nx * ra, ay - ny * ra);
    ctx.lineTo(bx - nx * rb, by - ny * rb);
    ctx.lineTo(bx + nx * rb, by + ny * rb);
    ctx.lineTo(ax + nx * ra, ay + ny * ra);
    ctx.closePath();
  }
  pts.forEach(([px, py], i) => {
    ctx.moveTo(px + half(i), py);
    ctx.arc(px, py, half(i), 0, Math.PI * 2);
  });
  ctx.fill('nonzero');
}

/** A cuff: a darker band of the sleeve just above the hand. */
function cuff(ctx, k, arm, width, dark) {
  const [p, q] = arm.length === 3 ? [arm[1], arm[2]] : arm;
  const at = (v) => [p[0] + (q[0] - p[0]) * v, p[1] + (q[1] - p[1]) * v];
  const [a, b] = [at(0.8), at(0.93)];
  ctx.strokeStyle = k.paint(k.look.top, dark + 0.2);
  ctx.lineWidth = width * 0.84;
  ctx.lineCap = 'butt';
  line(ctx, a[0], a[1], b[0], b[1]);
  ctx.lineCap = 'round';
}

/** A hood lying round the back of the neck, seen over the shoulders. */
function hood(ctx, k, b, sy) {
  const { h } = k;
  ctx.fillStyle = k.paint(k.look.top, 0.2);
  ctx.beginPath();
  ctx.ellipse(h * 0.005, sy + h * 0.012, b.shoulderW * 0.64, h * 0.042, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The details that make a top somebody's, inside its outline (the caller clips to it):
 * the neckline, a hoodie's strings and pocket, lapels and buttons, a zip, a stripe.
 */
function clothes(ctx, k, b, sy, hw, hem) {
  const { h, look } = k;
  const sw = b.shoulderW;
  const cx = h * 0.01;
  const thin = Math.max(0.6, h * 0.008);
  const dark = (d) => k.paint(look.top, d);
  const light = (t) => k.paint(mixHex(look.top, '#fff6e6', t));
  const dot = (x, y, r, css) => {
    ctx.fillStyle = css;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.6, r), 0, Math.PI * 2);
    ctx.fill();
  };
  const shapeOf = (pts, css) => {
    ctx.fillStyle = css;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
  };
  const band = (y, tall, css) => {
    ctx.fillStyle = css;
    ctx.fillRect(-sw * 1.5, y, sw * 3, tall);
  };
  const crew = (width) => {
    ctx.strokeStyle = dark(0.3);
    ctx.lineWidth = Math.max(0.8, h * width);
    ctx.beginPath();
    ctx.ellipse(cx, sy + h * 0.004, sw * 0.36, h * 0.024, 0, Math.PI * 0.06, Math.PI * 0.94);
    ctx.stroke();
  };
  ctx.lineCap = 'round';
  switch (look.wear) {
    case 'hoodie': {
      ctx.strokeStyle = k.paint('#efe8dc', 0.08);
      ctx.lineWidth = thin;
      for (const side of [-1, 1]) {
        line(ctx, cx + side * sw * 0.2, sy + h * 0.03, cx + side * sw * 0.25, sy + h * 0.11);
        dot(cx + side * sw * 0.25, sy + h * 0.115, h * 0.007, k.paint('#efe8dc', 0.08));
      }
      // The pocket across the front.
      ctx.strokeStyle = dark(0.24);
      ctx.lineWidth = thin;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.7, hem - h * 0.02);
      ctx.lineTo(-hw * 0.5, hem - h * 0.1);
      ctx.lineTo(hw * 0.5, hem - h * 0.1);
      ctx.lineTo(hw * 0.7, hem - h * 0.02);
      ctx.stroke();
      band(hem - h * 0.022, h * 0.022, dark(0.2));
      break;
    }
    case 'coat': {
      shapeOf([[cx - sw * 0.4, sy], [cx - sw * 0.1, sy], [cx + h * 0.004, sy + h * 0.12]], dark(0.18));
      shapeOf([[cx + sw * 0.4, sy], [cx + sw * 0.1, sy], [cx + h * 0.004, sy + h * 0.12]], dark(0.1));
      for (const y of [0.15, 0.23, 0.31]) dot(h * 0.034, sy + h * y, h * 0.008, dark(0.45));
      ctx.strokeStyle = dark(0.3);
      ctx.lineWidth = thin;
      for (const side of [-1, 1]) line(ctx, side * hw * 0.35, h * 0.07, side * hw * 0.78, h * 0.065);
      break;
    }
    case 'jacket': {
      shapeOf([[cx - sw * 0.44, sy - h * 0.004], [cx - sw * 0.08, sy - h * 0.01], [cx - sw * 0.02, sy + h * 0.05], [cx - sw * 0.4, sy + h * 0.035]], dark(0.22));
      shapeOf([[cx + sw * 0.44, sy - h * 0.004], [cx + sw * 0.08, sy - h * 0.01], [cx + sw * 0.02, sy + h * 0.05], [cx + sw * 0.4, sy + h * 0.035]], dark(0.14));
      ctx.strokeStyle = light(0.3);
      ctx.lineWidth = thin;
      line(ctx, cx, sy + h * 0.05, cx + h * 0.004, hem - h * 0.01);
      ctx.strokeStyle = dark(0.3);
      ctx.strokeRect(sw * 0.24, sy + h * 0.08, sw * 0.38, h * 0.045);
      band(hem - h * 0.028, h * 0.028, dark(0.22));
      break;
    }
    case 'cardigan': {
      for (let i = 0; i < 4; i += 1) dot(h * 0.03, sy + h * (0.07 + i * 0.065), h * 0.008, light(0.45));
      ctx.strokeStyle = dark(0.28);
      ctx.lineWidth = thin;
      for (const side of [-1, 1]) ctx.strokeRect(side > 0 ? hw * 0.3 : -hw * 0.82, h * 0.03, hw * 0.52, h * 0.06);
      break;
    }
    case 'vest': {
      shapeOf([[cx - sw * 0.32, sy], [cx + sw * 0.32, sy], [cx, sy + h * 0.13]], k.paint('#e9e2d4', 0.1));
      shapeOf([[cx - sw * 0.3, sy], [cx - sw * 0.04, sy + h * 0.02], [cx - sw * 0.16, sy + h * 0.045]], k.paint('#e9e2d4', 0.26));
      shapeOf([[cx + sw * 0.3, sy], [cx + sw * 0.04, sy + h * 0.02], [cx + sw * 0.16, sy + h * 0.045]], k.paint('#e9e2d4', 0.2));
      for (const y of [0.17, 0.24, 0.31]) dot(cx + h * 0.002, sy + h * y, h * 0.008, dark(0.42));
      break;
    }
    case 'stripe':
      crew(0.014);
      band(sy + h * 0.075, h * 0.03, light(0.55));
      band(sy + h * 0.112, h * 0.012, dark(0.25));
      break;
    case 'knit': {
      crew(0.022);
      ctx.strokeStyle = dark(0.13);
      ctx.lineWidth = Math.max(0.5, h * 0.006);
      for (const x of [-0.55, -0.2, 0.15, 0.5]) line(ctx, sw * x, sy + h * 0.06, sw * x * 0.9, hem - h * 0.03);
      band(hem - h * 0.03, h * 0.03, dark(0.2));
      break;
    }
    case 'stripes':
      crew(0.016);
      band(sy + h * 0.075, h * 0.03, light(0.6));
      band(sy + h * 0.14, h * 0.03, light(0.6));
      break;
    default:
      crew(0.014);
  }
}

function hand(ctx, k, [x, y], dark) {
  ctx.fillStyle = k.paint(k.look.skin, dark + 0.05);
  ctx.beginPath();
  ctx.ellipse(x, y + k.h * 0.006, k.h * (k.child ? 0.027 : 0.02), k.h * (k.child ? 0.032 : 0.027), 0, 0, Math.PI * 2);
  ctx.fill();
}

/** A shoe, toe forward: a flat sole and a rounded toe, a little lighter along the sole. */
function shoe(ctx, k, [x, y]) {
  const l = k.h * (k.child ? 0.05 : 0.056);
  const t = k.h * (k.child ? 0.028 : 0.026);
  ctx.fillStyle = k.paint('#22222a', 0.1);
  ctx.beginPath();
  ctx.moveTo(x - l * 0.42, y);
  ctx.lineTo(x + l * 0.92, y);
  ctx.quadraticCurveTo(x + l * 1.02, y - t * 0.85, x + l * 0.4, y - t);
  ctx.quadraticCurveTo(x - l * 0.3, y - t * 1.25, x - l * 0.42, y - t * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = k.paint('#5a5660', 0.1);
  ctx.fillRect(x - l * 0.42, y - Math.max(0.6, t * 0.18), l * 1.32, Math.max(0.6, t * 0.18));
}

/** The soft shadow on the ground under somebody, `w` wide, so nobody floats. */
function groundShadow(ctx, k, x, w) {
  ctx.save();
  ctx.translate(x, 0);
  ctx.scale(1, 0.13);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  g.addColorStop(0, `rgb(0 0 0 / ${0.12 + 0.2 * k.light})`);
  g.addColorStop(1, 'rgb(0 0 0 / 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -w / 2, w, w);
  ctx.restore();
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

// Sitting. `seat` says on what: 'chair' (the default: a chair or bench at knee height,
// drawn by the scene), 'ground' (on the grass or the floor, knees up, hands on the knees)
// or 'ledge' (the end of a pier, a step: `y` is the edge, the legs hang over it).
function sitting(ctx, k, it) {
  const { h, t } = k;
  const b = body(k);
  const on = it.seat ?? 'chair';
  const seat = on === 'ground' ? -h * 0.05 : on === 'ledge' ? -h * 0.01 : -h * 0.27;
  const knee = on === 'ground' ? [h * 0.13, -h * 0.17] : on === 'ledge' ? [h * 0.15, -h * 0.01] : [h * 0.2, seat];
  const foot = on === 'ground' ? [h * 0.23, 0] : on === 'ledge' ? [h * 0.17, h * 0.19] : [h * 0.22, 0];
  const breathe = Math.sin(t * 1.7 + (it.x ?? 0) * 9) * h * 0.004;
  if (on !== 'ledge' && !it.noShadow) groundShadow(ctx, k, h * 0.08, h * 0.5);
  if (!it.back) {
    // Seen from behind, the legs are hidden under the desk or the bench.
    limb(ctx, k, k.look.legs, [-h * 0.02, seat], knee, b.limb * 1.3, 0.2, foot);
    shoe(ctx, k, foot);
    const near = [foot[0] + h * 0.03, foot[1]];
    limb(ctx, k, k.look.legs, [0, seat], [knee[0] + h * 0.02, knee[1] - h * 0.01], b.limb * 1.3, 0, near);
    shoe(ctx, k, near);
  }
  // Where the hands rest, measured from the hips: on the lap, or on the knees on the ground.
  const lap = on === 'ground' ? [knee[0] + h * 0.01, knee[1] - seat + h * 0.03] : [h * 0.17, -h * 0.03];
  ctx.save();
  ctx.translate(0, seat + breathe);
  ctx.rotate(it.bend ?? 0.05);
  const sy = b.shoulderY - b.hipY;
  // `hands: 'peel'`: an apple held up in front in one hand, the knife in the other, and
  // the peel hanging from it in one curl, as long as `curl` says (0 to 1).
  const peel = it.hands === 'peel';
  const apple = [h * 0.2, sy + h * 0.24];
  const backHand = peel ? apple : [lap[0] - h * 0.05, lap[1] + h * 0.01];
  const frontHand = peel ? [h * 0.25, sy + h * 0.21 + Math.sin(t * 2.4) * h * 0.008] : lap;
  limb(ctx, k, k.look.top, [-b.shoulderW * 0.7, sy + h * 0.02], peel ? [h * 0.02, sy + h * 0.24] : backHand, b.limb, 0.25, peel ? backHand : null);
  torso(ctx, k, b, sy, it.back);
  head(ctx, k, b, sy, it);
  // `curlSeconds`: the peel grows while you watch, as long as that takes.
  if (peel) curl(ctx, k, apple, it.curlSeconds ? Math.min(1, t / it.curlSeconds) : it.curl ?? 1, t);
  limb(ctx, k, k.look.top, [b.shoulderW * 0.8, sy + h * 0.02], peel ? [h * 0.16, sy + h * 0.17] : frontHand, b.limb, 0, peel ? frontHand : null);
  hand(ctx, k, frontHand, 0);
  ctx.restore();
}

// An apple being peeled in one long curl: the apple, white where it is peeled, and the
// red peel hanging from it and turning a little, longer as `length` goes from 0 to 1.
function curl(ctx, k, [x, y], length, t) {
  const { h } = k;
  const r = h * 0.045;
  const drop = h * 0.42 * length;
  if (drop > 1) {
    ctx.strokeStyle = k.paint('#e04a32');
    ctx.lineWidth = Math.max(1.6, h * 0.022);
    ctx.beginPath();
    ctx.moveTo(x + r * 0.6, y + r * 0.4);
    const n = Math.max(2, Math.round(length * 9));
    for (let i = 1; i <= n; i += 1) {
      const v = i / n;
      ctx.lineTo(x + r * 0.6 + Math.sin(v * 13 + t * 1.3) * h * 0.02 * (0.5 + v), y + r * 0.4 + drop * v);
    }
    ctx.stroke();
  }
  ctx.fillStyle = k.paint('#e9d79a', 0.05);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = k.paint('#c8402e', 0.05);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, Math.PI * 1.1, Math.PI * (1.1 + 1.9 * (1 - length)));
  ctx.closePath();
  ctx.fill();
}

// On a bike: the wheels turn and the feet go round the pedals as `step` grows.
function onBike(ctx, k, it) {
  const { h, step } = k;
  const b = body(k);
  const wr = h * 0.2;
  const metal = k.paint('#2a2f3a');
  if (!it.noShadow) groundShadow(ctx, k, 0, h * 1.0);
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
    limb(ctx, k, k.look.legs, hip, knee, b.limb * 1.2, dark, p);
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
