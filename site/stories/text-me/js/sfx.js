// sfx.js: the sounds that are not music, all made in code: the phone buzzing, a message
// landing, one being sent, keys while a reply types itself, and the sound of each place
// (crickets at night, birds in the morning, rain in the city, water at the lake, a fire).
// The place sounds cross-fade when the scene changes, the way the light does.

export function createSfx(ctx, out) {
  const noise = noiseBuffer(ctx);
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(out);

  const env = (t, peak, attack, decay) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(master);
    return g;
  };
  const tone = (type, f, t, g, len) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.connect(g);
    o.start(t);
    o.stop(t + len);
    return o;
  };
  const burst = (t, len, filterType, f, peak, q = 1) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = f;
    filter.Q.value = q;
    src.connect(filter).connect(env(t, peak, 0.004, len));
    src.start(t, Math.random() * 2);
    src.stop(t + len + 0.05);
    return filter;
  };

  // Place sounds: each is a set of looping noise layers plus occasional calls (birds, crickets).
  const PLACES = {
    night: { layers: [['lowpass', 300, 0.02]], calls: 'crickets' },
    morning: { layers: [['bandpass', 500, 0.012]], calls: 'birds' },
    summer: { layers: [['bandpass', 600, 0.014]], calls: 'birds' },
    lake: { layers: [['lowpass', 520, 0.04, 0.18]], calls: 'birds' },
    fire: { layers: [['lowpass', 200, 0.03]], calls: 'crackle' },
    evening: { layers: [['bandpass', 420, 0.02, 0.07]], calls: 'birds' },
    rain: { layers: [['highpass', 1500, 0.05], ['lowpass', 350, 0.05]] },
    room: { layers: [['lowpass', 110, 0.05]] },
    wind: { layers: [['bandpass', 380, 0.05, 0.07]] },
    car: { layers: [['lowpass', 160, 0.09]] },
  };
  let place = null;
  let calls = 0;

  function ambience(name) {
    if (place?.name === name) return;
    const now = ctx.currentTime;
    if (place) {
      const old = place;
      old.bus.gain.setTargetAtTime(0, now, 0.7);
      setTimeout(() => old.sources.forEach((s) => s.stop()), 4000);
    }
    clearInterval(calls);
    place = null;
    const def = PLACES[name];
    if (!def) return;
    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.gain.setTargetAtTime(1, now, 0.9);
    bus.connect(master);
    const sources = def.layers.map(([type, f, level, sway]) => {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = level;
      src.connect(filter).connect(g).connect(bus);
      if (sway) {
        // Slow swells: wind gusts, water lapping.
        const lfo = ctx.createOscillator();
        lfo.frequency.value = sway;
        const depth = ctx.createGain();
        depth.gain.value = level * 0.8;
        lfo.connect(depth).connect(g.gain);
        lfo.start();
        src.addEventListener('ended', () => lfo.stop());
      }
      src.start(0, Math.random() * 2);
      return src;
    });
    place = { name, bus, sources };
    if (def.calls) calls = setInterval(() => call(def.calls, bus), 300);
  }

  function call(kind, bus) {
    const t = ctx.currentTime + 0.05;
    if (kind === 'crickets' && Math.random() < 0.35) {
      for (let i = 0; i < 3; i += 1) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t + i * 0.06);
        g.gain.linearRampToValueAtTime(0.008, t + i * 0.06 + 0.01);
        g.gain.linearRampToValueAtTime(0, t + i * 0.06 + 0.04);
        g.connect(bus);
        tone('sine', 4300 + Math.random() * 200, t + i * 0.06, g, 0.06);
      }
    }
    if (kind === 'birds' && Math.random() < 0.09) {
      const notes = 2 + Math.floor(Math.random() * 3);
      const base = 2400 + Math.random() * 1400;
      for (let i = 0; i < notes; i += 1) {
        const s = t + i * 0.11;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(0.012, s + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 0.09);
        g.connect(bus);
        const o = tone('sine', base, s, g, 0.1);
        o.frequency.exponentialRampToValueAtTime(base * (1.15 + Math.random() * 0.3), s + 0.07);
      }
    }
    if (kind === 'crackle' && Math.random() < 0.6) {
      burst(t + Math.random() * 0.2, 0.02 + Math.random() * 0.03, 'highpass', 2000, 0.04 + Math.random() * 0.05);
    }
  }

  return {
    ambience,
    /** The phone vibrating twice on a table. */
    buzz() {
      const t = ctx.currentTime;
      for (const at of [0, 0.32]) {
        const g = env(t + at, 0.06, 0.02, 0.2);
        tone('square', 150, t + at, g, 0.24);
        tone('sine', 75, t + at, g, 0.24);
      }
    },
    /** A message landing. */
    pop() {
      const t = ctx.currentTime;
      const o = tone('sine', 880, t, env(t, 0.06, 0.005, 0.18), 0.2);
      o.frequency.exponentialRampToValueAtTime(1320, t + 0.06);
    },
    /** A message going out. */
    whoosh() {
      const f = burst(ctx.currentTime, 0.22, 'bandpass', 700, 0.08, 2);
      f.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.2);
    },
    /** One key of a reply typing itself. */
    tick() {
      burst(ctx.currentTime, 0.015, 'highpass', 3000, 0.025);
    },
    /** A soft footstep or pedal push while the player holds. */
    step(heldMs) {
      const n = Math.floor(heldMs / 420);
      if (n !== this.steps) {
        this.steps = n;
        burst(ctx.currentTime, 0.06, 'lowpass', 500, 0.05);
      }
    },
  };
}

function noiseBuffer(ctx) {
  const length = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) d[i] = Math.random() * 2 - 1;
  return buffer;
}
