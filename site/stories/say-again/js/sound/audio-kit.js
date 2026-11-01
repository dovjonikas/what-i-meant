// audio-kit.js: parts shared by the story's sound (audio.js) and music (score.js): noise
// made once per audio context and reused, a lookahead clock for sounds that come back now
// and then, the link that lets a radio call lower the music, and small node helpers.
//
// Noise is filled in JavaScript, which costs a phone some milliseconds, so each kind is
// made the first time it is asked for and then kept for the life of the context.

const stores = new WeakMap();
const waves = new WeakMap();
const duckers = new WeakMap();
const curves = new Map();

export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

/** A number from the caller, or `fallback` when it is missing or not a number. */
export function num(v, fallback) {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

// Each kind: [seconds, how to fill it, how to level it]. 'rms' noise is set to an RMS of
// 0.25, so a layer's gain reads the same whatever the kind; sparse kinds (drops, crackle)
// are set by their peak instead, since their RMS says little about how they sound.
const KINDS = {
  white: [4, fillWhite, 'rms'],
  pink: [4, fillPink, 'rms'],
  brown: [4, fillBrown, 'rms'],
  drizzle: [7.3, (d, sr) => fillDrops(d, sr, 9, 0), 'peak'],
  rain: [6.1, (d, sr) => fillDrops(d, sr, 95, 0.03), 'peak'],
  crinkle: [3, fillCrinkle, 'peak'],
  grain: [2.5, fillGrain, 'rms'],
  static: [3.7, fillStatic, 'rms'],
};

/** A mono noise buffer of `kind` (see KINDS), made once per context. */
export function noise(ctx, kind) {
  let store = stores.get(ctx);
  if (!store) {
    store = new Map();
    stores.set(ctx, store);
  }
  if (!store.has(kind)) store.set(kind, makeNoise(ctx, KINDS[kind] ?? KINDS.white));
  return store.get(kind);
}

function makeNoise(ctx, [seconds, fill, level]) {
  const sr = ctx.sampleRate;
  const n = Math.floor(sr * seconds);
  const seam = Math.floor(sr * 0.05);
  const raw = new Float32Array(n + seam);
  fill(raw, sr);
  // The extra tail is faded over the start, so a looping layer has no click at the seam.
  for (let i = 0; i < seam; i += 1) {
    const a = i / seam;
    raw[i] = raw[i] * Math.sqrt(a) + raw[n + i] * Math.sqrt(1 - a);
  }
  const d = raw.subarray(0, n);
  let scale = 1;
  if (level === 'rms') {
    let sum = 0;
    for (let i = 0; i < n; i += 1) sum += d[i] * d[i];
    scale = 0.25 / Math.sqrt(sum / n || 1);
  } else {
    let peak = 0;
    for (let i = 0; i < n; i += 1) peak = Math.max(peak, Math.abs(d[i]));
    scale = 0.9 / (peak || 1);
  }
  for (let i = 0; i < n; i += 1) d[i] *= scale;
  const buffer = ctx.createBuffer(1, n, sr);
  buffer.getChannelData(0).set(d);
  return buffer;
}

function fillWhite(d) {
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
}

// Paul Kellet's pink noise filter: equal energy per octave, like rain wash and wind.
function fillPink(d) {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;
  for (let i = 0; i < d.length; i += 1) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
  }
}

// Brown noise: most of its energy is low, like a fan, surf or a car on the road.
function fillBrown(d) {
  let last = 0;
  for (let i = 0; i < d.length; i += 1) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last;
  }
}

// Raindrops on glass: short ticks at random (Poisson) times, most of them small, each a
// few milliseconds of noise with a ring in it, over a faint floor of hiss.
function fillDrops(d, sr, perSecond, floor) {
  for (let i = 0; i < d.length; i += 1) d[i] = floor * (Math.random() * 2 - 1);
  let t = 0;
  for (;;) {
    t += -Math.log(1 - Math.random()) / perSecond;
    const start = Math.floor(t * sr);
    if (start >= d.length - sr * 0.01) break;
    const amp = 0.12 + 0.88 * Math.random() ** 3;
    const len = Math.floor(sr * rand(0.0015, 0.005));
    const w = (rand(2200, 6500) / sr) * 2 * Math.PI;
    for (let k = 0; k < len; k += 1) {
      const e = Math.exp((-5 * k) / len);
      d[start + k] += amp * e * (0.55 * Math.sin(w * k) + 0.45 * (Math.random() * 2 - 1));
    }
  }
}

// Paper handled: dense small crackles that come and go in bunches.
function fillCrinkle(d, sr) {
  for (let i = 0; i < d.length; i += 1) d[i] = 0.04 * (Math.random() * 2 - 1);
  let t = 0;
  let mood = 1;
  for (;;) {
    t += -Math.log(1 - Math.random()) / 420;
    const start = Math.floor(t * sr);
    if (start >= d.length - sr * 0.01) break;
    if (Math.random() < 0.02) mood = rand(0.2, 1);
    const amp = mood * (0.15 + 0.85 * Math.random() ** 2);
    const len = Math.floor(sr * rand(0.0003, 0.002));
    for (let k = 0; k < len; k += 1) d[start + k] += amp * Math.exp((-4 * k) / len) * (Math.random() * 2 - 1);
  }
}

// Graphite on paper: hiss whose level jumps every millisecond or so, the paper's tooth.
function fillGrain(d, sr) {
  let level = 0.5;
  let target = 0.5;
  let hold = 0;
  for (let i = 0; i < d.length; i += 1) {
    hold -= 1;
    if (hold <= 0) {
      target = 0.15 + 0.85 * Math.random();
      hold = Math.floor(sr * rand(0.0008, 0.004));
    }
    level += (target - level) * 0.08;
    d[i] = (Math.random() * 2 - 1) * level;
  }
}

// FM noise between channels: hiss that flutters a little, with now and then a crackle.
function fillStatic(d, sr) {
  for (let i = 0; i < d.length; i += 1) {
    const s = i / sr;
    const flutter = 0.7 + 0.18 * Math.sin(2 * Math.PI * 3.1 * s) + 0.12 * Math.sin(2 * Math.PI * 7.9 * s + 1);
    d[i] = (Math.random() * 2 - 1) * flutter;
  }
  let t = 0;
  for (;;) {
    t += -Math.log(1 - Math.random()) / 5;
    const start = Math.floor(t * sr);
    if (start >= d.length - sr * 0.01) break;
    const len = Math.floor(sr * rand(0.001, 0.003));
    for (let k = 0; k < len; k += 1) d[start + k] += rand(0.9, 1.5) * (Math.random() * 2 - 1);
  }
}

/**
 * A periodic wave made of the given harmonics (amplitude of harmonic 1, 2, 3, ...), kept per
 * context under `key`.
 */
export function wave(ctx, key, harmonics) {
  let store = waves.get(ctx);
  if (!store) {
    store = new Map();
    waves.set(ctx, store);
  }
  if (!store.has(key)) {
    const imag = new Float32Array([0, ...harmonics]);
    store.set(key, ctx.createPeriodicWave(new Float32Array(imag.length), imag));
  }
  return store.get(key);
}

/** A soft saturator: small signals pass, loud ones round off. `drive` sets how soon. */
export function shaper(ctx, drive) {
  const key = Math.round(clamp(drive, 0.2, 8) * 10);
  if (!curves.has(key)) {
    const k = key / 10;
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i += 1) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    curves.set(key, curve);
  }
  const node = ctx.createWaveShaper();
  node.curve = curves.get(key);
  return node;
}

/**
 * The clock for sounds that come back now and then (a drip, a gust, the foghorn). A job is a
 * function that queues its sounds up to a time on the audio clock; the clock calls it every
 * 200 ms with a horizon 1.5 s ahead, which keeps time even when the page is busy.
 * `until(t)` runs every job up to t at once, for offline rendering in tests.
 */
export function createClock(ctx, ahead = 1.5) {
  const jobs = new Set();
  let timer = 0;
  const run = (horizon) => {
    for (const job of [...jobs]) {
      try {
        job(horizon);
      } catch (error) {
        // A job that fails once would fail on every tick; drop it and keep the rest.
        jobs.delete(job);
        console.warn('[audio] a repeating sound failed', error);
      }
    }
  };
  return {
    add(job) {
      jobs.add(job);
      job(ctx.currentTime + ahead);
      if (!timer) timer = setInterval(() => run(ctx.currentTime + ahead), 200);
    },
    remove(job) {
      jobs.delete(job);
      if (!jobs.size && timer) {
        clearInterval(timer);
        timer = 0;
      }
    },
    until: run,
  };
}

/**
 * A clock job that calls `play(t)` first `first` seconds after it starts, then again after
 * however many seconds play returns.
 */
export function repeat(ctx, first, play) {
  let next = -1;
  return (horizon) => {
    if (next < 0) next = ctx.currentTime + first;
    // A hidden tab can sleep the timer for a while; skip what was missed instead of
    // playing it all at once.
    if (next < ctx.currentTime - 0.2) next = ctx.currentTime + 0.05;
    for (let n = 0; next < horizon && n < 200; n += 1) next += Math.max(0.05, play(next) || 1);
  };
}

/** The score registers here; audio.duck() reaches every score on the same context. */
export function onDuck(ctx, fn) {
  if (!duckers.has(ctx)) duckers.set(ctx, new Set());
  duckers.get(ctx).add(fn);
}

export function duckMusic(ctx, on) {
  duckers.get(ctx)?.forEach((fn) => fn(on));
}

export function gain(ctx, value = 1) {
  const g = ctx.createGain();
  g.gain.value = value;
  return g;
}

export function filter(ctx, type, frequency, q) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  if (q !== undefined) f.Q.value = q;
  return f;
}

/** A stereo pan, or a plain pass-through where the browser has no StereoPannerNode. */
export function panner(ctx, pan) {
  if (!ctx.createStereoPanner) return gain(ctx, 1);
  const p = ctx.createStereoPanner();
  p.pan.value = clamp(pan, -1, 1);
  return p;
}

export function loop(ctx, buffer, rate = 1) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.playbackRate.value = rate;
  return src;
}

/**
 * Holds a parameter at its present value from time t, dropping later automation, so a new
 * ramp can start from where it is. Firefox lacks cancelAndHoldAtTime, hence the fallback.
 */
export function settle(param, t) {
  if (param.cancelAndHoldAtTime) {
    param.cancelAndHoldAtTime(t);
  } else {
    const v = param.value;
    param.cancelScheduledValues(t);
    param.setValueAtTime(v, t);
  }
}

/** A short noise hit through one filter: clicks, taps, knocks. */
export function burst(ctx, dest, t, opts = {}) {
  const { kind = 'white', type = 'bandpass', f = 1000, q = 1, peak = 0.1, attack = 0.001, decay = 0.05, rate = 1 } = opts;
  const buffer = noise(ctx, kind);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  const shape = filter(ctx, type, f, q);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  src.connect(shape).connect(g).connect(dest);
  const len = attack + decay + 0.02;
  src.start(t, Math.random() * Math.max(0, buffer.duration - len * rate - 0.05));
  src.stop(t + len);
  src.onended = () => g.disconnect();
  return { src, filter: shape, gain: g };
}

/** A short pitched hit: a sine (or another wave) that dies away. Returns the oscillator. */
export function ping(ctx, dest, t, f, peak, decay, type = 'sine') {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(Math.max(0.0002, peak), t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.002 + decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + decay + 0.03);
  o.onended = () => g.disconnect();
  return o;
}

/**
 * A longer noise sound with a level that rises over `attack`, holds, and falls over
 * `release` to end at t + len: a paper slide, a pencil stroke, air. Returns the source,
 * the last filter (to sweep it) and the gain.
 */
export function band(ctx, dest, t, len, opts = {}) {
  const { kind = 'white', filters = [], peak = 0.05, attack = 0.02, release = 0.05, rate = 1 } = opts;
  const src = loop(ctx, noise(ctx, kind), rate);
  let node = src;
  for (const [type, f, q] of filters) node = node.connect(filter(ctx, type, f, q));
  const g = ctx.createGain();
  const a = Math.min(attack, len / 2);
  const r = Math.min(release, len - a);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setValueAtTime(peak, t + len - r);
  g.gain.linearRampToValueAtTime(0, t + len);
  node.connect(g).connect(dest);
  src.start(t, Math.random() * 2);
  src.stop(t + len + 0.02);
  src.onended = () => g.disconnect();
  return { src, filter: node === src ? null : node, gain: g };
}
