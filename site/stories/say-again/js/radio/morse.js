// morse.js: International Morse code (ITU-R M.1677), and the helpers the decoder and the
// keyer use. Patterns are written with '.' and '-'; letters are separated by one space.

export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...',
  8: '---..', 9: '----.', 0: '-----', '?': '..--..',
};

// SOS is one prosign sent without the gaps between its letters, so it gets its own pattern.
export const SOS = '...---...';

/** The pattern for a word or message: letters joined by spaces, words by ' / '. */
export function encode(text) {
  if (text === 'SOS') return SOS;
  return text
    .toUpperCase()
    .split(' ')
    .map((word) => [...word].map((ch) => MORSE[ch] ?? '').filter(Boolean).join(' '))
    .join(' / ');
}

/** The letter a pattern stands for, or null. */
export function decodeLetter(pattern) {
  for (const [ch, p] of Object.entries(MORSE)) if (p === pattern) return ch;
  return null;
}

/**
 * Four letters to pick from when decoding: the right one and three that sound close to it
 * (same length or one element off), so the choice teaches the code instead of guessing.
 * With `distinct`, the three sound nothing like it (other lengths, other first sign), for
 * the one word that must not be fumbled into.
 */
export function choicesFor(letter, rng = Math.random, { distinct = false } = {}) {
  const want = MORSE[letter];
  const kind = /[0-9]/.test(letter) ? /[0-9]/ : /[A-Z]/;
  const others = Object.keys(MORSE).filter((ch) => ch !== letter && kind.test(ch));
  const score = (ch) => {
    const p = MORSE[ch];
    let s = Math.abs(p.length - want.length) * 2;
    let diff = 0;
    for (let i = 0; i < Math.max(p.length, want.length); i++) if (p[i] !== want[i]) diff += 1;
    s += diff;
    // The same length with one sign different (D and B, S and H) is a guess, not a reading.
    if (p.length === want.length && diff === 1) s += 4;
    if (distinct) s = (p.length === want.length ? 6 : 0) + (p[0] === want[0] ? 3 : 0) - Math.abs(p.length - want.length);
    return s + rng() * 1.5;
  };
  const scored = new Map(others.map((ch) => [ch, score(ch)]));
  const near = others.sort((a, b) => scored.get(a) - scored.get(b)).slice(0, 3);
  const all = [letter, ...near];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

/** Dots and dashes as the screen shows them (a minus sign, so it lines up with the dots). */
export function glyphs(pattern) {
  return pattern.replace(/\./g, '·').replace(/-/g, '−');
}
