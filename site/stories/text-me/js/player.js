// player.js: plays script.js beat by beat. It owns the input (a tap moves on, a held finger
// lets the years run or pedals the bike), the flags the player's choices set, the save
// point, and it tells the stage, the words, the phone, the life lines and the sound what
// to do for each beat. Beat types are listed at the top of script.js.

import { SCRIPT, CAST } from './script.js';
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
    const ignore = (e) => e.target.closest?.('button, a, .chip, .phone-send');
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
      this.lines.load(saved.lines);
      if (saved.scene) await this.stage.show(saved.scene, { instant: true });
      if (saved.act) this.music(saved.act);
    } else {
      this.lines.init(CAST);
    }
    while (this.i < SCRIPT.length) {
      const beat = SCRIPT[this.i];
      if (!beat.if || matches(beat.if, this.flags)) {
        if (beat.save) this.save();
        await this.play(beat);
      }
      this.i += 1;
    }
  }

  async play(b) {
    const tap = () => this.tap();
    if (b.chapter) return this.card('chapter', b.chapter);
    if (b.title) return this.card('title');
    if (b.end) return this.ending();
    if (b.scene) {
      this.lines.show(false);
      if (b.music) this.music(b.music);
      const shown = this.stage.show(b.scene, { instant: b.instant, ms: b.ms });
      this.sound?.ambience(this.stage.scene?.ambience);
      if (b.push) this.stage.push(b.push, 14000);
      await shown;
      return;
    }
    if (b.music) return this.music(b.music);
    if (b.say) return this.captions.say(b.say, b.by, tap);
    if (b.wait) return sleep(b.wait);
    if (b.phone) return this.runPhone(b.phone);
    if (b.lines) return this.runLines(b.lines);
    if (b.choose) {
      const value = await this.ui.choose(b.options);
      this.flags[b.choose] = value;
      return;
    }
    if (b.hold) return this.runHold(b.hold);
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
    });
  }

  async runLines(seg) {
    if (seg.scene) {
      const shown = this.stage.show(seg.scene, { ms: 1200 });
      this.sound?.ambience(this.stage.scene?.ambience);
      await shown;
    }
    if (seg.music) this.music(seg.music);
    this.captions.clear();
    this.lines.show(true);
    await this.lines.run(seg, {
      say: (text) => this.captions.say(text, null, () => this.tap()),
      phone: (spec) => this.runPhone(spec),
      music: (act) => this.music(act),
      pick: (spec) => this.ui.pick(spec),
      hint: (text) => this.ui.hint(text),
    });
    this.captions.clear();
  }

  /** Hold to do something: the hint fills while the finger is down, then the scene moves on. */
  async runHold(h) {
    this.ui.hint(h.hint);
    let done = 0;
    let last = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        if (this.holding) {
          done += now - last;
          this.sound?.step?.(done);
        }
        last = now;
        this.ui.progress(done / h.ms);
        if (done >= h.ms) resolve();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    this.ui.hint(null);
    if (h.scene) await this.stage.show(h.scene, { ms: 900 });
  }

  async card(kind, text) {
    this.captions.clear();
    await this.ui.card(kind, text);
    await this.tap();
    await this.ui.uncard();
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
