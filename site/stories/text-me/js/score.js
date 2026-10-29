// score.js: the story's music, made live with the Web Audio API like the menu's.
//
// One short melody, the "home" theme, runs through the whole life. It is a music box in
// childhood, a piano later, only its first bar on the lonely night (left unfinished), and
// in full, slowly, with strings under it, when the last text arrives, and once more at the
// very end, on the music box alone, finished for the first time, when you text Mom home.
// Each part of life is an act with its own chords, speed, brightness and instruments; a new
// act starts on the next chord, so a change of music always lands on a chord change (a
// loss does not wait for the bar). Fading the music fades what goes into the room, never
// the room itself, so a cut leaves its echo ringing.

const LOOKAHEAD = 1.5;
const TICK_MS = 200;

// Chords as [bass, [pad notes]] in MIDI numbers, all in or around D major.
const C = {
  D: [38, [54, 57, 61, 64]],
  Bm: [35, [54, 57, 61, 62]],
  G: [43, [54, 59, 61, 62]],
  A: [45, [52, 57, 59, 61]],
  Gs: [43, [55, 59, 62, 66]],
  Ds: [38, [54, 57, 62, 66]],
  As: [45, [52, 57, 61, 64]],
  Bms: [35, [54, 57, 62, 66]],
  Em: [40, [55, 59, 62, 67]],
  Fs: [42, [54, 58, 61, 66]],
  Em9: [40, [55, 59, 62, 66]],
  A11: [45, [55, 59, 62, 66]],
  Dm7: [38, [54, 57, 61, 64]],
  Bm7: [35, [54, 57, 62, 66]],
  Fsm: [42, [57, 61, 64, 66]],
  Gm7: [43, [54, 59, 62, 66]],
  Ar: [45, [57, 61, 64, 66]],
  Bmr: [47, [54, 59, 62, 66]],
  Dr: [38, [57, 62, 66, 69]],
};

// The theme: four bars of [note, beat, beats], four beats a bar.
const THEME = [
  [[74, 0, 1], [76, 1, 1], [78, 2, 2]],
  [[76, 0, 1], [74, 1, 1], [71, 2, 2]],
  [[69, 0, 1], [71, 1, 1], [74, 2, 1], [76, 3, 1]],
  [[74, 0, 4]],
];

// The acts. sec: seconds per chord; bright: how open the pad's filter gets (Hz); keys:
// chance of a soft top note per half beat; arp: plucked chord notes in eighths; theme:
// which voice plays the theme and how often (every n rounds of four chords).
const ACTS = {
  frame: { chords: ['D', 'G', 'Bm', 'A'], sec: 9, bright: 650, pad: 0.6, bass: 0.6, keys: 0.12, voice: 'piano' },
  morning: { chords: ['D', 'Bm', 'G', 'A'], sec: 6, bright: 1600, pad: 0.65, bass: 0.7, keys: 0.12, voice: 'box', theme: { voice: 'box', every: 2 } },
  noon: { chords: ['Gs', 'Ds', 'As', 'Bms'], sec: 4.2, bright: 2200, pad: 0.55, bass: 0.9, keys: 0.15, voice: 'piano', arp: 0.5, theme: { voice: 'piano', every: 3 } },
  evening: { chords: ['Bms', 'Gs', 'Ds', 'As'], sec: 6.5, bright: 1100, pad: 0.75, bass: 0.7, keys: 0.14, voice: 'piano', theme: { voice: 'piano', every: 3, bars: 2 } },
  lonely: { chords: ['Bms', 'Em', 'Bms', 'Fs'], sec: 8.5, bright: 520, pad: 0.55, bass: 0.45, keys: 0, voice: 'piano', theme: { voice: 'piano', every: 2, bars: 1 } },
  goose: { chords: ['Em9', 'A11', 'Dm7', 'Bm7'], sec: 5.5, bright: 900, pad: 0.5, bass: 0.85, keys: 0.22, voice: 'ep' },
  dawn: { chords: ['Dr', 'Gs', 'Ar', 'Bmr'], sec: 5.5, bright: 1900, pad: 0.7, bass: 0.8, keys: 0.12, voice: 'piano', strings: 0.5, theme: { voice: 'piano', every: 2 } },
  grief: { chords: ['Bms', 'Gs', 'Em', 'Gs'], sec: 9, bright: 450, pad: 0.5, bass: 0.4, keys: 0, voice: 'piano', urgent: true },
  // The last wait, from "Read" to the reply: one suspended chord that will not settle until
  // the reply does.
  wait: { chords: ['As', 'As'], sec: 7, bright: 600, pad: 0.55, bass: 0.5, keys: 0, voice: 'piano', urgent: true },
  afternoon: { chords: ['Ds', 'Fsm', 'Gm7', 'As'], sec: 6.5, bright: 1400, pad: 0.65, bass: 0.75, keys: 0.14, voice: 'piano', theme: { voice: 'piano', every: 3 } },
  end: { chords: ['D', 'G', 'Bm', 'A'], sec: 8, bright: 800, pad: 0.55, bass: 0.55, keys: 0.1, voice: 'box' },
};

// Piano-like tone: [frequency ratio, level, seconds to fade]. Music box: brighter and shorter,
// with the slightly out-of-tune upper partials a metal tine has.
const VOICES = {
  piano: { partials: [[1, 1, 3.2], [2, 0.3, 1.6], [3, 0.1, 0.9], [4.2, 0.04, 0.5]], level: 0.12, shift: 0 },
  box: { partials: [[1, 1, 1.6], [3.98, 0.28, 0.6], [6.1, 0.1, 0.3]], level: 0.09, shift: 12 },
  ep: { partials: [[1, 1, 2.4], [2, 0.18, 1.2], [3.01, 0.06, 0.6]], level: 0.11, shift: -12 },
  pluck: { partials: [[1, 1, 0.5], [2, 0.25, 0.25]], level: 0.05, shift: 0 },
};

export function createScore(ctx, out) {
  const gain = (v) => {
    const g = ctx.createGain();
    g.gain.value = v;
    return g;
  };
  const master = gain(1);
  master.connect(out);
  const reverbIn = gain(1);
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 3.6, 2.6);
  reverbIn.connect(reverb).connect(master);
  const echoIn = gain(1);
  const echo = ctx.createDelay(1);
  echo.delayTime.value = 0.42;
  const echoTone = ctx.createBiquadFilter();
  echoTone.type = 'lowpass';
  echoTone.frequency.value = 1700;
  echoIn.connect(echo).connect(echoTone);
  echoTone.connect(gain(0.3)).connect(echo);
  echoTone.connect(master);
  const bus = (dry, wet, delayed = 0) => {
    const input = gain(0);
    input.connect(gain(dry)).connect(master);
    input.connect(gain(wet)).connect(reverbIn);
    if (delayed) input.connect(gain(delayed)).connect(echoIn);
    return input;
  };
  const padBus = bus(0.7, 0.55);
  const keyBus = bus(0.75, 0.6, 0.2);
  const bassBus = bus(1, 0.12);
  const feeds = [padBus, keyBus, bassBus];
  const fade = (value, seconds) => feeds.forEach((f) => ramp(f, value, seconds));

  let act = null;
  let pending = null;
  let next = 0;
  let index = 0;
  let rounds = 0;
  let timer = 0;
  let ending = 0;

  function play(name) {
    clearTimeout(ending);
    // 'silence' lets the music go over a breath; 'cut' stops it mid-phrase (Dad's last
    // "home"), and the echo carries on alone.
    if (name === 'silence' || name === 'cut') {
      act = null;
      pending = null;
      fade(0, name === 'cut' ? 0.12 : 1.6);
      return;
    }
    if (name === 'home') return home();
    if (name === 'remember') return remember();
    if (!ACTS[name]) return;
    if (!act) {
      act = ACTS[name];
      index = 0;
      rounds = 0;
      next = ctx.currentTime + 0.1;
      fade(0.85, 3);
    } else {
      pending = ACTS[name];
    }
    if (!timer) timer = setInterval(() => schedule(), TICK_MS);
    schedule();
  }

  function schedule(horizon = ctx.currentTime + LOOKAHEAD) {
    if (!act) return;
    while (next < horizon) {
      if (pending && (index % 2 === 0 || pending.urgent)) {
        act = pending;
        pending = null;
        index = 0;
        rounds = 0;
      }
      const name = act.chords[index % act.chords.length];
      chord(C[name], next, act.sec, act);
      if (act.keys) sprinkle(next, act);
      if (act.arp) arpeggio(C[name], next, act);
      const t = act.theme;
      if (t && index % 4 === 0 && rounds % t.every === t.every - 1) theme(t.voice, next, act.sec / 4, t.bars ?? 4);
      next += act.sec;
      index += 1;
      if (index % 4 === 0) rounds += 1;
    }
  }

  // The last text lands: the theme in full, slower, with strings, over D Bm G D, then quiet.
  function home() {
    pending = null;
    act = null;
    const t0 = ctx.currentTime + 0.3;
    const sec = 5;
    fade(0.95, 1.5);
    const run = { sec, bright: 1500, pad: 0.75, bass: 0.7, strings: 0.8 };
    ['D', 'Bm', 'G', 'D'].forEach((n, i) => chord(C[n], t0 + i * sec, sec, run));
    chord(C.D, t0 + 4 * sec, sec * 1.6, run);
    theme('piano', t0, sec / 4, 4);
    ending = setTimeout(() => fade(0, 6), (4 * sec + 5) * 1000);
  }

  // Texting Mom home: the theme on the music box alone, over one soft D, slowing like a box
  // winding down, finished for the first time: the E falls to the D.
  function remember() {
    pending = null;
    act = null;
    const t0 = ctx.currentTime + 0.4;
    fade(0.9, 1);
    chord(C.D, t0, 14, { bright: 700, pad: 0.4, bass: 0.35 });
    let at = t0;
    THEME.forEach((bar, b) => {
      const beat = 0.62 + b * 0.09;
      for (const [n, on] of bar) note('box', n, at + on * beat, 0.55);
      at += 4 * beat;
    });
    ending = setTimeout(() => fade(0, 7), (at - ctx.currentTime + 3) * 1000);
  }

  function chord([bassNote, pad], t, dur, a) {
    const end = t + dur;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.Q.value = 0.6;
    tone.frequency.setValueAtTime(a.bright * 0.4, t);
    tone.frequency.linearRampToValueAtTime(a.bright, t + dur / 2);
    tone.frequency.linearRampToValueAtTime(a.bright * 0.45, end + 4);
    tone.connect(padBus);
    const swell = envelope(t, end, 2.6, 4.2, a.pad);
    swell.connect(tone);
    const voices = a.strings ? [...pad, ...pad.map((n) => n + 12)] : pad;
    voices.forEach((note, i) => {
      for (const cents of [-7, 7]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = hz(note);
        o.detune.value = cents;
        o.connect(gain(i >= pad.length ? 0.012 * a.strings : 0.02)).connect(swell);
        o.start(t);
        o.stop(end + 4.3);
      }
    });
    const b = envelope(t, end, 2, 3.4, a.bass);
    b.connect(bassBus);
    const low = ctx.createOscillator();
    low.frequency.value = hz(bassNote);
    low.connect(gain(0.15)).connect(b);
    const high = ctx.createOscillator();
    high.type = 'triangle';
    high.frequency.value = hz(bassNote + 12);
    high.connect(gain(0.04)).connect(b);
    for (const o of [low, high]) {
      o.start(t);
      o.stop(end + 3.5);
    }
    low.onended = () => {
      tone.disconnect();
      b.disconnect();
    };
  }

  function envelope(t, end, attack, release, level) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + attack);
    g.gain.setValueAtTime(level, end);
    g.gain.linearRampToValueAtTime(0, end + release);
    return g;
  }

  // Soft top notes from D major pentatonic, a few per chord, never the same twice.
  function sprinkle(t, a) {
    const scale = [62, 64, 66, 69, 71, 74, 76, 78];
    for (let half = 1; half < 8; half += 1) {
      if (Math.random() < a.keys) {
        note(a.voice, scale[Math.floor(Math.random() * scale.length)], t + (half * a.sec) / 8, 0.25 + Math.random() * 0.3);
      }
    }
  }

  function arpeggio([, pad], t, a) {
    const steps = 8;
    for (let s = 0; s < steps; s += 1) {
      note('pluck', pad[[0, 1, 2, 3, 2, 1, 2, 3][s]] + 12, t + (s * a.sec) / steps, a.arp);
    }
  }

  function theme(voice, t, beat, bars) {
    THEME.slice(0, bars).forEach((bar, b) => {
      for (const [n, at] of bar) note(voice, n, t + (b * 4 + at) * beat, 0.6);
    });
  }

  function note(voice, midi, t, velocity) {
    const v = VOICES[voice];
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = voice === 'box' ? 5200 : 2600;
    tone.connect(keyBus);
    v.partials.forEach(([ratio, amount, decay], i) => {
      const o = ctx.createOscillator();
      o.frequency.value = hz(midi + v.shift) * ratio;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(amount * velocity * v.level, t + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(env).connect(tone);
      o.start(t);
      o.stop(t + decay + 0.05);
      if (i === 0) o.onended = () => tone.disconnect();
    });
  }

  function ramp(g, value, seconds) {
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(value, now + seconds);
  }

  return {
    play,
    /** For tests: queue everything up to `until` without the live timer. */
    scheduleUntil(until) {
      schedule(until);
    },
  };
}

function impulse(ctx, seconds, curve) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c += 1) {
    const d = buffer.getChannelData(c);
    let s = 0;
    for (let i = 0; i < length; i += 1) {
      s += 0.35 * (Math.random() * 2 - 1 - s);
      d[i] = s * (1 - i / length) ** curve;
    }
  }
  return buffer;
}

function hz(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}
