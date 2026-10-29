// stage.js: shows scenes. Each scene is painted (painter.js) into three layers, far, middle
// and near, which drift sideways very slowly at different speeds, so a still painting feels
// like a place you are standing in. Changing scene cross-fades the new one in over the old.
//
// The stage covers the whole screen. On a phone that is the column; on a computer the
// scenery carries on past the column, under the frosted glass at the sides.

import { SCENES } from './scenes.js';
import { paintScene } from './painter.js';
import { createFx } from './fx.js';

const MARGIN = 28; // extra width painted on each side, so the drift never shows an edge
const DRIFT = [5, 12, 22]; // how far each layer drifts, far to near, in CSS pixels
const DRIFT_MS = 26000;

export class Stage {
  constructor(root) {
    this.root = root;
    this.current = null;
    this.id = null;
    let timer = 0;
    addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.id && this.show(this.id, { instant: true, force: true }), 250);
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
    this.id = id;
    const view = this.view();
    // People go on the moving layers so they can breathe and wave; the rest is painted once.
    const people = scene.layers.flatMap((it) => {
      if (it.kind === 'figure') return [{ kind: 'person', at: it.g ?? 2, person: it }];
      if (it.kind === 'people') return it.list.map((p) => ({ kind: 'person', at: it.g ?? 2, person: { rim: it.rim, rimSide: it.rimSide, ...p } }));
      return [];
    });
    const still = { ...scene, layers: scene.layers.filter((it) => it.kind !== 'figure' && it.kind !== 'people') };
    const paints = paintScene(still, view);
    const fx = createFx([...(scene.fx ?? []), ...people], view, scene);

    const el = document.createElement('div');
    el.className = 'scene';
    el.style.cssText = 'position:absolute;inset:0;transform-origin:50% 62%;';
    paints.forEach((paint, i) => {
      const layer = document.createElement('div');
      layer.className = 'layer';
      layer.style.cssText = `position:absolute;top:0;left:${-MARGIN}px;width:${view.w + MARGIN * 2}px;height:100%;`;
      paint.style.position = 'absolute';
      layer.append(paint);
      if (fx.canvases[i]) {
        fx.canvases[i].style.position = 'absolute';
        layer.append(fx.canvases[i]);
      }
      el.append(layer);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        layer.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${-DRIFT[i]}px,0,0)` }], {
          duration: DRIFT_MS,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out',
        });
      }
    });

    const old = this.current;
    this.current = { el, fx, scene };
    this.root.append(el);
    fx.start();
    if (instant || !old) {
      if (old) this.retire(old);
      return Promise.resolve();
    }
    const fade = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-in-out' });
    return fade.finished.then(() => this.retire(old));
  }

  /** Moves the camera slowly in, to `scale` over `ms`: for moments to sit with. */
  push(scale, ms) {
    if (!this.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.current.el.animate([{ transform: 'scale(1)' }, { transform: `scale(${scale})` }], {
      duration: ms, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', fill: 'forwards',
    });
  }

  retire(old) {
    old.fx.stop();
    old.el.remove();
  }

  get scene() {
    return this.current?.scene;
  }
}
