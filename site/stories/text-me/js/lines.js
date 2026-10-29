// lines.js: the life lines. Every person is a dot on the "now" line with a trail running
// down the screen behind them: lower is longer ago, and the past fades into the hills.
// While the player holds a finger down, the years run; people join, walk beside you,
// drift off to the side, come back, or stop, leaving a small ring where their line ended.
// Each person's line has their colour from people.js, so the dot is somebody you know.
//
// run(segment, hooks) plays one stretch of years from script.js and resolves at its end.
// Event fields: at (age), join, label, x, from ('left', 'right', 'fade', 'birth'),
// dashed, move + x, leave + side ('left', 'right', 'fade') + slow, back + x, end, cross
// (a list of strangers), and things to do on the way: say, phone, music, pick.

import { markOf } from './people.js';
import { hexToRgb, rgbToCss, mix } from './util.js';

const RATE = 1.15; // years per second while held
const STEP = 0.1; // years between stored trail points
const PAPER = '#efe9de';

export class Lines {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.people = new Map();
    this.age = 0;
    this.holding = false;
    this.paused = false;
    this.visible = false;
    this.waiters = [];
    this.last = 0;
    this.resize();
    addEventListener('resize', () => this.resize());
    requestAnimationFrame((t) => this.tick(t));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = document.documentElement.clientWidth;
    this.h = window.innerHeight;
    this.colW = Math.min(this.w, 430);
    this.colX = (this.w - this.colW) / 2;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Puts everyone in place before age 0. Family who were alive already get a trail. */
  init(cast) {
    this.people.clear();
    this.age = 0;
    for (const [id, p] of Object.entries(cast)) {
      const here = p.since !== undefined;
      this.people.set(id, {
        id, label: p.label, x: p.x, tx: p.x, me: !!p.me, color: markOf(id),
        state: here ? 'here' : 'pending', alpha: here ? 1 : 0, speed: 1,
        trail: here ? [[p.since, p.x], [0, p.x]] : [],
      });
    }
  }

  /** The whole state, for saving; load() puts it back. */
  save() {
    return { age: this.age, people: [...this.people.values()].map((p) => ({ ...p, trail: thin(p.trail) })) };
  }

  load(data) {
    this.age = data.age;
    this.people = new Map(data.people.map((p) => [p.id, p]));
  }

  show(on) {
    this.visible = on;
    this.canvas.classList.toggle('is-on', on);
  }

  setHolding(on) {
    this.holding = on;
  }

  /**
   * Plays years until `seg.to`. `hooks` are the player's: say(text), phone(spec),
   * music(act), pick(spec) (resolves to the chosen ids) and hint(text or null).
   */
  async run(seg, hooks) {
    const events = [...(seg.events ?? [])].sort((a, b) => a.at - b.at);
    let i = 0;
    hooks.hint(seg.hint ?? 'hold');
    for (;;) {
      while (i < events.length && events[i].at <= this.age + 1e-6) {
        const ev = events[i++];
        this.apply(ev, hooks);
        if (ev.music) hooks.music(ev.music);
        if (ev.say || ev.phone || ev.pick) {
          this.paused = true;
          this.holding = false;
          hooks.hint(null);
          if (ev.say) await hooks.say(ev.say);
          if (ev.phone) await hooks.phone(ev.phone);
          if (ev.pick) this.settlePick(ev.pick, await hooks.pick(ev.pick));
          this.paused = false;
          hooks.hint('hold');
        }
      }
      if (this.age >= seg.to - 1e-6) break;
      const next = Math.min(seg.to, i < events.length ? events[i].at : Infinity);
      await new Promise((resolve) => this.waiters.push({ age: next, resolve }));
    }
    hooks.hint(null);
  }

  /** Applies an event at once. Used while playing and to rebuild a saved game. */
  apply(ev) {
    const p = this.people.get(ev.join ?? ev.move ?? ev.leave ?? ev.back ?? ev.end);
    if (ev.join) {
      const me = this.people.get('me');
      const person = p ?? { id: ev.join, label: ev.label, color: markOf(ev.join), trail: [] };
      const start = { left: -0.3, right: 1.3, birth: me?.x }[ev.from] ?? ev.x ?? person.x;
      Object.assign(person, {
        label: ev.label ?? person.label, x: start, tx: ev.x ?? person.x, state: 'here',
        alpha: ev.from === 'fade' || ev.from === 'birth' ? 0 : 1, dashed: !!ev.dashed, speed: 1, me: person.me ?? false,
      });
      person.trail.push([this.age, start]);
      this.people.set(ev.join, person);
    }
    if (ev.move && p) p.tx = ev.x;
    if (ev.leave && p) {
      p.state = ev.side === 'fade' ? 'fading' : 'leaving';
      p.tx = ev.side === 'left' ? -0.6 : ev.side === 'right' ? 1.6 : p.x;
      p.speed = ev.slow ? 0.4 : 0.8;
    }
    if (ev.back && p) {
      p.state = 'here';
      p.alpha = 1;
      p.speed = 0.8;
      p.x = p.x < 0.5 ? -0.3 : 1.3;
      p.tx = ev.x;
      p.trail.push(null, [this.age, p.x]);
    }
    if (ev.end && p) {
      p.state = 'gone';
      p.endAge = this.age;
      p.trail.push([this.age, p.x]);
    }
    if (ev.cross) {
      ev.cross.forEach((label, n) => {
        const fromLeft = n % 2 === 0;
        this.people.set(`cross${this.age}${n}`, {
          id: 'stranger', label, color: '#b8bfcc', x: fromLeft ? -0.2 : 1.2, tx: fromLeft ? 1.5 : -0.5,
          state: 'leaving', alpha: 0.75, faint: true, speed: 1.5 + n * 0.25, trail: [[this.age, fromLeft ? -0.2 : 1.2]],
        });
      });
    }
  }

  /** After a pick: the chosen come close and stay, the rest drift away. */
  settlePick(spec, chosen) {
    const me = this.people.get('me');
    const looks = ['a', 'b', 'c', 'd', 'stranger', 'friend'];
    let side = 1;
    spec.options.forEach((o, n) => {
      const keep = chosen.includes(o.id);
      const x = keep ? me.x + side * (0.1 + (n % 3) * 0.05) : 0.7 + n * 0.06;
      side = -side;
      this.people.set(`pick-${o.id}`, {
        id: o.id, label: keep ? 'friend' : '', color: markOf(looks[n]), x: 1.2 + n * 0.08, tx: keep ? x : 1.6,
        state: keep ? 'here' : 'leaving', alpha: keep ? 1 : 0.5, speed: keep ? 1 : 0.5, faint: !keep,
        trail: [[this.age, 1.2 + n * 0.08]],
      });
    });
  }

  tick(now) {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0;
    this.last = now;
    if (this.visible && this.holding && !this.paused) {
      const target = this.waiters.length ? Math.min(...this.waiters.map((w) => w.age)) : Infinity;
      const step = Math.min(dt * RATE, target - this.age);
      if (step > 0) this.advance(step);
      this.waiters = this.waiters.filter((w) => {
        if (this.age >= w.age - 1e-6) w.resolve();
        return this.age < w.age - 1e-6;
      });
    }
    if (this.visible) this.draw(now / 1000);
    requestAnimationFrame((t) => this.tick(t));
  }

  /** Moves time forward by `years`, in small steps so the trails curve smoothly. */
  advance(years) {
    let left = years;
    while (left > 1e-9) {
      const d = Math.min(left, 0.02);
      left -= d;
      this.age += d;
      for (const p of this.people.values()) {
        if (p.state === 'pending' || p.state === 'gone' || p.state === 'away') continue;
        // A damped spring: a person starts drifting gently and settles gently, so a line
        // that leaves draws a long soft curve, not a corner.
        const k = 2.6 * p.speed * p.speed;
        p.v = (p.v ?? 0) + (k * (p.tx - p.x) - 2 * Math.sqrt(k) * (p.v ?? 0)) * d;
        p.x += p.v * d;
        if (p.state === 'fading') p.alpha = Math.max(0, p.alpha - d * 0.9);
        else if (p.alpha < 1 && !p.faint) p.alpha = Math.min(1, p.alpha + d * 2);
        if ((p.state === 'leaving' && (p.x < -0.45 || p.x > 1.45)) || (p.state === 'fading' && p.alpha <= 0)) {
          p.state = 'away';
          p.trail.push([this.age, p.x]);
          continue;
        }
        const last = p.trail[p.trail.length - 1];
        if (!last || this.age - last[0] >= STEP) p.trail.push([this.age, p.x]);
      }
    }
  }

  draw(t) {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const now = h * 0.4;
    const perYear = Math.min(30, Math.max(16, h * 0.032));
    const X = (u) => this.colX + u * this.colW;
    const Y = (age) => now + (this.age - age) * perYear;

    ctx.fillStyle = rgbToCss(hexToRgb(PAPER), 0.9);
    ctx.font = '300 30px Recursive, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`age ${Math.floor(this.age + 1e-6)}`, w / 2, h * 0.17);

    const edge = ctx.createLinearGradient(X(0), 0, X(1), 0);
    edge.addColorStop(0, 'rgb(239 233 222 / 0)');
    edge.addColorStop(0.5, 'rgb(239 233 222 / 0.28)');
    edge.addColorStop(1, 'rgb(239 233 222 / 0)');
    ctx.fillStyle = edge;
    ctx.fillRect(X(-0.05), now - 0.5, this.colW * 1.1, 1);

    const dots = [];
    for (const p of this.people.values()) {
      if (p.state === 'pending') continue;
      const rgb = hexToRgb(p.color);
      const fade = ctx.createLinearGradient(0, now, 0, h);
      fade.addColorStop(0, rgbToCss(rgb, 0.85 * (p.faint ? 0.5 : 1)));
      fade.addColorStop(1, rgbToCss(rgb, 0));
      ctx.strokeStyle = fade;
      ctx.lineWidth = p.me ? 2.6 : 2;
      ctx.setLineDash(p.dashed ? [3, 5] : []);
      ctx.beginPath();
      let pen = false;
      const pts = p.state === 'here' || p.state === 'leaving' || p.state === 'fading' ? [...p.trail, [this.age, p.x]] : p.trail;
      for (const pt of pts) {
        if (!pt) {
          pen = false;
          continue;
        }
        const y = Y(pt[0]);
        if (y > h + 40) {
          pen = false;
          continue;
        }
        if (pen) ctx.lineTo(X(pt[1]), y);
        else ctx.moveTo(X(pt[1]), y);
        pen = true;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      if (p.state === 'gone') {
        const y = Y(p.endAge);
        if (y < h) {
          ctx.strokeStyle = rgbToCss(mix(rgb, hexToRgb(PAPER), 0.3), 0.8);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(X(p.trail[p.trail.length - 1][1]), y, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (p.state !== 'away' && p.alpha > 0.02) {
        dots.push({ p, x: X(p.x), rgb });
      }
    }

    dots.sort((a, b) => a.x - b.x);
    // Labels go on up to three rows above the line. Your own label takes its place first;
    // any other label that fits on no row is left off (the dot still shows) until there
    // is room, so names never sit on top of each other.
    const rows = [[], [], []];
    const span = (p, x) => {
      ctx.font = `${p.me ? 560 : 440} 14px Recursive, system-ui, sans-serif`;
      const half = ctx.measureText(p.label).width / 2 + 5;
      const lx = Math.min(this.colX + this.colW - half, Math.max(this.colX + half, x));
      return [lx - half, lx + half, lx];
    };
    const place = (s) => rows.findIndex((row) => row.every(([a, b]) => s[1] <= a || s[0] >= b));
    const labels = new Map();
    const me = dots.find((d) => d.p.me);
    if (me) {
      const s = span(me.p, me.x);
      rows[0].push(s);
      labels.set(me.p, [s[2], 0]);
    }
    for (const { p, x } of dots) {
      if (!p.label || p.me) continue;
      const s = span(p, x);
      const row = place(s);
      if (row === -1) continue;
      rows[row].push(s);
      labels.set(p, [s[2], row]);
    }

    for (const { p, x, rgb } of dots) {
      const a = p.alpha * (p.faint ? 0.6 : 1);
      const pulse = p.me ? 1 + Math.sin(t * 2.2) * 0.08 : 1;
      const halo = ctx.createRadialGradient(x, now, 0, x, now, p.me ? 18 : 12);
      halo.addColorStop(0, rgbToCss(rgb, 0.45 * a));
      halo.addColorStop(1, rgbToCss(rgb, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(x - 20, now - 20, 40, 40);
      ctx.fillStyle = rgbToCss(mix(rgb, [255, 255, 255], 0.25), a);
      ctx.beginPath();
      ctx.arc(x, now, (p.me ? 6.5 : 5) * pulse, 0, Math.PI * 2);
      ctx.fill();
      const label = labels.get(p);
      if (!label) continue;
      ctx.font = `${p.me ? 560 : 440} 14px Recursive, system-ui, sans-serif`;
      ctx.fillStyle = rgbToCss(mix(rgb, hexToRgb(PAPER), p.me ? 0.15 : 0.55), a);
      ctx.fillText(p.label, label[0], now - 17 - label[1] * 16);
    }
  }
}

/** Keeps every other old trail point, so a saved game stays small. */
function thin(trail) {
  return trail.filter((pt, i) => !pt || i % 2 === 0 || i === trail.length - 1);
}
