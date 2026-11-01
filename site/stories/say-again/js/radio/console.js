// console.js: the radio on the desk, the part of the story you hold. It has a channel knob,
// the receive and transmit lamps, the direction finder's readout, a green screen that keeps
// the conversation, and the push-to-talk button: you pick what to say, then hold the
// button while it goes out. Let go early and the other side hears half.
// The same button keys Morse when the story asks you to send it.

import { MORSE, SOS, choicesFor, glyphs } from './morse.js';
import { fmtBearing } from '../chart/geo.js';

const TALK_CPS = 24; // characters per second while you hold the button: a brisk radio voice
const HOLD_MAX_S = 4; // long messages go faster, so no hold runs past this: longer feels frozen
const HEAR_CPS = 22; // received words appear at about the pace they are spoken
const DOT_MAX_MS = 240; // a key press shorter than this is a dot, longer a dash
const KNOB_DEG = 6; // degrees of turn per channel: one full turn covers 60 channels

export class Console {
  /**
   * @param {HTMLElement} root  the .console section (index.html)
   * @param {object} sound      js/audio.js, or a silent stand-in
   */
  constructor(root, sound) {
    this.root = root;
    this.sound = sound;
    this.chNum = root.querySelector('.c-ch-num');
    this.rxLamp = root.querySelector('.c-rx');
    this.txLamp = root.querySelector('.c-tx');
    this.dfVal = root.querySelector('.c-df-val');
    this.screen = root.querySelector('.c-screen');
    this.list = root.querySelector('.c-log');
    this.choices = root.querySelector('.c-choices');
    this.panel = root.querySelector('.c-panel');
    this.hintEl = root.querySelector('.c-hint');
    this.knob = root.querySelector('.c-knob');
    this.ptt = root.querySelector('.c-ptt');
    this.ring = root.querySelector('.c-ptt-ring circle');
    this.key16 = root.querySelector('.c-16');
    this.channel = 16;
    this.chBox = root.querySelector('.c-ch');
    this.chWant = root.querySelector('.c-ch-want');
    // The channel the conversation is on (player.js sets it through `working`). Off it you
    // do not hear it and cannot talk on it; 16 is always heard, on the second receiver.
    this.talkOn = null;
    this.knobAngle = 0;
    this.names = { you: 'YOU' };
    this.armed = null;
    this.keyer = null;
    this.busy = false;
    this.wireKnob();
    this.wirePtt();
    this.key16.addEventListener('click', () => this.setChannel(16));
    // A tap on the screen shows the rest of a line that is still appearing.
    this.screen.addEventListener('click', () => this.skip?.());
    this.list.addEventListener('scroll', () => this.edge(), { passive: true });
    // The hint can stand in for a tap on the picture (the lamp), for anyone who cannot find it.
    this.hintEl.addEventListener('click', () => {
      const r = this.hintResolve;
      this.hintResolve = null;
      r?.();
    });
  }

  get working() {
    return this.talkOn;
  }

  set working(ch) {
    this.talkOn = ch;
    this.showWant();
  }

  /**
   * Off the channel the story needs (the one it waits for, or the conversation's), the
   * channel number turns amber and the wanted one shows beside it, so where to go is always
   * on the radio itself, not only in the hint.
   */
  showWant() {
    const want = this.waitFor ?? this.talkOn;
    // 16 is heard on any channel, so it is only wanted when you must talk on it.
    const off = want != null && want !== this.channel && !(this.waitFor == null && want === 16 && !this.armed);
    this.chBox.classList.toggle('is-off', off);
    this.chWant.textContent = off ? `→${String(want).padStart(2, '0')}` : '';
  }

  show(on) {
    this.root.classList.toggle('is-shown', on);
  }

  /** A new shift: an empty screen, the finder cleared. */
  reset() {
    this.list.innerHTML = '';
    this.df(null);
    this.hint('');
  }

  hint(text = '') {
    this.hintEl.textContent = text;
    this.hintEl.classList.toggle('is-on', !!text);
  }

  /** Resolves on the next tap on the hint line. */
  hintTap() {
    return new Promise((resolve) => (this.hintResolve = resolve));
  }

  // The channel.

  setChannel(n, { silent = false } = {}) {
    n = ((n - 1 + 88) % 88) + 1;
    if (n === this.channel) return;
    this.channel = n;
    this.chNum.textContent = String(n).padStart(2, '0');
    this.knob.setAttribute('aria-valuenow', String(n));
    if (!silent) {
      const now = performance.now();
      if (!this.lastTick || now - this.lastTick > 28) {
        this.sound.dialTick?.();
        this.lastTick = now;
      }
      this.sound.staticLevel?.(n === this.waitFor || n === 16 ? 0 : 0.35);
      clearTimeout(this.staticOff);
      this.staticOff = setTimeout(() => this.sound.staticLevel?.(0), 260);
    }
    this.showWant();
    // With words ready to send, the hint follows the knob: where to go, or how to send them.
    if (this.armed && this.working != null) {
      if (n === this.working) this.hint(this.armed.hint);
      else this.offHint();
    }
    this.onChannel?.(n);
  }

  offHint() {
    this.hint(`You are on ${this.channel}. This goes out on ${this.working}: turn back to it, then hold.`);
  }

  /** Waits until the player has turned to a channel and left it there for a moment. */
  tuneTo(ch, hint) {
    this.waitFor = ch;
    this.showWant();
    this.hint(hint ?? `Turn the knob to channel ${ch}.`);
    // For anyone who cannot turn it, a tap on the hint does it; after a while the hint says so.
    this.hintResolve = () => this.setChannel(ch);
    const base = hint ?? `Turn the knob to channel ${ch}.`;
    clearTimeout(this.stuck);
    this.stuck = setTimeout(() => this.waitFor === ch && this.hint(`${base} Drag it round, or tap here.`), 9000);
    this.knob.classList.add('is-wanted');
    return new Promise((resolve) => {
      const check = () => {
        clearTimeout(this.settle);
        if (this.channel !== ch) return;
        this.settle = setTimeout(() => {
          if (this.channel !== ch) return;
          this.onChannel = null;
          this.waitFor = null;
          this.showWant();
          this.knob.classList.remove('is-wanted');
          this.hint('');
          this.hintResolve = null;
          resolve();
        }, 450);
      };
      this.onChannel = check;
      check();
    });
  }

  wireKnob() {
    const k = this.knob;
    let last = null;
    let rest = 0;
    const angleAt = (e) => {
      const r = k.getBoundingClientRect();
      return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    };
    k.addEventListener('pointerdown', (e) => {
      k.setPointerCapture(e.pointerId);
      last = { a: angleAt(e), y: e.clientY };
      k.classList.add('is-held');
    });
    k.addEventListener('pointermove', (e) => {
      if (!last) return;
      const a = angleAt(e);
      let d = a - last.a;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      // Close to the centre the angle jumps about, so there a drag up or down turns it.
      const r = k.getBoundingClientRect();
      const fromCentre = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (fromCentre < r.width * 0.18) d = (last.y - e.clientY) * 1.4;
      last = { a, y: e.clientY };
      this.turn(d);
    });
    const end = () => {
      last = null;
      k.classList.remove('is-held');
      // Let go a few channels off the one the story wants and the knob drops into it: a
      // thumb on a small knob overshoots, and missing by one is not the lesson.
      if (this.waitFor && Math.abs(this.channel - this.waitFor) <= 3) this.setChannel(this.waitFor);
    };
    k.addEventListener('pointerup', end);
    k.addEventListener('pointercancel', end);
    k.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.turn(-Math.sign(e.deltaY) * KNOB_DEG);
    }, { passive: false });
    k.addEventListener('keydown', (e) => {
      const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
      if (!step) return;
      e.preventDefault();
      this.turn(step * KNOB_DEG);
    });
    this.turn = (deg) => {
      this.knobAngle += deg;
      k.style.setProperty('--turn', `${this.knobAngle}deg`);
      rest += deg;
      for (;;) {
        // The wanted channel holds the knob a little longer, so it is easy to stop on.
        const need = this.channel === this.waitFor ? KNOB_DEG * 3 : KNOB_DEG;
        if (Math.abs(rest) < need) break;
        const step = Math.sign(rest);
        rest -= step * need;
        this.setChannel(this.channel + step);
      }
    };
  }

  // Lamps and the direction finder.

  lamp(which, on) {
    (which === 'rx' ? this.rxLamp : this.txLamp).classList.toggle('is-on', on);
    if (which === 'rx') this.onRx?.(on);
  }

  /** Shows a bearing after a short sweep, as if the finder were settling on it. */
  df(brg) {
    clearInterval(this.sweep);
    if (brg == null) {
      this.dfVal.textContent = '---';
      return Promise.resolve();
    }
    this.dfVal.classList.add('is-live');
    let n = 0;
    return new Promise((resolve) => {
      this.sweep = setInterval(() => {
        n += 1;
        const wobble = n < 14 ? (Math.random() - 0.5) * (60 - n * 4) : 0;
        this.dfVal.textContent = fmtBearing((brg + wobble + 360) % 360);
        if (n >= 14) {
          clearInterval(this.sweep);
          this.dfVal.classList.remove('is-live');
          resolve();
        }
      }, 90);
    });
  }

  // The conversation on the screen.

  line(who, text = '', cls = '') {
    const li = document.createElement('li');
    li.className = `c-line is-${who} ${cls}`.trim();
    const label = document.createElement('span');
    label.className = 'c-who';
    // A telephone line gets a handset before the name, so it never reads as radio.
    label.textContent = (cls.includes('is-phone') ? '☎ ' : '') + (this.names[who] ?? who.toUpperCase());
    const body = document.createElement('span');
    body.className = 'c-said';
    body.textContent = text;
    li.append(label, body);
    this.list.append(li);
    this.scrollDown();
    return body;
  }

  scrollDown() {
    this.list.scrollTop = this.list.scrollHeight;
    this.edge();
  }

  /** The faded top edge shows only when there is something above to fade. */
  edge() {
    this.list.classList.toggle('is-scrolled', this.list.scrollTop > 1);
  }

  /**
   * A received transmission: the squelch opens, the words come in under a murmur. On the
   * telephone (`phone`) there is no squelch and no receive lamp. `broken`: the signal
   * dies before the end, and the line says so.
   */
  receive(who, text, voice = who, { phone = false, broken = false } = {}) {
    const body = this.line(who, '', phone ? 'is-phone' : '');
    if (!phone) {
      this.lamp('rx', true);
      this.sound.rx?.(true);
    }
    this.sound.duck?.(true);
    const stopVoice = this.sound.voice?.(text.length / HEAR_CPS, voice);
    // Turn off the channel halfway and the rest of the message is gone.
    const heard = () => phone || this.hears(this.working);
    return this.typeInto(body, text, HEAR_CPS, heard).then((lost) => {
      stopVoice?.();
      this.sound.duck?.(false);
      if (lost) body.parentElement.classList.add('is-lost');
      else if (broken) body.parentElement.classList.add('is-broken');
      if (!phone) {
        this.sound.rx?.(false);
        this.lamp('rx', false);
      }
      return { lost };
    });
  }

  /** Can the station hear channel `ch` now? 16 always, on the second receiver. */
  hears(ch) {
    return ch == null || ch === 16 || ch === this.channel;
  }

  /** Your own words on the telephone: they just appear, quickly. */
  say(who, text, { phone = false } = {}) {
    const body = this.line(who, '', phone ? 'is-phone' : '');
    return this.typeInto(body, text, 40);
  }

  /** Types `text` into `el`; resolves true if `heard()` turned false before the end. */
  typeInto(el, text, cps, heard = null) {
    return new Promise((resolve) => {
      let i = 0;
      const start = performance.now();
      const step = (now) => {
        if (heard && !heard()) {
          this.skip = null;
          resolve(true);
          return;
        }
        const want = Math.min(text.length, Math.floor(((now - start) / 1000) * cps));
        if (want !== i) {
          i = want;
          el.textContent = text.slice(0, i);
          this.scrollDown();
        }
        if (i < text.length) this.raf = requestAnimationFrame(step);
        else {
          this.skip = null;
          resolve();
        }
      };
      this.skip = () => {
        cancelAnimationFrame(this.raf);
        el.textContent = text;
        this.skip = null;
        this.scrollDown();
        resolve();
      };
      this.raf = requestAnimationFrame(step);
    });
  }

  /**
   * Microphone clicks with no voice: 'x' is a click, '.' a pause of 600 ms.
   * 'x x' is two clicks, 'x . . . x' one, a wait, and one more.
   */
  async clicks(pattern, who = 'kid') {
    const body = this.line(who, '', 'is-clicks');
    let shown = '';
    for (const tok of pattern.split(' ')) {
      if (tok === '.') {
        await wait(600);
        continue;
      }
      this.lamp('rx', true);
      this.sound.click?.();
      shown += (shown ? ' ' : '') + 'click';
      body.textContent = shown;
      body.classList.add('is-flash');
      await wait(110);
      this.lamp('rx', false);
      body.classList.remove('is-flash');
      await wait(260);
    }
    return body;
  }

  /**
   * Shows what you can say and resolves with the index picked. Each option is
   * { label } (the gist, kept short so it fits); the full words go out when you transmit.
   */
  choose(options, prompt = '') {
    this.choices.innerHTML = '';
    if (prompt) {
      const p = document.createElement('p');
      p.className = 'c-ask';
      p.textContent = prompt;
      this.choices.append(p);
    }
    this.screen.classList.add('has-choices');
    return new Promise((resolve) => {
      options.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'c-choice';
        b.textContent = o.label;
        b.style.setProperty('--i', i);
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sound.dialTick?.();
          this.choices.innerHTML = '';
          this.screen.classList.remove('has-choices');
          this.root.style.setProperty('--grow', '0px');
          resolve(i);
        });
        this.choices.append(b);
      });
      this.fit();
      this.scrollDown();
    });
  }

  /**
   * While choosing, the last message must stay readable (it is what you answer) and every
   * choice must be in reach. On a short phone the screen is too small for both, so the
   * console grows up over the picture until they fit, and goes back down after the pick.
   */
  fit() {
    const last = this.list.lastElementChild;
    // A little over the last message, so its first line clears the faded top edge.
    const logH = Math.max(last ? last.offsetHeight + 14 : 0, 60);
    this.screen.style.setProperty('--log-h', `${logH}px`);
    const box = getComputedStyle(this.choices);
    const kids = [...this.choices.children];
    const choicesH = kids.reduce((h, k) => h + k.offsetHeight, 0) + (parseFloat(box.rowGap) || 0) * (kids.length - 1) + parseFloat(box.paddingTop);
    const pad = parseFloat(getComputedStyle(this.screen).paddingTop) * 2;
    const grown = parseFloat(this.root.style.getPropertyValue('--grow')) || 0;
    const room = this.screen.clientHeight - grown;
    this.root.style.setProperty('--grow', `${Math.max(0, Math.ceil(logH + choicesH + pad - room))}px`);
  }

  /**
   * Arms the button with words and waits for them to go out. Resolves { cut: true } if the
   * button was let go before the end, so the story can have the other side ask again.
   */
  transmit(text, hint = 'Hold to talk. Let go when it is all said.') {
    this.ptt.classList.add('is-armed');
    return new Promise((resolve) => {
      this.armed = { text, hint, typed: 0, resolve, body: null, cps: Math.max(TALK_CPS, text.length / HOLD_MAX_S) };
      this.showWant();
      if (this.working != null && this.channel !== this.working) this.offHint();
      else this.hint(hint);
    });
  }

  wirePtt() {
    const p = this.ptt;
    const down = (e) => {
      if (this.down) return;
      this.down = true;
      e?.preventDefault?.();
      p.classList.add('is-down');
      this.sound.pttDown?.();
      this.lamp('tx', true);
      if (this.keyer) {
        this.keyer.start = performance.now();
        this.sound.toneOn?.();
        return;
      }
      const a = this.armed;
      if (!a) {
        // Pressed before a line is picked: say so, or the button just seems dead.
        if (this.choices.querySelector('.c-choice')) this.hint('First pick what to say, then hold.');
        return;
      }
      // Keyed on the wrong channel: it goes out to nobody, and the hint says where to go.
      if (this.working != null && this.channel !== this.working) {
        this.offHint();
        return;
      }
      this.hint('');
      a.body = this.line('you');
      a.startAt = performance.now();
      a.stopVoice = this.sound.voice?.(a.text.length / a.cps, 'you');
      const step = (now) => {
        if (!this.down || this.armed !== a) return;
        a.typed = Math.min(a.text.length, Math.floor(((now - a.startAt) / 1000) * a.cps));
        a.body.textContent = a.text.slice(0, a.typed);
        this.ring.style.strokeDashoffset = String(100 - (a.typed / a.text.length) * 100);
        this.scrollDown();
        if (a.typed < a.text.length) requestAnimationFrame(step);
        else p.classList.add('is-full');
      };
      requestAnimationFrame(step);
    };
    const up = () => {
      if (!this.down) return;
      this.down = false;
      p.classList.remove('is-down', 'is-full');
      this.lamp('tx', false);
      this.sound.pttUp?.();
      this.ring.style.strokeDashoffset = '100';
      if (this.keyer) {
        this.sound.toneOff?.();
        this.keyer.press(performance.now() - this.keyer.start);
        return;
      }
      const a = this.armed;
      if (!a || !a.body) return;
      a.stopVoice?.();
      const done = a.typed >= a.text.length;
      this.armed = null;
      this.showWant();
      p.classList.remove('is-armed');
      if (!done) {
        a.body.textContent = a.text.slice(0, a.typed);
        a.body.parentElement.classList.add('is-cut');
      }
      a.resolve({ cut: !done });
    };
    p.addEventListener('pointerdown', (e) => {
      p.setPointerCapture(e.pointerId);
      down(e);
    });
    p.addEventListener('pointerup', up);
    p.addEventListener('pointercancel', up);
    p.addEventListener('contextmenu', (e) => e.preventDefault());
    // Space works as the button on a keyboard.
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Space' || e.repeat || !this.root.classList.contains('is-shown')) return;
      e.preventDefault();
      down(e);
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') up();
    });
  }

  // Morse.

  /**
   * Plays a received message in Morse and has the player read the first `count` letters
   * from four choices; the rest the player "starts to hear" and they fill in by themselves.
   * Resolves with the decoded text.
   */
  async decode(text, { count = 1, unit = 110, who = 'kid' } = {}) {
    const panel = this.openPanel('decode');
    const slots = panel.querySelector('.d-word');
    const big = panel.querySelector('.d-big');
    const pick = panel.querySelector('.d-pick');
    const tip = panel.querySelector('.d-tip');
    const letters = text === 'SOS' ? ['SOS'] : [...text];
    // One box per letter, grouped by word, so a long message wraps between words.
    const words = text === 'SOS' ? [['SOS']] : text.split(' ').map((w) => [...w]);
    slots.innerHTML = words.map((w) => `<span class="d-w">${w.map(() => '<i></i>').join('')}</span>`).join('');
    const cells = [...slots.querySelectorAll('i')];
    this.fitPanel();
    let n = 0;
    let c = 0;
    for (const ch of letters) {
      if (ch === ' ') {
        await wait(unit * 7);
        continue;
      }
      const cell = cells[c++];
      const pattern = ch === 'SOS' ? SOS : MORSE[ch];
      cell.classList.add('is-now');
      big.textContent = '';
      await this.playPattern(pattern, unit, (shown) => (big.textContent = glyphs(shown)));
      if (n < count && ch !== 'SOS') {
        tip.textContent = n === 0 ? 'Short beep: dot. Long: dash. Which letter?' : 'And this one?';
        await this.pickLetter(pick, ch, tip);
        tip.textContent = '';
      } else {
        await wait(unit * 3);
      }
      cell.textContent = ch === 'SOS' ? 'SOS' : ch;
      cell.classList.remove('is-now');
      cell.classList.add('is-read');
      n += 1;
    }
    await wait(700);
    this.closePanel();
    const shown = text === 'SOS' ? 'SOS' : text;
    const body = this.line(who, shown, 'is-morse');
    body.title = text === 'SOS' ? glyphs(SOS) : [...text].map((c) => (c === ' ' ? '/' : glyphs(MORSE[c]))).join(' ');
    return text;
  }

  async playPattern(pattern, unit, onShow) {
    let shown = '';
    this.lamp('rx', true);
    this.sound.rx?.(true);
    for (const el of pattern) {
      this.sound.rxToneOn?.();
      shown += el;
      onShow(shown);
      await wait(el === '.' ? unit : unit * 3);
      this.sound.rxToneOff?.();
      await wait(unit);
    }
    this.sound.rx?.(false);
    this.lamp('rx', false);
  }

  pickLetter(pick, letter, tip) {
    pick.innerHTML = '';
    let wrong = 0;
    return new Promise((resolve) => {
      for (const ch of choicesFor(letter)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'd-letter';
        b.innerHTML = `<b>${ch}</b><small>${glyphs(MORSE[ch])}</small>`;
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          if (ch === letter) {
            this.sound.dialTick?.();
            b.classList.add('is-right');
            setTimeout(() => {
              pick.innerHTML = '';
              resolve();
            }, 380);
          } else {
            wrong += 1;
            b.classList.add('is-wrong');
            b.disabled = true;
            tip.textContent = `Not ${ch}. Find the dots and dashes you heard.`;
            if (wrong >= 2) [...pick.children].forEach((c) => c.textContent.startsWith(letter) && c.classList.add('is-hint'));
          }
        });
        pick.append(b);
      }
      this.fitPanel();
    });
  }

  /** Has the player send letters with the button: a tap is a dot, a hold a dash. */
  sendMorse(text, { hint = 'Tap for a dot, hold for a dash.' } = {}) {
    const panel = this.openPanel('key');
    const row = panel.querySelector('.k-row');
    const tip = panel.querySelector('.k-tip');
    tip.textContent = hint;
    const letters = [...text].filter((c) => c !== ' ');
    row.innerHTML = letters
      .map((c) => `<span class="k-letter"><b>${c}</b><span class="k-els">${[...MORSE[c]].map((el) => `<i class="${el === '.' ? 'dot' : 'dash'}"></i>`).join('')}</span></span>`)
      .join('');
    this.ptt.classList.add('is-key');
    this.hint('');
    let li = 0;
    let ei = 0;
    const mark = () => {
      [...row.children].forEach((L, i) => {
        L.classList.toggle('is-now', i === li);
        L.classList.toggle('is-done', i < li);
        [...L.querySelectorAll('i')].forEach((el, j) => el.classList.toggle('is-sent', i < li || (i === li && j < ei)));
      });
    };
    mark();
    return new Promise((resolve) => {
      this.keyer = {
        press: (ms) => {
          const got = ms < DOT_MAX_MS ? '.' : '-';
          const want = MORSE[letters[li]][ei];
          if (got !== want) {
            ei = 0;
            tip.textContent = want === '.' ? 'That was long. A dot is a quick tap.' : 'That was short. Hold a little for a dash.';
            row.children[li].classList.add('is-shake');
            setTimeout(() => row.children[li]?.classList.remove('is-shake'), 400);
            mark();
            return;
          }
          tip.textContent = hint;
          ei += 1;
          if (ei >= MORSE[letters[li]].length) {
            li += 1;
            ei = 0;
          }
          mark();
          if (li >= letters.length) {
            this.keyer = null;
            this.ptt.classList.remove('is-key');
            setTimeout(() => {
              this.closePanel();
              const body = this.line('you', text, 'is-morse');
              body.title = [...text].map((c) => (c === ' ' ? '/' : glyphs(MORSE[c]))).join(' ');
              resolve();
            }, 600);
          }
        },
      };
    });
  }

  openPanel(kind) {
    const tpl = document.getElementById(`tpl-${kind}`);
    this.panel.innerHTML = '';
    this.panel.append(tpl.content.cloneNode(true));
    this.panel.hidden = false;
    this.screen.classList.add('has-panel');
    return this.panel;
  }

  closePanel() {
    this.panel.hidden = true;
    this.panel.innerHTML = '';
    this.screen.classList.remove('has-panel');
    this.root.style.setProperty('--grow', '0px');
  }

  /** Like fit() for the decoder and the key: the console grows until the panel is all in view. */
  fitPanel() {
    const need = this.panel.scrollHeight + parseFloat(getComputedStyle(this.screen).paddingTop) * 2;
    const grown = parseFloat(this.root.style.getPropertyValue('--grow')) || 0;
    const room = this.screen.clientHeight - grown;
    this.root.style.setProperty('--grow', `${Math.max(0, Math.ceil(need - room))}px`);
  }
}

export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
