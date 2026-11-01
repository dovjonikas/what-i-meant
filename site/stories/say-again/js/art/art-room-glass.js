// art-room-glass.js: the station window's glass, between the view and the room: a faint
// sheen and a few specks of dust so it reads as glass and not as a hole in the wall,
// raindrops resting on it and running down it, condensation misting the bottom of each
// pane on the fog night with clear trails where drops have run, and the lamp's reflection.
// The still parts are painted once per look into a cached layer; art-room.js calls
// glassEffects every frame and only the running drops and the reflection are new.

import { cachedLayer, put, glowSprite, stamp, css, rng } from './art-kit.js';

let trail = null;

/** The wet trail behind a sliding drop: clear at the top, brightest at the drop. Made once. */
function trailSprite() {
  if (trail) return trail;
  trail = document.createElement('canvas');
  trail.width = 2;
  trail.height = 32;
  const g = trail.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 32);
  v.addColorStop(0, css('#cfe0ff', 0));
  v.addColorStop(1, css('#cfe0ff', 1));
  g.fillStyle = v;
  g.fillRect(0, 0, 2, 32);
  return trail;
}

/** The glass and what is on it, drawn over the view. */
export function glassEffects(ctx, L, M, t, view, dpr, mood, lamp) {
  const layer = cachedLayer(`room-glass-${mood}`, view, dpr, (c) => paintGlass(c, L, M, mood));
  put(ctx, layer, view);
  if (mood === 'calm' || mood === 'storm') {
    // Drops sliding down the glass: slow ones in light rain, quick streams in the storm.
    const storm = mood === 'storm';
    const rand = rng(storm ? 61 : 29);
    const count = storm ? 18 : 6;
    for (let i = 0; i < count; i++) {
      const pane = L.panes[Math.floor(rand() * L.panes.length)];
      const x = pane.x + 3 + rand() * (pane.w - 6);
      const speed = storm ? 40 + rand() * 60 : 5 + rand() * 7;
      const y = pane.y + ((rand() * 400 + t * speed) % (pane.h + 30)) - 15;
      const r = (storm ? 0.9 : 1.5) * L.k + rand() * 0.8;
      const tail = (storm ? 30 : 7) * L.k;
      ctx.globalAlpha = storm ? 0.22 : 0.12;
      ctx.drawImage(trailSprite(), x - 0.5, y - tail, 1, tail);
      ctx.globalAlpha = 1;
      ctx.fillStyle = css('#dfe8ff', storm ? 0.3 : 0.45);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (lamp > 0.01) {
    // The lit lamp shows faintly in the dark glass.
    const p = L.lamp;
    stamp(ctx, glowSprite('#ffc070'), p.mouth[0] - 8 * L.k, p.mouth[1] - 4 * L.k, 34 * L.k, 0.16 * lamp);
  }
}

/** Everything still on the glass, pane by pane, painted once per look. */
function paintGlass(c, L, M, mood) {
  const rand = rng(M.rain === 'streaks' ? 71 : 37);
  for (const p of L.panes) {
    c.save();
    c.beginPath();
    c.rect(p.x, p.y, p.w, p.h);
    c.clip();
    sheen(c, p);
    dust(c, p, L, rand);
    if (mood === 'fog') condensation(c, p, L, rand);
    if (M.rain) drops(c, p, L, M, rand);
    c.restore();
  }
}

/** Two faint slanting bands of light: the way a dark window shows it is glass. */
function sheen(c, p) {
  const slant = p.h * 0.32;
  for (const [u0, u1, a] of [[0.56, 0.66, 0.03], [0.7, 0.725, 0.022]]) {
    c.fillStyle = css('#dfe8ff', a);
    c.beginPath();
    c.moveTo(p.x + p.w * u0, p.y);
    c.lineTo(p.x + p.w * u1, p.y);
    c.lineTo(p.x + p.w * u1 - slant, p.y + p.h);
    c.lineTo(p.x + p.w * u0 - slant, p.y + p.h);
    c.closePath();
    c.fill();
  }
}

/** Specks of dust and salt, and a soft smudge low down where a hand opens the window. */
function dust(c, p, L, rand) {
  const n = Math.round((p.w * p.h) / 2600);
  for (let i = 0; i < n; i++) {
    c.fillStyle = css('#e8eeff', 0.05 + rand() * 0.11);
    const s = 0.6 + rand() * 0.5;
    c.fillRect(p.x + rand() * p.w, p.y + rand() * p.h, s, s);
  }
  for (let i = 0; i < 2; i++) {
    const x = p.x + p.w * (0.15 + rand() * 0.7);
    const y = p.y + p.h * (0.62 + rand() * 0.3);
    const r = (8 + rand() * 8) * L.k;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, css('#dfe8ff', 0.035));
    g.addColorStop(1, css('#dfe8ff', 0));
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

/**
 * The fog night's damp: mist on the inside of the glass, thickest at the bottom, beaded
 * with tiny drops, and clear trails where a few drops have run down through it.
 */
function condensation(c, p, L, rand) {
  const top = p.y + p.h * 0.74;
  const mist = c.createLinearGradient(0, top, 0, p.y + p.h);
  mist.addColorStop(0, css('#cbd8d4', 0));
  mist.addColorStop(0.6, css('#cbd8d4', 0.12));
  mist.addColorStop(1, css('#cbd8d4', 0.24));
  c.fillStyle = mist;
  c.fillRect(p.x, top, p.w, p.y + p.h - top);
  const n = Math.round(p.w * 1.1);
  for (let i = 0; i < n; i++) {
    const y = top + (p.y + p.h - top) * (1 - rand() ** 1.8);
    const r = (0.35 + rand() * 0.5) * L.k;
    c.fillStyle = css('#e8f0ee', 0.1 + rand() * 0.1);
    c.beginPath();
    c.arc(p.x + rand() * p.w, y, r, 0, Math.PI * 2);
    c.fill();
  }
  // A few drops have run down and wiped a line through the mist on their way; none in the
  // middle, where the binoculars on the sill would make them look like a strap.
  const spots = [0.14, 0.31, 0.72, 0.88];
  for (const u of spots) {
    const x = p.x + p.w * (u + (rand() - 0.5) * 0.05);
    const y0 = top + (p.y + p.h - top) * (0.1 + rand() * 0.3);
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.strokeStyle = css('#000000', 0.45);
    c.lineWidth = 1.3 * L.k;
    c.beginPath();
    c.moveTo(x, y0);
    let xx = x;
    for (let y = y0; y < p.y + p.h; y += 3) {
      xx += (rand() - 0.5) * 0.8;
      c.lineTo(xx, y);
    }
    c.stroke();
    c.restore();
    c.fillStyle = css('#e8f0ee', 0.3);
    c.beginPath();
    c.arc(xx, p.y + p.h - 1.5 * L.k, 1.3 * L.k, 0, Math.PI * 2);
    c.fill();
  }
}

/** Raindrops resting on the glass, or in the storm water running down in crooked lines. */
function drops(c, p, L, M, rand) {
  const storm = M.rain === 'streaks';
  const n = Math.round((p.w * p.h) / (storm ? 900 : 2200));
  for (let i = 0; i < n; i++) {
    const x = p.x + rand() * p.w;
    // More drops low on the glass, where they gather.
    const y = p.y + p.h * (1 - rand() ** 1.6);
    const r = (0.7 + rand() ** 2 * 2.4) * L.k;
    if (storm && rand() < 0.4) {
      c.strokeStyle = css('#b8cae8', 0.18);
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(x, y);
      let yy = y;
      let xx = x;
      while (yy < Math.min(p.y + p.h, y + 40 + rand() * 80)) {
        yy += 4;
        xx += (rand() - 0.5) * 1.6;
        c.lineTo(xx, yy);
      }
      c.stroke();
      continue;
    }
    // A drop is a little lens: dark rim below, the sky's light inside, one bright point.
    c.fillStyle = css('#050a16', 0.22);
    c.beginPath();
    c.ellipse(x, y + r * 0.25, r, r * 1.05, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = css('#8aa0c8', 0.13);
    c.beginPath();
    c.ellipse(x, y, r * 0.85, r * 0.9, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = css('#e8f0ff', 0.32);
    c.fillRect(x - r * 0.4, y - r * 0.45, Math.max(0.5, r * 0.35), Math.max(0.5, r * 0.35));
  }
}
