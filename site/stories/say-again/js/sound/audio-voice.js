// audio-voice.js: a voice that says no real words, for under a line of text on screen: a
// buzz shaped by three moving formant filters, four or five syllables a second, in phrases
// with breaths between. Through the radio band-pass it passes for a person on a small
// speaker; the words themselves are on screen.

import { noise, wave, gain, filter, loop, shaper, settle, rand, pick, clamp, num } from './audio-kit.js';

// f0: speaking pitch in Hz. formant: vowel formants scaled (a child's shorter throat puts
// them higher). rate: syllables a second. swing: how far the pitch moves in a phrase.
// breath: air in the voice. grit: how hard the mic is driven. pauses: shorter phrases
// and longer breaks (a child finding words). level: loudness against the others. wind and
// engine: what is heard behind the voice at the far end.
const CAPE = { f0: 96, formant: 0.92, rate: 4.4, swing: 0.1, breath: 0.05, grit: 2, level: 1 };
const WHO = {
  cape: CAPE, // Cape Radio: an older man, low and calm
  ragas: CAPE, // the station's earlier name, kept so old calls still work
  pilot: { f0: 110, formant: 0.96, rate: 5, swing: 0.09, breath: 0.05, grit: 1.8, level: 0.95 },
  rescue: { f0: 132, formant: 1.04, rate: 5.3, swing: 0.13, breath: 0.04, grit: 2.4, level: 0.9, engine: true },
  skipper: { f0: 124, formant: 0.98, rate: 5.4, swing: 0.17, breath: 0.08, grit: 4, level: 0.7, wind: true },
  kid: { f0: 268, formant: 1.3, rate: 4.5, swing: 0.22, breath: 0.14, grit: 1.5, level: 0.9, pauses: 1.6 },
  you: { f0: 112, formant: 1, rate: 5, swing: 0.12, breath: 0.04, grit: 1, level: 0.65, dry: true },
};

// Vowel formants F1, F2, F3 of adult men's voices (Peterson and Barney, 1952).
const VOWELS = [
  [270, 2290, 3010],
  [390, 1990, 2550],
  [530, 1840, 2480],
  [660, 1720, 2410],
  [730, 1090, 2440],
  [570, 840, 2410],
  [440, 1020, 2240],
  [300, 870, 2240],
  [640, 1190, 2390],
];
const NEUTRAL = [500, 1500, 2500];
const CLOSED = [280, 1300, 2450]; // m, n, l: the mouth nearly shut
const Q = [5, 8, 10];
const MIX = [1, 0.6, 0.3];
const DRIVE = 3; // into the saturator: the loudest syllables round off, the rest pass clean
const LEVEL = 0.12;

// The glottal buzz: harmonics falling off a little faster than a saw wave's, so the voice
// is not as buzzy as an oscillator.
const GLOTTAL = Array.from({ length: 40 }, (_, i) => 1 / (i + 1) ** 1.3);

/**
 * Starts a voice now for `seconds`. Radio voices go into `radio` (the receiver's
 * band-pass); 'you' goes to `dry`, quiet and unfiltered. Returns a function that stops it
 * early.
 */
export function speak(ctx, radio, dry, seconds, who) {
  const p = Object.hasOwn(WHO, who) ? WHO[who] : CAPE;
  const length = clamp(num(seconds, 2), 0.3, 120);
  const t0 = ctx.currentTime + 0.04;
  const end = t0 + length;

  const out = gain(ctx, p.level * LEVEL);
  if (p.dry) out.connect(filter(ctx, 'lowpass', 2400, 0.7)).connect(dry);
  else out.connect(radio);
  const mic = shaper(ctx, p.grit);
  const drive = gain(ctx, DRIVE);
  drive.connect(mic).connect(out);

  const buzz = ctx.createOscillator();
  buzz.setPeriodicWave(wave(ctx, 'glottal', GLOTTAL));
  buzz.frequency.value = p.f0;
  const air = loop(ctx, noise(ctx, 'white'));
  const voiced = gain(ctx, 0);
  buzz.connect(voiced);
  air.connect(filter(ctx, 'highpass', 600, 0.7)).connect(gain(ctx, p.breath)).connect(voiced);
  const formants = Q.map((q, i) => {
    const f = filter(ctx, 'bandpass', NEUTRAL[i] * p.formant, q);
    voiced.connect(f).connect(gain(ctx, MIX[i])).connect(drive);
    return f;
  });
  // Consonants: bursts and hisses of air. On the radio only their lower part gets through.
  const hiss = filter(ctx, 'bandpass', 2600, 1.4);
  const hissLevel = gain(ctx, 0);
  air.connect(hiss).connect(hissLevel).connect(drive);

  const sources = [buzz, air];
  if (p.wind) sources.push(windBehind(ctx, radio, t0, end));
  if (p.engine) sources.push(...engineBehind(ctx, radio, t0, end));

  function syllable(t, d, pitch, stressed) {
    const kind = Math.random();
    let v = t;
    if (kind < 0.3) {
      // A stop (t, k, p): the mouth shuts, then a pop of air.
      voiced.gain.setTargetAtTime(0.02, Math.max(t - 0.03, t0), 0.006);
      hiss.frequency.setValueAtTime(p.dry ? rand(1800, 4000) : rand(1400, 2900), t);
      hissLevel.gain.setValueAtTime(0, t);
      hissLevel.gain.linearRampToValueAtTime(0.5, t + 0.004);
      hissLevel.gain.setTargetAtTime(0, t + 0.008, 0.008);
      v = t + 0.03;
    } else if (kind < 0.5) {
      // A hiss (s, sh, f).
      hiss.frequency.setValueAtTime(p.dry ? rand(3000, 5500) : rand(2200, 3000), t);
      hissLevel.gain.setTargetAtTime(0.3, t, 0.012);
      hissLevel.gain.setTargetAtTime(0, t + 0.06, 0.012);
      v = t + 0.075;
    } else if (kind < 0.72) {
      formants.forEach((f, i) => f.frequency.setTargetAtTime(CLOSED[i] * p.formant, t, 0.012));
      voiced.gain.setTargetAtTime(0.4, t, 0.01);
      v = t + 0.05;
    }
    if (v > t + d * 0.6) v = t + d * 0.3;
    const vowel = pick(VOWELS);
    formants.forEach((f, i) => f.frequency.setTargetAtTime(vowel[i] * p.formant * rand(0.96, 1.04), v, 0.022));
    voiced.gain.setTargetAtTime(stressed ? 1 : rand(0.6, 0.8), v, 0.012);
    voiced.gain.setTargetAtTime(0.1, t + d * 0.75, 0.025);
    buzz.frequency.setTargetAtTime(pitch, t, 0.03);
    buzz.frequency.setTargetAtTime(pitch * 0.95, t + d * 0.5, 0.06);
  }

  // Phrases of one to three seconds; within a phrase, words of one to three syllables;
  // the pitch starts high and falls toward the end of each phrase, as speech does.
  const breaks = p.pauses ?? 1;
  let t = t0;
  while (end - t > 0.25) {
    const phraseEnd = Math.min(end - 0.05, t + rand(1.1, 2.9) / breaks);
    const from = t;
    let inWord = 0;
    let wordLength = 1 + Math.floor(rand(0, 3));
    while (phraseEnd - t > 0.12) {
      const d = Math.min(phraseEnd - t, rand(0.7, 1.35) / p.rate);
      const stressed = inWord === 0 && Math.random() < 0.6;
      const progress = (t - from) / Math.max(0.5, phraseEnd - from);
      const pitch = p.f0 * (1 + p.swing * (0.5 - progress)) * (stressed ? 1 + p.swing * 0.5 : 1) * rand(0.97, 1.03);
      syllable(t, d, pitch, stressed);
      t += d;
      inWord += 1;
      if (inWord >= wordLength) {
        inWord = 0;
        wordLength = 1 + Math.floor(rand(0, 3));
        t += rand(0.015, 0.06);
      }
    }
    voiced.gain.setTargetAtTime(0, t, 0.025);
    t += rand(0.2, 0.45) * breaks;
  }
  voiced.gain.setTargetAtTime(0, Math.min(t, end), 0.03);

  const stopAt = end + 0.2;
  buzz.start(t0);
  air.start(t0, rand(0, 3));
  for (const s of sources) s.stop(stopAt);
  buzz.onended = () => out.disconnect();

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    try {
      const now = ctx.currentTime;
      if (now >= stopAt) return;
      settle(out.gain, now);
      out.gain.linearRampToValueAtTime(0, now + 0.05);
      for (const s of sources) s.stop(now + 0.07);
    } catch {
      // The voice has already ended on its own.
    }
  };
}

// The skipper's mic in the wind: gusts of rumble behind the voice, coming and going.
function windBehind(ctx, radio, t0, end) {
  const src = loop(ctx, noise(ctx, 'pink'));
  const tone = filter(ctx, 'bandpass', 600, 0.7);
  const g = gain(ctx, 0);
  src.connect(tone).connect(g).connect(radio);
  g.gain.setValueAtTime(0, t0);
  for (let t = t0; t < end; t += rand(0.5, 1.4)) {
    g.gain.setTargetAtTime(rand(0.06, 0.22), t, 0.25);
    tone.frequency.setTargetAtTime(rand(450, 900), t, 0.4);
  }
  g.gain.setTargetAtTime(0, end, 0.08);
  src.start(t0, rand(0, 3));
  src.onended = () => g.disconnect();
  return src;
}

// The rescue boat's engines, faint behind the voice: a diesel's low beat and its rumble.
// Through the radio's band-pass only the upper harmonics and the rumble's top come through.
function engineBehind(ctx, radio, t0, end) {
  const g = gain(ctx, 0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(1, t0 + 0.08);
  g.gain.setValueAtTime(1, end);
  g.gain.linearRampToValueAtTime(0, end + 0.1);
  g.connect(radio);
  const beat = ctx.createOscillator();
  beat.type = 'sawtooth';
  beat.frequency.value = rand(48, 56);
  beat.connect(filter(ctx, 'lowpass', 500, 1)).connect(gain(ctx, 0.06)).connect(g);
  const rumble = loop(ctx, noise(ctx, 'brown'));
  rumble.connect(filter(ctx, 'bandpass', 420, 0.8)).connect(gain(ctx, 0.12)).connect(g);
  beat.start(t0);
  rumble.start(t0, rand(0, 3));
  beat.onended = () => g.disconnect();
  return [beat, rumble];
}
