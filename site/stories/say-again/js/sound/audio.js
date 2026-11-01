// audio.js: every sound in Say Again that is not music, made live with the Web Audio API.
// createAudio(ctx, out) returns the calls the story makes: the place you are in, thunder,
// the radio (hiss, squelch, clicks, Morse), the desk and the house, the animals at
// the window, and duck() to lower the music under a call. The parts are in the audio-*.js files next to this one;
// dev/audio-test.html renders all of them and prints their levels.
//
// Every call is safe at any time: a sound that cannot play is skipped, never thrown, so a
// sound problem can never stop the story.

import { createClock, duckMusic } from './audio-kit.js';
import { createPlaces } from './audio-places.js';
import { createRadio } from './audio-radio.js';
import { createFoley } from './audio-foley.js';
import { createAnimals } from './audio-animals.js';

export function createAudio(ctx, out) {
  const master = ctx.createGain();
  master.connect(out);
  const clock = createClock(ctx);
  const places = createPlaces(ctx, master, clock);
  const radio = createRadio(ctx, master);
  const foley = createFoley(ctx, master);
  const animals = createAnimals(ctx, master);
  const calls = {
    ...places,
    ...radio,
    ...foley,
    ...animals,
    duck: (on) => duckMusic(ctx, Boolean(on)),
    /** For tests: queue the places' coming sounds up to `t` without waiting for the timer. */
    scheduleUntil: (t) => clock.until(t),
  };
  // What a call returns when it fails: voice() and purr() hand back a stop function,
  // morse() a promise, so callers can always use the result.
  const fallback = { voice: () => {}, purr: () => {}, morse: Promise.resolve() };
  const safe = {};
  for (const [name, call] of Object.entries(calls)) {
    safe[name] = (...args) => {
      try {
        return call(...args);
      } catch (error) {
        console.warn(`[audio] ${name} failed`, error);
        return fallback[name];
      }
    };
  }
  return safe;
}
