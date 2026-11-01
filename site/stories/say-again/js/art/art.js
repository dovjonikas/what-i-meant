// art.js: every picture in Say Again, drawn in code with the Canvas 2D API. The rest of
// the story calls one function, paint(), every animation frame:
//
//   paint(ctx, view, scene, t, s)
//
// ctx is already scaled for the pixel ratio, so everything is drawn in CSS pixels; view is
// { w, h, colW, colX } (the phone-wide column in the middle of a computer screen); t is
// seconds since the scene began; s holds the scene's state. Missing fields take defaults.
//
//   'room'     mood ('calm', 'fog', 'clear', 'storm', 'evening'), clock ('03:12'), lamp,
//              flash, town, kid (all 0..1), deer (0, 1 doe, 2 doe and fawn; each look has
//              its own default, fog none), tow (0..1, fog only: the boats' progress), rx
//              (true while the radio receives: the cat listens), cat (false hides it),
//              poked ({ deer, fawn, cat }: the t of a tap). Returns { lamp: {x, y, r},
//              drawing: {x, y, w, h}, window: {x, y, w, h} } and, when they are in view,
//              deer, fawn and cat as {x, y, r}.
//   'drive'    night (1..4), p (0..1, the car along the road). Returns { car }.
//   'home'     night (1..3). Returns { note }: the sheet of paper on the table.
//   'stairs'   p (0..1, colour coming back). Returns { son }.
//   'kitchen'  hand (0..1, the father's hand to the son's). Returns { hands }.
//   'drawing'  nothing. Returns { page }.
//
// The files: art-room.js with art-room-outside.js, art-room-inside.js and
// art-room-life.js; art-drive.js; art-home.js; art-stairs.js; art-kitchen.js;
// art-drawing.js; art-people.js (the father, the son, the old radio); art-coast.js (sky,
// town, water, mast, pines); art-kit.js (shared tools and the layer cache). Still parts
// are cached per scene, look and screen size, so a frame only redraws what moves.

import { cachedLayer, put, paper } from './art-kit.js';
import { paintRoom } from './art-room.js';
import { paintDrive } from './art-drive.js';
import { paintHome } from './art-home.js';
import { paintStairs } from './art-stairs.js';
import { paintKitchen } from './art-kitchen.js';
import { paintDrawingScene, drawingLights, drawingBox } from './art-drawing.js';

export { marks, clearLayers } from './art-kit.js';

export function paint(ctx, view, scene, t = 0, s = {}) {
  const dpr = Math.abs(ctx.getTransform().a) || window.devicePixelRatio || 1;
  const state = s ?? {};
  switch (scene) {
    case 'room':
      return paintRoom(ctx, view, t, state, dpr);
    case 'drive':
      return paintDrive(ctx, view, t, state, dpr);
    case 'home':
      return paintHome(ctx, view, t, state, dpr);
    case 'stairs':
      return paintStairs(ctx, view, t, state, dpr);
    case 'kitchen':
      return paintKitchen(ctx, view, t, state, dpr);
    case 'drawing': {
      const layer = cachedLayer('drawing', view, dpr, (g) => {
        paintDrawingScene(g, view);
        paper(g, view.w, view.h, 9, 0.6);
      });
      put(ctx, layer, view);
      drawingLights(ctx, view, t);
      const b = drawingBox(view);
      return { page: { x: b.cx - b.w / 2, y: b.cy - b.h / 2, w: b.w, h: b.h } };
    }
    default:
      return {};
  }
}
