// player.js: plays script.js beat by beat. A beat is a small object; its keys say what it
// does (see the top of script.js for the list). Choices are kept as flags, and any beat
// with `if` only plays when the flags match. The place is saved at each night's label and
// at a few labels inside a night, so the start screen can offer to continue near it.

import { wait } from './ui.js';

const SAVE_KEY = 'wim.say-again';
const NAMES = { cape: 'CAPE', skipper: 'SEAGULL', rescue: 'RESCUE 1', pilot: 'PILOT', you: 'YOU' };

export class Player {
  constructor({ script, stage, radio, chart, notes, ui, sound, music }) {
    Object.assign(this, { script, stage, radio, chart, notes, ui, sound, music });
    this.flags = {};
    this.cuts = 0;
    this.radio.names = { ...NAMES, kid: 'CH16 ?' };
    // The kitchen names the speakers the way the radio screen does.
    this.ui.names = this.radio.names;
  }

  static saved() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return s && s.label ? s : null;
    } catch {
      return null;
    }
  }

  static forget() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Nothing saved, nothing to forget.
    }
  }

  save(label) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ label, flags: this.flags, notes: this.notes.toJSON() }));
    } catch {
      // Private browsing: the story just starts from the top next time.
    }
  }

  async start(from) {
    let at = 0;
    if (from) {
      this.flags = { ...from.flags };
      this.notes.restore(from.notes);
      at = Math.max(0, this.script.findIndex((b) => b.label === from.label));
      if (this.flags.cs) this.radio.names.kid = this.flags.cs.toUpperCase();
      if (this.script[at]?.mid) this.restore(at);
    }
    await this.run(this.script.slice(at));
  }

  /**
   * Continuing from the middle of a night (a label with `mid`): sets the picture, the
   * channel and the sound as the beats before the label left them, without playing them.
   */
  restore(at) {
    const { stage, radio } = this;
    let i = at;
    while (i > 0 && !this.script[i].scene) i -= 1;
    let music = null;
    let ambience = null;
    for (const b of this.script.slice(i, at)) {
      if (b.if && !this.matches(b.if)) continue;
      if (b.scene) {
        stage.show(b.scene, b.s ?? {}, { instant: true });
        radio.show(b.scene === 'room');
        radio.reset();
        if (b.channel) radio.setChannel(b.channel, { silent: true });
        radio.working = b.channel ?? null;
      }
      if (b.clock) stage.set({ clock: b.clock });
      if (b.state) stage.set(b.state);
      if (b.tween) stage.set({ [b.tween[0]]: b.tween[1] });
      if (b.tune) {
        radio.setChannel(b.tune, { silent: true });
        radio.working = b.tune;
      }
      if (b.music) music = b.music;
      if (b.ambience) ambience = b.ambience;
    }
    if (ambience) this.sound.ambience?.(ambience);
    if (music) this.music?.play(music);
  }

  async run(beats) {
    for (const b of beats) {
      if (b.if && !this.matches(b.if)) continue;
      // Reading the notes holds the story between beats, so nothing new comes in unseen.
      await this.notes.closed();
      await this.beat(b);
    }
  }

  matches(cond) {
    return Object.entries(cond).every(([k, v]) => this.flags[k] === v);
  }

  /** Fills in the call sign the player chose for the kid. */
  fill(text = '') {
    const cs = this.flags.cs ?? 'Sparrow';
    return text.replaceAll('{cs}', cs).replaceAll('{CS}', cs.toUpperCase());
  }

  async beat(b) {
    const { stage, radio, ui, sound } = this;
    if ('label' in b) {
      if (b.save) this.save(b.label);
      return;
    }
    if (b.card) return ui.card(b.card, b.sub);
    if (b.scene) {
      stage.show(b.scene, b.s ?? {});
      radio.show(b.scene === 'room');
      // Every shift starts on a clean screen.
      if (b.scene === 'room') radio.reset();
      if (b.scene !== 'room') ui.hideWords();
      else ui.words.hidden = true;
      if (b.ambience) sound.ambience?.(b.ambience);
      if (b.music) this.music?.play(b.music);
      if (b.channel) radio.setChannel(b.channel, { silent: true });
      radio.working = b.channel ?? null;
      return;
    }
    if (b.music) return this.music?.play(b.music);
    if (b.ambience) return sound.ambience?.(b.ambience);
    if (b.set) return Object.assign(this.flags, b.set);
    if (b.clock) return stage.set({ clock: b.clock });
    if (b.state) return stage.set(b.state);
    if (b.tween) {
      const [key, to, ms] = b.tween;
      const p = stage.tween(key, to, ms);
      if (!b.nowait) await p;
      return;
    }
    if ('wait' in b) return wait(b.wait);
    if ('hint' in b) return radio.hint(this.fill(b.hint));
    if (b.note) {
      const [id, title, body] = b.note;
      await this.notes.add(id, title, body);
      return wait(300);
    }
    if (b.rx) return this.rx(b);
    if (b.clicks) {
      await this.onAir(b.ch, b.from ?? 'kid');
      const df = b.df != null ? radio.df(b.df) : null;
      await radio.clicks(b.clicks, b.from ?? 'kid');
      if (df) await df;
      return wait(700);
    }
    if (b.phone) {
      const text = this.fill(b.text);
      await radio.receive(b.phone, text, b.phone, { phone: true });
      return wait(Math.max(800, text.length * 16));
    }
    if (b.call) return this.call(b);
    if (b.carrier) return this.carrier(b);
    if (b.say) return this.say(b);
    if (b.ask) return this.ask(b.ask);
    if (b.tune) {
      await radio.tuneTo(b.tune, b.hint ? this.fill(b.hint) : undefined);
      radio.working = b.tune;
      return wait(500);
    }
    if (b.morse) {
      if (b.alert) sound.alert?.();
      // The decoder covers the screen, so the last line gets a moment to be read first.
      await wait(900);
      await this.onAir(undefined, 'kid');
      await radio.decode(b.morse, { count: b.count ?? 0, unit: b.unit ?? 110 });
      return wait(800);
    }
    if (b.key) {
      radio.hint('');
      await radio.sendMorse(b.key, { hint: b.keyHint });
      return wait(800);
    }
    if (b.chart) return this.plot(b);
    if (b.lamp) return this.lamp(b.lamp);
    if (b.alert) return sound.alert?.();
    if (b.callsign) {
      radio.names.kid = this.fill('{CS}');
      return;
    }
    if (b.line) return ui.line(this.fill(b.line), b.who, { tap: b.tap !== false });
    if (b.pick) return this.pick(b);
    if (b.hold) {
      await ui.hold(this.fill(b.hold), b.hint ?? 'Hold the button', b.hand ? (k) => stage.set({ hand: k }) : null);
      return wait(600);
    }
    if (b.paper) return ui.paper(this.fill(b.paper));
    if (b.tap) return ui.tapToGo();
    if (b.end) {
      Player.forget();
      // The radio and its notes go down for the end card, so nothing opens under the title.
      this.notes.close();
      radio.show(false);
      return ui.end();
    }
    console.warn('Unknown beat', b);
  }

  /** A received transmission, then time to read it. */
  async rx(b) {
    const text = this.fill(b.text);
    for (;;) {
      await this.onAir(undefined, b.rx);
      const df = b.df != null ? this.radio.df(b.df) : null;
      const { lost } = await this.radio.receive(b.rx, text, b.voice);
      if (df) await df;
      if (!lost) break;
      // Turned off the channel halfway: back on it, ask for the message again, as on any radio.
      await wait(600);
      await this.onAir(undefined, b.rx);
      await this.transmit('Say again. Over.', b.rx, 'You missed the end. Ask them to say again: hold.');
      await this.notes.add('sayagain', 'SAY AGAIN', 'Missed the end of a message, or let go of the button too early? Ask SAY AGAIN and the whole message comes again. Army radio never says "repeat": on a gun net it means fire again.');
      await wait(700);
    }
    await wait(b.after ?? Math.max(800, text.length * 16));
  }

  /**
   * Waits until the radio hears `ch` (the conversation's channel unless given). Off it, the
   * story waits and the hint says where to turn back to, so wandering off loses nothing.
   */
  async onAir(ch = this.radio.working, who = '') {
    if (this.radio.hears(ch)) return;
    const name = this.speaker(who);
    await this.radio.tuneTo(ch, `Nothing on ${this.radio.channel}. ${name} ${name === 'They' ? 'are' : 'is'} on ${ch}: turn back to it.`);
  }

  /** How a hint names whoever is calling. */
  speaker(who) {
    if (who === 'kid') return this.flags.cs ?? 'The caller';
    return { cape: 'Cape', skipper: 'Seagull', rescue: 'Rescue One', pilot: 'The pilot station' }[who] ?? 'They';
  }

  /** The button held down with no voice: enough for the direction finder. */
  async carrier(b) {
    await this.onAir(undefined, b.from ?? 'kid');
    this.radio.lamp('rx', true);
    this.sound.rx?.(true);
    const body = this.radio.line(b.from ?? 'kid', 'carrier, no voice', 'is-clicks');
    const df = b.df != null ? this.radio.df(b.df) : Promise.resolve();
    await Promise.all([df, wait(b.carrier)]);
    this.sound.rx?.(false);
    this.radio.lamp('rx', false);
    body.textContent = 'carrier, no voice';
    await wait(700);
  }

  /** Choose what to say, then hold the button while it goes out. */
  async say(b) {
    let opts = b.say.filter((o) => !o.if || this.matches(o.if));
    for (;;) {
      const i = await this.radio.choose(opts.map((o) => ({ label: this.fill(o.label) })), this.fill(b.prompt ?? ''));
      const o = opts[i];
      await this.transmit(this.fill(o.text), o.to ?? b.to ?? 'kid');
      if (o.set) Object.assign(this.flags, o.set);
      if (o.callsign) this.radio.names.kid = this.fill('{CS}');
      if (o.then) await this.run(o.then);
      if (o.retry) {
        opts = opts.filter((x) => x !== o);
        continue;
      }
      break;
    }
    await wait(b.after ?? 500);
  }

  /** Says something on the telephone: pick it, and it appears; no button to hold. */
  async call(b) {
    const opts = b.call.filter((o) => !o.if || this.matches(o.if));
    const i = await this.radio.choose(opts.map((o) => ({ label: this.fill(o.label) })), this.fill(b.prompt ?? ''));
    await this.radio.say('you', this.fill(opts[i].text), { phone: true });
    await wait(700);
  }

  /** Sends words; if the button was let go too early, the other side asks for them again. */
  async transmit(text, to, hint) {
    for (;;) {
      const r = await this.radio.transmit(text, hint);
      if (!r.cut) return;
      await wait(700);
      this.cuts += 1;
      if (to === 'all') this.radio.hint('Cut off. Nobody heard the end. Again, all of it.');
      else if (to === 'kid') await this.radio.decode('?', { count: 0, unit: 90 });
      else await this.radio.receive(to, to === 'cape' ? 'Dune, Cape. Say again. Over.' : 'Dune, say again. Over.');
      if (this.cuts === 1) {
        await this.notes.add('sayagain', 'SAY AGAIN', 'Missed the end of a message, or let go of the button too early? Ask SAY AGAIN and the whole message comes again. Army radio never says "repeat": on a gun net it means fire again.');
        await wait(2400);
      }
    }
  }

  /** A round of yes or no questions, answered in clicks. */
  async ask(a) {
    const asked = new Set();
    let n = 0;
    while (n < a.until || (a.must && !asked.has(a.must))) {
      let avail = a.qs.filter((q) => !asked.has(q.id) && (!q.need || asked.has(q.need)));
      if (a.must && !asked.has(a.must) && n >= a.until - 1) avail = a.qs.filter((q) => q.id === a.must);
      if (!avail.length) break;
      const q = avail[await this.radio.choose(avail.map((x) => ({ label: this.fill(x.label) })), this.fill(n === 0 ? a.prompt ?? '' : ''))];
      await this.transmit(this.fill(q.text), a.to ?? 'kid');
      await wait(q.delay ?? 600);
      await this.onAir(undefined, a.from ?? 'kid');
      await this.radio.clicks(q.a, a.from ?? 'kid');
      asked.add(q.id);
      n += 1;
      if (q.set) Object.assign(this.flags, q.set);
      if (q.then) await this.run(q.then);
      await wait(800);
    }
  }

  async plot(b) {
    const c = b.chart;
    this.radio.hint('');
    // The chart covers the radio: the last line gets a moment to be read first.
    await wait(1400);
    await this.chart.run({ ...c, intro: this.fill(c.intro ?? '') });
    await wait(600);
  }

  /** Blink the desk lamp `times` times by tapping it; a window in town answers. */
  async lamp(times) {
    const { stage, radio, sound } = this;
    // One tap is one blink, so the hint says how many, and counts down; otherwise the first
    // blink looks like the whole job and the player waits.
    const count = ['', 'once', 'twice', 'three times'][times] ?? `${times} times`;
    radio.hint(`Tap the desk lamp to blink it ${count}.`);
    for (let i = 0; i < times; i++) {
      await Promise.race([stage.waitTap('lamp'), radio.hintTap()]);
      sound.lamp?.();
      stage.set({ lamp: 0 });
      await wait(420);
      sound.lamp?.();
      stage.set({ lamp: 1 });
      const left = times - i - 1;
      if (left) radio.hint(left === 1 ? 'Once more: tap the lamp.' : `${left} more: tap the lamp.`);
      await wait(260);
    }
    radio.hint('');
    await wait(1600);
    for (let i = 0; i < times; i++) {
      stage.set({ kid: 1 });
      await wait(420);
      stage.set({ kid: 0 });
      await wait(380);
    }
    stage.set({ kid: 0.35 });
    await wait(900);
  }

  async pick(b) {
    let opts = b.pick.filter((o) => !o.if || this.matches(o.if));
    let left = b.until ?? 1;
    while (left > 0 && opts.length) {
      const i = await this.ui.pick(opts.map((o) => this.fill(o.label)));
      const o = opts[i];
      if (o.text) await this.ui.line(this.fill(o.text), 'you');
      if (o.set) Object.assign(this.flags, o.set);
      if (o.then) await this.run(o.then);
      opts = opts.filter((x) => x !== o);
      left -= 1;
    }
  }
}
