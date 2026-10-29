// phone.js: the phone that slides up from the bottom. A whole life passes through it:
// "text me when you get home" from Mom, the best friend's "u coming", goose's moon at 3am,
// Dad's "ok.". The player answers by tapping a reply; the reply types itself into the box.
//
// run(spec, ctx) plays one chat and resolves when the phone has slid away again.
// spec: { with: name ('' for no name, null for a new message with an empty To: field),
//         time: a stamp at the top, history: messages already there, steps: [...] }
// A message or step is one of:
//   { them: 'text' }  { me: 'text' }  { stamp: 'Fri 23:12' }  { photo: 'moon', from }
//   { pick: ['a', 'b'], set }   reply chips; the picked text is typed and sent. A chip can
//                               be { text, silent: true }: an action, not words, such as
//                               leaving a message on read; nothing is sent
//   { draft: 'text' }           the text is already typed; the player taps send
//   { type: 'text', ask, set, unsendable }   typed by itself; `ask` offers e.g. Send/Delete
//   { erase: true }             deletes what is typed
//   { status: 'Delivered' }     a small label under your last message
//   { wait: ms, typing }        a pause; `typing` shows the other side typing meanwhile
// Any step may carry `if: { flag: value }`, and `music` to change the score when it lands.

const TYPE_MS = 45; // per character when a reply types itself

export class Phone {
  constructor(root) {
    this.el = document.createElement('section');
    this.el.className = 'phone';
    this.el.setAttribute('aria-label', 'Phone');
    this.el.hidden = true;
    this.el.innerHTML = `
      <header class="phone-head"><span class="phone-avatar" aria-hidden="true"></span><span class="phone-name"></span></header>
      <div class="phone-thread" role="log" aria-live="polite"></div>
      <div class="phone-replies"></div>
      <div class="phone-compose">
        <span class="phone-to">To:</span>
        <span class="phone-field"><span class="phone-text"></span><span class="phone-caret" aria-hidden="true"></span></span>
        <button class="phone-send" type="button" aria-label="Send" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`;
    root.append(this.el);
    this.thread = this.el.querySelector('.phone-thread');
    this.replies = this.el.querySelector('.phone-replies');
    this.text = this.el.querySelector('.phone-text');
    this.send = this.el.querySelector('.phone-send');
  }

  async run(spec, ctx) {
    this.ctx = ctx;
    this.el.classList.toggle('is-new', spec.with === null);
    this.el.querySelector('.phone-name').textContent = spec.with === null ? 'New message' : spec.with;
    this.thread.textContent = '';
    this.text.textContent = '';
    this.send.disabled = true;
    if (spec.time) this.stamp(spec.time);
    for (const m of spec.history ?? []) this.place(m);
    await this.open();
    for (const step of spec.steps ?? []) {
      if (step.if && !matches(step.if, ctx.flags)) continue;
      await this.step(step);
    }
    // The phone goes away by itself once the last message has had time to be read, so
    // nobody sits waiting on a finished chat; a tap closes it sooner.
    const last = this.thread.lastElementChild?.textContent ?? '';
    this.el.classList.add('is-done');
    await Promise.race([ctx.tap(), sleep(Math.min(4200, 1800 + last.length * 45))]);
    ctx.untap?.();
    this.el.classList.remove('is-done');
    await this.close();
  }

  async step(s) {
    const { ctx } = this;
    if (s.them !== undefined) {
      await this.typing(s.typing ?? Math.min(2000, 600 + s.them.length * 40));
      this.bubble('them', s.them);
      ctx.sfx?.pop();
    } else if (s.photo) {
      if (s.from === 'them') await this.typing(700);
      this.place(s);
      ctx.sfx?.[s.from === 'me' ? 'whoosh' : 'pop']();
    } else if (s.stamp) {
      this.stamp(s.stamp);
    } else if (s.status) {
      this.status(s.status);
    } else if (s.wait) {
      if (s.typing) await this.typing(s.wait);
      else await sleep(s.wait);
    } else if (s.pick) {
      const picked = await this.choose(s.pick);
      const text = picked.text ?? picked;
      if (s.set) ctx.flags[s.set] = text;
      if (picked.silent) {
        // Nothing is sent: the phone just goes back in the pocket.
        await sleep(400);
      } else {
        await this.typeOut(text);
        await this.sendNow();
      }
    } else if (s.draft) {
      this.text.textContent = s.draft;
      this.send.disabled = false;
      this.send.classList.add('is-ready');
      await new Promise((resolve) => this.send.addEventListener('click', resolve, { once: true }));
      this.send.classList.remove('is-ready');
      await this.sendNow();
    } else if (s.type) {
      await this.typeOut(s.type, s.unsendable);
      if (s.ask) {
        const choice = await this.choose(s.ask);
        if (s.set) ctx.flags[s.set] = choice;
        if (choice === s.ask[0]) await this.sendNow();
        else await this.erase();
      }
    } else if (s.erase) {
      await this.erase();
    }
    if (s.music) ctx.music?.(s.music);
  }

  place(m) {
    if (m.stamp) this.stamp(m.stamp);
    else if (m.photo) {
      const b = this.bubble(m.from ?? 'them', '');
      b.classList.add('is-photo', `photo-${m.photo}`);
      b.setAttribute('aria-label', `a photo: ${m.photo}`);
    } else if (m.me !== undefined) this.bubble('me', m.me);
    else this.bubble('them', m.them);
  }

  bubble(who, text) {
    const b = document.createElement('p');
    b.className = `bubble from-${who}`;
    b.textContent = text;
    this.thread.append(b);
    this.thread.querySelector('.phone-status')?.remove();
    return b;
  }

  stamp(text) {
    const s = document.createElement('p');
    s.className = 'phone-stamp';
    s.textContent = text;
    this.thread.append(s);
  }

  status(text) {
    this.thread.querySelector('.phone-status')?.remove();
    const s = document.createElement('p');
    s.className = 'phone-status';
    s.textContent = text;
    this.thread.append(s);
  }

  async typing(ms) {
    const dots = document.createElement('p');
    dots.className = 'bubble from-them is-typing';
    dots.setAttribute('aria-label', 'typing');
    dots.innerHTML = '<i></i><i></i><i></i>';
    this.thread.append(dots);
    await sleep(ms);
    dots.remove();
  }

  /** Shows reply chips and resolves with the tapped option (its text, or the object). */
  choose(options) {
    return new Promise((resolve) => {
      this.replies.textContent = '';
      // Two or more replies are a real choice, and it is marked as one.
      this.replies.classList.toggle('is-choice', options.length > 1);
      for (const option of options) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = option.silent ? 'chip is-action' : 'chip';
        chip.textContent = option.text ?? option;
        chip.addEventListener('click', () => {
          this.replies.textContent = '';
          resolve(option);
        });
        this.replies.append(chip);
      }
      this.replies.querySelector('.chip')?.focus({ preventScroll: true });
    });
  }

  async typeOut(text, unsendable = false) {
    this.el.classList.toggle('is-unsendable', unsendable);
    for (const ch of text) {
      this.text.textContent += ch;
      this.ctx.sfx?.tick();
      await sleep(TYPE_MS + Math.random() * 40);
    }
    this.send.disabled = unsendable;
  }

  async erase() {
    while (this.text.textContent.length) {
      this.text.textContent = this.text.textContent.slice(0, -1);
      this.ctx.sfx?.tick();
      await sleep(70);
    }
    this.send.disabled = true;
    this.el.classList.remove('is-unsendable');
  }

  async sendNow() {
    const text = this.text.textContent;
    this.text.textContent = '';
    this.send.disabled = true;
    this.bubble('me', text);
    this.ctx.sfx?.whoosh();
    await sleep(500);
  }

  async open() {
    this.el.hidden = false;
    document.body.classList.add('phone-open');
    this.ctx.sfx?.buzz();
    await this.el.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], {
      duration: 460, easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
    }).finished;
  }

  async close() {
    await this.el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(105%)' }], {
      duration: 360, easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
    }).finished;
    this.el.hidden = true;
    document.body.classList.remove('phone-open');
  }
}

/** True when every flag in `cond` has its value; a flag holding a list must contain it. */
export function matches(cond, flags) {
  return Object.entries(cond).every(([k, v]) => (Array.isArray(flags[k]) ? flags[k].includes(v) : flags[k] === v));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
