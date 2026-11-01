// art-room-life.js: the living things in the station room scene, all drawn each frame and
// all cheap: roe deer on the dune below the window (a doe, sometimes with her spotted
// fawn), moths round the lamp, and on the fog night a rescue boat towing a fishing boat
// home across the lagoon. The station cat has its own file, art-cat.js.
//
// Nothing here keeps state between frames except the moths' memory of the lamp (so they
// scatter when it goes out and drift back when it comes on). Everything else is worked out
// from t, so a scene that is shown again picks up where the clock says.
//
// Taps: the caller sets s.poked = { deer, fawn, cat } to the t of the tap; the doe lifts
// her head and looks at the window, the fawn hops.

import { css, mix, clamp, smooth, bump, glowSprite, stamp, mark, poly } from './art-kit.js';
import { limb } from './art-people.js';

// How many deer each look has unless the caller says (fog is too thick to see any).
const DEER = { calm: 1, fog: 0, clear: 2, storm: 2, evening: 2 };
const CYCLE = 50;

/**
 * Where the doe and fawn are and what they are doing at time t. Returns [] or
 * [{ u, face, step, head, look, hop, size, fawn }]: u across the column, face 1 right,
 * step the walk phase, head 1 down grazing, look 1 turned to the window.
 */
function herd(t, mood, count, poked) {
  if (!count || mood === 'fog') return [];
  const out = [];
  const pokeDoe = poked?.deer != null ? t - poked.deer : -1;
  const pokeFawn = poked?.fawn != null ? t - poked.fawn : -1;
  const doeReact = pokeDoe >= 0 && pokeDoe < 3.4 ? bump(pokeDoe, 0, 3.4, 0.35, 0.8) : 0;
  const fawnReact = pokeFawn >= 0 && pokeFawn < 2.6 ? bump(pokeFawn, 0, 2.6, 0.25, 0.7) : 0;
  const hop = pokeFawn >= 0 && pokeFawn < 0.5 ? Math.sin((pokeFawn / 0.5) * Math.PI) : 0;
  if (mood === 'storm') {
    // Sheltering under the pines on the right; only a flash shows them.
    out.push({ u: 0.865, face: -1, step: 0, head: 0.1, look: doeReact, hop: 0, fawn: false });
    if (count > 1) out.push({ u: 0.915, face: -1, step: 0, head: 0.3, look: fawnReact, hop, fawn: true });
    return out;
  }
  if (mood === 'evening') {
    // Walking off together along the dune, slowly, then over the crest and gone.
    const local = (t - 1.5) % 70;
    if (t < 1.5 || local > 46) return [];
    const p = clamp(local / 40);
    const u = 0.62 - 0.38 * p;
    const pause = Math.sin(local * 0.5) > 0.7 ? 0 : 1;
    const sink = smooth(clamp((local - 40) / 6));
    out.push({ u, face: -1, step: local * 2.2 * pause, head: 0.15 * (1 - pause), look: doeReact, hop: 0, sink, fawn: false });
    if (count > 1) out.push({ u: u + 0.07, face: -1, step: local * 2.6 * pause + 1, head: 0.3 * (1 - pause), look: fawnReact, hop, sink: smooth(clamp((local - 41) / 5)), fawn: true });
    return out;
  }
  // Calm and clear: they come in from behind the drawing, graze, look about, leave, return.
  if (t < 3) return [];
  const local = (t - 3) % CYCLE;
  let u;
  let face = 1;
  let moving = false;
  if (local < 6) {
    u = 0.2 + 0.24 * smooth(local / 6);
    moving = true;
  } else if (local < 38) {
    u = 0.44 + Math.sin(local * 0.07) * 0.015;
  } else if (local < 44) {
    u = 0.44 - 0.26 * smooth((local - 38) / 6);
    face = -1;
    moving = true;
  } else return [];
  const look = Math.max(bump(local, 12, 15.5), bump(local, 22, 24.5), bump(local, 30, 33.5) * 0.9);
  const grazing = moving ? 0 : 1 - look;
  out.push({
    u, face, step: moving ? local * 3.2 : 0,
    head: grazing * (1 - doeReact), look: Math.max(look * 0.5, doeReact), hop: 0, fawn: false,
  });
  if (count > 1) {
    const lag = local < 6 ? -0.07 : local >= 38 ? 0.07 : -0.06 + Math.sin(local * 0.21) * 0.025;
    const fawnHead = moving ? 0 : 0.5 + 0.5 * Math.sin(local * 0.9);
    out.push({ u: u + lag, face, step: moving ? local * 4 : 0, head: fawnHead * (1 - fawnReact), look: fawnReact * 0.6, hop, fawn: true });
  }
  return out;
}

/** Paints the deer (on the dune, outside the glass) and returns their tap areas. */
export function paintDeer(ctx, L, M, t, s, mood) {
  const count = mood === 'fog' ? 0 : s.deer ?? DEER[mood] ?? 0;
  const list = herd(t, mood, count, s.poked);
  if (!list.length) return {};
  const flash = clamp(s.flash ?? 0);
  const seen = mood === 'storm' ? smooth(clamp((flash - 0.25) / 0.45)) : 1;
  if (seen <= 0.01) return {};
  const hits = {};
  const lamp = clamp(s.lamp ?? 1);
  // The colours: dark animals lit a little by the night, warmly by dusk, white by lightning.
  const look = {
    calm: { body: '#2e2622', rim: '#c8a070', rimA: 0.35 + 0.25 * lamp, rump: '#8a8274' },
    clear: { body: '#2c2630', rim: '#c8ccf0', rimA: 0.45, rump: '#9a9aa8' },
    evening: { body: '#5a4034', rim: '#f0a878', rimA: 0.6, rump: '#d8c8b8' },
    storm: { body: '#14161e', rim: '#e8eeff', rimA: 0.95, rump: '#c8d0e0' },
  }[mood];
  // Only the part above the dune's crest shows, so walking over it they sink out of sight.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(L.colX, 0);
  for (let x = L.colX; x <= L.colX + L.colW; x += 4) ctx.lineTo(x, L.out.duneAt(x) + 3 * L.k);
  ctx.lineTo(L.colX + L.colW, 0);
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = seen;
  for (const d of list) {
    const size = (d.fawn ? 12 : 19) * L.k;
    const x = L.colX + d.u * L.colW;
    const ground = L.out.duneAt(x) + 3 * L.k + (d.sink ?? 0) * size * 1.8;
    const y = ground - d.hop * size * 0.35;
    deer(ctx, x, y, size, d, look, t);
    if (seen > 0.5 && (d.sink ?? 0) < 0.5) {
      const r = Math.max(22, size * 1.3);
      hits[d.fawn ? 'fawn' : 'deer'] = { x, y: y - size * 0.8, r };
      mark(d.fawn ? 'fawn' : 'doe', x - size, y - size * 1.6, size * 2, size * 1.6, 'room');
    }
  }
  ctx.restore();
  return hits;
}

/**
 * One roe deer side on, facing `d.face`: a compact body with the white rump patch roe
 * deer have, thin legs, a neck that lowers to graze, a short head and big ears. A fawn is
 * smaller, with white spots along its back. `d.look` turns the head toward the window.
 */
function deer(ctx, x, y, S, d, c, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(d.face, 1);
  const body = css(c.body);
  const far = css(mix(c.body, '#000000', 0.35));
  const legW = Math.max(1, S * 0.075);
  // Legs: far pair darker; each swings with the walk.
  const leg = (bx, phase, color) => {
    const swing = Math.sin(d.step + phase) * S * 0.12;
    const knee = [bx + swing * 0.5, -S * 0.32];
    limb(ctx, [bx, -S * 0.62], knee, legW * 1.4, legW, color);
    limb(ctx, knee, [bx + swing, 0], legW, legW * 0.8, color);
  };
  leg(S * 0.36, Math.PI, far);
  leg(-S * 0.4, 0, far);
  // Body.
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -S * 0.78, S * 0.6, S * 0.24, -0.04, 0, Math.PI * 2);
  ctx.fill();
  leg(S * 0.42, 0, body);
  leg(-S * 0.36, Math.PI, body);
  // The white rump patch.
  ctx.fillStyle = css(c.rump);
  ctx.beginPath();
  ctx.ellipse(-S * 0.56, -S * 0.8, S * 0.09, S * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Neck and head: up and alert, or down to the grass.
  const down = d.head;
  const headX = S * (0.78 + 0.05 * down);
  const headY = -S * (1.42 - 1.22 * down);
  const neckBase = [S * 0.4, -S * 0.86];
  limb(ctx, neckBase, [headX - S * 0.06, headY + S * 0.06], S * 0.22, S * 0.13, body);
  const turn = clamp(d.look);
  const len = S * (0.24 - 0.12 * turn);
  const ang = 0.35 + down * 1.0 - turn * 0.2;
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(ang);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(len * 0.4, 0, len * 0.7, S * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(mix(c.body, '#000000', 0.5));
  ctx.beginPath();
  ctx.arc(len * 0.98, S * 0.01, S * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Ears: back and up; turned to the window, both show, spread.
  ctx.fillStyle = body;
  const ear = (rot, dx) => {
    ctx.save();
    ctx.translate(dx, -S * 0.06);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, -S * 0.1, S * 0.055, S * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  ear(-0.9 - turn * 0.5, -len * 0.05);
  if (turn > 0.2) ear(-0.2 + turn * 0.3, len * 0.1);
  ctx.restore();
  // A lit edge along the back, from whatever light there is.
  ctx.strokeStyle = css(c.rim, c.rimA);
  ctx.lineWidth = Math.max(0.8, S * 0.05);
  ctx.beginPath();
  ctx.ellipse(0, -S * 0.78, S * 0.6, S * 0.24, -0.04, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  if (d.fawn) {
    ctx.fillStyle = css('#e8e0d0', 0.75);
    for (const [sx, sy] of [[-0.3, -0.9], [-0.1, -0.94], [0.1, -0.93], [0.28, -0.88], [-0.2, -0.78], [0.02, -0.8], [0.2, -0.76]]) {
      ctx.beginPath();
      ctx.arc(S * sx, S * sy, Math.max(0.6, S * 0.035), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

let mothLamp = 1;
let mothT = null;

/**
 * Moths round the lamp on calm and clear nights. They follow a slow memory of the lamp:
 * when it goes out they spread wide and fade, and when it comes on they drift back.
 */
export function paintMoths(ctx, L, t, s, mood) {
  if (mood !== 'calm' && mood !== 'clear') return;
  const lamp = clamp(s.lamp ?? 1);
  const dt = mothT == null ? 1 : clamp(t - mothT, 0, 0.1);
  mothT = t;
  mothLamp += (lamp - mothLamp) * Math.min(1, dt * (lamp > mothLamp ? 0.6 : 2.5));
  const near = mothLamp;
  if (near < 0.03) return;
  const [mx, my] = L.lamp.mouth;
  ctx.fillStyle = css('#f6ead0', 0.7 * Math.sqrt(near));
  for (let i = 0; i < 3; i++) {
    const r = (12 + i * 7) * L.k * (1 + 3.5 * (1 - near));
    const a = t * (2.1 + i * 0.7) * (i % 2 ? -1 : 1) + i * 2.1 + Math.sin(t * 3.3 + i) * 0.6;
    const x = mx - 6 * L.k + Math.cos(a) * r;
    const y = my - 10 * L.k + Math.sin(a) * r * 0.55 + Math.sin(t * 5 + i) * 2;
    // One pale fleck whose wings blur as they beat: wider, then narrow.
    const flap = 0.35 + 0.65 * Math.abs(Math.sin(t * 26 + i * 1.7));
    ctx.beginPath();
    ctx.ellipse(x, y, (0.8 + 1.6 * flap) * L.k, 0.9 * L.k, Math.sin(a) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * The fog night's tow: a rescue boat with a blue flashing light and a white masthead light,
 * towing a fishing boat with one white light, across the lagoon toward the town as s.tow
 * goes from 0 to 1. In the fog they are mostly their lights, haloed.
 */
export function paintTow(ctx, L, t, s, mood) {
  if (mood !== 'fog' || typeof s.tow !== 'number') return;
  const G = L.glass;
  const p = clamp(s.tow);
  const y = L.out.shoreY + G.h * 0.075;
  const x = G.x + G.w * (0.06 + 0.32 * p);
  const back = x - G.w * 0.075;
  const k = L.k;
  const bob = (o) => Math.sin(t * 1.4 + o) * 0.8;
  // Hulls, faint shapes in the fog.
  ctx.fillStyle = css('#3a4642', 0.55);
  poly(ctx, [[x - 9 * k, y + bob(0)], [x + 10 * k, y + bob(0)], [x + 7 * k, y + 3 * k + bob(0)], [x - 8 * k, y + 3 * k + bob(0)]]);
  ctx.fill();
  ctx.fillRect(x - 3 * k, y - 4 * k + bob(0), 6 * k, 4 * k);
  poly(ctx, [[back - 7 * k, y + 0.5 + bob(1)], [back + 7 * k, y + 0.5 + bob(1)], [back + 5 * k, y + 3 * k + bob(1)], [back - 6 * k, y + 3 * k + bob(1)]]);
  ctx.fill();
  ctx.strokeStyle = css('#3a4642', 0.4);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - 9 * k, y + 1 + bob(0));
  ctx.quadraticCurveTo((x + back) / 2, y + 3 * k, back + 7 * k, y + 1 + bob(1));
  ctx.stroke();
  const white = glowSprite('#fff4e0');
  stamp(ctx, white, x + 1 * k, y - 7 * k + bob(0), 14 * k, 0.45);
  stamp(ctx, white, back, y - 4 * k + bob(1), 12 * k, 0.4);
  ctx.fillStyle = css('#fffaf0', 0.9);
  ctx.fillRect(x + 0.5 * k, y - 7.5 * k + bob(0), 1.4, 1.4);
  ctx.fillRect(back - 0.5, y - 4.5 * k + bob(1), 1.4, 1.4);
  // The blue light: two quick flashes, then a pause, as rescue boats flash.
  const ph = t % 1.6;
  const on = ph < 0.12 || (ph > 0.28 && ph < 0.4) ? 1 : 0;
  if (on) {
    stamp(ctx, glowSprite('#4a8cff'), x - 2 * k, y - 9 * k + bob(0), 26 * k, 0.75);
    ctx.fillStyle = css('#cfe0ff');
    ctx.fillRect(x - 2.5 * k, y - 9.5 * k + bob(0), 1.6, 1.6);
  }
  mark('tow boats', back - 8 * k, y - 10 * k, x - back + 20 * k, 14 * k, 'room');
}

/** The lamp's light spilling out of the window onto the dune below. */
export function windowSpill(ctx, L, lamp) {
  if (lamp < 0.02) return;
  stamp(ctx, glowSprite('#ffb870'), L.U(0.5), L.sillY + 6 * L.k, L.colW * 0.45, 0.07 * lamp);
}
