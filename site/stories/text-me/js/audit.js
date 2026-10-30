// audit.js: checks that run while the story plays, when the page is opened with ?check.
// They watch for what a player would see as a glitch: words, buttons or the phone sticking
// out of the column or covering each other, and in the life lines names sitting on each
// other, names far from their dot, or names too faint to read on the sky behind them; and
// the words covering a person or the dog in the picture.
// Each problem is logged once as a console warning starting with "[check]", so a test run
// (or a person with the console open) can list them. Nothing here runs for players.

import { contrast } from './util.js';

const seen = new Set();
const since = new Map(); // when each cover was first seen; reported once it has lasted

function warn(message) {
  if (seen.has(message)) return;
  seen.add(message);
  console.warn(`[check] ${message}`);
}

export function startAudit(stage) {
  setInterval(() => {
    checkInterface();
    checkLines();
    checkCover(stage);
  }, 300);
}

/** The words on screen covering a good part of somebody in the scene. */
function checkCover(stage) {
  const now = new Set();
  const words = [...document.querySelectorAll('.captions .line:not(.is-gone) .word')];
  const done = () => {
    for (const k of [...since.keys()]) if (!now.has(k)) since.delete(k);
  };
  if (!words.length || !stage?.current || document.body.classList.contains('phone-open') || document.querySelector('.captions.is-moving')) return done();
  const rects = words.map((w) => w.getBoundingClientRect());
  const text = [Math.min(...rects.map((r) => r.left)), Math.min(...rects.map((r) => r.top)), Math.max(...rects.map((r) => r.right)), Math.max(...rects.map((r) => r.bottom))];
  if (document.querySelector('#lines.is-on')) return done();
  for (const { who, box, canvas, w } of stage.current.fx.bodies?.() ?? []) {
    const r = canvas.getBoundingClientRect();
    const k = r.width / w;
    const b = [r.left + box[0] * k, r.top + box[1] * k, r.left + box[2] * k, r.top + box[3] * k];
    const ox = Math.min(text[2], b[2]) - Math.max(text[0], b[0]);
    const oy = Math.min(text[3], b[3]) - Math.max(text[1], b[1]);
    const share = ox > 0 && oy > 0 ? (ox * oy) / ((b[2] - b[0]) * (b[3] - b[1])) : 0;
    const key = `${who} ${stage.id}`;
    if (share > 0.25) {
      now.add(key);
      if (!since.has(key)) since.set(key, performance.now());
      if (performance.now() - since.get(key) > 900) warn(`words cover ${who} in ${stage.id} (${Math.round(share * 100)}%): "${words.map((w) => w.textContent).join(' ').slice(0, 40)}"`);
    }
  }
  done();
}

function visible(el) {
  if (!el || el.closest('[hidden]')) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).opacity !== '0';
}

function moving() {
  return document.getAnimations().some((a) => a.playState === 'running' && a.effect?.target?.closest?.('.phone, .card, .gate'));
}

function checkInterface() {
  if (moving() || document.body.classList.contains('is-gate')) return;
  const column = document.querySelector('.column').getBoundingClientRect();
  const parts = [
    ['words', document.querySelector('.captions .line:not(.is-gone)')],
    ['hint', document.querySelector('.hint')],
    ['choices', document.querySelector('.choices')?.children.length ? document.querySelector('.choices') : null],
    ['phone', document.querySelector('.phone')],
  ].filter(([, el]) => visible(el));
  for (const [name, el] of parts) {
    const r = el.getBoundingClientRect();
    if (r.left < column.left - 0.5 || r.right > column.right + 0.5 || r.top < -0.5 || r.bottom > innerHeight + 0.5) {
      warn(`${name} sticks out of the column: ${Math.round(r.left)},${Math.round(r.top)} to ${Math.round(r.right)},${Math.round(r.bottom)}`);
    }
  }
  for (let i = 0; i < parts.length; i += 1) {
    for (let j = i + 1; j < parts.length; j += 1) {
      const a = parts[i][1].getBoundingClientRect();
      const b = parts[j][1].getBoundingClientRect();
      const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      const side = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      if (overlap > 2 && side > 2) warn(`${parts[i][0]} and ${parts[j][0]} overlap by ${Math.round(overlap)}px: "${(parts[i][1].textContent || '').slice(0, 40)}"`);
    }
  }
}

function checkLines() {
  const canvas = document.getElementById('lines');
  if (!canvas.classList.contains('is-on') || !canvas.layout) return;
  const { labels, colX, colW, age } = canvas.layout;
  // A flat name's box, or an upright one's: a narrow column standing on its foot.
  const box = (l) => (l.up ? [l.x - 7, l.y - l.w, l.x + 7, l.y] : [l.x - l.w / 2, l.y - 12, l.x + l.w / 2, l.y + 3]);
  for (const l of labels) {
    const [x0, , x1] = box(l);
    if (x0 < colX - 0.5 || x1 > colX + colW + 0.5) warn(`life lines: "${l.label}" sticks out of the column`);
    const edge = x0 - colX < 8 || colX + colW - x1 < 8;
    if (Math.abs(l.x - l.dot) > 40 && !edge) warn(`life lines: "${l.label}" is ${Math.round(Math.abs(l.x - l.dot))}px from its dot`);
    const c = contrast(l.fill, l.back);
    if (c < 3) warn(`life lines: "${l.label}" is hard to read (contrast ${c.toFixed(1)})`);
  }
  for (let i = 0; i < labels.length; i += 1) {
    for (let j = i + 1; j < labels.length; j += 1) {
      const a = box(labels[i]);
      const b = box(labels[j]);
      if (Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > 1 && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > 1) {
        warn(`life lines: "${labels[i].label}" and "${labels[j].label}" overlap`);
      }
    }
  }
  if (age && contrast(age.fill, age.back) < 3) warn(`life lines: the age is hard to read (contrast ${contrast(age.fill, age.back).toFixed(1)})`);
}
