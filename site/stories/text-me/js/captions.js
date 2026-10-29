// captions.js: the words. One line on screen at a time, read at the player's pace: the
// words come in one after another, and the next tap moves on (a tap while they are still
// coming in shows the whole line at once). A spoken line is set in quotes, with the
// speaker's name in that person's colour above it.

import { markOf } from './people.js';

const WORD_MS = 55; // gap between words coming in

export class Captions {
  constructor(root) {
    this.el = document.createElement('section');
    this.el.className = 'captions';
    this.el.setAttribute('aria-live', 'polite');
    root.append(this.el);
  }

  /** Shows `text` and resolves after the player taps to go on. `tap` gives the next tap. */
  async say(text, by, tap) {
    const line = document.createElement('div');
    line.className = by ? 'line is-said' : 'line';
    if (by) {
      const who = document.createElement('p');
      who.className = 'line-who';
      who.textContent = by;
      who.style.color = `color-mix(in srgb, ${markOf(by === 'you' ? 'me' : by)} 70%, #efe9de)`;
      line.append(who);
    }
    const p = document.createElement('p');
    p.className = 'line-text';
    const words = (by ? `\u201C${text}\u201D` : text).split(' ');
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.animationDelay = `${i * WORD_MS}ms`;
      p.append(span, i < words.length - 1 ? ' ' : '');
    });
    line.append(p);
    this.clear();
    this.el.append(line);

    const shown = new Promise((r) => setTimeout(r, words.length * WORD_MS + 380));
    const first = await Promise.race([shown.then(() => 'shown'), tap().then(() => 'tap')]);
    if (first === 'tap') line.classList.add('is-whole');
    line.classList.add('is-done');
    // tap() hands every caller the same next tap, so the race above leaves nothing behind.
    await tap();
  }

  /** Shows a line without waiting for a tap (used over the open phone); clear() hides it. */
  show(text) {
    const line = document.createElement('div');
    line.className = 'line is-done';
    const p = document.createElement('p');
    p.className = 'line-text';
    text.split(' ').forEach((w, i, all) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.animationDelay = `${i * WORD_MS}ms`;
      p.append(span, i < all.length - 1 ? ' ' : '');
    });
    line.append(p);
    this.clear();
    this.el.append(line);
  }

  clear() {
    for (const old of this.el.querySelectorAll('.line')) {
      old.classList.add('is-gone');
      setTimeout(() => old.remove(), 300);
    }
  }
}
