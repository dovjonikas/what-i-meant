// audio-places.js: the sound of each place, cross-faded over two seconds when the scene
// changes, and the thunder after a flash. The station at night (equipment hum, the fan,
// light rain on the glass), fog (a foghorn far off, drips), a clear night with the sea,
// the storm (heavy rain, gusts at the frame, a rattle), an evening, the drive home, the
// flat in the morning, and the stairs after the storm.
//
// A place is a few looping noise layers and a hum, plus things that come back now and then
// (a drip, a gust, a bird) queued on the audio clock. All of it sits far under the radio:
// it is the room you are in, not something to listen to.

import { noise, wave, gain, filter, panner, loop, settle, burst, ping, repeat, rand, clamp, num } from './audio-kit.js';

const FADE = 2;

// Mains hum (50 Hz in Lithuania) as power supplies make it: 100 Hz strongest, with the
// upper harmonics that are all a phone speaker can play of it.
const MAINS = [0.3, 1, 0.45, 0.4, 0.2, 0.15, 0.08, 0.06];
const FRIDGE = [0.2, 1, 0.3, 0.5, 0.1, 0.2];

// Each place's overall level, set by ear on the numbers from dev/audio-test.html: the storm is
// the loudest place, the car sits a little under it, and the quiet flat and the stairs are
// raised so a phone speaker still finds them.
const LEVELS = { storm: 1.6, drive: 0.8, home: 2, stairs: 2 };

// Every place is a function of the builder `p` (see layers() below). Levels are gains on
// noise with an RMS of 0.25; dev/audio-test.html prints what each place adds up to.
const PLACES = {
  room(p) {
    station(p, 1);
    rainOnGlass(p, 1);
  },
  fog(p) {
    station(p, 1);
    rainOnGlass(p, 0.3);
    p.every(rand(0.5, 2), 0.7, 3.4, (t) => drip(p.ctx, p.bus, t, { level: rand(0.006, 0.022) }));
    p.every(rand(5, 9), 25, 40, (t) => foghorn(p.ctx, p.bus, t));
  },
  clear(p) {
    station(p, 0.6);
    sea(p, 0.7);
  },
  storm(p) {
    station(p, 0.7);
    const rain = heavyRain(p);
    wind(p, 1, rain);
    p.every(rand(5, 10), 7, 18, (t) => rattle(p.ctx, p.bus, t));
  },
  evening(p) {
    station(p, 0.6);
    sea(p, 1);
    wind(p, 0.3, []);
  },
  drive(p) {
    car(p);
  },
  home(p) {
    flat(p);
  },
  stairs(p) {
    afterStorm(p);
  },
};

export function createPlaces(ctx, dest, clock) {
  let current = null;

  function ambience(name) {
    if (name !== 'off' && !Object.hasOwn(PLACES, name)) return;
    const next = name === 'off' ? null : name;
    if ((current?.name ?? null) === next) return;
    if (current) retire(current);
    current = next ? start(next) : null;
  }

  function start(name) {
    const now = ctx.currentTime;
    const bus = gain(ctx, 0);
    bus.gain.setValueAtTime(0, now);
    bus.gain.linearRampToValueAtTime(LEVELS[name] ?? 1, now + FADE);
    bus.connect(dest);
    const place = { name, bus, loops: [], jobs: [] };
    PLACES[name](layers(place));
    for (const job of place.jobs) clock.add(job);
    return place;
  }

  function retire(place) {
    const now = ctx.currentTime;
    settle(place.bus.gain, now);
    place.bus.gain.linearRampToValueAtTime(0, now + FADE);
    for (const job of place.jobs) clock.remove(job);
    for (const src of place.loops) src.stop(now + FADE + 0.05);
    // Sounds already queued (a drip, the foghorn's echo) ring out for up to ten seconds.
    setTimeout(() => place.bus.disconnect(), (FADE + 11) * 1000);
  }

  // The builder a place uses to add its layers and its repeating sounds.
  function layers(place) {
    const { bus } = place;
    const keep = (src, offset) => {
      place.loops.push(src);
      src.start(ctx.currentTime, offset);
      return src;
    };
    const chain = (src, filters, level, pan) => {
      let node = src;
      for (const [type, f, q] of filters) node = node.connect(filter(ctx, type, f, q));
      const g = gain(ctx, level);
      node.connect(g);
      if (pan) g.connect(panner(ctx, pan)).connect(bus);
      else g.connect(bus);
      return { level: g, filter: node === src ? null : node };
    };
    return {
      ctx,
      bus,
      /** A looping noise layer through `filters` ([type, Hz, Q] each). */
      layer(kind, filters, level, { rate = 1, pan = 0 } = {}) {
        const buffer = noise(ctx, kind);
        const src = loop(ctx, buffer, rate);
        const out = chain(src, filters, level, pan);
        keep(src, Math.random() * buffer.duration * 0.9);
        return out;
      },
      /** A steady oscillator (an engine, a hum). */
      osc(type, frequency, filters, level) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = frequency;
        const out = chain(o, filters, level, 0);
        keep(o);
        return { ...out, osc: o };
      },
      hum(base, level, harmonics) {
        const o = ctx.createOscillator();
        o.setPeriodicWave(wave(ctx, `hum${harmonics.join()}`, harmonics));
        o.frequency.value = base;
        const out = chain(o, [], level, 0);
        keep(o);
        return out;
      },
      /** A slow wobble on `param`: `rate` Hz, `depth` in the param's own units. */
      wobble(param, rate, depth) {
        const o = ctx.createOscillator();
        o.frequency.value = rate;
        o.connect(gain(ctx, depth)).connect(param);
        keep(o);
      },
      every(first, min, max, play) {
        place.jobs.push(
          repeat(ctx, first, (t) => {
            play(t);
            return rand(min, max);
          }),
        );
      },
      repeat(first, play) {
        place.jobs.push(repeat(ctx, first, play));
      },
    };
  }

  /**
   * Thunder after a flash. `strength` 0..1: a close strike comes sooner, louder, with a
   * crack; a far one is a low roll. Heard from inside, so the top is muffled by the window.
   */
  function thunder(strength) {
    const s = clamp(num(strength, 0.6), 0, 1);
    const t = ctx.currentTime + 0.05 + (1 - s) * 0.35;
    const len = 2.5 + 4.5 * s;
    const level = 0.06 + 0.3 * s;
    const glass = filter(ctx, 'lowpass', 1800, 0.6);
    glass.connect(dest);
    const env = gain(ctx, 0);
    env.connect(glass);
    // Most of the roll is below 150 Hz, which a phone cannot play, so a band around
    // 300 Hz carries it there.
    const low = loop(ctx, noise(ctx, 'brown'));
    low.connect(filter(ctx, 'lowpass', 150, 0.8)).connect(env);
    const mid = loop(ctx, noise(ctx, 'pink'));
    mid.connect(filter(ctx, 'bandpass', 340, 0.7)).connect(gain(ctx, 2.2)).connect(env);
    env.gain.setValueAtTime(0, t);
    const rolls = 3 + Math.round(3 * s);
    let at = t;
    for (let k = 0; k < rolls; k += 1) {
      const a = level * (k === 0 ? 1 : rand(0.45, 0.9)) * (1 - (0.6 * k) / rolls);
      env.gain.setTargetAtTime(a, at, k === 0 ? 0.03 + 0.15 * (1 - s) : rand(0.1, 0.25));
      env.gain.setTargetAtTime(a * 0.3, at + rand(0.25, 0.5), rand(0.25, 0.5));
      at += (len / rolls) * rand(0.6, 1.2);
    }
    env.gain.setTargetAtTime(0, at, len * 0.12);
    const end = at + len * 0.6;
    for (const src of [low, mid]) {
      src.start(t, rand(0, 2));
      src.stop(end);
    }
    low.onended = () => glass.disconnect();
    if (s > 0.55) {
      burst(ctx, glass, t, { type: 'bandpass', f: 1100, q: 0.5, peak: 0.3 * s, attack: 0.003, decay: 0.35 });
      burst(ctx, glass, t + rand(0.05, 0.1), { type: 'bandpass', f: 650, q: 0.5, peak: 0.2 * s, attack: 0.004, decay: 0.45 });
    }
  }

  return { ambience, thunder };
}

function station(p, amount) {
  p.hum(50, 0.0035 * amount, MAINS);
  p.layer('brown', [['lowpass', 380, 0.7]], 0.05 * amount); // the equipment fan
  p.layer('pink', [['bandpass', 1100, 0.5]], 0.004 * amount); // the air it moves
}

function rainOnGlass(p, amount) {
  p.layer('drizzle', [['highpass', 1500, 0.7]], 0.05 * amount, { pan: -0.3 });
  p.layer('drizzle', [['highpass', 2100, 0.7]], 0.035 * amount, { rate: 0.87, pan: 0.35 });
  p.layer('pink', [['bandpass', 2800, 0.5]], 0.004 * amount);
}

// Returns the rain layers' gains so the wind can throw rain at the glass in a gust.
function heavyRain(p) {
  const a = p.layer('rain', [['highpass', 700, 0.7]], 0.09, { pan: -0.3 });
  const b = p.layer('rain', [['highpass', 900, 0.7]], 0.075, { rate: 0.93, pan: 0.3 });
  p.layer('pink', [['bandpass', 1600, 0.35]], 0.022);
  p.layer('brown', [['lowpass', 260, 0.7]], 0.04); // rain drumming on the roof
  return [a.level, b.level];
}

// Gusts: the wind's body rises and brightens, a whistle at the frame comes with the strong
// ones, and the rain hits the glass harder.
function wind(p, amount, rain) {
  const base = 0.03 * amount;
  const body = p.layer('pink', [['bandpass', 400, 0.9]], base);
  const whistle = p.layer('white', [['bandpass', 950, 14]], 0);
  const rainBase = rain.map((g) => g.gain.value);
  p.repeat(0.5, (t) => {
    const s = rand(0.35, 1);
    const rise = rand(0.8, 2);
    const hold = rand(0.3, 1.4);
    const fall = rand(1.5, 3);
    const down = t + rise + hold;
    body.level.gain.setTargetAtTime(base * (1 + 3.5 * s), t, rise / 3);
    body.level.gain.setTargetAtTime(base, down, fall / 3);
    body.filter.frequency.setTargetAtTime(380 + 320 * s, t, rise / 3);
    body.filter.frequency.setTargetAtTime(380, down, fall / 3);
    whistle.level.gain.setTargetAtTime(0.35 * amount * s * s, t, rise / 3);
    whistle.level.gain.setTargetAtTime(0, down, fall / 4);
    whistle.filter.frequency.setTargetAtTime(820 + 380 * s, t, rise / 2);
    rain.forEach((g, i) => {
      g.gain.setTargetAtTime(rainBase[i] * (1 + 0.6 * s), t + rise * 0.5, rise / 3);
      g.gain.setTargetAtTime(rainBase[i], down, fall / 3);
    });
    return rise + hold + fall + rand(0.2, 2.5);
  });
}

// The sea from the dune: a low swell every six to ten seconds, the foam's hiss just after.
function sea(p, amount) {
  const low = 0.022 * amount;
  const hiss = 0.003 * amount;
  const swell = p.layer('brown', [['lowpass', 600, 0.5]], low);
  const foam = p.layer('pink', [['bandpass', 1300, 0.5]], hiss);
  p.repeat(rand(0.2, 2), (t) => {
    const rise = rand(2, 3.2);
    const s = rand(0.6, 1);
    swell.level.gain.setTargetAtTime(low * (1 + 2 * s), t, rise / 3);
    swell.level.gain.setTargetAtTime(low, t + rise, 1.6);
    foam.level.gain.setTargetAtTime(hiss * (1 + 4 * s), t + rise * 0.8, 0.5);
    foam.level.gain.setTargetAtTime(hiss, t + rise * 0.8 + 0.6, 1.4);
    return rand(6, 10);
  });
}

function car(p) {
  // The engine at cruising revs; its lowest notes are for headphones, its upper ones for
  // phone speakers.
  const engine = p.osc('sawtooth', 62, [['lowpass', 230, 1.1]], 0.03);
  p.wobble(engine.osc.detune, 0.08, 30);
  p.osc('sine', 31, [], 0.025);
  p.layer('pink', [['lowpass', 170, 0.7]], 0.045); // engine roar
  p.layer('brown', [['bandpass', 320, 0.6]], 0.06); // tyres on asphalt
  p.layer('pink', [['bandpass', 900, 0.9]], 0.009); // tyre hiss
  p.layer('white', [['highpass', 2600, 0.7]], 0.002); // air on the windscreen
  p.every(rand(4, 9), 6, 15, (t) => seam(p.ctx, p.bus, t));
}

function flat(p) {
  p.layer('brown', [['lowpass', 260, 0.7]], 0.012); // the room
  p.hum(50, 0.0025, FRIDGE); // the fridge
  p.layer('pink', [['bandpass', 650, 1.4]], 0.004);
  let n = 0;
  p.repeat(0.6, (t) => {
    n += 1;
    tick(p.ctx, p.bus, t, n % 2 === 0);
    return 1;
  });
  p.every(rand(1, 4), 3, 9, (t) => chirps(p.ctx, p.bus, t, { level: rand(0.006, 0.013), tone: 3500 }));
}

function afterStorm(p) {
  p.layer('brown', [['lowpass', 300, 0.7]], 0.01);
  p.layer('pink', [['bandpass', 320, 0.7]], 0.005); // what is left of the wind
  // The gutter drips at a steady beat that drifts; a slower drop hits the metal sill.
  let beat = rand(1, 1.3);
  p.repeat(0.3, (t) => {
    drip(p.ctx, p.bus, t, { level: rand(0.012, 0.024), pitch: rand(1200, 1600), pan: -0.35 });
    beat = clamp(beat * rand(0.97, 1.03), 0.8, 1.6);
    return beat * rand(0.9, 1.1);
  });
  p.repeat(1.4, (t) => {
    tink(p.ctx, p.bus, t, rand(0.004, 0.009));
    return rand(2.2, 3.6);
  });
  p.every(rand(3, 6), 7, 15, (t) => chirps(p.ctx, p.bus, t, { level: 0.005, tone: 2800, far: true, song: 'flute' }));
}

// A water drop: a short sine that jumps up in pitch, the sound of the bubble it makes.
function drip(ctx, dest, t, { level = 0.02, pitch = rand(900, 1700), pan = rand(-0.5, 0.5) } = {}) {
  const side = panner(ctx, pan);
  side.connect(dest);
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(pitch, t);
  o.frequency.exponentialRampToValueAtTime(pitch * rand(1.5, 2.1), t + 0.035);
  const e = ctx.createGain();
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(level, t + 0.002);
  e.gain.exponentialRampToValueAtTime(0.0001, t + rand(0.04, 0.07));
  o.connect(e).connect(side);
  o.start(t);
  o.stop(t + 0.09);
  o.onended = () => side.disconnect();
  burst(ctx, side, t, { type: 'highpass', f: 2500, q: 0.7, peak: level * 0.4, decay: 0.004 });
}

function tink(ctx, dest, t, level) {
  for (const [f, a, d] of [[2350, 1, 0.12], [4900, 0.5, 0.06], [7100, 0.25, 0.03]]) {
    ping(ctx, dest, t, f * rand(0.98, 1.02), level * a, d);
  }
}

// A two-tone foghorn far off in fog: high, then the low grunt. Fog and distance take the
// top off, and the dunes send an echo back.
function foghorn(ctx, dest, t) {
  const out = gain(ctx, 1);
  out.connect(dest);
  const tone = filter(ctx, 'lowpass', 650, 0.7);
  tone.connect(out);
  const echo = ctx.createDelay(1);
  echo.delayTime.value = 0.43;
  const echoTone = filter(ctx, 'lowpass', 420, 0.7);
  tone.connect(echo).connect(echoTone);
  echoTone.connect(gain(ctx, 0.35)).connect(echo);
  echoTone.connect(gain(ctx, 0.6)).connect(out);
  const blast = (f, start, len, level) => {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(level, start + 0.35);
    env.gain.setValueAtTime(level, start + len - 0.5);
    env.gain.linearRampToValueAtTime(0, start + len);
    env.connect(tone);
    for (const cents of [0, 7]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = cents;
      o.connect(env);
      o.start(start);
      o.stop(start + len + 0.05);
    }
  };
  blast(185, t, 2.1, 0.022);
  blast(146, t + 2.15, 2.4, 0.024);
  // The echo is a loop, so it is cut open too, or it would keep itself alive.
  setTimeout(() => {
    out.disconnect();
    echo.disconnect();
  }, (t - ctx.currentTime + 11) * 1000);
}

// A window frame rattling in a gust: a quick, uneven run of knocks that dies down.
function rattle(ctx, dest, t) {
  const n = 6 + Math.floor(rand(0, 9));
  const rate = rand(12, 19);
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx, 'white');
  const hits = gain(ctx, 0);
  const out = gain(ctx, 1);
  out.connect(dest);
  src.connect(hits);
  hits.connect(filter(ctx, 'bandpass', rand(1400, 2000), 2.5)).connect(out);
  hits.connect(filter(ctx, 'bandpass', rand(320, 420), 2)).connect(gain(ctx, 0.8)).connect(out);
  const peak = rand(0.1, 0.2);
  let at = t;
  for (let k = 0; k < n; k += 1) {
    hits.gain.setValueAtTime(peak * (1 - k / n) ** 0.6 * rand(0.5, 1), at);
    hits.gain.setTargetAtTime(0, at + 0.001, 0.006);
    at += (1 / rate) * rand(0.7, 1.3);
  }
  src.start(t, rand(0, 2));
  src.stop(at + 0.1);
  src.onended = () => out.disconnect();
}

// A seam in the road under the front wheels, then the back ones.
function seam(ctx, dest, t) {
  for (const at of [t, t + rand(0.09, 0.12)]) {
    ping(ctx, dest, at, 70, 0.05, 0.08);
    burst(ctx, dest, at, { type: 'lowpass', f: 260, q: 1, peak: 0.07, decay: 0.07 });
  }
}

// A wall clock: tick and tock a little apart in pitch.
function tick(ctx, dest, t, tock) {
  burst(ctx, dest, t, { f: tock ? 2500 : 3100, q: 4, peak: 0.08, decay: 0.012 });
  ping(ctx, dest, t, tock ? 1150 : 1300, 0.006, 0.02);
}

// A bird outside: quick chirps (a sparrow), or a slow fluted phrase (a blackbird far off,
// with the echo of the street).
function chirps(ctx, dest, t, { level = 0.008, tone = 4000, far = false, song = 'chirp' } = {}) {
  const side = panner(ctx, rand(-0.6, 0.6));
  side.connect(dest);
  const out = filter(ctx, 'lowpass', tone, 0.7);
  out.connect(side);
  if (far) {
    const echo = ctx.createDelay(0.5);
    echo.delayTime.value = rand(0.17, 0.24);
    out.connect(echo).connect(gain(ctx, 0.3)).connect(side);
  }
  const flute = song === 'flute';
  const n = flute ? 3 + Math.floor(rand(0, 3)) : 2 + Math.floor(rand(0, 4));
  const base = flute ? rand(1700, 2500) : rand(2600, 4200);
  let at = t;
  for (let i = 0; i < n; i += 1) {
    const len = flute ? rand(0.14, 0.3) : rand(0.05, 0.11);
    const f = base * rand(0.88, 1.12);
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(f, at);
    o.frequency.exponentialRampToValueAtTime(f * (flute ? rand(0.8, 1.25) : rand(1.15, 1.45)), at + len * 0.7);
    const e = ctx.createGain();
    e.gain.setValueAtTime(0, at);
    e.gain.linearRampToValueAtTime(level, at + (flute ? 0.03 : 0.012));
    e.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(e).connect(out);
    o.start(at);
    // The last note runs on silent for a moment so the echo can finish before cleanup.
    const last = i === n - 1;
    o.stop(at + len + (last ? 0.4 : 0.02));
    if (last) o.onended = () => side.disconnect();
    at += len + (flute ? rand(0.08, 0.2) : rand(0.04, 0.1));
  }
}
