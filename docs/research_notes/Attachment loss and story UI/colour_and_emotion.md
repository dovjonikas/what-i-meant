# Colour and emotion: evidence, craft and a colour script for "Text me when you get home"

Scope: how hue, saturation and brightness move feeling (lab evidence), how film, animation and games plan colour across a story (craft), and a concrete colour script with hex values for every chapter and key beat of the story. Builds on section 5 of `docs/research_notes/First story feel and look/visual_language.md`; this pass reads the Wilms and Oberfeld paper in full (the earlier pass could not parse it) and adds the cross-cultural, nostalgia, grayscale, light and accessibility evidence.

Labels used below: findings are cited; anything marked "Inference" is this researcher's reasoning; numbers marked "computed" come from a script run in this pass (OKLab lightness L 0 to 100, chroma C, WCAG contrast ratios, colour-vision simulation with the Machado 2009 matrices at full severity).

## 1. What the science says about hue, saturation, brightness and emotion

### Takeaway
Saturation is the strongest lever for arousal, brightness is the strongest lever for pleasantness, and hue matters mostly when colours are saturated. Colour-emotion links are largely shared across 30 nations (red: love and anger; yellow: joy; grey and black: sadness; white: relief), but lab effects are modest, measured on colour patches, and several popular claims (sad people see blue less, warm objects make people warmer) failed or were retracted.

### Cited Findings
Hue, saturation, brightness (PAD and valence-arousal)
- Valdez and Mehrabian (1994), Journal of Experimental Psychology: General 123, 394 to 409, Munsell chips rated on Pleasure, Arousal, Dominance. Standardised regressions: Pleasure = .69 Brightness + .22 Saturation; Arousal = -.31 Brightness + .60 Saturation; Dominance = -.76 Brightness + .32 Saturation. Most pleasant hues: blue, blue-green, green, red-purple, purple, purple-blue; least pleasant: yellow and green-yellow. Source: [PubMed 7996122](https://pubmed.ncbi.nlm.nih.gov/7996122/); [Scinapse](https://www.scinapse.io/papers/2099270617).
- Valdez and Mehrabian found a U-shaped link between brightness and arousal (arousal fell up to about Munsell value 45, then rose); their stimuli were not colorimetrically measured, so brightness and saturation may be confounded. Source: Wilms and Oberfeld 2018 discussion, [author PDF](https://www.staff.uni-mainz.de/oberfeld/downloads/Wilms-Oberfeld2018_Article_ColorAndEmotionEffectsOfHueSat.pdf).
- Wilms and Oberfeld (2018), Psychological Research 82, 896 to 914: 3 hues (blue, green, red) x 3 saturations x 3 brightnesses plus 3 matched greys, a large LED patch (18 x 18 degrees) on black, each shown 30 s, N = 62, 9-point SAM ratings plus skin conductance and heart rate. Source: [author PDF](https://www.staff.uni-mainz.de/oberfeld/downloads/Wilms-Oberfeld2018_Article_ColorAndEmotionEffectsOfHueSat.pdf); [PubMed 28612080](https://pubmed.ncbi.nlm.nih.gov/28612080/).
  - Arousal, saturation: F(2,60) = 67.7, partial eta squared .693; every saturation step differed, dz 1.01 to 1.49 (large).
  - Arousal, hue: partial eta squared .588; red > green > blue, dz 0.59 to 1.18; this rise appeared only at medium and high saturation (hue x saturation partial eta squared .637).
  - Arousal, brightness: partial eta squared .459, dz 0.66 to 0.91, again only at the two higher saturations. Greys gave arousal like low-saturation colours and barely changed with brightness.
  - The spread of arousal across the 30 colours was only slightly smaller than the spread of the International Affective Picture System photo set.
  - Valence, saturation: partial eta squared .343; medium saturation was rated most pleasant (M = 5.82), then high (5.52), then low (5.16).
  - Valence, brightness: partial eta squared .491; low to medium dz 0.77, low to high dz 0.97, medium vs high not significant.
  - Valence, hue: main effect just missed significance (p = .051; green 5.69, blue 5.49, red 5.33). The usual blue > green > red order appeared only at high saturation; at low saturation red (a muted, dusty red) was the most pleasant hue (hue x saturation partial eta squared .436).
  - Greys were rated less pleasant than chromatic colours; including greys, the hue factor (mostly chromatic vs grey) had partial eta squared .634. Greys briefly slowed heart rate; chromatic colours sped it up.
  - Physiology was weaker than ratings: self-rated arousal and skin conductance correlated only r = .42.
  - Authors' warning: "Which red and which blue?" A bright, saturated blue can be more arousing than a dim, muted red.
  - Limits named by the authors: three hues only, a self-luminous patch on black, results may not carry to small surface colours, interiors or clothing.
- A 2024 mobile-game study (Kallabis et al., N = 21 adolescents, 25 minutes of a platformer, hue and saturation varied per level, SAM ratings) found no significant effect of hue or saturation on emotional state; only a hue x saturation effect on valence, in male players. The authors conclude colour alone is not an effective way to elicit emotion in mobile games. Source: [arXiv 2402.19064](https://arxiv.org/abs/2402.19064).

Colour vs grayscale and desaturation in real images
- Lin, Mottaghi and Shams (2023), Psychonomic Bulletin and Review, within-subject IAPS photos: colour made positive photos more pleasant and negative photos more unpleasant than grayscale ("Color amplifies the experience of pleasure and displeasure"). With saturation cut by 50%, positive photos were less pleasant, and negative photos were rated more unpleasant than at normal saturation: a nonlinear link, with saturation adding aesthetic value regardless of content. Source: [Psychonomic Society featured content](https://featuredcontent.psychonomic.org/colorful-shades-of-emotional-perception/).
- Older work (Bradley et al. 2001) found no colour vs grayscale difference in IAPS reactions; later work called those studies underpowered. Source: search summary of [Springer, PBR 2023](https://link.springer.com/article/10.3758/s13423-023-02357-4) (abstract not opened).

Why colours are liked: ecological valence
- Palmer and Schloss (2010), PNAS 107, 8877 to 8882, 32 colours, 48 raters: preference peaks broadly at blue and has a narrow trough at chartreuse (yellow-green); dark yellow (olive) and dark orange (brown) are the least liked (F = 41.06 and 11.74); dark red and dark green are liked more than other reds and greens; saturated colours beat light and muted ones. People like colours of liked objects (clear sky, clean water) and dislike colours of disliked ones (faeces, rotting food). The average liking of colour-matched objects predicted preference at r = .893 (80% of variance) with no free parameters; American object ratings predicted Japanese preferences at r = .74. Source: [PMC2889342](https://pmc.ncbi.nlm.nih.gov/articles/PMC2889342).

Colour pairs and harmony
- Schloss and Palmer (2011), Attention, Perception and Psychophysics: preference for a colour pair and its harmony both rise with hue similarity; pair preference also rises with lightness contrast; strongly contrasting hues are rated neither preferable nor harmonious; yet a figure colour is liked more the more its hue contrasts with its background. Source: [Palmer lab PDF](https://palmerlab.berkeley.edu/pdf/Schloss&Palmer(2011).pdf) (via search summary).

Cross-cultural colour-emotion links
- Jonauskaite et al. (2020), Psychological Science 31, 1245 to 1260: 4,598 people, 30 nations, 22 languages, 20 emotion concepts x 12 colour terms. Average cross-nation similarity r = .88; nation still predicted associations beyond the shared pattern, and nearby or linguistically close nations were more alike. Source: [White Rose record](https://eprints.whiterose.ac.uk/id/eprint/169496/).
- Specific shared links from the same project: red with love and anger (the only colour strongly tied to both a positive and a negative feeling), yellow with joy, black and grey with sadness, white with relief. Exceptions: in China white was also linked to sadness (white is worn at funerals); in Greece purple was also linked to sadness. Source: [BBC Science Focus](https://www.sciencefocus.com/news/revealing-the-psychology-of-colour-to-be-a-rainbow-rollercoaster-of-emotion) (press report quoting Daniel Oberfeld-Twistel).
- Jonauskaite's thesis reports that people living farther from the equator and in rainier countries were more likely to tie yellow to joy, read as an effect of sunshine experience. Source: [Serval, University of Lausanne](https://serval.unil.ch/notice/serval:BIB_3FE27ADEFB61) (via search summary).

Theory and its limits
- Colour-in-context theory (Elliot and Maier 2012): colour meanings come from repeated pairings plus some biologically prepared responses, and the same colour means different things in different contexts. Elliot himself calls the premises "only vaguely suggestive of precise hypotheses in specific contexts". Source: [Elliot 2015, Frontiers in Psychology](https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/pdf).
- Elliot and Maier's 2014 review of about 120 years of colour research is summarised as finding no coherent theoretical basis and low empirical standards in the field. Source: [Durham thesis summary](https://durham-repository.worktribe.com/OutputFile/1648849) (secondary).
- Thorstenson, Pazda and Elliot (2015), "sadness impairs blue-yellow colour perception", Psychological Science, was retracted for analysis and data errors. Source: [PsyPost](https://www.psypost.org/feeling-blue-and-seeing-blue-sadness-may-impair-color-perception/); [PeerJ critique](https://peerj.com/preprints/1536).
- Physical warmth priming interpersonal warmth (Williams and Bargh 2008) did not replicate in three labs (Lynott et al. 2014, total N = 861) or in field tests (Chabris et al. 2018, near-zero effects). Source: [Lancaster eprint](https://eprints.lancs.ac.uk/id/eprint/69546/); [FORRT replication atlas](https://forrt.org/flora-replication-atlas/doi/10.1126/science.1162548/).

Brightness and valence beyond colour patches
- Meier, Robinson and Clore (2004), Psychological Science 15, 82 to 87: positive words were judged faster in white, negative words faster in black; people automatically treat bright as good, dark as bad. A direct replication with 980 participants (Meier, Fetterman and Robinson 2015, Social Psychology 46, 174 to 178) reproduced the main result. Source: [APS abstract](https://www.psychologicalscience.org/journals/psychological-science/j.0963-7214.2004.01502002.x/); [Tuebingen record](https://publikationen.uni-tuebingen.de/xmlui/handle/10900/66655) (via search summary).
- Lakens, Semin and Foroni (2012): black reliably reads as negative, but white reads as positive only when black's negativity is also active. Source: [Lakens et al. 2012 PDF](https://www.insula.sissa.it/sites/default/files/Lakens_etal_2012.pdf) (via search summary).
- Mean frame brightness of 160 Hollywood films fell between 1935 and 2010; the authors read darker images as a tool for steering attention. Source: [Cutting et al. 2011, i-Perception, PMC3485803](https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/).

Nostalgia and warmth
- Zhou, Wildschut, Sedikides, Chen and Vingerhoets (2012), Emotion: people felt more nostalgic on colder days (30-day diary, 19 people), more nostalgic in a 20 C room than at 24 C or 28 C, felt physically warmer when music made them nostalgic, rated a cold room warmer after nostalgic recall, and held a hand in ice water longer. Nostalgia acts as a homeostatic comfort response to cold. Source: [ScienceDaily](https://sciencedaily.com/releases/2012/12/121203082050.htm); [University of Southampton](https://eprints.soton.ac.uk/342612).
- Bakhshi, Shamma, Kennedy and Gilbert (2015), ICWSM, 7.6 million Flickr photos: filtered photos were 21% more likely to be viewed and 45% more likely to get comments; warmth had the largest link with comments, exposure with views; saturation and "aged" effects showed slight negative links. Caveat: Yahoo Labs authors studying Yahoo's Flickr. Source: [AAAI ICWSM](https://ojs.aaai.org/index.php/ICWSM/article/view/14622); [Mental Floss](https://www.mentalfloss.com/article/64353/want-more-instagram-views-add-warming-filter).

Light level, sky and awe
- Sunrise and sunset scenes were rated substantially more beautiful than sunny scenes at other times and raised awe; over 2,500 online participants; people would pay almost 10% more to visit at sunrise; rainbows, storms and moonlit skies also raised beauty and awe. Novelty may drive part of it. Source: [University of Exeter news, J. Environmental Psychology 2023](https://news.exeter.ac.uk/?p=771); [ScienceDaily](https://sciencedaily.com/releases/2023/01/230119112753.htm).
- Kruithof's curve treats warm, low light as pleasing (home levels around 75 lux at 2400 to 2700 K); a 2017 review (Fotios) found colour temperature had negligible effect on pleasantness, and light below about 300 lux may read as unpleasant. Source: [Wikipedia, Kruithof curve](https://en.wikipedia.org/wiki/Kruithof_curve).

### Inferences
- Inference: the working rule for this game is brightness sets how good a scene feels, saturation sets how intense it feels, hue flavours the result mainly at medium to high saturation. Above medium brightness there is little extra pleasantness to gain (Wilms and Oberfeld: medium vs high not significant).
- Inference: the most pleasant colours are medium saturation, not maximum; save maximum saturation for intensity (summer, the cusp moments), not for happiness.
- Inference: muted warm colours (dusty rose, faded amber) are the pleasant end at low saturation, which supports warm, faded memory palettes; at high saturation blue becomes the pleasant hue, which supports a cobalt summer sky.
- Inference: avoid olive, khaki and mud-brown fields (the least liked colours in Palmer and Schloss) except where unpleasantness is the goal.
- Inference from Lin et al.: a death moment hurts more at roughly half the chapter's saturation than in full grey; full grey dampens feeling and fits numbness afterwards.
- Inference from Zhou et al.: a cold, dark present frame and warm memories fit how nostalgia works (cold invites nostalgia, nostalgia warms).
- Inference: colour alone will not make anyone cry (Kallabis et al.; Florence's director in section 3); colour amplifies what story, music and interaction already carry.

### Gaps
- The Jonauskaite 2020 full text (association strengths per colour and emotion) could not be read; the host refused connection. Specific links above come from a press report.
- No controlled study was found showing that sepia, faded or warm-graded images are rated more nostalgic. The nostalgia-warm link rests on Zhou et al. (temperature, not colour) and on craft.
- No study links palette choices to crying. Evidence covers ratings and physiology to colour patches and photos, not 20-minute narratives.
- Warm-light comfort evidence is mixed (Kruithof vs Fotios) and most popular claims come from lighting vendors.

## 2. What film and animation craft does with colour across a story

### Takeaway
Animation plans colour as an arc across the whole film (the colour script), ties colour to people (Ellie's pink), drains it after loss and brings it back with healing, and builds contrast between worlds on purpose. One saturated accent in a drained frame pulls the eye to the person the story is about to lose.

### Cited Findings
- Ralph Eggleston made Toy Story's colour script on his own initiative: small chalk-pastel frames on black paper, a stream-of-consciousness map of colour, value and drama. John Lasseter said colours got more intense as emotions got more intense; Pixar has since made a colour script for every feature. Colour scripts predate Pixar (Disney features of the early 1940s, revived on Aladdin). Source: [Hyperallergic, The Art of Pixar](https://hyperallergic.com/610771/the-art-of-pixar-chronicle-books/); [MoMA audio](https://www.moma.org/audio/playlist/192/2581) (via search summary).
- Up: Lou Romano painted the colour script ("my last assignment on UP"), with more lighting detail than usual; Jean-Claude Kalache's lighting team refined it. The film opens with rich colour, Ellie brings colour into Carl's life, his life turns dull after her death, colour returns through memories of her and with Russell; each new character adds colour and brightness; adventure is bright, danger is dark. Source: [/Film](https://www.slashfilm.com/503975/cool-stuff-lou-romanos-color-script-for-pixars-up/).
- Up's Married Life sequence: the team chose pink for Ellie's adventurous spirit and kept it through the film even when she is absent; the funeral uses pink flowers and balloons; the soft pink light on the house dims as Carl walks in alone. Pete Docter: "it seemed like the less we had the more emotional it felt" (no dialogue, music and visuals only). Kalache showed it to children of about 10 or 11: "They were all crying after this sequence." Source: [The Ringer](https://www.theringer.com/2022/06/14/movies/up-first-10-minutes-making-of).
- A student analysis says Up's palette mutes in sad moments and intensifies in happy ones, and that after the funeral the pinks fade toward near-monochrome as Carl re-enters the house. Source: [Sheffield Hallam student journal](https://studentjournals.shu.ac.uk/index.php/enquiry/article/download/125/125/398) (secondary).
- Coco: the marigold bridge's orange was meant to stand for family connection (marigold, cempasuchil; a sun symbol in Aztec times); each petal is its own light source. In the night Land of the Dead, where nearly every colour appears, the team varied luminance to steer emotion and broke intense colour with quiet moments in blue and purple. Source: [Walt Disney Company news](https://thewaltdisneycompany.com/news/pixars-coco-uses-innovative-visual-effects-celebrate-family-tradition/); [6abc](https://6abc.com/post/the-colorful-symbols-of-pixars-coco/2524370/).
- Wolfwalkers: Ross Stewart: "every time we would make a decision about, say, the forest being really colorful, then automatically, the town would be really desaturated." The town is grey-brown with accented blacks and reds; the forest is loose watercolour with autumn oranges. Source: [Cartoon Brew](https://www.cartoonbrew.com/feature-film/director-tomm-moore-reveals-new-details-about-wolfwalkers-coming-to-apple-tv-annecy-wip-193335.html); [Awards Radar](https://awardsradar.com/2021/03/04/interview-wolfwalkers-artists-on-creating-magic-between-the-lines/).
- Makoto Shinkai ties his large skies to childhood in the mountains and to longing for something out of reach; Your Name uses twilight and magic-hour light for transitions and moments on the cusp; contrast between sky, earth and people guides the eye, and for one twilight scene he flattened brightness so nothing is brighter than anything else. Source: [BFI, Sight and Sound interview](https://www.bfi.org.uk/sight-and-sound/interviews/trading-places-makoto-shinkai-your-name).
- Patti Bellantoni's If It's Purple, Someone's Gonna Die (Focal Press 2005), based on about 25 years of colour-behaviour classes, sorts 60+ films under six colours. Chapter titles: red "the caffeinated color" (powerful, lusty, defiant, anxious, angry, romantic); yellow "the contrary color" (exuberant, obsessive, daring; innocent, cautionary, idyllic); blue "the detached color" (powerless, cerebral, warm; melancholy, cold, passive); purple "the beyond-the-body color" (asexual, illusory, fantastic; mystical, ominous, ethereal). Source: [Elsevier](https://shop.elsevier.com/books/if-its-purple-someones-gonna-die-the-power-of-color-in-visual-storytelling/bellantoni/978-0-240-80688-4); [ASC store](https://store.ascmag.com/products/if-its-purple-someones-gonna-die-the-power-of-color-in-visual-storytelling).
- Schindler's List: the girl's red coat is the only colour in a black and white crowd scene; she is later identified among the dead by the same coat, so the colour marks her fate. Readings range from innocence to blood to Schindler's changing view. Source: [NoFilmSchool](https://nofilmschool.com/girl-in-the-red-coat-in-schindlers-list); [LitCharts](https://litcharts.com/lit/schindler-s-list/symbols/the-color-red).
- Memory grading in recent drama: in Black Mirror's "Eulogy", colourist Sam Chynoweth gave each period of a life its own look, including two Polaroid looks "to capture the low-contrast, low-clarity nostalgia" and an Ektachrome compact look, with a clean neutral present. Source: [Digital Media World](https://digitalmediaworld.tv/post/colourist-sam-chynoweth-walks-the-line-from-memory-to-life-for-black-mirror); [FilmLight](https://www.filmlight.ltd.uk/customers/case-studies/blackmirrors7-pt3.php).
- Lupin's flashbacks used a different palette from the present: more light, more flares, warmed in the grade (DoP Christophe Nuyens). Source: [AFC](https://afcinema.com/Grading-and-finishing-Netflix-s-Lupin-with-BaseLight-by-FilmLight-at-Mikros.html).
- Halation, the reddish-orange halo around bright edges on film, reads as analogue and therefore as memory to many viewers; digital crews fake it with diffusion such as Black Pro-Mist, which blooms highlights and lowers local contrast. Source: [CineD](https://www.cined.com/chasing-the-glow-understanding-halation-and-why-filmmakers-keep-coming-back-to-it/).

### Inferences
- Inference: the strongest single tool for this story is Up's rule that colour belongs to a person. If each family member owns a hue, the world can lose that hue when the person dies and get it back at the end.
- Inference: Wolfwalkers' opposition rule applies to the frame: the more colourful a memory chapter, the more drained the present porch should stay, so each return to the present is felt.
- Inference: red is the one colour tied to both love and anger (section 1), which makes it the right colour to reassign between the cold open (alarm) and the reveal (love).
- Inference: magic hour belongs at the cusp moments (leaving home, the partner, the baby, the final send), following Shinkai.

### Gaps
- No primary Roger Deakins interview on colour and emotion was found in this pass.
- No sourced material was found on Inside Out, Spirited Away or Arcane colour arcs; they are left out.
- Spielberg's own stated reason for the red coat was not verified (a /Film article claims one; not opened).
- Romano's Up colour script panels were not viewed directly; the arc above is /Film's and The Ringer's reading.

## 3. How games move palette with emotion

### Takeaway
Narrative games use the same tools as animation: a sky that sets most of the colour, a colour script tied to story beats, contrast from level to level, and colour returning as healing (Gris). Directors of the most emotional small games also say colour supports the feeling while interaction carries it.

### Cited Findings
- Firewatch (Campo Santo): Jane Ng: "The colours are not just there to look beautiful. They really do drive the mood of the scene"; "You probably don't want that crazy parade, birthday party colour scheme when you're trying to be spooky." Bold colours sit in distinct depth layers; outdoors, the sky determines most of the colour and can fill half the screen; fog adds depth; a colour script tied to narrative moments keeps the look consistent; dynamic sky lighting lets colours change on the fly. Source: [Thumbsticks, GDC 2015 The Art of Firewatch](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch).
- Olly Moss based the key art on New Deal-era National Park Service posters, in palette and iconography; Moss painted over screenshots to push colour during reviews. Source: [Kill Screen, Jane Ng](https://www.killscreen.com/jane-ng-turned-real-world-firewatch/); [Wired](https://wirednews.pages.dev/2016/02/firewatch-olly-moss).
- Journey (thatgamecompany): Kellee Santiago said the team borrows Hollywood structure, wanted players to go through the whole emotional arc in one sitting, and that the contrast and comparison of emotions from level to level mattered most. Source: [GamesBeat](https://gamesbeat.com/kellee-santiago-describes-the-making-of-thatgamecompanys-journey/). Matt Nava: "Everything is communicated with imagery, color, sound, and design." Source: [Push Square](https://www.pushsquare.com/news/2012/02/interview_thatgamecompany_journey).
- A fan analysis of Journey describes warm yellows and oranges early, blue and ominous light underground, warmth on the climb, and the red robe readable against every environment. Source: [Girls on Games](https://girlsongames.ca/2017/05/04/art-examination-journey) (low authority).
- Gris (Nomada Studio, art by Conrad Roset): the world starts monochrome with only the heroine's turquoise hair in colour; colour returns as she gains strength, red first, then greens, blues and purples; "Gris" is Spanish for grey. Source: [NME](https://www.nme.com/features/colour-me-happy-colour-and-symbolism-in-video-games-2835574); [Wikipedia](https://en.wikipedia.org/wiki/Gris). Critics read the colours as Kubler-Ross stages (grey denial, red anger, green bargaining, blue depression, yellow acceptance); this is an interpretation, not a developer statement. Source: [A Garden of Stories](https://agardenofstories.substack.com/p/gris).
- Inside (Playdead): muted, near-monochrome world; the boy's red sweater is the one splash of colour, compared by critics to Schindler's List. Source: [NME](https://www.nme.com/features/colour-me-happy-colour-and-symbolism-in-video-games-2835574); [GameRevolution](https://gamerevolution.com/review/70543-inside-review).
- Florence (Mountains, Ken Wong): "There's intentionally not much animation in the game. The color palette is very simple"; "The feeling or story has to come from the interactions, not from the images"; "Perhaps this simplicity allows players to imagine more." Source: [Game Developer](https://gamedeveloper.com/audio/designing-i-florence-i-to-convey-the-ineffable-feeling-of-being-in-love).
- Alto's Odyssey: a fan analysis says Harry Nesbitt works with a limited palette per area, purer colour in the foreground and tinted backgrounds. Source: [Ulster blog](https://blogs.ulster.ac.uk/cormacmccann/?p=794) (low authority).

### Inferences
- Inference: the current game palettes (scenes.js) are time-of-day correct, which is why they feel generic. Computed: every current sky top sits between hue 249 and 289 (blue to blue-violet) and mean chroma stays between 0.050 and 0.098 outside snow, so chapters differ mostly in lightness. Firewatch and Gris give each beat its own colour identity and accept unreal skies.
- Inference: Santiago's "contrast from level to level" is a direct argument for making adjacent chapters differ on at least two of the three dimensions (hue family, saturation, brightness).

### Gaps
- No primary source was found for Journey's level-by-level palette, Firewatch's per-day palettes, or the colour design of Monument Valley, Sky, Ori or Alto's Odyssey; GDC Vault pages show only abstracts.

## 4. Techniques for memory, time of day, grief, home and readable signature colours

### Takeaway
Memory reads as warm, lifted, lower-contrast light with soft highlight glow; cusp moments sit at golden and blue hour; grief works best as saturation loss with one surviving accent; home is a warm window against cool night; and a person's colour stays readable when the background hue is far from it and an outline carries the value edge.

### Cited Findings
- Memory looks: warmed flashbacks with more light and flares (Lupin), low-contrast low-clarity Polaroid nostalgia vs a clean neutral present (Black Mirror "Eulogy"), and halation or Pro-Mist bloom for an analogue memory feel. Source: [AFC](https://afcinema.com/Grading-and-finishing-Netflix-s-Lupin-with-BaseLight-by-FilmLight-at-Mikros.html); [Digital Media World](https://digitalmediaworld.tv/post/colourist-sam-chynoweth-walks-the-line-from-memory-to-life-for-black-mirror); [CineD](https://www.cined.com/chasing-the-glow-understanding-halation-and-why-filmmakers-keep-coming-back-to-it/).
- Warmth draws engagement on photos (Bakhshi et al. 2015) and nostalgia is felt as warmth (Zhou et al. 2012). Sources in section 1.
- Golden and blue hour: sunrise and sunset raise beauty and awe (Exeter 2023); Shinkai uses magic hour for transitions. Sources in sections 1 and 2.
- Grief: Up drains to grey after Ellie and keeps her pink; Gris begins grey; Inside keeps one red. Lin et al. 2023: half saturation makes negative images more unpleasant, full grey less. Sources in sections 1 to 3.
- Home: in Up, the pink light on the house dims when Carl comes home alone, so the lit house is the marker of the person inside. Source: [The Ringer](https://www.theringer.com/2022/06/14/movies/up-first-10-minutes-making-of). Warm, low interior light is pleasing in Kruithof's model, contested by Fotios 2017. Source: [Wikipedia, Kruithof curve](https://en.wikipedia.org/wiki/Kruithof_curve).
- Readability: a figure colour is liked more the more its hue contrasts with the background (Schloss and Palmer 2011); Journey's red robe stays readable against every environment (fan analysis). Sources in sections 1 and 3.

### Inferences
- Inference, memory recipe for painted canvas: lift the darkest ink to about OKLab L 15 to 20 in memory chapters (no true black), keep highlights warm (rim colours on the yellow-orange side), add a soft orange halo on rim lights (halation), and keep local contrast lower than in the present frame. The present frame uses true near-black and a neutral to cool rim.
- Inference, grief in two steps: the death moment at about half the chapter's chroma (hurts most, Lin et al.), the aftermath drained to near-grey (numb, Up and Gris), with one surviving accent in the lost one's colour (Schindler, Inside, Up's pink).
- Inference, home: hold the warm window (about 2700 to 3000 K, roughly #FFA957 to #FFB46B in common blackbody-to-sRGB tables; approximate) against a cool, low-chroma exterior. Warm vs cool is the largest hue contrast available and the window is the brightest thing in the frame, which the eye goes to first (bright reads as good, Meier et al.).
- Inference, chapter contrast: each chapter should own a horizon and fog hue family that no neighbour shares, and alternate saturation level (high, low, high) so the change between chapters is visible even on a small phone screen.
- Inference, signature colours: put each chapter's key person against a background hue far from theirs (partner blue against apricot dawn, kid orange against blue sky, Mom red against the teal-dark window), and give every figure a value edge (rim on the lit side, ink outline on the shadow side), since figures span L 43 to 85 and no single ground colour contrasts with all of them.

### Gaps
- No controlled study measured lifted blacks or bloom on nostalgia; this rests on colourists' practice.
- Blackbody hex values were not checked against a primary table in this pass.

## 5. Accessibility: text over painted skies and colour-coded people

### Takeaway
White text on daytime skies fails WCAG in every proposed day palette; a dark caption plate fixes it. The current Mom red and Dad green collapse to almost the same colour for protanopes; a darker teal-green for Dad plus the existing silhouette cues fixes it.

### Cited Findings
- WCAG 2.2 SC 1.4.3 (AA): 4.5:1 for normal text, 3:1 for large text (24 px regular or 18.66 px bold); SC 1.4.11: 3:1 for graphics needed to understand content; SC 1.4.6 (AAA): 7:1. The 4.5:1 level accounts for moderately low acuity, colour deficiency and age-related contrast loss. Source: [W3C Understanding 1.4.3](https://w3.org/WAI/WCAG20/Understanding/contrast-minimum); [WebAIM](https://webaim.org/articles/contrast/).
- Colour blindness affects about 1 in 12 men (8%) and 1 in 200 women, mostly red-green; red-green deficient viewers can confuse reds, greens, oranges, browns, purples, pinks and greys, and blue with purple; black can be confused with dark red, green or purple. Source: [Colour Blind Awareness](https://www.colourblindawareness.org/colour-blindness/).
- Okabe-Ito colour-universal-design set: #E69F00, #56B4E9, #009E73, #F0E442, #0072B2, #D55E00, #CC79A7, #000000. Source: [rdrr.io, colorblindr](https://rdrr.io/github/clauswilke/colorblindr/src/R/palettes.R); [NYU Siegal lab](https://siegal.bio.nyu.edu/color-palette/).

### Inferences
- Computed: white text directly on the light parts of the proposed day skies (every horizon, and the sky tops of Morning, Noon, Dawn, Grandma, Baby, Afternoon and Late) gives 1.1:1 to 4.1:1 (fails); dark ink #14121A on the day horizons gives 6.3:1 to 16.4:1; white on the night skies gives 11.7:1 to 18.6:1. A caption plate of #14121A at 72% opacity over the brightest skies gives 8.0:1 to 10.8:1 for white text. Rule: captions sit on an ink plate at 70 to 80% opacity in day scenes, or use ink text on light horizons.
- Computed, current people colours (people.js): Mom #c9473f vs Dad #4e6a48 has OKLab difference 21.7 for normal vision, 10.9 for deuteranopes and 1.3 for protanopes, with luminance ratio 1.28: indistinguishable for protanopes. Dad at #2f5a4e (darker teal-green) gives 18.1 deutan, 6.1 protan, luminance ratio 1.65. Dad's broad build and Mom's long hair and coat remain the main cue.
- Computed: Me #e8913a vs Kid #f0a347 differ by 4.5 even for normal vision (near-identical). If the two must be told apart in Afternoon, Kid at #f7b84a gives 9.8, or adult Me at #d9772e vs Kid #f0a347 gives 11.4. Kid at #f6c04f would sit too close to the best friend's yellow #f2c94c.
- Computed: Grandma #7b5b8e vs Partner #5b8fd0 stays apart under both simulations (12.3 deutan, 15.7 protan).
- Computed: Mom red vs the dog's collar red (#c8333a) are the same hue family; if red is reserved for Mom (section 6), the collar could move to another hue.
- Inference: never let colour alone carry who is who; size, hair, coat and the scarf already do, and each figure should get the rim and outline from section 4.

### Gaps
- Simulation used Machado 2009 full-severity matrices; anomalous trichromats (the most common case) see smaller shifts. No user test was run.

## 6. Proposed colour script with hex values per chapter and beat

### Takeaway
Give every chapter its own emotion-matched hue family and saturation level, let each person own a hue that the world loses when they die, keep the present porch cold and nearly still so every memory chapter lands by contrast, and end on first light with the warm window held: the colours of the dead come back once, at the word "home".

### Cited Findings
- Brightness raises pleasantness (Valdez and Mehrabian beta .69; Wilms and Oberfeld partial eta squared .491) and saturation raises arousal (beta .60; partial eta squared .693); medium saturation is the most pleasant; greys are least pleasant and slow the heart rate. Source: section 1.
- Red: love and anger; yellow: joy (stronger in rainy, northern countries); grey and black: sadness; white: relief; purple: sadness in Greece. Source: section 1, Jonauskaite et al.
- Colour belongs to a person and drains after the death (Up), returns with healing (Up, Gris), one accent survives (Schindler, Inside), worlds built in opposition (Wolfwalkers), magic hour at the cusp (Shinkai), colour script tied to beats (Firewatch, Pixar). Source: sections 2 and 3.
- Cold invites nostalgia, nostalgia warms (Zhou et al.); sunrise and sunset raise awe (Exeter). Source: section 1.

### Inferences
All palettes below are Inference: a proposal built from the findings above. Columns follow scenes.js: sky top, sky horizon, fog, ground / ink, accent, rim. "L / C" is the computed mean OKLab lightness and chroma of sky top, horizon, fog and ground.

Rules the script follows
1. Colour economy. Each person owns a hue: Mom red #c9473f, Dad green (proposed #2f5a4e), Grandma purple #7b5b8e with the yellow scarf #e0a83e, Partner blue #5b8fd0, Kid orange #f0a347, Me orange #e8913a, the best friend yellow #f2c94c, the dog its brown coat. While a person lives, a little of their hue sits in the world (a roof, a field, a cloud edge). When they die, that hue leaves the world and does not come back until the end.
2. Red is Mom's. The only other red is the cold-open clock, and the reveal shows that clock red was Mom all along (red is the one colour tied to both alarm and love).
3. The present is cold and nearly still. One porch palette, with only the horizon lifting a small step at each return, so the final dawn has been coming all night.
4. Memory chapters have lifted blacks and warm rims; the present has near-black ink and a cool rim.
5. Neighbouring chapters change at least two of hue family, saturation and brightness.
6. Deaths in two steps: the moment at half the chapter's chroma, the aftermath at the drained palette listed, one accent in the lost one's colour.

The frame and the bookends

| Beat | Feeling | Sky top | Horizon | Fog | Ground / ink | Accent | Rim | L / C |
|---|---|---|---|---|---|---|---|---|
| Cold open, kitchen 01:06 | unease: someone up too late | #3A2A22 (upper wall in shadow) | #E2B27C (lamp-lit wall) | #C9925E | #2A1D18 / #1A1210 | #FF4B33 clock digits; window #0B1220 | #FFD7A0 | 51 / 0.059 |
| Porch frame, present night | waiting, cold, still | #08141C | #1E3A44 | #2A4B54 | #0C171C / #050B0F | window #FFB25E; phone #D8F0FF | #6FA0A6 | 28 / 0.031 |
| Frame horizon by return | the night slowly giving way | after Morning #1E3A44, Noon #243F4E, Evening #2B4659, Dawn #344E66, Afternoon #3F5774 | | | | | | |
| Reveal: Mom waiting up | the same room, now love | #0B1620 (night through the window) | #F2C48A (warm wall) | #E0A86A | #3A2620 / #1C120E | Mom #C9473F against the dark window; lamp #FFB45C | #FFD9A3 | 53 / 0.063 |
| Final "home" | relief, first light, home | #4A6FA5 | #FFD9A8 | #F7E6D4 | #3A3A4F / #22223A | sent message #FFFFFF; window stays #FFB45C | #FFF3E0 | 69 / 0.059 |

Why
- Cold open: a warm, lit interior at a dead hour against a black window is the largest warm-cool contrast available, so it draws the eye and feels wrong at 01:06; the red clock is the most arousing hue at its saturation and reads as alarm. Moderate brightness, low chroma keeps it quiet.
- Porch frame: lowest brightness and low chroma (L 28, C 0.031): low pleasantness and low arousal, the feel of waiting. Petrol teal (hue 223 to 239) is chosen for distinctness from the current navy (hue 271) and from the violet city nights; at this chroma hue has little emotional effect of its own (Wilms and Oberfeld), so the choice is about identity. The warm window is the one constant warm thing, and per Zhou et al. the cold present is what makes the warm memories feel like warmth.
- Reveal: same hexes as the cold open, with the alarm red taken off the clock and put on Mom. Colour-in-context: same red, new meaning. Stage her in front of the dark window so her red has the strongest figure-ground hue contrast.
- Final "home": the frame's petrol night completes its slow lift into a clear dawn blue with a warm white horizon. White is the shared colour of relief, bright reads as good, and sunrise raises awe. Keep the warm window lit through the whole shot so home and morning are on screen together. Optional last touch: the colours of the dead return once along the cloud edges in story order (the dog's coat, Grandma's purple and scarf yellow, Dad's green, Mom's red), the Up and Gris return, then settle into the dawn.

The life chapters

| Beat | Feeling | Sky top | Horizon | Fog | Ground / ink | Accent | Rim | L / C |
|---|---|---|---|---|---|---|---|---|
| Morning, 0 to 9 | wonder, safety, joy | #5DB8E8 | #FFF0C2 | #D9F0E6 | #3E9A80 / #1F4D45 | #FFD23F sun, kite, butter light | #FFF7DE | 82 / 0.074 |
| Noon, 9 to 17 | freedom, summer at full volume | #1E7FE0 | #8FE3F0 | #B9F0EE | #0E7A5E / #0B3F33 | #FF5A36 hot coral (bike, popsicle) | #FFFBE0 | 73 / 0.102 |
| Dog dies at 16 (aftermath) | first loss, quiet | #5A6B78 | #C9B8A6 | #B7B2AA | #4A4846 / #1E1E22 | the dog's collar (currently #C8333A) | #E6DED2 | 62 / 0.019 |
| Leaving home (opens Evening) | the cusp, magic hour | #3B2C6E | #FF9A5A | #E77A6A | #3A2240 / #1C1024 | #FFD27A | #FFB07A | 53 / 0.114 |
| Evening, 18 to 24, city nights | loneliness with a glow | #120F2A | #3B2E6B | #5B3F7A | #16122A / #0B0A16 | #FF9E3D sodium street lamps | #7FE3FF screen light (the online friend) | 29 / 0.075 |
| Dawn, 24 to 35, the partner | tenderness, love arriving | #6E7FC4 | #FFC3A6 | #F6CFC4 | #4A3C5E / #2A2238 | #FFD36E first sun | #FFE4C9 | 69 / 0.073 |
| Grandma dies (aftermath) | bright, gentle grief in snow | #8A8E9E | #D9D4D8 | #CFCBD3 | #E4E2E6 (snow) / #3E3A45 | #E0A83E her scarf | #FFFFFF | 83 / 0.012 |
| The baby | new light, calm joy | #8FB8E8 | #FFE6B0 | #FFF1DA | #4E4566 / #2A2438 | #F0A347 the kid's colour arrives | #FFFFFF | 77 / 0.061 |
| Afternoon, 34 to 66 | full, warm, fast; golden hour | #4F8FC0 | #F6C27A | #F0CFA0 | #6E4A52 / #2A1A20 | #FF8A3D | #FFE0A8 | 70 / 0.082 |
| Dad dies at 58 (aftermath) | heavy, rain, slate | #4A5563 | #8E98A3 | #A7AFB7 | #2E333A / #1B1F24 | #4F8A78 one green thing of his | #C9D1D9 | 55 / 0.019 |
| Mom dies at 66 (aftermath) | the deepest drain | #2F3442 | #6B6470 | #77707A | #1E1D24 / #121117 | the window that was #FFB25E is now #1A1C24 (an absence) | #9A93A0 | 41 / 0.019 |
| Late, 66 to 78 | calm, pale, alone, accepting | #A9B4C6 | #F3E2D3 | #ECE4DE | #7D7484 / #3A3440 | #E8913A Me, the last colour left | #FFF6EC | 80 / 0.024 |

Why
- Morning: the brightest chapter at medium chroma (L 82, C 0.074), the most pleasant zone in both lab studies. Clear cyan sky is the most liked object colour (Palmer and Schloss); butter-yellow light is the shared colour of joy, likely felt more strongly by players from rainy northern countries. Hills are blue-green mint, never chartreuse (the least liked hue). Mom's red and Dad's green appear in the world (a red roof, a green door) because they are the world at this age.
- Noon: highest chroma of the chapters (C 0.102) for adolescent intensity, since saturation is the arousal lever; the sky is a saturated cobalt because blue is the pleasant hue only at high saturation; hot coral accents use red's arousal. Complementary warm-cool pairs here, harmony elsewhere.
- Dog dies: the first time colour leaves (C drops from 0.102 to 0.019); grey is the shared colour of sadness and lowers heart rate. The collar is the one accent. If red stays reserved for Mom, make the dog's accent its own warm coat (#b9773f) or a collar in a hue no person owns (for example teal #2F8FA3) before this beat is built.
- Leaving home: a short magic-hour beat with the highest chroma in the game (C 0.114) because it is the cusp moment; violet sky top into orange horizon gives the largest hue spread of any beat. Mom and Dad stand against the orange horizon (computed: Dad at the proposed #2f5a4e reads at 3.7:1 against it, Mom at 2.2:1 with a large hue difference).
- Evening: back to the dark (L 29) in violet-indigo, the hue family the game has not used yet, so it reads as a new, strange place. Purple is Bellantoni's "beyond-the-body" colour (illusory, ethereal), which fits a friend who exists only on a screen; the screen's cyan rim is the friend's light. Sodium orange vs screen cyan is a complementary pair for loneliness with tension.
- Dawn: periwinkle into apricot-rose: high brightness, moderate chroma, warm horizon (L 69, C 0.073) for tenderness without excitement. The partner's blue stands against a warm horizon (largest hue contrast for a figure), the Up rule of colour arriving with the person.
- Grandma: grief that is bright, not dark (L 83, C 0.012): snow and pale lilac, her purple in the ink, her yellow scarf the one accent. Pale and white keeps it gentle and natural for an old person's death; the near-zero chroma still says loss. Purple's link to sadness (Greece) and Bellantoni's "mystical, ethereal" purple fit her.
- The baby: the brightest calm in the game after Morning (L 77), warm white sky and a dusky violet ground; the kid's orange enters the world here, as each new person adds colour in Up.
- Afternoon: the long, full chapter in amber and plum at golden hour (sunset raises beauty and awe); plum ground in place of brown or olive keeps the warmth liked. The kid's orange echoes Morning's warmth: the kid's childhood is the parent's afternoon. Within the chapter, let the sun drop: early scenes nearer Morning, late scenes nearer the horizon gold. Staging caution (computed): the kid's orange nearly matches the gold horizon (1.3:1, OKLab difference 7.9), so frame the kid against the blue upper sky or the plum ground (3.6:1), or give the kid a strong rim.
- Dad dies: slate rain, low brightness, near-zero chroma (L 55, C 0.019). His green leaves the world from here on: no green fields or doors in later chapters, except the one green object of his.
- Mom dies: the darkest and most drained life beat (L 41, C 0.019). The accent is an absence: the warm window that has been on in every porch scene is dark here. Up's pink light dimming as Carl walks in is the model. Her red leaves the world.
- Late: pale and silvered (L 80, C 0.024): high brightness keeps it pleasant, very low saturation keeps it calm. At low saturation warm hues are the pleasant ones, hence the pearl-peach horizon. Me's orange is the last chromatic colour left, so the eye always finds the player.

### Gaps
- None of these palettes has been seen on a phone; every hex needs a check in the actual canvas renderer at 390 px, in daylight and dark rooms.
- No evidence was found on how fast palette transitions should run for emotional effect.
- The per-person hue economy is a craft synthesis from Up, Gris and Inside, not a tested technique.
- Character readability numbers assume flat fills; the painter's light, fog and vibrance passes will shift them.
