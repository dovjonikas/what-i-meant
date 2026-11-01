// stage.js: the picture behind everything. It keeps one canvas the size of the screen,
// asks art/art.js to paint the current scene every frame, cross-fades from the last frame when
// the scene changes, eases scene values (a lamp going off, the town going dark) and, in
// the storm, throws the lightning and asks the sound for the thunder that follows.

const FADE_MS = 1100;

export class Stage {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {(ctx, view, scene, t, s) => object} paint  art/art.js
   * @param {object} sound  js/audio.js, or a silent stand-in
   */
  constructor(canvas, paint, sound) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.paint = paint;
    this.sound = sound;
    this.scene = null;
    this.s = {};
    this.hits = {};
    this.tweens = new Map();
    this.prev = null;
    this.waiting = new Map();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', (e) => this.tap(e));
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colW = Math.min(w, 430);
    this.view = { w, h, colW, colX: (w - colW) / 2 };
    this.dpr = dpr;
  }

  /** Changes the scene. Values in `s` replace the old state; `instant` skips the fade. */
  show(scene, s = {}, { instant = false } = {}) {
    if (!instant && this.scene) {
      const c = document.createElement('canvas');
      c.width = this.canvas.width;
      c.height = this.canvas.height;
      c.getContext('2d').drawImage(this.canvas, 0, 0);
      this.prev = { canvas: c, at: performance.now() };
    }
    this.scene = scene;
    this.s = { ...s };
    this.t0 = performance.now();
    this.tweens.clear();
    this.storm = scene === 'room' && s.mood === 'storm';
    this.nextFlash = performance.now() + 4000;
  }

  /** Sets scene values at once. */
  set(values) {
    Object.assign(this.s, values);
  }

  /** Eases one scene value to a target over `ms`; resolves when it gets there. */
  tween(key, to, ms = 1000) {
    const from = this.s[key] ?? 0;
    return new Promise((resolve) => {
      this.tweens.set(key, { from, to, start: performance.now(), ms, resolve });
    });
  }

  /**
   * Things in the picture that answer a touch at any time (the deer, the fawn, the cat).
   * `react(name)` plays the sound; the picture sees the time of the touch in s.poked.
   */
  toys(react) {
    this.react = react;
  }

  /** Resolves when the player taps one of the painted things art.js reported (the lamp). */
  waitTap(name) {
    return new Promise((resolve) => this.waiting.set(name, resolve));
  }

  tap(e) {
    const inside = (h) => h.r != null
      ? Math.hypot(e.clientX - h.x, e.clientY - h.y) <= h.r * 1.4
      : e.clientX >= h.x && e.clientX <= h.x + h.w && e.clientY >= h.y && e.clientY <= h.y + h.h;
    for (const [name, resolve] of this.waiting) {
      const h = this.hits[name];
      if (h && inside(h)) {
        this.waiting.delete(name);
        resolve();
        return;
      }
    }
    for (const name of ['fawn', 'deer', 'cat']) {
      const h = this.hits[name];
      if (!h || !inside(h)) continue;
      const t = (performance.now() - this.t0) / 1000;
      const last = this.s.poked?.[name] ?? -9;
      // A touch while the last reaction still plays does nothing, so tapping fast is calm.
      if (t - last < 1.6) return;
      this.s.poked = { ...this.s.poked, [name]: t };
      this.react?.(name);
      return;
    }
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    if (document.hidden || !this.scene) return;
    for (const [key, tw] of this.tweens) {
      const k = Math.min(1, (now - tw.start) / tw.ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      this.s[key] = tw.from + (tw.to - tw.from) * e;
      if (k >= 1) {
        this.tweens.delete(key);
        tw.resolve();
      }
    }
    if (this.storm) this.lightning(now);
    const { ctx, view } = this;
    ctx.clearRect(0, 0, view.w, view.h);
    const t = (now - this.t0) / 1000;
    try {
      this.hits = this.paint(ctx, view, this.scene, t, this.s) || {};
    } catch (err) {
      // A painting bug should not stop the story; it shows in the console for the checks.
      if (!this.warned) console.error(err);
      this.warned = true;
    }
    if (this.prev) {
      const k = (now - this.prev.at) / FADE_MS;
      if (k >= 1) this.prev = null;
      else {
        ctx.save();
        ctx.globalAlpha = 1 - k * k;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(this.prev.canvas, 0, 0);
        ctx.restore();
      }
    }
  }

  /** Flashes now and then in the storm: one or two quick flickers, thunder a little later. */
  lightning(now) {
    const f = this.s.flash ?? 0;
    if (f > 0) this.s.flash = Math.max(0, f - 0.06);
    if (now < this.nextFlash) return;
    const strength = 0.5 + Math.random() * 0.5;
    this.s.flash = strength;
    if (Math.random() < 0.5) setTimeout(() => (this.s.flash = strength * 0.8), 140);
    setTimeout(() => this.sound.thunder?.(strength), 500 + Math.random() * 1600);
    this.nextFlash = now + 7000 + Math.random() * 9000;
  }
}

/** Paints something plain when art/art.js is missing, so the story still plays. */
export function plainPaint(ctx, view, scene, t, s) {
  const g = ctx.createLinearGradient(0, 0, 0, view.h);
  g.addColorStop(0, '#0d1830');
  g.addColorStop(1, '#1d2a2c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, view.w, view.h);
  if (scene === 'room' && (s.lamp ?? 1) > 0) {
    ctx.fillStyle = `rgb(230 150 70 / ${0.12 * (s.lamp ?? 1)})`;
    ctx.fillRect(0, view.h * 0.4, view.w, view.h * 0.6);
  }
  return {};
}
