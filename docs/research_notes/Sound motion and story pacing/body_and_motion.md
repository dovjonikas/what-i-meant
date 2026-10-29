# Body and motion: how faceless people and quiet scenes carry feeling ("Text me when you get home")

Scope: bodily emotion cues without faces, character animation craft for a 2D canvas stroke rig, ambient micro-animation, camera, and "years later" transitions. Every claim is sourced. Recommendations are marked as inferences. Rig numbers taken from the current code are cited to the local files:
`D:/Claude Code/what-i-meant/site/stories/text-me/js/people.js`, `pets.js`, `fx.js`, `stage.js`.

What the rig does today (read from the code, used below as the baseline):
- Breathing: `Math.sin(t * 1.7 + seed) * h * 0.004`, a period of 3.7 s (about 16 breaths a minute), the same rate for everyone; `seed = x * 9` only shifts the phase ([people.js](D:/Claude%20Code/what-i-meant/site/stories/text-me/js/people.js), `standing()`).
- Weight shift: `Math.sin(t * 0.55 + seed) * h * 0.008`, period 11.4 s, applied to hips and feet together; off while moving ([people.js](D:/Claude%20Code/what-i-meant/site/stories/text-me/js/people.js)).
- Walk bob: `-abs(sin(step)) * h * 0.02`; arm swing `sin(step) * h * 0.1` in the `walk` pose; trunk lean `it.bend` (old people default 0.2 rad, phone pose 0.07 rad). There is no separate head pitch; the head is drawn in the torso frame ([people.js](D:/Claude%20Code/what-i-meant/site/stories/text-me/js/people.js)).
- Wave: `Math.sin(t * 5) * 0.28`, a 1.26 s cycle, constant amplitude, for every age ([people.js](D:/Claude%20Code/what-i-meant/site/stories/text-me/js/people.js), `armPose('wave')`).
- Dog: wag `sin(t * wagSpeed)` with wagSpeed 4 (old, 1.57 s cycle), 11 (adult, 0.57 s), 16 (puppy, 0.39 s); idle bob period 4.5 s; poses stand, sit, lie, front ([pets.js](D:/Claude%20Code/what-i-meant/site/stories/text-me/js/pets.js)).
- Camera push: CSS `scale(1)` to `scale(s)` with `cubic-bezier(0.25, 0.1, 0.25, 1)` (the CSS `ease` curve), skipped under `prefers-reduced-motion: reduce`; scene changes are an opacity cross-fade ([stage.js](D:/Claude%20Code/what-i-meant/site/stories/text-me/js/stage.js)).

## 1. What the science says about emotion from bodies without faces

### Takeaway
Bodies alone carry emotion well, and sadness is the best-carried emotion of all: it reads at 90 percent and above from gait without a head and from static mannequin postures, through slow speed, a lowered head and chest, small strides and reduced arm swing. Speed mostly encodes arousal (calm vs excited), while pleasantness lives in the timing relations between body segments; nuanced states like longing, waiting and relief have no direct lab evidence and must be built from context (orientation toward an absent thing, props, a sigh).

### Cited Findings

**Recognition from bodies, motion vs stills**
- Atkinson, Dittrich, Gemmell and Young (2004, Perception 33(6), 717-746): 10 actors with faces covered portrayed anger, disgust, fear, happiness and sadness at 3 exaggeration levels; 150 portrayals in full-light and point-light, plus static "peak" frames. All five emotions were recognised from body movement even in point-light displays; static images also conveyed emotion but less efficiently than dynamic ones ([Sage, DOI 10.1068/p5096](https://journals.sagepub.com/doi/10.1068/p5096); [Scilit record](https://www.scilit.net/publications/1f3ded9ad67659d777c30b566339faba)).
- Same study: exaggerating the movement raised recognition accuracy, most clearly for dynamic point-light displays, but NOT for sadness; exaggeration also raised intensity ratings more for movies than for stills, so intensity judgements depend more on movement than on static form ([Sage abstract](https://journals.sagepub.com/doi/10.1068/p5096)).
- Coulson (2004, Journal of Nonverbal Behavior 28, 117-139): 176 computer-generated mannequin postures, each from 3 viewing angles, forced choice among 6 emotions. Agreement ranged from zero for many disgust postures to over 90 percent for some anger and sadness postures; anatomical variables (joint angles) plus viewing angle predicted the answers; happiness and surprise were confused with each other, the other four rarely ([UEA repository](https://ueaeprints.uea.ac.uk/id/eprint/73537/); [UEA portal](https://research-portal.uea.ac.uk/en/publications/attributing-emotion-to-static-body-postures-recognition-accuracy-/)).
- Wallbott (1998, European Journal of Social Psychology 28(6), 879-896): 224 video takes of actors portraying 14 emotions, coded for movement and posture. Some emotion-specific movement and posture features exist, but part of the difference between emotions is explained by activation (arousal) level ([index record](https://acnpsearch.tweb-dev.unibo.it/singlejournalindex/46537865)). Later papers cite it for a collapsed posture in sadness and shame and for pride being shown more by body than by face (secondary citation, [Frontiers 2011](https://www.frontiersin.org/articles/10.3389/fpsyg.2011.00181/pdf)).
- Dael, Mortillaro and Scherer (2012, Emotion 12(5), 1085-1101): 10 professional actors, 12 emotions, coded with the Body Action and Posture (BAP) system. Several movement patterns occurred systematically in specific emotions and allowed them to be told apart; a few emotions had one prototypical pattern, most were expressed through several patterns, many of which map onto appraisals and action readiness; the body carries emotion-specific information, not only intensity ([UNIGE CISA page](https://www.unige.ch/cisa/gemep/bodily-expression); [BAP coding paper, J Nonverbal Behav 36(2)](https://doc.rero.ch/record/309735)).
- de Gelder (2006, Nature Reviews Neuroscience 7, 242-249): bodily expressions show which action goes with an emotion, so less interpretation is needed than for faces; emotional body language is perceived automatically ([Tilburg record](https://research.tilburguniversity.edu/en/publications/towards-the-neurobiology-of-emotional-body-language/)). A related 2006 Neuroreport study found unseen happy body images still activated motion area MT and the pulvinar (non-conscious processing) ([MGH record](https://www.nmr.mgh.harvard.edu/publications/journal_articles/764)).

**Speed = arousal; segment timing = pleasantness**
- Pollick, Paterson, Bruderlin and Sanford (2001, Cognition 82, B51-B61): point-light arm movements (drinking, knocking) in 10 affects. The perceptual space had two dimensions: activation, highly correlated with the movement kinematics (velocity), and pleasantness, which appeared for natural movements but disappeared for phase-scrambled ones, so pleasantness is "carried in the phase relations between the different limb segments" ([Glasgow eprints](https://eprints.gla.ac.uk/25001); [Pollick lecture slides](https://www.psy.gla.ac.uk/%7Efrank/Talk_folder/FIMS_faculty_lecture.pdf)). A later McAleer, Pollick and colleagues paper summarises it as wrist velocity explaining the structure of affect judgements ([PMC8679008](https://pmc.ncbi.nlm.nih.gov/articles/PMC8679008)).

**Gait and sadness, with numbers**
- Montepare et al. (1987), as summarised in a 2020 review: 10 observers watched 5 walkers (heads not shown) in sadness, anger, happiness and pride; mean accuracy 94 percent sadness, 90 anger, 74 happiness, 56 pride. Sad gaits had less arm swing; angry gaits were heavy-footed; proud and angry gaits had longer strides; happy gaits were faster ([Xu et al. review, arXiv 2003.11461](https://arxiv.org/pdf/2003.11461)).
- Michalak, Troje et al. (2009, Psychosomatic Medicine 71(5), 580-587): 14 depressed inpatients vs matched controls, and 23 students after sad vs positive music mood induction. Sad or depressed walking showed reduced walking speed, reduced arm swing, reduced vertical head movement, larger lateral swaying of the upper body, and a more slumped posture ([record](https://data.zhenzhi.com/details/1/900434655); [later everyday-life study summary](https://ouci.dntb.gov.ua/works/4L38wbw7)). An everyday-life follow-up found depressed people walked more slowly, more stooped, with less dynamic up and down movement ([Springer 2021](https://link.springer.com/article/10.1007/s10608-021-10215-7)).
- Roether, Omlor, Christensen and Giese (2009, Journal of Vision 9(6)): 25 walkers, neutral, angry, happy, sad, fearful gaits; emotion-specific features depend on only a few joints. Posture: reduced head angle (head down) for sadness, increased elbow flexion for fear and anger. Movement: larger joint amplitudes for happiness and anger, reduced amplitudes for sadness and fear. Compared with speed-matched neutral walks (velocity difference under 15 percent), the features were not explained by speed alone ([Xu et al. review](https://arxiv.org/pdf/2003.11461); [Bohrium abstract](https://www.bohrium.com/scholar/2441t475/Claire_L._Roether)).
- Gross, Crane and Fredrickson (2012, Human Movement Science 31, 202-221): 16 walkers felt joy, contentment, anger, sadness or neutral. Walking was slowest for sadness, fastest for joy and anger. Neck and thoracic flexion in sadness, and trunk extension with shoulder depression (shoulders dropped, not raised) in joy, were independent of gait speed. Observers' Effort-Shape ratings described sad gait as contracted torso, contracted limbs, indirect (wandering) space, light energy and slow, sustained time; observer ratings separated emotions better than raw kinematics ([record](https://bvbvf1.bib-bvb.de/vufind/PrimoRecord/cdi_proquest_miscellaneous_921144378); [Xu et al. review](https://arxiv.org/pdf/2003.11461)).
- Halovic and Kroos (point-light walkers): happy and angry gaits had long strides and more arm movement, angry with faster cadence; fear had fast short strides; sad walkers had slow, short strides, the slowest pace; fear and sadness both had less arm movement, but fear moved mainly the forearms while sadness moved the whole arm. Observers describe happiness as a bouncing gait, sadness as a slow slouching pace, anger as fast stomping ([Xu et al. review](https://arxiv.org/pdf/2003.11461)).
- Barliya et al. (2013): thigh elevation amplitude changed from neutral for every emotion except sadness ([Xu et al. review](https://arxiv.org/pdf/2003.11461)).
- Smoothness: angry and joyful gaits were smoother than sad gaits in vertical whole-body, head, thorax and pelvis movement ([Xu et al. review](https://arxiv.org/pdf/2003.11461)).

**Shapes with no bodies at all**
- Heider and Simmel (1944, American Journal of Psychology 57, 243-259): viewers of a silent film of two triangles and a circle moving around a box described chasing, hiding, intentions and emotions (the big triangle angry, the circle afraid, a love story) ([Open University course text](https://www.open.edu/openlearn/society-politics-law/social-psychology-sense-making-crises/content-section-5.2); [Frontiers 2020](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.00935/pdf)). The course text argues the motion was arranged to be read as a story, not random ([Open University 5.3](https://www.open.edu/openlearn/society-politics-law/social-psychology-sense-making-crises/content-section-5.3)).

**Touch as an emotion channel**
- Hertenstein, Holmes, McCullough and Keltner (2009, Emotion): 248 students, strangers touching a blindfolded partner anywhere on the body. Anger, fear, disgust, love, gratitude, sympathy, happiness and sadness were decoded above chance; accuracy reported as 50 to 78 percent ([DePauw PDF](https://www.depauw.edu/site/learn/lab/publications/documents/touch/2009_Touch_The_communication_of_emotion_via_touch.pdf); [NYT story reprint](https://www.depauw.edu/learn/lab/media/documents/media/26_New_York_Times_2009_story.pdf)). Sources disagree on the chance level (11 vs 25 percent) ([DePauw news](https://depauw.edu/news-media/latest-news/details/23871)). In the forearm-only study, love, gratitude and sympathy were decoded at 48 to 83 percent; embarrassment, envy, pride and surprise were not ([PhilArchive](https://philarchive.org/archive/THOTEO-22)).

**Breathing and relief**
- Vlemincx et al. (2010, Biological Psychology): in 42 people sitting quietly for 20 minutes, sighs reset breathing: total variability rose before a sigh and structured variability rose after it ([VU record](https://research.vu.nl/en/publications/respiratory-variability-preceding-and-following-sighs-a-resetter-/)). Vlemincx et al. (2009, Psychophysiology) measured sigh rate in induced stress and in relief when the stressor ended ([VU record](https://research.vu.nl/en/publications/why-do-you-sigh-sigh-rate-during-induced-stress-and-relief/); [Mind Hacks summary "Breathing a sigh of relief to reboot respiration"](https://mindhacks.com/2010/04/28/breathing-a-sigh-of-relief-to-reboot-respiration/)).
- Kreibig (2010, Biological Psychology 84, 394-421) reviewed 134 studies of autonomic responses in emotion; a later meta-analysis cites it as finding that contentment, relief and love lower autonomic activity while joy raises it ([PubMed](https://pubmed.ncbi.nlm.nih.gov/20371374/); [Behnke et al. meta-analysis](https://www.slideshare.net/MaciejBehnke/autonomic-nervous-system-activity-during-positive-emotions-a-metaanalytic-review)).

### Inferences
- Cue table for the rig (inference from the studies above; directions are sourced, magnitudes are not):

| State | Head | Trunk | Arms | Legs and pace | Bob and sway | Breath |
|---|---|---|---|---|---|---|
| Sadness, grief, depletion | pitched down (Roether, Gross) | chest flexed forward, collapsed (Wallbott, Gross) | small swing, whole arm moves (Montepare, Halovic) | slow, short steps (Michalak, Halovic) | less vertical bob, MORE side to side sway (Michalak) | slow, shallow, occasional sigh |
| Joy, relief after | up | trunk extended (Gross) | larger swing | longer strides, quicker | bouncy (Halovic) | after the sigh: slower, deeper |
| Anxiety, waiting (no direct data) | toward the expected thing | slightly contracted, arms close to body (Effort-Shape "contracted") | held close, forearm-only fidgets (fear pattern, Halovic) | still, small shifts | faster weight shifts | faster, shoulder-led |
| Calm love, contentment | level, turned toward the other | relaxed, shoulders dropped (Gross: shoulder depression in joy) | slow, overlapping | slow | gentle | slow (Kreibig: relief and love lower arousal) |

- Because exaggeration helps every emotion except sadness (Atkinson), sadness should be played small and slow, not big: drop the head 8 to 15 degrees and slow everything, rather than adding big slumps or shaking.
- Because pleasantness is carried by phase relations between segments (Pollick), warmth is not a pose; it is the order and lag between shoulder, elbow and hand (overlapping action). A tender gesture should have the hand trail the shoulder by 0.1 to 0.2 s; a curt or tense one moves all segments at once.
- Because sad walkers sway more side to side while bobbing less (Michalak), the existing weight-shift sine can double as a mood dial: for sadness, raise lateral sway amplitude (h * 0.008 to about h * 0.012) and cut walk bob (h * 0.02 to about h * 0.008).
- Heider-Simmel implies the strongest cue in a wide 2D shot is relational: distance, approach, following, the stop and the turn toward. For tiny figures on a phone screen, where limbs are a few pixels, the path and the pauses will read before any posture does.
- Longing and waiting are not lab categories; they are best built as orientation toward an absent thing (window, phone, gate, road) plus repetition (checking again). This is consistent with de Gelder's point that body expression shows the action tied to the emotion.
- Disgust, surprise vs happiness, and self-conscious states (embarrassment, pride) are poor bets without a face (Coulson; Montepare pride 56 percent; Hertenstein forearm study). None are needed by the listed beats.

### Gaps
- No study found that measures "longing", "waiting" or "relief" as body categories; the waiting cues above are inference.
- Exact degree values (head angle in degrees for sadness) could not be retrieved: the Journal of Vision and Psychosomatic Medicine full texts returned 403 or empty; only directions are confirmed.
- Coulson's best viewing angle per emotion and the anatomical variable values could not be read (PDF host unreachable).
- The direction of the Vlemincx 2009 result (whether sighs are more frequent in relief than in stress) was not verified from the full text; only the study design and its "sigh of relief / resetter" framing are sourced.
- No research found on how observers read SEEN touch (two figures touching) as opposed to felt touch; Hertenstein is about the receiver's skin.

## 2. Animation craft for minimal characters, with beat-by-beat recommendations

### Takeaway
Timing, not pose, carries the meaning: the same head turn reads as a hit, a dodge, an inviting glance, a thought or a stretch depending only on its duration. For faceless figures the head angle and the pauses do the work eyes do for WALL-E, and an idle that never fully stops (layered breath, desynchronised weight shift, occasional fidget) is what keeps a still frame alive.

### Cited Findings

**Principles and timing values**
- Lasseter (1987, SIGGRAPH, Computer Graphics 21(4), 35-44) applied Disney's traditional principles to computer animation: squash and stretch, timing, anticipation, staging, follow-through and overlapping action, straight-ahead vs pose-to-pose, slow in and out, arcs, exaggeration, secondary action, appeal; "personality in character animation is the goal of all of the above" ([SIGGRAPH history](https://history.siggraph.org/?p=116057); [SIGGRAPH HyperGraph summary](https://education.siggraph.org/static/HyperGraph/animation/character_animation/principles/prin_trad_anim.htm)).
- Timing gives "physical and emotional meaning", varied "not by changing the poses" but by the number of frames between them. Head turn from one shoulder to the other: 0 inbetweens, hit by tremendous force; 1, hit by something like a frying pan; 2, nervous twitch; 3, dodging a flying object; 4, giving a crisp order; 6, sees something inviting; 9, thinking about something; 10, stretching a sore muscle ([SIGGRAPH HyperGraph, Timing](https://education.siggraph.org/static/HyperGraph/animation/character_animation/principles/timing.htm)).
- Walk timing (Richard Williams' rule as relayed by practitioners): people generally walk "on 12s", half a second per step; 16 frames per step is a stroll (two-thirds of a second); about 20 frames per step is a tired or old walk (almost a second per step) at 24 fps ([Polycount](https://polycount.com/discussion/comment/2313904); [Monmouth University handout](https://animation.monmouth.edu/instruct/?p=351); [AnimSchool](https://blog.animschool.edu/?p=588)). A cartoon old-man walk example uses 16 frames per step ([Acme Punched blog](https://acmepunched.blogspot.com/2019/07/no-191-old-man-walks.html)). Practitioners warn these are base numbers that depend on the character's motivation and style ([AWN comment](https://www.awn.com/comment/1008092)). Sources disagree on whether "16s" means per step or per cycle ([Monmouth](https://animation.monmouth.edu/instruct/?p=351)).

**Idles**
- A character standing perfectly still looks dead; procedural breathing adds small chest and shoulder motion; spring chains on hair or cloth give cheap secondary motion ([MoCap Online guide](https://mocaponline.com/blogs/mocap-news/procedural-animation-generation-guide)).
- A commercial idle tool layers breathing, weight shifts, gaze and hand fidgets over an idle, and varies rhythm per character so a crowd sharing one idle does not move in unison ([Unreal forums, Idle Weaver](https://forums.unrealengine.com/t/araz-creates-idle-weaver-procedural-npc-motion-and-behaviour-system/2839748)).
- An AnimSchool instructor builds idles on a base breathing loop with overlapping fidgets so the character is never fully still, which also hides the loop ([AnimSchool, Breathing Life into Idle Animations](https://blog.animschool.edu/2024/06/14/breathing-life-into-idle-animations)). A counterpoint from a 2D developer: a constant breeze loop in an idle looks canned; context should decide ([EverEnding devblog](https://www.patreon.com/ProblemMachine/posts/everending-2020-43484541)).

**Wordless games and films**
- Journey: no text, chat or dialogue; "Everything is communicated with imagery, color, sound, and design" (art director Matt Nava); the designers wanted genderless, ageless figures, and reviewers describe them as mostly blank icons players fill in; the scarf whips more violently in wind as it grows ([Game Developer, In-depth Journey](https://www.gamedeveloper.com/audio/in-depth-i-journey-i-s-rare-and-magical-success); [CGW, Mysterious Journey](https://www.cgw.com/Publications/CGW/2012/Volume-35-Issue-4-June-July-2012/Mysterious-Journey.aspx); [GDC Vault, Designing Journey](https://gdcvault.com/play/1017700)).
- Florence (Mountains): for each moment of the relationship, the team tried many different images and interactions before one evoked the right feeling ([Apple developer story](https://apps.apple.com/gb/story/id1385422482); [GDC Vault, Letting Go: A Florence Postmortem](https://gdcvault.com/play/1025694/Letting-Go-A-Florence)).
- Inside (Playdead): the ending creature used procedural animation "to reflect intent", with impulse and intent forces battling for control, and blending between tall and low running as the body squashed ([GDC news](https://gdconf.com/news/gdc-2017-youll-see-insides-final-surprise-made); [PC Gamer](https://pcgamer.com/how-rembrandt-princess-mononoke-and-an-emu-with-arms-inspired-insides-flesh-potato)).
- WALL-E: almost no dialogue for the first 40 minutes of a 98-minute film; the robot "expresses his personality with body language and (mostly) with the binocular-like video cameras that serve as his eyes"; the neck is noted as expressive; Stanton built on Luxo Jr. ([Roger Ebert](https://www.rogerebert.com/reviews/wall-e-2008); [ScreenCrush](https://screencrush.com/wall-e-pixar-10-years-later/); [Deep Focus Review](https://deepfocusreview.com/definitives/walle)).

**Dogs**
- Quaranta, Siniscalchi and Vallortigara (2007, Current Biology): dogs wagged with a strong rightward bias (dog's own right) on seeing their owner, a weaker rightward bias for an unfamiliar person and a cat, and a leftward bias for an unfamiliar dominant dog; left also when alone ([Nature news](https://www.nature.com/news/2007/070319/full/news070319-6.html); [Phys.org](https://m.phys.org/news/2007-03-left-difference-tail-wag.html)). A 2013 follow-up found dogs watching another dog's left-biased wag showed raised heart rate and stress signs, right-biased wags relaxed them ([Wikipedia, Body language of dogs](https://en.wikipedia.org/wiki/Body_language_of_dogs)). Later commentary notes the evidence base is small ([ScienceBlog](https://scienceblog.com/m-we-tend-to-read-a-wagging-tail-as-pure-canine-joy-but-scientists-who-watched-dogs-closely-found-something-subtler-a-wag-marks-excitement-of-any-kind-leaning-right-when-a-dog-feels-good-and-left-whe/)).
- Siniscalchi, d'Ingeo, Minunno and Quaranta (2018, Animals 8(8):131) review: dogs read tail-wag asymmetries; at close range inner state shows in gaze, ears and mouth ([PMC6116041](https://pmc.ncbi.nlm.nih.gov/articles/PMC6116041/)).
- A low tail held between the hind legs, usually still, signals fear or submission; a high, stiff wag signals arousal or aggression; neutral tail height depends on breed; floppy-eared breeds can barely signal with ears; no single cue is read alone ([Wikipedia, Body language of dogs](https://en.wikipedia.org/wiki/Body_language_of_dogs); [dvm360](https://dvm360.com/canine-body-language-basics)).

### Inferences

**Converting the head-turn table to seconds.** The HyperGraph page gives inbetween counts, not frames. Assuming classic shooting on twos at 24 fps (each drawing held 2 frames, about 0.083 s) plus the two keys, the table maps roughly to: twitch 0.25 s, dodge 0.33 s, crisp order 0.4 s, sees something inviting 0.6 s, thinking 0.9 s, stretching 1.0 s. Treat these as starting points. Practical bands for this game: a startle toward a phone buzz 0.25 to 0.35 s; a glance 0.5 to 0.6 s; a remembering or worried look 0.8 to 1.1 s; a heavy, old turn 1.2 to 1.6 s.

**Rig changes that unlock most of the beats (inference).**
1. Add a head pitch and turn independent of `bend` (`it.headTilt`, radians), drawn about the neck. Sadness and attention both live here; today the only option is tilting the whole trunk.
2. Add a `mood` bundle that scales existing sines instead of new poses: `tempo` (multiplies all t-based rates and walk step time), `breathRate`, `breathDepth`, `sway`, `bob`, `armSwing`, `stride`, `headTilt`, `bend`. Suggested presets: calm 1.0; sad tempo 0.7, bob 0.4, sway 1.5, armSwing 0.4, stride 0.7, headTilt +0.2 rad, bend +0.08; anxious tempo 1.15, breath 1.4x rate 0.7x depth, sway period halved, arms closer to body; joy tempo 1.25, bob 1.4, bend -0.04 (trunk extended).
3. Desynchronise people: today everyone breathes at exactly 1.7 rad/s. Give each person a frequency jitter of 0.9x to 1.1x (seeded), not only a phase, so two people side by side never pulse together (per the Idle Weaver note).
4. Asymmetric breath: replace the pure sine with inhale about 40 percent of the cycle and exhale about 60 percent (for example `ease(sin)` shaped or a two-segment curve), and let the shoulders, not the hips, carry it for anxious states.
5. Overlap: give the hand a 0.1 to 0.2 s lag behind the shoulder on gestures (Pollick: pleasantness in segment phase), and let hair follow the head with a damped spring.
6. Moving holds: when a gesture ends, keep a 1 to 3 percent drift instead of freezing (Lasseter principle of follow-through; values are craft inference).

**Beat by beat (all values are craft inference unless a source is named).**

- Kid learning to ride, Dad lets go.
  - Before: Dad bent over the bike (`push` pose, `bend` 0.25), short quick steps at 0.4 s per step matching the kid's speed; the kid's front wheel wobbles: yaw/x jitter `sin(t*7) * decay`, amplitude falling to zero over 2.5 s.
  - Anticipation of the release: Dad's hand stays on the seat while the trunk rises slightly (bend 0.25 to 0.15 over 0.3 s, ease-out). This tiny rise is the "about to let go".
  - Release: the hand stays in the air where the seat was for 1.0 to 1.5 s (moving hold) while the kid's x keeps going; then Dad decelerates from run to stop over 1.5 to 2 s with ease-out (cubic-bezier(0.2, 0.6, 0.35, 1)), arms come up to the head or chest over 0.6 s, trunk extends (Gross: joy is trunk extension). The growing gap between the two figures is the beat (Heider-Simmel).
  - Kid: once alone, wobble increases for 0.8 s, then settles; the kid does not look back (no head turn) until later, which makes letting go one-sided and bittersweet.

- Dog waiting at the gate (young or adult Biscuit).
  - Lying, head on paws. Every 6 to 12 s (randomised, never periodic), the head lifts: 0.35 s ease-out up, hold 1.2 to 2 s, lower 1.0 s ease-in-out. One ear can lift 0.1 s before the head (anticipation).
  - Tail: still and low when alone (low still tail is the unsure or waiting register; alone was left-biased in Quaranta). Do NOT wag while waiting; the wag is the payoff.
  - Arrival: head up 0.2 s, stand 0.5 s, wag at full adult rate (0.57 s cycle exists) with a rightward bias (dog's right) and the rear end swinging with the tail; in the `front` pose the bias is visible as the tail sweeping more to the viewer's left. The rightward bias toward the owner is sourced (Quaranta 2007); rendering it is a quiet easter egg rather than something viewers consciously read.

- Dog too old to stand.
  - Attempt: front legs push (shoulders rise h*0.08 over 0.6 s ease-in-out), hind end lifts a little and fails at 0.4 s, settle back over 1.2 to 1.5 s with ease-out. Two attempts at most; a third would turn sad into painful.
  - Tail: instead of a wag, 2 or 3 slow thumps against the ground, about 0.8 s each, low amplitude (`wag` 0.15), then still. The old wag speed in code (1.57 s cycle) fits.
  - Breathing: visible belly rise, 4 to 5 s cycle (slower than today's 4.5 s bob if the bob doubles as breath), deeper. The person kneeling beside: trunk bent, head down, one hand resting on the dog (contact held, breathing together if the two breath phases are synced: a cheap, strong cue of closeness; inference).

- The last walk.
  - Both slow: person at 0.8 to 1.0 s per step (Williams' tired/old band, 20 frames), dog's trot reduced to a walk; keep the leash slack and the distance between them constant, which reads as the person matching the dog.
  - Person's head pitched down toward the dog (headTilt +0.25 rad); arm swing near zero on the leash side.
  - Every 6 to 10 steps the pair stops for 2 to 3 s (dog sniffs: head down 0.6 s); the person waits instead of pulling. Stops are the beat; the walking between them can be short.

- Grandmother waving at her door (present).
  - Old wave: slower cycle 1.8 to 2.2 s instead of 1.26 s, smaller arc (0.18 instead of 0.28), hand from the wrist and forearm only. After the last wave, the hand stays up 1.5 to 2 s (moving hold) and lowers over 1.5 s ease-in-out: reluctance to part.
  - She stays in the doorway after the car has gone: still, slight lateral sway (sad register), the door light behind her.

- Grandmother as a fading memory in snow (the `ghost`).
  - Decay motion and opacity together: as alpha goes from 1 to 0 over 4 to 6 s (ease-in, so most of the loss is at the end), the wave slows (cycle 2 s to 3.5 s) and shrinks to stillness; the last element to fade is the raised hand. Snow keeps falling at constant speed through her, which marks that the world goes on while the memory stops.

- Mother waiting up at the kitchen window, 01:06, phone in hand.
  - Posture: arms close (contracted), phone held at chest height in both hands or one hand with the other arm across the waist; head tilted down to the phone.
  - Loop (randomised, not periodic): look at phone 2 to 4 s; lift head and turn to the window 0.7 to 0.9 s ("thinking" band); look out 4 to 8 s; back to the phone 0.6 s. Weight shift faster than the calm default (period 6 to 7 s instead of 11.4 s) and breath faster and shallower (period 2.8 to 3 s).
  - The text arrives: a 0.3 s freeze (all sines held), head snaps to the phone in 0.25 s, then one relief sigh: inhale 1.0 to 1.2 s ease-out with shoulders up about h*0.012, hold 0.2 to 0.3 s, exhale 1.8 to 2.2 s ease-in-out to below baseline; trunk relaxes (bend reduced), shoulders drop, then breathing resumes at a slower 4 to 4.5 s period. A hand to the chest is optional (sigh as resetter per Vlemincx; values are craft).

- Old parent on the porch waiting for a text.
  - Seated, phone in the lap, head lower than the mother's; minimal arm movement; slow breath (4 to 5 s). Looks at the phone every 15 to 30 s with slow head moves (1.2 to 1.6 s). The figure is nearly still on purpose; let the porch light, moths and fireflies carry the time passing.
  - If the text never arrives in this beat, end on a slow lowering of the head (1.5 s) rather than any bigger gesture (Atkinson: exaggeration does not help sadness).

- Partner asleep.
  - Lying; breath 5 to 6 s cycle, torso rise only, asymmetric (long exhale). No weight shift. One small shift (shoulder or arm) once in 40 to 60 s so the loop never reads as a loop. If the protagonist lies beside them, desynchronise the two breaths at first and let them drift into phase over 20 to 30 s: a tiny, private story of closeness (inference).

- Teen coming home at 2am.
  - Walk at 0.6 to 0.7 s per step with short strides, shoulders slightly raised and arms close (tension, not sadness), head turning back once (0.5 s). At the door: anticipation (hand reaches, pauses 0.5 s), slow open.
  - Seeing the light still on in the kitchen: stop, 1.0 s hold, head lifts toward the window over 0.8 s. The guilt or love reads from the stop, not a gesture.

- "Two hands" love gestures (hand on shoulder, foreheads touching, holding).
  - Approach slower than a functional reach: 0.8 to 1.2 s with ease-out, the hand trailing the shoulder by 0.15 s; contact held 2 s or more as a moving hold with both figures' breaths visible; release slower than the approach (1.2 to 1.5 s), the hand leaving last. Hertenstein shows love and sympathy are decodable from touch itself; that viewers read these timings is craft inference.

### Gaps
- GDC Vault talk content (Journey, Florence, Inside) is behind login; only coverage and abstracts were read, so no quoted animation specifics from those talks.
- Lasseter's full paper could not be fetched (certificate and login errors); the timing table comes from the SIGGRAPH HyperGraph page, which gives inbetween counts but not the frame rate, so the conversion to seconds is an assumption.
- Alto, Sky, Monument Valley and Limbo were not researched (budget); no sourced claims about them here.
- Dog wag frequency in Hz, dog resting breath rate, and geriatric dog movement were not found in a primary source; the numbers above are craft guesses.
- Richard Williams' book was not read directly; walk numbers come from teaching handouts and forums that disagree on units.

## 3. Ambient micro-animation, density, phones, and reduced motion

### Takeaway
A still painting feels alive when many small things move continuously and out of sync, slower in the distance, while new motion onsets are reserved for what the eye should go to, because the onset of motion captures attention while continuous motion does not. On phones, split static from moving layers and cap pixel ratio for backgrounds; under reduced motion, stop camera and parallax movement but keep the content.

### Cited Findings
- Abrams and Christ (2003, Psychological Science 14, 427-432): a target that began moving was found faster than targets that moved continuously, were static, or stopped; motion onset captures attention bottom-up ([Springer follow-up PDF](https://link.springer.com/content/pdf/10.3758/BF03193623.pdf); [Isoluminant replication](https://neuropsychologylab.psych.utoronto.ca/files/Isoluminant%20motion%20onset%20captures%20attention.pdf)). Critics argue part of the effect came from jerky animated motion ([Springer APP 72.5](https://link.springer.com/article/10.3758/APP.72.5.1311)).
- Firewatch (Jane Ng, GDC "The Art of Firewatch"): 23 hand-built tree models, 14 "stars", about 4,600 trees placed; designer Olly Moss asked for trees to be more stylised the further away they were; the look described as layers of burnished colour, stark vivid shapes and long shadows ([PCGamesN](https://www.pcgamesn.com/firewatch/there-was-a-lot-of-copy-pasting-jane-ng-talks-creating-firewatchs-wyoming-wilderness); [Boing Boing](https://boingboing.net/2015/03/27/how-a-small-art-team-created-f.html); [Thumbsticks](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch)).
- Idle variation and anti-unison, and the "constant breeze loop looks canned" caution, are cited in section 2 ([Unreal forums](https://forums.unrealengine.com/t/araz-creates-idle-weaver-procedural-npc-motion-and-behaviour-system/2839748); [EverEnding devblog](https://www.patreon.com/ProblemMachine/posts/everending-2020-43484541)).
- MDN "Optimizing canvas": pre-render repeated drawing to an offscreen canvas; avoid fractional drawImage coordinates (anti-aliasing cost); layer multiple canvases so rarely-changing items are not redrawn each frame ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas); [web.dev canvas performance](https://web.dev/articles/canvas-performance/)).
- A production web player renders at 75 percent of devicePixelRatio when the ratio is above 1 to trade a little sharpness for speed on mobile ([LottieFiles render config](https://developers.lottiefiles.com/docs/dotlottie-player/dotlottie-web/api/render-config)).
- WCAG 2.3.3 Animation from Interactions (AAA): non-essential motion triggered by interaction should be possible to disable; parallax is defined as backgrounds moving at a different rate from foregrounds; vestibular effects include distraction, dizziness, headaches and nausea; methods include honouring the OS reduce-motion setting ([W3C Understanding 2.3.3](https://w3c.github.io/wcag/understanding/animation-from-interactions.html); [W3C technique C39](https://w3.org/WAI/WCAG22/Techniques/css/C39)). Motion that starts by itself falls under 2.2.2 Pause, Stop, Hide (Level A) instead; reducing motion must not block access to content ([Deque](https://dequeuniversity.com/resources/wcag2.1/2.3.3-animations-from-interactions)).

### Inferences
- Three speed tiers (craft inference): far layer (sky, distant trees, clouds) periods 20 to 60 s and 1 to 2 px of travel; mid layer (trees, smoke, laundry, curtains) 5 to 12 s; near layer (grass, leaves, hair, breath) 2 to 5 s. Matches Firewatch's "simpler with distance" logic applied to motion.
- Never a single pure sine for wind: sum two or three sines with incommensurate periods (for example 7.3 s, 11.9 s, 3.1 s at falling weights) so the loop never visibly repeats; add a gust every 15 to 40 s that travels across the scene from one side (leaves first, then the person's hair 0.3 s later), which ties people to the world.
- One focal motion at a time (from Abrams and Christ): ambient effects should already be running when a scene fades in (fx already supports `t0` for resuming) or fade in their amplitude over 1 to 2 s; reserve onsets (a bird taking off, a phone lighting up, a porch light clicking on) for story points. A phone screen lighting in a dark kitchen is a deliberate onset: it should be the only new motion in that second.
- Density budget per scene (inference): at most one particle family in the foreground plus one in the background (for example snow plus chimney smoke, not snow, smoke, birds and motes together). Particle counts around 40 to 120 on a phone keep cost low and the frame calm.
- Glints on water and fireflies: random onsets, 0.4 to 0.8 s rise, 1 to 2 s fall, never more than 2 or 3 visible at once, so they twinkle rather than strobe.
- Performance: draw sky, far hills and static props once to an offscreen canvas per scene; redraw only people and particles each frame; render far layers at 0.75x DPR and people at full DPR (people.js already keeps full ratio for people layers); round particle positions for drawImage sprites; pause the loop when the page is hidden.
- Reduced motion (stage.js already skips the push): also stop parallax drift and the camera, keep scene cross-fades (opacity is not motion), keep people breathing at reduced amplitude (half) and keep the story-essential gestures (the wave, the dog lifting its head) because they are content; reduce particle speed and count rather than removing weather entirely, so a snow scene still reads as snow.

### Gaps
- No primary source found on how much ambient motion is "too much" in illustrated scenes; density numbers are craft inference.
- The Firewatch talk's specifics on wind and foliage motion were not available (Vault behind login).
- MDN's page sections on devicePixelRatio and requestAnimationFrame were not read in full.

## 4. Camera: push-ins, holding still, distance, cuts and dissolves

### Takeaway
Slow push-ins over many seconds build closeness and work only if the subject stays controlled while the camera moves; a hard cut means same time, a dissolve means time or place has changed, and a longer dissolve implies more time. Evidence here is practitioner convention, not research.

### Cited Findings
- A slow dolly-in spread over many seconds gives a subtle, building closeness; its pace should follow the emotional weight; drama uses it at moments of revelation or quiet intensity; the effect is undermined if the performer shifts weight or looks away mid-move ([Morphic glossary, push in](https://morphic.com/ai-glossary/dolly-in)). (Weak source: an AI video company glossary.)
- Dissolves are conventionally used to show a passage of time or place; "a dissolve = a change of time. A cut = same time" is called the traditional rule; a long dissolve signifies more passage of time than a short one; dissolves are softer because both shots are briefly visible and suit dreamy, memory-like or reflective sequences; overuse weakens immediacy ([DVinfo forum](https://dvinfo.net/forum/archive/index.php/t-500698.html); [Riverside glossary](https://riverside.com/video-editor/video-editing-glossary/dissolve); [How To Film School](https://howtofilmschool.com/dictionary/dissolve-editing/)).
- The current stage pushes with the CSS `ease` curve and cross-fades scenes with `ease-in-out` ([stage.js](D:/Claude%20Code/what-i-meant/site/stories/text-me/js/stage.js)).

### Inferences
- Push curve: CSS `ease` (0.25, 0.1, 0.25, 1) front-loads the move, so the start of a push is noticeable. For a push meant to be felt, not seen, use a symmetric slow curve such as cubic-bezier(0.45, 0, 0.55, 1) or nearly linear with soft ends, scale 1.00 to 1.04 to 1.08 over 12 to 20 s. Anything above about 1.1 on a phone starts cropping the figures.
- Push targets per beat: the mother at the window (push toward the window and phone, during the waiting loop, so arrival of the text lands at the closest point); the old dog and the kneeling person; the porch. Keep the figure's idle minimal during the push (Morphic: the move dies if the subject fidgets).
- Holding still on grief: on the hardest beats (the old dog not standing, the porch with no text), stop the push and the parallax drift for the whole beat and let only weather and breath move. The contrast between camera stillness and small life is the statement (inference; no source found).
- Pull-back for loneliness: a slow reverse (1.06 to 1.0 over 10 to 15 s) that reveals empty space around the waiting figure, used once in the story at most (inference).
- Intimacy by distance: close inserts of hands (the hand on the bike seat, the hand on the dog, the thumb over the phone) are the faceless equivalent of a close-up on eyes; they can be separate small canvases (closeups.js exists) held 2 to 4 s (inference).
- Cut grammar for this game: same night, next moment: hard cut or a 0.3 to 0.5 s fade; a jump of years: 1.5 to 3 s cross-dissolve; into a memory: 3 to 5 s dissolve plus desaturation; out of a memory back to the present: a faster 0.8 to 1.2 s fade, so returning feels like waking (inference built on the dissolve-duration convention).

### Gaps
- No research or authoritative craft source found on holding a static frame for grief, on push-in speed in seconds, or on Walter Murch's editing principles (not searched for budget).
- No source found on match cuts in What Remains of Edith Finch.

## 5. Making "years later" legible: transitions across a life

### Takeaway
Life-story works make time legible without title cards through bodies (growth, grey hair, posture), recurring objects that change state, palette shifts that track the emotional era, and cuts that jump across years while keeping one emotional line. A locked, repeated framing (the same window across decades) is the cleanest match-cut for a 2D scene.

### Cited Findings
- Up's "Married Life" montage marks time with recurring objects that change: Carl's tie goes from loose to tightly wound; coins in the "Adventure Fund" jar are repeatedly emptied by flat tires, a broken roof and medical bills; the blank "Stuff I'm Going to Do" pages stand for dreams postponed; hair greys; the palette moves from warm yellows and vibrant blues, to muted greys and browns in hardship, to stark clinical light in the hospital; juxtaposed cuts (a balloon pop into the wedding, a coin drop into a broken jar) skip years while keeping emotional continuity; Giacchino's score starts light and ends somber ([No Film School](https://nofilmschool.com/up-opening-scene-montage)). It uses elliptical editing to compress events ([UAL student analysis, weak source](https://zulianaeusoff.myblog.arts.ac.uk/?p=81)).
- Boyhood uses no title cards; years pass through haircuts, period songs and events, and the actors' visibly ageing bodies, with editor Sandra Adair cutting across appearance changes; some jumps are startling ([The Take](https://the-take.com/read/how-did-linklater-work-with-the-passing-of-time-in-boyhood); [Paste](https://pastemagazine.com/movies/boyhood/boyhood-2014-sundance-review); [Boulder Weekly](https://archives.boulderweekly.com/entertainment/screen/coming-of-age/)).
- Longer dissolves read as more time passed (section 4 sources) ([DVinfo forum](https://dvinfo.net/forum/archive/index.php/t-500698.html)).

### Inferences
- The game already has Boyhood's best tool built in: each person keeps one colour for life (LOOKS in people.js), so a grown kid or a grey grandmother is recognised by colour while height, hair, posture and the stick change. Ageing the body is the clock; no "20 years later" text is needed.
- Up-style recurring objects available in the listed beats: the bike (new, then the kid's own kid on it, or rusting by the fence), the gate (painted, then peeling), the kitchen window (same frame across decades), the phone (its glow and shape changing by era), Biscuit's muzzle greying (pets.js already does this). Each should appear in at least three eras at the same screen position.
- Same-window match cut: lock the camera, the window rectangle and the light source position between eras; change only the season, the palette (warm early, cooler later), the props on the sill and the figure's age; cross-dissolve 2 to 3 s so the two eras briefly overlap in the frame. The overlap itself shows the window outlasting the people.
- Palette as era: shift the scene `light`, `shade` and `vibrance` values per era (warmer and more saturated early, cooler and lower vibrance late), as Up does across its montage.
- Posture as era: the same person's `bend`, walk step time and wave speed should step down across eras (for example step 0.5 s, then 0.6 s, then 0.85 s with the stick), so the body itself counts the years.

### Gaps
- Conflict: No Film School says the montage "runs about ten minutes and comes before the main plot", which likely describes the whole prologue; the "Married Life" segment itself is commonly described as about four minutes. Not verified; check before quoting a length.
- What Remains of Edith Finch's transitions were not researched; no claims made.
- No published (non-student) analysis of Up's editing was retrieved; Pearlman and Bordwell are the scholarly sources to check.
