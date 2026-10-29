// check.js: a work tool for the art, used by scenes.html?check. It paints every prop of
// every scene on its own blank canvas, finds the box its visible pixels cover, and reports
// any prop that reaches past the phone-wide column or the bottom of the screen. Hills, sky
// and other full-width layers, and props marked `bleed: true` span the width on purpose and are skipped.
// Faint glow (under 10% opacity) does not count as reaching.

import { SCENES } from './scenes.js';
import { makePen, LAYERS } from './painter.js';
import { drawProp } from './props.js';

export function checkScenes(view) {
  const problems = [];
  const cssW = view.w + view.margin * 2;
  const canvas = document.createElement('canvas');
  canvas.width = cssW;
  canvas.height = view.h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const left = view.margin + view.colX;
  const right = left + view.colW;
  for (const [id, scene] of Object.entries(SCENES)) {
    const pen = makePen(scene, { ...view, dpr: 1 });
    scene.layers.forEach((item, i) => {
      if (LAYERS[item.kind] || item.bleed || item.kind === 'glow') return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cssW, view.h);
      drawProp(ctx, item, pen);
      const box = visibleBox(ctx.getImageData(0, 0, cssW, view.h), 26);
      if (!box) return;
      const out = [];
      if (box.x0 < left) out.push(`left by ${Math.ceil(left - box.x0)}px`);
      if (box.x1 > right) out.push(`right by ${Math.ceil(box.x1 - right)}px`);
      if (box.y0 < 0) out.push('top');
      if (box.y1 > view.h) out.push('bottom');
      if (out.length) problems.push(`${id} #${i} ${item.kind}: past the ${out.join(', ')}`);
    });
  }
  return problems;
}

// Real-world sizes next to a standing adult of height H, as [lowest, highest] multiples
// of H, and how to read each prop's size from its scene entry (in column widths).
const SIZES = {
  house: { range: [1.2, 2.2], size: (it) => (it.w ?? 0.3) * (it.tall ?? 0.55), what: 'wall height' },
  car: { range: [0.7, 1.0], size: (it) => (it.w ?? 0.2) * 0.34, what: 'height' },
  bus: { range: [1.4, 2.0], size: (it) => (it.w ?? 0.6) * 0.33, what: 'height' },
  bench: { range: [0.2, 0.32], size: (it) => (it.w ?? 0.2) * 0.22, what: 'seat height' },
  lamp: { range: [2.2, 3.6], size: (it) => it.h ?? 0.4, what: 'height' },
  desk: { range: [0.38, 0.5], size: (it) => it.top ?? 0.26, what: 'height' },
  busstop: { range: [1.2, 1.7], size: (it) => (it.w ?? 0.22) * 0.75, what: 'roof height' },
};

/**
 * Compares props with the people standing at the same depth (feet within 3% of the screen
 * height of each other) and reports sizes no real place would have: a door twice a
 * person's height, a laptop as big as the person. Children are checked against adults.
 */
export function checkScales() {
  const problems = [];
  for (const [id, scene] of Object.entries(SCENES)) {
    const people = scene.layers.flatMap((it) =>
      it.kind === 'figure' ? [it] : it.kind === 'people' ? it.list : []);
    const adults = people.filter((p) => (p.age ?? 'adult') !== 'child' && p.pose !== 'sit' && p.pose !== 'bike');
    const near = (y) => adults.filter((p) => Math.abs(p.y - y) < 0.03);
    scene.layers.forEach((it, i) => {
      const rule = SIZES[it.kind];
      if (!rule) return;
      for (const p of near(it.y)) {
        const k = rule.size(it) / (p.h ?? 0.18);
        if (k < rule.range[0] || k > rule.range[1]) {
          problems.push(`${id} #${i} ${it.kind}: ${rule.what} is ${k.toFixed(2)} of a person, expected ${rule.range.join(' to ')}`);
        }
      }
    });
    for (const child of people.filter((p) => p.age === 'child')) {
      for (const p of near(child.y)) {
        const k = (child.h ?? 0.1) / (p.h ?? 0.18);
        if (k < 0.4 || k > 0.8) problems.push(`${id}: a child is ${k.toFixed(2)} of the adult next to it, expected 0.4 to 0.8`);
      }
    }
  }
  return problems;
}

function visibleBox(img, minAlpha) {
  const { width, height, data } = img;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > minAlpha) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
  }
  return x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}
