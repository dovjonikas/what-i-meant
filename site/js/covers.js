// covers.js: placeholder cover art for stories that are not out yet, drawn in code so the
// repo needs no image files for them. The three styles show how different the stories can
// look: low-res pixels, a soft photo-like blur, and pen lines. A story with real art sets
// `image` in stories.js and skips this file.
//
// Each cover uses a fixed seed, so it looks the same on every visit.

const COLORS = {
  ink: '#121a2c',
  dusk: '#26314e',
  haze: '#56658f',
  fog: '#a7b1cf',
  paper: '#efe9de',
  ember: '#a8693f',
  lamp: '#f3b46a',
};

/** Draws the placeholder cover `style` into `canvas`, sized to its box on screen. */
export function drawCover(canvas, style, seed = 1) {
  const draw = { pixel: drawPixel, photo: drawPhoto, ink: drawInk }[style];
  if (!draw) throw new Error(`Unknown cover style: ${style}`);
  draw(canvas, mulberry32(seed));
}

/** A small tile of random grey dots, returned as a data URL for the film grain overlay. */
export function grainTile(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

// Pixel: a tiny canvas (CSS scales it up with image-rendering: pixelated). A low sun on a
// flat horizon over water, with the sky done in ordered dithering, the way old games
// faked smooth gradients with few colours.
function drawPixel(canvas, rand) {
  const w = 45, h = 60;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const set = (x, y, c) => {
    const i = (y * w + x) * 4;
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = 255;
  };

  // Sky colours from the top down to the horizon, with in-between shades so the
  // dithered bands stay narrow.
  const stops = [COLORS.ink, COLORS.dusk, COLORS.haze, COLORS.ember, COLORS.lamp].map(hexToRgb);
  const ramp = [];
  stops.forEach((c, i) => {
    ramp.push(c);
    if (i < stops.length - 1) ramp.push(mix(c, stops[i + 1], 0.5));
  });
  const bayer = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];
  const dither = (v, x, y) => {
    const base = Math.floor(v);
    const up = v - base > (bayer[y % 4][x % 4] + 0.5) / 16 ? 1 : 0;
    return Math.min(ramp.length - 1, base + up);
  };

  const horizon = 41;
  const sun = { x: 22, y: horizon, r: 8 };
  const sunCore = hexToRgb('#ffd59a');
  const water = [hexToRgb('#0e1424'), hexToRgb(COLORS.ink), hexToRgb(COLORS.dusk)];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y < horizon) {
        const dx = x - sun.x, dy = y - sun.y;
        if (dx * dx + dy * dy <= sun.r * sun.r) {
          set(x, y, dx * dx + dy * dy <= (sun.r - 3) * (sun.r - 3) ? sunCore : ramp[ramp.length - 1]);
        } else {
          set(x, y, ramp[dither(Math.pow(y / horizon, 1.5) * (ramp.length - 1), x, y)]);
        }
      } else {
        // Water: dark, a little lighter in dithered rows near the horizon.
        const near = Math.max(0, 1 - (y - horizon) / 12) * 2;
        set(x, y, water[Math.min(2, Math.floor(near) + ((near % 1) > (bayer[y % 4][x % 4] + 0.5) / 16 ? 1 : 0))]);
      }
    }
  }

  // The sun's reflection: short broken lines under it, narrowing with depth.
  const glint = hexToRgb(COLORS.lamp);
  for (let y = horizon + 1; y < h - 4; y += 2) {
    const half = Math.max(1, Math.round(sun.r * (1 - (y - horizon) / (h - horizon)) * 0.9));
    for (let x = sun.x - half; x <= sun.x + half; x++) {
      if (rand() < 0.6) set(x, y, y < horizon + 6 ? sunCore : glint);
    }
  }

  // A few single-pixel stars in the upper sky.
  const star = hexToRgb(COLORS.paper);
  for (let n = 0; n < 8; n++) {
    set(Math.floor(rand() * w), Math.floor(rand() * h * 0.3), star);
  }
  ctx.putImageData(img, 0, 0);
}

// Photo: soft out-of-focus lights on a dark gradient, with grain and a vignette,
// the way a night photo looks when the lens is focused on something close.
function drawPhoto(canvas, rand) {
  const { ctx, w, h } = sizeToBox(canvas);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, COLORS.dusk);
  sky.addColorStop(1, COLORS.ink);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'lighter';
  for (let n = 0; n < 16; n++) {
    const r = (0.06 + rand() * 0.16) * w;
    const x = rand() * w;
    const y = (0.15 + rand() * 0.7) * h;
    const warm = rand() < 0.65;
    const [cr, cg, cb] = hexToRgb(warm ? COLORS.lamp : COLORS.fog);
    const a = 0.1 + rand() * 0.26;
    // A disc that is slightly brighter at its rim, like real bokeh.
    const disc = ctx.createRadialGradient(x, y, 0, x, y, r);
    disc.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.6})`);
    disc.addColorStop(0.82, `rgba(${cr},${cg},${cb},${a})`);
    disc.addColorStop(0.94, `rgba(${cr},${cg},${cb},${a * 0.5})`);
    disc.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.fillStyle = disc;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';

  const vignette = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.2, w / 2, h * 0.45, h * 0.75);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const g = (rand() - 0.5) * 18;
    img.data[i] += g;
    img.data[i + 1] += g;
    img.data[i + 2] += g;
  }
  ctx.putImageData(img, 0, 0);
}

// Ink: loose rings drawn around one point, each a little uneven, like contour lines
// sketched with a pen. Every ring is traced twice with a small offset to give the stroke
// the slightly doubled edge of real ink.
function drawInk(canvas, rand) {
  const { ctx, w, h, scale } = sizeToBox(canvas);
  ctx.fillStyle = '#161d31';
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.6, cy = h * 0.4;
  const rings = 11;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let k = 0; k < rings; k++) {
    const base = (0.05 + k * 0.075) * w;
    // Two slow waves with random phases make each ring wobble in its own way.
    const p1 = rand() * Math.PI * 2, p2 = rand() * Math.PI * 2;
    const amp = base * (0.06 + rand() * 0.06);
    for (let pass = 0; pass < 2; pass++) {
      const off = pass * 0.6 * scale;
      ctx.beginPath();
      for (let s = 0; s <= 120; s++) {
        const t = (s / 120) * Math.PI * 2;
        const r = base + amp * Math.sin(t * 3 + p1) + amp * 0.5 * Math.sin(t * 5 + p2);
        const x = cx + Math.cos(t) * r * 1.08 + off;
        const y = cy + Math.sin(t) * r + off;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(239,233,222,${pass ? 0.22 : 0.62 - k * 0.03})`;
      ctx.lineWidth = (pass ? 0.8 : 1.3) * scale;
      ctx.stroke();
    }
  }

  // One small warm dot in the middle of the rings.
  ctx.fillStyle = COLORS.lamp;
  ctx.beginPath();
  ctx.arc(cx, cy, 3.2 * scale, 0, Math.PI * 2);
  ctx.fill();
}

// Sets the canvas buffer to its on-screen size (capped at 2x pixel density, which is plenty
// for soft art and keeps memory low on phones) and returns the context and size.
function sizeToBox(canvas) {
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const box = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(box.width * scale));
  const h = Math.max(1, Math.round(box.height * scale));
  canvas.width = w;
  canvas.height = h;
  return { ctx: canvas.getContext('2d', { willReadFrequently: true }), w, h, scale };
}

function mix(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Small seeded random number generator (mulberry32), so covers are the same every visit.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
