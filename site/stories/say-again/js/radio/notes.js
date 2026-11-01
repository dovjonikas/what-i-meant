// notes.js: the sticky notes on the radio. Each thing the player learns about the radio
// (what OVER means, Morse, how a fix works) goes on a note; the stack button opens them
// all, so the night's lessons stay at hand without anyone explaining them twice.

export class Notes {
  /**
   * @param {HTMLButtonElement} button  the notes button on the console
   * @param {HTMLElement} sheet         the .notes sheet that lists them
   * @param {object} sound              js/audio.js, or a silent stand-in
   */
  constructor(button, sheet, sound) {
    this.button = button;
    this.sheet = sheet;
    this.sound = sound;
    this.list = sheet.querySelector('.notes-list');
    this.items = [];
    button.addEventListener('click', () => this.open());
    sheet.querySelector('.notes-close').addEventListener('click', () => this.close());
    sheet.addEventListener('click', (e) => e.target === sheet && this.close());
  }

  /**
   * Adds a note and shows it big until the player taps it, so it is always read; then it
   * flies onto the stack. Resolves when it has gone. Ids keep a note from repeating.
   */
  add(id, title, body, { quiet = false } = {}) {
    if (this.items.some((n) => n.id === id)) return Promise.resolve();
    this.items.push({ id, title, body });
    this.render();
    if (quiet) return Promise.resolve();
    this.sound.note?.();
    const first = this.items.length === 1;
    const fly = document.createElement('button');
    fly.type = 'button';
    fly.className = 'note-fly';
    fly.innerHTML = `<b>${title}</b><span>${body}</span><small>${first ? 'Tap to keep it. Your notes stay on the yellow stack by the radio.' : 'Tap to keep it'}</small>`;
    document.body.append(fly);
    return new Promise((resolve) => {
      const go = () => {
        fly.removeEventListener('click', go);
        const to = this.button.getBoundingClientRect();
        fly.style.setProperty('--to-x', `${to.left + to.width / 2}px`);
        fly.style.setProperty('--to-y', `${to.top + to.height / 2}px`);
        fly.classList.add('is-going');
        this.sound.paper?.();
        setTimeout(() => {
          fly.remove();
          this.button.classList.add('is-bump');
          setTimeout(() => this.button.classList.remove('is-bump'), 400);
          resolve();
        }, 620);
      };
      // A moment before a tap counts, so a tap meant for something else does not throw it away.
      setTimeout(() => fly.addEventListener('click', go), 500);
    });
  }

  render() {
    this.button.querySelector('.c-notes-n').textContent = String(this.items.length);
    this.button.hidden = !this.items.length;
    this.list.innerHTML = this.items
      .map((n, i) => `<li class="note" style="--tilt:${((i * 37) % 5) - 2}deg"><b>${n.title}</b><span>${n.body}</span></li>`)
      .join('');
  }

  open() {
    this.sheet.hidden = false;
    this.sound.paper?.();
    requestAnimationFrame(() => this.sheet.classList.add('is-open'));
  }

  close() {
    this.sheet.classList.remove('is-open');
    setTimeout(() => (this.sheet.hidden = true), 300);
  }

  /** For saving: the ids, titles and bodies. */
  toJSON() {
    return this.items;
  }

  restore(items = []) {
    this.items = items.slice();
    this.render();
  }
}
