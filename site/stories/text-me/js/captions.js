// captions.js: the words. One line on screen at a time, read at the player's pace: the
// words come in one after another, and the next tap moves on (a tap while they are still
// coming in shows the whole line at once). A spoken line is set in quotes, with the
// speaker's name in that person's colour above it. A line left waiting brings up a quiet
// "tap to go on" at the foot of the screen: soon for the first few lines, while the player
// is still learning how this works, and after that only when they have sat a while.
// The words sit at the foot of the screen, unless there they would cover somebody in the
// picture; then they go up under the bar, for the rest of that scene (`stage`, set by
// main.js, says who is where).

import { markOf } from './people.js';

const WORD_MS = 55; // gap between words coming in
const NUDGE_FIRST = 4; // lines that get the nudge soon
const NUDGE_SOON = 1300; // ms after a line is done, for those
const NUDGE_LATE = 5500; // ms after, for the rest

export class Captions {
  constructor(root) {
    this.el = document.createElement('section');
    this.el.className = 'captions';
    this.el.setAttribute('aria-live', 'polite');
    root.append(this.el);
    this.nudge = document.createElement('p');
    this.nudge.className = 'nudge';
    this.nudge.setAttribute('aria-hidden', 'true');
    this.nudge.innerHTML = '<i></i>tap to go on';
    root.append(this.nudge);
    this.waited = 0;
  }

  /** Shows `text` and resolves after the player taps to go on. `tap` gives the next tap. */
  async say(text, by, tap) {
    this.onLine?.(by, text);
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
    this.place(line);
    // Somebody who walks in during the line, or was still fading in, is looked for again
    // while it is up; if the words would cover them now, they move up with a quick fade.
    const watch = setInterval(() => {
      if (!this.top && !this.busy() && this.covers(line)) this.move();
    }, 350);

    const shown = new Promise((r) => setTimeout(r, words.length * WORD_MS + 380));
    const first = await Promise.race([shown.then(() => 'shown'), tap().then(() => 'tap')]);
    if (first === 'tap') line.classList.add('is-whole');
    line.classList.add('is-done');
    this.waited += 1;
    const nudge = setTimeout(() => {
      // Not while something else asks for the finger (a hold, a choice, the phone).
      if (!document.querySelector('.hint:not([hidden]), .choices > *, .phone:not([hidden])')) this.nudge.classList.add('is-on');
    }, this.waited <= NUDGE_FIRST ? NUDGE_SOON : NUDGE_LATE);
    // tap() hands every caller the same next tap, so the race above leaves nothing behind.
    await tap();
    clearInterval(watch);
    clearTimeout(nudge);
    this.nudge.classList.remove('is-on');
  }

  /** Moves the words to the top for this scene if, at the foot, they would cover somebody. */
  place(line) {
    const stage = this.stage;
    if (!stage?.current) return;
    if (stage.id !== this.sceneId) {
      this.sceneId = stage.id;
      this.top = false;
    }
    if (this.busy()) this.top = false;
    else if (!this.top) {
      this.el.classList.remove('is-top');
      this.top = this.covers(line);
    }
    this.el.classList.toggle('is-top', this.top);
    document.body.classList.toggle('words-top', this.top);
  }

  /** Over the life lines, the lock screen or an open phone the words keep their place. */
  busy() {
    return !!document.querySelector('#lines.is-on, .lock:not([hidden])') || document.body.classList.contains('phone-open');
  }

  /** True when the words of `line`, where they are now, cover a good part of somebody. */
  covers(line) {
    const rects = [...line.querySelectorAll('.word')].map((w) => w.getBoundingClientRect());
    if (!rects.length || !this.stage?.current) return false;
    const text = [Math.min(...rects.map((r) => r.left)), Math.min(...rects.map((r) => r.top)) - 6, Math.max(...rects.map((r) => r.right)), Math.max(...rects.map((r) => r.bottom)) + 6];
    return (this.stage.current.fx.bodies?.() ?? []).some(({ box, canvas, w }) => {
      const r = canvas.getBoundingClientRect();
      const k = r.width / w;
      const b = [r.left + box[0] * k, r.top + box[1] * k, r.left + box[2] * k, r.top + box[3] * k];
      const ox = Math.min(text[2], b[2]) - Math.max(text[0], b[0]);
      const oy = Math.min(text[3], b[3]) - Math.max(text[1], b[1]);
      return ox > 0 && oy > 0 && (ox * oy) / ((b[2] - b[0]) * (b[3] - b[1])) > 0.12;
    });
  }

  /** Takes the words up under the bar for the rest of the scene, through a quick fade. */
  move() {
    this.top = true;
    this.el.classList.add('is-moving');
    setTimeout(() => {
      this.el.classList.add('is-top');
      document.body.classList.add('words-top');
      this.el.classList.remove('is-moving');
    }, 170);
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
