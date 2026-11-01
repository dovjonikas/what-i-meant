// audio-voice.js: what is heard behind a person on the radio. There is no voice: the words
// are on screen, and a made-up voice saying no words grated after a few lines. A received
// call is the receiver's carrier hiss and squelch tail (audio-radio.js rx()), and behind
// some speakers the place they are calling from: wind on the skipper's mic, the rescue
// boat's engines. Your own words make no sound but the press-to-talk switch.

import { noise, gain, filter, loop, settle, rand, clamp, num } from './audio-kit.js';

const BEHIND = {
  skipper: windBehind, // an open deck in fog
  rescue: engineBehind, // a fast boat under way
};

/**
 * Starts what is heard behind `who` now, for `seconds`, into `radio` (the receiver's
 * band-pass). Returns a function that stops it early.
 */
export function speak(ctx, radio, seconds, who) {
  const behind = Object.hasOwn(BEHIND, who) ? BEHIND[who] : null;
  if (!behind) return () => {};
  const length = clamp(num(seconds, 2), 0.3, 120);
  const t0 = ctx.currentTime + 0.04;
  const end = t0 + length;
  const out = gain(ctx, 1);
  out.connect(radio);
  const sources = behind(ctx, out, t0, end);
  const stopAt = end + 0.2;
  sources[0].onended = () => out.disconnect();

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
      // It has already ended on its own.
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
    g.gain.setTargetAtTime(rand(0.04, 0.14), t, 0.25);
    tone.frequency.setTargetAtTime(rand(450, 900), t, 0.4);
  }
  g.gain.setTargetAtTime(0, end, 0.08);
  src.start(t0, rand(0, 3));
  src.stop(end + 0.2);
  return [src];
}

// The rescue boat's engines, faint behind the voice: a diesel's low beat and its rumble.
// Through the radio's band-pass only the upper harmonics and the rumble's top come through.
function engineBehind(ctx, radio, t0, end) {
  const g = gain(ctx, 0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.7, t0 + 0.08);
  g.gain.setValueAtTime(0.7, end);
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
  beat.stop(end + 0.2);
  rumble.stop(end + 0.2);
  return [beat, rumble];
}
