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
| `index.html` | The menu: start screen, title, story cards, sound switch. Laid out for a phone at every size; on a computer it is a phone-wide column with frosted glass on both sides |
| `css/menu.css` | Menu styles: colours, fonts, layout, page states |
| `js/main.js` | Entry point; wires everything below together |
| `js/stories.js` | The list of stories the menu is built from. Edit this to add a story |
| `js/shelf.js` | Story cards and the dots under them |
| `js/covers.js` | Placeholder cover art drawn in code, and the film grain |
| `js/title.js` | The title letters and how they change form |
| `js/music.js` | The menu music, generated live with the Web Audio API |
| `js/install.js` | The offer to add the site to the home screen, and starting `sw.js` |
| `sw.js` | Service worker: always fetches the newest files, keeps a copy for offline |
| `manifest.webmanifest` | Name, colours and icons for the home screen |
| `assets/` | Icons (home screen ones too) and the link preview image (`og.png`) |
| `stories/` | One folder per story, each with its own README |

Stories live in `stories/<id>/`, one folder each, linked from the menu once their entry
in `js/stories.js` is set to `out`. The first is `stories/text-me/`.

## Notes

- Font: Recursive, from Google Fonts. Its axes (MONO, CASL, wght, slnt) are what the title
  animates. Presets are CSS variables at the top of `css/menu.css`.
- Sound only starts after a tap or click; browsers block it before that. On iPhone the
  page asks for media playback (`navigator.audioSession`) so the silent switch does not
  mute the music.
- The sound switch is remembered in `localStorage` under `wim.sound`; the stories share it.
- Home screen: Chrome, Edge and Android get a one-tap Add button; iPhone and iPad Safari
  cannot install a page from code, so they get a note pointing at Share, then Add to Home
  Screen. Turning the offer down hides it for 14 days (`wim.install.later`).
- Updates: `sw.js` asks the network first for every file, so a home screen copy shows a
  new release on its next start with a connection. Nothing needs bumping on release.
- `assets/og.png` and the icons are screenshots of the page and the font. Remake them when
  the title or the colours change.
