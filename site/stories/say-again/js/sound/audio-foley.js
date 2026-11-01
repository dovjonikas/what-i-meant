// audio-foley.js: the small sounds of the desk and the house: the channel knob's detent,
// paper, a pencil along a ruler, a pin, a sticky note, the lamp, the door, keys, and the
// soft two-note chime that says a distress call is in. Each is a few short noise hits and
// pitched pings, with a little random in them so no two are the same.

import { gain, filter, burst, ping, band, rand, clamp, num } from './audio-kit.js';

export function createFoley(ctx, output) {
  // The numbers below were set at half this level; the doubling lifts them clear of the
  // place sounds (see dev/audio-test.html).
  const dest = gain(ctx, 2);
  dest.connect(output);
  // A wooden desk in a small room: one short reflection gives the dry clicks a place.
  const desk = gain(ctx, 1);
  desk.connect(dest);
  const early = ctx.createDelay(0.1);
  early.delayTime.value = 0.017;
  desk.connect(early).connect(filter(ctx, 'lowpass', 2500, 0.7)).connect(gain(ctx, 0.18)).connect(dest);

  // The big channel knob clicking into its next detent.
  function dialTick() {
    const t = ctx.currentTime;
    const v = rand(0.88, 1.1);
    burst(ctx, desk, t, { f: 3400 * v, q: 1.8, peak: 0.16 * v, decay: 0.008 });
    ping(ctx, desk, t, 1150 * v, 0.04, 0.014);
    ping(ctx, desk, t + 0.002, 240 * v, 0.08, 0.022);
  }

  // A sheet of the chart moved: crackle in the paper's own band, a soft slide under it.
  function paper() {
    const t = ctx.currentTime;
    const len = rand(0.35, 0.55);
    band(ctx, desk, t, len, { kind: 'crinkle', filters: [['highpass', 1200, 0.7], ['bandpass', 3200, 0.6]], peak: 0.16, attack: 0.03, release: 0.18 });
    const slide = band(ctx, desk, t + 0.04, len * 0.8, { filters: [['bandpass', 1400, 1.2]], peak: 0.03, attack: 0.08, release: 0.2 });
    slide.filter.frequency.exponentialRampToValueAtTime(3000, t + 0.04 + len * 0.8);
  }

  // A pencil drawn along a ruler for `ms`: the fine grain of graphite on paper, and the
  // lower drag of the hand.
  function pencil(ms) {
    const len = clamp(num(ms, 600), 40, 10000) / 1000;
    const t = ctx.currentTime;
    band(ctx, desk, t, len, { kind: 'grain', filters: [['highpass', 1500, 0.7], ['bandpass', 4200, 0.9]], peak: 0.09, attack: 0.015, release: 0.03 });
    band(ctx, desk, t, len, { kind: 'grain', rate: 0.5, filters: [['bandpass', 900, 1.5]], peak: 0.025, attack: 0.03, release: 0.04 });
  }

  // A pin into the chart: the point, then the board under it.
  function pin() {
    const t = ctx.currentTime;
    burst(ctx, desk, t, { type: 'highpass', f: 4000, q: 0.7, peak: 0.1, decay: 0.006 });
    ping(ctx, desk, t + 0.004, 220, 0.14, 0.05).frequency.exponentialRampToValueAtTime(140, t + 0.05);
    burst(ctx, desk, t + 0.004, { type: 'lowpass', f: 900, q: 0.7, peak: 0.1, decay: 0.04 });
  }

  // A sticky note peeled off the pad, pressed on the console, smoothed down with a thumb.
  function note() {
    const t = ctx.currentTime;
    const peel = band(ctx, desk, t, 0.16, { kind: 'crinkle', filters: [['bandpass', 2400, 1]], peak: 0.07, attack: 0.03, release: 0.04 });
    peel.filter.frequency.exponentialRampToValueAtTime(4200, t + 0.16);
    burst(ctx, desk, t + 0.3, { type: 'lowpass', f: 700, q: 0.7, peak: 0.14, decay: 0.035 });
    ping(ctx, desk, t + 0.3, 170, 0.05, 0.04);
    band(ctx, desk, t + 0.36, 0.12, { filters: [['bandpass', 2000, 0.9]], peak: 0.018, attack: 0.03, release: 0.06 });
  }

  // A desk lamp's push switch: two clicks as it travels and latches, a small spring ring.
  function lamp() {
    const t = ctx.currentTime;
    burst(ctx, desk, t, { f: 3000, q: 2, peak: 0.1, decay: 0.006 });
    burst(ctx, desk, t + 0.022, { f: 2200, q: 1.5, peak: 0.16, decay: 0.012 });
    ping(ctx, desk, t + 0.022, 860, 0.04, 0.02);
    ping(ctx, desk, t + 0.022, 4100, 0.006, 0.06);
  }

  // Coming in: the handle and latch, the door swinging with a breath of outside air, and
  // shutting behind you with a soft heavy thud and the latch catching.
  function door() {
    const t = ctx.currentTime;
    latch(t);
    band(ctx, desk, t + 0.2, 0.9, { kind: 'brown', filters: [['lowpass', 500, 0.7]], peak: 0.05, attack: 0.3, release: 0.5 });
    const shut = t + 1.15;
    // The thud's weight is for headphones; the 210 Hz knock is what a phone can play.
    ping(ctx, dest, shut, 95, 0.14, 0.22).frequency.exponentialRampToValueAtTime(62, shut + 0.2);
    ping(ctx, desk, shut, 210, 0.08, 0.12);
    burst(ctx, desk, shut, { type: 'lowpass', f: 420, q: 0.8, peak: 0.15, decay: 0.16 });
    latch(shut + 0.03);
  }

  function latch(t) {
    burst(ctx, desk, t, { f: 2300, q: 2.2, peak: 0.1, decay: 0.01 });
    ping(ctx, desk, t, 1650, 0.016, 0.05);
    ping(ctx, desk, t, 2750, 0.01, 0.04);
    burst(ctx, desk, t + 0.05, { f: 1800, q: 2, peak: 0.06, decay: 0.012 });
  }

  // A bunch of keys: small bright clinks, a few overlapping, in a quick uneven run.
  function keys() {
    const t = ctx.currentTime;
    const hits = 7 + Math.floor(rand(0, 4));
    let at = t;
    for (let i = 0; i < hits; i += 1) {
      const peak = rand(0.01, 0.03);
      burst(ctx, desk, at, { type: 'highpass', f: 5000, q: 0.7, peak: peak * 0.8, decay: 0.004 });
      for (const f of [rand(2600, 3400), rand(4200, 5200), rand(6100, 7600)]) ping(ctx, desk, at, f, peak * rand(0.5, 1), rand(0.04, 0.16));
      at += rand(0.02, 0.09);
    }
  }

  // Two soft bell notes, the second higher: "listen", not "danger".
  function alert() {
    const t = ctx.currentTime;
    bell(t, 659.26, 0.11);
    bell(t + 0.42, 880, 0.1);
  }

  function bell(t, f, peak) {
    for (const [ratio, amount, decay] of [[1, 1, 1.4], [2, 0.22, 0.6], [3.01, 0.08, 0.35], [4.17, 0.04, 0.2]]) {
      ping(ctx, dest, t, f * ratio, peak * amount, decay);
    }
  }

  return { dialTick, paper, pencil, pin, note, lamp, door, keys, alert };
}
