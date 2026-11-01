// audio-acts.js: what the score plays in each act of Say Again, and the kid's theme.
// Each act is a slot(play, t, i, memory) that queues one chord's worth of music at time t
// (the i-th slot since the act began) and returns how many seconds the slot lasts. `play`
// holds the instruments (audio-instruments.js). Harmony stays plain, around A major and its
// relatives, and silence is part of it.

import { rand, pick } from './audio-kit.js';

// Chords as [bass, [pad notes]] in MIDI numbers.
const CHORDS = {
  A: [45, [52, 57, 59, 61]], // A add9
  Afull: [45, [52, 57, 61, 64]], // A, for the landing
  D: [38, [54, 57, 61, 64]], // D maj9
  Fm: [42, [54, 59, 61, 64]], // F#m11
  E: [40, [52, 57, 59, 64]], // E sus4
  E3: [40, [52, 56, 59, 64]], // E
  Bm: [47, [54, 57, 62, 64]], // B m11
  Bmlow: [35, [54, 57, 62, 66]], // B m7 over a low B, for the fog
  G: [43, [54, 59, 62, 66]], // G maj7
  Fsus: [42, [54, 59, 61, 66]], // F# sus4
  Fs: [42, [54, 57, 61, 66]], // F# minor
  DF: [42, [54, 57, 62, 66]], // D over F#
  Asus: [45, [52, 57, 62, 64]], // A sus4
  Css: [37, [54, 56, 61, 66]], // C# sus4
};

// The kid's theme. Its rhythm is Morse for "88" (---.. ---..), which radio amateurs send
// for "love and kisses": every bar is one "8", three long notes and two short, played as
// three quarter notes and two eighths. Bars 1 and 2 say "88"; bars 3 and 4 say it again,
// rising, and the last two short notes lead up to A (HOME_NOTE), which only the ending
// plays.
const BEATS = [0, 1, 2, 3, 3.5];
const THEME = [
  [73, 76, 81, 80, 78], // C# E A, G# F#
  [76, 73, 74, 73, 71], // E C# D, C# B
  [73, 76, 81, 83, 85], // C# E A, B C#
  [83, 81, 76, 78, 80], // B A E, F# G#
];
const HOME_NOTE = 81;

// A major pentatonic, A4 to A5, for the odd note between phrases.
const HIGH = [69, 71, 73, 76, 78, 81];

/** One bar of the theme from t; `upTo` cuts it short (night 1 hears only three notes). */
function theme(play, voice, t, beat, bar, { upTo = 5, velocity = 0.5 } = {}) {
  THEME[bar].slice(0, upTo).forEach((n, k) => play.key(voice, n, t + BEATS[k] * beat, velocity * (k < 3 ? 1 : 0.8)));
}

function sprinkle(play, voice, t, len, chance, velocity) {
  for (let k = 1; k < 8; k += 1) {
    if (Math.random() < chance) play.key(voice, pick(HIGH), t + (k * len) / 8, velocity * rand(0.7, 1.1));
  }
}

// A chord on the piano, rolled gently from the bottom up.
function roll(play, [low, pad], t, velocity) {
  [low + 12, ...pad.slice(1).map((n) => n + 12)].forEach((n, k) => play.key('piano', n, t + k * rand(0.05, 0.09), velocity * (k ? 0.8 : 1)));
}

// The ending, bar by bar: two bars in, the theme whole over four, then the landing on A.
// `lift` grows the pad and opens it; `strings` brings in the octave above for the swell.
const ENDING = [
  { chord: 'A', bars: 1, lift: 0 },
  { chord: 'D', bars: 1, lift: 0.1 },
  { chord: 'A', bars: 1, lift: 0.2, bar: 0 },
  { chord: 'D', bars: 1, lift: 0.3, bar: 1 },
  { chord: 'Fm', bars: 1, lift: 0.55, bar: 2, strings: 0.5 },
  { chord: 'E3', bars: 1, lift: 0.8, bar: 3, strings: 0.8 },
  { chord: 'Afull', bars: 3, lift: 1, strings: 1, landing: true },
];

export const ACTS = {
  // Night 1, the station on a quiet night and something new on the air. Chords come and
  // go with silence between; the celesta asks the theme's first three notes, and nobody
  // answers yet.
  n1: {
    slot(play, t, i) {
      const plan = ['D', null, 'A', null, 'Bm', null, 'E', null];
      const name = plan[i % plan.length];
      const round = Math.floor(i / plan.length);
      if (!name) {
        if (Math.random() < 0.6) play.key('celesta', pick(HIGH), t + rand(0.8, 3.5), rand(0.2, 0.32));
        return rand(5, 7);
      }
      const [low, pad] = CHORDS[name];
      play.pad(pad, t, 9, { bright: 620, level: 0.42, attack: 3.5, release: 5 });
      play.bass(low, t, 9, 0.3);
      if (name === 'A' && round % 2 === 0) theme(play, 'celesta', t + 2.4, 0.95, 0, { upTo: round % 4 === 2 ? 5 : 3, velocity: 0.38 });
      else sprinkle(play, 'celesta', t + 1, 8, 0.1, 0.28);
      return 9;
    },
  },

  // Night 2, fog: lower and darker. A bowed F# under everything, and a small figure that
  // starts the theme (C#, E) and loses its way.
  n2: {
    slot(play, t, i) {
      const plan = ['Bmlow', 'G', 'Bmlow', 'Fsus'];
      const len = 11;
      play.bow(42, t, len, { level: 0.6, cents: i % 2 ? 3 : -3, attack: 3, release: 3.5 });
      play.pad(CHORDS[plan[i % 4]][1], t, len, { bright: 420, level: 0.5, attack: 3, release: 4 });
      if (i % 2 === 1) {
        const at = t + rand(1.5, 3.5);
        play.key('piano', 61, at, 0.34);
        play.key('piano', 64, at + rand(0.9, 1.3), 0.3);
        if (Math.random() < 0.6) play.key('piano', pick([62, 59]), at + rand(2.6, 3.4), 0.26);
      }
      return len;
    },
  },

  // The search in the fog: a low pulse that does not let go, a pad that climbs, and a high
  // line one step higher each chord. No drums.
  rescue: {
    cut: 3,
    slot(play, t, i) {
      const beat = 0.75;
      const plan = ['Bm', 'G', 'DF', 'Asus'];
      const [low, pad] = CHORDS[plan[i % 4]];
      const lift = Math.min(1, 0.3 + 0.12 * i);
      const len = beat * 8;
      play.pad(pad, t, len, { bright: 500 + 1000 * lift, level: 0.4 + 0.25 * lift, attack: 2, release: 3 });
      play.pad([[78, 79, 81, 83][i % 4]], t + beat * 2, len - beat * 2, { bright: 2200, level: 0.9 * lift, attack: 3, release: 2.5 });
      for (let k = 0; k < 16; k += 1) play.pluck(low, t + (k * beat) / 2, k % 2 ? 0.25 : 0.42);
      return len;
    },
  },

  // Night 3, clear: warmer. The music box plays most of the kid's theme, one "8" to a
  // chord with room between, and stops before the end, as if it does not know the last bar
  // yet.
  n3: {
    slot(play, t, i) {
      const plan = ['A', 'D', 'Fm', 'E'];
      const name = plan[i % 4];
      const round = Math.floor(i / 4);
      const len = 7.2;
      const [low, pad] = CHORDS[name];
      play.pad(pad, t, len, { bright: 1100, level: 0.5, attack: 2.5, release: 4 });
      play.bass(low, t, len, 0.42);
      const bar = { A: 0, D: 1, Fm: 2 }[name];
      if (round % 2 === 0 && bar !== undefined && (bar < 2 || round > 0)) theme(play, 'box', t + 1.8, 0.9, bar, { velocity: 0.5 });
      else sprinkle(play, 'box', t, len, 0.09, 0.3);
      return len;
    },
  },

  // Night 4, the storm: urgent and held back. A pulse, strings shaking in tremolo, a bowed
  // bass under them.
  storm: {
    cut: 2.5,
    slot(play, t, i) {
      const beat = 0.6;
      const plan = ['Fs', 'D', 'Bm', 'Css'];
      const [low, pad] = CHORDS[plan[i % 4]];
      const len = beat * 8;
      play.pad(pad, t, len, { bright: 950, level: 0.72, attack: 1.2, release: 2.5, tremolo: 0.7 });
      play.bow(low, t, len, { level: 0.62, attack: 1, release: 2, bright: 500 });
      const accents = [0.5, 0.22, 0.3, 0.22, 0.42, 0.22, 0.3, 0.28];
      for (let k = 0; k < 16; k += 1) play.pluck(low, t + (k * beat) / 2, accents[k % 8], 0.32);
      return len;
    },
  },

  // The bearings land on the house: everything stops but one note, the theme's first.
  reveal: {
    cut: 0.9,
    fadeIn: 2,
    slot(play, t, i) {
      if (i === 0) play.hold(73, t, { level: 0.035, attack: 2.5 });
      return 30;
    },
  },

  // The drive home at dawn and the empty flat: gentle, leaning major, piano.
  home: {
    slot(play, t, i) {
      const plan = ['D', 'A', 'Bm', 'E'];
      const chord = CHORDS[plan[i % 4]];
      const [low, pad] = chord;
      const len = 6.5;
      play.pad(pad, t, len, { bright: 900, level: 0.26, attack: 2.5, release: 4 });
      play.bass(low, t, len, 0.32);
      roll(play, chord, t + 0.05, 0.36);
      play.key('piano', pad[2] + 12, t + len / 2, 0.2);
      play.key('piano', pad[3] + 12, t + len / 2 + 0.08, 0.18);
      sprinkle(play, 'piano', t + len / 2, len / 2, 0.12, 0.26);
      return len;
    },
  },

  // The end: the theme whole for the first time, on piano with the music box an octave
  // above, the strings swelling under its second half and landing on A. Then the music
  // stays, quiet, and the music box plays the theme once more, slowly, like a box winding
  // down, and finds the A again.
  ending: {
    fadeIn: 2.5,
    slot(play, t, i) {
      const beat = 0.82;
      const bar = beat * 4;
      const step = ENDING[i];
      if (step) {
        const chord = CHORDS[step.chord];
        const len = bar * step.bars;
        play.pad(chord[1], t, len, {
          bright: 900 + 900 * step.lift,
          level: 0.38 + 0.3 * step.lift,
          attack: 1.6,
          release: step.landing ? 7 : 3,
          strings: step.strings ?? 0,
        });
        play.bass(chord[0], t, len, 0.4 + 0.2 * step.lift, step.landing ? 6 : 3);
        if (step.bar !== undefined) {
          theme(play, 'piano', t, beat, step.bar, { velocity: 0.55 });
          theme(play, 'box', t, beat, step.bar, { velocity: 0.22 });
        } else if (step.landing) {
          play.key('piano', HOME_NOTE, t, 0.6);
          play.key('box', HOME_NOTE, t, 0.25);
          play.bass(33, t, len, 0.3, 6);
        } else {
          roll(play, chord, t, 0.3);
        }
        return len;
      }
      const k = i - ENDING.length;
      const plan = ['A', 'D', 'Fm', 'E3'];
      const chord = CHORDS[plan[k % 4]];
      const len = bar * 2;
      const round = Math.floor(k / 4);
      play.pad(chord[1], t, len, { bright: 900, level: 0.3, attack: 2.5, release: 4 });
      play.bass(chord[0], t, len, 0.3);
      if (round === 1) theme(play, 'box', t + bar / 2, 1.2, k % 4, { velocity: 0.3 });
      else if (round === 2 && k % 4 === 0) play.key('box', HOME_NOTE, t + 0.4, 0.3);
      else sprinkle(play, 'piano', t, len, 0.08, 0.22);
      return len;
    },
  },
};
