// main.js: starts "Say Again". It builds the picture, the radio, the chart, the notes and
// the words, shows the start screen over the station at night, and on the first tap starts
// the sound (browsers only allow sound after a tap) and hands over to the player.

import { Stage, plainPaint } from './stage.js';
import { Console } from './radio/console.js';
import { Chart } from './chart/chart.js';
import { Notes } from './radio/notes.js';
import { Ui } from './ui.js';
import { Player } from './player.js';
import { SCRIPT } from './script.js';
import { registerWorker, offerInstall, closeInstall } from '../../../js/install.js';

const SOUND_KEY = 'wim.sound'; // shared with the menu, so the choice carries over

// Every sound call goes through this, so the story plays the same before the sound has
// started, with the sound off, or if the sound files failed to load.
// The music ducks under the radio as well as the effects, so 'duck' goes to both.
let score = null;
const sound = new Proxy({}, {
  get: (t, name) => (...args) => {
    if (name === 'duck') score?.duck?.(...args);
    return t.impl?.[name]?.(...args);
  },
});
const music = { play: (act) => score?.play(act) };
const silent = new Proxy({}, { get: () => () => {} });

const art = await import('./art/art.js').catch((err) => {
  console.error(err);
  return { paint: plainPaint };
});

const stage = new Stage(document.getElementById('stage'), art.paint, sound);
const radio = new Console(document.querySelector('.console'), sound);
// The cat on the desk turns its ears when the radio is receiving.
radio.onRx = (on) => stage.set({ rx: on });
const chart = new Chart(document.querySelector('.chart'), sound);
const notes = new Notes(document.querySelector('.c-notes'), document.querySelector('.notes'), sound);
const ui = new Ui(document.querySelector('.column'), document.querySelector('.card'), sound);
const soundButton = document.querySelector('.sound');

registerWorker('../../');
offerInstall('../../', () => document.body.classList.contains('is-gate'));

stage.show('room', { mood: 'calm', clock: '02:51', lamp: 1, town: 1, kid: 0 }, { instant: true });

const saved = Player.saved();
const startButton = document.querySelector('.gate-start');
const overButton = document.querySelector('.gate-over');
if (saved) {
  startButton.textContent = 'Continue';
  overButton.hidden = false;
}
startButton.addEventListener('click', () => begin(saved));
overButton.addEventListener('click', () => {
  Player.forget();
  begin(null);
});

let soundOn = readSound();
soundButton.setAttribute('aria-pressed', String(soundOn));
let audio = null;

// ?check is for testing (players never see it): the parts go on window.__say so a script
// can play the story through, and ?at=n3 starts at a night's label.
const params = new URLSearchParams(location.search);
const checking = params.has('check');

async function begin(from) {
  closeInstall();
  document.body.classList.remove('is-gate');
  audio = await startAudio();
  const player = new Player({ script: SCRIPT, stage, radio, chart, notes, ui, sound, music });
  // A touched animal answers, and the story remembers it (the kitchen can come back to it).
  stage.toys((name) => {
    if (name === 'fawn') sound.fawn();
    else if (name === 'deer') sound.deer();
    else if (name === 'cat') sound.purr(2600);
    player.flags[`saw_${name}`] = true;
  });
  if (checking) {
    window.__say = { stage, radio, chart, notes, ui, player };
    if (params.get('at')) from = { label: params.get('at'), flags: { cs: params.get('cs') ?? 'Sparrow', n1end: 'over' }, notes: [] };
  }
  await player.start(from);
}

/** Builds the sound: one output with a ceiling, the effects and the music under it. */
async function startAudio() {
  // On iPhone, Web Audio is silent with the ring switch off unless the page plays media.
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx({ latencyHint: 'interactive' });
  ctx.resume();
  const out = ctx.createGain();
  out.gain.value = soundOn ? 1 : 0;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.2;
  out.connect(limiter).connect(ctx.destination);
  if (!soundOn) ctx.suspend();
  try {
    const [{ createAudio }, { createScore }] = await Promise.all([import('./sound/audio.js'), import('./sound/score.js')]);
    const fx = createAudio(ctx, out);
    score = createScore(ctx, out);
    sound.impl = fx;
  } catch (err) {
    console.error(err);
    sound.impl = silent;
  }
  return { ctx, out };
}

soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  soundButton.setAttribute('aria-pressed', String(soundOn));
  try {
    localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off');
  } catch {
    // The setting just will not be remembered.
  }
  if (!audio) return;
  const now = audio.ctx.currentTime;
  audio.out.gain.cancelScheduledValues(now);
  audio.out.gain.setValueAtTime(audio.out.gain.value, now);
  audio.out.gain.linearRampToValueAtTime(soundOn ? 1 : 0, now + 0.5);
  if (soundOn) audio.ctx.resume();
  else setTimeout(() => !soundOn && audio.ctx.suspend(), 600);
});

// Sound stops while the page is hidden and comes back with it.
document.addEventListener('visibilitychange', () => {
  if (!audio) return;
  if (document.hidden) audio.ctx.suspend();
  else if (soundOn) audio.ctx.resume();
});

function readSound() {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}
