# site

The web game itself. Everything in this folder is published to GitHub Pages as it is;
there is no build step.

## Run it locally

```sh
node tools/serve.mjs
```

Then open http://localhost:5173. Opening `index.html` straight from disk does not work:
browsers do not load ES modules from `file://` pages.

## What is where

| Path | What it is |
|---|---|
| `index.html` | The menu: start screen, title, story cards, sound switch |
| `css/menu.css` | Menu styles: colours, fonts, layout, page states |
| `js/main.js` | Entry point; wires everything below together |
| `js/stories.js` | The list of stories the menu is built from. Edit this to add a story |
| `js/shelf.js` | Story cards and the dots under them |
| `js/covers.js` | Placeholder cover art drawn in code, and the film grain |
| `js/title.js` | The title letters and how they change form |
| `js/music.js` | The menu music, generated live with the Web Audio API |
| `assets/` | Icons and the link preview image (`og.png`) |

Stories will live in `stories/<id>/`, one folder each, linked from the menu once their
entry in `js/stories.js` is set to `out`.

## Notes

- Font: Recursive, from Google Fonts. Its axes (MONO, CASL, wght, slnt) are what the title
  animates. Presets are CSS variables at the top of `css/menu.css`.
- Sound only starts after a tap or click; browsers block it before that. On iPhone the
  page asks for media playback (`navigator.audioSession`) so the silent switch does not
  mute the music.
- The sound switch is remembered in `localStorage` under `wim.sound`.
- `assets/og.png` and the icons are screenshots of the page and the font. Remake them when
  the title or the colours change.
