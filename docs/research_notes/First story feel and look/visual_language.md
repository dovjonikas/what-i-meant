# Visual language: a Firewatch-like look, made in code, for a phone life story

Scope: what the Firewatch team said about the look; how to fake it in Canvas 2D on iPhone Safari at 390 px; palette structures per time of day and season; faceless characters and player identification; colour and emotion, with a colour plan for the acts of a life. All Firewatch material is used as reference for principles only. The story's art must be original: no Firewatch scenes, poster, tower or palette copied.

Source quality note: the GDC 2015 talk itself (GDC Vault, members only) and the YouTube recording were not watched in this session. Firewatch facts below come from talk write-ups, Wikipedia, and one developer who rebuilt the fog from the talk. Several pages (Medium, Polycount, Boing Boing, Kill Screen full text) returned 403 or a paywall; where a fact comes only from a search-result snippet, it is marked "(snippet only)".

## 1. What the Firewatch team said about the look

### Takeaway
The look started from one Olly Moss painting in the style of New Deal era National Park posters; Jane Ng's job was to keep that flat, layered, poster feel in 3D. The sky drives most of the colour, a fog pass tints each depth layer by sampling a colour gradient by distance, a colour script tied to story beats sets the mood of each scene, and detail goes only where the story needs it.

### Cited Findings
- The talk: "The Art of Firewatch", Jane Ng (Campo Santo), GDC 2015, about translating a bold 2D graphic style into an explorable 3D world, shown through concept art and the tools a small team used. Source: [GDC Vault session page](https://www.gdcvault.com/play/1023707/contactUs) (snippet only).
- Origin of the look: development began with a single painting by Olly Moss, co-director and Campo Santo co-founder, drawing on New Deal era National Park Service posters with bold colours and a poster-like direction. Critics called it "silkscreened poster art come to life". Source: [Wikipedia, Firewatch](https://en.wikipedia.org/wiki/Firewatch).
- Ng called Moss's poster the key art and the starting point for the 3D look; she credited his designs with communicating an idea and the emotional tone of a subject. Source: [Thumbsticks, GDC 2015 write-up](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).
- Sky as the main colour source: because the game is outdoors, the sky sometimes fills half the screen and determines most of the colour. The team tried their own skyboxes and settled on Marmoset Skyshop (a Unity lighting extension); a dynamic lighting setup changes colours in real time as the player moves. Source: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).
- Layers: the palette uses bold, saturated colours in distinct layers, each layer adding to depth and distance; fog supplements the lighting to create depth and distance. Source: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).
- Colour script and mood: a colour script tied to key narrative moments kept the look consistent; Ng stressed that colour drives the mood of each scene (a tense or spooky moment should not get a bright, festive palette). Each story moment had a target mood. Source: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).
- Shape language: much of the composition is flat shapes with strong, distinctive silhouettes and abstract internal detail; Ng said the style would have translated easily to 2D, the hard part was 3D. Source: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).
- Level of detail follows the story: narratively important objects get more texture detail, signalling to the player that they matter. Source: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).
- Stylised but believable: the world must feel real (Henry's cabin should feel livable); Ng aimed for objects that feel real rather than hyper-detailed, sized things by how they felt rather than by real measurements, and put atmosphere over realism. Sources: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch); [Game Developer, 23 trees](https://gamedeveloper.com/design/environmental-artist-jane-ng-only-made-23-unique-trees-for-i-firewatch-i-).
- Trees: Ng made only 23 unique trees (hand-built; SpeedTree was not yet in Unity), reused thousands of times; she noted pines are especially hard in 3D. A custom shader gives distant foliage the simpler look of Moss's style. Sources: [Game Developer](https://gamedeveloper.com/design/environmental-artist-jane-ng-only-made-23-unique-trees-for-i-firewatch-i-); [Wikipedia, Firewatch](https://en.wikipedia.org/wiki/Firewatch).
- The fog technique, as rebuilt by a developer from the GDC video: a post-process pass where, for each pixel, the fog colour is fetched from a gradient texture by depth. He copied two gradients shown in the talk (one blue, one brown). It replaces the engine's built-in fog and does not apply to transparent objects (they do not write depth). Source: [grrava blog, Stylistic fog from Firewatch](https://grrava.blogspot.com/2018/08/stylistic-fog-from-firewatch-with.html).
- Same blog, follow-up: plain depth-based fog makes the gradient shift when the camera turns, so distance-based fog works better. Source: [grrava blog, August 2018 archive](https://grrava.blogspot.com/2018/08) (snippet only; the follow-up post itself was not opened).
- Other rebuilds of the same idea: a Unity asset "inspired by the Firewatch talk" lets you edit the gradient or use a ramp image ([itch.io, Gradient Fog for Unity](https://hyphinett.itch.io/gradient-fog-for-unity), snippet only); a tutorial plans a gradient that controls both fog colour and density (alpha) by distance from the camera ([wodzuu, gradient fog](https://wodzuu.github.io/fog)). One commercial pack is reported to sample a 2D ramp with distance on x and height on y ([Fab listing](https://www.fab.com/listings/c9b42fae-ddf2-45ed-81ea-cc8348c6b369?lang=es-mx), snippet only).
- Colour grading: Amplify Color is named among the tools, described as a main tool for colour grading and overall mood control. Sources: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch) (tool list: Playmaker, SECTR, NGUI, Amplify, Skyshop); [amplify.pt, Firewatch page](https://amplify.pt/firewatch-amplify-color/) (snippet only).
- Moss on framing: in a New Yorker interview he discussed how hard it is to frame shots for a player compared with framing an illustration. Source: [The Rumpus, Watching Firewatch](https://therumpus.net/2016/02/watching-firewatch/) (snippet only).

### Inferences
- The fog is the heart of the look and is easy to port to 2D: a 2D layered scene already knows each layer's depth, so the "gradient texture by depth" becomes "one colour (plus alpha) per layer, read from a depth gradient". No per-pixel pass is needed.
- Because the fog colour comes from a gradient, not a single colour, near layers can tint toward one hue (say warm brown) while far layers tint toward another (sky blue or horizon peach). That is what makes Firewatch fog look painted rather than grey.
- "The sky decides the colour" translates to: pick the sky gradient first per scene, derive the fog gradient from the sky's horizon colour, then derive ridge colours by mixing. One input (time of day plus mood) drives everything.
- The LOD rule is a storytelling rule: the landscape stays flat and simple; the object the scene is about (a crib, a lit window, a bike, a grave) gets the most shapes and the strongest contrast.

### Gaps
- The exact gradient shapes, stop positions and colours shown in the talk could not be verified (the talk was not watched; the grrava images were not inspected).
- No verified source describes Firewatch's per-day palettes or how the colour script moves across the story's days (for example the smoke and fire days). Commentary claiming warm oranges, reds and purples came from a fan wiki ([shapes.inc](https://shapes.inc/fandom/firewatch/author)) and student blogs ([Ulster blog](https://blogs.ulster.ac.uk/bethbuchanan/2021/03/05/ixd104-further-looking-into-the-art-of-firewatch)) and is not reliable.
- Olly Moss's own words on palette and shape were not found in a primary source in this session.

## 2. Techniques to fake it in Canvas 2D, and phone performance

### Takeaway
Build the scene back to front: sky gradient, glows, then 4 to 9 ridge layers whose colour moves toward the fog/horizon colour with distance and whose spacing shrinks toward the horizon, each ridge filled with a vertical gradient that fades into mist at its base. Generate ridges with midpoint displacement or summed noise, render each layer once to an offscreen canvas, then only composite and offset during play. Avoid ctx.filter and shadowBlur on Safari.

### Cited Findings
Atmospheric perspective (the physics the fog imitates)
- With distance, contrast between object and background drops, internal detail contrast drops, and colour desaturates and drifts toward the background colour: usually blue in daylight, reddish near sunrise or sunset, grey in fog. It lowers contrast across all scales, unlike blur, which only removes fine detail. Source: [Wikipedia, Aerial perspective](https://en.wikipedia.org/wiki/Aerial_perspective).

Firewatch-style parallax on the web
- The well-known Firewatch website header was rebuilt with one div per illustration layer, transparent PNG layers about 1920 px wide so they tile horizontally, and data attributes holding a speed per layer, with smaller speeds for background layers. Source: [Medium, Recreating the Firewatch Parallax Effect](https://medium.com/@hamstu/recreating-the-firewatch-parallax-effect-213694d42f4e) (page returned 403; snippet only).
- A pure-CSS version pushes each layer back on the z axis with 3D transforms; a forum thread notes Chrome and Safari kept scrolling past the end of the parallax cover. Sources: [Medium, CSS parallax effect](https://medium.com/@samdbeckham/css-parallax-effect-b6ce9d71c0bb) (snippet only); [Treehouse thread](https://teamtreehouse.com/community/css-parallax-perspective-scrolling) (snippet only).

Ridge generation
- 1D midpoint displacement: segment count is the next power of two over the width; endpoints start near mid height plus a random offset; each pass sets every midpoint to the average of its neighbours plus a random offset in [-displace, +displace], then multiplies displace by a roughness factor (examples 0.5 and 0.7; a stronger reduction gives smoother hills). Equal endpoints make the strip wrap; for scrolling, keep two arrays and generate the next from a seed. Source: [somethinghitme, Simple 2D terrain with midpoint displacement](https://somethinghitme.com/2013/11/11/simple-2d-terrain-with-midpoint-displacement/).
- Same idea for SVG ridge dividers: reduce allowed movement each iteration so smaller segments get finer detail. Source: [DEV, SVG generative mountain ridge dividers](https://dev.to/accudio/svg-generative-mountain-ridge-dividers-2j4d) (snippet only).
- A layered generative mountains sketch (Processing, 800x600, HSB): 9 ridges; ridge baselines start at y=300 for the nearest and step back by 30/1.2^j, so spacing shrinks toward the horizon; each ridge height = slow sine + faster sine + low-frequency Perlin noise (main shape) + high-frequency noise (a fine "canopy" texture), with amplitudes scaled up for nearer ridges; colour lerped from a far colour (HSB 230,25,90, light desaturated blue-violet, also the background) to a near colour (HSB 210,70,10, dark saturated blue-green); mist drawn as horizontal white lines every 3 px from the ridge base up, alpha from 0 at the ridge line to a maximum at the bottom, with stronger mist on farther ridges. The code has quirks (lerp amount above 1, a noise counter never reset). Source: [Processing forum, Generative Mountains](https://discourse.processing.org/t/generative-mountains/28125).
- A sky gradient via vertical colour interpolation plus Perlin-noise hills is the standard teaching recipe for generative landscapes. Source: [Codefinity lesson](https://codefinity.com/de/courses/v2/b662e376-9b00-4944-80e3-f5e79af442b2/0b9566eb-23f5-4d37-82a2-0205f61883c7/8d66fd30-fea6-4f9b-b3b5-704cf6c61b12) (snippet only).
- A port of iterative midpoint displacement draws 4 scaled terrain layers back to front. Source: [procgen9000](https://gh.r-mj.com/halr9000/procgen9000) (snippet only).

Canvas 2D performance (general)
- MDN performance tips: pre-render repeated or static drawing on an offscreen canvas and copy it with drawImage; use integer coordinates (sub-pixel positions cost anti-aliasing); do not scale images inside drawImage; split rarely changing and often changing content into stacked canvases; put large static backgrounds in CSS; use getContext("2d", { alpha: false }) when no transparency is needed; scale the backing store by devicePixelRatio and ctx.scale(dpr, dpr) with the CSS size unchanged; batch draw calls; avoid needless state changes; redraw only what changed; avoid shadowBlur; avoid text drawing per frame; use requestAnimationFrame. Source: [MDN, Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas).
- ctx.filter (CSS-style blur(), saturate() etc. on canvas drawing) is "Limited availability". Can I use lists Safari desktop 18.0 onward and iOS Safari 18.0 onward as "disabled by default"; earlier versions unsupported. Sources: [MDN, filter](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter); [Can I use, canvas filter](https://caniuse.com/mdn-api_canvasrenderingcontext2d_filter).

Safari canvas limits (iPhone)
- A single canvas over 16,777,216 pixels (width x height) triggers a Safari error as soon as a 2D context is used; one side may exceed 4096 if the total stays under the cap. Source: [PQINA, Canvas area exceeds the maximum limit](https://pqina.nl/blog/canvas-area-exceeds-the-maximum-limit/).
- Safari also has a total canvas memory budget; it keeps unused canvases alive, and the suggested fix is to shrink a finished canvas to 1x1 to release it. Reported budgets vary: 384 MB on iOS 15, 256 or 288 MB in a WebKit bug, 224 MB in Apple forum threads. These are blogs, forums and bug reports, not official figures. Sources: [PQINA, Total canvas memory](https://www.pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/); [WebKit bug 190280](https://lists.webkit.org/pipermail/webkit-unassigned/2018-October/844246.html); [Apple Developer forums](https://developer.apple.com/forums/thread/112218).

### Inferences
The painter, as a recipe (derived from the findings above; values are starting points to tune, not sourced numbers):

1. Scene input: `{ time, season, mood }` maps to a palette object `{ skyTop, skyMid, skyHorizon, glow, fogNear, fogFar, ridgeNear, accent, light }` (section 3). Everything below reads only from it.
2. Sky: one vertical linearGradient, 3 to 4 stops (top, mid at about 0.45, horizon at the lowest ridge's top, a slightly lighter band right at the horizon). Draw once per scene to its own canvas, or as a CSS background under an alpha canvas.
3. Glows: sun or moon as a radialGradient, centre colour at alpha 0.5 to 0.8 fading to alpha 0 at 3 to 6 times the disc radius; draw the disc as a flat circle on top. A second, wide and faint radial gradient (alpha 0.15 to 0.25) lightens the whole horizon on the sun's side. No shadowBlur.
4. Depth gradient (the Firewatch fog, in 2D): for N layers, give each a depth d from 0 (nearest) to 1 (farthest). Build the fog gradient as a JS function, not a texture: fogColour(d) = mix(fogNear, fogFar, d) and fogAmount(d) = maxFog * d^g with maxFog about 0.85 to 0.95 and g about 0.6 to 1.0. Layer colour = mix(ridgeNear, fogColour(d), fogAmount(d)). The farthest layer ends almost at the sky horizon colour; the nearest stays dark and saturated. Mixing in OKLab or linear RGB avoids muddy greys in the middle; sRGB mixing is simpler and acceptable at this flatness.
5. Layer count: 5 to 7 on a phone is a good balance (the references range from 4 to 9). Baselines step toward the horizon with shrinking gaps, for example gap_j = g0 / 1.2^j as in the Processing sketch. Far layers: small amplitude, higher-frequency detail relative to size, smoother; near layers: large amplitude, broader shapes, carry the trees.
6. Ridge shape: midpoint displacement with roughness 0.5 (soft hills) to 0.65 (mountains), or a sum of 2 sines plus 2 octaves of value noise. Seed every layer so a scene redraws identically. Make strips 1.5x to 2x the screen width with equal endpoints if they need to wrap during parallax.
7. Inside each ridge: fill the path with a vertical linearGradient from the layer colour at the ridge's top to the fog colour of that layer at its base (valleys fill with mist). This is the cheap replacement for the per-pixel fog and for the Processing mist lines.
8. Fog bands: between chosen layers, a full-width rectangle with a vertical gradient from fogColour at alpha 0.0 to alpha 0.35 to 0.6 and back to 0, 30 to 80 CSS px tall. Two or three bands are enough. For drifting mist, pre-render one band and translate it slowly.
9. Pines: one flat colour per layer, the same colour as the ridge it stands on, so trees read as part of the silhouette (like the simplified distant foliage). A pine is a narrow isosceles triangle with 3 to 6 zigzag steps per side plus an optional 1 px trunk. Scatter along the ridge path, heights scaled by (1 - d), denser on near layers, none on the two farthest. Draw them into the same path as the ridge so the whole layer is one fill.
10. Rim light: re-stroke the top edge of the 1 or 2 nearest ridges with a 1 to 2 px line in the glow colour at alpha 0.4 to 0.7, only on the side facing the sun (multiply alpha by a falloff with horizontal distance from the sun). Same trick for a figure's outline.
11. Stars: 80 to 200 points on the night sky canvas, size 0.5 to 1.5 px, alpha random 0.3 to 1, density falling toward the horizon; twinkle a small subset by redrawing only those or by animating the opacity of a separate canvas.
12. Birds: a bird is two quadratic curves forming a shallow "v", 1.5 px stroke, the colour of the nearest silhouette; flap by moving the control points up and down; 3 to 7 birds per flock, slight per-bird phase offset.
13. Lit windows: small warm rectangles on dark house silhouettes, plus a soft radialGradient halo (alpha 0.2 to 0.35) instead of shadowBlur. Lit windows carry the emotional "home" signal in blue-hour and night scenes.
14. People: flat silhouettes in the colour of the nearest layer (or slightly darker), rim-lit on the sun side; no facial features (section 4).
15. Performance plan: render every static layer once to its own offscreen canvas at the scene start; per frame only drawImage the layers at integer offsets (parallax speed proportional to 1 - d), plus the few animated items. Cap the backing-store DPR at 2 for layer canvases: a full-screen 390x844 CSS px canvas costs about 11.9 MB at DPR 3 (1170x2532 px x 4 bytes) and about 5.3 MB at DPR 2, so 8 full-screen layers at DPR 3 would use about 95 MB of a budget reported as low as 224 MB. Crop each layer canvas to the band it actually covers (far ridges are short strips). Shrink canvases of a finished scene to 1x1. Never rely on ctx.filter (off by default in Safari); bake blur or desaturation into colours instead. Use { alpha: false } for the bottom sky canvas.

### Gaps
- The original Firewatch website header's layer count and colours could not be confirmed (the Medium rebuild returned 403).
- No CodePen was found that recreates the full Firewatch look in Canvas 2D; the recipe above is assembled from separate sources.
- No measured performance numbers for layered canvas scenes on current iPhones were found; profile on a real device.

## 3. Example palettes and palette structure

### Takeaway
No official Firewatch palette exists in any source found; community palettes are approximations. The usable structure is: per scene, a sky gradient (top, mid, horizon), a glow colour, a fog gradient (near and far), one near-silhouette colour, and one warm accent for lights. Far layers are always derived by mixing toward the horizon colour, never picked by hand.

### Cited Findings
- Community "Firewatch" colours: a colour named Firewatch at #ee8866 (warm salmon orange) appears on two colorswall palettes; one Firewatch-named palette includes #4b5b6e (slate blue-grey), #ffd9a6 (pale apricot), #bfd5eb (pale sky) and #e3e3ea. Near-duplicates #ed835f and #ee9169 appear on a colour-name site. All user-made, not authoritative. Sources: [colorswall 536704](https://colorswall.com/palette/536704); [colorswall 489781](https://colorswall.com/palette/489781); [66colorful #ed835f](https://66colorful.com/color/ed835f) (all snippet only).
- A working far/near structure in HSB: far ridges and background at low saturation and high brightness (230, 25, 90), near ridges at high saturation and very low brightness (210, 70, 10), clouds a light rose (330, 25, 100), mist white. Source: [Processing forum, Generative Mountains](https://discourse.processing.org/t/generative-mountains/28125).
- Physical direction of the shift: daylight distance shifts toward blue, sunrise and sunset toward red, fog toward desaturated grey. Source: [Wikipedia, Aerial perspective](https://en.wikipedia.org/wiki/Aerial_perspective).
- Alto's Adventure's artist is described (in a student analysis, not by the artist) as saturating the foreground and tinting the background, using a limited palette per area and fading gradients to suggest glare from sun, moon or stars. Source: [Ulster student blog on Harry Nesbitt](https://blogs.ulster.ac.uk/cormacmccann/?p=794) (secondary).
- Alto's Odyssey uses brighter, more confident colour than Alto's Adventure to match its theme of leaving comfort zones. Source: [Game Developer, Road to the IGF: Team Alto](https://www.gamedeveloper.com/business/road-to-the-igf-team-alto-s-i-alto-s-odyssey-i-).

### Inferences
Proposed starting palettes for the project (invented here as a structure to tune; NOT taken from Firewatch or any source). Order: skyTop / skyMid / skyHorizon / glow / fogFar / fogNear / ridgeNear / accent.

- Dawn: #2e3a5c / #8a6f9e / #f4b6a0 / #ffe3b8 / #e8b9b0 / #9a7f95 / #2a2540 / #ffd27a. Soft pink-peach horizon, violet top, low contrast.
- Morning: #5d93c9 / #9cc4e0 / #d9ebef / #fff4d6 / #c4dce4 / #7fa3a8 / #24413f / #ffcf6e. Clear, cool-fresh, gentle warmth in the glow.
- Noon: #3f86c6 / #78b3dd / #b9dcec / #fffbea / #a9cde0 / #6f97a0 / #1f3b2e / #f2c14e. Highest brightness, short fog, crisp silhouettes.
- Golden hour: #6b8fb3 / #e8b77a / #f6c97a / #fff0b0 / #e9b26f / #a8674a / #3b2418 / #ffe08a. Warm yellow-orange, long rim lights.
- Dusk: #3b2c5a / #b24a5c / #f08a4b / #ffd27a / #d8735a / #7a3a4e / #1e1424 / #ffc46b. Peak saturation, high contrast, the Firewatch poster mood in spirit.
- Blue hour: #1b2550 / #34437a / #5a6fa3 / #a9b8e0 / #4b5d8f / #2c3766 / #0f1530 / #ffc46b. Everything blue, warm windows become the only warm colour.
- Night: #070b1c / #10183a / #1c2747 / #e8eef7 (moon) / #1a2442 / #121a33 / #05070f / #ffb84d. Stars on, fog almost the sky colour, lights as accents.
- Snow: #8fa4bd / #b7c6d6 / #dfe6ee / #ffffff / #dfe6ee / #9aabbf / #2e3a4a / #f4a259. Very high brightness, very low saturation, blue shadows.
- Autumn: #7d93a8 / #c9b49a / #e9c9a0 / #ffe6b0 / #d9a87a / #8a5a3c / #4a2418 / #c4552b (trees) with #e39a3b as a second accent.

Rules to keep any palette in the style:
- Value steps between layers should be even and large enough to read at 390 px: roughly 8 to 15 points of lightness (L in OKLCH or HSL) per layer.
- Saturation peaks in the sky glow and the accent, not in the far layers; far layers sit within a few lightness points of the horizon.
- One warm accent per cool scene (a window, a scarf, a fire), one cool shadow per warm scene; it keeps flat palettes from looking like a gradient filter.
- Snow and fog scenes keep their structure by value, not hue.

### Gaps
- No primary Firewatch palette, colour script image or time-of-day colour set with hex values was found. Sampling stills is possible but would edge toward copying; the project should build its own.
- No authoritative per-time-of-day hex reference (a "sky by the hour" set) was found in this session.

## 4. Faceless and simple characters, and player identification

### Takeaway
McCloud's claim (simple, iconic faces let readers see themselves; detailed ones read as "someone else") is influential but mostly argued, not measured. The best direct test (2024) found cartoonish characters narrowed an identification gap between groups, but found that simpler backgrounds, not detailed ones, raised identification, contradicting part of McCloud. Games that want the player to be the character remove names, faces, voices and marketing shots of the hero, and let the environment carry the emotion.

### Cited Findings
- McCloud, Understanding Comics (1994): "amplification through simplification" is shown with a face simplified step by step while staying recognisable; cartooning focuses on chosen details rather than just removing detail. A realistic face reads as another person; a cartoon face invites you to see yourself. Sources: [Understanding Comics course PDF, UCSC](https://cowell.ucsc.edu/academics/courses/Understanding%20comics.pdf) (snippet only); [SuperSummary](https://www.supersummary.com/understanding-comics/introduction-chapter-2-summary) (snippet only).
- Masking: McCloud's term for iconic characters acting as a mask the reader wears. Three forms: iconic characters in realistic settings; iconic characters beside realistic characters; simple objects suddenly drawn in realistic detail. Critiques: what counts as "simple" is cultural (Salamanca and Rodríguez 2017); readers may connect through personality and plot, not just design (Frome 1999); Hunt (2002) argues Congolese readers may struggle to identify with Tintin. Source: [Wikipedia, Masking (comics)](https://en.wikipedia.org/wiki/Masking_(comics)).
- Empirical test, Li and colleagues, Visual Communication, 2024, "Visual realism and character identification in science comics": varied character realism and background detail and measured identification. Cartoonish characters reduced the identification gap between Black and white US participants; less detailed backgrounds produced higher identification across conditions, contrary to McCloud. Sources: [metatoc listing](https://metatoc.com/papers/180897-visual-realism-and-character-identification-in-science-comics-an-empirical-study-testing-mccloud-s-masking-effect-theory); [Wikipedia, Masking](https://en.wikipedia.org/wiki/Masking_(comics)) (abstract-level only; full text and sample size not seen).
- Kendall et al. (2016), Cognitive Research: Principles and Implications: faces ranging from photorealistic to fully iconic; emotion identification was more accurate for more cartoonised faces at short presentation times. Measures emotion reading, not identification. Source: [Springer, Cognitive Research 2016](https://link.springer.com/article/10.1186/s41235-016-0021-8) (snippet only).
- Tasić (2018), Visual Communication: three questionnaires on McCloud's facial-expression claims found the tasks harder than his proposal would predict. Source: [UvA repository](https://dare.uva.nl/id/cf94ee41-3c08-4407-93ac-547a8ef5e7cb) (snippet only).
- Journey (thatgamecompany, 2012): a nameless cloaked figure with no visible arms; other players' names are hidden until the credits and the only communication is a musical chime, because the developers felt names, text or voice would let players' biases get in the way. The story follows Campbell's monomyth and was meant to represent stages of life. Chen designed it "like a Japanese garden", removing anything not serving the intended emotion; 3 of 25 testers cried at the end. Source: [Wikipedia, Journey](https://en.wikipedia.org/wiki/Journey_(2012_video_game)).
- Journey's art director Matt Nava aimed for art that was cross-cultural and ambiguous in character, architecture and landscape; the character went from humanoid to very detailed and back to as minimal as possible. Sources: [Push Square interview](https://www.pushsquare.com/news/2012/02/interview_thatgamecompany_journey) (snippet only); [GamesRadar, 10th anniversary thread](https://www.gamesradar.com/journey-developer-reveals-how-the-iconic-cape-was-created-in-10th-anniversary-thread) (snippet only).
- Alto's Adventure and Odyssey: Harry Nesbitt asks how far a form can be simplified before only its essence remains, giving an impression so players fill gaps with imagination; the environment is the main character, Alto and the others secondary; the team avoids showing characters in marketing so players can see themselves in the world. Source: [Game Developer, Road to the IGF: Team Alto](https://www.gamedeveloper.com/business/road-to-the-igf-team-alto-s-i-alto-s-odyssey-i-).
- Firewatch is first person; one reviewer noted players can see Henry's body. Source: [Wikipedia, Firewatch](https://en.wikipedia.org/wiki/Firewatch).
- Gris: the game begins in black and white to reflect the protagonist's inner world; colour is the most important element. Source: [Gamereactor interview with Nomada Studio](https://www.gamereactor.eu/what-does-gris-mean-we-talk-to-nomada-studio/).

### Inferences
- For a second-person life story, the mask works best if the figure is a flat silhouette with posture doing the acting: head angle, shoulder line, the gap between two figures, a hand held or let go. No eyes or mouth anywhere, including other people, so the player never sees "someone else's" face beside their own.
- Following Li et al. 2024, keep backgrounds simple where identification matters most (the key moments of each act); save background detail for wide establishing shots. This also matches Firewatch's "detail where the story is" rule.
- Following Alto: let the landscape carry the feeling; keep the figure small in frame for reflective beats, larger only for intimate beats.
- Identity cues (gender, ethnicity, body type) should be minimal and, where possible, ambiguous at small size, which Li et al. suggests narrows identification gaps across players.
- Age can be shown without a face: proportion (head to body ratio for a baby and child), height relative to others, posture (upright, then slightly bent), props (a stroller, a bike, a briefcase, a cane).

### Gaps
- Florence, A Short Hike, Old Man's Journey and Gris's character design statements were not found in this session (the one search returned unrelated results). Their handling of faces is not verified here.
- Firewatch's Delilah being heard but never seen is widely reported but was not verified in this session.
- No study was found that tests faceless (as opposed to simplified) characters and player identification in games specifically.

## 5. Colour and emotion: colour scripts, research, and a plan for the acts of a life

### Takeaway
Research is consistent that brightness mostly drives pleasantness and saturation mostly drives arousal (Valdez and Mehrabian 1994; Wilms and Oberfeld 2018 adds that hue and the combinations matter). Film and games use this as an arc: saturation and warmth with love and adventure, drained grey for loss, colour returning one step at a time for recovery (Up, Gris). For a life story: bright and soft at birth, bright and saturated in childhood, warm saturation peaks in love, cooler and flatter in routine, near-monochrome in grief, colour returning through warm accents, and a bright, low-saturation, warm calm in old age.

### Cited Findings
Research
- Valdez and Mehrabian (1994), "Effects of color on emotions", Journal of Experimental Psychology: General 123, 394 to 409: Munsell chips rated on Pleasure-Arousal-Dominance. Brightness and saturation had the largest, most consistent effects. Standardised regressions: Pleasure = .69 Brightness + .22 Saturation; Arousal = -.31 Brightness + .60 Saturation; Dominance = -.76 Brightness + .32 Saturation. Blue, blue-green, green, red-purple, purple and purple-blue were most pleasant, yellow and green-yellow least; green-yellow, blue-green and green most arousing, purple-blue and yellow-red least. Sources: [PubMed 7996122](https://pubmed.ncbi.nlm.nih.gov/7996122/); [Scinapse record](https://www.scinapse.io/papers/2099270617) (abstract via search snippet; PubMed page blocked by a cookie wall).
- Wilms and Oberfeld (2018), "Color and emotion: effects of hue, saturation, and brightness", Psychological Research 82(5), 896 to 914: 3 hues (blue, green, red) x 3 saturations x 3 brightnesses on an LED display, 62 participants, self-report plus skin conductance and heart rate. Saturated and bright colours raised arousal; arousal rose from blue and green to red; valence was highest for saturated, bright colours and depended on hue; blue was more pleasant than other hues only at high saturation; achromatic colours briefly slowed heart rate, chromatic ones sped it up. Sources: [PubMed 28612080](https://pubmed.ncbi.nlm.nih.gov/28612080/); [author PDF](https://www.staff.uni-mainz.de/oberfeld/downloads/Wilms-Oberfeld2018_Article_ColorAndEmotionEffectsOfHueSat.pdf) (abstract via search snippet; the PDF did not parse).
- A later paper summarises that brightness raised arousal only at high saturation. Source: [Frontiers in Psychology 2025](https://www.frontiersin.org/articles/10.3389/fpsyg.2025.1593928/full) (snippet only).

Colour scripts
- Pixar's colour scripts: Ralph Eggleston planned Toy Story's colour scripts in chalk pastel as a stream-of-consciousness map of colour and value. Source: [Hyperallergic, The Art of Pixar review](https://hyperallergic.com/the-art-of-pixar-chronicle-books.md) (snippet only).
- Up: Lou Romano made the colour script from January to March 2008 and aimed to give more lighting information than abstract, tone-only scripts; the lighting team then refined it. The film's colour tracks the story: colour arrives with Ellie, Carl's world turns drab grey after her death, colour returns as he sets out with Russell, each new character adds colour and brightness, adventure scenes are bright and danger scenes dark. Sources: [/Film, Romano's colour script for Up](https://www.slashfilm.com/503975/cool-stuff-lou-romanos-color-script-for-pixars-up/); [Lou Romano blog, May 2009](https://louromano.blogspot.com/2009/05/) (snippet only).

Games
- Gris: starts in black and white; discovering and unlocking colour is the core mechanic (Conrad Roset's wish); each chapter is tied to a different colour; the arc moves from melancholy toward a lift at the end. Source: [Gamereactor, Nomada Studio interview](https://www.gamereactor.eu/what-does-gris-mean-we-talk-to-nomada-studio/).
- Nomada's first idea was a game that evolves visually, not only mechanically. Source: [MCV/Develop, 50 shades of Gris](https://www.mcvuk.com/development/50-shades-of-gris-how-nomada-studio-created-a-game-that-evolves-visually-not-only-mechanically).
- A critic reads Gris's levels as Kübler-Ross stages with colours: denial grey, anger red, bargaining green, depression blue, acceptance yellow. This is an interpretation, not a developer statement. Source: [A Garden of Stories, Colours of Grief](https://agardenofstories.substack.com/p/gris) (snippet only).
- Another analysis: the world becomes more complex, lighter and more colourful as the story goes on. Source: [Nicolle Lamerichs, Gris and grief](https://nicollelamerichs.com/2021/02/22/game-theory-gris-and-grief-in-games/) (snippet only).
- Journey's levels move from a sand desert through ruins to cold, snowy, windy heights and end at a glowing summit, designed as the hero's journey and stages of life. Source: [Wikipedia, Journey](https://en.wikipedia.org/wiki/Journey_(2012_video_game)).
- Firewatch: colour script tied to narrative moments; colour drives each scene's mood. Source: [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).

### Inferences
Working rule from the research: brightness = how good it feels; saturation = how intense it feels; hue = secondary flavour. Draining colour reads as loss; returning colour reads as healing, best done gradually and one hue at a time.

Proposed colour plan for the acts of a life (a starting colour script, to be drawn as a strip of thumbnails before building scenes):

| Act | Time of day / season | Brightness | Saturation | Temperature | Notes |
|---|---|---|---|---|---|
| Birth | Dawn, late spring | High | Low to medium | Warm pastel | Calm and tender: bright (pleasant) but low saturation (low arousal). Soft fog, no hard silhouettes. |
| Early childhood | Morning to noon, summer | Highest | High | Warm with clear blue sky | Wonder; the most saturated greens and blues. Few layers, big simple shapes. |
| School years, adolescence | Afternoon to dusk, autumn | Medium, more contrast | High, shifting | Warm to cool | Volatility: dusk purples and oranges, stronger value contrast, first night scenes. |
| First love, young adult | Golden hour, summer | High | Peak warm saturation | Warm | The Up montage logic: colour arrives with the other person. Long rim lights on two silhouettes. |
| Work, building a life | Noon to afternoon, all seasons | Medium-high | Medium, flatter | Neutral to slightly cool | Routine: less glow, more even light; one warm accent (home window) carries the feeling. |
| Parenthood | Morning and blue hour | Medium-high | Medium-high | Warm accents in cool scenes | New colour enters with the child (each new person adds colour, as in Up). Lit windows at night. |
| Loss, grief | Overcast, winter, snow or blue hour | Low to medium | Very low (near monochrome) | Cool | Drain colour hard (the Up "drab grey" beat, Gris's opening). Keep value structure so it stays readable. |
| Recovery | Late winter to spring dawn | Rising | Returning, one hue at a time | Cool to warm | Gris logic: reintroduce colour gradually; the first warm accent should be a meaningful object. |
| Old age | Late golden hour, autumn | High | Low to medium | Warm | Calm and content: bright (pleasant) with low saturation (low arousal). Long soft fog, fewer layers. |
| End | Blue hour into night, clear sky | Low but not black | Low, with warm points | Cool field, warm lights | Stars and lit windows; ending on light points, not darkness. Optionally a closing dawn to bookend the birth. |

Implementation notes:
- Drive two global knobs per act, sat and val (0 to 1), applied when the palette is built: convert each palette colour to OKLCH, scale chroma by sat and lightness toward a target by val, then derive fog and layers. This avoids ctx.filter (off in Safari) and keeps one code path.
- Grief should be shown mostly by saturation, not by darkness alone: darkness lowers pleasantness but also reads as danger (Up uses dark for danger scenes, grey for loss).
- Keep blue present in the calm acts: blue rates as pleasant and low arousal in both studies, especially when saturated.
- Reserve the highest saturation plus brightness for a few peak moments so they keep their power (the colour script should be read as a whole strip, as Pixar does).

### Gaps
- Romano's own description of the Up arc was not read directly; the arc above is /Film's reading of the script.
- Ralph Eggleston's involvement in Up specifically is not confirmed by any source found.
- No developer statement was found confirming Gris's exact colour order or a stage-of-grief mapping.
- No study was found that tests colour arcs over time (as opposed to single colour patches) on emotion in narrative media; the colour plan is an inference from static-colour studies plus film and game practice.
- Cross-cultural differences in colour meaning were not researched here.
