// main.js: entry point for the story menu (site/index.html).
//
// The page opens on a start screen with the title in the middle. The first tap starts the
// music (browsers only allow sound after a tap), the title moves up into place and the
// story cards come in. Page states are classes on <body>:
//   is-gate      before the first tap
//   is-entering  while the title moves and the cards come in
//   is-live      after that; the title letters react to the music

import { STORIES } from './stories.js';
import { startMusic } from './music.js';
import { splitTitle, nudgeLetter } from './title.js';
import { renderShelf } from './shelf.js';
import { grainTile } from './covers.js';
import { registerWorker, offerInstall } from './install.js';

const SOUND_KEY = 'wim.sound';
registerWorker();

const ENTER_MS = 1800; // how long is-entering lasts; matches the delays in menu.css

const body = document.body;
const title = document.querySelector('.title');
const lamp = document.querySelector('.lamp');
const gate = document.querySelector('.gate');
const soundButton = document.querySelector('.sound');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

let music = null;

document.documentElement.style.setProperty('--grain', `url(${grainTile()})`);
const letters = splitTitle(title);
renderShelf(document.querySelector('.shelf'), document.querySelector('.dots'), STORIES, {
  onLockedTap: () => music?.chime(),
});

setSoundButton(readSoundSetting());
gate.querySelector('.gate-hint').textContent = matchMedia('(pointer: coarse)').matches
  ? 'tap to start'
  : 'click to start';

// The title is hidden until its font has loaded, so the typed form never flashes in a
// fallback font. If the font is slow, show it anyway after a short wait.
Promise.race([document.fonts.ready, wait(2500)]).then(() => body.classList.add('is-ready'));

gate.addEventListener('click', start, { once: true });
// Enter or Space starts too, without having to move focus to the start button first.
document.addEventListener('keydown', (event) => {
  if (body.classList.contains('is-gate') && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    gate.click();
  }
});

soundButton.addEventListener('click', () => {
  const on = soundButton.getAttribute('aria-pressed') !== 'true';
  setSoundButton(on);
  saveSoundSetting(on);
  music?.setMuted(!on);
});

document.addEventListener('visibilitychange', () => {
  if (!music) return;
  if (document.hidden) music.pause();
  else music.resume();
});

function start() {
  // Inside the click handler on purpose: this is the user gesture that allows sound.
  music = startMusic({
    muted: soundButton.getAttribute('aria-pressed') !== 'true',
    onChord: (glow) => {
      lamp.style.opacity = String(glow);
    },
    onNote: () => {
      if (body.classList.contains('is-live') && !reduceMotion.matches) nudgeLetter(letters);
    },
  });
  enterMenu();
}

// Moves the title from the middle of the start screen to its place above the cards. The
// layout jumps at once; the animation only plays the jump back smoothly (FLIP: measure
// first, change, measure last, animate the difference).
function enterMenu() {
  const first = title.getBoundingClientRect();
  body.classList.remove('is-gate');
  body.classList.add('is-entering');
  document.querySelectorAll('[inert]').forEach((el) => {
    el.inert = false;
  });
  const last = title.getBoundingClientRect();

  if (!reduceMotion.matches) {
    title.animate(
      [
        { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` },
        { transform: 'none' },
      ],
      { duration: 1100, delay: 250, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'backwards' },
    );
  }

  setTimeout(() => {
    body.classList.replace('is-entering', 'is-live');
    offerInstall();
  }, ENTER_MS);
}

function setSoundButton(on) {
  soundButton.setAttribute('aria-pressed', String(on));
}

// The sound setting is remembered per browser. Storage can be blocked (private mode,
// strict settings), so every read and write is guarded and sound defaults to on.
function readSoundSetting() {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

function saveSoundSetting(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
  } catch {
    // Not saved; the setting still applies for this visit.
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
