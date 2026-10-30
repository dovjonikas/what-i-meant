// fx.js: the things in a scene that move: the people, twinkling stars, birds, clouds,
// chimney smoke, falling leaves, a car's rear lights going down the road, snow, rain,
// fireflies, a fire's light, sparks, glints on water, trees going past a car. Everything else in a scene is a still painting (painter.js), which keeps phones cool.
//
// A scene lists its effects as { kind, at, ... }. `at` is the painted layer the effect sits
// just in front of (0 far, 1 middle, 2 near; 2 by default), so stars can stay behind the
// hills while snow falls in front of everything.

import { rng } from './util.js';
import { makePen } from './painter.js';
import { drawPerson, markOf } from './people.js';
import { NAMES } from './names.js';

// Who is who: as a scene comes in, each person you know gets their name (names.js) above
// them for a few seconds, in their own colour, then it fades. People passing through get none.
export { setName } from './names.js';
const NAME_IN = 0.5;
const NAME_HOLD = 3.4;
const NAME_OUT = 1.2;

/**
 * Builds the effects for one scene. Returns { canvases: {0?, 1?, 2?}, start(), stop() };
 * the stage puts each canvas in the layer of the same number. People are drawn here too
 * (kind 'person'), so they can breathe and wave; their layers keep the full pixel ratio.
 * `t0` is how long the scene has already been on screen.
 */
export function createFx(items = [], view, scene, progress = () => 0, t0 = 0, cues = () => undefined) {
  const pen = makePen(scene, view);
  const sharp = new Set(items.filter((it) => it.kind === 'person').map((it) => it.at ?? 2));
  const cssW = view.w + view.margin * 2;
  const slots = {};
  const live = [];
  const pos = {
    X: (u) => view.margin + view.colX + u * view.colW,
    Y: (v) => v * view.h,
    S: (s) => s * view.colW,
    w: cssW,
    h: view.h,
    col: [view.margin + view.colX, view.margin + view.colX + view.colW],
  };
  items.forEach((it, i) => {
    const at = it.at ?? 2;
    if (!slots[at]) {
      const dpr = sharp.has(at) ? view.dpr : Math.min(view.dpr, 1.5);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(view.h * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${view.h}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      slots[at] = { canvas, ctx, list: [] };
    }
    const kind = KINDS[it.kind];
    if (!kind) throw new Error(`Unknown effect: ${it.kind}`);
    const state = kind.init(it, pos, rng(1000 + i * 77), pen, progress, cues);
    slots[at].list.push({ kind, it, state });
  });
  for (const s of Object.values(slots)) live.push(s);

  let raf = 0;
  let last = 0;
  let t = t0; // seconds since the scene first appeared, so a repaint carries on
  const frame = (now) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    for (const s of live) {
      s.ctx.clearRect(0, 0, cssW, view.h);
      for (const e of s.list) e.kind.draw(s.ctx, e.state, t, dt, e.it, pos);
    }
    raf = requestAnimationFrame(frame);
  };

  return {
    canvases: Object.fromEntries(Object.entries(slots).map(([k, s]) => [k, s.canvas])),
    start() {
      if (!raf && live.length) raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    },
    /** The scene's own clock, in seconds: what a cue (stage.cue) is timed against. */
    now() {
      return t;
    },
  };
}

/** Smoothstep: 0 to 1 with a gentle start and end. */
function smooth(k) {
  return k * k * (3 - 2 * k);
}

/**
 * Eases the changes in how somebody stands, so nothing snaps: the arms move from the old
 * pose to the new one, the bend and crouch settle, and turning round passes through side on.
 */
function settle(s, who, t, dt) {
  const ease = (key, target, rate) => (s[key] = s[key] === undefined ? target : s[key] + (target - s[key]) * (1 - Math.exp(-dt * rate)));
  const pose = who.pose ?? 'stand';
  if (pose !== s.pose) {
    s.poseFrom = s.pose;
    s.poseAt = t;
    s.pose = pose;
  }
  const k = Math.min(1, (t - s.poseAt) / 0.45);
  const rest = pose === 'sit' ? 0.05 : who.age === 'old' ? 0.2 : pose === 'phone' ? 0.07 : 0;
  return {
    ...who,
    poseFrom: k < 1 ? s.poseFrom : undefined,
    poseK: smooth(k),
    bend: ease('bend', who.bend ?? rest, 7),
    squat: ease('squat', who.squat ?? 0, 7),
    flip: ease('flip', who.face ?? 1, 14),
  };
}

/** The name over a person's head for the first seconds of a scene (see NAMES). */
function nameTag(ctx, who, t, p) {
  const name = who.name ?? NAMES[who.who];
  if (!name || who.nameless) return;
  const k = t < NAME_IN ? t / NAME_IN : t < NAME_IN + NAME_HOLD ? 1 : 1 - (t - NAME_IN - NAME_HOLD) / NAME_OUT;
  if (k <= 0) return;
  const tall = who.who === 'dog' ? (who.pose === 'lie' ? 0.8 : 1.3) : who.pose === 'sit' ? 0.8 : who.pose === 'bike' ? 1.15 : 1.02;
  const y = p.Y(who.y) - p.S(who.h) * tall - 9;
  ctx.font = '600 12px Recursive, system-ui, sans-serif';
  const half = ctx.measureText(name).width / 2;
  const x = Math.min(p.col[1] - half - 6, Math.max(p.col[0] + half + 6, p.X(who.x)));
  ctx.save();
  ctx.globalAlpha *= k;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgb(12 12 22 / 0.6)';
  ctx.strokeText(name, x, y);
  ctx.fillStyle = mixName(markOf(who.who));
  ctx.fillText(name, x, y);
  ctx.restore();
}

/** A person's colour lifted toward paper, so a small name reads on a dark halo. */
function mixName(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (246 - v) * 0.45));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

function dot(ctx, x, y, r, css) {
  ctx.fillStyle = css;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const KINDS = {
  // A person, breathing and shifting weight. A person with a `track` moves along it:
  // [[x, y, h], ...] from start to end, driven by `progress` (how far the player has held,
  // 0 to 1) or, with `seconds`, by time (`loop` repeats it). `poses` changes the pose:
  // [[at, pose, {fields}], ...]. Legs walk, run or pedal by the distance covered. `ghost`
  // (seconds) makes them a memory that fades away.
  //
  // `acts` is what somebody does when the story reaches a line: a beat with `act: 'name'`
  // starts every act with `on: 'name'` (its fields replace theirs; a `track` plays on the
  // act's own clock, starting from wherever they are). Somebody `hidden` is not there until
  // their first act, and fades in with it. `tagOn` shows the name again at that cue.
  // Changes of pose, bend, crouch (`squat`) and the way they face are eased, never snapped.
  person: {
    init(it, p, r, pen, progress, cues) {
      return { pen, progress, cues, step: 0, last: null, until: 0 };
    },
    draw(ctx, s, t, dt, it, p) {
      let who = it.person;
      let clock = t - (who.delay ?? 0);
      if (who.acts) {
        let act = null;
        let at = -Infinity;
        for (const a of who.acts) {
          const c = s.cues(a.on);
          if (c !== undefined && c >= at) [act, at] = [a, c];
        }
        if (!act && who.hidden) return;
        if (act !== s.act) {
          s.act = act;
          s.from = s.here;
          if (who.hidden && s.shown === undefined) s.shown = at;
        }
        if (act) {
          who = { ...who, loop: false, track: null, poses: null, ...act };
          clock = t - at;
          if (!who.track && s.from) who = { ...who, x: s.from[0], y: s.from[1], h: s.from[2] };
        }
      }
      if (who.track) {
        const raw = who.seconds ? clock / who.seconds : s.progress();
        // A `loop` track (a puppy running circles) starts over; others stop at the end.
        const k = who.loop ? raw - Math.floor(raw) : Math.min(1, Math.max(0, raw));
        let [x, y, h] = along(who.track, k);
        // An act's path begins where the person already stood and eases onto its own.
        if (s.act && s.from) {
          const w = 1 - smooth(Math.min(1, clock / 0.6));
          const [x0, y0, h0] = who.track[0];
          x += (s.from[0] - x0) * w;
          y += (s.from[1] - y0) * w;
          h += (s.from[2] - h0) * w;
        }
        who = { ...who, x, y, h };
        for (const [at, pose, extra] of who.poses ?? []) if (k >= at) who = { ...who, pose, ...extra };
        if (s.last) {
          const dx = p.X(x) - p.X(s.last[0]);
          const d = Math.hypot(dx, p.Y(y) - p.Y(s.last[1]));
          // `turn`: face the way they are going (a dog running a lap).
          if (who.turn && Math.abs(dx) > 0.3) s.face = dx > 0 ? 1 : -1;
          s.step += d / Math.max(4, p.S(h) * 0.16);
          if (d > 0.02) s.until = t + 0.25;
        }
        s.last = [x, y];
        if (who.turn && s.face) who = { ...who, face: s.face };
      }
      s.here = [who.x, who.y, who.h];
      who = settle(s, who, t, dt);
      const shown = s.shown ?? 0;
      const tagged = who.tagOn === undefined ? undefined : s.cues(who.tagOn);
      const tagT = tagged === undefined ? t - shown : t - tagged;
      // A `ghost` is a memory of somebody: drawn faint, and gone `ghost` seconds after a
      // short look.
      const fade = who.ghost ? 0.55 * Math.max(0, 1 - Math.max(0, t - 1.5) / who.ghost) : Math.min(1, (t - shown) / 0.6);
      if (fade <= 0) return;
      ctx.save();
      ctx.globalAlpha = fade;
      drawPerson(ctx, who, s.pen, t, s.step, t < s.until);
      nameTag(ctx, who, tagT, p);
      ctx.restore();
    },
  },

  // Flat clouds drifting slowly across the sky.
  clouds: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 3 }, () => ({
        x: r() * p.w, y: p.Y((it.top ?? 0.08) + r() * ((it.bottom ?? 0.3) - (it.top ?? 0.08))), w: p.S(0.25 + r() * 0.3), sp: 3 + r() * 5, r,
      }));
    },
    draw(ctx, list, t, dt, it, p) {
      ctx.fillStyle = it.color ?? 'rgb(255 255 255 / 0.35)';
      for (const c of list) {
        c.x += c.sp * dt;
        if (c.x - c.w > p.w) c.x = -c.w;
        const h = c.w * 0.22;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w / 2, h * 0.45, 0, Math.PI, 0);
        ctx.ellipse(c.x - c.w * 0.18, c.y - h * 0.25, c.w * 0.2, h * 0.55, 0, Math.PI, 0);
        ctx.ellipse(c.x + c.w * 0.12, c.y - h * 0.35, c.w * 0.24, h * 0.7, 0, Math.PI, 0);
        ctx.fill();
      }
    },
  },

  // Autumn leaves falling and turning over.
  leaves: {
    init(it, p, r) {
      const colors = it.colors ?? ['#c4552b', '#e39a3b', '#b5502a', '#d98a34'];
      return Array.from({ length: it.count ?? 18 }, () => ({
        x: r() * p.w, y: r() * p.h, s: 2.5 + r() * 3, sp: 14 + r() * 18, ph: r() * 6, c: colors[Math.floor(r() * colors.length)],
      }));
    },
    draw(ctx, list, t, dt, it, p) {
      for (const l of list) {
        l.y += l.sp * dt;
        l.x += Math.sin(t * 1.3 + l.ph) * 18 * dt - 6 * dt;
        if (l.y > p.h + 10) {
          l.y = -10;
          l.x = Math.random() * p.w;
        }
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(t * 2 + l.ph);
        ctx.scale(1, Math.cos(t * 3 + l.ph));
        ctx.fillStyle = l.c;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.s, l.s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
  },

  // Specks of light floating in warm air: pollen, dust in sun.
  motes: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 22 }, () => ({ x: r() * p.w, y: p.Y(0.3 + r() * 0.6), ph: r() * 6, sp: 0.3 + r() * 0.6 }));
    },
    draw(ctx, list, t, dt) {
      for (const m of list) {
        m.y -= m.sp * 4 * dt;
        m.x += Math.sin(t * m.sp + m.ph) * 6 * dt;
        const a = 0.25 + 0.35 * Math.sin(t * 1.5 + m.ph) ** 2;
        dot(ctx, m.x, m.y, 1.2, `rgb(255 240 200 / ${a})`);
        if (m.y < 0) m.y = 900;
      }
    },
  },

  // A fire's light breathing on everything near it. `rgb`, `alpha` and `pace` make it
  // something else that flickers, like a phone screen in a dark window.
  firelight: {
    init() {
      return {};
    },
    draw(ctx, s, t, dt, it, p) {
      const q = t * (it.pace ?? 1);
      const k = 0.5 + 0.25 * Math.sin(q * 9) + 0.15 * Math.sin(q * 23 + 1) + 0.1 * Math.sin(q * 4.3);
      const x = p.X(it.x);
      const y = p.Y(it.y);
      const r = p.S(it.r ?? 0.35);
      const rgb = it.rgb ?? '255 150 70';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgb(${rgb} / ${(it.alpha ?? 0.22) * k})`);
      g.addColorStop(1, `rgb(${rgb} / 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    },
  },

  // Trees and posts sliding past, for a moving car: the moon stays, the world goes by.
  passing: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 6 }, (_, i) => ({ x: (i / (it.count ?? 6)) * p.w * 1.4, h: p.S(0.12 + r() * 0.22), w: 0.3 + r() * 0.1, r }));
    },
    draw(ctx, list, t, dt, it, p) {
      ctx.fillStyle = it.color ?? '#070b18';
      const y = p.Y(it.y ?? 0.75);
      for (const tr of list) {
        tr.x -= (it.speed ?? 160) * dt;
        if (tr.x < -60) tr.x = p.w + 40 + Math.random() * 80;
        ctx.beginPath();
        ctx.moveTo(tr.x, y - tr.h);
        ctx.lineTo(tr.x + tr.h * tr.w * 0.5, y);
        ctx.lineTo(tr.x - tr.h * tr.w * 0.5, y);
        ctx.closePath();
        ctx.fill();
      }
    },
  },

  stars: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 26 }, () => ({
        x: r() * p.w, y: p.Y((it.top ?? 0) + r() * ((it.bottom ?? 0.42) - (it.top ?? 0))), ph: r() * 6.3, sp: 0.6 + r() * 1.6,
      }));
    },
    draw(ctx, stars, t) {
      for (const s of stars) {
        const a = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        dot(ctx, s.x, s.y, 0.6 + a * 0.7, `rgb(255 255 255 / ${0.15 + a * 0.75})`);
      }
    },
  },

  // Two red lights following a curve away from the viewer, smaller as they go, once.
  taillights: {
    init(it) {
      return { path: it.path, delay: it.delay ?? 0, run: it.seconds ?? 11 };
    },
    draw(ctx, s, t, dt, it, p) {
      const k = (t - s.delay) / s.run;
      if (k < 0 || k > 1) return;
      const [u, v] = curve(s.path, easeOut(k));
      const x = p.X(u);
      const y = p.Y(v);
      const size = p.S(0.012) * (1 - k * 0.8);
      const alpha = k > 0.85 ? (1 - k) / 0.15 : 1;
      for (const dx of [-size * 1.6, size * 1.6]) {
        const g = ctx.createRadialGradient(x + dx, y, 0, x + dx, y, size * 5);
        g.addColorStop(0, `rgb(255 70 50 / ${0.55 * alpha})`);
        g.addColorStop(1, 'rgb(255 70 50 / 0)');
        ctx.fillStyle = g;
        ctx.fillRect(x + dx - size * 5, y - size * 5, size * 10, size * 10);
        dot(ctx, x + dx, y, size * 0.8, `rgb(255 120 100 / ${alpha})`);
      }
    },
  },

  birds: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 3 }, (_, i) => ({
        x: -p.S(0.1) - i * p.S(0.07) - r() * p.S(0.1), y: p.Y((it.y ?? 0.25) + r() * 0.08), sp: p.S(0.035 + r() * 0.015), ph: r() * 6,
      }));
    },
    draw(ctx, birds, t, dt, it, p) {
      ctx.strokeStyle = it.color ?? 'rgb(40 30 50 / 0.7)';
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      for (const b of birds) {
        b.x += b.sp * dt;
        if (b.x > p.w + 20) b.x = -p.S(0.3);
        const flap = Math.sin(t * 7 + b.ph) * 3;
        const y = b.y + Math.sin(t * 0.8 + b.ph) * 3;
        ctx.beginPath();
        ctx.moveTo(b.x - 5, y - flap);
        ctx.quadraticCurveTo(b.x - 2, y - 1, b.x, y);
        ctx.quadraticCurveTo(b.x + 2, y - 1, b.x + 5, y - flap);
        ctx.stroke();
      }
    },
  },

  smoke: {
    init(it, p, r) {
      return { puffs: Array.from({ length: 9 }, (_, i) => ({ age: i * 0.9, ox: r() })), r };
    },
    draw(ctx, s, t, dt, it, p) {
      for (const puff of s.puffs) {
        puff.age += dt;
        if (puff.age > 8) {
          puff.age = 0;
          puff.ox = s.r();
        }
        const k = puff.age / 8;
        const x = p.X(it.x) + k * p.S(0.12) + Math.sin(k * 5 + puff.ox * 6) * p.S(0.01);
        const y = p.Y(it.y) - k * p.S(0.28);
        dot(ctx, x, y, p.S(0.008 + k * 0.03), `${it.color ?? 'rgb(240 230 235'} / ${0.28 * (1 - k)})`);
      }
    },
  },

  snow: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 90 }, () => ({ x: r() * p.w, y: r() * p.h, s: 0.6 + r() * 1.8, ph: r() * 6 }));
    },
    draw(ctx, flakes, t, dt, it, p) {
      for (const f of flakes) {
        f.y += (12 + f.s * 14) * dt;
        f.x += Math.sin(t * 0.7 + f.ph) * 8 * dt;
        if (f.y > p.h) {
          f.y = -4;
          f.x = Math.random() * p.w;
        }
        dot(ctx, f.x, f.y, f.s, `rgb(255 255 255 / ${0.35 + f.s * 0.25})`);
      }
    },
  },

  rain: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 120 }, () => ({ x: r() * p.w, y: r() * p.h, l: 8 + r() * 14, v: 500 + r() * 300 }));
    },
    draw(ctx, drops, t, dt, it, p) {
      ctx.strokeStyle = it.color ?? 'rgb(170 190 230 / 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        d.y += d.v * dt;
        d.x -= d.v * 0.12 * dt;
        if (d.y > p.h) {
          d.y = -d.l;
          d.x = Math.random() * (p.w + 60);
        }
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.l * 0.12, d.y - d.l);
      }
      ctx.stroke();
    },
  },

  fireflies: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 14 }, () => ({
        x: p.X(r() * 1.1 - 0.05), y: p.Y((it.top ?? 0.65) + r() * ((it.bottom ?? 0.9) - (it.top ?? 0.65))), ph: r() * 6, sp: 0.5 + r(),
      }));
    },
    draw(ctx, flies, t, dt) {
      for (const f of flies) {
        f.x += Math.sin(t * f.sp + f.ph) * 10 * dt;
        f.y += Math.cos(t * f.sp * 0.7 + f.ph) * 6 * dt;
        const a = Math.max(0, Math.sin(t * f.sp * 1.3 + f.ph));
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 7);
        g.addColorStop(0, `rgb(255 225 140 / ${0.7 * a})`);
        g.addColorStop(1, 'rgb(255 225 140 / 0)');
        ctx.fillStyle = g;
        ctx.fillRect(f.x - 7, f.y - 7, 14, 14);
      }
    },
  },

  sparks: {
    init(it, p, r) {
      return { list: Array.from({ length: 16 }, () => ({ age: r() * 2.5, ox: r() - 0.5 })), r };
    },
    draw(ctx, s, t, dt, it, p) {
      for (const k of s.list) {
        k.age += dt;
        if (k.age > 2.5) {
          k.age = 0;
          k.ox = s.r() - 0.5;
        }
        const q = k.age / 2.5;
        const x = p.X(it.x) + k.ox * p.S(0.05) + Math.sin(q * 9 + k.ox * 9) * p.S(0.01);
        const y = p.Y(it.y) - q * p.S(0.3);
        dot(ctx, x, y, 1.1, `rgb(255 190 110 / ${1 - q})`);
      }
    },
  },

  glints: {
    init(it, p, r) {
      return Array.from({ length: it.count ?? 30 }, () => ({
        x: p.X(it.x0 ?? -0.2) + r() * p.S((it.x1 ?? 1.2) - (it.x0 ?? -0.2)), y: p.Y(it.y0) + r() * p.Y(it.y1 - it.y0), ph: r() * 6, sp: 1 + r() * 2,
      }));
    },
    draw(ctx, list, t, dt, it) {
      for (const g of list) {
        const a = Math.max(0, Math.sin(t * g.sp + g.ph)) ** 3;
        ctx.fillStyle = `${it.color ?? 'rgb(255 245 220'} / ${a * 0.8})`;
        ctx.fillRect(g.x, g.y, 6, 1.2);
      }
    },
  },
};

/** A point along a track of [x, y, h] points, k from 0 (first) to 1 (last). */
function along(track, k) {
  const n = track.length - 1;
  const f = Math.min(n - 1e-9, Math.max(0, k * n));
  const i = Math.floor(f);
  const u = f - i;
  return track[i].map((v, j) => v + (track[i + 1][j] - v) * u);
}

function easeOut(t) {
  return 1 - (1 - t) ** 2;
}

function curve(pts, t) {
  let p = pts;
  while (p.length > 1) {
    const next = [];
    for (let i = 0; i < p.length - 1; i++) next.push([p[i][0] + (p[i + 1][0] - p[i][0]) * t, p[i][1] + (p[i + 1][1] - p[i][1]) * t]);
    p = next;
  }
  return p[0];
}
