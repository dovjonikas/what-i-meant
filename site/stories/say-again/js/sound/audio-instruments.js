// audio-instruments.js: the instruments the score plays, all synthesized on the spot: a
// soft pad of detuned saw waves, a low bass, piano, music box and celesta, a plucked low
// pulse, a bowed drone and one held tone. Each call schedules one chord or note for one
// act; the act's sources are kept in `run.live` so a crossfade can stop them.

import { gain, filter, hz, rand } from './audio-kit.js';

// Struck tones as sine partials: [frequency ratio, level, seconds to fade]. The music box
// has the slightly out-of-tune upper partials of a metal tine; the celesta is rounder.
const KEYS = {
  piano: { partials: [[1, 1, 3.2], [2, 0.3, 1.6], [3, 0.1, 0.9], [4.2, 0.04, 0.5]], level: 0.12, shift: 0, bright: 2600 },
  box: { partials: [[1, 1, 1.6], [3.98, 0.28, 0.6], [6.1, 0.1, 0.3]], level: 0.09, shift: 12, bright: 5200 },
  celesta: { partials: [[1, 1, 2.2], [2, 0.12, 0.9], [4.02, 0.16, 0.35]], level: 0.085, shift: 12, bright: 4200 },
};

/** The instruments for one act. `run` has `feeds` (pad, keys, bass) and `live`. */
export function instrumentsFor(ctx, run) {
  const { feeds, live } = run;
  const osc = (type, frequency, cents = 0) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = frequency;
    o.detune.value = cents;
    return o;
  };
  const keep = (src, t, stop) => {
    live.add(src);
    src.addEventListener('ended', () => live.delete(src));
    src.start(t);
    src.stop(stop);
    return src;
  };
  // Rises over `attack`, holds until `end`, falls over `release`.
  const envelope = (t, end, attack, release, level) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + Math.min(attack, end - t));
    g.gain.setValueAtTime(level, end);
    g.gain.linearRampToValueAtTime(0, end + release);
    return g;
  };

  /**
   * A chord on the pad: two saws a little apart per note, under a lowpass that opens toward
   * the middle. `strings` adds the notes an octave up; `tremolo` shakes the level about
   * seven times a second, as bowed strings do in tremolo.
   */
  function pad(notes, t, dur, { bright = 900, level = 0.5, attack = 2.5, release = 4, strings = 0, tremolo = 0 } = {}) {
    if (!notes.length) return;
    const end = t + dur;
    const stop = end + release + 0.1;
    const tone = filter(ctx, 'lowpass', bright * 0.4, 0.6);
    tone.frequency.setValueAtTime(bright * 0.4, t);
    tone.frequency.linearRampToValueAtTime(bright, t + Math.min(dur / 2, 4));
    tone.frequency.linearRampToValueAtTime(bright * 0.45, end + release);
    tone.connect(feeds.pad);
    const swell = envelope(t, end, attack, release, level * 0.02);
    if (tremolo) {
      const shake = gain(ctx, 1 - tremolo / 2);
      const lfo = osc('sine', rand(6.8, 7.6));
      lfo.connect(gain(ctx, tremolo / 2)).connect(shake.gain);
      swell.connect(shake).connect(tone);
      keep(lfo, t, stop);
    } else {
      swell.connect(tone);
    }
    let upper = null;
    if (strings) {
      upper = gain(ctx, 0.6 * strings);
      upper.connect(swell);
    }
    let last = null;
    const voices = notes.map((n) => [n, swell]).concat(upper ? notes.map((n) => [n + 12, upper]) : []);
    for (const [n, into] of voices) {
      for (const cents of [-7, 7]) {
        last = osc('sawtooth', hz(n), cents);
        last.connect(into);
        keep(last, t, stop);
      }
    }
    last.onended = () => tone.disconnect();
  }

  // A sine for weight on headphones, and a quiet triangle an octave up so the note can
  // still be heard on a phone speaker, which cannot play the low sine.
  function bass(note, t, dur, level = 0.5, release = 3.4) {
    const end = t + dur;
    const env = envelope(t, end, 2, release, level);
    env.connect(feeds.bass);
    const low = osc('sine', hz(note));
    low.connect(gain(ctx, 0.15)).connect(env);
    const high = osc('triangle', hz(note + 12));
    high.connect(gain(ctx, 0.04)).connect(env);
    keep(low, t, end + release + 0.1);
    keep(high, t, end + release + 0.1);
    low.onended = () => env.disconnect();
  }

  function key(voice, midi, t, velocity = 0.5) {
    const v = KEYS[voice] ?? KEYS.piano;
    const tone = filter(ctx, 'lowpass', v.bright, 0.7);
    tone.connect(feeds.keys);
    v.partials.forEach(([ratio, amount, decay], i) => {
      const o = osc('sine', hz(midi + v.shift) * ratio);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(amount * velocity * v.level, t + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(env).connect(tone);
      keep(o, t, t + decay + 0.05);
      if (i === 0) o.onended = () => tone.disconnect();
    });
  }

  // A soft low pluck for the pulse: a saw and a triangle whose brightness closes fast, so
  // it is felt more than heard, with no drum in it.
  function pluck(note, t, velocity = 0.3, decay = 0.45) {
    const tone = filter(ctx, 'lowpass', 1100, 1.2);
    tone.frequency.setValueAtTime(1100, t);
    tone.frequency.exponentialRampToValueAtTime(180, t + decay);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(velocity * 0.22, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    tone.connect(env).connect(feeds.bass);
    const saw = osc('sawtooth', hz(note));
    const body = osc('triangle', hz(note));
    saw.connect(tone);
    body.connect(tone);
    keep(saw, t, t + decay + 0.05);
    keep(body, t, t + decay + 0.05);
    saw.onended = () => env.disconnect();
  }

  // A bowed low string: two saws, dark, with vibrato that comes in once the bow has
  // settled, as a player's does.
  function bow(note, t, dur, { level = 0.4, attack = 2.5, release = 3, bright = 650, cents = 0 } = {}) {
    const end = t + dur;
    const stop = end + release + 0.1;
    const env = envelope(t, end, attack, release, level * 0.05);
    const tone = filter(ctx, 'lowpass', bright, 0.9);
    env.connect(tone).connect(feeds.pad);
    const vibrato = osc('sine', rand(4.6, 5.4));
    const depth = gain(ctx, 0);
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(7, t + Math.min(attack + 1, dur));
    vibrato.connect(depth);
    for (const c of [-5, 5]) {
      const o = osc('sawtooth', hz(note), c + cents);
      depth.connect(o.detune);
      o.connect(env);
      keep(o, t, stop);
    }
    keep(vibrato, t, stop);
    vibrato.onended = () => tone.disconnect();
  }

  // One tone held until the next act stops it.
  function hold(note, t, { level = 0.1, attack = 3 } = {}) {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(level, t + attack);
    const tone = filter(ctx, 'lowpass', 1800, 0.7);
    env.connect(tone).connect(feeds.pad);
    const pure = osc('sine', hz(note));
    pure.connect(env);
    const warm = osc('triangle', hz(note), 3);
    warm.connect(gain(ctx, 0.25)).connect(env);
    keep(pure, t, t + 1800);
    keep(warm, t, t + 1800);
    pure.onended = () => tone.disconnect();
  }

  return { pad, bass, key, pluck, bow, hold };
}
