// fx.js: the few things in a scene that move: twinkling stars, birds, chimney smoke, a car's
// rear lights going down the road, snow, rain, fireflies, sparks from a fire, glints on
// water. Everything else in a scene is a still painting (painter.js), which keeps phones cool.
//
// A scene lists its effects as { kind, at, ... }. `at` is the painted layer the effect sits
// just in front of (0 far, 1 middle, 2 near; 2 by default), so stars can stay behind the
// hills while snow falls in front of everything.

import { rng } from './util.js';
import { makePen } from './painter.js';
import { drawPerson } from './people.js';

/**
 * Builds the effects for one scene. Returns { canvases: {0?, 1?, 2?}, start(), stop() };
 * the stage puts each canvas in the layer of the same number. People are drawn here too
 * (kind 'person'), so they can breathe and wave; their layers keep the full pixel ratio.
 */
export function createFx(items = [], view, scene) {
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
    const state = kind.init(it, pos, rng(1000 + i * 77), pen);
    slots[at].list.push({ kind, it, state });
  });
  for (const s of Object.values(slots)) live.push(s);

  let raf = 0;
  let last = 0;
  let t = 0;
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
  };
}

function dot(ctx, x, y, r, css) {
  ctx.fillStyle = css;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const KINDS = {
  person: {
    init(it, p, r, pen) {
      return pen;
    },
    draw(ctx, pen, t, dt, it) {
      drawPerson(ctx, it.person, pen, t);
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
