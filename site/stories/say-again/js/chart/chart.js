// chart.js: the paper chart of the bay that slides up over the radio. The player lays each
// bearing line from a station by dragging until the number matches what the direction
// finder heard, then taps where the lines cross (the fix). With three lines the crossing
// is a small triangle, the "cocked hat"; the truth is inside it. A line can also be fixed
// by a mark on it: the player finds the buoy the line runs through. The map is geo.js.

import { STATIONS, TOWN, BUOYS, buoyName, bearing, cross, dir, fmtBearing } from './geo.js';
import { paintChart, writeWords } from './chart-paper.js';

const PAPER = '#efe5cb';
const PENCIL = '#3a3631';
const LIVE = '#b8452f';
const SNAP_DEG = 3;
// The part of the map shown when the whole bay fits, and the town when the chart zooms in.
const BAY = { x: 130, y: 10, w: 740, h: 980 };
const TOWN_VIEW = { cx: 785, cy: 585, w: 210 }; // the town; its height follows the screen

export class Chart {
  /**
   * @param {HTMLElement} root  the .chart overlay (index.html)
   * @param {object} sound      the story's sound (js/audio.js), may be a silent stand-in
   */
  constructor(root, sound) {
    this.root = root;
    this.sound = sound;
    this.canvas = root.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.say = root.querySelector('.chart-say');
    this.help = root.querySelector('.chart-help');
    this.done = root.querySelector('.chart-done');
    this.view = { ...BAY };
    this.laid = [];
    this.aim = null;
    this.task = null;
    this.fix = null;
    this.marked = false;
    this.pulse = 0;
    this.drawn = new Map(); // how far each laid line has been drawn, 0..1
    this.canvas.addEventListener('pointerdown', (e) => this.down(e));
    this.canvas.addEventListener('pointermove', (e) => this.move(e));
    this.canvas.addEventListener('pointerup', (e) => this.up(e));
    this.canvas.addEventListener('pointercancel', () => this.cancel());
    this.help.addEventListener('click', () => this.layForMe());
    new ResizeObserver(() => this.resize()).observe(this.canvas);
  }

  get isOpen() {
    return !this.root.hidden;
  }

  /**
   * Runs one plotting job and resolves when it is finished.
   * lines: [{ from: 'dune', brg: 38 }]  bearings as the direction finder gave them
   * mark:  ask the player to tap the fix
   * zoom:  'town' to close in on the streets once the fix is marked
   * keep:  lines already on the chart from an earlier night, drawn at once
   * find:  { buoy: 'g3', ask }  after the lines, tap that buoy; `ask` says what to look for
   */
  run({ lines = [], mark = false, zoom = null, keep = [], intro = '', find = null }) {
    this.laid = keep.map((l) => ({ ...l }));
    for (const l of this.laid) this.drawn.set(l, 1);
    this.task = { lines: lines.map((l) => ({ ...l })), next: 0, mark, zoom, find, tries: 0 };
    this.fix = null;
    this.marked = false;
    this.view = { ...BAY };
    // A chart opened straight after another must not be hidden by the last one's close.
    clearTimeout(this.closing);
    this.root.hidden = false;
    requestAnimationFrame(() => this.root.classList.add('is-open'));
    this.sound.paper?.();
    this.resize();
    this.prompt(intro);
    this.loop();
    return new Promise((resolve) => {
      this.finish = resolve;
    });
  }

  close() {
    this.root.classList.remove('is-open');
    this.closing = setTimeout(() => {
      this.root.hidden = true;
      cancelAnimationFrame(this.raf);
    }, 450);
  }

  prompt(intro = '') {
    const t = this.task;
    this.help.hidden = true;
    const line = t.lines[t.next];
    if (line) {
      const st = STATIONS[line.from];
      this.say.innerHTML =
        (intro ? `<span class="chart-intro">${intro}</span>` : '') +
        `${st.name} heard it on <b>${fmtBearing(line.brg)}</b>. Drag a line out from the ringed mast until its number reads ${fmtBearing(line.brg)}.`;
    } else if (t.find && !this.marked) {
      this.say.innerHTML = (intro ? `<span class="chart-intro">${intro}</span>` : '') + t.find.ask;
    } else if (t.mark && !this.marked) {
      this.say.innerHTML =
        this.laid.length >= 3
          ? 'Three lines never meet in one point. The small triangle is the <b>cocked hat</b>. Tap the ring on it.'
          : 'Where the lines cross is the <b>fix</b>. Tap it.';
    }
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.size = { w: r.width, h: r.height };
    this.paper = null;
  }

  /**
   * Map units to canvas pixels for the current view. The map keeps a margin above for
   * the chart's title and below for the scale bar, as a printed chart does.
   */
  scale() {
    const { w, h } = this.size;
    const v = this.view;
    const top = 34;
    const bottom = 64;
    const s = Math.min((w - 32) / v.w, (h - top - bottom) / v.h);
    // The title, the map, the scale bar and the key as one block in the middle of the paper.
    const spare = h - top - bottom - v.h * s;
    const map = { x: (w - v.w * s) / 2, y: top + Math.max(0, spare / 2), w: v.w * s, h: v.h * s };
    return { s, ox: map.x - v.x * s, oy: map.y - v.y * s, map };
  }

  toMap(e) {
    const r = this.canvas.getBoundingClientRect();
    const { s, ox, oy } = this.scale();
    return { x: (e.clientX - r.left - ox) / s, y: (e.clientY - r.top - oy) / s };
  }

  down(e) {
    const t = this.task;
    if (!t) return;
    const line = t.lines[t.next];
    if (line) {
      this.canvas.setPointerCapture(e.pointerId);
      this.aim = { from: line.from, brg: null, snapped: false };
      this.move(e);
      return;
    }
    if (t.find && !this.marked) {
      this.tapBuoy(this.toMap(e));
      return;
    }
    if (t.mark && !this.marked && this.fix) {
      const p = this.toMap(e);
      const { s } = this.scale();
      if (Math.hypot(p.x - this.fix.x, p.y - this.fix.y) * s < 44) this.markFix();
    }
  }

  move(e) {
    if (!this.aim) return;
    const t = this.task;
    const want = t.lines[t.next].brg;
    const p = this.toMap(e);
    const st = STATIONS[this.aim.from];
    if (Math.hypot(p.x - st.x, p.y - st.y) < 8) return;
    let b = bearing(st, p);
    const off = Math.abs(((b - want + 540) % 360) - 180);
    const snapped = off <= SNAP_DEG;
    if (snapped) b = want;
    if (snapped && !this.aim.snapped) this.sound.dialTick?.();
    this.aim.brg = b;
    this.aim.snapped = snapped;
  }

  up() {
    const a = this.aim;
    this.aim = null;
    if (!a || a.brg == null) return;
    const t = this.task;
    if (a.snapped) {
      this.lay({ from: a.from, brg: t.lines[t.next].brg });
    } else {
      t.tries += 1;
      this.say.innerHTML = `Not on it yet. Watch the number at the end of the line: it has to read <b>${fmtBearing(t.lines[t.next].brg)}</b>.`;
      if (t.tries >= 3) this.help.hidden = false;
    }
  }

  cancel() {
    this.aim = null;
  }

  layForMe() {
    const t = this.task;
    const line = t.lines[t.next];
    if (line) this.lay({ from: line.from, brg: line.brg });
  }

  /** A tap while looking for a buoy: the right one ends the task, a wrong one says so. */
  tapBuoy(p) {
    const t = this.task;
    const { s } = this.scale();
    const near = BUOYS.map((b) => ({ b, d: Math.hypot(p.x - b.x, p.y - b.y) * s })).sort((a, z) => a.d - z.d)[0];
    const want = BUOYS.find((b) => b.id === t.find.buoy);
    if (near.b === want && near.d < 30) return this.found(want);
    t.tries += 1;
    if (near.d < 30) this.say.innerHTML = `That is ${buoyName(near.b)}, and the line misses it. ${t.find.ask}`;
    // After three misses the ring shows where it is, so nobody is stuck on the chart.
    if (t.tries >= 3) {
      this.fix = { x: want.x, y: want.y };
      this.say.innerHTML = `This one: ${buoyName(want)}, right on the line. Tap the ring.`;
    }
  }

  /** For tests, and the same as tapping it: the buoy the task looks for. */
  findForMe() {
    const t = this.task;
    if (t?.find && !this.marked) this.found(BUOYS.find((b) => b.id === t.find.buoy));
  }

  found(b) {
    this.marked = true;
    // Circled with its number (drawn to its right), so the pencil never runs through the figure.
    this.fix = { x: b.x + 6, y: b.y, r: 17 };
    this.sound.pin?.();
    const name = buoyName(b);
    this.say.innerHTML = `<b>${name[0].toUpperCase()}${name.slice(1)}</b>.`;
    setTimeout(() => this.end(), 1600);
  }

  lay(line) {
    const t = this.task;
    this.laid.push(line);
    this.paper = null; // the names move off the new line
    this.drawn.set(line, 0);
    this.sound.pencil?.(700);
    t.next += 1;
    t.tries = 0;
    if (t.next >= t.lines.length) {
      if (t.mark) this.fix = this.fixPoint();
      else if (!t.find) {
        this.say.innerHTML = `<b>${fmtBearing(line.brg)}</b>. Laid.`;
        setTimeout(() => this.end(), 1600);
        return;
      }
    }
    this.prompt();
  }

  /** Where the laid lines cross: one point for two lines, the middle of the triangle for three. */
  fixPoint() {
    const L = this.laid;
    const pts = [];
    for (let i = 0; i < L.length; i++) {
      for (let j = i + 1; j < L.length; j++) {
        const p = cross(STATIONS[L[i].from], L[i].brg, STATIONS[L[j].from], L[j].brg);
        if (p) pts.push(p);
      }
    }
    if (!pts.length) return null;
    const c = pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 });
    return { ...c, corners: pts.length >= 3 ? pts : null };
  }

  markFix() {
    this.marked = true;
    this.sound.pin?.();
    this.say.innerHTML = this.task.zoom ? `The fix: a house on <b>${nearestStreet(this.fix)}</b>.` : 'Fixed.';
    if (this.task.zoom === 'town') {
      this.zoomTo(this.townView(), 1800).then(() => setTimeout(() => this.end(), 2600));
    } else {
      setTimeout(() => this.end(), 1400);
    }
  }

  /** The town view shaped like the space on screen, so the streets fill it. */
  townView() {
    const { w, h } = this.size;
    const vh = TOWN_VIEW.w * ((h - 98) / (w - 32));
    return { x: TOWN_VIEW.cx - TOWN_VIEW.w / 2, y: TOWN_VIEW.cy - vh / 2, w: TOWN_VIEW.w, h: vh };
  }

  zoomTo(target, ms) {
    const from = { ...this.view };
    const start = performance.now();
    return new Promise((resolve) => {
      const step = (now) => {
        const k = Math.min(1, (now - start) / ms);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        for (const key of ['x', 'y', 'w', 'h']) this.view[key] = from[key] + (target[key] - from[key]) * e;
        this.paper = null;
        if (k < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  end() {
    const f = this.finish;
    this.finish = null;
    this.task = null;
    this.close();
    f?.({ fix: this.fix });
  }

  loop() {
    cancelAnimationFrame(this.raf);
    const frame = () => {
      this.pulse = performance.now() / 1000;
      this.draw();
      if (!this.root.hidden) this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  draw() {
    if (!this.size) return;
    const { ctx } = this;
    const { w, h } = this.size;
    const { s, ox, oy } = this.scale();
    if (!this.paper) this.paper = this.paintPaper(w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.paper, 0, 0, w, h);
    const X = (x) => ox + x * s;
    const Y = (y) => oy + y * s;
    const { map } = this.scale();
    ctx.save();
    ctx.beginPath();
    ctx.rect(map.x, map.y, map.w, map.h);
    ctx.clip();

    // The lines laid so far, drawn out from the mast like a pencil on a ruler.
    for (const l of this.laid) {
      const k = Math.min(1, (this.drawn.get(l) ?? 1) + 0.04);
      this.drawn.set(l, k);
      this.ray(X, Y, s, STATIONS[l.from], l.brg, k, PENCIL, 1.6);
    }

    // The line being aimed, with its number by the pencil tip.
    const t = this.task;
    if (this.aim && this.aim.brg != null) {
      const st = STATIONS[this.aim.from];
      this.ray(X, Y, s, st, this.aim.brg, 1, this.aim.snapped ? PENCIL : LIVE, this.aim.snapped ? 2 : 1.4, !this.aim.snapped);
      const d = dir(this.aim.brg);
      const r = 120;
      this.tag(X(st.x + d.x * r), Y(st.y + d.y * r), fmtBearing(this.aim.brg), this.aim.snapped);
    }

    ctx.restore();
    writeWords(ctx, this.words ?? []);

    // The station to draw from, breathing.
    const next = t?.lines[t.next];
    if (next) {
      const st = STATIONS[next.from];
      const k = (Math.sin(this.pulse * 3) + 1) / 2;
      // Strong at the faint end of the breath too: it is where the drag starts.
      ctx.fillStyle = 'rgb(184 69 47 / 0.12)';
      ctx.strokeStyle = `rgb(184 69 47 / ${0.65 + k * 0.35})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(X(st.x), Y(st.y), 12 + k * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // The fix: a triangle when there are three lines, a ring to tap, then a pencil circle.
    if (this.fix) {
      const f = this.fix;
      if (f.corners) {
        ctx.fillStyle = 'rgb(184 69 47 / 0.22)';
        ctx.beginPath();
        f.corners.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
        ctx.closePath();
        ctx.fill();
      }
      const k = (Math.sin(this.pulse * 4) + 1) / 2;
      ctx.strokeStyle = this.marked ? PENCIL : `rgb(184 69 47 / ${0.5 + k * 0.4})`;
      ctx.lineWidth = this.marked ? 1.8 : 2;
      ctx.beginPath();
      ctx.arc(X(f.x), Y(f.y), this.marked ? f.r ?? Math.max(9, 7 * s) : 16 + k * 5, 0, Math.PI * 2);
      ctx.stroke();
      // A fix gets a dot at its heart; a found buoy is the mark itself.
      if (this.marked && !f.r) {
        ctx.fillStyle = PENCIL;
        ctx.beginPath();
        ctx.arc(X(f.x), Y(f.y), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** A bearing line from a station to the edge of the map; `k` is how much is drawn. */
  ray(X, Y, s, st, brg, k, color, width, dashed = false) {
    const { ctx } = this;
    const d = dir(brg);
    const len = 1400 * k;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    if (dashed) ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(X(st.x), Y(st.y));
    ctx.lineTo(X(st.x + d.x * len), Y(st.y + d.y * len));
    ctx.stroke();
    ctx.restore();
  }

  tag(x, y, text, ok) {
    const { ctx } = this;
    const { w, h } = this.size;
    ctx.save();
    ctx.font = '600 15px Recursive, ui-monospace, monospace';
    const tw = ctx.measureText(text).width + 14;
    const bx = Math.max(6, Math.min(w - tw - 6, x - tw / 2));
    const by = Math.max(6, Math.min(h - 32, y - 34));
    ctx.fillStyle = ok ? PENCIL : LIVE;
    ctx.beginPath();
    ctx.roundRect(bx, by, tw, 26, 6);
    ctx.fill();
    ctx.fillStyle = PAPER;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + 7, by + 13.5);
    ctx.restore();
  }

  /** The chart itself, drawn once per size and zoom into its own canvas (chart-paper.js). */
  paintPaper(w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { s, ox, oy, map } = this.scale();
    this.words = paintChart(g, w, h, { X: (x) => ox + x * s, Y: (y) => oy + y * s, s, map, zoomed: this.view.w < BAY.w * 0.6, lines: this.laid });
    return canvas;
  }
}

/** The name of the street closest to a point on the map. */
function nearestStreet(p) {
  let best = null;
  let bestD = Infinity;
  for (const st of TOWN.streets) {
    const [[x1, y1], [x2, y2]] = st.pts;
    const k = Math.max(0, Math.min(1, ((p.x - x1) * (x2 - x1) + (p.y - y1) * (y2 - y1)) / ((x2 - x1) ** 2 + (y2 - y1) ** 2)));
    const d = Math.hypot(p.x - (x1 + k * (x2 - x1)), p.y - (y1 + k * (y2 - y1)));
    if (d < bestD) {
      bestD = d;
      best = st.name;
    }
  }
  return best;
}
