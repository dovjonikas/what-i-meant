// music.js: the menu music, made live with the Web Audio API instead of an audio file.
//
// Four slow chords loop on a soft pad, with a low bass note under each and a few piano-like
// notes on top. The top notes walk at random through the D major pentatonic scale
// (D E F# A B), which sits well over all four chords, so the loop never plays the same way
// twice. A test can render it offline: see createMusic and scheduleUntil.
//
// Sounds are queued ahead on the audio clock, not fired by timers. The audio clock keeps
// steady time even when the page is busy.

const CHORD_SECONDS = 8;
const PAD_ATTACK = 3;
const PAD_RELEASE = 4.5;
const LOOKAHEAD = 1.5; // seconds of music queued ahead of the audio clock
const TICK_MS = 250; // how often the live scheduler tops the queue up
const VOLUME = 0.8;

// MIDI note numbers. `glow` is how bright the lamp behind the page gets on that chord.
const CHORDS = [
  { name: 'Dmaj9', bass: 38, pad: [54, 57, 61, 64], glow: 0.8 },
  { name: 'Bm9', bass: 35, pad: [54, 57, 61, 62], glow: 0.55 },
  { name: 'Gmaj7#11', bass: 43, pad: [54, 59, 61, 62], glow: 0.95 },
  { name: 'Aadd9', bass: 45, pad: [52, 57, 59, 61], glow: 0.65 },
];

// D4 to A5 in D major pentatonic.
const SCALE = [62, 64, 66, 69, 71, 74, 76, 78, 81];

// The piano-like tone: sine partials as [frequency ratio, level, seconds to fade out].
// The slightly sharp top partial gives it a touch of bell.
const PARTIALS = [
  [1, 1, 3.2],
  [2, 0.3, 1.6],
  [3, 0.1, 0.9],
  [4.2, 0.04, 0.5],
];

/**
 * Builds the music graph on `ctx` (an AudioContext or OfflineAudioContext).
 * Nothing plays until start() and scheduleUntil() are called.
 * `onChord(glow)` and `onNote(velocity)` fire, on the main thread, when a chord or a top
 * note is heard; they are for visuals and may be left out.
 */
export function createMusic(ctx, { onChord = null, onNote = null } = {}) {
  const level = (value) => {
    const g = ctx.createGain();
    g.gain.value = value;
    return g;
  };

  // Output: master volume, then a gentle limiter so overlapping notes never clip.
  const master = level(0);
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -14;
  limiter.knee.value = 10;
  limiter.ratio.value = 4;
  limiter.attack.value = 0.01;
  limiter.release.value = 0.4;
  master.connect(limiter).connect(ctx.destination);

  // Shared reverb and echo that the instruments send into.
  const reverbIn = level(1);
  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 4, 2.8);
  reverbIn.connect(reverb).connect(master);

  const echoIn = level(1);
  const echo = ctx.createDelay(1);
  echo.delayTime.value = 0.375;
  const echoTone = ctx.createBiquadFilter();
  echoTone.type = 'lowpass';
  echoTone.frequency.value = 1800;
  const feedback = level(0.32);
  echoIn.connect(echo).connect(echoTone);
  echoTone.connect(feedback).connect(echo);
  echoTone.connect(master);

  // Each instrument gets a bus with its own mix of dry sound, reverb and echo.
  const makeBus = (dry, wet, delayed = 0) => {
    const input = level(1);
    input.connect(level(dry)).connect(master);
    input.connect(level(wet)).connect(reverbIn);
    if (delayed) input.connect(level(delayed)).connect(echoIn);
    return input;
  };
  const padBus = makeBus(0.75, 0.5);
  const keysBus = makeBus(0.8, 0.55, 0.22);
  const bassBus = makeBus(1, 0.12);

  let started = false;
  let muted = false;
  let nextChordTime = 0;
  let chordIndex = 0;
  let nextNoteTime = 0;
  let step = 4; // position in SCALE for the next top note

  function start(at = ctx.currentTime + 0.05, { muted: startMuted = false } = {}) {
    started = true;
    muted = startMuted;
    nextChordTime = at;
    nextNoteTime = at + 2.5; // let the first chord swell before the first note
    master.gain.setValueAtTime(0, at);
    if (!muted) master.gain.linearRampToValueAtTime(VOLUME, at + 4);
  }

  /** Queues every chord and note that starts before `until` (seconds on ctx's clock). */
  function scheduleUntil(until) {
    if (!started) return;
    while (nextChordTime < until) {
      playChord(CHORDS[chordIndex], nextChordTime);
      chordIndex = (chordIndex + 1) % CHORDS.length;
      nextChordTime += CHORD_SECONDS;
    }
    while (nextNoteTime < until) {
      playPhrase(nextNoteTime);
      // Notes fall on a half-second grid, 1.5 to 4 seconds apart.
      nextNoteTime += 0.5 * (3 + Math.floor(Math.random() * 6));
    }
  }

  function setMuted(value) {
    muted = value;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(muted ? 0 : VOLUME, now + 0.6);
  }

  /** Two quick high notes going down: the "not yet" sound for a locked story. */
  function chime() {
    if (muted) return;
    const now = ctx.currentTime;
    playKey(81, now, 0.55);
    playKey(78, now + 0.11, 0.45);
  }

  function playChord(chord, t) {
    const end = t + CHORD_SECONDS;

    // The pad: two slightly detuned saw waves per note, softened by a lowpass filter that
    // opens toward the middle of the chord and closes again as it fades.
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.Q.value = 0.6;
    tone.frequency.setValueAtTime(450, t);
    tone.frequency.linearRampToValueAtTime(1150, t + CHORD_SECONDS / 2);
    tone.frequency.linearRampToValueAtTime(500, end + PAD_RELEASE);
    tone.connect(padBus);

    const swell = ctx.createGain();
    swell.gain.setValueAtTime(0, t);
    swell.gain.linearRampToValueAtTime(1, t + PAD_ATTACK);
    swell.gain.setValueAtTime(1, end);
    swell.gain.linearRampToValueAtTime(0, end + PAD_RELEASE);
    swell.connect(tone);

    for (const note of chord.pad) {
      for (const cents of [-7, 7]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = toHz(note);
        osc.detune.value = cents;
        osc.connect(level(0.022)).connect(swell);
        osc.start(t);
        osc.stop(end + PAD_RELEASE + 0.1);
      }
    }

    // The bass: a sine for weight on headphones, and a quiet triangle an octave up so the
    // note can still be heard on a phone speaker, which cannot play the low sine.
    const bassEnv = ctx.createGain();
    bassEnv.gain.setValueAtTime(0, t);
    bassEnv.gain.linearRampToValueAtTime(1, t + 2.5);
    bassEnv.gain.setValueAtTime(1, end);
    bassEnv.gain.linearRampToValueAtTime(0, end + PAD_RELEASE * 0.8);
    bassEnv.connect(bassBus);

    const low = ctx.createOscillator();
    low.type = 'sine';
    low.frequency.value = toHz(chord.bass);
    low.connect(level(0.16)).connect(bassEnv);

    const high = ctx.createOscillator();
    high.type = 'triangle';
    high.frequency.value = toHz(chord.bass + 12);
    high.connect(level(0.04)).connect(bassEnv);

    for (const osc of [low, high]) {
      osc.start(t);
      osc.stop(end + PAD_RELEASE + 0.1);
    }
    // Free the chord's nodes once its last sound has ended.
    low.onended = () => {
      tone.disconnect();
      bassEnv.disconnect();
    };

    fire(onChord, t, chord.glow);
  }

  // One top note, and now and then a second one a step below it right after.
  function playPhrase(t) {
    const moves = step > 6 ? [-2, -1, -1, 1] : step < 2 ? [-1, 1, 1, 2] : [-2, -1, -1, 1, 1, 2];
    step = clamp(step + moves[Math.floor(Math.random() * moves.length)], 0, SCALE.length - 1);
    playKey(SCALE[step], t, 0.35 + Math.random() * 0.35);
    if (step > 0 && Math.random() < 0.2) {
      playKey(SCALE[step - 1], t + 0.5, 0.25 + Math.random() * 0.2);
    }
  }

  function playKey(note, t, velocity) {
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2600;
    tone.connect(keysBus);

    PARTIALS.forEach(([ratio, amount, decay], i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = toHz(note) * ratio;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(amount * velocity * 0.12, t + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(env).connect(tone);
      osc.start(t);
      osc.stop(t + decay + 0.05);
      if (i === 0) osc.onended = () => tone.disconnect(); // the first partial lasts longest
    });

    fire(onNote, t, velocity);
  }

  // Runs a visual hook at the moment the sound is heard, not when it was queued.
  function fire(hook, t, value) {
    if (!hook) return;
    setTimeout(() => hook(value), Math.max(0, (t - ctx.currentTime) * 1000));
  }

  return { start, scheduleUntil, setMuted, chime };
}

/**
 * Starts the music in the browser. Must be called from a tap or click handler: browsers,
 * iPhone Safari above all, only allow sound to start from a user gesture.
 */
export function startMusic({ muted = false, onChord, onNote } = {}) {
  // On iPhone, Web Audio is silenced by the ring/silent switch unless the page declares
  // it plays media. The Audio Session API (Safari 16.4 and later) does that.
  if (navigator.audioSession) navigator.audioSession.type = 'playback';

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx({ latencyHint: 'playback' });
  ctx.resume();

  const music = createMusic(ctx, { onChord, onNote });
  music.start(ctx.currentTime + 0.05, { muted });
  music.scheduleUntil(ctx.currentTime + LOOKAHEAD);
  setInterval(() => music.scheduleUntil(ctx.currentTime + LOOKAHEAD), TICK_MS);

  // While muted or hidden the audio clock is suspended, which saves battery; the queue
  // simply carries on from where it stopped.
  let isMuted = muted;
  let suspendTimer = 0;
  if (muted) ctx.suspend();

  return {
    setMuted(value) {
      isMuted = value;
      clearTimeout(suspendTimer);
      if (!value) ctx.resume();
      music.setMuted(value);
      if (value) suspendTimer = setTimeout(() => ctx.suspend(), 700);
    },
    chime: music.chime,
    pause: () => ctx.suspend(),
    resume: () => {
      if (!isMuted) ctx.resume();
    },
  };
}

// A reverb tail made from noise that fades out over `seconds`. The noise is passed through
// a simple lowpass, which takes the hiss out and leaves a dark, soft tail.
function makeImpulse(ctx, seconds, curve) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    let smooth = 0;
    for (let i = 0; i < length; i++) {
      smooth += 0.35 * (Math.random() * 2 - 1 - smooth);
      data[i] = smooth * Math.pow(1 - i / length, curve);
    }
  }
  return buffer;
}

function toHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
