# Text me when you get home

The first story. A whole life, told while you wait for one text: it opens at the end, at
night, when somebody has just driven off, and goes back to age 0. The art is flat layered
landscapes drawn in code, the people have no faces, and the music is made live in the
browser. Plain HTML, CSS and ES modules; nothing to build or install.

**The text is a draft.** Every line in `js/script.js` was drafted so the story can be
played from start to end. The author rewrites them; see the repo `CLAUDE.md`.

## Run it

From the repo root: `node tools/serve.mjs`, then open http://localhost:5173/stories/text-me/.
The art alone: http://localhost:5173/stories/text-me/scenes.html (every scene, one at a
time; `&p=0.5` puts moving people halfway along their path) and `scenes.html?check`,
which lists anything that sticks out past the phone-wide column or is out of scale next
to the people. Playing with `?check` (http://localhost:5173/stories/text-me/?check) logs a
`[check]` console warning for anything on screen that overlaps, sticks out or is too
faint to read.

## What is where

| Path | What it is |
|---|---|
| `index.html` | The page: the picture layers, the column for words and phone, the start screen |
| `css/story.css` | All styles: words, phone, cards, buttons, the side glass on computers |
| `js/main.js` | Starts everything; starts the sound on the first tap |
| `js/script.js` | The story, beat by beat, and who is in the life lines. Edit the text here |
| `js/player.js` | Plays the script: taps, holds, choices, saving where the player stopped |
| `js/scenes.js` | Every place in the story as data: colours, hills, houses, people, weather |
| `js/painter.js` | Paints a scene: sky, mountains, mist, pines, water, roads |
| `js/props.js` | Things in a scene: houses, flats, trees, pier, bus, car, lamps, desk, and the small things of a home (`cozy`: plants, pictures, shelves, rugs, a string of lights, coats on their pegs) |
| `js/people.js` | The people: one colour and one outfit each for life, with its own details (your hoodie, Mom's coat buttons, Dad's beard and zip, the best friend's beanie), faceless, lit from one side; they breathe, walk, run and pedal |
| `js/pets.js` | The family dog: wagging tail, floppy ears, a muzzle that greys |
| `js/closeups.js` | Close shots of hands: the jar of jam, a newborn's grip, the chewed trainer; Mom's photo album in three spreads (the old photos from before you, your childhood, the dog's page with his name under each) |
| `js/fx.js` | What moves in a scene: stars, birds, smoke, rain, snow, the people breathing |
| `js/stage.js` | Shows scenes: three layers drifting at their own speeds, cross-fades, camera push |
| `js/lines.js` | The life lines: the years run and stop at each moment; people join, drift, come back, end |
| `js/phone.js` | The phone that slides up: messages, typing dots, replies that type themselves. It grows with the chat; a chat taller than the screen scrolls and can be pulled back |
| `js/captions.js` | The words, one line at a time; they move up under the bar for a scene where at the foot they would cover somebody. And the quiet "tap to go on" when a line has waited |
| `js/ui.js` | Chapter and title cards, the ending, choice buttons, the hold hint |
| `js/score.js` | The music: one theme for the whole life, an act per part of it |
| `js/sfx.js` | Phone sounds and the sound of each place |
| `js/util.js` | Seeded random numbers, noise for hill edges, colour maths |
| `js/check.js` | The art checks behind `scenes.html?check` |
| `js/audit.js` | Checks while the story plays, with `?check`: overlaps, things outside the column, faint names, words covering somebody |
| `scenes.html` | The art work page described above; not linked from the story |

## How the pieces connect

`script.js` is a list of beats. `player.js` walks it: a scene beat goes to `stage.js`,
which paints it with `painter.js`, `props.js` and `people.js` and animates it with
`fx.js`; a line goes to `captions.js`; a chat to `phone.js`; a stretch of years to
`lines.js`; music and place sounds to `score.js` and `sfx.js`. Choices are kept as flags,
and any beat can depend on one (`if: { weekend: 'lake' }`).

The player's place is saved in `localStorage` under `wim.text-me` at every beat marked
`save`, with the choices and the life lines, so the start screen offers to continue.

## Notes

- Colours: each part of life has its own time of day (see the top of `js/scenes.js`).
  Each person keeps one colour for life, used for their clothes and their line.
- Sizes in `js/scenes.js` are fractions of the column width, positions fractions of the
  column (x) and of the screen height (y). Keep people and props inside the column; run
  `scenes.html?check` after moving anything.
- Phones: only the side glass on wide screens uses a backdrop blur (blurring the moving
  picture behind the phone or a button on every frame makes a phone stutter); a layer of people clears only the box they were
  drawn in, layers with no people redraw every other frame, and a scene that leaves empties
  its canvases so Safari frees the memory.
- Sound starts only after a tap. On iPhone the page asks for media playback so the silent
  switch does not mute it.
