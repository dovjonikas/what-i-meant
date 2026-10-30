// player.js: plays script.js beat by beat. It owns the input (a tap moves on, a held finger
// lets the years run or pedals the bike), the flags the player's choices set, the save
// point, and it tells the stage, the words, the phone, the life lines and the sound what
// to do for each beat. Beat types are listed at the top of script.js.

import { SCRIPT, CAST } from './script.js';
import { setName } from './fx.js';
import { matches, sleep } from './phone.js';

const SAVE_KEY = 'wim.text-me';

export class Player {
  constructor({ stage, captions, phone, lines, sound, ui }) {
    Object.assign(this, { stage, captions, phone, lines, sound, ui });
    this.flags = {};
    this.i = 0;
    this.act = null;
    this.next = null;
    this.downAt = 0;
    this.listen();
  }

  // Input. tap() gives every caller the same "next tap"; a tap only counts if the finger
  // went down after it was asked for, so lifting a finger held for the years does not
  // also skip the line that just appeared.
  listen() {
    const ignore = (e) => e.target.closest?.('button, a, .chip, .phone-send, .history');
    addEventListener('pointerdown', (e) => {
      if (ignore(e)) return;
      this.downAt = performance.now();
      this.setHolding(true);
    });
    const up = (e) => {
      this.setHolding(false);
      if (e.type === 'pointerup' && !ignore(e)) this.fire(this.downAt);
    };
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    addEventListener('keydown', (e) => {
      if (e.repeat || ignore(e) || !['Space', 'Enter', 'ArrowRight'].includes(e.code)) return;
      e.preventDefault();
      this.downAt = performance.now();
      this.setHolding(true);
    });
    addEventListener('keyup', (e) => {
      if (!['Space', 'Enter', 'ArrowRight'].includes(e.code) || ignore(e)) return;
      this.setHolding(false);
      this.fire(this.downAt);
    });
  }

  tap() {
    if (!this.next) {
      let resolve;
      const promise = new Promise((r) => (resolve = r));
      this.next = { promise, resolve, since: performance.now() };
    }
    return this.next.promise;
  }

  fire(downAt) {
    if (!this.next || downAt < this.next.since) return;
    const { resolve } = this.next;
    this.next = null;
    resolve();
  }

  setHolding(on) {
    this.holding = on;
    this.lines.setHolding(on);
    document.body.classList.toggle('is-holding', on);
  }

  // Saving: the beat to start from, the choices so far and the life lines.
  static saved() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY));
    } catch {
      return null;
    }
  }

  static forget() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Private mode: nothing was saved anyway.
    }
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        i: this.i, flags: this.flags, lines: this.lines.save(), scene: this.stage.id, act: this.act,
      }));
    } catch {
      // Storage full or blocked: the story still plays, it just will not resume.
    }
  }

  async start(saved) {
    if (saved) {
      this.i = saved.i;
      this.flags = saved.flags ?? {};
      if (this.flags.dog) setName('dog', this.flags.dog);
      this.lines.load(saved.lines);
      if (saved.scene) await this.stage.show(saved.scene, { instant: true });
      if (saved.act) this.music(saved.act);
    } else {
      this.lines.init(CAST);
    }
    while (this.i < SCRIPT.length) {
      const beat = SCRIPT[this.i];
      // A condition may sit on the beat or, by habit, inside its lines or phone spec.
      const cond = beat.if ?? beat.lines?.if ?? beat.phone?.if;
      if (!cond || matches(cond, this.flags)) {
        if (beat.save) this.save();
        await this.play(beat);
      }
      this.i += 1;
    }
  }

  async play(b) {
    const tap = () => this.tap();
    // Any beat can carry a sound of its own (the kettle, the light switch) and a cue for
    // the people in the picture: Mom stepping out of the house as the line says she does.
    if (b.sfx) this.sound?.[b.sfx]?.();
    if (b.act) this.stage.cue(b.act);
    if (b.chapter) return this.card('chapter', b.chapter);
    if (b.title) return this.card('title');
    if (b.end) return this.ending();
    if (b.scene) {
      // A line belongs to the picture it was said over; the "when" changes with the
      // picture, once the new one is in.
      this.captions.clear();
      const when = b.when ?? this.whenOf(b.scene);
      if (when !== this.ui.whenEl?.textContent) this.ui.when('');
      this.lines.show(false);
      if (b.music) this.music(b.music);
      const shown = this.stage.show(b.scene, { instant: b.instant, ms: b.ms });
      this.sound?.ambience(this.stage.scene?.ambience);
      if (b.push) this.stage.push(b.push, 14000);
      await shown;
      this.ui.when(when);
      return;
    }
    if (b.music) return this.music(b.music);
    if (b.say) return this.captions.say(this.fill(b.say), b.by, tap);
    if (b.wait) return sleep(b.wait);
    if (b.phone) return this.runPhone(b.phone);
    if (b.lines) return this.runLines(b.lines);
    if (b.choose) {
      this.captions.clear();
      const value = await this.ui.choose(b.options);
      this.flags[b.choose] = value;
      if (b.choose === 'dog') {
        setName('dog', value);
        this.lines.rename('dog', value);
        this.stage.cue('named');
      }
      return;
    }
    if (b.hold) return this.runHold(b.hold);
    if (b.now) return this.backToNow(b.now);
  }

  /** Puts the player's own choices into a line: {dog} is the dog's name. */
  fill(text) {
    return text.split('{dog}').join(this.flags.dog ?? 'Biscuit');
  }

  music(act) {
    this.act = act;
    this.sound?.music(act);
  }

  runPhone(spec) {
    this.captions.clear();
    return this.phone.run(spec, {
      flags: this.flags,
      tap: () => this.tap(),
      sfx: this.sound,
      music: (act) => this.music(act),
      note: (text) => (text ? this.captions.show(text) : this.captions.clear()),
      // Drops a waiting tap when the phone closed by itself, so a late tap does not skip
      // the line that comes next.
      untap: () => {
        this.next = null;
      },
    });
  }

  async runLines(seg) {
    // The last line goes with the picture it was said over, before the lines come in.
    this.captions.clear();
    this.ui.when('');
    if (seg.scene) {
      const shown = this.stage.show(seg.scene, { ms: 1200 });
      this.lines.setBackdrop(this.stage.scene);
      this.sound?.ambience(this.stage.scene?.ambience);
      await shown;
    }
    if (seg.music) this.music(seg.music);
    this.captions.clear();
    this.ui.when('');
    this.lines.show(true);
    await this.lines.run(seg, {
      say: (text, by) => this.captions.say(this.fill(text), by, () => this.tap()),
      phone: (spec) => this.runPhone(spec),
      music: (act) => this.music(act),
      pick: (spec, toggle) => {
        this.captions.clear();
        return this.ui.pick(spec, toggle);
      },
      hint: (text) => this.ui.hint(text),
      matches: (cond) => matches(cond, this.flags),
      flag: (key, value) => {
        this.flags[key] = value;
      },
    });
    this.captions.clear();
  }

  /** Hold to do something: the hint fills while the finger is down, then the scene moves on. */
  async runHold(h) {
    this.ui.hint(h.hint);
    let done = 0;
    let last = performance.now();
    let taps = this.downAt;
    await new Promise((resolve) => {
      const step = (now) => {
        if (this.holding) {
          done += now - last;
          this.sound?.step?.(done);
        }
        // Tapping works too, a step at a time, for anyone who cannot hold.
        if (this.downAt !== taps) {
          taps = this.downAt;
          done += h.ms * 0.08;
        }
        last = now;
        this.ui.progress(done / h.ms);
        this.stage.progress = Math.min(1, done / h.ms);
        if (done >= h.ms) resolve();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    this.ui.hint(null);
    if (h.scene) await this.stage.show(h.scene, { ms: 900 });
    else this.stage.progress = 1;
  }

  /**
   * Back to the present between the parts of the life: through dark to the porch, the
   * lock screen fades in with the time and your sent text, a clock ticks, maybe one line,
   * and after a tap (or a few seconds, when there is no line) it all fades back out.
   */
  /** When a scene happens, for the line at the top: the porch is now, the rest an age. */
  whenOf(id) {
    if (id.startsWith('porch')) return 'now';
    return this.lines.age > 0 ? `age ${Math.floor(this.lines.age + 1e-6)}` : '';
  }

  async backToNow(n) {
    this.captions.clear();
    this.ui.when('');
    this.lines.show(false);
    await this.ui.dim(true);
    this.music('frame');
    await this.stage.show(n.scene ?? 'porchLate', { instant: true });
    this.sound?.ambience(this.stage.scene?.ambience);
    this.sound?.clock?.(true);
    await this.ui.dim(false);
    await this.ui.lock(n);
    if (n.say) await this.captions.say(n.say, null, () => this.tap());
    else {
      await Promise.race([this.tap(), sleep(4200)]);
      this.next = null;
    }
    this.sound?.clock?.(false);
    this.captions.clear();
    await this.ui.unlock();
  }

  async card(kind, text) {
    this.captions.clear();
    this.ui.when('');
    await this.ui.card(kind, text);
    await this.tap();
    const next = this.ahead();
    // Card after card (the title, then the chapter): only the words change, the dark stays.
    if (next?.chapter || next?.title) return;
    // The next picture goes in under the card, so lifting it shows where the story is
    // going, not the porch it came from.
    const picture = next?.scene ?? next?.lines?.scene;
    if (picture) {
      this.lines.show(false);
      await this.stage.show(picture, { instant: true });
    }
    await this.ui.uncard();
  }

  /** The next beat that will play: conditions are checked the way start() checks them. */
  ahead() {
    for (let j = this.i + 1; j < SCRIPT.length; j += 1) {
      const beat = SCRIPT[j];
      const cond = beat.if ?? beat.lines?.if ?? beat.phone?.if;
      if (!cond || matches(cond, this.flags)) return beat;
    }
    return null;
  }

  async ending() {
    Player.forget();
    try {
      localStorage.setItem(`${SAVE_KEY}.done`, '1');
    } catch {
      // Nothing to remember it in; the ending still shows.
    }
    this.captions.clear();
    this.sound?.music('silence');
    await this.ui.card('end');
  }
}
