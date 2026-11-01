# stories

One folder per story. Each story is its own small game, with its own page, styles,
code, art and sound, so one story can change without touching another. A story never
imports from another story's folder.

| Folder | Story |
|---|---|
| `text-me/` | 01, Text me when you get home |
| `say-again/` | 02, Say Again |

## What a story folder holds

| Path | What it is |
|---|---|
| `index.html` | The story's page; the menu card links here |
| `README.md` | A map of the story's files and how they connect |
| `cover.jpg` | The menu card picture and the link preview |
| `css/` | The story's styles |
| `js/` | The story's code; `js/main.js` starts it |

## What a story may use from the rest of the site

- `../../js/install.js`: the home screen offer and the offline copy (`sw.js`).
- `../../css/install.css`, `../../manifest.webmanifest` and the icons in `../../assets/`.
- The sound switch, remembered in `localStorage` under `wim.sound` and shared with the menu.

A story keeps its own saved place in `localStorage` under `wim.<folder>`.

## Adding a story

Make its folder here, then set its entry in `../js/stories.js` to `out` with its title
and cover.
