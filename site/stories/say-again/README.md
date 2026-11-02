# Say Again

The second story. Four night shifts at a coast radio station on a dune by the Baltic.
A mayday breaks off, and then someone on channel 16 who never speaks, only clicks and
sends Morse. You answer on the radio on the desk: pick what to say, then hold the button
while it goes out. Along the way the player learns how radio is really worked: OVER and
OUT, channel 16, MAYDAY, PAN-PAN and SÉCURITÉ, Morse, bearings, buoys, a fix and a cocked
hat on a chart. The pictures are painted in code, the sound and music are made live in
the browser. Plain HTML, CSS and ES modules; nothing to build or install.

**The text is a draft.** Every line in `js/script.js` was drafted so the story can be
played from start to end. The author rewrites them; see the repo `CLAUDE.md`.

## Run it

From the repo root: `node tools/serve.mjs`, then open
http://localhost:5173/stories/say-again/. Work pages, not linked from the story:
`dev/art.html` shows one painted scene (`?scene=room&mood=storm`; `?check` lists anything
outside the phone-wide column), `dev/audio-test.html` renders every sound offline and
prints its level. Playing with `?check` puts the parts on `window.__say` for test scripts,
and `?check&at=n3` starts at a label (a night, or one inside it such as `n4-sos`).

## What is where

| Path | What it is |
|---|---|
| `index.html` | The page: the picture, the radio console, the chart, the notes, the cards, the start screen |
| `css/story.css` | All styles |
| `js/main.js` | Starts everything; starts the sound on the first tap |
| `js/script.js` | The story, beat by beat (DRAFT text). The list of beat types is at its top |
| `js/player.js` | Plays the script: lines, choices, holds, questions, Morse, charts, saving the place |
| `js/pace.js` | The story's clock: every wait and typing speed goes through it, so a second play can run fast |
| `js/stage.js` | The picture: one canvas, scene changes, eased values, lightning, touchable animals |
| `js/ui.js` | Night cards, words away from the radio, the note on the table, the kitchen button, the end |
| `js/radio/console.js` | The radio on the desk: channel knob, lamps, finder readout, screen, push-to-talk, Morse decoder and key |
| `js/radio/morse.js` | The Morse code table and helpers |
| `js/radio/notes.js` | The sticky notes with what the player has learned |
| `js/chart/chart.js` | The chart overlay: laying bearing lines by dragging, tapping the fix, zooming to the town |
| `js/chart/chart-paper.js` | Draws the chart itself, laid out like a real nautical chart |
| `js/chart/chart-place.js` | Finds a free spot for each name, off the pencil lines and the houses |
| `js/chart/geo.js` | The bay as data: coasts, stations, the town, and bearing maths |
| `js/art/` | The paintings: `art.js` is the entry (`paint(ctx, view, scene, t, s)`), one file per scene or part |
| `js/sound/` | The sound: `audio.js` (effects, radio, places, animals), `score.js` (the music), helpers |
| `dev/` | The two work pages above |

## How the pieces connect

`script.js` is a list of beats. `player.js` walks it: a scene beat goes to `stage.js`,
which asks `art/art.js` to paint every frame; radio beats go to `radio/console.js`; a
chart beat opens `chart/chart.js`; words away from the radio go to `ui.js`; sound goes
through one object built in `main.js` from `sound/audio.js` and `sound/score.js`. Choices
are kept as flags, and any beat can depend on one (`if: { n1end: 'over' }`). Touching the
deer, the fawn or the cat sets a flag too, and the kitchen remembers it.

The bearings in the story come from the map in `chart/geo.js`, so the number on the radio,
the line on the chart and the fix always agree.

The player's place is saved in `localStorage` under `wim.say-again` at each night's label
and at the labels marked `mid` inside a night, with the flags and the notes, so the start
screen offers to continue. From a `mid` label, `player.js` sets the room, the clock and the
channel from the beats before it without playing them.

While the notes are open the story waits between beats, so nothing comes in unseen.

## Notes

- Radio practice follows marine VHF use: channel 16 kept for distress and calling, a
  sécurité announced on 16 and read on 67, a pan-pan answered with its questions, bearings
  in three figures, times in UTC. The stations talk to each other by telephone (the lines
  with a handset), as real coast stations do. The army habits mentioned follow ACP 125.
  The sources are in `docs/research_notes/say-again-*.md` at the repo root.
- Everything shown in the story is English, the chart and the drawings included.
- Sizes: the radio console covers the bottom of the screen (`--console-h` in the CSS), so
  everything that matters in the room picture sits above it.
