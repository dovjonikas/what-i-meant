# Art, animation and audio pipeline for a solo web story-game creator (late October 2026)

Scope: tools and techniques to make the look and sound of each story, where every story has a very different visual style. Constraints: free or cheap, Windows 11 PC, browser target, phones first, hosted on GitHub Pages. Research date: 2026-10-29. Prices are USD unless stated. Where a source is a third-party blog or aggregator, it is flagged.

Cross-cutting hosting constraint (applies to every style): GitHub Pages caps a published site at 1 GB, recommends a source repo of at most 1 GB, has a soft bandwidth limit of 100 GB per month, a soft limit of 10 builds per hour (not applied when deploying with a custom GitHub Actions workflow), and fails any deployment running longer than 10 minutes. The limits page lists no per-file size limit for Pages itself - [GitHub Docs: GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

## 1. Pixel art: editors, palettes, animation, sprite-sheet export, crisp on any phone

### Takeaway
Aseprite (one-time $19.99, v1.3.17 as of Feb 2026) is still the default pixel-art and animation tool, and its EULA explicitly allows compiling it yourself for free and using the result for commercial game assets; Pixelorama (MIT, free, very active in 2025-2026) is the best fully open-source alternative, while LibreSprite and Piskel look stalled. Crispness on phones comes from integer scaling plus `image-rendering: pixelated` and a canvas backing store sized by `devicePixelRatio`.

### Cited Findings
**Aseprite**
- Price: "$19.99/USD is the minimum pledge amount to get the convenient .exe and .dmg files of the 1.x version series"; you may pay more - [Aseprite FAQ](https://www.aseprite.org/faq/)
- Licence: official packages use the Aseprite EULA; "the only restriction" is that you cannot redistribute Aseprite to third parties - [Aseprite FAQ](https://www.aseprite.org/faq/)
- Compiling free: the FAQ says you can download the source, compile it, use it for personal purposes, and "still compile the source code, and use the program to create your assets for commercial games"; your own creations can go "in any product (personal or commercial)" even when made with a self-compiled build - [Aseprite FAQ](https://www.aseprite.org/faq/). (An older itch.io commenter warned of commercial risk; the official FAQ contradicts that worry - [itch.io post](https://itch.io/post/806912))
- What compiling costs you: you build for each OS yourself, fix build problems, and manage updates; the paid version gives a Windows installer, portable zip and macOS dmg - [DEV Community: building Aseprite from source](https://dev.to/bsymbolic/building-aseprite-from-source-a-paid-pixel-art-editor-free-if-you-compile-it-44h3)
- Purchase channels: official site, Steam, itch.io (also Humble, Gumroad for older updates); Steam key gives auto-updates; it is DRM-free (can launch the exe directly, not through Steam) - [Aseprite FAQ](https://www.aseprite.org/faq/); price confirmed as one-time with no subscription by a third-party review updated 2026-07-19 - [Gappsy review](https://gappsy.com/tools/aseprite/)
- Latest stable: v1.3.17, released 2026-02-25 - [Wikipedia: Aseprite](https://en.wikipedia.org/wiki/Aseprite)

**Pixelorama (free, MIT, built on Godot)**
- v1.1 released 2025-03-28 with tilemap layers, audio layers, indexed mode, and a new text tool - [Pixelorama devlog list (itch.io)](https://orama-interactive.itch.io/pixelorama/devlog/1283136/pixelorama-v118-is-out)
- v1.1.1 (2025-05-06) isometric and hexagonal tilemap shapes; v1.1.2 on-canvas rotate and skew of selections (date conflict: itch.io lists 2025-06-26, a patch page lists 2025-07-30); v1.1.6 (Oct 2025) diagonal symmetry, moved to Godot 4.5.1 (older extensions break) - [Pixelorama v1.1.6+ devlogs](https://orama-interactive.itch.io/pixelorama/devlog/1487558/pixelorama-v119-is-out); [Adaptiva patch page](https://adaptiva.com/patch-library/1000003901_patch_for_pixelorama)
- v1.1.9: "It is now finally possible to split layers when exporting spritesheets" - [Pixelorama v1.1.9 devlog](https://orama-interactive.itch.io/pixelorama/devlog/1487558/pixelorama-v119-is-out)
- v1.1.10: fix for a serious indexed-mode corruption bug; v1.2 entered beta with a keyframe timeline mode for animating non-destructive layer effects - [Pixelorama v1.1.10 devlog](https://orama-interactive.itch.io/pixelorama/devlog/1504423/pixelorama-v1110-is-out-v12-enters-its-beta-stage)
- Android build is experimental with an uncertain future; licence MIT - [Pixelorama devlogs (itch.io)](https://orama-interactive.itch.io/pixelorama/devlog/974079/pixelorama-v112-is-out)

**LibreSprite and Piskel**
- LibreSprite is a fork of the last GPLv2 commit of Aseprite (about 5,900 GitHub stars); a March 2026 blog says it is "hard to actively recommend as of 2026" and names Pixelorama as the most active fully open-source option; a Feb 2026 LinuxLinks review still covers it as current (layers, onion skin, palettes) - [Wikidocs blog (Korean), Mar 2026](https://wikidocs.net/blog/@jaehong/8794/); [LinuxLinks sprite-editor tag](https://www.linuxlinks.com/tag/sprite-editor/)
- Piskel: browser-based editor, Apache 2.0; a Flathub forum thread says packaging stalled and the person trying to revive it deleted their repository (thread undated) - [Flathub discourse](https://discourse.flathub.org/t/piskel-sprite-and-pixel-art-editor/2652); [SourceForge mirror](https://sourceforge.net/mirror/piskel)

**Crisp pixel art on phones**
- Pixel art looks crisp only at integer scales (1x, 2x, 3x); at 2.5x even with `image-rendering: pixelated` some pixels become 2 screen pixels wide and others 3; the trade-off is letterboxing - [Cinevva responsive game canvas tutorial](https://cinevva-site.pages.dev/tutorials/responsive-game-canvas)
- High-DPI fix: size the canvas backing store to CSS size times `devicePixelRatio`, then scale down with CSS - [web.dev: High DPI Canvas](https://web.dev/articles/canvas-hidipi)
- `image-rendering: pixelated` preserves hard edges and the rectangular shape of the original pixels - [CSS Portal: image-rendering](https://www.cssportal.com/css-properties/image-rendering.php)
- Real-device pitfalls: sprites looking wrong on high-DPR phones despite fine desktop emulation (Phaser/PIXI threads) - [html5gamedevs: Pixi blurry on mobile](https://www.html5gamedevs.com/topic/47981-pixi-game-looks-blurry-on-mobile-devices/)
- Scrolling without shimmer: keep physics in floats, snap only at render time, quantise the camera to 1/devicePixelRatio steps - [Kirupa forum](https://forum.kirupa.com/t/how-do-you-keep-pixel-art-scrolling-stable-without-smearing-or-jitter/680988)

### Inferences
- For a solo creator on Windows, paying $19.99 once (Steam or site) is cheaper in time than compiling every update; compiling is a fine path only if money is truly zero. Pixelorama is the right free pick and is the only one of the free three clearly in active development in 2025-2026.
- A robust phone recipe: pick a fixed low internal resolution (for example 320x180 or a portrait equivalent), compute `scale = floor(min(screenW*dpr / baseW, screenH*dpr / baseH))`, render to that, letterbox the rest with a colour from the palette, set `image-rendering: pixelated`, and recompute on resize/orientation change. On phones with dpr 3, integer scales are plentiful, so letterboxing is small.
- Lospec (lospec.com) palette list and the Aseprite command-line sprite-sheet export (sheet image plus JSON frame data) are standard practice in the community; I did not re-verify these pages this session, so treat specifics as general knowledge.

### Gaps
- Lospec's current palette-list features and licence of palettes were not fetched this session.
- Aseprite 1.3.x sprite-sheet CLI flags and the JSON format were not re-verified; check `aseprite.org/docs/cli`.
- Piskel's last commit date and LibreSprite's last release date were not confirmed from their repos.

## 2. A realistic or 3D look on the web: Blender to glTF, compression, phone scanning, Gaussian splats, baked lighting

### Takeaway
The stable path is Blender (5.0 Nov 2025, 5.1 Mar 2026) to glTF/GLB, then meshopt or Draco geometry compression plus KTX2 (ETC1S for colour, UASTC only for normals) textures, with lighting baked into lightmaps. Gaussian splatting became genuinely usable on phones in 2026: Spark (MIT, by World Labs, 2.0 in April 2026 with streamed level of detail) for three.js, and PlayCanvas/SuperSplat with streamed SOG and a WebGPU path; Scaniverse gives free on-device splat capture on a phone. Keep splat counts modest on phones (third-party advice: under about 1 million).

### Cited Findings
**Blender and glTF**
- Blender 5.0 released 2025-11-18; Blender 5.1 shipped 2026-03-17; 5.0/5.1 have caveats around Geometry Nodes breaking changes and glTF exporter defaults (vendor blog, treat with caution) - [StraySpark blog](https://www.strayspark.studio/blog/blender-5-1-features-game-developers-spring-2026)
- An add-on changelog reports syncing with Blender's official glTF exporter v5.1.20 (secondhand) - [AnimLib changelog](https://superhivemarket.com/products/animlib/versions)

**Compression (geometry and textures)**
- Meshopt gives typically 30-60% reduction versus Draco's 50-80%, but 5-10x faster decode; Draco for a few hero models, meshopt for scenes with many meshes; three.js supports both (DRACOLoader, MeshoptDecoder) (blog) - [jvinhit: three.js glTF compression](https://jvinhit.github.io/blog/threejs-16-gltf-compression-draco-meshopt-ktx2/)
- Draco and meshopt should not both be applied to one file (rule of thumb from a skill page, not a spec) - [skills.sh three.js model optimizer](https://skills.sh/openaec-foundation/three.js-claude-skill-package/threejs-agents-model-optimizer)
- KTX2 (Basis Universal): ETC1S preferred for colour maps on mobile, UASTC for normal maps; KTX2 stays compressed in GPU memory where a transcode target is supported - [jvinhit blog](https://jvinhit.github.io/blog/threejs-16-gltf-compression-draco-meshopt-ktx2/); [Needle Engine optimization docs](https://needle.gitbook.io/needle-engine/documentation/how-to-guides/optimization/index)
- Benchmark on DamagedHelmet: original 5.03 MB, ETC1S 2.65 MB, UASTC 13.44 MB (UASTC can be larger than the source file on disk) - [klich3 three.js glTF compression sample](https://github.com/klich3/threejs-gltf-with-compressions-sample)
- Claimed overall gains of 5-10x size reduction with no visible loss (unverified blog claim) - [svilenkovic: meshopt compression](https://svilenkovic.com/3d/meshopt-compression)

**Baked lighting**
- Workflow: build the scene in Blender, light it, bake to textures (Cycles), export, render in three.js; static lighting then costs nothing per frame - [Educative: Blender to bake lightmaps and AO](https://www.educative.io/courses/learn-threejs-for-computer-graphics/blender-to-bake-lightmaps-and-ambient-occlusion); [CodePen guide: three.js baking](https://codepen.io/alaingalvan/post/guide-three-js-baking)
- glTF export carries AO textures but not lightmaps; export the lightmap image separately and assign it to the material's `lightMap` in three.js (forum, possibly dated) - [BlenderArtists thread](https://blenderartists.org/t/blender-cycles-lightmap-baking/1169571)
- Needs a second UV channel for the lightmap; applied via `MeshStandardMaterial.lightMap`; the guide estimates 4-8 hours per scene (unverified) - [svilenkovic: how to bake lighting for web](https://www.svilenkovic.com/3d/how-to-bake-lighting-for-web)

**Phone scanning**
- Scaniverse: on-device scanning free; free "Classic" mode allows unlimited on-device Gaussian splat generation and mesh export; newer Plus ($20/month) and Pro ($50/month) tiers add cloud credits for 360-camera splats and commercial licensing; splats use compressed .SPZ (third-party sources) - [SkyeBrowse: Polycam vs Scaniverse (2026-07-03)](https://www.skyebrowse.com/news/posts/polycam-vs-scaniverse); [Radiance Fields: Luma AI alternatives](https://radiancefields.com/luma-ai-alternatives)
- Polycam: one 2026 review says Pro was dropped and plans are Free, Basic ($30/month or $150/year), Business ($400/year per user), Enterprise; another July 2026 post still lists Pro at about $26.99/month (conflict); free tier exports glTF only - [SkyeBrowse: best photogrammetry app](https://www.skyebrowse.com/news/posts/best-photogrammetry-app); [SkyeBrowse: Polycam vs Scaniverse](https://www.skyebrowse.com/news/posts/polycam-vs-scaniverse)
- RealityScan 2.0 (Epic, renamed from RealityCapture at 2.0): desktop free under $1M annual revenue, $1,250 per seat per year above; mainly camera alignment and COLMAP export ahead of splat training, not direct splat output; mobile app has no paid tier - [Radiance Fields: RealityScan](https://radiancefields.com/platforms/realityscan)

**Gaussian splatting on the web**
- Spark: open-source three.js splat renderer, MIT licence; README install snippets reference Spark 2.4.0 and examples use three@0.180.0; formats PLY (incl. compressed PLY), SPZ, SPLAT, KSPLAT, SOG - [GitHub: sparkjsdev/spark](https://github.com/sparkjsdev/spark)
- Spark claims it "renders fast even on low-powered mobile devices" and targets "98%+ WebGL2 support"; works on desktop, mobile and WebXR; features multi-object sorting, per-splat edits, a shader graph (Dyno) - [Spark docs overview](https://sparkjs.dev/docs/overview/)
- Spark 2.0 (World Labs, launched 2026-04-16): streamable level of detail, a .RAD format with precomputed LoD trees streamed via HTTP Range requests, a shared LRU "splat page table" with a fixed GPU memory pool (default 16M splats); reported able to stream 100M+ splat worlds to desktop, iOS, Android and VR via WebGL2 - [36Kr report](https://eu.36kr.com/en/p/3767429011800840); [Hunted.space listing](https://www.hunted.space/product/marble-by-world-labs)
- PlayCanvas: streamed SOG (Spatially Ordered Gaussians) built by the open-source splat-transform tool into LoD chunks fetched on demand, with a per-device Gaussian budget (leaner on mobile) - [PlayCanvas blog: WebGPU and streaming in SuperSplat](https://blog.playcanvas.com/new-in-supersplat-webgpu-and-streaming-bring-huge-performance-wins)
- PlayCanvas Engine 2.19.0 / SuperSplat 2.27.4 (June 2026) added a compute-based WebGPU splat renderer: vendor claims up to 5.7x faster on desktop for large scenes and about 2x on mobile versus WebGL2, with automatic WebGL2 fallback - [CG World (Japanese)](https://cgworld.jp/flashnews/01-202606-SuperSplat.html)
- One listing says SuperSplat 3.0 is WebGPU-only (unconfirmed elsewhere) - [Radiance Fields](https://radiancefields.com/playcanvas-opens-supersplat-to-third-party-tools-with-a-rest-publishing-api)
- SOG v2 support in PlayCanvas Engine 2.11.0, smaller files for mobile networks (promotional) - [Radiance Fields: PlayCanvas 2.11.0](https://radiancefields.com/playcanvas-v2-11-0-engine-released)
- Older forum caveat: compressed SOGS mainly cut load time, not runtime frame rate - [PlayCanvas forum](https://forum.playcanvas.com/t/compression-and-performance-for-gaussian-splats/39557)
- Third-party guide: keep splat counts under about 1 million for mobile; SuperSplat free hosting caps files at 200 MB (date unclear) - [Polyvia3D guide](https://polyvia3d.pages.dev/guides/gaussian-splatting-web-viewer)
- three.js: GaussianSplats3D (mkkellogg) was the first three.js implementation (Jan 2024); a three.js platform page says the r186 line adds a native Gaussian splat renderer (GaussianSplatMesh in TSL, WebGL and WebGPU) - unconfirmed whether merged; no source found saying GaussianSplats3D is deprecated - [Radiance Fields: three.js platform page](https://radiancefields.com/platforms/three-js); [GitHub: mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D)

**WebGPU on iPhone**
- WebGPU shipped in Safari 26 on macOS, iOS, iPadOS and visionOS (WWDC25 WebKit post, reposted) - [Privacy Guides repost of WebKit "Safari 26 beta"](https://discuss.privacyguides.net/t/news-from-wwdc25-webkit-in-safari-26-beta/28226); enabled by default on iOS 26 per a Sept 2025 secondary source - [Cinevva news 2025-09-15](https://app.cinevva.com/news/2025-09-15-safari-webgpu); iOS was the last major platform without it - [App Developer Magazine](https://appdevelopermagazine.com/webgpu-in-ios-26/amp/)

### Inferences
- For a phones-first story game, a splat scene is now the cheapest route to a photoreal look: scan a real place with Scaniverse (free), clean/crop in SuperSplat (free, browser), export SPZ or SOG, render with Spark in three.js. Budget: aim for a few hundred thousand to 1 million splats per scene for older phones; use Spark 2.0 LoD/.RAD only for big worlds. A typical SPZ of that size is tens of MB, which fits GitHub Pages' 1 GB site cap but argues against many scenes per story.
- Hybrid: splat background plus a few low-poly glTF props with baked light keeps interaction cheap. Splats are hard to relight, so the mood (time of day) is effectively fixed at capture; colour grading in a post pass is the main lever.
- Photo-based scenes (a single photo on a plane or a 360 photo on a sphere) and video-based scenes (a `<video>` element as a three.js VideoTexture) are the lightest "real" looks; these are standard three.js features but were not re-verified this session.
- Tools in practice: gltf-transform CLI (by Don McCurdy) is the usual way to apply meshopt/Draco and KTX2 to a GLB; not re-verified this session.

### Gaps
- No independent phone benchmarks for Spark 2.x were found (only vendor claims).
- Whether three.js r186 core splat support is merged and released was not confirmed.
- Whether Blender 5.2 has shipped by late Oct 2026, and the exact glTF exporter changes in 5.x, were not confirmed (official release notes not fetched).
- Whether GitHub Pages serves Git LFS objects, and GitHub's per-file push limit (commonly cited as 100 MB), were not verified this session; these matter for large splat files.
- Polycam's current plan lineup conflicts between sources.

## 3. Other styles via shaders and filters: painterly, watercolour, ink, dithering, low-poly, paper cut-out, rotoscoped photos

### Takeaway
Most "very different looks" can come from one three.js (or 2D canvas) pipeline with a single swapped post-processing pass: an anisotropic Kuwahara filter for painterly and watercolour, ordered or blue-noise dithering plus edge detection for an Obra Dinn style, and flat shading for low-poly. Good, current, web-specific write-ups exist (Maxime Heckel, Codrops), and a Kuwahara pass alone carried a full watercolour three.js project.

### Cited Findings
- Painterly: Maxime Heckel's "On Crafting Painterly Shaders" (dated 2024-10-29) implements the Kuwahara filter as a custom WebGL post-processing pass, then anisotropic improvements from papers, colour correction and paper textures - [Maxime Heckel blog](https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders)
- How Kuwahara works: inspect a square around each pixel, split it into four overlapping sub-squares, pick the one with least variance, assign its mean to the pixel; preserves edges while flattening areas into "strokes" - [Gorilla Sun newsletter 79 summary](https://gorillasun.de/blog/gorilla-newsletter-79)
- Watercolour: the Codrops "Susurrus" project built a cozy watercolour world in three.js where a simplified Kuwahara shader is the only post-processing pass, inspired by Heckel's post - [Codrops: Susurrus](https://tympanus.net/codrops/?p=113145)
- Dithering: Codrops tutorial (2025-06-04) builds a real-time ordered dither pass on the pmndrs Postprocessing library with pixel size, grayscale mode, dynamic resolution, composable with bloom; React Three Fiber version too - [Codrops: Building a Real-Time Dithering Shader](https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/)
- Heckel also wrote "The Art of Dithering and Retro Shading for the Web" - [Maxime Heckel blog](https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web)
- Obra Dinn's real method: Lucas Pope used blue-noise dithering remapped onto a sphere around the camera so the pattern does not swim during rotation; the crisp lines come from a separate edge-detection pass - [Alan Zucconi: Shader Showcase #11](https://www.alanzucconi.com/?p=10365)
- three.js recreation of the stable sphere-mapped dither - [GitHub: mblode/dither-3d](https://github.com/mblode/dither-3d); other starting points: an R3F ordered dither effect with threshold/scale/colour mode - [GitHub: Chajac/OrderedDither](https://github.com/Chajac/OrderedDither); a dithering shader repo - [GitHub: niccolofanton/dithering-shader](https://github.com/niccolofanton/dithering-shader); an intro to GLSL dithering - [Offscreen Canvas #012](https://offscreencanvas.com/issues/012)

### Inferences
- One engine, many looks: build every story on the same three.js scaffolding (scene, camera, an EffectComposer) and give each story its own final pass: Kuwahara plus paper texture (painterly/watercolour), Sobel/edge detect plus threshold (ink), blue-noise or Bayer dither to 1-2 colours (Obra Dinn), posterize plus edge lines (comic). This keeps the learning curve to one runtime.
- Low-poly: flat-shaded meshes with vertex colours and no textures produce the smallest files of any 3D style and run well on phones; three.js `flatShading` and `MeshToonMaterial` cover it (standard three.js features, not re-verified this session).
- Paper cut-out: can be pure 2D (layered PNGs with drop shadows, parallax moved by GSAP) or 3D planes with alpha textures lit by a single light; no specific 2026 source found.
- Rotoscoped photos: take his own photos or phone video frames, run them through the same Kuwahara/posterize/edge passes (works on images as well as 3D renders), or trace over frames in Aseprite/Krita for a hand-drawn look; export as a sprite sheet. No dedicated 2026 write-up was found.
- Phone cost: Kuwahara is a multi-sample filter per pixel; on phones, run post passes at reduced resolution (for example 0.5-0.75 of device pixels) and cap DPR at 2. Dithering is cheap.

### Gaps
- No measured phone frame rates for Kuwahara passes were found.
- No 2025-2026 sources specifically on paper cut-out or rotoscope styles for the web.
- Shader libraries beyond pmndrs Postprocessing (for example lygia) were not checked this session.

## 4. Animation runtimes: GSAP, Rive, Spine, Lottie, sprite sheets

### Takeaway
GSAP is now entirely free including formerly paid plugins (Webflow, 2025), with one restriction: no use in no-code visual animation builders that compete with Webflow; it is the default for UI, text and scene transitions. For characters: Rive (MIT runtimes; free plan exports carry a splash screen, Cadet $9/seat/month removes it) suits interactive state-machine characters; Spine (one-time $69-99 Essential, needed even to use its web runtime) suits classic skeletal game animation; pixel styles use plain sprite sheets.

### Cited Findings
**GSAP**
- Webflow made GSAP free for everyone, including previously paid Club plugins, and the standard licence covers commercial use - [Webflow blog: GSAP becomes free](https://webflow.com/blog/gsap-becomes-free)
- GSAP pricing page: "100% free for all users, thanks to Webflow's support"; listed plugins include ScrollTrigger, Flip, SplitText, MorphSVG, DrawSVG, MotionPath, Draggable, Inertia, Observer, ScrambleText, CustomBounce, CustomWiggle, Physics2D, GSDevTools; docs at /docs/v3 - [gsap.com/pricing](https://gsap.com/pricing/)
- Restriction: "Prohibited Uses" covers use in tools that let users build visual animations without code in competition with Webflow's visual animation builder - [GSAP standard licence](https://gsap.com/community/standard-license/)
- The free release was v3.13 (README on unpkg) and later 3.14 is also free - [unpkg gsap@3.13.0 README](https://unpkg.com/gsap@3.13.0/README.md); [Tumult forum: GSAP 3.14 is now free](https://forums.tumult.com/t/gsap-3-14-is-now-free/24779)

**Rive**
- Plans: Free $0; Cadet $9/seat/month (3 seat max); Voyager $32/seat/month (25 seat max); Enterprise $120/seat/month (organisations over $10M revenue) - [rive.app/pricing](https://rive.app/pricing)
- Free exports .riv "with a splash screen"; Cadet and above export without it; runtimes are "MIT open-source runtimes"; free limits: 3 collaborative files, 1 project, 1 workspace, 10 MB per imported asset - [rive.app/pricing](https://rive.app/pricing)
- A third-party review gives Cadet as $17/month monthly or about $9 yearly (conflict on monthly rate) - [FrontDeskReview, Sept 2026](https://frontdeskreview.com/software/design-tools/rive/)

**Spine**
- Official purchase page shows Essential $99 alongside $69 and Professional $439 alongside $369 (the page snippet does not make clear which is current/sale); one-time purchase with lifetime updates; one licence per named user; over $500,000 annual revenue requires Enterprise ($2,499 base, yearly) - [Spine purchase page](https://esotericsoftware.com/spine-purchase)
- Runtimes licence: either you license the Spine editor, or every user of your product must; for a website the site owner needs their own Spine editor licence; under $500k revenue, Essential is enough to use the Spine Web Player - [Esoteric forum: Spine Web Player](https://esotericsoftware.com/forum/d/27833-spine-web-player); [Esoteric forum: runtime licence question](https://ru.esotericsoftware.com/forum/d/24018-runtime-license-question)
- spine-ts (web runtimes) v4.2.x on npm - [jsDelivr spine-ts 4.2.13 README](https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-ts@4.2.13/README.md)

**Lottie**
- LottieFiles pricing sources conflict: a LottieFiles blog lists Lottie Creator free with a 5-export cap; Figma plugin docs give a free workspace limit of 5 files and 20 MB; Vendr lists Pro at $12/user/month annually; Softwares.com (claims verified Oct 2026) says no free plan, $19.99-24.99/user/month - [LottieFiles blog](https://lottiefiles.com/blog/design-guides-and-tips/best-motion-design-tools-ranked-by-use-case); [LottieFiles plans and limits](https://docs.lottiefiles.com/en/integrations/figma/03_workspace/plans-and-limits); [Vendr](https://www.vendr.com/marketplace/lottiefiles); [Softwares.com](https://www.softwares.com/software/lottiefiles)

**Sprite sheets**
- Pixelorama 1.1.9 can split layers into separate sheets on export - [Pixelorama v1.1.9 devlog](https://orama-interactive.itch.io/pixelorama/devlog/1487558/pixelorama-v119-is-out)

### Inferences
- Characters: Rive for expressive, interactive characters and UI that react to state (blink, look at cursor, mood blend) in small files; Spine if he wants traditional skeletal animation with meshes and the editor workflow, at a one-time $69-99; sprite sheets for pixel art and hand-drawn frame animation (Aseprite/Pixelorama).
- UI, text reveal and transitions between story beats: GSAP (free, SplitText for typewriter and word reveals, Flip for layout changes) or plain CSS transitions; Lottie is fine for small decorative loops made in After Effects, but it adds nothing over Rive/GSAP for a solo creator without After Effects.
- Rive free plan is usable for prototyping and even shipping a personal game if the splash screen is acceptable; Cadet at $9/month only while shipping is a cheap option.
- Spine's runtime licence makes it the only one of these where the runtime itself is not free to use on a website.

### Gaps
- The lottie-web vs dotLottie runtime maintenance status in 2026 was not found.
- Which Spine price on the purchase page is current (list vs sale) could not be resolved from the snippet.
- Rive runtime file sizes (WASM) on phones were not measured.

## 5. Audio: iPhone Safari, libraries, adaptive music, recording, SFX licences, loudness and formats

### Takeaway
On iPhone, unlock audio on the first tap and set `navigator.audioSession.type = 'playback'` so Web Audio plays even with the silent switch on (default behaviour mutes it); keep a silent-audio-element fallback. Howler.js (2.2.4, low activity) is enough for music and SFX; Tone.js suits adaptive and generative music. AAC in M4A is the safest format for iOS, Opus/WebM works on recent iOS. Mix to about -16 to -18 LUFS with true peak at -1 dBTP. Record with Reaper ($60 discounted licence, 60-day full trial) or the free Sonar tier; Cakewalk by BandLab is gone. Use Freesound filtered to CC0 plus Kenney CC0 for SFX.

### Cited Findings
**iPhone Safari behaviour**
- Default audio session type behaves as ambient, so Web Audio goes silent when the phone is muted; setting type to "playback" stops this - [WebKit bug 237322](https://auto-bugs.webkit.org/show_bug.cgi?id=237322)
- A WebKit maintainer suggested `navigator.audioSession.type = 'playback'` for silent mode; reporter confirmed 'playback' or 'play-and-record' helps - [WebKit bug 251532](https://bugs.webkit.org/show_bug.cgi?id=251532)
- AudioContext still gets suspended when the page goes to the background even with type playback - [WebKit bug 261554](https://bugs.webkit.org/show_bug.cgi?id=261554)
- `transient` and `transient-solo` types can produce no sound from an HTMLAudioElement on iOS 17/18 - [WebKit bug 264473](https://bugs.webkit.org/show_bug.cgi?id=264473)
- Older workaround: play a short silent HTML audio track in a loop while Web Audio plays to push it onto the media channel - [GitHub: swevans/unmute](https://github.com/swevans/unmute)
- The AudioSession API is still a proposal, not a W3C Recommendation - [Web audio iOS unmute article](https://portfolio-2024-b6r.pages.dev/blog/web-audio-ios-unmute)

**Libraries**
- Howler.js: newest npm version 2.2.4 (Sept 2023), rated "Inactive" maintenance by Snyk; a GitHub push reported 2025-11-23; supports HTML5 Audio and Web Audio, sprites, spatial plugin - [Snyk: howler](https://snyk.io/advisor/npm-package/howler); [GitTrend: howler.js](https://gittrend.io/repo/goldfire/howler.js)
- Tone.js: a DAW-like framework with a global transport and prebuilt synths, suited to procedural/reactive music; last push reported 2026-08-21 (unverified) - [Pistack comparison (2026-08-23)](https://www.pistack.xyz/posts/2026-08-23-javascript-audio-libraries-howler-tonejs-wavesurfer-comparison/); [Snyk: tone](https://snyk.io/advisor/npm-package/tone)

**Formats**
- Safari 15 added WebM Opus in `<audio>` but not `decodeAudioData()` at the time - [WebKit bug 183852](https://bugs.webkit.org/show_bug.cgi?id=183852); a 2022 report had WebM Opus working with decodeAudioData on iPadOS but not `<audio>` on iOS, still reproducing on iOS 17 in Oct 2023 - [WebKit bug 238546](https://bugs.webkit.org/show_bug.cgi?id=238546)
- Safari 18.4 (March 2025) added WebM/Opus recording and Ogg Opus support on iOS 18.4 (testing-vendor guide) - [TestMu AI: MediaRecorder](https://www.testmuai.com/web-technologies/mediarecorder/)

**Loudness**
- ITU-R report: typical game loudness about -24 LKFS (plus or minus 2) on consoles and about -18 LKFS (plus or minus 2) on portable devices - [ITU-R BS.2434 (2018)](https://www.itu.int/dms_pub/itu-r/opb/rep/R-REP-BS.2434-2018-PDF-E.pdf)
- Meta recommends -16 LUFS for Quest apps - [Meta Horizon docs: audio loudness meter](https://developers.meta.com/horizon/documentation/unity/audio-loudness-meter-overview/)
- Mobile target around -18 LUFS (Sony mobile), runtime compression up to -16 in noisy settings - [Audio Media International](https://audiomediainternational.com/mobile-loudness-an-adaptive-approach/)
- Keep true peak at or below -1 dBTP - [Bugnet: how loud should your game be](https://bugnet.io/blog/how-loud-should-your-game-be)

**Recording on a budget (Windows)**
- REAPER: discounted licence $60 (personal use, education/non-profit, or business with yearly gross revenue at most $20,000), commercial $225; 60-day full-function evaluation; new licence includes free upgrades through version 8.99 - [reaper.fm/purchase](https://www.reaper.fm/purchase.php); after the trial it only shows a 5-second nag but a licence is expected; DRM-free - [Dubspot: Reaper](https://blog.dubspot.com/plugins/reaper)
- Cakewalk by BandLab: discontinuation announced June 2023, replaced by Cakewalk Sonar and Cakewalk Next - [MusicRadar](https://musicradar.com/news/free-cakewalk-daw-discontinued); a free tier of Sonar arrived with the June 2025 update; Cakewalk by BandLab licence renewals stopped August 2025; Sonar free tier covers recording, editing, mixing, export, deeper features need BandLab Membership (commercial blog) - [Wikipedia: Cakewalk by BandLab](https://en.wikipedia.org/wiki/Cakewalk_by_BandLab); [Dubspot: best free DAWs 2026](https://blog.dubspot.com/best-free-daws-2026)

**Sound effects with clear licences**
- Freesound: licence per sound (CC0, CC-BY, CC-BY-NC); one guide says about 72% are CC0; filter search to CC0; CC-BY needs credit, CC-BY-NC is non-commercial - [Cinevva: free sound effects and music for games (2026)](https://app.cinevva.com/guides/free-sound-effects-music)
- CC0 needs no attribution; Freesound labels each file - [University of Newcastle sound sites list](https://www.newcastle.edu.au/__data/assets/pdf_file/0007/875995/Suggested-sound-effects-sites.pdf)
- Kenney audio is CC0; usable in commercial games with no attribution required - [GTSTU: Kenney CC0](https://gtstu.com/?p=5011)
- jsfxr/ChipTone recommended for retro SFX and called "commercially safe" by a secondary guide (not the tool author) - [Cinevva guide](https://app.cinevva.com/guides/free-sound-effects-music)

### Inferences
- Unlock pattern for every story: show a "tap to begin" title card (it doubles as a mood-setting moment), on that tap call `audioContext.resume()` (Howler does its own unlock), set `navigator.audioSession.type = 'playback'` when supported, and start the music. Pause music on `visibilitychange`.
- Adaptive music for story games: vertical layering (several stems of the same piece started together, gains faded by story state, for example tension adds percussion) is the simplest and works with Howler or plain Web Audio; horizontal resequencing (switching sections on bar boundaries) needs a clock, which Tone.js's Transport provides. His own guitar suits layering well: record a clean bed, a second part and a textural part as separate stems at the same tempo. (Technique description is general knowledge.)
- Formats: ship AAC .m4a (works everywhere including old iOS) and optionally Opus .webm for smaller files on Chrome/Android, letting Howler pick from a list. Mono 96-128 kbps is plenty for voice and SFX; stereo 128-160 kbps for music.
- Loudness: master music to about -16 to -18 LUFS integrated, -1 dBTP; keep SFX and voice consistent relative to it; check with a free meter (for example Youlean Loudness Meter free or Reaper's built-in loudness analysis; not verified this session).
- Cheapest real recording chain: Reaper trial then $60, a basic USB audio interface, guitar DI or a single dynamic microphone; Audacity for quick edits and noise reduction.

### Gaps
- Current Audacity version and licence details (and whether Audacity 4 has shipped) were not checked.
- Exact current Safari support table (caniuse) for Opus/WebM and the default `navigator.audioSession` type in iOS 26 were not fetched.
- jsfxr's licence for generated sounds was not confirmed from its repository.
- Tone.js and Howler current versions were not confirmed from npm directly.

## 6. AI tools for art, music and voice in 2026: usability, licence and copyright, community reaction

### Takeaway
Legally, in the US purely prompted output is not copyrightable (USCO Part 2, Jan 2025); human-made inputs, edits and the selection and arrangement of AI material can be. The EU stays human-centric with no clear threshold, and since 2 August 2026 the AI Act Article 50 adds labelling duties for deepfakes and some public-interest text. Community reaction is strongly negative toward AI art and audio in games: 85% of surveyed gamers were negative and 52% of developers think generative AI harms the industry; Steam games with AI disclosures drew fewer reviews. Using AI for research, code or placeholders is far less contentious than shipping AI art, music or voice.

### Cited Findings
**Copyright: United States**
- USCO Part 2 report (2025-01-29): with current technology prompts do not give enough control for authorship; iterating prompts is "sweat of the brow"; choosing among outputs is not authorship; human-authored inputs perceptible in output stay protected; creative selection, coordination and arrangement of AI material can be protected; conclusion on prompts could change as tools give more control - [IPWatchdog](https://ipwatchdog.com/2025/01/29/part-two-copyright-office-ai-report-says-creative-prompting-doesnt-constitute-authorship/); [Copyright Alliance summary](https://copyrightalliance.org/ai-report-part-2-copyrightability/)

**Copyright and transparency: EU**
- European Parliament JURI study "Generative AI and Copyright: Training, Creation, Regulation" (PE 774.095, published 2025-07-09, author Nicola Lucchi): training exceeds the current text-and-data-mining exceptions; suggests moving from opt-out toward consent, remuneration, transparency; AI-generated works remain in a grey area under human-centric EU law - [Mondaq summary](https://www.mondaq.com/unitedstates/licensing-syndication/1666524/european-parliaments-new-study-on-generative-ai-and-copyright-calls-for-overhaul-of-opt-out-regime); [DDG analysis](https://www.ddg.fr/actualite/the-european-union-and-copyright-challenges-in-the-age-of-generative-artificial-intelligence-a-comprehensive-legal-analysis-of-the-report-generative-ai-and-copyright-july-2025)
- EPRS briefing (Dec 2025): CJEU requires the author's "own intellectual creation"; editing, selecting or arranging AI output may count, but no clear threshold yet - [CADE project summary](https://cadeproject.org/?p=153286)
- AI Act Article 50 transparency obligations apply from 2026-08-02; Code of Practice on Transparency of AI-Generated Content published 2026-06-10, judged adequate by the Commission (2026-07-08) and endorsed by the AI Board; the code is voluntary but Article 50 duties are legal obligations; deployers must visibly label deepfakes, provider watermarks alone do not satisfy that; EU icons exist for labelling - [MLGTS legal alert (2026-07-14)](https://www.mlgts.pt/en/knowledge/legal-alerts/Transparency-of-AI-Generated-Content/27005/); [European Commission: code of practice page](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content); [Learnsignal guide](https://www.learnsignal.com/blog/eu-ai-act-article-50-transparency-labelling-obligations-explained/)

**Tool licences**
- Adobe Firefly trained mainly on Adobe Stock, openly licensed and public-domain content; IP indemnity for enterprise customers, scope for individuals disputed between sources - [Markus Brinsa Substack](https://markusbrinsa.substack.com/p/adobe-firefly-vs-midjourney-the-training); [LicenseOrg comparison](https://licenseorg.com/compare/adobe-firefly-vs-midjourney)
- Midjourney: subscribers own outputs (companies over $1M revenue need higher plans per a comparison site), no IP indemnity; free/trial images CC BY-NC 4.0 (unverified comparison site) - [LicenseOrg comparison](https://licenseorg.com/compare/midjourney-vs-adobe-firefly)
- Music: Warner settled with Udio and Suno (Nov 2025); UMG settled with Udio (Oct 2025) but not Suno; Sony litigating both; Suno-UMG/Sony talks reportedly at an impasse in April 2026; Udio disabled downloads of user songs after the UMG deal; Suno free output limited to personal non-commercial use, paid tiers get commercial rights (blog sources, provisional) - [Dubspot: AI music licensing 2026](https://blog.dubspot.com/ai-music-licensing-explained-2026); [Music Business Worldwide](https://www.musicbusinessworldwide.com/universal-music-settles-udio-lawsuit-strikes-deal-for-licensed-ai-music-platform); [Decrypt](https://decrypt.co/349360/warner-music-moves-from-litigation-to-licensing-with-udio)
- Voice: ElevenLabs paid plans from $6/month carry commercial rights, free tier does not; cloning requires owning or having consent for the voice; about 70-74 languages, Lithuanian not confirmed - [Smallest.ai comparison](https://smallest.ai/blog/free-elevenlabs-alternatives-for-2026-what-is-actually-free); [Terms.law: ElevenLabs terms](https://terms.law/ai-output-rights/elevenlabs/); [Itechguides](https://www.itechguides.com/products/elevenlabs/)

**Developer and player attitudes**
- GDC 2026 State of the Game Industry (2,300+ respondents, released 2026-01-29): 36% use generative AI at work (30% at studios); main use research/brainstorming (81%); 52% think generative AI harms the industry, up from 30% the year before and 18% two years before; respondents skew North America/Western Europe - [Business Wire release](https://www.businesswire.com/news/home/20260129438528/en/2026-State-of-the-Game-Industry-Report-Reveals-Widening-Effect-of-Layoffs-Broader-Perspectives-on-Generative-AI-Unionization-Tariffs-and-More); [GamesBeat](https://gamesbeat.com/state-of-game-industry-survey-sheds-light-on-layoffs-genai-views-unionization-and-tariffs-gdc-survey/); visual and technical artists most negative at 64% - [TechSpot](https://www.techspot.com/news/111128-more-than-50-game-developers-generative-ai-harming.html)
- Quantic Foundry gamer survey (N=1,799, Oct-Dec 2025, opt-in): 85% below-neutral on generative AI in games, 63% chose the most negative option, 7.6% approve; women, non-binary and younger gamers more negative; creative uses (art, audio) drew most opposition - [GamesMarket](https://www.gamesmarket.global/quantic-foundry-most-gamers-are-negative-about-the-use-of-gen-ai-in-video-games); [Boing Boing](https://boingboing.net/2025/12/20/survey-finds-very-negative-attitude-toward-gen-ai-in-games.html/amp); [Statista: attitudes by use case](https://www.statista.com/statistics/1664229/attitudes-towards-genai-in-video-games-by-use-case/)
- Steam: AI disclosure required since Jan 2024; descriptions of the 2026 revision differ (one says tools that only speed development no longer need disclosure; another says content players see or hear must be declared) - [Stuff.co.za (2026-02-12)](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/); [GamingHQ (2026-01-17)](https://gaminghq.eu/2026/01/17/steam-updates-ai-disclosure-rules-generative-tools-debate/)
- Study of 2025 Steam releases: games with AI disclosures averaged 4 reviews in the first month vs 7 without (proxy, not proof of causation) - [Digital Citizen](https://www.digitalcitizen.life/steam-games-that-disclose-ai-use-may-sell-far-less-new-study-finds/)
- Players object most to AI that visibly cuts a corner (Vapor World: inconsistent AI character model) - [Everything Edinburgh](https://everythingedinburgh.com/games/news/vapor-world-steam-ai-cutscene-backlash/); a Steam curator group tracks AI-asset games - [Stuff.co.za](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)
- Debate: Tim Sweeney calls labels impractical; Valve artist Ayi Sanchez defends them as targeting substantial generative use - [Nerdschalk](https://nerdschalk.com/valve-artist-defends-steams-ai-label-amid-growing-pushback/)

### Inferences
- For personal story games about real emotion, the reputational cost of visible AI art, music or voice is high relative to any time saved, and the US position means purely generated assets would not be his to protect. The low-risk uses: reference boards, brainstorming, placeholder art during prototyping that is replaced before release, code help.
- If AI is used for any shipped visible or audible asset, disclose it plainly on the game page; in the EU, a realistic synthetic voice or face of a real person would fall under the deepfake labelling duty.
- His own guitar, voice, photos and phone scans are both the most legally clean and the most emotionally credible inputs; they also differentiate each story's look and sound.

### Gaps
- The primary text of Steam's current (2026) AI disclosure rules was not fetched.
- Suno and Udio current terms of service were not read directly; status in Oct 2026 may have moved.
- ElevenLabs' Lithuanian support and current pricing were not confirmed from the official site.
- No survey specific to players of free browser or personal/narrative games was found.

## 7. Fonts with free licences for narrative games, and phone legibility

### Takeaway
Use SIL Open Font License (OFL) fonts that can be self-hosted on GitHub Pages: Atkinson Hyperlegible Next (Feb 2025, OFL-1.1, 150+ languages) is a strong default for body text on phones; Bagura is an OFL pixel font designed for legible text. Body text should be at least about 16-17 px equivalent; Apple's guidance is 17 pt default and 11 pt minimum on iOS. For Lithuanian text, confirm each font covers the needed diacritics.

### Cited Findings
- Atkinson Hyperlegible Next: launched by Braille Institute on 2025-02-10, free via Google Fonts and BrailleInstitute.org; adds characters for 150+ languages (up from 27); monospace companion released alongside - [Ophthalmology Management](https://ophthalmologymanagement.com/news/2025/applied-design-and-braille-institute-partner-to-launch-typeface-for-making-reading-easier/); licence OFL-1.1 - [Fontsource](https://fontsource.org/fonts/atkinson-hyperlegible-next/about); weight count conflicts (press release says 7, LinuxLinks and Debian say 6 plus italics) - [LinuxLinks](https://www.linuxlinks.com/atkinson-hyperlegible-next-sans-serif-typeface/); [Debian review](https://dfsg-new-queue.debian.org/reviews/fonts-atkinson-hyperlegible-next/0.0~git20250221.7925f50-2)
- Bagura pixel font family: free for personal and commercial use under SIL OFL, no fee, no revenue cap, no credit required; recommended sizes 13 px (Light) and 16 px (Bold) - [Bagura on itch.io](https://burloe.itch.io/bagura-font)
- Lecta: pixel font designed for readability in text-heavy games, 16 recommended; licence not shown in results - [Lecta on itch.io](https://codlark.itch.io/lecta)
- Press Start 2P and VT323 are on Google Fonts under OFL (secondary blog); decorative rather than for long dialogue - [Pixel Font Picks](https://pixelfontpicks-u4.pages.dev/free-retro-gaming-pixel-fonts-for-8-bit-game-design-retro-gaming-pixel-fonts)
- Some free fonts need separate terms for web or game distribution; check each licence - [Lemma Soft forums](https://lemmasoft.renai.us/forums/viewtopic.php?p=464634)
- Apple guidance (mirrored copy): iOS/iPadOS 17 pt default, 11 pt minimum; thin weights need larger sizes; test and increase size or contrast if hard to read - [Apple HIG typography mirror](https://unpkg.com/apple-hig-mcp@1.1.3/content/typography.md)

### Inferences
- Pair one readable body font (Atkinson Hyperlegible Next, or a serif such as Literata/Lora/EB Garamond for literary stories; those are OFL on Google Fonts by general knowledge, not re-verified) with one display font per story that carries the style (pixel, typewriter, hand-lettered). Display fonts only for titles and short labels.
- Self-host fonts as WOFF2 subsets (Latin plus Latin Extended-A for Lithuanian ą č ę ė į š ų ū ž) to keep files small and avoid third-party requests.
- On phones: body 17-20 CSS px, line height about 1.4-1.6, line length around 30-40 characters in portrait, high contrast; pixel fonts only at integer multiples of their design size (for Bagura 13/16 px base) to stay crisp, matching section 1's integer scaling.

### Gaps
- Lithuanian glyph coverage of Bagura, Lecta, Press Start 2P and VT323 was not checked (many pixel fonts cover only basic Latin).
- Apple's live HIG page was not fetched (mirror only).
- No 2025-2026 study of reading comfort for game dialogue on phones was found.

## 8. Recommended toolkit per style, and the shared audio toolkit (synthesis)

### Takeaway
One runtime family (three.js for 3D, splats and shader looks; Canvas 2D or the same three.js setup for pixel and 2D), GSAP for all UI and transitions, and a per-story swap of the art tool and final shader pass, gives very different looks with a small learning curve and near-zero cost. Total cash outlay can be $0 (Pixelorama, Blender, Scaniverse, Spark, GSAP, Rive free with splash, Reaper trial, Sonar free) or about $80 once (Aseprite $19.99 plus Reaper $60), plus optional Rive Cadet $9/month or Spine Essential $69-99 once.

### Cited Findings
- All facts used here are cited in sections 1 to 7: Aseprite and Pixelorama (section 1), Blender, glTF compression, Spark, PlayCanvas, Scaniverse, GitHub Pages limits (section 2 and header), Kuwahara and dithering write-ups (section 3), GSAP, Rive, Spine (section 4), iOS audio, Howler, Tone.js, Reaper, Sonar, Freesound, Kenney, loudness (section 5), AI positions (section 6), fonts (section 7).
- GitHub Pages: 1 GB site, 100 GB/month bandwidth soft limit, 10-minute deploy timeout - [GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

### Inferences
Recommended toolkit per style (cost, learning curve, phone performance):

| Style | Make the art | Runtime and look | Animation | Cost | Learning curve | Phone performance |
|---|---|---|---|---|---|---|
| Pixel art | Aseprite ($19.99 or self-compiled) or Pixelorama (free); a Lospec palette | Canvas 2D (or three.js orthographic) at integer scale, `image-rendering: pixelated` | Sprite sheets plus JSON; GSAP for UI | $0-20 | Low | Excellent |
| Photoreal place (splats) | Scaniverse scan on the phone, crop in SuperSplat | three.js plus Spark (MIT); SPZ/SOG; under about 1M splats; Spark 2 LoD only for big worlds | GSAP camera moves | $0 | Medium | Good on 2023+ phones; test older ones |
| Realistic 3D built | Blender 5.x, baked lightmaps, glTF with meshopt plus KTX2 ETC1S | three.js | glTF skeletal clips; GSAP | $0 | High (Blender) | Good if baked and compressed |
| Painterly / watercolour | Blender low-detail scene, or his photos | three.js plus Kuwahara pass plus paper texture (Heckel, Susurrus) | GSAP | $0 | Medium (shaders) | Fair: run the pass at reduced resolution |
| Ink / Obra Dinn dither | Blender scene or scans | three.js plus edge detection plus blue-noise sphere dither (dither-3d, Codrops) | GSAP | $0 | Medium | Good (dither is cheap) |
| Low-poly | Blender, flat shading, vertex colours, no textures | three.js toon/flat materials | glTF clips | $0 | Low-medium | Excellent, tiny files |
| Paper cut-out | Scanned or drawn layers (Krita/Aseprite) | 2D layers or three.js planes with one light and soft shadows | GSAP parallax; Rive or Spine for puppets | $0 (Rive free with splash) to $9/month or $69-99 | Low-medium | Excellent |
| Rotoscoped photo / video | His own photos and phone video | Posterize plus edge plus Kuwahara pass, or frames traced and exported as sheets | Sprite sheets or video texture | $0 | Medium | Good; watch video sizes against the 1 GB Pages cap |
| Expressive characters (any style) | Rive editor | Rive runtime (MIT) | Rive state machines | $0 with splash, $9/month Cadet | Medium | Good |

Shared audio toolkit:
- Record and mix: Reaper (60-day full trial, then $60 discounted) or Sonar free tier; Audacity for quick cleanup. Record guitar and voice as stems so music can layer adaptively.
- Sources: his own recordings first; Freesound filtered to CC0; Kenney CC0 packs; jsfxr/ChipTone for retro blips (verify jsfxr licence).
- Playback: Howler.js for music, ambience and SFX sprites; Tone.js only where music must follow the story on the beat.
- iPhone: tap-to-begin unlock, `navigator.audioSession.type = 'playback'` when present, silent-element fallback, pause on `visibilitychange`.
- Delivery: AAC .m4a everywhere (Opus .webm optional), mono for voice/SFX, music mastered to about -16 to -18 LUFS and -1 dBTP; keep total audio per story to tens of MB to respect phone data and the Pages cap.
- AI audio: not recommended for shipped music or voice given the community data and unsettled music licensing; acceptable for private sketches.

### Gaps
- No single source compares all these runtimes' bundle sizes or phone frame rates side by side; the performance column is a judgement from the cited material, not measurement.
- Choice of 2D runtime for pixel styles (plain Canvas 2D vs PixiJS vs Phaser) was not researched this session.
