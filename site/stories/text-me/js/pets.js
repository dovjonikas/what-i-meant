// pets.js: the family dog. Drawn like the people: flat, lit from one side, and with no face
// beyond a nose, so the body does the talking: the tail wags faster when you come home,
// the legs run, the ears flop, and an old dog's muzzle goes grey and his tail slows.
//
// drawDog(ctx, it, k) is called by people.js for a person whose `who` is 'dog'. `it.h` is
// the dog's height at the shoulder (a column-width fraction, like a person's height).
// Poses: stand, sit, lie, and front (sitting, turned to face us). Age: 'puppy', 'adult', 'old'.
// `shoe: true`: he has somebody's shoe in his mouth.

export function drawDog(ctx, it, k) {
  const { h, t, step, moving, paint } = k;
  const old = it.age === 'old';
  const puppy = it.age === 'puppy';
  const coat = k.look.coat;
  const pale = old ? '#d9d4cc' : k.look.light;
  const pose = it.pose ?? 'stand';
  // Body proportions: a puppy is rounder with a bigger head.
  const len = h * (puppy ? 0.9 : 1.15);
  const headR = h * (puppy ? 0.32 : 0.26);
  const wagSpeed = old ? 4 : puppy ? 16 : 11;
  const wag = Math.sin(t * wagSpeed) * (it.wag ?? (old ? 0.25 : 0.55));
  const bob = moving ? -Math.abs(Math.sin(step * 2)) * h * 0.06 : Math.sin(t * 1.4) * h * 0.01;

  ctx.lineCap = 'round';
  const legW = h * (puppy ? 0.16 : 0.13);
  if (pose === 'front') {
    front(ctx, k, it, { coat, pale, headR, legW, wagSpeed, puppy, old });
    return;
  }
  const leg = (x, y0, dx, dark) => {
    ctx.strokeStyle = paint(coat, dark);
    ctx.lineWidth = legW;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x + dx, -legW * 0.5);
    ctx.stroke();
  };

  if (pose === 'lie') {
    // Lying down, head on the front paws, the back rising and falling slowly.
    const rise = 1 + Math.sin(t * 1.3) * 0.05;
    ctx.fillStyle = paint(coat, 0.05);
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.28 * rise, len * 0.6, h * 0.28 * rise, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = paint(coat, 0.15);
    ctx.fillRect(len * 0.2, -h * 0.12, len * 0.5, h * 0.12);
    head(ctx, k, len * 0.62, -h * 0.3, headR, pale, coat, it, -0.15);
    tail(ctx, k, -len * 0.55, -h * 0.3, h, coat, wag * 0.4, -0.2);
    return;
  }

  const hip = -h * (pose === 'sit' ? 0.45 : 0.62) + bob;
  const shoulder = -h * 0.66 + bob;
  const swing = moving ? Math.sin(step * 2) * h * 0.22 : 0;
  // Back legs first (the far pair darker), then the body, then the near pair.
  if (pose === 'sit') {
    leg(len * 0.32, shoulder, swing * 0.2, 0.25);
  } else {
    leg(-len * 0.38, hip, -swing, 0.25);
    leg(len * 0.34, shoulder, swing, 0.25);
  }
  tail(ctx, k, -len * 0.48, hip - h * 0.08, h, coat, wag, pose === 'sit' ? -0.3 : 0.4);
  ctx.fillStyle = paint(coat);
  ctx.beginPath();
  if (pose === 'sit') {
    ctx.ellipse(-len * 0.1, -h * 0.42 + bob, len * 0.34, h * 0.42, -0.9, 0, Math.PI * 2);
  } else {
    ctx.ellipse(0, (hip + shoulder) / 2, len * 0.55, h * 0.27, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  // The pale chest.
  ctx.fillStyle = paint(pale, 0.05);
  ctx.beginPath();
  ctx.ellipse(len * 0.36, shoulder + h * 0.08, len * 0.15, h * 0.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  if (pose === 'sit') {
    ctx.fillStyle = paint(coat, 0.08);
    ctx.beginPath();
    ctx.ellipse(-len * 0.28, -h * 0.14, len * 0.2, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    leg(len * 0.18, shoulder, swing * 0.2, 0);
  } else {
    leg(-len * 0.3, hip, swing, 0);
    leg(len * 0.42, shoulder, -swing, 0);
  }
  const lift = moving ? -h * 0.05 : 0;
  head(ctx, k, len * 0.52, shoulder - h * 0.42 + lift, headR, pale, coat, it, moving ? 0.15 : 0);
}

// Sitting and turned to look at us: both ears, the muzzle in the middle with the nose on
// it, the pale chest between two straight front legs, and the tail sweeping the ground
// behind him from side to side. The head tips a little to one side, and back.
function front(ctx, k, it, o) {
  const { h, t, paint } = k;
  const { coat, pale, headR, legW } = o;
  const breathe = Math.sin(t * 1.6) * h * 0.012;
  // The tail first, behind everything: it sweeps along the ground and shows past the hips.
  const sweep = Math.sin(t * o.wagSpeed * 0.7) * (it.wag ?? 0.55);
  ctx.strokeStyle = paint(coat, 0.12);
  ctx.lineWidth = Math.max(1.2, h * 0.1);
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.1);
  ctx.quadraticCurveTo(Math.sin(sweep) * h * 0.4, -h * 0.02, Math.sin(sweep) * h * 0.66, -h * 0.05 - Math.abs(Math.cos(sweep)) * h * 0.06);
  ctx.stroke();
  // The haunches, one each side, then the body sitting up.
  ctx.fillStyle = paint(coat, 0.1);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * h * 0.25, -h * 0.15, h * 0.17, h * 0.15, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = paint(coat);
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.5 + breathe, h * 0.25, h * (o.puppy ? 0.38 : 0.44), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = paint(pale, 0.04);
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.58 + breathe, h * 0.12, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  // Two straight front legs and pale paws.
  ctx.strokeStyle = paint(coat, 0.04);
  ctx.lineWidth = legW;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * h * 0.1, -h * 0.4);
    ctx.lineTo(side * h * 0.1, -legW * 0.5);
    ctx.stroke();
    ctx.fillStyle = paint(pale, 0.1);
    ctx.beginPath();
    ctx.ellipse(side * h * 0.11, -legW * 0.3, legW * 0.62, legW * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The head, tipped a little and back again, slowly.
  const r = headR * 1.05;
  ctx.save();
  ctx.translate(0, -h * 0.98 + breathe);
  ctx.rotate(0.06 + Math.sin(t * 0.7) * 0.14);
  if (it.collar !== false) {
    ctx.strokeStyle = paint(k.look.collar ?? '#2f8fa3');
    ctx.lineWidth = Math.max(1.2, h * 0.06);
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, r * 0.82);
    ctx.quadraticCurveTo(0, r * 1.12, r * 0.62, r * 0.82);
    ctx.stroke();
  }
  // Floppy ears both sides, each swinging on its own.
  ctx.fillStyle = paint(coat, 0.22);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * r * 0.86, r * 0.12, r * 0.3, r * 0.62, side * (0.32 + Math.sin(t * 2.2 + side) * 0.07), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = paint(coat);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // The muzzle in the middle, the nose on top of it: the only feature on the face.
  ctx.fillStyle = paint(pale);
  ctx.beginPath();
  ctx.ellipse(0, r * 0.45, r * 0.54, r * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  // A dog's nose from the front: wide on top, rounded to a point below.
  ctx.fillStyle = paint('#1c1612');
  ctx.beginPath();
  ctx.moveTo(-r * 0.24, r * 0.2);
  ctx.quadraticCurveTo(0, r * 0.1, r * 0.24, r * 0.2);
  ctx.quadraticCurveTo(r * 0.17, r * 0.38, 0, r * 0.42);
  ctx.quadraticCurveTo(-r * 0.17, r * 0.38, -r * 0.24, r * 0.2);
  ctx.fill();
  if (it.shoe) shoe(ctx, k, r * 0.15, r * 0.82, r, -0.1);
  ctx.restore();
}

// A small red trainer held by the heel: the sole, the toe cap and the laces.
function shoe(ctx, k, x, y, r, tilt) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.fillStyle = k.paint('#b8473a');
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.78, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = k.paint('#f1ece2', 0.05);
  ctx.fillRect(-r * 0.78, r * 0.12, r * 1.56, r * 0.14);
  ctx.beginPath();
  ctx.ellipse(r * 0.52, r * 0.02, r * 0.24, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = k.paint('#f1ece2', 0.1);
  ctx.lineWidth = Math.max(0.6, r * 0.06);
  for (const dx of [-0.1, 0.12]) {
    ctx.beginPath();
    ctx.moveTo(r * dx, -r * 0.22);
    ctx.lineTo(r * (dx + 0.08), -r * 0.04);
    ctx.stroke();
  }
  ctx.restore();
}

function head(ctx, k, x, y, r, pale, coat, it, tilt) {
  const { paint, h } = k;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt + Math.sin(k.t * 0.8) * 0.04);
  ctx.fillStyle = paint(coat);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // Snout, then the nose at its tip: the only feature on the face.
  ctx.fillStyle = paint(pale);
  ctx.beginPath();
  ctx.ellipse(r * 0.85, r * 0.3, r * 0.62, r * 0.42, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = paint('#1c1612');
  ctx.beginPath();
  ctx.ellipse(r * 1.42, r * 0.18, r * 0.17, r * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  if (it.shoe) shoe(ctx, k, r * 0.95, r * 0.78, r, 0.25);
  // A floppy ear that swings a little.
  ctx.fillStyle = paint(coat, 0.22);
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, r * 0.15, r * 0.3, r * 0.62, 0.35 + Math.sin(k.t * 2.2) * 0.08, 0, Math.PI * 2);
  ctx.fill();
  if (it.collar !== false) {
    ctx.strokeStyle = paint(k.look.collar ?? '#2f8fa3');
    ctx.lineWidth = Math.max(1.2, h * 0.06);
    ctx.beginPath();
    ctx.arc(-r * 0.15, r * 0.25, r * 0.95, 1.1, 2.3);
    ctx.stroke();
  }
  ctx.restore();
}

function tail(ctx, k, x, y, h, coat, wag, lift) {
  ctx.strokeStyle = k.paint(coat, 0.1);
  ctx.lineWidth = Math.max(1.2, h * 0.09);
  ctx.beginPath();
  ctx.moveTo(x, y);
  const a = -Math.PI * 0.75 + lift + wag;
  ctx.quadraticCurveTo(x - h * 0.2, y - h * 0.05, x + Math.cos(a) * h * 0.45, y + Math.sin(a) * h * 0.45);
  ctx.stroke();
}
