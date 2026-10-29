// main.js: starts the story. It sets up the picture, the words, the phone and the life
// lines, shows the start screen over the porch at night, and on the first tap starts the
// sound (browsers only allow sound after a tap) and hands over to the player.

import { Stage } from './stage.js';
import { Lines } from './lines.js';
import { Captions } from './captions.js';
import { Phone } from './phone.js';
import { Ui } from './ui.js';
import { Player } from './player.js';
import { createScore } from './score.js';
import { createSfx } from './sfx.js';
import { registerWorker } from '../../../js/install.js';

const SOUND_KEY = 'wim.sound'; // shared with the menu, so the choice carries over

const stage = new Stage(document.getElementById('stage'));
const lines = new Lines(document.getElementById('lines'));
const column = document.querySelector('.column');
const captions = new Captions(column);
const phone = new Phone(column);
const ui = new Ui(column, document.querySelector('.card'));
const soundButton = document.querySelector('.sound');

registerWorker('../../');

// ?check turns on the glitch checks in audit.js (for testing; players never see them).
if (new URLSearchParams(location.search).has('check')) import('./audit.js').then((m) => m.startAudit());

const saved = Player.saved();
stage.show('porch', { instant: true });

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

async function begin(from) {
  audio = startAudio();
  document.body.classList.remove('is-gate');
  const player = new Player({ stage, captions, phone, lines, sound: audio, ui });
  await player.start(from);
}

/** Builds the sound: one output with a limiter, the music and the effects under it. */
function startAudio() {
  // On iPhone, Web Audio is silent with the ring switch off unless the page plays media.
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx({ latencyHint: 'playback' });
  ctx.resume();
  const out = ctx.createGain();
  out.gain.value = soundOn ? 1 : 0;
  // A ceiling only: it catches peaks and leaves the swells alone, since a swell is what makes
  // the ending land.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.2;
  out.connect(limiter).connect(ctx.destination);
  if (!soundOn) ctx.suspend();
  const score = createScore(ctx, out);
  const sfx = createSfx(ctx, out);
  return {
    ctx,
    out,
    music: (act) => score.play(act),
    ambience: (name) => sfx.ambience(name),
    buzz: () => sfx.buzz(),
    pop: () => sfx.pop(),
    whoosh: () => sfx.whoosh(),
    tick: () => sfx.tick(),
    step: (ms) => sfx.step(ms),
    clock: (on) => sfx.clock(on),
    kettle: () => sfx.kettle(),
    lightSwitch: () => sfx.lightSwitch(),
  };
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
