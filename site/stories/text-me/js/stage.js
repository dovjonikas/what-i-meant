// stage.js: shows scenes. Each scene is painted (painter.js) into three layers, far, middle
// and near, which drift sideways very slowly at different speeds, so a still painting feels
// like a place you are standing in. Changing scene cross-fades the new one in over the old.
//
// The stage covers the whole screen. On a phone that is the column; on a computer the
// scenery carries on past the column, under the frosted glass at the sides.
//
// A scene keeps its own clock from the moment it first appears. If the screen changes size
// and the scene has to be painted again, everything carries on from where it was (people
// mid-walk, the camera mid-push) instead of starting over.

import { SCENES } from './scenes.js';
import { paintScene } from './painter.js';
import { createFx } from './fx.js';

const MARGIN = 28; // extra width painted on each side, so the drift never shows an edge
const DRIFT = [5, 12, 22]; // how far each layer drifts, far to near, in CSS pixels
const DRIFT_MS = 26000;
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Stage {
  constructor(root) {
    this.root = root;
    this.current = null;
    this.id = null;
    this.started = 0;
    this.pushed = null;
    let timer = 0;
    let size = [document.documentElement.clientWidth, window.innerHeight];
    // Only a real change of shape repaints (turning the phone, resizing a window). The
    // address bar sliding in and out on a phone changes the height a little; the layers
    // simply stretch with it.
    addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = document.documentElement.clientWidth;
        const h = window.innerHeight;
        if (w === size[0] && Math.abs(h - size[1]) < size[1] * 0.2) return;
        size = [w, h];
        if (this.id) this.show(this.id, { instant: true, force: true });
      }, 250);
    });
  }

  view() {
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    const colW = Math.min(w, 430);
    return { w, h, colW, colX: (w - colW) / 2, dpr: Math.min(window.devicePixelRatio || 1, 2), margin: MARGIN };
  }

  /** Paints scene `id` and fades it in. Resolves when the new scene is fully shown. */
  show(id, { instant = false, force = false, ms = 1600 } = {}) {
    if (id === this.id && !force) return Promise.resolve();
    const scene = SCENES[id];
    if (!scene) throw new Error(`Unknown scene: ${id}`);
    const again = force && id === this.id;
    this.id = id;
    if (!again) {
      this.started = performance.now();
      this.pushed = null;
    }
    const elapsed = performance.now() - this.started;
    const view = this.view();
    // People go on the moving layers so they can breathe and wave; the rest is painted once.
    const people = scene.layers.flatMap((it) => {
      if (it.kind === 'figure') return [{ kind: 'person', at: it.g ?? 2, person: it }];
      if (it.kind === 'people') return it.list.map((p) => ({ kind: 'person', at: it.g ?? 2, person: { rim: it.rim, rimSide: it.rimSide, ...p } }));
      return [];
    });
    const flat = { ...scene, layers: scene.layers.filter((it) => it.kind !== 'figure' && it.kind !== 'people') };
    const paints = paintScene(flat, view);
    // Each scene keeps its own hold progress and cues, so the one fading out stays exactly
    // as it was (nobody jumps back to the start of their walk) while the next fades in.
    const kept = again ? this.current : null;
    const record = { progress: kept?.progress ?? 0, cues: kept?.cues ?? {} };
    const fx = createFx([...(scene.fx ?? []), ...people], view, scene, () => record.progress, elapsed / 1000, (name) => record.cues[name]);

    const el = document.createElement('div');
    el.className = 'scene';
    el.style.cssText = 'position:absolute;inset:0;transform-origin:50% 62%;';
    paints.forEach((paint, i) => {
      const layer = document.createElement('div');
      layer.className = 'layer';
      layer.style.cssText = `position:absolute;top:0;left:${-MARGIN}px;width:${view.w + MARGIN * 2}px;height:100%;`;
      paint.style.position = 'absolute';
      paint.style.height = '100%';
      layer.append(paint);
      if (fx.canvases[i]) {
        fx.canvases[i].style.position = 'absolute';
        fx.canvases[i].style.height = '100%';
        layer.append(fx.canvases[i]);
      }
      el.append(layer);
      if (!still()) {
        const drift = layer.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${-DRIFT[i]}px,0,0)` }], {
          duration: DRIFT_MS,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out',
        });
        drift.currentTime = elapsed;
      }
    });

    const old = this.current;
    this.current = Object.assign(record, { el, fx, scene });
    this.root.append(el);
    fx.start();
    if (again && this.pushed) this.push(this.pushed.scale, this.pushed.ms, this.pushed.at);
    if (instant || !old) {
      if (old) this.retire(old);
      return Promise.resolve();
    }
    const fade = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-in-out' });
    return fade.finished.then(() => this.retire(old));
  }

  /** Moves the camera slowly in, to `scale` over `ms`: for moments to sit with. */
  push(scale, ms, at = performance.now()) {
    if (!this.current || still()) return;
    this.pushed = { scale, ms, at };
    // A symmetric ease, so the move starts and settles as gently as it travels (the plain
    // CSS ease front-loads it, which reads as a jolt on a slow push).
    const move = this.current.el.animate([{ transform: 'scale(1)' }, { transform: `scale(${scale})` }], {
      duration: ms, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'forwards',
    });
    move.currentTime = Math.min(ms, performance.now() - at);
  }

  /** Somebody in the picture does what they do at this line: their acts with `on: name` (fx.js). */
  cue(name) {
    if (this.current) this.current.cues[name] = this.current.fx.now();
  }

  /** How far the player has held in this scene's hold beat, 0 to 1; people with a track follow it. */
  get progress() {
    return this.current?.progress ?? 0;
  }

  set progress(value) {
    if (this.current) this.current.progress = value;
  }

  retire(old) {
    old.fx.stop();
    old.el.remove();
    // Safari keeps a removed canvas's memory for a while; emptying it frees it now, which
    // matters on a phone after dozens of scenes.
    for (const canvas of old.el.querySelectorAll('canvas')) canvas.width = canvas.height = 0;
  }

  get scene() {
    return this.current?.scene;
  }
}
