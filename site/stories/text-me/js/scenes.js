// scenes.js: every place the story shows, as data for painter.js and fx.js.
//
// A scene has: `sky` (colours top to horizon), `fog` (the colour far layers fade into),
// `vibrance` (1 is full colour, lower drains it; the acts move this), `layers` (painted far
// to near; `g` puts an item on the far 0, middle 1 or near 2 canvas so it drifts at its own
// speed), `fx` (moving things, see fx.js) and `ambience` (see sfx.js).
//
// One colour plan runs through the whole life: dawn and morning for early childhood, a
// bright noon for school summers, dusk and a drained blue night for leaving home, dawn again
// for finding your feet, golden afternoon and autumn while the parents get old, and a clear
// night with warm windows for the end. Grief scenes are near grey but keep their shapes.
//
// People are faceless on purpose. Items marked `bleed: true` are allowed past the column
// edges (framing trees, the ground); everything else must stay inside it, which
// scenes.html?check checks.

// Palettes by time of day. sky: top to horizon; far, mid and near: the three hill layers;
// ground: what people stand on; rim: the light edge on silhouettes; sun: the disc.
// The colour script (docs/reports/Attachment loss and story UI.md): every part of the life
// owns its own hue family and saturation, so the change between parts is felt. Childhood
// is the brightest, the teen summers the most saturated, the city years violet, the present
// on the porch cold petrol teal and nearly still. After each death the world drains: grey
// after the dog, slate after Dad, the deepest drain after Mom. The late years are pale and
// calm, and the story ends with the porch light going out. Built in OKLab so the blends
// keep their hue.
const P = {
  dawn: { sky: ['#6e7fc4', '#a98bc0', '#d6b1b2', '#ffc3a6'], fog: '#f6cfc4', far: '#ad919b', mid: '#76637a', near: '#594a68', ground: '#4a3c5e', ink: '#2a2238', rim: '#ffe4c9', sun: '#fff4e2' },
  morning: { sky: ['#5db8e8', '#a3d0dc', '#d5e2d0', '#fff0c2'], fog: '#d9f0e6', far: '#9ecdbc', mid: '#6eb29b', near: '#50a28a', ground: '#3e9a80', ink: '#1f4d45', rim: '#fff7de', sun: '#fff6cf' },
  noon: { sky: ['#1e7fe0', '#4da8e8', '#70c8ed', '#8fe3f0'], fog: '#b9f0ee', far: '#7cbfb2', mid: '#499a84', near: '#29856b', ground: '#0e7a5e', ink: '#0b3f33', rim: '#fffbe0', sun: '#fffdf2' },
  golden: { sky: ['#4d7fc0', '#d9a27a', '#cdc2a1', '#ffd98a'], fog: '#efbb78', far: '#a97e52', mid: '#755135', near: '#593926', ground: '#4a2c1e', ink: '#2a1912', rim: '#ffe2a2', sun: '#fff3cf' },
  dusk: { sky: ['#3b2c6e', '#8a3f78', '#c37d6b', '#ff9a5a'], fog: '#e77a6a', far: '#9d565c', mid: '#663a4e', near: '#492b45', ground: '#3a2240', ink: '#1c1024', rim: '#ffb07a', sun: '#ffe2a8' },
  blue: { sky: ['#121a40', '#384671', '#5b6c9c', '#7c8fc2'], fog: '#4f6194', far: '#35436d', mid: '#222c4f', near: '#17203f', ground: '#121a36', ink: '#0a0f22', rim: '#9fb0e0', sun: '#e8eef7' },
  night: { sky: ['#0a0f24', '#1c2544', '#2c385f', '#3a4a78'], fog: '#2a3866', far: '#1e2950', mid: '#151e3e', near: '#111735', ground: '#0e1430', ink: '#0a0e1e', rim: '#4a5b8c', sun: '#eef1fb' },
  frame: { sky: ['#08141c', '#10232b', '#182f38', '#1e3a44'], fog: '#2a4b54', far: '#1e353d', mid: '#14252b', near: '#0f1c21', ground: '#0c171c', ink: '#050b0f', rim: '#6fa0a6', sun: '#e6f0ee' },
  city: { sky: ['#120f2a', '#221b43', '#2f2558', '#3b2e6b'], fog: '#5b3f7a', far: '#3e2c58', mid: '#281e3f', near: '#1c1631', ground: '#16122a', ink: '#0b0a16', rim: '#7fe3ff', sun: '#e8e4ff' },
  snow: { sky: ['#8a8e9e', '#a9abb8', '#c8c4cc', '#d9d4d8'], fog: '#cfcbd3', far: '#aeb0bd', mid: '#8a8a99', near: '#5c5a68', ground: '#e4e2e6', ink: '#3e3a45', rim: '#ffffff', sun: '#ffffff' },
  autumn: { sky: ['#4f8fc0', '#96a6ab', '#cab695', '#f6c27a'], fog: '#f0cfa0', far: '#ba9780', mid: '#916d67', near: '#7a565a', ground: '#6e4a52', ink: '#2a1a20', rim: '#ffe0a8', sun: '#fff1d6' },
  grey: { sky: ['#5a6b78', '#85898b', '#a9a299', '#c9b8a6'], fog: '#b7b2aa', far: '#898680', mid: '#676460', near: '#54524f', ground: '#4a4846', ink: '#1e1e22', rim: '#e6ded2', sun: '#f2eee8' },
  slate: { sky: ['#4a5563', '#646f7c', '#7a8591', '#8e98a3'], fog: '#a7afb7', far: '#747a82', mid: '#4d535a', near: '#393e45', ground: '#2e333a', ink: '#1b1f24', rim: '#c9d1d9', sun: '#e4e8ec' },
  drain: { sky: ['#2f3442', '#464754', '#5a5663', '#6b6470'], fog: '#77707a', far: '#514d56', mid: '#35323a', near: '#26242c', ground: '#1e1d24', ink: '#121117', rim: '#9a93a0', sun: '#c8c2cc' },
  late: { sky: ['#a9b4c6', '#c6c6cc', '#ded5d0', '#f3e2d3'], fog: '#ece4de', far: '#beb6b9', mid: '#9b929c', near: '#877f8d', ground: '#7d7484', ink: '#3a3440', rim: '#fff6ec', sun: '#fffaf2' },
};

/**
 * The usual three hill layers with mist between them, plus sun, moon and stars. `h` is the
 * horizon height; `peaks` how tall the far mountains are.
 */
function backdrop(p, o = {}) {
  const h = o.h ?? 0.5;
  const out = [];
  if (o.stars) out.push({ kind: 'stars', count: o.stars, bottom: h - 0.05, g: 0 });
  if (o.sun) out.push({ kind: 'sun', color: p.sun, glow: o.sun.glow ?? p.rim, r: 0.065, halo: 0.9, ...o.sun, g: 0 });
  if (o.moon) out.push({ kind: 'moon', color: p.sun, glow: p.rim, r: 0.045, ...o.moon, g: 0 });
  if (o.far !== false) {
    out.push({ kind: 'ridge', y: h, amp: o.peaks ?? 0.42, freq: 1.05, ridged: true, sharp: 1.3, color: p.far, haze: 0.42, mist: 0.55, seed: o.seed ?? 4, g: 0 });
    out.push({ kind: 'mist', y: h + 0.015, h: 0.05, alpha: 0.5, g: 0 });
  }
  if (o.mid !== false) {
    out.push({ kind: 'ridge', y: h + 0.07, amp: 0.17, freq: 1.7, color: p.mid, haze: 0.22, mist: 0.5, seed: (o.seed ?? 4) + 5, trees: { h: 0.026 }, g: 1 });
    out.push({ kind: 'mist', y: h + 0.085, h: 0.04, alpha: 0.42, g: 1 });
  }
  if (o.near !== false) {
    out.push({ kind: 'ridge', y: h + 0.15, amp: 0.08, freq: 1.2, color: p.near, haze: 0.06, mist: 0.35, seed: (o.seed ?? 4) + 9, trees: { h: 0.055, gap: 0.03 }, g: 1 });
  }
  return out;
}

/** Ground for people to stand on, darker toward the bottom where the words go. */
function ground(p, y = 0.72, seed = 2) {
  return { kind: 'ground', y, color: p.ground, amp: 0.025, seed, mist: 0, hold: 0.2, g: 2, bleed: true };
}

/**
 * A track written by the clock, for people and pets that move on their own: `keys` are
 * [seconds, x, y, h], `poses` are [seconds, pose, {fields}]. fx.js moves along a track at
 * an even pace per point, so the keys are filled in every tenth of a second; standing
 * still is two keys with the same place. Returns { seconds, track, poses } to spread into
 * a person.
 */
function timed(keys, poses = []) {
  const seconds = keys[keys.length - 1][0];
  const steps = Math.round(seconds * 10);
  const track = [];
  for (let n = 0; n <= steps; n += 1) {
    const s = n / 10;
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1][0] < s) i += 1;
    const [t0, ...a] = keys[i];
    const [t1, ...b] = keys[i + 1];
    const u = t1 > t0 ? Math.min(1, Math.max(0, (s - t0) / (t1 - t0))) : 1;
    track.push(a.map((v, j) => Math.round((v + (b[j] - v) * u) * 10000) / 10000));
  }
  return { seconds, track, poses: poses.map(([s, pose, extra]) => [s / seconds, pose, extra]) };
}

/** A lines-view background: mostly sky, a low range far down. */
function linesBack(p, o = {}) {
  return {
    sky: p.sky,
    skyEnd: 0.95,
    fog: p.fog,
    vibrance: o.vibrance ?? 0.9,
    ambience: o.ambience,
    fx: o.fx ?? [],
    layers: [
      ...(o.stars ? [{ kind: 'stars', count: o.stars, bottom: 0.75, g: 0 }] : []),
      ...(o.moon ? [{ kind: 'moon', color: p.sun, glow: p.rim, x: 0.8, y: 0.12, r: 0.035, g: 0 }] : []),
      { kind: 'ridge', y: 0.9, amp: 0.2, freq: 1.2, ridged: true, color: p.far, haze: 0.55, mist: 0.6, seed: o.seed ?? 6, g: 0 },
      { kind: 'mist', y: 0.9, h: 0.06, alpha: 0.5, g: 0 },
      { kind: 'ridge', y: 0.97, amp: 0.07, freq: 1.6, color: p.mid, haze: 0.4, mist: 0.4, seed: (o.seed ?? 6) + 3, trees: { h: 0.02 }, g: 1 },
    ],
  };
}

export const SCENES = {
  // The frame: an old house on a hill at night. Somebody just drove away down the valley.
  porch: {
    sky: P.frame.sky,
    fog: P.frame.fog,
    vibrance: 0.9,
    ambience: 'night',
    fx: [
      { kind: 'stars', bottom: 0.4 },
      { kind: 'taillights', at: 1, path: [[0.95, 0.655], [0.9, 0.61], [0.66, 0.6], [0.62, 0.575]], delay: 0.8, seconds: 12 },
    ],
    layers: [
      ...backdrop(P.frame, { h: 0.5, stars: 150, moon: { x: 0.24, y: 0.15 }, peaks: 0.36, seed: 4 }),
      { kind: 'road', path: [[1.1, 0.7], [0.9, 0.6], [0.66, 0.6], [0.61, 0.57]], w0: 0.07, w1: 0.008, color: '#1f3c46', hazeFar: 0.5, g: 1 },
      { kind: 'ground', y: 0.72, color: P.frame.ground, amp: 0.03, seed: 2, mist: 0, g: 2, bleed: true },
      { kind: 'glow', x: 0.42, y: 0.66, r: 0.55, color: '#ffb35c', alpha: 0.2, g: 2 },
      { kind: 'house', x: 0.36, y: 0.75, w: 0.5, tall: 0.6, color: '#06121a', rim: '#6fa0a6', lit: '#ffc46b', door: 0.12, doorLit: '#ffd38a', windows: [{ x: -0.36, s: 0.14 }, { x: 0.33, s: 0.12 }], g: 2 },
      { kind: 'figure', who: 'me', x: 0.43, y: 0.748, h: 0.17, age: 'old', light: 0.32, rim: '#ffcf86', rimSide: -1, g: 2 },
      { kind: 'pine', x: 0.95, y: 0.9, h: 0.78, color: '#030a0d', seed: 31, g: 2, bleed: true },
    ],
  },

  // The present while you wait (the returns between the parts of the life, and the end):
  // the same house, the car long gone, the kitchen light on and you at the window. The moon
  // sits low on the right, clear of the lock screen's clock.
  porchLate: {
    sky: P.frame.sky,
    fog: P.frame.fog,
    vibrance: 0.85,
    ambience: 'night',
    fx: [{ kind: 'stars', bottom: 0.4 }],
    layers: [
      ...backdrop(P.frame, { h: 0.5, stars: 170, moon: { x: 0.8, y: 0.405 }, peaks: 0.36, seed: 4 }),
      { kind: 'road', path: [[1.1, 0.7], [0.9, 0.6], [0.66, 0.6], [0.61, 0.57]], w0: 0.07, w1: 0.008, color: '#1f3c46', hazeFar: 0.5, g: 1 },
      { kind: 'ground', y: 0.72, color: P.frame.ground, amp: 0.03, seed: 2, mist: 0, g: 2, bleed: true },
      { kind: 'glow', x: 0.2, y: 0.62, r: 0.35, color: '#ffb35c', alpha: 0.16, g: 2 },
      { kind: 'house', x: 0.36, y: 0.75, w: 0.5, tall: 0.6, color: '#06121a', rim: '#6fa0a6', lit: '#ffc46b', door: 0.12, windows: [{ x: -0.36, s: 0.14, who: true }, { x: 0.33, s: 0.12, lit: null }], g: 2 },
      { kind: 'pine', x: 0.95, y: 0.9, h: 0.78, color: '#030a0d', seed: 31, g: 2, bleed: true },
    ],
  },

  // Age 0 to 3: the family house in a valley at dawn.
  dawnHouse: {
    sky: P.dawn.sky,
    fog: P.dawn.fog,
    vibrance: 0.85,
    ambience: 'morning',
    fx: [{ kind: 'birds', count: 3, y: 0.2 }, { kind: 'smoke', at: 1, x: 0.6, y: 0.585 }, { kind: 'motes', count: 14 }],
    layers: [
      ...backdrop(P.dawn, { h: 0.5, sun: { x: 0.7, y: 0.36 }, seed: 21 }),
      { kind: 'house', x: 0.55, y: 0.68, w: 0.3, color: '#2a2540', rim: '#ffd9b0', lit: '#ffcf7a', windows: [{ x: -0.26 }, { x: 0.12, lit: null }], g: 1 },
      ground(P.dawn, 0.72, 5),
      { kind: 'fence', x: 0.04, x2: 0.4, y: 0.735, h: 0.05, color: P.dawn.ink, g: 2 },
      { kind: 'tree', x: 0.14, y: 0.75, h: 0.36, color: P.dawn.ink, rim: P.dawn.rim, seed: 4, g: 2 },
      // Your first word is no, arms folded. Dad says you get that from Mom: she turns on him,
      // hands on hips, and he puts his up, laughing. Then she says nothing, arms folded
      // just like yours. Each move comes with its line (`act` in script.js).
      { kind: 'people', rim: P.dawn.rim, list: [
        { who: 'mom', x: 0.6, y: 0.8, h: 0.22, pose: 'hand', face: -1, acts: [
          { on: 'no', pose: 'stand', face: -1 },
          { on: 'fromMom', pose: 'hips', face: 1 },
          { on: 'alsoNo', pose: 'cross', face: -1 },
        ] },
        { who: 'me', x: 0.5, y: 0.8, h: 0.115, age: 'child', pose: 'walk', acts: [{ on: 'no', pose: 'cross' }] },
        { who: 'dad', x: 0.79, y: 0.81, h: 0.235, face: -1, acts: [
          { on: 'fromMom', pose: 'shrug', laugh: true, face: -1 },
          { on: 'alsoNo', pose: 'stand', laugh: true, face: -1 },
        ] },
      ], g: 2 },
      { kind: 'pine', x: 1.04, y: 0.95, h: 0.8, color: '#141024', seed: 41, g: 2, bleed: true },
    ],
  },

  // Age 6: Grandma's garden on a summer morning. Grandpa on the bench under the apple tree,
  // peeling you an apple in one long curl while you watch; Grandma at her door.
  garden: {
    sky: P.morning.sky,
    fog: P.morning.fog,
    vibrance: 1,
    ambience: 'morning',
    fx: [{ kind: 'birds', count: 2, y: 0.16 }, { kind: 'clouds', at: 0, count: 3 }, { kind: 'motes', count: 18 }],
    layers: [
      ...backdrop(P.morning, { h: 0.52, sun: { x: 0.2, y: 0.18, r: 0.05, halo: 0.7 }, peaks: 0.3, seed: 33 }),
      ground(P.morning, 0.72, 8),
      { kind: 'house', x: 0.74, y: 0.73, w: 0.4, color: '#1d3a35', roof: '#7a3b2e', rim: P.morning.rim, windows: [{ x: -0.3 }], door: 0.12, g: 2 },
      { kind: 'tree', x: 0.3, y: 0.76, h: 0.5, color: '#1f4a3a', rim: P.morning.rim, fruit: '#d8463a', seed: 12, g: 2 },
      { kind: 'fence', x: -0.1, x2: 0.62, y: 0.765, h: 0.055, color: P.morning.ink, g: 2, bleed: true },
      { kind: 'bench', x: 0.36, y: 0.795, w: 0.26, seat: 0.057, color: '#5a3a26', rim: P.morning.rim, g: 2 },
      { kind: 'people', rim: P.morning.rim, list: [
        { who: 'grandma', x: 0.816, y: 0.735, h: 0.15, age: 'old' , face: -1 },
        { who: 'grandpa', x: 0.33, y: 0.795, h: 0.21, age: 'old', pose: 'sit', hands: 'peel', curlSeconds: 14 },
        { who: 'me', x: 0.53, y: 0.805, h: 0.135, age: 'child', face: -1 },
      ], g: 2 },
    ],
  },

  // Age 7: dad running behind the bike, holding the seat.
  bike: {
    sky: P.golden.sky,
    fog: P.golden.fog,
    vibrance: 1,
    ambience: 'summer',
    fx: [{ kind: 'birds', count: 2, y: 0.22 }, { kind: 'clouds', at: 0, count: 2, color: 'rgb(255 236 210 / 0.3)' }, { kind: 'motes', count: 16 }],
    layers: [
      ...backdrop(P.golden, { h: 0.5, sun: { x: 0.78, y: 0.4, r: 0.07 }, seed: 51 }),
      { kind: 'ground', y: 0.66, color: P.golden.ground, amp: 0.02, seed: 7, mist: 0, g: 1, bleed: true },
      { kind: 'road', path: [[0.5, 1.05], [0.42, 0.78], [0.62, 0.68], [0.55, 0.62]], w0: 0.7, w1: 0.02, color: '#a87a55', hazeFar: 0.7, g: 2, bleed: true },
      { kind: 'tree', x: 0.18, y: 0.68, h: 0.4, color: P.golden.ink, rim: P.golden.rim, seed: 2, g: 2 },
      // Holding to pedal moves both along their tracks: you ride off up the road and get
      // small; Dad runs a few steps, lets go, stops close by and waves.
      { kind: 'figure', who: 'me', x: 0.49, y: 0.85, h: 0.16, age: 'child', pose: 'bike', track: [[0.49, 0.85, 0.16], [0.52, 0.76, 0.11], [0.555, 0.69, 0.07], [0.565, 0.65, 0.045]], rim: P.golden.rim, g: 2 },
      { kind: 'figure', who: 'dad', x: 0.33, y: 0.87, h: 0.23, pose: 'push', bend: 0.55, track: [[0.33, 0.87, 0.23], [0.39, 0.84, 0.228], [0.41, 0.835, 0.228], [0.41, 0.835, 0.228]], poses: [[0.3, 'stand', { bend: 0 }], [0.6, 'wave', { bend: 0 }]], rim: P.golden.rim, g: 2 },
    ],
  },

  // Age 5: Dad home with a box that moves. The puppy runs circles round the yard. Mom is
  // not there until she says absolutely not: out of the door, hands on hips. The puppy runs
  // straight to her and sits on her foot, and she crouches down to him. Once you have named
  // him, his name comes up over him again.
  puppy: {
    sky: P.morning.sky,
    fog: P.morning.fog,
    vibrance: 1,
    ambience: 'morning',
    fx: [{ kind: 'clouds', at: 0, count: 3 }, { kind: 'birds', count: 2, y: 0.18 }, { kind: 'motes', count: 14 }],
    layers: [
      ...backdrop(P.morning, { h: 0.5, sun: { x: 0.8, y: 0.16, r: 0.05, halo: 0.6 }, peaks: 0.3, seed: 35 }),
      { kind: 'house', x: 0.24, y: 0.73, w: 0.4, color: '#1d3a35', roof: '#7a3b2e', rim: P.morning.rim, lit: null, door: 0.12, windows: [{ x: -0.32 }], g: 2 },
      ground(P.morning, 0.72, 11),
      { kind: 'box', x: 0.7, y: 0.8, w: 0.11, rim: P.morning.rim, g: 2 },
      { kind: 'people', rim: P.morning.rim, list: [
        { who: 'dad', x: 0.82, y: 0.8, h: 0.24, face: -1 },
        { who: 'me', x: 0.5, y: 0.83, h: 0.12, age: 'child', pose: 'sit', seat: 'ground' },
        { who: 'mom', hidden: true, x: 0.37, y: 0.8, h: 0.235, acts: [
          { on: 'mom', ...timed([[0, 0.316, 0.733, 0.17], [1.8, 0.37, 0.8, 0.235]], [[0, 'walk'], [1.8, 'hips']]) },
          { on: 'pet', pose: 'pet', squat: 1, bend: 0.35 },
        ] },
        { who: 'dog', age: 'puppy', x: 0.43, y: 0.806, h: 0.034, tagOn: 'named', loop: true, seconds: 3.4, track: [[0.58, 0.84, 0.035], [0.66, 0.815, 0.033], [0.72, 0.84, 0.035], [0.64, 0.865, 0.037], [0.58, 0.84, 0.035]], acts: [
          { on: 'won', turn: true, ...timed([[0, 0.6, 0.84, 0.035], [1.3, 0.43, 0.806, 0.034]], [[0, 'stand', { wag: 1 }], [1.3, 'front', { wag: 1 }]]) },
        ] },
      ], g: 2 },
    ],
  },

  // Age 5, that night: your room in the dark, you asleep, the puppy asleep on your feet.
  puppyNight: {
    sky: P.night.sky,
    fog: P.night.fog,
    vibrance: 0.8,
    ambience: 'night',
    shade: '#1a2238',
    fx: [{ kind: 'stars', at: 0, bottom: 0.4 }],
    layers: [
      { kind: 'stars', count: 70, bottom: 0.45, g: 0 },
      { kind: 'moon', x: 0.66, y: 0.2, r: 0.045, color: '#f4f2ea', glow: '#a9b8e0', g: 0 },
      { kind: 'room', window: [0.22, 0.1, 0.84, 0.42], color: '#1b2340', frame: '#2c3760', g: 1, bleed: true },
      { kind: 'band', y: 0.8, y2: 1, color: '#221c2e', planks: 5, trim: '#2c2640', g: 1, bleed: true },
      { kind: 'glow', x: 0.55, y: 0.62, r: 0.5, color: '#a9b8e0', alpha: 0.1, g: 1 },
      { kind: 'glow', x: 0.08, y: 0.78, r: 0.32, color: '#ffb35c', alpha: 0.16, g: 1 },
      { kind: 'bed', x: 0.5, y: 0.9, top: 0.78, w: 0.7, who: 'me', rim: '#a9b8e0', g: 2 },
      { kind: 'people', list: [
        { who: 'dog', age: 'puppy', pose: 'lie', x: 0.72, y: 0.775, h: 0.085, face: -1, wag: 0.1, light: 0.7, rim: '#a9b8e0' },
      ], g: 2 },
    ],
  },

  // Age 5: the hall. One shoe gone from every pair, and out of the dark under the stairs
  // comes the puppy with yours.
  hallShoes: {
    sky: P.morning.sky,
    fog: P.morning.fog,
    vibrance: 1,
    ambience: 'morning',
    light: 0.9,
    shade: '#6e5238',
    fx: [{ kind: 'motes', count: 16 }],
    layers: [
      { kind: 'band', y: 0, y2: 0.72, color: '#d9b98a', g: 1, bleed: true },
      { kind: 'band', y: 0.72, y2: 1, color: '#8a5a36', planks: 6, trim: '#6b4428', g: 1, bleed: true },
      { kind: 'door', x: 0.78, y: 0.72, w: 0.3, h: 0.78, pane: '#fff3d6', g: 1 },
      { kind: 'stairs', x: 0.58, x2: -0.12, y: 0.72, top: 0.18, steps: 9, g: 1, bleed: true },
      { kind: 'shoes', x: 0.5, x2: 1.02, y: 0.79, s: 0.1, list: ['#2f5a4e', '#8a2a3a', '#b8473a'], gone: [0, 1, 1], g: 2 },
      { kind: 'people', list: [
        { who: 'dog', age: 'puppy', x: 0.4, y: 0.88, h: 0.1, turn: true, ...timed([
          [0, 0.13, 0.73, 0.085], [0.9, 0.13, 0.73, 0.085], [2.4, 0.36, 0.86, 0.098], [2.8, 0.4, 0.88, 0.1], [12, 0.4, 0.88, 0.1],
        ], [[0, 'stand', { shoe: true, wag: 0.5, light: 0.12 }], [1.3, 'stand', { shoe: true, wag: 0.9, light: 0.45 }], [1.8, 'stand', { shoe: true, wag: 1 }], [2.8, 'front', { shoe: true, wag: 1 }]]) },
      ], g: 2 },
    ],
  },

  // Age 7: the first day of school, seen from the back of the class. The new kid's chair
  // is broken (there, by the empty desk ahead), so they sit at your desk, next to you.
  // Sun through the window, dust in it, a blackboard with the alphabet started.
  school: {
    sky: P.morning.sky,
    fog: P.morning.fog,
    vibrance: 1,
    ambience: 'morning',
    light: 0.86,
    shade: '#6e5238',
    lightFrom: -1,
    fx: [{ kind: 'motes', count: 28 }],
    layers: [
      ...backdrop(P.morning, { h: 0.4, sun: { x: 0.12, y: 0.17, r: 0.045, halo: 0.5 }, peaks: 0.25, seed: 61, near: false }),
      { kind: 'tree', x: 0.27, y: 0.58, h: 0.42, color: P.morning.near, rim: P.morning.rim, seed: 4, g: 0 },
      { kind: 'room', window: [0.04, 0.12, 0.36, 0.5], color: '#dcc497', frame: '#f2e6cc', g: 1, bleed: true },
      { kind: 'band', y: 0.55, y2: 0.7, color: '#b98f5c', trim: '#f2e6cc', g: 1, bleed: true },
      { kind: 'band', y: 0.7, y2: 1, color: '#7a5233', planks: 6, trim: '#5a3b24', g: 1, bleed: true },
      { kind: 'board', x: 0.69, y: 0.47, w: 0.48, h: 0.22, g: 1 },
      { kind: 'sunbeam', from: [0.04, 0.36, 0.5], to: [0.04, 0.42, 0.86], alpha: 0.14, g: 1 },
      { kind: 'desk', x: 0.16, y: 0.775, w: 0.24, top: 0.11, screen: null, color: '#8a5a32', rim: '#ffe9b8', g: 1 },
      { kind: 'chair', x: 0.12, y: 0.865, h: 0.2, broken: true, rim: '#ffe9b8', g: 1 },
      { kind: 'desk', x: 0.575, y: 0.9, w: 0.66, top: 0.255, screen: null, color: '#8a5a32', rim: '#ffe9b8', g: 1 },
      // The two of you on the middle layer, so your chairs, on the near one, are in front.
      { kind: 'people', rim: '#ffe9b8', rimSide: -1, list: [
        { who: 'me', x: 0.43, y: 0.93, h: 0.62, age: 'child', pose: 'sit', back: true, bend: 0.09 },
        { who: 'friend', x: 0.72, y: 0.93, h: 0.6, age: 'child', pose: 'sit', back: true, face: -1, bend: 0.1 },
      ], g: 1 },
      { kind: 'chair', x: 0.43, y: 0.935, h: 0.31, rim: '#ffe9b8', g: 2 },
      { kind: 'chair', x: 0.72, y: 0.935, h: 0.3, rim: '#ffe9b8', g: 2 },
    ],
  },

  // Age 12: walking home from school. He is at the gate before you are round the corner.
  dogGate: {
    sky: P.golden.sky,
    fog: P.golden.fog,
    vibrance: 1,
    ambience: 'summer',
    fx: [{ kind: 'clouds', at: 0, count: 2, color: 'rgb(255 236 210 / 0.3)' }, { kind: 'motes', count: 16 }],
    layers: [
      ...backdrop(P.golden, { h: 0.5, sun: { x: 0.25, y: 0.42 }, seed: 57 }),
      ground(P.golden, 0.72, 13),
      { kind: 'house', x: 0.72, y: 0.74, w: 0.42, color: P.golden.ink, roof: '#6b3020', rim: P.golden.rim, rimSide: -1, windows: [{ x: -0.3 }, { x: 0.18 }], g: 2 },
      { kind: 'gate', x: 0.62, y: 0.79, h: 0.075, from: -0.1, to: 1.1, color: '#3a2418', rim: P.golden.rim, rimSide: -1, g: 2, bleed: true },
      // You come round the corner from the left. Until then he lies at the gate looking
      // down the road; the moment you are in sight he is up, tail going, and runs to you,
      // zooms about in front of you, then sits down facing us while you walk up beside him.
      // He is drawn after you, so his zooming stays in front of you, never behind.
      // `x` and `y` are where each one ends up, which is what the bounds check looks at.
      { kind: 'people', rim: P.golden.rim, rimSide: -1, list: [
        { who: 'me', x: 0.4, y: 0.858, h: 0.178, age: 'child', pose: 'walk', ...timed([
          [0, -0.12, 0.872, 0.18], [1.6, 0.04, 0.87, 0.18], [4.2, 0.27, 0.864, 0.179],
          [7.6, 0.27, 0.864, 0.179], [9.6, 0.4, 0.858, 0.178], [11, 0.4, 0.858, 0.178],
        ], [[0, 'walk'], [4.2, 'stand'], [7.6, 'walk'], [9.6, 'stand']]) },
        { who: 'dog', x: 0.5, y: 0.868, h: 0.062, face: -1, turn: true, ...timed([
          [0, 0.62, 0.84, 0.06], [2.5, 0.62, 0.84, 0.06], [2.9, 0.59, 0.844, 0.06],
          [3.6, 0.45, 0.856, 0.061], [4.1, 0.35, 0.866, 0.062], [4.6, 0.31, 0.884, 0.064],
          [5.1, 0.2, 0.882, 0.064], [5.5, 0.15, 0.868, 0.062], [5.9, 0.21, 0.876, 0.063],
          [6.5, 0.36, 0.886, 0.064], [7.1, 0.47, 0.878, 0.063], [7.6, 0.52, 0.87, 0.062],
          [8.1, 0.5, 0.868, 0.062], [11, 0.5, 0.868, 0.062],
        ], [[0, 'lie', { wag: 0.12 }], [1.8, 'stand', { wag: 1 }], [8.1, 'front', { wag: 0.9 }]]) },
      ], g: 2 },
    ],
  },

  // Age 15: he got slow. He sleeps by the door; you sit with him on the step.
  dogOld: {
    sky: P.dusk.sky,
    fog: P.dusk.fog,
    vibrance: 0.85,
    ambience: 'evening',
    fx: [{ kind: 'birds', count: 2, y: 0.25, color: 'rgb(40 20 40 / 0.5)' }, { kind: 'fireflies', top: 0.66, bottom: 0.84, count: 8 }],
    layers: [
      ...backdrop(P.dusk, { h: 0.5, sun: { x: 0.7, y: 0.48, r: 0.07 }, seed: 93 }),
      ground(P.dusk, 0.72, 14),
      { kind: 'glow', x: 0.4, y: 0.62, r: 0.4, color: '#ffb35c', alpha: 0.16, g: 2 },
      { kind: 'house', x: 0.36, y: 0.77, w: 0.56, tall: 0.6, color: P.dusk.ink, rim: P.dusk.rim, lit: '#ffc46b', door: 0.08, doorLit: '#ffd38a', windows: [{ x: -0.36, s: 0.14 }, { x: 0.3, s: 0.12 }], g: 2 },
      { kind: 'people', rim: P.dusk.rim, list: [
        { who: 'me', x: 0.5, y: 0.81, h: 0.22, pose: 'sit', seat: 'ground', light: 0.7 },
        { who: 'dog', age: 'old', pose: 'lie', x: 0.7, y: 0.81, h: 0.055, face: -1, light: 0.7 },
      ], g: 2 },
    ],
  },

  // Age 16: the evening before the vet comes. Holding walks you both slowly to the gate,
  // where he sits down one more time.
  lastWalk: {
    sky: P.dusk.sky,
    fog: P.dusk.fog,
    vibrance: 0.85,
    ambience: 'evening',
    fx: [{ kind: 'birds', count: 2, y: 0.22, color: 'rgb(40 20 40 / 0.5)' }, { kind: 'fireflies', top: 0.66, bottom: 0.86, count: 10 }],
    layers: [
      ...backdrop(P.dusk, { h: 0.5, sun: { x: 0.3, y: 0.47, r: 0.08 }, seed: 57 }),
      ground(P.dusk, 0.72, 13),
      { kind: 'house', x: 0.72, y: 0.74, w: 0.42, color: P.dusk.ink, roof: '#4a1e2a', rim: P.dusk.rim, rimSide: -1, lit: '#ffc46b', windows: [{ x: -0.3 }, { x: 0.18 }], g: 2 },
      { kind: 'gate', x: 0.42, y: 0.79, h: 0.075, from: -0.1, to: 1.1, color: '#1e1424', rim: P.dusk.rim, rimSide: -1, g: 2, bleed: true },
      { kind: 'people', rim: P.dusk.rim, rimSide: -1, list: [
        { who: 'me', mood: 'sad', x: 0.7, y: 0.88, h: 0.21, pose: 'walk', face: -1, track: [[0.7, 0.88, 0.21], [0.6, 0.87, 0.21], [0.5, 0.86, 0.21]], poses: [[0.98, 'stand']] },
        { who: 'dog', age: 'old', x: 0.78, y: 0.875, h: 0.055, face: -1, turn: true, track: [[0.78, 0.875, 0.055], [0.62, 0.86, 0.055], [0.44, 0.845, 0.055]], poses: [[0.97, 'sit']] },
      ], g: 2 },
    ],
  },

  // Age 16: the next day. Nobody at the gate, the lead on the post.
  gateEmpty: {
    sky: ['#1b2348', '#3d4a7a', '#7d7fa6', '#b39aa8'],
    fog: '#8a86a6',
    vibrance: 0.55,
    ambience: 'wind',
    fx: [],
    layers: [
      ...backdrop({ ...P.grey, sky: ['#1b2348', '#3d4a7a', '#7d7fa6', '#b39aa8'] }, { h: 0.5, seed: 57 }),
      ground(P.grey, 0.72, 13),
      { kind: 'house', x: 0.72, y: 0.74, w: 0.42, color: P.grey.ink, rim: P.grey.rim, rimSide: -1, windows: [{ x: -0.3 }, { x: 0.18, lit: '#ffc46b' }], g: 2 },
      { kind: 'gate', x: 0.62, y: 0.79, h: 0.075, from: -0.1, to: 1.1, color: '#141a30', rim: P.grey.rim, rimSide: -1, g: 2, bleed: true },
      { kind: 'leash', x: 0.665, y: 0.725, s: 0.065, color: '#2f8fa3', g: 2 },
      { kind: 'figure', who: 'me', mood: 'sad', x: 0.42, y: 0.87, h: 0.21, rim: P.grey.rim, rimSide: -1, light: 0.6, g: 2 },
    ],
  },

  // Age 9 to 13: summers at the lake, the pier, the best friend.
  lake: {
    sky: P.noon.sky,
    fog: P.noon.fog,
    vibrance: 1.05,
    ambience: 'lake',
    fx: [{ kind: 'glints', at: 1, y0: 0.6, y1: 0.85, count: 40 }, { kind: 'birds', count: 2, y: 0.18 }, { kind: 'clouds', at: 0, count: 4 }],
    layers: [
      ...backdrop(P.noon, { h: 0.5, sun: { x: 0.8, y: 0.12, r: 0.05, halo: 0.6 }, near: false, seed: 61 }),
      { kind: 'forest', y: 0.6, hMin: 0.06, hMax: 0.12, color: P.noon.near, haze: 0.1, mist: 0.2, depth: 0.02, seed: 8, g: 1, bleed: true },
      { kind: 'water', y: 0.6, y2: 1, colors: ['#9fd0e8', '#4f97c4', '#2f6f9e'], streaks: 30, glint: { x: 0.8, color: '#ffffff', spread: 0.05 }, g: 1, bleed: true },
      { kind: 'pier', x: 0.42, y: 0.9, len: 0.17, w: 0.36, lean: 0.06, color: '#3a2a1e', rim: '#ffe8b8', g: 2 },
      { kind: 'people', rim: P.noon.rim, list: [
        { who: 'me', x: 0.44, y: 0.78, h: 0.11, age: 'child', pose: 'sit', seat: 'ground' },
        { who: 'friend', x: 0.56, y: 0.76, h: 0.12, age: 'child', pose: 'wave' },
      ], g: 2 },
      { kind: 'pine', x: -0.02, y: 0.98, h: 0.9, color: '#0f2a20', seed: 64, g: 2, bleed: true },
    ],
  },

  // Age 15: a fire in the woods with friends. A phone lights up.
  bonfire: {
    sky: P.blue.sky,
    fog: P.blue.fog,
    vibrance: 0.95,
    ambience: 'fire',
    fx: [{ kind: 'stars', bottom: 0.35 }, { kind: 'sparks', x: 0.5, y: 0.76 }, { kind: 'fireflies', top: 0.6, bottom: 0.85, count: 8 }, { kind: 'firelight', x: 0.5, y: 0.76, r: 0.6 }],
    layers: [
      { kind: 'stars', count: 160, bottom: 0.5, g: 0 },
      { kind: 'ridge', y: 0.5, amp: 0.3, freq: 1, ridged: true, color: P.blue.far, haze: 0.4, mist: 0.5, seed: 71, g: 0 },
      { kind: 'forest', y: 0.66, hMin: 0.3, hMax: 0.55, gap: 0.07, color: P.blue.near, haze: 0.1, mist: 0.3, seed: 72, clear: [[0.3, 0.7]], g: 1, bleed: true },
      { kind: 'ground', y: 0.72, color: P.blue.ground, amp: 0.02, seed: 3, mist: 0, g: 2, bleed: true },
      { kind: 'fire', x: 0.5, y: 0.78, s: 0.05, g: 2 },
      { kind: 'people', rim: '#ffb070', list: [
        { who: 'a', x: 0.3, y: 0.8, h: 0.17, pose: 'sit', seat: 'ground', rimSide: 1, light: 0.5 },
        { who: 'b', x: 0.68, y: 0.8, h: 0.17, pose: 'sit', seat: 'ground', face: -1, rimSide: -1, light: 0.5 },
        { who: 'me', x: 0.8, y: 0.83, h: 0.2, pose: 'phone', face: -1, rimSide: -1, light: 0.45 },
        { who: 'c', x: 0.18, y: 0.83, h: 0.2, rimSide: 1, light: 0.45 },
      ], g: 2 },
    ],
  },

  // Two in the morning: the house, one kitchen window lit, someone standing in it.
  kitchenNight: {
    sky: P.night.sky,
    fog: P.night.fog,
    vibrance: 0.85,
    ambience: 'night',
    fx: [{ kind: 'stars', bottom: 0.4 }],
    layers: [
      ...backdrop(P.night, { h: 0.52, stars: 150, peaks: 0.3, seed: 81 }),
      ground(P.night, 0.72, 4),
      { kind: 'glow', x: 0.4, y: 0.6, r: 0.4, color: '#ffb35c', alpha: 0.2, g: 2 },
      { kind: 'house', x: 0.5, y: 0.75, w: 0.66, tall: 0.6, color: '#0b1020', rim: '#4a5b8c', windows: [{ x: -0.32, s: 0.15, lit: '#ffc46b', who: true }, { x: 0.2, s: 0.13, lit: null }], door: 0.02, g: 2 },
      { kind: 'lamp', x: 0.1, y: 0.8, h: 0.5, g: 2 },
      { kind: 'figure', who: 'me', x: 0.84, y: 0.86, h: 0.2, pose: 'walk', face: -1, light: 0.4, rim: '#ffcf86', rimSide: -1, g: 2 },
    ],
  },

  // The cold open: the same house at night, nobody on the road. Someone stands at the lit
  // kitchen window, too dark to tell who; a phone's light comes and goes on the glass.
  kitchenWait: {
    sky: P.night.sky,
    fog: P.night.fog,
    vibrance: 0.85,
    ambience: 'night',
    fx: [
      { kind: 'stars', bottom: 0.4 },
      { kind: 'firelight', x: 0.34, y: 0.655, r: 0.075, rgb: '205 225 255', alpha: 0.32, pace: 0.22, at: 2 },
    ],
    layers: [
      ...backdrop(P.night, { h: 0.52, stars: 150, peaks: 0.3, seed: 81 }),
      ground(P.night, 0.72, 4),
      { kind: 'glow', x: 0.4, y: 0.6, r: 0.4, color: '#ffb35c', alpha: 0.2, g: 2 },
      { kind: 'house', x: 0.5, y: 0.75, w: 0.66, tall: 0.6, color: '#0b1020', rim: '#4a5b8c', windows: [{ x: -0.32, s: 0.15, lit: '#ffc46b', who: true }, { x: 0.2, s: 0.13, lit: null }], door: 0.02, g: 2 },
      { kind: 'lamp', x: 0.1, y: 0.8, h: 0.5, g: 2 },
    ],
  },

  // The end: that night again, years back, seen close through the same window. It was Mom,
  // in the kitchen just after one, the phone lit in her hand, waiting for a text.
  // The kitchen and Mom are on the far layer, so the house wall in front frames them.
  kitchenWaitMom: {
    sky: P.night.sky,
    fog: P.night.fog,
    vibrance: 0.9,
    ambience: 'night',
    shade: '#3a2a2a',
    fx: [{ kind: 'firelight', x: 0.44, y: 0.56, r: 0.12, rgb: '205 225 255', alpha: 0.28, pace: 0.22, at: 0 }],
    layers: [
      { kind: 'kitchen', rect: [0.1, 0.18, 0.9, 0.66], lamp: [0.68, 0.34], clock: [0.24, 0.29], time: [1, 6], cupboards: [0.54, 0.9], g: 0 },
      { kind: 'people', list: [
        { who: 'mom', mood: 'sad', x: 0.34, y: 0.76, h: 0.62, pose: 'phone', look: { coat: false }, light: 0.8, rim: '#d6e6ff', rimSide: 1 },
      ], g: 0 },
      { kind: 'room', window: [0.12, 0.2, 0.88, 0.64], color: '#0d1324', frame: '#1c2540', g: 1, bleed: true },
      { kind: 'band', y: 0, y2: 0.06, color: '#060912', g: 1, bleed: true },
      { kind: 'glow', x: 0.5, y: 0.68, r: 0.3, color: '#ffb35c', alpha: 0.08, g: 1 },
      { kind: 'pine', x: 0.98, y: 1.02, h: 0.7, color: '#05070f', seed: 31, g: 2, bleed: true },
    ],
  },

  // Age 11, a Saturday morning in summer: the family kitchen through its window, the same
  // window as the night at the very end. Sun on the wall, the clock at two minutes past
  // ten, you at the table on the phone, Mom at the cupboards.
  kitchenSummer: {
    sky: P.noon.sky,
    fog: P.noon.fog,
    vibrance: 1,
    ambience: 'summer',
    shade: '#8a5a32',
    fx: [{ kind: 'motes', at: 0, count: 18 }],
    layers: [
      { kind: 'kitchen', rect: [0.1, 0.18, 0.9, 0.66], lamp: [0.68, 0.34], light: '#fff3d6', wall: '#f3d9a8', floor: '#c99a62', wood: '#9a6a3c', clock: [0.24, 0.29], time: [10, 2], cupboards: [0.54, 0.9], g: 0 },
      { kind: 'sunbeam', from: [0.12, 0.3, 0.2], to: [0.3, 0.58, 0.66], alpha: 0.18, g: 0 },
      { kind: 'people', list: [
        { who: 'me', x: 0.36, y: 0.71, h: 0.42, age: 'child', pose: 'phone', light: 0.9, rim: '#fff1c9', rimSide: -1 },
        { who: 'mom', x: 0.74, y: 0.75, h: 0.6, face: -1, look: { coat: false }, light: 0.9, rim: '#fff1c9', rimSide: -1 },
      ], g: 0 },
      { kind: 'room', window: [0.12, 0.2, 0.88, 0.64], color: '#d9a86c', frame: '#f6ecd8', g: 1, bleed: true },
      { kind: 'band', y: 0, y2: 0.06, color: '#b9844e', g: 1, bleed: true },
      { kind: 'tree', x: 0.98, y: 1.04, h: 0.62, color: '#2f6b4e', rim: '#fff3c0', seed: 7, g: 2, bleed: true },
    ],
  },

  // Eighteen: the same hall, packing to leave. The shoes all come in pairs now. You pack one
  // bag; Mom packs the rest, and tells you what you will need.
  hallPack: {
    sky: P.golden.sky,
    fog: P.golden.fog,
    vibrance: 0.95,
    ambience: 'room',
    light: 0.85,
    shade: '#6e4a38',
    fx: [{ kind: 'motes', count: 12 }],
    layers: [
      { kind: 'band', y: 0, y2: 0.76, color: '#c99a6a', g: 1, bleed: true },
      { kind: 'band', y: 0.76, y2: 1, color: '#7a4e30', planks: 6, trim: '#5e3a22', g: 1, bleed: true },
      { kind: 'door', x: 0.8, y: 0.76, w: 0.24, h: 0.62, pane: '#ffd98a', g: 1 },
      { kind: 'stairs', x: 0.52, x2: -0.08, y: 0.76, top: 0.3, steps: 9, under: '#9a6a44', g: 1, bleed: true },
      { kind: 'shoes', x: 0.56, x2: 1, y: 0.8, s: 0.06, list: ['#2f5a4e', '#8a2a3a', '#3a4a6a'], gone: [-1, -1, -1], g: 1 },
      { kind: 'people', list: [
        { who: 'me', x: 0.3, y: 0.9, h: 0.44, face: 1 },
        { who: 'mom', x: 0.74, y: 0.86, h: 0.42, face: -1, pose: 'hips', acts: [{ on: 'towels', pose: 'reach', face: -1 }] },
      ], g: 1 },
      { kind: 'bags', x: 0.5, y: 0.98, list: [[0, 0.2, 0.12, '#3a4a6a', 'duffel'], [0.2, 0.15, 0.2, '#6a3a2a', 'case'], [0.37, 0.19, 0.11, '#2f5a4e', 'duffel'], [0.1, 0.15, 0.08, '#8a6a3a', 'duffel']], rim: '#ffe2a2', g: 2, bleed: true },
    ],
  },

  // Close, under the stairs: the dark, the dust, and one small red trainer at the back.
  underStairs: {
    sky: ['#140d0a', '#1e140e', '#2a1c12'],
    skyEnd: 1,
    fog: '#2a1c12',
    vibrance: 1,
    light: 0.55,
    ambience: 'room',
    fx: [{ kind: 'motes', count: 10 }],
    layers: [
      { kind: 'glow', x: 1.05, y: 0.62, r: 0.95, color: '#ffcf86', alpha: 0.32, g: 0 },
      { kind: 'band', y: 0.7, y2: 1, color: '#2e1d12', planks: 5, g: 1, bleed: true },
      { kind: 'trainer', x: 0.36, y: 0.76, w: 0.3, tilt: 0.12, g: 2 },
      { kind: 'arm', who: 'me', from: [1.25, 0.88], to: [0.62, 0.75], size: 0.15, fingers: 'open', g: 2, bleed: true },
    ],
  },

  // In your hands, in the light: the trainer, and his tooth marks down the heel.
  oldShoe: {
    sky: ['#e9d2a8', '#d9b98a', '#b98f5c'],
    skyEnd: 1,
    fog: '#d9b98a',
    vibrance: 1,
    light: 1,
    ambience: 'room',
    layers: [
      { kind: 'glow', x: 0.2, y: 0.2, r: 1, color: '#fff4d8', alpha: 0.4, g: 0 },
      { kind: 'arm', who: 'me', from: [-0.25, 1.0], to: [0.26, 0.69], size: 0.17, fingers: 'open', g: 1, bleed: true },
      { kind: 'trainer', x: 0.5, y: 0.655, w: 0.62, tilt: -0.1, g: 2 },
      { kind: 'arm', who: 'me', from: [1.25, 1.0], to: [0.78, 0.66], size: 0.17, fingers: 'open', g: 2, bleed: true },
    ],
  },

  // Thirty: your own kitchen, early on a Saturday. You at the window with your phone, the
  // bathroom door shut beside you with a line of light under it: the news comes through it.
  flatMorning: {
    sky: P.dawn.sky,
    fog: P.dawn.fog,
    vibrance: 0.9,
    ambience: 'room',
    light: 0.85,
    shade: '#5a4a68',
    fx: [{ kind: 'motes', count: 10 }],
    layers: [
      { kind: 'sun', x: 0.3, y: 0.4, r: 0.05, color: '#fff3d6', glow: '#ffd9a8', halo: 0.8, g: 0 },
      { kind: 'city', y: 0.46, color: '#8a6a86', haze: 0.4, hMin: 0.03, hMax: 0.1, seed: 12, g: 0, bleed: true },
      { kind: 'room', window: [0.08, 0.14, 0.48, 0.46], color: '#d8c4cc', frame: '#f4ecef', g: 1, bleed: true },
      { kind: 'band', y: 0.78, y2: 1, color: '#6a5262', planks: 5, trim: '#4e3a48', g: 1, bleed: true },
      { kind: 'door', x: 0.8, y: 0.78, w: 0.26, h: 0.6, color: '#efe6e8', frame: '#cbb8c0', under: '#fff3d6', g: 1 },
      { kind: 'figure', who: 'me', x: 0.42, y: 0.86, h: 0.46, pose: 'phone', light: 0.85, rim: '#ffe4c9', rimSide: -1, g: 2 },
    ],
  },

  // Sixty-six: clearing out Mom's house. Her photo albums, and the dog in every one.
  album: {
    sky: ['#7a7470', '#8f8780', '#a39a90'],
    skyEnd: 1,
    fog: '#8f8780',
    vibrance: 0.85,
    light: 0.9,
    ambience: 'room',
    fx: [{ kind: 'motes', count: 10 }],
    layers: [
      { kind: 'glow', x: 0.85, y: 0.12, r: 0.9, color: '#fff2dc', alpha: 0.35, g: 0 },
      { kind: 'album', x: 0.5, y: 0.5, w: 0.92, coat: '#b9773f', g: 1 },
      { kind: 'arm', who: 'me', from: [1.25, 0.9], to: [0.84, 0.64], size: 0.15, fingers: 'open', g: 2, bleed: true },
    ],
  },

  // Eighteen: the bus stop at dusk, you and Dad and all the bags Mom packed.
  busStop: {
    sky: P.dusk.sky,
    fog: P.dusk.fog,
    vibrance: 0.95,
    ambience: 'evening',
    fx: [{ kind: 'birds', count: 4, y: 0.24, color: 'rgb(40 20 40 / 0.6)' }, { kind: 'clouds', at: 0, count: 2, color: 'rgb(255 190 170 / 0.25)' }, { kind: 'motes', count: 12 }],
    layers: [
      ...backdrop(P.dusk, { h: 0.52, sun: { x: 0.28, y: 0.47, r: 0.08 }, seed: 91 }),
      ground(P.dusk, 0.72, 9),
      { kind: 'busstop', x: 0.2, y: 0.8, w: 0.3, color: P.dusk.ink, rim: P.dusk.rim, rimSide: -1, g: 2 },
      { kind: 'bus', x: 0.66, y: 0.79, w: 0.6, color: '#1a0f20', rim: P.dusk.rim, rimSide: -1, g: 2 },
      { kind: 'bags', x: 0.3, y: 0.885, list: [[0, 0.1, 0.06, '#3a4a6a', 'duffel'], [0.1, 0.08, 0.1, '#6a3a2a', 'case'], [0.18, 0.09, 0.055, '#2f5a4e', 'duffel'], [0.06, 0.07, 0.045, '#8a6a3a', 'duffel']], rim: P.dusk.rim, g: 2 },
      { kind: 'people', rim: P.dusk.rim, rimSide: -1, list: [
        { who: 'dad', x: 0.1, y: 0.88, h: 0.25, face: 1 },
        { who: 'me', x: 0.22, y: 0.875, h: 0.24, face: -1 },
      ], g: 2 },
    ],
  },

  // Nineteen: the city at night in the rain. Walking home to a dark window.
  cityNight: {
    sky: P.city.sky,
    fog: P.city.fog,
    vibrance: 0.8,
    ambience: 'rain',
    fx: [{ kind: 'rain', count: 140 }],
    layers: [
      { kind: 'city', y: 0.62, color: '#241c46', haze: 0.35, hMin: 0.12, hMax: 0.42, lit: '#ffd9a0', litShare: 0.1, seed: 5, g: 0, bleed: true },
      { kind: 'mist', y: 0.6, h: 0.08, alpha: 0.5, g: 0 },
      { kind: 'flats', x: 0.33, y: 0.74, w: 0.56, h: 0.62, rows: 9, cols: 8, color: '#140f2a', litShare: 0.3, lit: '#ffcf86', dark: [6, 2], seed: 9, g: 1 },
      { kind: 'ground', y: 0.74, color: P.city.ground, amp: 0.005, seed: 1, mist: 0, g: 2, bleed: true },
      { kind: 'lamp', x: 0.72, y: 0.8, h: 0.5, g: 2 },
      { kind: 'figure', who: 'me', x: 0.62, y: 0.88, h: 0.25, pose: 'walk', face: -1, track: [[0.62, 0.88, 0.25], [0.52, 0.82, 0.21], [0.44, 0.775, 0.18]], poses: [[0.98, 'phone']], light: 0.42, rim: '#ffcf86', rimSide: -1, g: 2 },
    ],
  },

  // A small rented room at night. The window, the moon, the laptop.
  room: {
    sky: P.city.sky,
    fog: P.city.fog,
    vibrance: 0.6,
    ambience: 'room',
    fx: [{ kind: 'stars', at: 0, bottom: 0.4 }],
    layers: [
      { kind: 'stars', count: 90, bottom: 0.5, g: 0 },
      { kind: 'moon', x: 0.62, y: 0.2, r: 0.05, color: '#f4f2ea', glow: '#a9b8e0', g: 0 },
      { kind: 'city', y: 0.48, color: '#141a30', haze: 0.2, hMin: 0.04, hMax: 0.16, lit: '#ffd9a0', litShare: 0.12, seed: 8, g: 0, bleed: true },
      { kind: 'room', window: [0.2, 0.08, 0.9, 0.46], color: '#0a0c14', frame: '#06070c', g: 1, bleed: true },
      { kind: 'desk', x: 0.54, y: 0.775, w: 0.42, legs: 0.27, screen: '#a8c8ff', g: 1 },
      { kind: 'figure', who: 'me', x: 0.4, y: 0.88, h: 0.6, pose: 'sit', back: true, light: 0.35, rim: '#a8c8ff', rimSide: 1, g: 1 },
      { kind: 'chair', x: 0.4, y: 0.885, h: 0.3, color: '#2c2640', metal: '#1a1826', rim: '#a8c8ff', g: 2 },
    ],
  },

  // Twenty-five: a hill above the city at sunrise. Colour comes back.
  hillDawn: {
    sky: P.dawn.sky,
    fog: P.dawn.fog,
    vibrance: 0.85,
    ambience: 'morning',
    fx: [{ kind: 'birds', count: 3, y: 0.3 }, { kind: 'clouds', at: 0, count: 3, color: 'rgb(255 220 200 / 0.3)', top: 0.2, bottom: 0.4 }, { kind: 'motes', count: 12 }],
    layers: [
      { kind: 'sun', x: 0.5, y: 0.5, r: 0.08, color: '#fff3d6', glow: '#ffd9a8', halo: 1.1, g: 0 },
      { kind: 'ridge', y: 0.55, amp: 0.18, freq: 1, ridged: true, color: '#a07a90', haze: 0.5, mist: 0.6, seed: 101, g: 0 },
      { kind: 'city', y: 0.6, color: '#5e4566', haze: 0.35, hMin: 0.015, hMax: 0.06, gap: 0, seed: 4, g: 1, bleed: true },
      { kind: 'mist', y: 0.6, h: 0.05, alpha: 0.7, g: 1 },
      { kind: 'ridge', y: 0.73, amp: 0.03, freq: 0.6, oct: 2, color: '#2e2338', mist: 0, seed: 102, g: 2, bleed: true },
      { kind: 'bench', x: 0.5, y: 0.745, w: 0.44, seat: 0.046, color: '#1a1222', rim: '#ffd6a0', rimSide: 1, g: 2 },
      { kind: 'figure', who: 'me', x: 0.36, y: 0.745, h: 0.17, pose: 'sit', light: 0.75, rim: '#ffd6a0', rimSide: 1, g: 2 },
      { kind: 'pine', x: 0.82, y: 0.735, h: 0.42, color: '#1a1222', rim: '#ffd6a0', rimSide: -1, seed: 9, g: 2 },
    ],
  },

  // Choice A: grandma's house in the evening, jars on the step.
  grandmaEvening: {
    sky: P.golden.sky,
    fog: P.golden.fog,
    vibrance: 0.95,
    ambience: 'evening',
    fx: [{ kind: 'smoke', at: 2, x: 0.67, y: 0.475 }, { kind: 'motes', count: 18 }],
    layers: [
      ...backdrop(P.golden, { h: 0.5, sun: { x: 0.2, y: 0.42 }, seed: 111 }),
      ground(P.golden, 0.72, 6),
      { kind: 'tree', x: 0.17, y: 0.76, h: 0.44, color: P.golden.ink, rim: P.golden.rim, fruit: '#c8402e', seed: 12, g: 2 },
      { kind: 'house', x: 0.62, y: 0.76, w: 0.5, color: P.golden.ink, roof: '#6b3020', rim: P.golden.rim, rimSide: -1, lit: '#ffcf7a', door: -0.05, doorLit: '#ffd38a', windows: [{ x: -0.36 }, { x: 0.22 }], g: 2 },
      { kind: 'people', rim: P.golden.rim, rimSide: -1, list: [
        { who: 'grandma', x: 0.6, y: 0.8, h: 0.19, age: 'old', pose: 'wave', face: -1 },
        { who: 'me', x: 0.36, y: 0.84, h: 0.24, pose: 'walk' },
      ], g: 2 },
    ],
  },

  // Choice B: the lake with friends at sunset.
  lakeFriends: {
    sky: P.dusk.sky,
    fog: P.dusk.fog,
    vibrance: 1,
    ambience: 'lake',
    fx: [{ kind: 'glints', at: 1, y0: 0.6, y1: 0.8, count: 30, color: 'rgb(255 210 160' }, { kind: 'sparks', x: 0.72, y: 0.8 }, { kind: 'firelight', x: 0.72, y: 0.82, r: 0.5 }],
    layers: [
      ...backdrop(P.dusk, { h: 0.5, sun: { x: 0.45, y: 0.5, r: 0.08 }, near: false, seed: 121 }),
      { kind: 'forest', y: 0.6, hMin: 0.05, hMax: 0.1, color: P.dusk.near, haze: 0.1, mist: 0.2, depth: 0.02, seed: 9, g: 1, bleed: true },
      { kind: 'water', y: 0.6, y2: 0.82, colors: ['#f2a060', '#a8506a', '#4a2a4a'], glint: { x: 0.45, color: '#ffd9a0', spread: 0.08 }, g: 1, bleed: true },
      { kind: 'ground', y: 0.8, color: P.dusk.ground, amp: 0.02, seed: 4, mist: 0, g: 2, bleed: true },
      { kind: 'fire', x: 0.72, y: 0.84, s: 0.04, g: 2 },
      { kind: 'people', rim: '#ffb070', list: [
        { who: 'a', x: 0.2, y: 0.86, h: 0.18, pose: 'sit', seat: 'ground' },
        { who: 'me', x: 0.33, y: 0.87, h: 0.22, pose: 'wave' },
        { who: 'd', x: 0.55, y: 0.86, h: 0.18, pose: 'sit', seat: 'ground', face: -1 },
        { who: 'b', x: 0.86, y: 0.88, h: 0.22, face: -1, rimSide: -1 },
      ], g: 2 },
    ],
  },

  // After Grandma: January, her house in the snow, the windows dark. For a moment she is
  // at the door waving, the way she always was, and then she isn't. Her scarf's yellow is
  // the only colour left.
  snowDoor: {
    sky: P.snow.sky,
    fog: P.snow.fog,
    vibrance: 0.35,
    ambience: 'wind',
    fx: [{ kind: 'snow', count: 110 }],
    layers: [
      ...backdrop(P.snow, { h: 0.5, peaks: 0.3, seed: 131 }),
      { kind: 'ground', y: 0.72, color: '#dfe3e8', amp: 0.02, seed: 6, mist: 0, g: 2, bleed: true },
      { kind: 'tree', x: 0.17, y: 0.76, h: 0.44, color: '#5a5664', rim: '#ffffff', seed: 12, g: 2 },
      { kind: 'house', x: 0.62, y: 0.76, w: 0.5, color: '#4a4652', roof: '#eceaf0', rim: '#ffffff', rimSide: -1, lit: null, door: -0.05, windows: [{ x: -0.36, lit: null }, { x: 0.22, lit: null }], g: 2 },
      { kind: 'people', rim: '#ffffff', rimSide: -1, list: [
        { who: 'grandma', x: 0.6, y: 0.8, h: 0.19, age: 'old', pose: 'wave', face: -1, ghost: 5 },
        { who: 'me', mood: 'sad', x: 0.34, y: 0.86, h: 0.24, look: { top: '#2f323c', coat: true, neck: '#d9772e' } },
      ], g: 2 },
    ],
  },

  // Her last jar, alone on a shelf in the cold light of your fridge.
  lastJar: {
    sky: ['#e6eef4', '#cfdbe6', '#aebdcc'],
    skyEnd: 1,
    fog: '#cfdbe6',
    vibrance: 0.7,
    light: 1,
    ambience: 'room',
    layers: [
      { kind: 'glow', x: 0.5, y: 0.08, r: 1, color: '#f4fbff', alpha: 0.5, g: 0 },
      { kind: 'ground', y: 0.66, color: '#bcc8d4', amp: 0.002, seed: 3, g: 1, bleed: true },
      { kind: 'jar', x: 0.5, y: 0.69, w: 0.26, g: 2 },
    ],
  },

  // Twenty-eight: a bench at golden hour. Somebody sat down and stayed.
  bench: {
    sky: P.golden.sky,
    fog: P.golden.fog,
    vibrance: 1.1,
    ambience: 'summer',
    fx: [{ kind: 'fireflies', top: 0.62, bottom: 0.8, count: 10 }, { kind: 'birds', count: 2, y: 0.25 }, { kind: 'clouds', at: 0, count: 2, color: 'rgb(255 236 210 / 0.3)' }],
    layers: [
      ...backdrop(P.golden, { h: 0.52, sun: { x: 0.5, y: 0.46, r: 0.08 }, seed: 141 }),
      ground(P.golden, 0.74, 3),
      { kind: 'tree', x: 0.8, y: 0.77, h: 0.48, color: P.golden.ink, rim: P.golden.rim, rimSide: -1, seed: 22, g: 2 },
      { kind: 'bench', x: 0.44, y: 0.82, w: 0.27, color: P.golden.ink, rim: P.golden.rim, g: 2 },
      { kind: 'people', rim: P.golden.rim, list: [
        { who: 'me', x: 0.36, y: 0.82, h: 0.22, pose: 'sit' },
        { who: 'partner', x: 0.5, y: 0.82, h: 0.21, pose: 'sit', face: -1, rimSide: -1 },
      ], g: 2 },
    ],
  },

  // Thirty-four: a night drive with a big moon. A small voice from the back seat.
  carMoon: {
    sky: P.blue.sky,
    fog: P.blue.fog,
    vibrance: 0.95,
    ambience: 'car',
    fx: [{ kind: 'stars', bottom: 0.4 }, { kind: 'passing', at: 2, y: 0.745, speed: 150 }],
    layers: [
      ...backdrop(P.blue, { h: 0.55, stars: 120, moon: { x: 0.7, y: 0.22, r: 0.1 }, peaks: 0.3, seed: 151 }),
      { kind: 'ground', y: 0.74, color: P.blue.ground, amp: 0.01, seed: 2, mist: 0, g: 2, bleed: true },
      { kind: 'road', path: [[-0.2, 0.86], [0.4, 0.8], [1.2, 0.79]], w0: 0.06, w1: 0.04, color: '#3c4a78', hazeFar: 0, g: 2, bleed: true },
      { kind: 'car', x: 0.42, y: 0.83, w: 0.42, color: '#0a0f22', rim: '#9fb0e0', inside: '#ffcf86', lights: '#ff5040', g: 2 },
    ],
  },

  // Forty-eight: dad's garden in autumn. Showing him the phone.
  dadGarden: {
    sky: P.autumn.sky,
    fog: P.autumn.fog,
    vibrance: 0.9,
    ambience: 'wind',
    fx: [{ kind: 'birds', count: 3, y: 0.2, color: 'rgb(60 40 30 / 0.6)' }, { kind: 'leaves', count: 16 }, { kind: 'clouds', at: 0, count: 2, color: 'rgb(255 240 220 / 0.3)' }],
    layers: [
      ...backdrop(P.autumn, { h: 0.5, sun: { x: 0.25, y: 0.3, r: 0.06 }, seed: 161 }),
      ground(P.autumn, 0.72, 7),
      { kind: 'tree', x: 0.18, y: 0.76, h: 0.46, color: '#b5502a', rim: '#ffd9a0', seed: 31, g: 2 },
      { kind: 'tree', x: 0.82, y: 0.75, h: 0.44, color: '#d98a34', rim: '#ffe2b0', rimSide: -1, seed: 32, g: 2 },
      { kind: 'fence', x: -0.1, x2: 1.1, y: 0.76, h: 0.05, color: P.autumn.ink, g: 2, bleed: true },
      { kind: 'people', rim: P.autumn.rim, list: [
        { who: 'dad', x: 0.44, y: 0.83, h: 0.23, age: 'old', pose: 'phone' },
        { who: 'me', x: 0.6, y: 0.83, h: 0.24, pose: 'reach', face: -1, rimSide: -1 },
      ], g: 2 },
    ],
  },

  // Fifty-two: mom leaving after a weekend. A taxi at the gate, the porch light on.
  momTaxi: {
    sky: P.blue.sky,
    fog: P.blue.fog,
    vibrance: 0.9,
    ambience: 'evening',
    fx: [{ kind: 'stars', bottom: 0.3 }, { kind: 'clouds', at: 0, count: 2, color: 'rgb(160 180 230 / 0.12)' }],
    layers: [
      ...backdrop(P.blue, { h: 0.5, stars: 80, peaks: 0.32, seed: 171 }),
      ground(P.blue, 0.72, 5),
      { kind: 'house', x: 0.3, y: 0.76, w: 0.46, color: P.blue.ink, rim: P.blue.rim, lit: '#ffc46b', door: 0.12, doorLit: '#ffd38a', g: 2 },
      { kind: 'car', x: 0.68, y: 0.82, w: 0.44, color: '#0a0f22', rim: P.blue.rim, rimSide: -1, inside: '#ffe2a8', lights: '#ff5040', beam: 0.1, g: 2 },
      { kind: 'people', rim: '#ffcf86', list: [
        { who: 'me', x: 0.37, y: 0.765, h: 0.165, pose: 'wave', light: 0.5 },
        { who: 'mom', x: 0.47, y: 0.83, h: 0.18, age: 'old', rimSide: -1, light: 0.5 },
      ], g: 2 },
    ],
  },

  // Forty-five: the same pier as the summers, in autumn. Two grown people sitting on it.
  pierAutumn: {
    sky: P.autumn.sky,
    fog: P.autumn.fog,
    vibrance: 0.95,
    ambience: 'lake',
    fx: [{ kind: 'glints', at: 1, y0: 0.6, y1: 0.85, count: 24, color: 'rgb(255 230 190' }, { kind: 'leaves', count: 12 }],
    layers: [
      ...backdrop(P.autumn, { h: 0.5, sun: { x: 0.8, y: 0.34, r: 0.06 }, near: false, seed: 61 }),
      { kind: 'forest', y: 0.6, hMin: 0.06, hMax: 0.12, color: '#8a4a2a', haze: 0.1, mist: 0.2, depth: 0.02, seed: 8, g: 1, bleed: true },
      { kind: 'water', y: 0.6, y2: 1, colors: ['#e9c9a0', '#9a8a8a', '#4a5260'], glint: { x: 0.8, color: '#ffe8c0', spread: 0.06 }, g: 1, bleed: true },
      { kind: 'pier', x: 0.42, y: 0.9, len: 0.17, w: 0.36, lean: 0.06, color: '#2e2018', rim: '#ffe2b0', g: 2 },
      { kind: 'people', rim: P.autumn.rim, list: [
        { who: 'me', x: 0.42, y: 0.79, h: 0.17, pose: 'sit', seat: 'ground' },
        { who: 'friend', x: 0.54, y: 0.775, h: 0.17, pose: 'sit', seat: 'ground' },
      ], g: 2 },
      { kind: 'pine', x: -0.02, y: 0.98, h: 0.9, color: '#2a160e', seed: 64, g: 2, bleed: true },
    ],
  },

  // Close-up, age 6: Grandma's hands passing you a jar of jam across the kitchen table.
  jarHands: {
    sky: ['#f6e2bf', '#ecc995', '#dcac72'],
    skyEnd: 1,
    fog: '#ecc995',
    vibrance: 1,
    light: 1,
    ambience: 'morning',
    layers: [
      { kind: 'glow', x: 0.1, y: 0.12, r: 1, color: '#fff4d8', alpha: 0.55, g: 0 },
      { kind: 'ground', y: 0.66, color: '#8a5634', amp: 0.004, seed: 3, g: 1, bleed: true },
      { kind: 'jar', x: 0.47, y: 0.69, w: 0.26, g: 2 },
      { kind: 'arm', who: 'grandma', from: [1.25, 0.4], to: [0.66, 0.57], size: 0.19, fingers: 'open', g: 2, bleed: true },
      { kind: 'arm', who: 'me', from: [-0.2, 0.86], to: [0.26, 0.61], size: 0.13, fingers: 'open', g: 2, bleed: true },
    ],
  },

  // Close-up, age 31: a newborn holding on to your finger.
  babyHand: {
    sky: ['#f7ecdd', '#efdcc4', '#e4c6a6'],
    skyEnd: 1,
    fog: '#efdcc4',
    vibrance: 1,
    light: 1,
    ambience: 'room',
    layers: [
      { kind: 'glow', x: 0.85, y: 0.1, r: 1, color: '#fff6e6', alpha: 0.5, g: 0 },
      { kind: 'ridge', y: 0.58, amp: 0.12, freq: 0.8, oct: 2, color: '#ead3b6', mist: 0.15, seed: 7, g: 0 },
      { kind: 'ridge', y: 0.86, amp: 0.1, freq: 0.7, oct: 2, color: '#dfc19e', mist: 0.1, seed: 9, g: 1, bleed: true },
      // The baby in a blanket, a small head in a hat, one arm out, the fist round your finger.
      { kind: 'arm', who: 'kid', sleeve: '#f0c4a2', from: [0.5, 0.57], to: [0.53, 0.485], size: 0.085, fingers: 'small', g: 2 },
      { kind: 'swaddle', x: 0.36, y: 0.7, w: 0.85, tilt: -0.35, head: true, color: '#d7e3f0', fold: '#a9b9cc', g: 2, bleed: true },
      { kind: 'arm', who: 'me', from: [2.2, 0.6], to: [0.66, 0.5], size: 0.2, fingers: 'point', g: 2, bleed: true },
      { kind: 'grip', who: 'kid', x: 0.535, y: 0.474, size: 0.02, g: 2 },
    ],
  },

  // Backgrounds for the life lines view, one per part of the day.
  linesDawn: linesBack(P.dawn, { ambience: 'morning', vibrance: 0.85 }),
  linesMorning: linesBack(P.morning, { ambience: 'morning', fx: [{ kind: 'clouds', at: 0, count: 3, top: 0.05, bottom: 0.3 }] }),
  linesNoon: linesBack(P.noon, { ambience: 'summer', fx: [{ kind: 'clouds', at: 0, count: 3, top: 0.05, bottom: 0.3 }] }),
  linesDusk: linesBack(P.dusk, { ambience: 'evening' }),
  linesNight: linesBack(P.city, { stars: 60, vibrance: 0.8, ambience: 'room' }),
  linesSunrise: linesBack(P.dawn, { ambience: 'morning' }),
  linesAfternoon: linesBack(P.autumn, { ambience: 'wind' }),
  linesSlate: linesBack(P.slate, { ambience: 'rain', vibrance: 0.8, fx: [{ kind: 'rain', count: 70 }] }),
  linesDrain: linesBack(P.drain, { ambience: 'night', vibrance: 0.7 }),
  linesEnd: linesBack(P.late, { ambience: 'morning', vibrance: 0.85, fx: [{ kind: 'clouds', at: 0, count: 2, top: 0.05, bottom: 0.3, color: 'rgb(255 250 244 / 0.5)' }] }),
};

// The very end: the same house later still, the kitchen light off.
SCENES.porchDark = {
  ...SCENES.porchLate,
  vibrance: 0.8,
  layers: SCENES.porchLate.layers
    .filter((it) => it.kind !== 'glow')
    .map((it) => (it.kind === 'house' ? { ...it, lit: null, windows: it.windows.map((w) => ({ ...w, lit: null, who: false })) } : it)),
};

// Your kid at sixteen walking home at two, and you at the lit kitchen window: the night
// at fifteen again, the other way round.
SCENES.kitchenNightKid = {
  ...SCENES.kitchenNight,
  layers: SCENES.kitchenNight.layers.map((it) => (it.kind === 'figure' ? { ...it, who: 'kid' } : it)),
};

// Each time the story comes back to the porch the horizon is a little lighter: the night
// is slowly giving way, all through the wait.
SCENES.porchLate2 = { ...SCENES.porchLate, sky: ['#08141c', '#152733', '#213747', '#2b4659'] };
SCENES.porchLate3 = { ...SCENES.porchLate, sky: ['#08141c', '#182a38', '#273d50', '#344e66'] };
SCENES.porchLate4 = { ...SCENES.porchLate, sky: ['#08141c', '#1c2d3d', '#2e435a', '#3f5774'] };
SCENES.porchLate5 = { ...SCENES.porchLate, sky: ['#08141c', '#1f3040', '#334960', '#46607e'] };

// After Dad: Mom at a door like Grandma's, waving you off; and after Mom, the same door
// with nobody at it and the lights off.
SCENES.momDoor = {
  ...SCENES.grandmaEvening,
  layers: SCENES.grandmaEvening.layers.map((it) => (it.kind === 'people'
    ? { ...it, list: it.list.map((p) => (p.who === 'grandma' ? { ...p, who: 'mom' } : p)) }
    : it)),
};
SCENES.momDoorDark = {
  ...SCENES.grandmaEvening,
  vibrance: 0.6,
  fx: [{ kind: 'motes', count: 8 }],
  layers: SCENES.grandmaEvening.layers
    .filter((it) => it.kind !== 'people')
    .map((it) => (it.kind === 'house' ? { ...it, lit: null, doorLit: null, windows: it.windows.map((w) => ({ ...w, lit: null })) } : it)),
};

// The same hill, some Sundays later: somebody else comes up for the sunrise too, sitting
// well apart from you; and later the same somebody right beside you.
SCENES.hillDawnTwo = {
  ...SCENES.hillDawn,
  layers: [...SCENES.hillDawn.layers, { kind: 'figure', who: 'partner', x: 0.66, y: 0.745, h: 0.165, pose: 'sit', face: -1, light: 0.75, rim: '#ffd6a0', rimSide: 1, g: 2 }],
};
SCENES.hillDawnClose = {
  ...SCENES.hillDawn,
  layers: [...SCENES.hillDawn.layers, { kind: 'figure', who: 'partner', x: 0.5, y: 0.745, h: 0.165, pose: 'sit', face: -1, bend: 0.12, light: 0.75, rim: '#ffd6a0', rimSide: 1, g: 2 }],
};
