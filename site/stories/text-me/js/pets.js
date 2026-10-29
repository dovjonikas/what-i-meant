// pets.js: the family dog. Drawn like the people: flat, lit from one side, and with no face
// beyond a nose, so the body does the talking: the tail wags faster when you come home,
// the legs run, the ears flop, and an old dog's muzzle goes grey and his tail slows.
//
// drawDog(ctx, it, k) is called by people.js for a person whose `who` is 'dog'. `it.h` is
// the dog's height at the shoulder (a column-width fraction, like a person's height).
// Poses: stand, sit, lie. Age: 'puppy', 'adult', 'old'.

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
  const leg = (x, y0, dx, dark) => {
    ctx.strokeStyle = paint(coat, dark);
    ctx.lineWidth = legW;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x + dx, -legW * 0.5);
    ctx.stroke();
  };

  if (pose === 'lie') {
    // Lying down, head on the front paws.
    ctx.fillStyle = paint(coat, 0.05);
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.28, len * 0.6, h * 0.28, 0, 0, Math.PI * 2);
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
  // A floppy ear that swings a little.
  ctx.fillStyle = paint(coat, 0.22);
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, r * 0.15, r * 0.3, r * 0.62, 0.35 + Math.sin(k.t * 2.2) * 0.08, 0, Math.PI * 2);
  ctx.fill();
  if (it.collar !== false) {
    ctx.strokeStyle = paint(k.look.collar ?? '#c8333a');
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
