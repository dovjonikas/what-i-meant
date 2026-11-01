// ui.js: everything outside the radio: the night cards, the words under the pictures when
// the story leaves the station (the drive, the kitchen), the paper notes left on the
// table, the old radio's button in the kitchen, and the end card.

const READ_MS_PER_CHAR = 55;

export class Ui {
  /**
   * @param {HTMLElement} column  the phone-wide column (index.html)
   * @param {HTMLElement} card    the full-screen card
   * @param {object} sound        js/audio.js, or a silent stand-in
   */
  constructor(column, card, sound) {
    this.column = column;
    this.cardEl = card;
    this.sound = sound;
    this.words = column.querySelector('.words');
    this.say = column.querySelector('.words-line');
    this.picks = column.querySelector('.words-picks');
    this.go = document.querySelector('.words-go');
    this.holdBtn = column.querySelector('.hand-ptt');
    this.paperEl = document.querySelector('.paper');
  }

  /** A night's name on a dark card. */
  card(title, sub = '', ms = 2800) {
    const c = this.cardEl;
    c.innerHTML = `<p class="card-title">${title}</p>${sub ? `<p class="card-sub">${sub}</p>` : ''}`;
    c.hidden = false;
    requestAnimationFrame(() => c.classList.add('is-on'));
    return wait(ms).then(() => {
      c.classList.remove('is-on');
      return wait(900);
    }).then(() => {
      c.hidden = true;
    });
  }

  /**
   * A line under the picture. `who` colours it (the kid's words are his yellow) and puts the
   * speaker's name over it, as the radio screen does; a line with no `who` is the story telling.
   */
  async line(text, who = '', { tap = true } = {}) {
    this.words.hidden = false;
    this.say.className = `words-line ${who ? `is-${who}` : 'is-told'}`;
    this.name(who);
    this.say.textContent = text;
    this.say.classList.remove('is-in');
    void this.say.offsetWidth;
    this.say.classList.add('is-in');
    await wait(Math.max(1400, text.length * READ_MS_PER_CHAR));
    if (tap) await this.tapToGo();
  }

  /** The speaker's name from the radio's list (player.js shares it), or none. */
  name(who) {
    const name = who && this.names?.[who];
    if (name) this.say.dataset.name = name;
    else delete this.say.dataset.name;
  }

  clearLine() {
    this.say.classList.remove('is-in');
    this.say.textContent = '';
    this.name('');
  }

  /**
   * Waits for a tap anywhere. The "tap to go on" comes up soon after: the line has already
   * had its reading time, and a player left waiting with no sign thinks the story froze.
   */
  tapToGo() {
    return new Promise((resolve) => {
      const show = setTimeout(() => this.go.classList.add('is-on'), 900);
      const done = (e) => {
        if (e.target.closest('button, a')) return;
        clearTimeout(show);
        this.go.classList.remove('is-on');
        window.removeEventListener('pointerdown', done);
        resolve();
      };
      setTimeout(() => window.addEventListener('pointerdown', done), 120);
    });
  }

  /** What you say in the kitchen: pick one, it appears as your line. */
  pick(options) {
    this.words.hidden = false;
    this.picks.innerHTML = '';
    return new Promise((resolve) => {
      options.forEach((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pick';
        b.textContent = label;
        b.style.setProperty('--i', i);
        b.addEventListener('click', () => {
          this.sound.dialTick?.();
          this.picks.innerHTML = '';
          resolve(i);
        });
        this.picks.append(b);
      });
    });
  }

  /**
   * The old radio's button, in the kitchen. Holding it types `text` as your line; for the
   * hand, `onProgress` gets 0..1 while it is held. Resolves when it has been held to the end.
   */
  hold(text, hint, onProgress) {
    const b = this.holdBtn;
    b.hidden = false;
    b.querySelector('.hand-hint').textContent = hint;
    const ring = b.querySelector('circle');
    const ms = Math.max(1600, text.length * 60);
    this.words.hidden = false;
    return new Promise((resolve) => {
      let start = 0;
      let raf = 0;
      const step = (now) => {
        const k = Math.min(1, (now - start) / ms);
        ring.style.strokeDashoffset = String(100 - k * 100);
        if (text) {
          this.say.className = 'words-line is-you is-in';
          this.name('you');
          this.say.textContent = text.slice(0, Math.floor(k * text.length));
        }
        onProgress?.(k);
        if (k < 1) raf = requestAnimationFrame(step);
        else finish();
      };
      const down = (e) => {
        b.setPointerCapture(e.pointerId);
        start = performance.now();
        b.classList.add('is-down');
        this.sound.pttDown?.();
        raf = requestAnimationFrame(step);
      };
      const up = () => {
        if (!start) return;
        cancelAnimationFrame(raf);
        start = 0;
        b.classList.remove('is-down');
        this.sound.pttUp?.();
        ring.style.strokeDashoffset = '100';
        onProgress?.(0);
        if (text) this.say.textContent = '';
      };
      const finish = () => {
        b.removeEventListener('pointerdown', down);
        b.removeEventListener('pointerup', up);
        b.removeEventListener('pointercancel', up);
        b.classList.remove('is-down');
        this.sound.pttUp?.();
        b.hidden = true;
        ring.style.strokeDashoffset = '100';
        resolve();
      };
      b.addEventListener('pointerdown', down);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
    });
  }

  /** A handwritten note left on the kitchen table. */
  async paper(text) {
    const p = this.paperEl;
    p.querySelector('.paper-text').textContent = text;
    p.hidden = false;
    this.sound.paper?.();
    requestAnimationFrame(() => p.classList.add('is-on'));
    await wait(Math.max(2600, text.length * 45));
    await this.tapToGo();
    p.classList.remove('is-on');
    await wait(500);
    p.hidden = true;
  }

  hideWords() {
    this.clearLine();
    this.picks.innerHTML = '';
    this.words.hidden = true;
  }

  /** The end: the title, and the way back to the stories. */
  end() {
    const c = this.cardEl;
    c.innerHTML = `<p class="card-kicker">What I Meant · 02</p><p class="card-title is-big">Say Again</p>
      <a class="btn" href="../../">Back to the stories</a>`;
    c.hidden = false;
    c.classList.add('is-end');
    requestAnimationFrame(() => c.classList.add('is-on'));
  }
}

export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
