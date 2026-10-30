// lines.js: the life lines. Every person is a dot on the "now" line with a trail running
// down the screen behind them: lower is longer ago, and the past fades into the hills.
// The years run by themselves and stop wherever something happens, so nobody has to
// guess how long to hold; a tap goes on from there, and holding a finger down only makes
// the years go faster. People join, walk beside you, drift off to the side, come back,
// or stop, leaving a small ring where their line ended. Each of those moments slows the
// years down and plays out in real time, so it is seen even while a line of text is up.
// Each person's line has their colour from people.js, so the dot is somebody you know.
//
// run(segment, hooks) plays one stretch of years from script.js and resolves at its end.
// Event fields: at (age), join, label, look (whose colour, from people.js), x, from
// ('left', 'right', 'fade', 'birth'),
// dashed, move + x, leave + side ('left', 'right', 'fade') + slow, back + x, end, cross
// (a list of strangers), and things to do on the way: say (with `by` for a spoken line),
// phone, music, pick.

import { markOf } from './people.js';
import { hexToRgb, rgbToCss, mix, vivid, readable } from './util.js';

const RATE = 0.9; // years per second on their own
const FAST = 2.4; // how much faster while a finger is held down
const STEP = 0.1; // years between stored trail points
// When somebody joins, leaves or dies the years slow right down and pick up again over
// BEAT_MS, so the moment can be seen; a stretch of years never ends before it is over.
// The moments themselves play in real time, so they also show while a line is on screen.
const BEAT_MS = 2600;
const JOIN_MS = 1600; // a new dot grows in, with one ring going out from it
const FADE_MS = 3200; // somebody who fades out of your life
const END_MS = 3400; // a dot that stops: it dims where it stopped, its name stays a while
const LEAVE_NAME_MS = 4000; // the name of somebody drifting off stays this long
const clamp01 = (v) => Math.min(1, Math.max(0, v));
// Where the people picked at 25 stand, in the order they are picked, and their colours.
const PICK_SLOTS = [0.28, 0.72, 0.94];
const PICK_LOOKS = ['a', 'b', 'c', 'd', 'stranger', 'friend'];
const PAPER = '#efe9de';
// People whose names come first when there is room for only some.
const IMPORTANT = new Set(['partner', 'kid', 'friend', 'dog', 'goose']);

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

  /** Gives somebody on the lines a new name (the dog, once the player has named him). */
  rename(id, label) {
    const p = this.people.get(id);
    if (p) p.label = label;
  }

  /** The whole state, for saving; load() puts it back. */
  save() {
    return { age: this.age, people: [...this.people].map(([key, p]) => ({ ...p, key, trail: thin(p.trail) })) };
  }

  /** A saved game comes back with every moment already finished. */
  load(data) {
    this.age = data.age;
    this.people = new Map(data.people.map((p) => {
      delete p.joinT;
      delete p.leaveT;
      delete p.endT;
      if (p.state === 'fading') p.state = 'away';
      if (p.state === 'here' && !p.faint) p.alpha = 1;
      if (p.arriving) {
        p.arriving = false;
        p.x = p.tx;
        p.trail.push([data.age, p.x]);
      }
      return [p.key ?? p.id, p];
    }));
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
    this.auto = true;
    hooks.hint(null);
    for (;;) {
      while (i < events.length && events[i].at <= this.age + 1e-6) {
        const ev = events[i++];
        if (ev.if && !hooks.matches?.(ev.if)) continue;
        this.apply(ev, hooks);
        if (ev.music) hooks.music(ev.music);
        if (ev.say || ev.phone || ev.pick) {
          this.paused = true;
          this.holding = false;
          hooks.hint(null);
          if (ev.say) await hooks.say(ev.say, ev.by);
          if (ev.phone) await hooks.phone(ev.phone);
          if (ev.pick) {
            const chosen = await hooks.pick(ev.pick, (id, on) => this.preview(ev.pick, id, on));
            hooks.flag?.(ev.pick.set ?? 'picks', chosen);
          }
          this.paused = false;
        }
      }
      if (this.age >= seg.to - 1e-6) break;
      const next = Math.min(seg.to, i < events.length ? events[i].at : Infinity);
      await new Promise((resolve) => this.waiters.push({ age: next, resolve }));
    }
    const rest = (this.beatT ?? 0) + BEAT_MS - performance.now();
    if (rest > 0) await new Promise((resolve) => setTimeout(resolve, rest));
    this.auto = false;
  }

  /** Applies an event at once, while playing. */
  apply(ev) {
    const p = this.people.get(ev.join ?? ev.move ?? ev.leave ?? ev.back ?? ev.end);
    const t = performance.now();
    if (ev.join || (ev.leave && p) || (ev.back && p) || (ev.end && p)) this.beatT = t;
    if (ev.join) {
      const me = this.people.get('me');
      const person = p ?? { id: ev.join, label: ev.label, color: markOf(ev.look ?? ev.join), trail: [] };
      const start = { left: -0.3, right: 1.3, birth: me?.x }[ev.from] ?? ev.x ?? person.x;
      const grow = ev.from === 'fade' || ev.from === 'birth';
      // Somebody new from the side walks in along the "now" line, even while a line of
      // text is on screen; their own line starts where they stop.
      const walk = ev.from === 'left' || ev.from === 'right';
      Object.assign(person, {
        label: ev.label ?? person.label, x: start, tx: ev.x ?? person.x, state: 'here', v: 0,
        alpha: grow ? 0 : 1, dashed: !!ev.dashed, speed: 1, me: person.me ?? false, arriving: walk,
      });
      if (grow) person.joinT = t;
      if (!walk) person.trail.push([this.age, start]);
      this.people.set(ev.join, person);
    }
    if (ev.move && p) {
      p.tx = ev.x;
      p.speed = 2.4;
    }
    if (ev.leave && p) {
      p.state = ev.side === 'fade' ? 'fading' : 'leaving';
      p.tx = ev.side === 'left' ? -0.6 : ev.side === 'right' ? 1.6 : p.x;
      p.speed = ev.slow ? 0.4 : 0.8;
      p.leaveT = t;
    }
    if (ev.back && p) {
      p.state = 'here';
      p.alpha = 1;
      p.speed = 1;
      p.v = 0;
      p.x = ev.x < 0.5 ? -0.3 : 1.3;
      p.tx = ev.x;
      p.arriving = true;
      p.trail.push(null);
    }
    if (ev.end && p) {
      p.state = 'gone';
      p.endAge = this.age;
      p.endT = t;
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

  /**
   * The picker: everyone tapped walks in from the side to a free place in your life, with
   * a short name, and walks back out if tapped again. Nobody who is not picked joins.
   */
  preview(spec, id, on) {
    const key = `pick-${id}`;
    const n = spec.options.findIndex((o) => o.id === id);
    const p = this.people.get(key);
    if (on) {
      const taken = [...this.people].filter(([k, q]) => k.startsWith('pick-') && !q.exit).map(([, q]) => q.tx);
      const slot = PICK_SLOTS.find((x) => !taken.includes(x)) ?? PICK_SLOTS[0];
      this.people.set(key, {
        id, label: spec.options[n].name, color: markOf(PICK_LOOKS[n]), x: p?.x ?? (slot < 0.5 ? -0.25 : 1.25), tx: slot,
        v: 0, state: 'here', alpha: 1, speed: 1, arriving: true, trail: [],
      });
    } else if (p) {
      Object.assign(p, { arriving: false, exit: true, state: 'leaving', trail: [], tx: p.x < 0.5 ? -0.5 : 1.5 });
    }
  }

  tick(now) {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0;
    this.last = now;
    this.ease(now, dt);
    if (this.visible && (this.auto || this.holding) && !this.paused && !this.reading) {
      // Years only run toward an age somebody is waiting for: a finger still held after a
      // stretch ends does not carry the age past it.
      const target = this.waiters.length ? Math.min(...this.waiters.map((w) => w.age)) : this.age;
      const step = Math.min(dt * RATE * (this.holding ? FAST : 1) * this.pace(now), target - this.age);
      if (step > 0) this.advance(step);
      this.waiters = this.waiters.filter((w) => {
        if (this.age >= w.age - 1e-6) w.resolve();
        return this.age < w.age - 1e-6;
      });
    }
    if (this.visible) this.draw(now);
    requestAnimationFrame((t) => this.tick(t));
  }

  /** How fast the years go right now: slow just after a moment, then back up to speed. */
  pace(now) {
    if (!this.beatT) return 1;
    const k = clamp01((now - this.beatT) / BEAT_MS);
    return 0.15 + 0.85 * k * k;
  }

  /**
   * Plays the moments in real time: a dot growing in, somebody walking in from the side,
   * a dot fading out of your life.
   */
  ease(now, dt) {
    for (const [key, p] of this.people) {
      if (p.arriving || p.exit) {
        const k = 12;
        p.v += (k * (p.tx - p.x) - 2 * Math.sqrt(k) * p.v) * dt;
        p.x += p.v * dt;
        if (p.exit) {
          if (p.x < -0.4 || p.x > 1.4) this.people.delete(key);
        } else if (Math.abs(p.tx - p.x) < 0.006 && Math.abs(p.v) < 0.05) {
          p.x = p.tx;
          p.v = 0;
          p.arriving = false;
          p.trail.push([this.age, p.x]);
        }
      }
      if (p.joinT) {
        p.alpha = clamp01((now - p.joinT) / JOIN_MS);
        if (p.alpha >= 1) delete p.joinT;
      }
      if (p.state === 'fading') {
        p.alpha = 1 - clamp01((now - p.leaveT) / FADE_MS);
        if (p.alpha <= 0) {
          p.state = 'away';
          p.trail.push([this.age, p.x]);
        }
      }
    }
  }

  /** Moves time forward by `years`, in small steps so the trails curve smoothly. */
  advance(years) {
    let left = years;
    while (left > 1e-9) {
      const d = Math.min(left, 0.02);
      left -= d;
      this.age += d;
      for (const p of this.people.values()) {
        if (p.state === 'pending' || p.state === 'gone' || p.state === 'away' || p.arriving || p.exit) continue;
        // A damped spring: a person starts drifting gently and settles gently, so a line
        // that leaves draws a long soft curve, not a corner.
        const k = 2.6 * p.speed * p.speed;
        p.v = (p.v ?? 0) + (k * (p.tx - p.x) - 2 * Math.sqrt(k) * (p.v ?? 0)) * d;
        p.x += p.v * d;
        if (p.state === 'leaving' && (p.x < -0.45 || p.x > 1.45)) {
          p.state = 'away';
          p.trail.push([this.age, p.x]);
          continue;
        }
        const last = p.trail[p.trail.length - 1];
        if (!last || this.age - last[0] >= STEP) p.trail.push([this.age, p.x]);
      }
    }
  }

  draw(ms) {
    const { ctx, w, h } = this;
    const t = ms / 1000;
    const dt = this.drawn ? Math.min(0.1, (ms - this.drawn) / 1000) : 0;
    this.drawn = ms;
    ctx.clearRect(0, 0, w, h);
    const now = h * 0.4;
    const perYear = Math.min(30, Math.max(16, h * 0.032));
    const X = (u) => this.colX + u * this.colW;
    const Y = (age) => now + (this.age - age) * perYear;

    const ageY = h * 0.17;
    const ageFill = readable(hexToRgb(PAPER), this.skyAt(ageY - 10));
    ctx.font = '300 30px Recursive, system-ui, sans-serif';
    ctx.textAlign = 'center';
    // The age rolls over like a counter: the old number slides up and out, the new one in.
    const year = Math.floor(this.age + 1e-6);
    if (year !== this.year) {
      this.prevYear = this.year;
      this.year = year;
      this.yearAt = ms;
    }
    const roll = this.prevYear === undefined ? 1 : clamp01((ms - this.yearAt) / 320);
    const eased = 1 - (1 - roll) ** 3;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, ageY - 34, w, 46);
    ctx.clip();
    if (roll < 1) {
      ctx.fillStyle = rgbToCss(ageFill, 0.92 * (1 - eased));
      ctx.fillText(`age ${this.prevYear}`, w / 2, ageY - 24 * eased);
    }
    ctx.fillStyle = rgbToCss(ageFill, 0.92 * eased);
    ctx.fillText(`age ${year}`, w / 2, ageY + 24 * (1 - eased));
    ctx.restore();
    this.ageLayout = { fill: ageFill, back: this.skyAt(ageY - 10) };

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
      const live = (p.state === 'here' || p.state === 'leaving' || p.state === 'fading') && !p.arriving && !p.exit;
      const pts = live ? [...p.trail, [this.age, p.x]] : p.trail;
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
        const x = X(p.trail[p.trail.length - 1][1]);
        if (y < h) {
          ctx.strokeStyle = rgbToCss(mix(rgb, hexToRgb(PAPER), 0.3), 0.8);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        // The moment a line stops, the dot stays a while where it stopped and dims.
        const k = p.endT ? clamp01((ms - p.endT) / END_MS) : 1;
        if (k < 1) dots.push({ p, x, y, rgb, end: k });
      } else if (p.state !== 'away' && p.alpha > 0.02) {
        dots.push({ p, x: X(p.x), y: now, rgb });
      }
    }

    // A friend you only know online (a dashed line) is joined to you by a faint thread
    // under the line, with a message now and then running along it, either way.
    const me = this.people.get('me');
    for (const p of this.people.values()) {
      if (!p.dashed || !me || p.arriving || (p.state !== 'here' && p.state !== 'fading') || p.alpha < 0.02) continue;
      const rgb = mix(hexToRgb(p.color), hexToRgb(PAPER), 0.35);
      const [x0, x1] = [X(me.x), X(p.x)];
      const dip = Math.min(26, Math.abs(x1 - x0) * 0.18);
      const at = (u) => [x0 + (x1 - x0) * u, now + dip * 4 * u * (1 - u)];
      ctx.strokeStyle = rgbToCss(rgb, 0.32 * p.alpha);
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(x0, now);
      ctx.quadraticCurveTo((x0 + x1) / 2, now + dip * 2, x1, now);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const [speed, phase, back] of [[0.32, 0, false], [0.26, 0.55, true]]) {
        const u = (t * speed + phase) % 1;
        const [mx, my] = at(back ? 1 - u : u);
        ctx.fillStyle = rgbToCss(rgb, 0.85 * p.alpha * Math.sin(u * Math.PI));
        ctx.beginPath();
        ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    dots.sort((a, b) => a.x - b.x);
    // Names, on one of three rows above the line, never on top of another name. Your own
    // name is placed first; when two dots sit on the same spot only one of them is named.
    // A name keeps its row while its dot moves and fades in rather than blinking on.
    // Somebody walking in is named once they stop; somebody drifting off, or whose line
    // has just stopped, keeps the name a little while. Each name's colour is adjusted
    // until it reads clearly on the sky behind it.
    const want = (d) => {
      const { p } = d;
      if (p.me) return 1;
      if (d.end !== undefined) return Math.abs(d.y - now) < 2 ? 1 - clamp01((d.end - 0.6) / 0.4) : 0;
      if (p.arriving) return 0;
      if (p.state === 'here') return 1;
      if (p.state === 'leaving' && p.leaveT) return 1 - clamp01((ms - p.leaveT) / LEAVE_NAME_MS);
      if (p.state === 'fading') return p.alpha;
      return 0;
    };
    // Three rows of names, and a name may sit a little to either side of its dot, so a
    // crowded line still names everyone; a name never sits over somebody else's dot.
    const rows = [[], [], []];
    const SHIFTS = [0, -14, 14, -26, 26];
    const layout = [];
    const lineH = 15;
    const span = (p, x) => {
      ctx.font = `${p.me ? 600 : 520} 14px Recursive, system-ui, sans-serif`;
      const half = ctx.measureText(p.label).width / 2 + 5;
      const lx = Math.min(this.colX + this.colW - half, Math.max(this.colX + half, x));
      return [lx - half, lx + half, lx];
    };
    const free = (row, s) => rows[row].every(([a, b]) => s[1] <= a || s[0] >= b);
    const rank = (p) => (p.me ? 3 : p.since !== undefined || IMPORTANT.has(p.id) ? 2 : 1);
    // A name already on screen keeps its place; somebody new finds room around it.
    const order = [...dots].sort((a, b) => rank(b.p) - rank(a.p) || ((b.p.la ?? 0) > 0) - ((a.p.la ?? 0) > 0));
    const labels = new Map();
    const named = [];
    for (const d of order) {
      const { p, x } = d;
      const goal = p.label ? want(d) : 0;
      if (goal < 0.02 || named.some((nx) => Math.abs(nx - x) < 14)) {
        p.la = 0;
        continue;
      }
      // Tries the spot this name had last frame first, so names do not jump about.
      const spots = [];
      if (p.spot) spots.push(p.spot);
      for (const r of [0, 1, 2]) for (const dx of SHIFTS) spots.push([r, dx]);
      let s;
      let row;
      for (const [r, dx] of spots) {
        const c = span(p, x + dx);
        // A name on the lowest row moved off its own dot must not land over somebody
        // else's; the higher rows sit above the other names and can go anywhere.
        const clear = r > 0 || dx === 0 || !dots.some((o) => o.p !== p && Math.abs(o.x - c[2]) < 10);
        if (free(r, c) && clear) {
          // A name that has to change spot fades in again where it lands, so it never
          // jumps across the line or slides over another name.
          if (p.spot && (p.spot[0] !== r || p.spot[1] !== dx)) p.la = 0;
          s = c;
          row = r;
          p.spot = [r, dx];
          break;
        }
      }
      if (row === undefined) {
        p.la = 0;
        continue;
      }
      p.la = Math.min(goal, (p.la ?? 0) + dt * 4);
      rows[row].push(s);
      named.push(x);
      labels.set(p, [s[2], row, p.la]);
    }

    for (const d of dots) {
      const { p, x, y, rgb } = d;
      let a = p.alpha * (p.faint ? 0.6 : 1);
      let r = (p.me ? 6.5 : 5) * (p.me ? 1 + Math.sin(t * 2.2) * 0.08 : 1);
      // One ring goes out from a dot that has just appeared, or whose line has just stopped.
      const ring = p.joinT ? clamp01((ms - p.joinT) / JOIN_MS) : d.end;
      if (p.joinT) r *= 0.45 + 0.55 * (1 - (1 - ring) ** 3);
      if (d.end !== undefined) {
        a *= 1 - d.end * d.end;
        r *= 1 - 0.3 * d.end;
      }
      if (ring !== undefined && ring < 1) {
        ctx.strokeStyle = rgbToCss(mix(rgb, [255, 255, 255], 0.3), 0.55 * (1 - ring));
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 6 + ring * 24, 0, Math.PI * 2);
        ctx.stroke();
      }
      const halo = ctx.createRadialGradient(x, y, 0, x, y, p.me ? 18 : 12);
      halo.addColorStop(0, rgbToCss(rgb, 0.45 * a));
      halo.addColorStop(1, rgbToCss(rgb, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(x - 20, y - 20, 40, 40);
      ctx.fillStyle = rgbToCss(mix(rgb, [255, 255, 255], 0.25), a);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      const label = labels.get(p);
      if (!label) continue;
      const ly = now - 17 - label[1] * lineH;
      const back = this.skyAt(ly);
      const fill = readable(mix(rgb, hexToRgb(PAPER), p.me ? 0.1 : 0.3), back);
      ctx.font = `${p.me ? 600 : 520} 14px Recursive, system-ui, sans-serif`;
      const la = label[2] * (d.end === undefined ? p.alpha * (p.faint ? 0.6 : 1) : 1);
      // A soft halo in the sky's own colour keeps a name clear of the lines behind it.
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = rgbToCss(back, 0.7 * la);
      ctx.strokeText(p.label, label[0], ly);
      ctx.fillStyle = rgbToCss(fill, la);
      ctx.fillText(p.label, label[0], ly);
      if (label[2] > 0.9) layout.push({ label: p.label, x: label[0], y: ly, w: ctx.measureText(p.label).width, dot: x, fill, back });
    }
    // Kept on the canvas element for the checks in audit.js.
    this.canvas.layout = { labels: layout, colX: this.colX, colW: this.colW, age: this.ageLayout };
  }

  /** The colour of the background sky at screen height `y`, as painted by the stage. */
  skyAt(y) {
    const sky = this.backdrop?.sky ?? ['#202840', '#202840'];
    const end = (this.backdrop?.skyEnd ?? 0.75) * this.h;
    const k = Math.min(1, Math.max(0, y / end)) * (sky.length - 1);
    const i = Math.min(sky.length - 2, Math.floor(k));
    return vivid(mix(sky[i], sky[i + 1], k - i), this.backdrop?.vibrance ?? 1);
  }

  /** The stage tells the lines which scene is behind them, so names can stay readable. */
  setBackdrop(scene) {
    this.backdrop = scene;
  }
}

/** Keeps every other old trail point, so a saved game stays small. */
function thin(trail) {
  return trail.filter((pt, i) => !pt || i % 2 === 0 || i === trail.length - 1);
}
