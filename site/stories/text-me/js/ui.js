// ui.js: the small pieces of interface around the story: the full-screen cards (chapter
// names, the title, the ending), the lock screen for the returns to the present, the soft
// black veil between times, the choice buttons, the "hold" hint with its fill, and the
// picker for who you keep close. Everything here is plain DOM styled in css/story.css.

import { sleep } from './phone.js';

export const STORY_TITLE = 'Text me when you get home';

export class Ui {
  constructor(column, card) {
    this.column = column;
    this.cardEl = card;
    this.choices = document.createElement('div');
    this.choices.className = 'choices';
    this.hintEl = document.createElement('p');
    this.hintEl.className = 'hint';
    this.hintEl.hidden = true;
    this.hintEl.innerHTML = '<span class="hint-fill" aria-hidden="true"></span><span class="hint-text"></span>';
    column.append(this.choices, this.hintEl);
  }

  /** Fades in a full-screen card: 'chapter' (one word), 'title', or 'end' (with buttons). */
  async card(kind, text) {
    const el = this.cardEl;
    el.className = `card is-${kind}`;
    el.innerHTML = '';
    const add = (tag, cls, content) => {
      const n = document.createElement(tag);
      n.className = cls;
      n.textContent = content;
      el.append(n);
      return n;
    };
    if (kind === 'chapter') add('h2', 'card-title', text);
    if (kind === 'title' || kind === 'end') {
      add('p', 'card-kicker', 'What I Meant · 01');
      add('h2', 'card-title', STORY_TITLE);
    }
    if (kind === 'end') {
      const actions = add('div', 'card-actions', '');
      const back = document.createElement('a');
      back.className = 'btn';
      back.href = '../../';
      back.textContent = 'Back to the stories';
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'btn is-quiet';
      again.textContent = 'Play again';
      again.addEventListener('click', () => location.reload());
      actions.append(back, again);
    }
    el.hidden = false;
    await el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease-out', fill: 'forwards' }).finished;
  }

  async uncard() {
    await this.cardEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-in-out', fill: 'forwards' }).finished;
    this.cardEl.hidden = true;
  }

  /** A black veil over everything, faded in (on) or out: a soft cut between times. */
  async dim(on) {
    if (!this.veil) {
      this.veil = document.createElement('div');
      this.veil.className = 'veil';
      document.body.append(this.veil);
    }
    await this.veil.animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: on ? 700 : 900, easing: 'ease-in-out', fill: 'forwards' }).finished;
  }

  /** The phone's lock screen in the present: the time, and the text you sent with its status. */
  async lock({ time, sent, status }) {
    if (!this.lockEl) {
      this.lockEl = document.createElement('section');
      this.lockEl.className = 'lock';
      this.lockEl.setAttribute('aria-label', 'Lock screen');
      this.lockEl.innerHTML = '<p class="lock-day">Sunday</p><p class="lock-time"></p>' +
        '<div class="lock-note"><p class="lock-app">Messages</p><p class="lock-text"></p><p class="lock-status"></p></div>';
      this.column.append(this.lockEl);
    }
    this.lockEl.querySelector('.lock-time').textContent = time;
    this.lockEl.querySelector('.lock-text').textContent = `You: ${sent}`;
    this.lockEl.querySelector('.lock-status').textContent = status;
    this.lockEl.hidden = false;
    await this.lockEl.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' }).finished;
  }

  async unlock() {
    if (!this.lockEl) return;
    await this.lockEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-in', fill: 'forwards' }).finished;
    this.lockEl.hidden = true;
  }

  /** Buttons for a choice; resolves with the picked option's value. */
  choose(options) {
    return new Promise((resolve) => {
      this.choices.textContent = '';
      this.choices.className = 'choices is-choose';
      const head = document.createElement('p');
      head.className = 'choices-head';
      head.textContent = 'your call';
      this.choices.append(head);
      for (const o of options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip is-big';
        b.textContent = o.text;
        b.addEventListener('click', async () => {
          b.classList.add('is-picked');
          await sleep(350);
          this.choices.textContent = '';
          this.choices.className = 'choices';
          resolve(o.value);
        });
        this.choices.append(b);
      }
    });
  }

  /** The "who do you keep close" picker: tap up to `max`, then go on. Resolves with ids. */
  pick(spec) {
    return new Promise((resolve) => {
      const chosen = new Set();
      this.choices.textContent = '';
      this.choices.className = 'choices is-pick';
      const head = document.createElement('p');
      head.className = 'choices-head';
      head.textContent = spec.hint;
      this.choices.append(head);
      const done = document.createElement('button');
      done.type = 'button';
      done.className = 'chip is-done';
      done.textContent = "That's them";
      done.hidden = true;
      const finish = async () => {
        await sleep(400);
        this.choices.textContent = '';
        this.choices.className = 'choices';
        resolve([...chosen]);
      };
      done.addEventListener('click', finish);
      for (const o of spec.options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = o.label;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          if (chosen.has(o.id)) chosen.delete(o.id);
          else if (chosen.size < spec.max) chosen.add(o.id);
          b.setAttribute('aria-pressed', String(chosen.has(o.id)));
          done.hidden = chosen.size === 0;
          if (chosen.size === spec.max) finish();
        });
        this.choices.append(b);
      }
      this.choices.append(done);
    });
  }

  /** Shows or hides the hold hint. */
  hint(text) {
    this.hintEl.hidden = !text;
    if (text) this.hintEl.querySelector('.hint-text').textContent = text;
    this.progress(0);
  }

  progress(k) {
    this.hintEl.style.setProperty('--fill', String(Math.min(1, k)));
  }
}
