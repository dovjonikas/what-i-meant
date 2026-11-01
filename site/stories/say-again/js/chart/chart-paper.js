// chart-paper.js: draws the paper chart of the bay the way a real nautical chart is laid
// out: a title in the top margin, a neat line with the latitude and longitude scale round
// the map, depths in metres with a 5 m and a 10 m contour, a compass rose with a true and a
// magnetic ring, a scale bar in nautical miles, the harbour with its moles and IALA region A
// buoys (red to port, green to starboard going in). chart.js draws the pencil on top.

import { STATIONS, MAINLAND, SPIT, TOWN, dir } from './geo.js';
import { placeName } from './chart-place.js';

const INK = '#2f3e47';
const SEA = '#cddfdb';
const SHALLOW = '#bcd5d1';
const LAND = '#eadcb9';
const PAPER = '#efe5cb';

// Where the map sits on the Earth: a made-up lagoon on the real Baltic shore. 100 map
// units are one nautical mile, which is one minute of latitude; a minute of longitude is
// shorter by cos(latitude).
const TOP_LAT = 55 * 60 + 47.5; // minutes, at map y = 0
const LEFT_LON = 21 * 60 + 2; // minutes, at map x = 0
const LON_UNITS = 100 * Math.cos((55.7 * Math.PI) / 180);
const VARIATION = 7.5; // degrees east, 2026, close to the real value on that coast

// Depths in metres, and the 5 m and 10 m contours drawn by hand along the shores.
const SOUNDINGS = [
  [330, 300, '4'], [400, 470, '5'], [540, 500, '6'], [590, 410, '5'], [340, 600, '4'],
  [600, 690, '3'], [330, 900, '2'], [610, 300, '4'], [470, 220, '5'], [610, 600, '5'],
  [165, 300, '18'], [172, 720, '21'], [175, 880, '16'], [160, 150, '14'],
];
const CONTOURS = [
  { depth: 5, pts: [[332, 980], [320, 880], [312, 760], [306, 640], [300, 500], [289, 360], [272, 220], [252, 110], [236, 70]] },
  { depth: 5, pts: [[738, 30], [714, 116], [690, 168], [650, 212], [640, 250], [684, 285], [656, 378], [636, 470], [644, 548], [628, 640], [598, 748], [528, 828], [458, 856], [390, 892], [338, 924]] },
  { depth: 10, label: 3, pts: [[120, 1000], [136, 900], [144, 760], [152, 640], [144, 500], [130, 360], [114, 220], [104, 110], [110, 30]] },
];
const HARBOUR = {
  moles: [[[692, 548], [662, 551]], [[690, 586], [664, 579]]],
  red: [652, 552], // port hand, to the left when going in eastward
  green: [654, 577], // starboard hand
};

/**
 * Paints the chart into `g` (CSS pixels, already scaled for the screen).
 * `map` is the rectangle the map fills on the canvas: { x, y, w, h }.
 * `X`, `Y` turn map units into pixels, `s` is pixels per map unit. Returns the words on
 * the map, for writeWords.
 */
export function paintChart(g, w, h, { X, Y, s, map, zoomed, lines = [] }) {
  collected = [];
  // What names must keep off: the pencil lines, and (filled in below) houses and names.
  const avoid = {
    segments: lines.map((l) => {
      const st = STATIONS[l.from];
      const d = dir(l.brg);
      return [{ x: X(st.x), y: Y(st.y) }, { x: X(st.x + d.x * 2000), y: Y(st.y + d.y * 2000) }];
    }),
    boxes: [],
  };
  g.fillStyle = PAPER;
  g.fillRect(0, 0, w, h);

  g.save();
  g.beginPath();
  g.rect(map.x, map.y, map.w, map.h);
  g.clip();
  g.fillStyle = SEA;
  g.fillRect(map.x, map.y, map.w, map.h);

  const poly = (pts) => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
    g.closePath();
  };
  // Shallows: the land drawn thick in a deeper tint first, so a band follows the shore.
  g.lineJoin = 'round';
  for (const [width, colour] of [[46, SHALLOW], [22, '#b2cfcb']]) {
    g.strokeStyle = colour;
    g.lineWidth = width * s;
    for (const shape of [MAINLAND, SPIT]) {
      poly(shape);
      g.stroke();
    }
  }
  contours(g, X, Y, s, map);
  g.fillStyle = LAND;
  for (const shape of [MAINLAND, SPIT]) {
    poly(shape);
    g.fill();
  }
  g.strokeStyle = INK;
  g.lineWidth = 1.3;
  for (const shape of [MAINLAND, SPIT]) {
    poly(shape);
    g.stroke();
  }
  dunes(g, X, Y);
  grid(g, X, Y, map);
  if (!zoomed) soundings(g, X, Y, map);
  harbour(g, X, Y, s);
  if (!zoomed) {
    const r = Math.max(34, 92 * s);
    rose(g, X(470), Y(690), r);
    avoid.boxes.push({ x: X(470) - r, y: Y(690) - r - 12, w: 2 * r, h: 2 * r + 26 });
    waters(g, X, Y, map, avoid);
  }
  town(g, X, Y, s, map, zoomed, avoid);
  stations(g, X, Y, map, avoid);
  g.restore();
  const words = collected;
  collected = null;

  frame(g, w, X, Y, map, zoomed);
  title(g, w, map);
  scaleBar(g, w, h, s, map);
  key(g, w, map);
  grain(g, w, h);
  return words;
}

/** Writes the words paintChart collected, on top of whatever is drawn on the chart. */
export function writeWords(g, words) {
  for (const word of words) {
    g.save();
    g.setTransform(word.m);
    g.font = word.font;
    g.fillStyle = word.fill;
    g.textAlign = word.align;
    g.textBaseline = word.base;
    ink(g, word.text, word.x, word.y, word.halo);
    g.restore();
  }
}

function contours(g, X, Y, s, map) {
  g.save();
  g.strokeStyle = 'rgb(47 62 71 / 0.45)';
  g.lineWidth = 0.8;
  g.setLineDash([4, 3]);
  g.font = 'italic 400 9px Recursive, serif';
  g.fillStyle = 'rgb(47 62 71 / 0.6)';
  for (const c of CONTOURS) {
    g.beginPath();
    c.pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
    g.stroke();
    const [x, y] = c.pts[c.label ?? Math.floor(c.pts.length / 2)];
    if (s > 0.3 && X(x) > map.x + 6 && Y(y) > map.y + 10 && Y(y) < map.y + map.h - 6) ink(g, String(c.depth), X(x) + 3, Y(y), 'rgb(205 223 219 / 0.95)');
  }
  g.restore();
}

function dunes(g, X, Y) {
  g.strokeStyle = 'rgb(47 62 71 / 0.35)';
  g.lineWidth = 0.8;
  for (let y = 80; y < 990; y += 26) {
    const x = 194 + (y / 1000) * 66;
    g.beginPath();
    g.moveTo(X(x - 8), Y(y));
    g.quadraticCurveTo(X(x), Y(y - 7), X(x + 8), Y(y));
    g.stroke();
  }
}

/** Meridians and parallels every minute, faint. */
function grid(g, X, Y, map) {
  g.strokeStyle = 'rgb(47 62 71 / 0.1)';
  g.lineWidth = 1;
  for (let y = 0; y <= 1000; y += 100) {
    g.beginPath();
    g.moveTo(map.x, Y(y));
    g.lineTo(map.x + map.w, Y(y));
    g.stroke();
  }
  for (let x = 0; x <= 1000; x += LON_UNITS) {
    g.beginPath();
    g.moveTo(X(x), map.y);
    g.lineTo(X(x), map.y + map.h);
    g.stroke();
  }
}

function soundings(g, X, Y, map) {
  g.fillStyle = 'rgb(47 62 71 / 0.6)';
  g.font = 'italic 400 10px Recursive, serif';
  g.textAlign = 'center';
  for (const [x, y, d] of SOUNDINGS) {
    const px = X(x);
    const py = Y(y);
    if (px > map.x + 8 && px < map.x + map.w - 8 && py > map.y + 10 && py < map.y + map.h - 4) ink(g, d, px, py, 'rgb(205 223 219 / 0.95)');
  }
  g.textAlign = 'left';
}

function harbour(g, X, Y, s) {
  g.strokeStyle = INK;
  g.lineWidth = Math.max(2, 3.2 * s);
  g.lineCap = 'round';
  for (const [[x1, y1], [x2, y2]] of HARBOUR.moles) {
    g.beginPath();
    g.moveTo(X(x1), Y(y1));
    g.lineTo(X(x2), Y(y2));
    g.stroke();
  }
  const r = Math.max(2.6, 4 * s);
  // A can for port (red), a cone for starboard (green): IALA region A.
  const [rx, ry] = HARBOUR.red;
  g.fillStyle = '#c0392b';
  g.fillRect(X(rx) - r * 0.7, Y(ry) - r, r * 1.4, r * 1.6);
  const [gx, gy] = HARBOUR.green;
  g.fillStyle = '#2e8b57';
  g.beginPath();
  g.moveTo(X(gx), Y(gy) - r * 1.1);
  g.lineTo(X(gx) + r * 0.85, Y(gy) + r * 0.6);
  g.lineTo(X(gx) - r * 0.85, Y(gy) + r * 0.6);
  g.closePath();
  g.fill();
}

function town(g, X, Y, s, map, zoomed, avoid) {
  g.fillStyle = 'rgb(120 80 60 / 0.75)';
  for (const [x, y, w, h] of TOWN.houses) {
    g.fillRect(X(x), Y(y), w * s, h * s);
    avoid.boxes.push({ x: X(x), y: Y(y), w: w * s, h: h * s });
  }
  if (!zoomed) {
    g.fillStyle = INK;
    g.font = '700 11px Recursive, sans-serif';
    const box = label(g, TOWN.name.toUpperCase(), X(TOWN.box.x + 60), Y(TOWN.box.y - 12), map);
    avoid.boxes.push(box);
    return;
  }
  g.lineCap = 'round';
  for (const st of TOWN.streets) {
    g.beginPath();
    st.pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
    g.lineWidth = 5 * s;
    g.strokeStyle = 'rgb(255 250 235 / 0.92)';
    g.stroke();
    g.lineWidth = 1;
    g.strokeStyle = 'rgb(47 62 71 / 0.45)';
    g.stroke();
  }
  g.fillStyle = INK;
  g.font = '600 12px Recursive, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const ends = (st) => st.pts.map(([x, y]) => ({ x: X(x), y: Y(y) }));
  for (const st of TOWN.streets) {
    const [a, b] = ends(st);
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const flat = Math.abs(ang) < Math.PI / 4;
    const tw = g.measureText(st.name).width + 6;
    const th = 14;
    // Beside the street, on either side, somewhere along it; the other streets count as lines.
    const n = { x: Math.sin(ang), y: -Math.cos(ang) };
    const d = 2.5 * s + th / 2 + 1;
    const spots = [];
    for (const f of [0.3, 0.5, 0.7, 0.15, 0.85]) {
      for (const side of [1, -1]) {
        const c = { x: a.x + (b.x - a.x) * f + n.x * d * side, y: a.y + (b.y - a.y) * f + n.y * d * side };
        spots.push({ c, box: flat ? { x: c.x - tw / 2, y: c.y - th / 2, w: tw, h: th } : { x: c.x - th / 2, y: c.y - tw / 2, w: th, h: tw } });
      }
    }
    const others = TOWN.streets.filter((o) => o !== st).map(ends);
    const spot = placeName(spots, { segments: [...avoid.segments, ...others], boxes: avoid.boxes }, map);
    if (!spot) continue;
    g.save();
    g.translate(spot.c.x, spot.c.y);
    g.rotate(flat ? ang : ang - Math.PI);
    ink(g, st.name, 0, 0, 'rgb(234 220 185 / 0.95)');
    g.restore();
  }
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
}

function rose(g, x, y, r) {
  g.save();
  g.translate(x, y);
  g.strokeStyle = 'rgb(47 62 71 / 0.6)';
  g.fillStyle = 'rgb(47 62 71 / 0.7)';
  g.lineWidth = 0.9;
  // The outer ring is true north; the inner one is turned by the magnetic variation.
  for (const [radius, turn] of [[r, 0], [r * 0.7, VARIATION]]) {
    g.beginPath();
    g.arc(0, 0, radius, 0, Math.PI * 2);
    g.stroke();
    for (let a = 0; a < 360; a += 10) {
      const rad = ((a + turn) * Math.PI) / 180;
      const len = a % 90 === 0 ? 0.16 : a % 30 === 0 ? 0.1 : 0.06;
      g.beginPath();
      g.moveTo(Math.sin(rad) * radius, -Math.cos(rad) * radius);
      g.lineTo(Math.sin(rad) * radius * (1 - len), -Math.cos(rad) * radius * (1 - len));
      g.stroke();
    }
  }
  g.beginPath();
  g.moveTo(0, -r * 0.92);
  g.lineTo(r * 0.08, 0);
  g.lineTo(-r * 0.08, 0);
  g.closePath();
  g.fill();
  g.font = '600 9px Recursive, sans-serif';
  g.textAlign = 'center';
  ink(g, 'N', 0, -r - 3, 'rgb(205 223 219 / 0.95)');
  g.font = '400 8px Recursive, sans-serif';
  ink(g, `VAR ${Math.floor(VARIATION)}°${String((VARIATION % 1) * 60).padStart(2, '0')}'E 2026`, 0, r + 11, 'rgb(205 223 219 / 0.95)');
  g.restore();
}

function waters(g, X, Y, map, avoid) {
  g.fillStyle = 'rgb(47 62 71 / 0.55)';
  g.font = 'italic 500 12px Recursive, serif';
  g.textAlign = 'center';
  g.save();
  g.translate(Math.max(map.x + 16, X(160)), Y(470));
  g.rotate(-Math.PI / 2);
  ink(g, 'THE BALTIC', 0, 0, 'rgb(205 223 219 / 0.95)');
  g.restore();
  avoid.boxes.push(label(g, 'THE LAGOON', X(470), Y(560), map, 'center'));
  g.textAlign = 'left';
}

function stations(g, X, Y, map, avoid) {
  for (const st of Object.values(STATIONS)) {
    const x = X(st.x);
    const y = Y(st.y);
    // A station off the edge of a closer view gets no symbol and no name.
    if (x < map.x || x > map.x + map.w || y < map.y || y > map.y + map.h) continue;
    g.strokeStyle = INK;
    g.fillStyle = INK;
    g.lineWidth = 1.3;
    g.beginPath();
    g.arc(x, y, 3.6, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(x, y, 1.3, 0, Math.PI * 2);
    g.fill();
    // A mast with its red obstruction light.
    g.beginPath();
    g.moveTo(x, y - 4.5);
    g.lineTo(x, y - 15);
    g.stroke();
    g.fillStyle = '#c0392b';
    g.beginPath();
    g.arc(x, y - 16, 1.8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = INK;
    g.font = '600 10px Recursive, ui-sans-serif, sans-serif';
    const name = st.name.toUpperCase();
    const tw = g.measureText(name).width + 4;
    // Round the mast, the side away from the nearer edge first.
    const spots = [
      { x: x + 8, y: y + 15 }, { x: x + 8, y: y - 6 }, { x: x - 8 - tw, y: y + 15 }, { x: x - 8 - tw, y: y - 6 },
    ].map((p) => ({ ...p, box: { x: p.x - 2, y: p.y - 10, w: tw, h: 13 } }));
    if (st.x > 600) spots.push(...spots.splice(0, 2));
    const spot = placeName(spots, avoid, map) ?? spots[0];
    ink(g, name, spot.x, spot.y);
  }
}

// While the chart is painted, its words are collected here instead of drawn, so chart.js
// can write them last, over the pencil lines: a line may run under a name, never through it.
let collected = null;

/** Writes on the chart with a halo of paper round the letters, as printed charts do. */
function ink(g, text, x, y, halo = 'rgb(239 229 203 / 0.92)') {
  if (collected) {
    collected.push({ text, x, y, halo, font: g.font, fill: g.fillStyle, align: g.textAlign, base: g.textBaseline, m: g.getTransform() });
    return;
  }
  g.save();
  g.lineJoin = 'round';
  g.lineWidth = 3;
  g.strokeStyle = halo;
  g.strokeText(text, x, y);
  g.restore();
  g.fillText(text, x, y);
}

/** Text kept inside the map's edge, whichever side it would run over. */
function label(g, text, x, y, map, align = 'left') {
  const tw = g.measureText(text).width;
  let left = align === 'left' ? x : align === 'right' ? x - tw : x - tw / 2;
  left = Math.max(map.x + 4, Math.min(map.x + map.w - tw - 4, left));
  const prev = g.textAlign;
  g.textAlign = 'left';
  ink(g, text, left, y);
  g.textAlign = prev;
  return { x: left - 2, y: y - 11, w: tw + 4, h: 14 };
}

/** The neat line with the minute scale, alternating black and white, as on real charts. */
function frame(g, w, X, Y, map, zoomed) {
  const bar = 4;
  g.strokeStyle = INK;
  g.lineWidth = 1;
  g.strokeRect(map.x + 0.5, map.y + 0.5, map.w - 1, map.h - 1);
  if (zoomed) return;
  // Tenths of a minute along the left and right edges (latitude), and top and bottom
  // (longitude), filled in turn.
  g.fillStyle = INK;
  const y0 = (map.y - Y(0)) / (Y(100) - Y(0));
  for (let k = Math.floor(y0 * 10); k * 10 <= 1000; k++) {
    const ya = Y(k * 10);
    const yb = Y(k * 10 + 10);
    if (yb < map.y || ya > map.y + map.h) continue;
    if (k % 2 === 0) {
      const top = Math.max(map.y, ya);
      const hh = Math.min(map.y + map.h, yb) - top;
      g.fillRect(map.x, top, bar, hh);
      g.fillRect(map.x + map.w - bar, top, bar, hh);
    }
  }
  const step = LON_UNITS / 10;
  for (let k = 0; k * step <= 1000; k++) {
    const xa = X(k * step);
    const xb = X(k * step + step);
    if (xb < map.x || xa > map.x + map.w) continue;
    if (k % 2 === 0) {
      const left = Math.max(map.x, xa);
      const ww = Math.min(map.x + map.w, xb) - left;
      g.fillRect(left, map.y, ww, bar);
      g.fillRect(left, map.y + map.h - bar, ww, bar);
    }
  }
  // Every second minute of latitude in the side margins, along the edge, outside the line.
  g.font = '500 8px Recursive, sans-serif';
  g.textAlign = 'center';
  for (let y = 100; y < 1000; y += 200) {
    const py = Y(y);
    if (py < map.y + 30 || py > map.y + map.h - 30) continue;
    const m = TOP_LAT - y / 100;
    const text = `${Math.floor(m / 60)}°${String(Math.round(m % 60)).padStart(2, '0')}'N`;
    for (const [x, turn] of [[map.x - 5, -Math.PI / 2], [map.x + map.w + 5, Math.PI / 2]]) {
      g.save();
      g.translate(x, py);
      g.rotate(turn);
      g.fillText(text, 0, 3);
      g.restore();
    }
  }
  g.textAlign = 'left';
}

function title(g, w, map) {
  g.fillStyle = INK;
  g.textAlign = 'center';
  g.font = '700 12px Recursive, sans-serif';
  g.fillText('EASTPORT LAGOON AND APPROACHES', w / 2, map.y - 16);
  g.font = '400 9px Recursive, sans-serif';
  g.fillText('Depths in metres · Bearings true · Not for navigation', w / 2, map.y - 5);
  g.textAlign = 'left';
}

/** A bar of one nautical mile (or less, if a mile is too long), in cables of a tenth. */
function scaleBar(g, w, h, s, map) {
  const options = [2, 1, 0.5, 0.2, 0.1];
  const nm = options.find((n) => n * 100 * s <= w * 0.42) ?? 0.1;
  const len = nm * 100 * s;
  const x = map.x + 6;
  const y = map.y + map.h + 12;
  g.fillStyle = INK;
  g.strokeStyle = INK;
  g.lineWidth = 1;
  g.strokeRect(x, y, len, 4);
  const parts = 10;
  for (let i = 0; i < parts; i += 2) g.fillRect(x + (len * i) / parts, y, len / parts, 4);
  g.font = '500 9px Recursive, sans-serif';
  const text = nm >= 1 ? `${nm} nautical mile${nm > 1 ? 's' : ''}` : `${Math.round(nm * 10)} cable${nm > 0.1 ? 's' : ''}`;
  g.fillText(text, x + len + 6, y + 5);
}

/** The few symbols on this chart, explained under the scale bar. */
function key(g, w, map) {
  const y = map.y + map.h + 36;
  let x = map.x + 6;
  g.font = '400 9px Recursive, sans-serif';
  g.fillStyle = INK;
  g.strokeStyle = INK;
  const item = (draw, text) => {
    draw(x + 5, y - 3);
    g.fillStyle = INK;
    g.fillText(text, x + 13, y);
    x += 13 + g.measureText(text).width + 12;
  };
  item((cx, cy) => {
    g.lineWidth = 1;
    g.beginPath();
    g.arc(cx, cy, 3.2, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#c0392b';
    g.beginPath();
    g.arc(cx, cy - 6, 1.6, 0, Math.PI * 2);
    g.fill();
  }, 'radio mast');
  item((cx, cy) => {
    g.fillStyle = '#c0392b';
    g.fillRect(cx - 2.5, cy - 4, 5, 6);
  }, 'port buoy');
  item((cx, cy) => {
    g.fillStyle = '#2e8b57';
    g.beginPath();
    g.moveTo(cx, cy - 4.5);
    g.lineTo(cx + 3.5, cy + 2);
    g.lineTo(cx - 3.5, cy + 2);
    g.closePath();
    g.fill();
  }, 'starboard buoy');
  if (x + 60 < w) item((cx, cy) => {
    g.font = 'italic 400 10px Recursive, serif';
    g.fillText('5', cx - 3, cy + 3);
    g.font = '400 9px Recursive, sans-serif';
  }, 'depth, m');
}

function grain(g, w, h) {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < (w * h) / 90; i++) {
    g.fillStyle = `rgb(60 50 30 / ${rnd() * 0.05})`;
    g.fillRect(rnd() * w, rnd() * h, 1, 1);
  }
  const fold = g.createLinearGradient(w / 2 - 10, 0, w / 2 + 10, 0);
  fold.addColorStop(0, 'rgb(0 0 0 / 0)');
  fold.addColorStop(0.5, 'rgb(0 0 0 / 0.06)');
  fold.addColorStop(1, 'rgb(255 255 255 / 0)');
  g.fillStyle = fold;
  g.fillRect(w / 2 - 10, 0, 20, h);
}
