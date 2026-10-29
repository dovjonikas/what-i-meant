// history.js: the lines and messages so far, to read again. A button in the top bar opens
// them over the story, newest at the bottom; the story waits while they are open (taps
// on the sheet do not count, and the years stop running). Only what was said or sent as
// it happened is kept, not the old messages a chat opens with.

const KEEP = 40;

export class History {
  /** `button` opens it; `onToggle(open)` lets the story pause while it is open. */
  constructor(button, column, onToggle) {
    this.items = [];
    this.button = button;
    this.onToggle = onToggle;
    this.sheet = document.createElement('section');
    this.sheet.className = 'history';
    this.sheet.hidden = true;
    this.sheet.setAttribute('aria-label', 'Earlier lines');
    this.sheet.innerHTML = '<p class="history-head">Earlier</p><ol class="history-list"></ol>' +
      '<button class="chip history-close" type="button">Back to the story</button>';
    column.append(this.sheet);
    this.list = this.sheet.querySelector('.history-list');
    button.addEventListener('click', () => this.open());
    this.sheet.querySelector('.history-close').addEventListener('click', () => this.close());
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.sheet.hidden) this.close();
    });
  }

  /** Keeps one line: `who` is the speaker or sender ('' for the narration). */
  add(who, text) {
    this.items.push({ who, text });
    if (this.items.length > KEEP) this.items.shift();
  }

  open() {
    this.list.textContent = '';
    for (const { who, text } of this.items) {
      const li = document.createElement('li');
      li.className = who ? 'history-item is-said' : 'history-item';
      if (who) {
        const name = document.createElement('span');
        name.className = 'history-who';
        name.textContent = who;
        li.append(name);
      }
      li.append(document.createTextNode(text));
      this.list.append(li);
    }
    if (!this.items.length) this.list.innerHTML = '<li class="history-item">Nothing yet.</li>';
    this.sheet.hidden = false;
    this.onToggle?.(true);
    this.list.scrollTop = this.list.scrollHeight;
    this.sheet.querySelector('.history-close').focus({ preventScroll: true });
  }

  close() {
    this.sheet.hidden = true;
    this.onToggle?.(false);
    this.button.focus({ preventScroll: true });
  }
}
