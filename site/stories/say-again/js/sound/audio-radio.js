// audio-radio.js: the receiver and the handset. The band-pass that makes a sound come over
// VHF, the hiss and squelch tail as a carrier comes and goes, a microphone keyed far away,
// static between channels, voices, Morse tones received and sent, and the handset's
// press-to-talk switch.
//
// How FM squelch sounds, for whoever tunes this: while a carrier is on, the receiver is
// almost quiet, since the carrier quiets the noise, so an open channel is only a low hiss.
// When the far side lets go of the button the carrier drops and full noise rushes in for a
// moment until the squelch gate shuts. That "tssh" is the tail, and more than anything it
// is what makes a sound read as radio.

import { noise, gain, filter, loop, shaper, settle, burst, ping, rand, clamp, num } from './audio-kit.js';
import { speak } from './audio-voice.js';

const CARRIER = 0.065; // the quieted hiss while a carrier is on
const TAIL = 0.5; // the burst when it drops
const STATIC = 0.25; // full static between channels
const RX_TONE = 0.09; // a received Morse tone
const SIDETONE = 0.14; // your own key
const RX_HZ = 850;
const SIDE_HZ = 690;

export function createRadio(ctx, dest) {
  // The receiver: VHF voice audio is about 300 to 3000 Hz, with a lift in the middle where
  // a small speaker is loudest, and a little saturation for its cone.
  const input = gain(ctx, 1);
  const lift = filter(ctx, 'peaking', 1800, 0.8);
  lift.gain.value = 3;
  input
    .connect(filter(ctx, 'highpass', 300, 0.7))
    .connect(filter(ctx, 'highpass', 300, 0.7))
    .connect(shaper(ctx, 1.3))
    .connect(lift)
    .connect(filter(ctx, 'lowpass', 3000, 0.7))
    .connect(filter(ctx, 'lowpass', 3000, 0.7))
    .connect(dest);

  // Receiver noise from t: the gate opens with a small tick and settles to the carrier's
  // quiet hiss. Ended by tail() and a stop.
  function hiss(t) {
    const src = loop(ctx, noise(ctx, 'white'));
    const g = gain(ctx, 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(TAIL * 0.5, t + 0.002);
    g.gain.linearRampToValueAtTime(CARRIER, t + 0.016);
    src.connect(g).connect(input);
    src.start(t, Math.random() * 3);
    src.onended = () => g.disconnect();
    return { src, g };
  }

  // The squelch tail on `param` from t: full noise at once, sagging a little, then the
  // gate. Returns when it ends.
  function tail(param, t, len, level) {
    param.linearRampToValueAtTime(level, t + 0.004);
    param.linearRampToValueAtTime(level * 0.75, t + len - 0.01);
    param.linearRampToValueAtTime(0, t + len);
    return t + len;
  }

  // The squelch is held open by whoever needs it ('rx', 'tone') and closes with a tail when
  // the last lets go.
  const owners = new Set();
  let carrier = null;

  function open(owner) {
    owners.add(owner);
    if (!carrier) carrier = hiss(ctx.currentTime + 0.005);
  }

  function close(owner) {
    owners.delete(owner);
    if (owners.size || !carrier) return;
    const { src, g } = carrier;
    carrier = null;
    const t = ctx.currentTime;
    settle(g.gain, t);
    src.stop(tail(g.gain, t, rand(0.12, 0.17), TAIL) + 0.02);
  }

  function rx(on) {
    if (on) open('rx');
    else close('rx');
  }

  // A microphone keyed far away and let go: the gate opens on a quiet carrier for a moment,
  // then the tail.
  function click() {
    const t = ctx.currentTime + 0.005;
    const held = rand(0.06, 0.095);
    const { src, g } = hiss(t);
    g.gain.setValueAtTime(CARRIER, t + held);
    src.stop(tail(g.gain, t + held, rand(0.085, 0.11), TAIL * rand(0.85, 1)) + 0.02);
  }

  let noisy = null;
  let quietTimer = 0;
  function staticLevel(v) {
    const level = clamp(num(v, 0), 0, 1);
    const now = ctx.currentTime;
    clearTimeout(quietTimer);
    if (level > 0.001 && !noisy) {
      const src = loop(ctx, noise(ctx, 'static'));
      const g = gain(ctx, 0);
      src.connect(g).connect(input);
      src.start(now, Math.random() * 3);
      src.onended = () => g.disconnect();
      noisy = { src, g };
    }
    if (!noisy) return;
    settle(noisy.g.gain, now);
    noisy.g.gain.setTargetAtTime(level * STATIC, now, 0.025);
    if (level <= 0.001) {
      // Stop the noise once it has faded, unless the knob moves on first.
      const was = noisy;
      quietTimer = setTimeout(() => {
        if (noisy !== was) return;
        was.src.stop();
        noisy = null;
      }, 300);
    }
  }

  function voice(seconds, who) {
    return speak(ctx, input, dest, seconds, who);
  }

  // Your own Morse key: a clean sine, straight to the ear, with 5 ms edges so it never
  // clicks.
  let side = null;
  function toneOn() {
    if (side) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.frequency.value = SIDE_HZ;
    const g = gain(ctx, 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(SIDETONE, t + 0.005);
    o.connect(g).connect(dest);
    o.start(t);
    o.onended = () => g.disconnect();
    side = { o, g };
  }

  function toneOff() {
    if (!side) return;
    const { o, g } = side;
    side = null;
    const t = ctx.currentTime;
    settle(g.gain, t);
    g.gain.linearRampToValueAtTime(0, t + 0.005);
    o.stop(t + 0.012);
  }

  // A tone received, keyed by the caller one element at a time. One oscillator stays up
  // while the elements come, gated on and off; after a pause it stops, and if nobody else
  // opened the squelch, the squelch closes with it.
  let heard = null;
  let idle = 0;
  function rxToneOn() {
    clearTimeout(idle);
    if (!owners.size) open('tone');
    const t = ctx.currentTime;
    if (!heard) {
      const o = ctx.createOscillator();
      o.frequency.value = RX_HZ;
      const g = gain(ctx, 0);
      o.connect(g).connect(input);
      o.start(t);
      o.onended = () => g.disconnect();
      heard = { o, g };
    }
    settle(heard.g.gain, t);
    heard.g.gain.linearRampToValueAtTime(RX_TONE, t + 0.005);
  }

  function rxToneOff() {
    if (!heard) return;
    const t = ctx.currentTime;
    settle(heard.g.gain, t);
    heard.g.gain.linearRampToValueAtTime(0, t + 0.005);
    clearTimeout(idle);
    idle = setTimeout(() => {
      heard?.o.stop();
      heard = null;
      if (owners.has('tone')) close('tone');
    }, 900);
  }

  /**
   * Plays a received Morse pattern ('.', '-', ' ' between letters, ' / ' between words) at
   * `unitMs` per dot, with the standard spacing. Resolves when it has finished, squelch tail
   * included.
   */
  function morse(pattern, unitMs) {
    const u = clamp(num(unitMs, 80), 30, 400) / 1000;
    const { marks, units } = parseMorse(pattern);
    if (!marks.length) return Promise.resolve();
    // If the squelch is already open (rx(true)), the tones ride on that carrier; otherwise
    // they bring their own, opening just before and closing with a tail after.
    const own = owners.size === 0;
    const t0 = ctx.currentTime + (own ? 0.2 : 0.03);
    const end = t0 + units * u;
    const o = ctx.createOscillator();
    o.frequency.value = RX_HZ;
    const g = gain(ctx, 0);
    for (const [at, len] of marks) {
      const s = t0 + at * u;
      const e = s + len * u;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(RX_TONE, s + 0.005);
      g.gain.setValueAtTime(RX_TONE, e - 0.005);
      g.gain.linearRampToValueAtTime(0, e);
    }
    o.connect(g).connect(input);
    o.start(t0 - 0.01);
    o.stop(end + 0.02);
    o.onended = () => g.disconnect();
    let done = end;
    if (own) {
      const { src, g: level } = hiss(t0 - 0.17);
      level.gain.setValueAtTime(CARRIER, end + 0.2);
      done = tail(level.gain, end + 0.2, rand(0.12, 0.17), TAIL);
      src.stop(done + 0.02);
    }
    // Wall-clock time, so the story moves on even while the sound is off and the audio
    // clock is stopped.
    return new Promise((resolve) => setTimeout(resolve, (done - ctx.currentTime) * 1000 + 20));
  }

  // The handset's press-to-talk switch: a plastic clack in, a lighter click out. Out, your
  // own set goes back to receive with a short tail, but only after a spoken transmission:
  // after every keyed Morse element it would be noise on noise.
  let downAt = -1;
  function pttDown() {
    const t = ctx.currentTime;
    downAt = t;
    burst(ctx, dest, t, { f: 2600, q: 1.6, peak: 0.24, decay: 0.012 });
    burst(ctx, dest, t + 0.011, { type: 'lowpass', f: 1100, q: 0.8, peak: 0.3, decay: 0.03 });
    ping(ctx, dest, t + 0.011, 380, 0.1, 0.035);
  }

  function pttUp() {
    const t = ctx.currentTime;
    burst(ctx, dest, t, { f: 3200, q: 1.4, peak: 0.18, decay: 0.01 });
    burst(ctx, dest, t + 0.008, { type: 'lowpass', f: 1500, q: 0.7, peak: 0.12, decay: 0.02 });
    const spoke = downAt >= 0 && t - downAt > 0.45;
    downAt = -1;
    if (!spoke) return;
    const src = loop(ctx, noise(ctx, 'white'));
    const g = gain(ctx, 0);
    const from = t + 0.03;
    g.gain.setValueAtTime(0, from);
    src.connect(g).connect(input);
    src.start(from, Math.random() * 3);
    src.stop(tail(g.gain, from, rand(0.07, 0.1), TAIL * 0.6) + 0.02);
    src.onended = () => g.disconnect();
  }

  return { rx, click, staticLevel, voice, toneOn, toneOff, rxToneOn, rxToneOff, morse, pttDown, pttUp };
}

/**
 * Morse timing in dot units: a dash is three, the gap inside a letter one, between letters
 * three, between words seven. Returns the marks as [start, length] and the total length.
 */
export function parseMorse(pattern) {
  const marks = [];
  let at = 0;
  let gap = 0;
  // Patterns typed or pasted by hand may use other dash and dot signs.
  const words = String(pattern ?? '')
    .replace(/[_\u2013\u2014\u2212]/g, '-')
    .replace(/[\u00b7\u2022]/g, '.')
    .split('/');
  for (const word of words) {
    const letters = word
      .split(/\s+/)
      .map((l) => l.replace(/[^.-]/g, ''))
      .filter(Boolean);
    letters.forEach((letter, li) => {
      [...letter].forEach((sign, si) => {
        if (marks.length) at += si > 0 ? 1 : li > 0 ? 3 : gap;
        const len = sign === '-' ? 3 : 1;
        marks.push([at, len]);
        at += len;
      });
    });
    if (letters.length) gap = 7;
  }
  return { marks, units: at };
}
