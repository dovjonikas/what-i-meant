// audio-test.js: renders each sound of audio.js and each act of score.js into an
// OfflineAudioContext and prints peak and RMS levels, so levels can be checked without
// listening. Run by audio-test.html; the results are also left in window.audioTest for a
// script to read. With ?live it also starts and stops everything many times on a live
// context (silent) and counts the sources still playing afterwards.

import { createAudio } from '../js/sound/audio.js';
import { createScore } from '../js/sound/score.js';
import { parseMorse } from '../js/sound/audio-radio.js';

const RATE = 44100;
const PLACES = ['room', 'fog', 'clear', 'storm', 'evening', 'drive', 'home', 'stairs'];
const ACT_NAMES = ['n1', 'n2', 'rescue', 'n3', 'storm', 'reveal', 'home', 'ending'];
// The speakers with something heard behind them; a voice itself makes no sound.
const VOICES = ['skipper', 'rescue'];

// Each test: what to render, for how long, and the part to measure. `at(t, fn)` runs fn at
// t seconds into the render, with the context's clock at t.
const TESTS = [
  ...PLACES.map((name) => ({ group: 'place', name, seconds: 30, from: 3, run: ({ a }) => (a.ambience(name), a.scheduleUntil(30)) })),
  {
    group: 'place',
    name: 'room, then storm at 4 s',
    seconds: 10,
    from: 3,
    run: ({ a, at }) => {
      a.ambience('room');
      a.scheduleUntil(10);
      at(4, () => (a.ambience('storm'), a.scheduleUntil(10)));
    },
  },
  { group: 'place', name: 'room, off at 3 s (5.5 s on)', seconds: 8, from: 5.5, silent: true, run: ({ a, at }) => (a.ambience('room'), at(3, () => a.ambience('off'))) },
  { group: 'weather', name: 'thunder 1', seconds: 9, run: ({ a }) => a.thunder(1) },
  { group: 'weather', name: 'thunder 0.5', seconds: 9, run: ({ a }) => a.thunder(0.5) },
  { group: 'weather', name: 'thunder 0.15', seconds: 9, run: ({ a }) => a.thunder(0.15) },
  { group: 'radio', name: 'rx open (hiss)', seconds: 2, from: 0.1, run: ({ a }) => a.rx(true) },
  { group: 'radio', name: 'rx close (tail)', seconds: 1, from: 0.49, run: ({ a, at }) => (a.rx(true), at(0.5, () => a.rx(false))) },
  { group: 'radio', name: 'static 1', seconds: 2, from: 0.2, run: ({ a }) => a.staticLevel(1) },
  { group: 'radio', name: 'static 0.35', seconds: 2, from: 0.2, run: ({ a }) => a.staticLevel(0.35) },
  { group: 'radio', name: 'click', seconds: 0.5, run: ({ a }) => a.click() },
  { group: 'radio', name: 'click click (yes)', seconds: 0.8, run: ({ a, at }) => (a.click(), at(0.25, () => a.click())) },
  ...VOICES.map((who) => ({ group: 'voice', name: `voice ${who}`, seconds: 6, run: ({ a }) => a.voice(5.5, who) })),
  { group: 'voice', name: 'voice skipper stopped at 1 s', seconds: 2, from: 1.1, silent: true, run: ({ a, at }) => { const stop = a.voice(5, 'skipper'); at(1, () => stop()); } },
  { group: 'voice', name: 'voice cape (nothing behind)', seconds: 2, silent: true, run: ({ a }) => a.voice(1.5, 'cape') },
  { group: 'morse', name: 'own key (toneOn/Off)', seconds: 1, run: ({ a, at }) => (a.toneOn(), at(0.6, () => a.toneOff())) },
  { group: 'morse', name: 'rx tone on/off', seconds: 1, run: ({ a, at }) => (a.rx(true), a.rxToneOn(), at(0.5, () => (a.rxToneOff(), a.rx(false)))) },
  { group: 'morse', name: "morse '.... ..'", seconds: 2.5, run: ({ a }) => a.morse('.... ..', 80) },
  { group: 'morse', name: "morse '---.. ---..' (88)", seconds: 3.5, run: ({ a }) => a.morse('---.. ---..', 60) },
  ...['dialTick', 'pttDown', 'paper', 'pin', 'note', 'lamp', 'door', 'keys', 'alert'].map((name) => ({ group: 'desk', name, seconds: 2.5, run: ({ a }) => a[name]() })),
  { group: 'desk', name: 'pttUp after 1 s talk', seconds: 1.6, from: 1, run: ({ a, at }) => (a.pttDown(), at(1, () => a.pttUp())) },
  { group: 'desk', name: 'pencil 1200', seconds: 1.5, run: ({ a }) => a.pencil(1200) },
  ...['deer', 'fawn', 'catMew', 'moth'].map((name) => ({ group: 'animal', name, seconds: 1.5, run: ({ a }) => a[name]() })),
  { group: 'animal', name: 'purr 3000', seconds: 3.5, run: ({ a }) => a.purr(3000) },
  { group: 'animal', name: 'purr stopped at 1 s', seconds: 2.5, from: 1.5, silent: true, run: ({ a, at }) => { const stop = a.purr(5000); at(1, () => stop()); } },
  ...ACT_NAMES.map((act) => ({ group: 'music', name: act, seconds: act === 'ending' ? 70 : 45, from: 4, run: ({ s }) => (s.play(act), s.scheduleUntil(70)) })),
  {
    group: 'music',
    name: 'n1 to n2 at 10 s',
    seconds: 20,
    from: 4,
    run: ({ s, at }) => {
      s.play('n1');
      s.scheduleUntil(10);
      at(10, () => (s.play('n2'), s.scheduleUntil(20)));
    },
  },
  {
    group: 'music',
    name: 'storm, reveal at 8 s',
    seconds: 16,
    from: 4,
    run: ({ s, at }) => {
      s.play('storm');
      s.scheduleUntil(8);
      at(8, () => (s.play('reveal'), s.scheduleUntil(16)));
    },
  },
  { group: 'music', name: 'n3, off at 6 s (16 s on)', seconds: 19, from: 16, silent: true, run: ({ s, at }) => (s.play('n3'), s.scheduleUntil(6), at(6, () => s.play('off'))) },
  {
    group: 'mix',
    name: 'n3 + rx + cape, ducked (9 to 13 s)',
    seconds: 14,
    from: 9,
    to: 13,
    run: ({ a, s, at }) => {
      s.play('n3');
      s.scheduleUntil(14);
      a.ambience('clear');
      a.scheduleUntil(14);
      at(8, () => (a.rx(true), a.duck(true), a.voice(5, 'cape')));
    },
  },
];

async function render(test) {
  const ctx = new OfflineAudioContext(2, Math.ceil(test.seconds * RATE), RATE);
  const out = ctx.createGain();
  out.connect(ctx.destination);
  const a = createAudio(ctx, out);
  const s = createScore(ctx, out);
  const at = (t, fn) => ctx.suspend(t).then(() => {
    fn();
    ctx.resume();
  });
  test.run({ a, s, at, ctx });
  const buffer = await ctx.startRendering();
  a.ambience('off');
  s.play('off');
  const m = measure(buffer, test.from ?? 0, test.to ?? test.seconds);
  return m;
}

const db = (power) => 10 * Math.log10(power || 1e-15);

// The Morse timing the radio uses, checked against hand-counted units.
function checkMorse() {
  const cases = [
    ['.... ..', 6, 13], // H: 7 units, letter gap 3, I: 3
    ['---.. ---..', 10, 33], // each 8 is 3+1+3+1+3+1+1+1+1 = 15, letter gap 3
    ['.. / ..', 4, 13], // word gap 7
    ['...---...', 9, 23], // SOS sent as one sign: 15 units of marks, 8 gaps
    ['', 0, 0],
  ];
  return cases
    .map(([p, marks, units]) => {
      const r = parseMorse(p);
      return r.marks.length === marks && r.units === units ? null : `'${p}': ${r.marks.length} marks, ${r.units} units (want ${marks}, ${units})`;
    })
    .filter(Boolean);
}

// Peak and RMS over [from, to], plus the RMS over 50 ms windows that are not silent
// ("active", how loud it is while it sounds) and the 95th percentile window ("loud", its
// loudest stretch), and "phone" (see phoneLevel), all in dBFS.
function measure(buffer, from, to) {
  const sr = buffer.sampleRate;
  const a = Math.floor(from * sr);
  const b = Math.min(buffer.length, Math.floor(to * sr));
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  const win = Math.floor(sr * 0.05);
  let peak = 0;
  let sum = 0;
  let count = 0;
  let bad = 0;
  const windows = [];
  for (let w = a; w < b; w += win) {
    let s = 0;
    let n = 0;
    for (let i = w; i < Math.min(b, w + win); i += 1) {
      for (const d of channels) {
        const x = d[i];
        if (!Number.isFinite(x)) {
          bad += 1;
          continue;
        }
        s += x * x;
        n += 1;
        peak = Math.max(peak, Math.abs(x));
      }
    }
    sum += s;
    count += n;
    if (n) windows.push(s / n);
  }
  const active = windows.filter((p) => db(p) > -70);
  const sorted = [...windows].sort((x, y) => x - y);
  return {
    peak: 20 * Math.log10(peak || 1e-15),
    rms: db(sum / (count || 1)),
    active: active.length ? db(active.reduce((x, y) => x + y, 0) / active.length) : -150,
    loud: db(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
    phone: phoneLevel(channels[0], sr, a, b),
    bad,
  };
}

// The RMS of what a phone speaker can play: the signal through two first-order 300 Hz
// highpass filters, a rough stand-in for a small speaker's low end.
function phoneLevel(d, sr, a, b) {
  const k = 1 / (1 + 2 * Math.PI * 300 / sr);
  let x1 = 0;
  let y1 = 0;
  let y2 = 0;
  let z1 = 0;
  let sum = 0;
  for (let i = a; i < b; i += 1) {
    const x = Number.isFinite(d[i]) ? d[i] : 0;
    const y = k * (y1 + x - x1);
    const z = k * (z1 + y - y2);
    x1 = x;
    y1 = y;
    y2 = y;
    z1 = z;
    sum += z * z;
  }
  return db(sum / Math.max(1, b - a));
}

// What each group should stay within, so a broken level stands out in red.
function warnings(test, m) {
  const w = [];
  if (m.bad) w.push(`${m.bad} bad samples`);
  if (test.silent) {
    if (m.peak > -80) w.push('should be silent');
    return w;
  }
  if (m.peak < -80) w.push('silent');
  if (m.peak > -3) w.push('peak over -3 dBFS');
  if (test.group === 'place' && m.loud > -26) w.push('place too loud');
  if (test.group === 'music' && m.loud > -18) w.push('music too loud');
  return w;
}

const fmt = (v) => (v <= -149 ? '-inf' : v.toFixed(1));

async function main() {
  const status = document.getElementById('status');
  const table = document.getElementById('levels');
  table.innerHTML = '<tr><th>group</th><th>sound</th><th>peak</th><th>rms</th><th>active</th><th>loud</th><th>phone</th><th>notes</th></tr>';
  const rows = [];
  const lines = [];
  // ?only=voice renders only the tests whose group or name contains "voice".
  const only = new URLSearchParams(location.search).get('only');
  for (const test of TESTS.filter((t) => !only || `${t.group} ${t.name}`.includes(only))) {
    status.textContent = `Rendering ${test.name}`;
    let m;
    let notes;
    try {
      m = await render(test);
      notes = warnings(test, m);
    } catch (error) {
      m = { peak: -150, rms: -150, active: -150, loud: -150, phone: -150, bad: 0 };
      notes = [`error: ${error.message}`];
    }
    rows.push({ group: test.group, name: test.name, ...m, notes });
    const tr = document.createElement('tr');
    if (notes.length) tr.className = 'warn';
    tr.innerHTML = `<td>${test.group}</td><td>${test.name}</td><td>${fmt(m.peak)}</td><td>${fmt(m.rms)}</td><td>${fmt(m.active)}</td><td>${fmt(m.loud)}</td><td>${fmt(m.phone)}</td><td>${notes.join('; ')}</td>`;
    table.append(tr);
    lines.push(`${test.group.padEnd(8)} ${test.name.padEnd(34)} peak ${fmt(m.peak).padStart(6)}  rms ${fmt(m.rms).padStart(6)}  active ${fmt(m.active).padStart(6)}  loud ${fmt(m.loud).padStart(6)}  phone ${fmt(m.phone).padStart(6)}  ${notes.join('; ')}`);
  }
  console.log(`[levels] dBFS\n${lines.join('\n')}`);
  const result = { rows, done: false };
  window.audioTest = result;
  result.errors = checkNoThrow();
  result.morse = checkMorse();
  console.log(`[morse] ${result.morse.length ? result.morse.join('; ') : 'timing ok'}`);
  if (new URLSearchParams(location.search).has('live')) {
    status.textContent = 'Live pile-up check (about a minute)';
    result.live = await livePileUp();
    console.log(`[live] ${JSON.stringify(result.live)}`);
  }
  status.textContent = `Done. ${rows.filter((r) => r.notes.length).length} rows with notes; ${result.errors.length} calls threw.`;
  result.done = true;
}

// Every call with odd arguments must not throw.
function checkNoThrow() {
  const ctx = new OfflineAudioContext(2, RATE, RATE);
  const a = createAudio(ctx, ctx.destination);
  const s = createScore(ctx, ctx.destination);
  const odd = [undefined, null, NaN, -5, 99, 'x', {}, true, 'toString', Infinity];
  const errors = [];
  for (const name of Object.keys(a)) {
    for (const v of odd) {
      try {
        const r = a[name](v, v);
        if (typeof r === 'function') r();
      } catch (error) {
        errors.push(`${name}(${String(v)}): ${error.message}`);
      }
    }
  }
  for (const v of odd) {
    try {
      s.play(v);
      s.duck(v);
    } catch (error) {
      errors.push(`score(${String(v)}): ${error.message}`);
    }
  }
  a.ambience('off');
  s.play('off');
  return errors;
}

// Starts and stops everything many times on a live context (output muted), then waits and
// counts the sources still playing and the intervals still running.
async function livePileUp() {
  const ctx = new AudioContext();
  await ctx.resume();
  if (ctx.state !== 'running') return { skipped: `context ${ctx.state}` };
  const counts = { started: 0, ended: 0, most: 0 };
  const start = AudioScheduledSourceNode.prototype.start;
  AudioScheduledSourceNode.prototype.start = function (...args) {
    if (this.context === ctx) {
      counts.started += 1;
      this.addEventListener('ended', () => (counts.ended += 1));
    }
    return start.apply(this, args);
  };
  const intervals = new Set();
  const setI = window.setInterval;
  const clearI = window.clearInterval;
  window.setInterval = (...args) => {
    const id = setI(...args);
    intervals.add(id);
    return id;
  };
  window.clearInterval = (id) => {
    intervals.delete(id);
    return clearI(id);
  };
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(ctx.destination);
  const a = createAudio(ctx, out);
  const s = createScore(ctx, out);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const playing = () => counts.started - counts.ended;
  // Normal play first: the busiest place and act, then the ending at its swell, each with a
  // voice on the radio.
  const steady = {};
  a.ambience('storm');
  s.play('storm');
  await wait(9000);
  a.rx(true);
  a.voice(3, 'skipper');
  await wait(1000);
  steady.storm = playing();
  a.rx(false);
  a.ambience('stairs');
  s.play('ending');
  await wait(21000);
  steady.ending = playing();
  for (let k = 0; k < 40; k += 1) {
    a.ambience(PLACES[k % PLACES.length]);
    s.play(ACT_NAMES[k % ACT_NAMES.length]);
    a.rx(k % 2 === 0);
    a.click();
    a.voice(0.6, VOICES[k % VOICES.length])();
    a.staticLevel(k % 3 ? 0.4 : 0);
    a.rxToneOn();
    a.rxToneOff();
    a.toneOn();
    a.toneOff();
    a.pttDown();
    a.pttUp();
    a.dialTick();
    if (k % 10 === 0) a.thunder(Math.random());
    if (k % 8 === 0) a.morse('..', 30);
    if (k % 5 === 0) (a.deer(), a.fawn(), a.catMew(), a.moth(), a.purr(400));
    counts.most = Math.max(counts.most, playing());
    await wait(120);
  }
  a.ambience('off');
  s.play('off');
  a.rx(false);
  a.staticLevel(0);
  const afterStop = playing();
  await wait(16000);
  const result = {
    started: counts.started,
    mostPlayingAtOnce: counts.most,
    playingAtStop: afterStop,
    playingAfter16s: playing(),
    playingInStorm: steady.storm,
    playingInEndingSwell: steady.ending,
    intervalsLeft: intervals.size,
  };
  AudioScheduledSourceNode.prototype.start = start;
  window.setInterval = setI;
  window.clearInterval = clearI;
  await ctx.close();
  return result;
}

// Buttons to hear each sound live, through the same ceiling the game uses (main.js).
function listen() {
  const box = document.getElementById('listen');
  let live = null;
  const sound = () => {
    if (live) return live;
    const ctx = new AudioContext();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.ratio.value = 20;
    limiter.connect(ctx.destination);
    live = { a: createAudio(ctx, limiter), s: createScore(ctx, limiter) };
    return live;
  };
  const row = (label, items) => {
    const p = document.createElement('p');
    p.append(`${label}: `);
    for (const [name, run] of items) {
      const b = document.createElement('button');
      b.textContent = name;
      b.addEventListener('click', () => run(sound()));
      p.append(b);
    }
    box.append(p);
  };
  row('place', [...PLACES, 'off'].map((n) => [n, ({ a }) => a.ambience(n)]));
  row('music', [...ACT_NAMES, 'off'].map((n) => [n, ({ s }) => s.play(n)]));
  row('voice', VOICES.map((who) => [who, ({ a }) => (a.rx(true), a.duck(true), setTimeout(() => (a.rx(false), a.duck(false)), 4100), a.voice(4, who))]));
  row('radio', [
    ['rx on', ({ a }) => a.rx(true)],
    ['rx off', ({ a }) => a.rx(false)],
    ['click', ({ a }) => a.click()],
    ['yes', ({ a }) => (a.click(), setTimeout(() => a.click(), 250))],
    ['static', ({ a }) => (a.staticLevel(0.35), setTimeout(() => a.staticLevel(0), 600))],
    ['morse 88', ({ a }) => a.morse('---.. ---..', 70)],
    ['key', ({ a }) => (a.pttDown(), a.toneOn(), setTimeout(() => (a.toneOff(), a.pttUp()), 300))],
    ['talk', ({ a }) => (a.pttDown(), a.voice(2, 'you'), setTimeout(() => a.pttUp(), 2100))],
    ['thunder', ({ a }) => a.thunder(Math.random())],
  ]);
  row('desk', ['dialTick', 'paper', 'pin', 'note', 'lamp', 'door', 'keys', 'alert'].map((n) => [n, ({ a }) => a[n]()]).concat([['pencil', ({ a }) => a.pencil(700)]]));
  row('animal', ['deer', 'fawn', 'catMew', 'moth'].map((n) => [n, ({ a }) => a[n]()]).concat([['purr', ({ a }) => a.purr(4000)]]));
}

listen();
main();
