// audio-animals.js: the small living things at the station window, for when you touch
// them: a roe deer's soft call and a fawn's bleat outside (heard through the glass, a
// little far), a cat purring on the desk and its sleepy chirp, and a moth against the lamp
// shade. All soft; none of them is meant to startle.
//
// The calls are a buzz at the animal's pitch shaped by a couple of formant filters (the
// filters a throat makes), with air mixed in. Pitches and lengths come from
// how these animals sound, nudged a little at random so no two calls are the same.

import { noise, gain, filter, panner, loop, burst, ping, rand, clamp, num } from './audio-kit.js';

export function createAnimals(ctx, dest) {
  // Outside: the window takes the top off, and the yard sends a faint echo back.
  const glass = filter(ctx, 'lowpass', 2600, 0.7);
  glass.connect(dest);
  const yard = ctx.createDelay(0.5);
  yard.delayTime.value = 0.21;
  glass.connect(yard).connect(gain(ctx, 0.2)).connect(dest);

  /**
   * One animal call from t: a buzz following `pitch` ([seconds, Hz] points), shaped by
   * formants that follow `vowel` ([seconds, F1, F2] points), with `air` (0..1) of breath
   * and an envelope of `len` seconds. Returns the nodes the caller may modulate.
   */
  function call(t, len, { pitch, vowel, air = 0.2, level = 0.1, into = dest, pan = 0, q = [4, 6] }) {
    const out = gain(ctx, 0);
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(level, t + Math.min(0.04, len / 4));
    out.gain.setTargetAtTime(level * 0.7, t + len * 0.35, len * 0.25);
    out.gain.setTargetAtTime(0, t + len * 0.8, len * 0.06);
    out.connect(panner(ctx, pan)).connect(into);
    const shape = gain(ctx, 1);
    const f1 = filter(ctx, 'bandpass', vowel[0][1], q[0]);
    const f2 = filter(ctx, 'bandpass', vowel[0][2], q[1]);
    shape.connect(f1).connect(out);
    shape.connect(f2).connect(gain(ctx, 0.6)).connect(out);
    f1.frequency.setValueAtTime(vowel[0][1], t);
    f2.frequency.setValueAtTime(vowel[0][2], t);
    for (const [at, a, b] of vowel.slice(1)) {
      f1.frequency.linearRampToValueAtTime(a, t + at);
      f2.frequency.linearRampToValueAtTime(b, t + at);
    }
    const buzz = ctx.createOscillator();
    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(pitch[0][1], t);
    for (const [at, f] of pitch.slice(1)) buzz.frequency.linearRampToValueAtTime(f, t + at);
    const tone = gain(ctx, 6);
    buzz.connect(tone).connect(shape);
    const breath = loop(ctx, noise(ctx, 'white'));
    breath.connect(filter(ctx, 'highpass', 500, 0.7)).connect(gain(ctx, air * 4)).connect(shape);
    buzz.start(t);
    breath.start(t, rand(0, 3));
    buzz.stop(t + len + 0.1);
    breath.stop(t + len + 0.1);
    buzz.onended = () => out.disconnect();
    return { buzz, tone, out };
  }

  // A slow shake on a gain: a voice's roughness, or a bleat's tremble.
  function shake(param, t, len, rate, depth) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const amount = gain(ctx, depth);
    lfo.connect(amount).connect(param);
    lfo.start(t);
    lfo.stop(t + len + 0.1);
    return { lfo, amount };
  }

  // A roe deer's soft call: one hoarse, low "bah", falling at the end.
  function deer() {
    const t = ctx.currentTime + 0.02;
    const len = rand(0.32, 0.45);
    const f = rand(250, 300);
    const c = call(t, len, {
      pitch: [[0, f], [0.06, f * 1.08], [len, f * 0.72]],
      vowel: [[0, 650, 1150], [0.08, 780, 1300], [len, 560, 1050]],
      air: 0.55,
      level: 0.035,
      into: glass,
      pan: rand(-0.5, 0.5),
    });
    // Hoarseness: the voice flutters about 35 times a second.
    shake(c.tone.gain, t, len, rand(30, 40), 3);
  }

  // A fawn's bleat, "meeh": high and small, starting closed (the "m"), opening, with the
  // quick tremble a young animal's voice has, a lift in the middle and a little fall.
  function fawn() {
    const t = ctx.currentTime + 0.02;
    const len = rand(0.5, 0.68);
    const f = rand(680, 780);
    const c = call(t, len, {
      pitch: [[0, f * 0.9], [0.1, f * 1.08], [len * 0.6, f * 1.12], [len, f * 0.92]],
      vowel: [[0, 350, 1500], [0.07, 600, 2200], [len * 0.7, 560, 2000], [len, 480, 1800]],
      air: 0.18,
      level: 0.045,
      into: glass,
      pan: rand(-0.4, 0.4),
      q: [3, 5],
    });
    const tremble = shake(c.out.gain, t + 0.1, len - 0.1, rand(9, 12), 0);
    tremble.amount.gain.setValueAtTime(0, t + 0.1);
    tremble.amount.gain.linearRampToValueAtTime(0.012, t + 0.25);
    const vibrato = shake(c.buzz.frequency, t + 0.1, len - 0.1, rand(9, 12), 0);
    vibrato.amount.gain.setValueAtTime(0, t + 0.1);
    vibrato.amount.gain.linearRampToValueAtTime(f * 0.03, t + 0.25);
  }

  /**
   * A cat purring on the desk for `ms`: a soft rattle about 26 times a second, louder
   * breathing out than in, fading in and out. Returns a function that stops it early.
   */
  function purr(ms) {
    const len = clamp(num(ms, 3000), 300, 30000) / 1000;
    const t = ctx.currentTime + 0.02;
    const end = t + len;
    // out follows the breaths, fade the whole purr in and out.
    const out = gain(ctx, 0);
    const fade = gain(ctx, 0);
    const warm = filter(ctx, 'lowpass', 900, 0.8);
    const chest = filter(ctx, 'peaking', 220, 1.5);
    chest.gain.value = 6;
    out.connect(fade).connect(chest).connect(warm).connect(dest);
    // The rattle: each beat the noise opens at once and dies away over the cycle (a saw
    // turned upside down), as the cat's larynx snaps open and closes; the beat itself,
    // filtered low, gives the body you feel through the desk.
    const beat = ctx.createOscillator();
    beat.type = 'sawtooth';
    beat.frequency.value = 26;
    const air = loop(ctx, noise(ctx, 'pink'));
    const rattle = gain(ctx, 0.5);
    air.connect(filter(ctx, 'bandpass', 420, 0.6)).connect(rattle).connect(out);
    beat.connect(gain(ctx, -0.5)).connect(rattle.gain);
    beat.connect(filter(ctx, 'lowpass', 300, 0.7)).connect(gain(ctx, 0.05)).connect(out);
    // Breaths: out (louder, a touch faster) then in, about a second each.
    out.gain.setValueAtTime(0, t);
    const peak = 0.42;
    let at = t;
    let outBreath = true;
    while (at < end - 0.2) {
      const breath = Math.min(rand(0.85, 1.25), end - at);
      out.gain.setTargetAtTime(peak * (outBreath ? 1 : 0.55), at, 0.08);
      beat.frequency.setTargetAtTime(outBreath ? rand(25, 27) : rand(22, 24), at, 0.05);
      out.gain.setTargetAtTime(peak * 0.25, at + breath - 0.12, 0.04);
      at += breath;
      outBreath = !outBreath;
    }
    const rise = Math.min(0.7, len / 3);
    fade.gain.setValueAtTime(0, t);
    fade.gain.linearRampToValueAtTime(1, t + rise);
    fade.gain.setValueAtTime(1, Math.max(t + rise, end - Math.min(0.9, len / 3)));
    fade.gain.linearRampToValueAtTime(0, end);
    beat.start(t);
    air.start(t, rand(0, 3));
    for (const s of [beat, air]) s.stop(end + 0.05);
    beat.onended = () => warm.disconnect();
    let stopped = false;
    return () => {
      if (stopped) return;
      stopped = true;
      try {
        const now = ctx.currentTime;
        if (now >= end) return;
        fade.gain.cancelScheduledValues(now);
        fade.gain.setValueAtTime(fade.gain.value, now);
        fade.gain.linearRampToValueAtTime(0, now + 0.4);
        for (const s of [beat, air]) s.stop(now + 0.45);
      } catch {
        // Already ended.
      }
    };
  }

  // A sleepy cat's chirp-mew: a short rolled "mrr", then a small "mew" that rises, falls
  // and closes to an "oo".
  function catMew() {
    const t = ctx.currentTime + 0.02;
    const roll = rand(0.08, 0.12);
    const len = roll + rand(0.3, 0.4);
    const f = rand(520, 600);
    const c = call(t, len, {
      pitch: [[0, f * 0.8], [roll, f], [roll + 0.12, f * 1.3], [len, f * 0.85]],
      vowel: [[0, 350, 1100], [roll, 420, 1900], [roll + 0.12, 700, 1600], [len, 420, 950]],
      air: 0.35,
      level: 0.033,
      pan: rand(-0.2, 0.2),
    });
    const trill = shake(c.out.gain, t, roll, rand(24, 30), 0.022);
    trill.amount.gain.setValueAtTime(0.022, t + roll);
    trill.amount.gain.linearRampToValueAtTime(0, t + roll + 0.02);
  }

  // A moth against the lamp shade: a few faint ticks of wing on paper, and the soft blur
  // of its wings between them.
  function moth() {
    const t = ctx.currentTime + 0.01;
    const hits = 4 + Math.floor(rand(0, 7));
    let at = t;
    for (let i = 0; i < hits; i += 1) {
      burst(ctx, dest, at, { f: rand(2600, 4200), q: 2, peak: rand(0.06, 0.15), decay: 0.006 });
      at += rand(0.03, 0.07);
    }
    ping(ctx, dest, t, rand(3000, 3300), 0.012, 0.08);
    const blur = loop(ctx, noise(ctx, 'white'));
    const g = gain(ctx, 0);
    blur.connect(filter(ctx, 'bandpass', 1500, 1.2)).connect(g).connect(dest);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.025, t + 0.03);
    g.gain.setValueAtTime(0.025, at);
    g.gain.linearRampToValueAtTime(0, at + 0.06);
    shake(g.gain, t, at - t + 0.06, rand(35, 45), 0.02);
    blur.start(t, rand(0, 3));
    blur.stop(at + 0.08);
    blur.onended = () => g.disconnect();
  }

  return { deer, fawn, purr, catMew, moth };
}
