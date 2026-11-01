// score.js: the music of Say Again, made live with the Web Audio API like story 01's.
//
// One theme runs through the game, the kid's: its rhythm is Morse for "88", which radio
// amateurs send for "love and kisses" (long, long, long, short, short, twice). Night 1
// hears its first three notes, the clear night carries most of it on a music box, and only
// the ending plays it to the end. What each act plays is in audio-acts.js and the
// instruments are in audio-instruments.js; this file runs them: one act at a time, a
// crossfade of a few seconds when the act changes, and the music lowered under radio calls.
//
// Sounds are queued ahead on the audio clock, not fired by timers, which keeps time even
// when the page is busy.

import { gain, filter, settle, onDuck } from './audio-kit.js';
import { ACTS } from './audio-acts.js';
import { instrumentsFor } from './audio-instruments.js';

const AHEAD = 1.5; // seconds of music queued ahead of the audio clock
const TICK_MS = 200;
const FADE = 3.5; // the crossfade between acts, unless an act asks for its own
const VOLUME = 0.85;
const DUCKED = 0.5; // about -6 dB under a radio call

export function createScore(ctx, out) {
  const ducker = gain(ctx, 1);
  ducker.connect(out);
  const master = gain(ctx, VOLUME);
  master.connect(ducker);

  // A shared room and echo that the instruments send into.
  const reverbIn = gain(ctx, 1);
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 3.4, 2.6);
  reverbIn.connect(reverb).connect(master);
  const echoIn = gain(ctx, 1);
  const echo = ctx.createDelay(1);
  echo.delayTime.value = 0.46;
  const echoTone = filter(ctx, 'lowpass', 1600, 0.7);
  echoIn.connect(echo).connect(echoTone);
  echoTone.connect(gain(ctx, 0.3)).connect(echo);
  echoTone.connect(master);
  const bus = (dry, wet, delayed = 0) => {
    const input = gain(ctx, 1);
    input.connect(gain(ctx, dry)).connect(master);
    input.connect(gain(ctx, wet)).connect(reverbIn);
    if (delayed) input.connect(gain(ctx, delayed)).connect(echoIn);
    return input;
  };
  const buses = { pad: bus(0.7, 0.55), keys: bus(0.7, 0.65, 0.22), bass: bus(1, 0.15) };

  let current = null;
  let timer = 0;

  function play(name) {
    if (name === 'off') {
      if (current) retire(current, FADE);
      current = null;
      clearInterval(timer);
      timer = 0;
      return;
    }
    if (!Object.hasOwn(ACTS, name) || current?.name === name) return;
    const def = ACTS[name];
    if (current) retire(current, def.cut ?? FADE);
    current = begin(name, def);
    schedule(ctx.currentTime + AHEAD);
    if (!timer) timer = setInterval(() => schedule(ctx.currentTime + AHEAD), TICK_MS);
  }

  // An act plays into its own three feeds, so it can fade in and out as a whole while the
  // shared reverb carries its tail across the change.
  function begin(name, def) {
    const now = ctx.currentTime;
    const feeds = {};
    for (const [key, into] of Object.entries(buses)) {
      const g = gain(ctx, 0);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(1, now + (def.fadeIn ?? FADE));
      g.connect(into);
      feeds[key] = g;
    }
    const run = { name, def, feeds, live: new Set(), next: now + 0.05, index: 0 };
    run.play = instrumentsFor(ctx, run);
    return run;
  }

  function retire(run, seconds) {
    const now = ctx.currentTime;
    for (const g of Object.values(run.feeds)) {
      settle(g.gain, now);
      g.gain.linearRampToValueAtTime(0, now + seconds);
    }
    for (const src of run.live) {
      try {
        src.stop(now + seconds + 0.05);
      } catch {
        // Already stopped.
      }
    }
    setTimeout(() => Object.values(run.feeds).forEach((g) => g.disconnect()), (seconds + 0.5) * 1000);
  }

  function schedule(horizon) {
    const run = current;
    if (!run) return;
    // A hidden tab can sleep the timer; carry on from now instead of catching up.
    if (run.next < ctx.currentTime - 0.5) run.next = ctx.currentTime + 0.05;
    for (let n = 0; run.next < horizon && n < 64; n += 1) {
      const seconds = run.def.slot(run.play, run.next, run.index);
      run.next += Math.max(0.5, seconds || 0);
      run.index += 1;
    }
  }

  function duck(on) {
    const now = ctx.currentTime;
    settle(ducker.gain, now);
    ducker.gain.setTargetAtTime(on ? DUCKED : 1, now, on ? 0.12 : 0.4);
  }
  onDuck(ctx, duck);

  const guard = (name, call) => (...args) => {
    try {
      return call(...args);
    } catch (error) {
      console.warn(`[score] ${name} failed`, error);
      return undefined;
    }
  };

  return {
    play: guard('play', play),
    duck: guard('duck', (on) => duck(Boolean(on))),
    /** For tests: queue everything up to `t` without the live timer. */
    scheduleUntil: guard('scheduleUntil', schedule),
  };
}

// A reverb tail made from noise that fades out over `seconds`, passed through a simple
// lowpass so the tail is dark and soft.
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
