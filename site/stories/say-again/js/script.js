// script.js: the story, beat by beat. DRAFT: every line here was drafted so the story can
// be played from start to end; the author rewrites them (see the repo CLAUDE.md).
//
// Beats (player.js plays them):
//   { label, save }        a place to continue from; `save` stores it
//   { card, sub }          a night's name on a dark card
//   { scene, s, ambience, music, channel }   a new picture (art.js) and its sound
//   { clock } { state }    change values in the picture
//   { tween: [key, to, ms], nowait }        ease a picture value
//   { wait }               a pause, in ms
//   { rx, text, df, voice }                 a transmission comes in (df: the bearing it shows)
//   { phone, text }        a station on the telephone (stations talk by phone, not on 16)
//   { call: [...] }        pick what you say on the telephone (no button to hold)
//   { clicks: 'x x', df }  microphone clicks, no voice ('.' is a pause); df shows a bearing
//   { carrier, df }        the button held down with no voice, for the direction finder
//   { say: [...], prompt, to }              pick what to say, then hold the button to send it
//   { ask: {...} }         a round of yes or no questions answered in clicks
//   { tune, hint }         wait for the player to turn to a channel
//   { morse, count, unit } received Morse; the player reads the first `count` letters
//   { key }                the player sends Morse with the button
//   { chart: {...} }       lay bearing lines on the chart and mark the fix
//   { lamp: n }            blink the desk lamp n times by tapping it
//   { note: [id, title, body], ms }         a sticky note with something learned
//   { line, who }          words under the picture away from the radio
//   { pick: [...], until } choose what to say in the kitchen
//   { hold, hand }         the old radio's button in the kitchen
//   { paper }              a note left on the table at home
//   { hint } { set } { if } { tap } { end }
// Options in `say` and `pick` take: label (what the button shows), text (what is said),
// set (flags), then (beats after it), retry (after it, choose again without it), if.
// '{cs}' is the call sign the player gives the kid.

const n1 = [
  { label: 'n1', save: true },
  { card: 'Night one' },
  { scene: 'room', s: { mood: 'calm', clock: '02:51', lamp: 1, town: 1, kid: 0, deer: 1 }, ambience: 'room', music: 'n1', channel: 67 },
  { wait: 2200 },
  { rx: 'cape', text: 'Dune Radio, this is Cape Radio, on six seven. Radio check after your mast work today. Over.' },
  {
    to: 'cape',
    prompt: 'Cape is checking his radio reaches you. Pick an answer.',
    say: [
      { label: 'Loud and clear.', text: 'Cape Radio, this is Dune Radio. Loud and clear. How do you read me? Over.' },
      {
        label: 'Five by five.',
        text: 'Cape Radio, this is Dune Radio. Five by five. How do you read me? Over.',
        then: [{ rx: 'cape', text: 'Five by five? You watch too many films, Dune. Loud and clear does it. Over.' }],
      },
    ],
  },
  { rx: 'cape', text: 'Loud and clear here too. Two of us left awake on this coast. Cape Radio, out.' },
  { note: ['check', 'RADIO CHECK', 'Answer with how you hear them: loud and clear. Ships also say a number, "I read you five". Army radio says it with a single ROGER.'] },
  { note: ['overout', 'OVER and OUT', 'OVER: your turn. OUT: we are done. Never both together. Only one side talks at a time: RX lights while you listen, TX while you talk.'] },
  { wait: 2600 },
  { clock: '03:12' },
  { wait: 1600 },
  { clicks: 'x . x' },
  { tune: 16, hint: 'Clicks on 16, the channel the station always listens to. The 16 key takes you straight there.' },
  { note: ['key16', 'THE 16 KEY', 'Channel 16 is watched day and night. Marine radios have a key that jumps straight to it, wherever the knob is.'] },
  { clicks: 'x x', df: 84 },
  { note: ['df', 'DIRECTION FINDER', 'DF on the radio is the finder on the mast. While a radio transmits, even with no words, it shows which way the signal comes from, in degrees from north. One station gives one line.'] },
  { say: [{ label: 'Answer it', text: 'Station clicking on channel one-six, this is Dune Radio. Are you in danger? Over.' }] },
  { clicks: 'x' },
  { wait: 1400 },
  { say: [{ label: 'Maybe they cannot talk', text: 'If you cannot talk, click. Twice for yes, once for no. Do you need help? Over.' }] },
  { clicks: '. x' },
  { note: ['clicks', 'NO VOICE?', 'Pressing the button without a word still sends something: the hiss drops, then a short burst. A click means yes or no only if you agree on it first.'] },
  {
    ask: {
      until: 3,
      must: 'kid',
      prompt: 'Ask. He can only answer yes or no.',
      qs: [
        { id: 'boat', label: 'On a boat?', text: 'Are you on a boat? Over.', a: 'x' },
        { id: 'hurt', label: 'Anyone hurt?', text: 'Is anybody hurt? Over.', a: 'x' },
        { id: 'home', label: 'At home?', text: 'Are you at home? Over.', a: 'x x' },
        { id: 'kid', label: 'A kid?', text: 'Are you a kid? Over.', a: '. . x x' },
      ],
    },
  },
  { say: [{ label: 'Move him off 16', text: 'One-six is for boats in trouble. Go to channel seven-two. It is a ship channel, but nobody is on it at this hour. Click twice if you got that. Over.' }] },
  { clicks: 'x x' },
  { note: ['ch16', 'CHANNEL 16', 'For distress, urgency, safety and calling only. Once you have someone, you both move to a working channel.'] },
  { tune: 72, hint: 'Turn the knob to channel 72.' },
  { wait: 1800 },
  { clicks: 'x x' },
  {
    ask: {
      until: 3,
      qs: [
        { id: 'asleep', label: 'Should you be asleep?', text: 'Should you be asleep right now? Over.', a: 'x x' },
        { id: 'alone', label: 'Anyone with you?', text: 'Is anybody with you? Over.', a: 'x x' },
        { id: 'awake', need: 'alone', label: 'Are they awake?', text: 'Are they awake? Over.', a: 'x' },
        { id: 'dad', label: 'Is your dad home?', text: 'Is your dad home? Over.', a: '. x' },
        { id: 'talk', label: 'Can you talk?', text: 'Can you talk at all? Over.', a: '. . . x' },
        { id: 'scared', label: 'Scared of something?', text: 'Are you scared of something? Over.', a: 'x . . . x' },
      ],
    },
  },
  { morse: 'HI', count: 2, unit: 120 },
  { note: ['morse', 'MORSE', 'His old radio is an amateur set with a tone key, made for waking up repeaters. Held short it beeps a dot, held long a dash. HI is four dots, then two. HI HI is how radio people laugh.'] },
  {
    prompt: 'On the radio he needs a name.',
    say: [
      { label: 'Sparrow', text: 'Hi. On the radio you need a call sign. You are Sparrow. Over.', set: { cs: 'Sparrow' }, callsign: true },
      { label: 'Little Bear', text: 'Hi. On the radio you need a call sign. You are Little Bear. Over.', set: { cs: 'Little Bear' }, callsign: true },
      { label: 'Captain', text: 'Hi. On the radio you need a call sign. You are Captain. Over.', set: { cs: 'Captain' }, callsign: true },
    ],
  },
  { clicks: 'x x' },
  {
    say: [
      { label: 'Good night. Over.', text: '{cs}, this is Dune Radio. It is late. Go to sleep. Over.', set: { n1end: 'over' } },
      { label: 'Good night. Out.', text: '{cs}, this is Dune Radio. It is late. Go to sleep. Dune Radio, out.', set: { n1end: 'out' } },
    ],
  },
  { if: { n1end: 'over' }, clicks: 'x x' },
  { if: { n1end: 'out' }, clicks: 'x' },
  { wait: 2400 },
  { clock: '06:58' },
  { wait: 1800 },
  { scene: 'drive', s: { night: 1, p: 0 }, ambience: 'drive', music: 'home' },
  { tween: ['p', 1, 10000] },
  { scene: 'home', s: { night: 1 }, ambience: 'home' },
  { wait: 1600 },
  { paper: 'Soup on the stove.\nHe asked again when you come off nights.\nAnd he says "over" at the table now. Your fault.\n\nMom' },
];

const n2 = [
  { label: 'n2', save: true },
  { card: 'Night two' },
  { scene: 'room', s: { mood: 'fog', clock: '02:10', lamp: 1, town: 1, kid: 0, deer: 0, tow: 0 }, ambience: 'fog', music: 'n2', channel: 16 },
  { wait: 2200 },
  // Taught before the choice, so the pick is a judgement, not a guess.
  { note: ['calls', 'MAYDAY, PAN-PAN, SÉCURITÉ', "Each said three times. Mayday (from the French m'aider, help me): grave danger. Pan-pan: urgent, short of that. Sécurité: a warning, announced on 16 and read on a working channel."] },
  {
    to: 'all',
    prompt: 'Thick fog in the bay. Nobody is in trouble: it is a warning. Announce it on 16, then read it on 67.',
    say: [
      { label: 'Sécurité', text: 'Sécurité, sécurité, sécurité. All stations, this is Dune Radio. Fog warning. Listen on channel six seven. Out.' },
      {
        label: 'Mayday',
        text: 'Mayday, mayday, mayday. All stations, this is Dune Radio. Fog warning. Out.',
        retry: true,
        then: [{ rx: 'cape', text: 'Dune, Cape. Mayday is for life in danger. Fog is a sécurité. Over.' }],
      },
      {
        label: 'Pan-pan',
        text: 'Pan-pan, pan-pan, pan-pan. All stations, this is Dune Radio. Fog warning. Out.',
        retry: true,
        then: [{ rx: 'cape', text: 'Dune, Cape. Pan-pan is urgent trouble. Fog is a sécurité. Over.' }],
      },
    ],
  },
  { tune: 67, hint: 'Now read the warning on 67.' },
  { to: 'all', say: [{ label: 'Read the warning', text: 'Sécurité. This is Dune Radio. Fog warning, issued zero zero one zero UTC. Dense fog in the bay, visibility under two hundred metres. Out.' }] },
  { note: ['utc', 'UTC', 'Radio and logs keep one clock for everyone: UTC. In winter it is two hours behind the clock on this wall.'] },
  { tune: 16, hint: 'Back to 16.' },
  { wait: 2200 },
  { clock: '02:47' },
  { alert: true },
  { wait: 900 },
  { rx: 'skipper', text: 'Pan-pan, pan-pan, pan-pan. All stations, this is fishing vessel Seagull, Seagull, Seagull. Position unknown. Last fix two miles north of Dune mast, an hour ago. Engine dead, batteries going, plotter dark. Three persons on board. Require tow. Over.' },
  { music: 'rescue' },
  { to: 'skipper', say: [{ label: 'Answer the pan-pan', text: 'Seagull, this is Dune Radio. Received pan-pan. Is anyone hurt? Are lifejackets on? Can you anchor? Over.' }] },
  { rx: 'skipper', text: 'Dune, Seagull. Nobody hurt. Lifejackets on. Anchor is down but dragging. Over.' },
  { to: 'skipper', say: [{ label: 'Take a bearing', text: 'Seagull, Dune Radio. Hold your transmit button for ten seconds, then say your name. Over.' }] },
  { carrier: 3200, from: 'skipper', df: 39 },
  { rx: 'skipper', text: 'Seagull.' },
  { phone: 'cape', text: 'Dune, it is Cape. I have him too: two four three degrees from Cape, time zero zero four nine UTC.' },
  { note: ['figures', 'FIGURES', 'Numbers go one digit at a time, three figures for a bearing: two four three. Ships and the army say the digits the same way: WUN, TOO, TREE, FOW-ER, FIFE, SIX, SEV-EN, AIT, NIN-ER, ZE-RO.'] },
  { chart: { lines: [{ from: 'dune', brg: 39 }, { from: 'cape', brg: 243 }], mark: true, intro: 'Two lines from two masts. ' } },
  { note: ['fix', 'A FIX', 'One bearing is a line. Two lines from two stations cross where the boat is.'] },
  { to: 'rescue', say: [{ label: 'Send the rescue boat', text: 'Rescue One, this is Dune Radio. Seagull is bearing zero three nine degrees from Dune mast, three point seven miles. Three persons on board, anchor dragging. Over.' }] },
  { rx: 'rescue', text: 'Dune, Rescue One. Wilco. Under way, radar on. Out.' },
  { note: ['wilco', 'WILCO', 'I will do it. It already means roger, so "roger wilco" says the same thing twice.'] },
  { wait: 2400 },
  { clock: '03:05' },
  { rx: 'skipper', text: 'Dune, Seagull. I cannot see my own bow. My boy will be up. He always waits up. Over.' },
  {
    to: 'skipper',
    say: [
      { label: 'Sound your horn', text: 'Seagull, Dune Radio. Rescue One is close. Sound your horn so they hear you. Over.' },
      { label: 'Your boy will see you', text: 'Seagull, Dune Radio. Rescue One is close. Your boy sees you by breakfast. Over.' },
    ],
  },
  { rx: 'skipper', text: 'Roger, Dune.' },
  { note: ['roger', 'ROGER', 'I got your message. Not yes, not I will do it: only that it arrived.'] },
  { wait: 3200 },
  { clock: '03:31' },
  { rx: 'rescue', text: 'Dune, Rescue One. Seagull in tow. Three persons on board, all well. ETA zero one four five UTC. Over.' },
  { to: 'rescue', say: [{ label: 'Report when in', text: 'Rescue One, Dune Radio. Roger. Report when alongside. Out.' }] },
  { tween: ['tow', 1, 60000], nowait: true },
  { music: 'n2' },
  { wait: 2600 },
  { clock: '03:44' },
  { tune: 72, hint: 'Something on channel 72.' },
  { clicks: 'x x' },
  { say: [{ label: 'Answer him', text: '{cs}, this is Dune Radio. You are up again. Over.' }] },
  { clicks: 'x x' },
  {
    ask: {
      until: 2,
      qs: [
        { id: 'listened', label: 'Were you listening?', text: 'Were you listening to the boat? Over.', a: 'x x' },
        { id: 'boatdad', label: 'Is your dad on a boat?', text: 'Is your dad out on a boat tonight? Over.', a: 'x . . x' },
        { id: 'worry', label: 'Worried about someone?', text: 'Are you worried about somebody? Over.', a: 'x x' },
      ],
    },
  },
  { morse: 'ALL OK?', count: 1, unit: 110 },
  { say: [{ label: 'All safe', text: 'All three are safe. They are towing them in. Over.' }] },
  { wait: 1400 },
  { morse: 'CAN U FIND ME', count: 0, unit: 95 },
  {
    say: [
      { label: 'Only if you need help', text: 'Only if you need help, {cs}. Do you need help? Over.' },
      { label: 'Why?', text: 'Why do you want me to find you? Over.' },
    ],
  },
  { clicks: '. . . x' },
  { say: [{ label: 'Then sleep', text: 'Then sleep, {cs}. Dune Radio, out.' }] },
  { clicks: 'x' },
  { wait: 2400 },
  { clock: '06:55' },
  { wait: 1600 },
  { scene: 'drive', s: { night: 2, p: 0 }, ambience: 'drive', music: 'home' },
  { tween: ['p', 1, 10000] },
  { scene: 'home', s: { night: 2 }, ambience: 'home' },
  { wait: 1600 },
  { paper: "He found your father's box in the hall.\nI told him to ask you first.\nYou are never awake when he asks.\n\nMom" },
];

const n3 = [
  { label: 'n3', save: true },
  { card: 'Night three' },
  { scene: 'room', s: { mood: 'clear', clock: '01:58', lamp: 1, town: 1, kid: 0, deer: 2 }, ambience: 'clear', music: 'n3', channel: 16 },
  { wait: 2200 },
  { rx: 'skipper', text: 'Dune Radio, this is Seagull, from the harbour. Just to say thank you. Over.' },
  { to: 'skipper', say: [{ label: 'Ask about his boy', text: 'Seagull, Dune Radio. Glad you are in. Keep it short on one-six. How is your boy? Over.' }] },
  { rx: 'skipper', text: 'Asleep on the couch at home. Made me promise no more night fishing. Seagull, out.' },
  { wait: 2800 },
  { clock: '02:40' },
  { tune: 72, hint: 'Nearly time. Channel 72.' },
  { wait: 1200 },
  { clicks: 'x x' },
  { say: [{ label: 'Answer him', text: '{cs}, Dune Radio. Right on time. Over.' }] },
  { clicks: 'x x' },
  {
    ask: {
      until: 3,
      qs: [
        { id: 'dadhome', label: 'Is your dad home now?', text: 'Is your dad home now? Over.', a: 'x' },
        { id: 'nights', label: 'Does he work nights?', text: 'Does your dad work nights? Over.', a: 'x x' },
        { id: 'sea', need: 'nights', label: 'At sea?', text: 'Is he at sea? Over.', a: '. . x' },
        { id: 'miss', label: 'Do you miss him?', text: 'Do you miss him? Over.', a: '. . . . x x' },
        { id: 'knows', label: 'Does he know about the radio?', text: 'Does he know you are on the radio? Over.', a: 'x' },
      ],
    },
  },
  { morse: 'WHO TAUGHT U', count: 1, unit: 100 },
  {
    say: [
      { label: 'My father', text: 'My father taught me. He did not say much at home. On the radio he did. Over.' },
      { label: 'A quiet man', text: 'My father. A quiet man. He gave me his old radio when I was your size. Over.' },
    ],
  },
  { clicks: '. . x x' },
  { wait: 1200 },
  { morse: 'RED LIGHT', count: 0, unit: 95 },
  { say: [{ label: 'That is my mast', text: 'That red light is my mast. Watch the window under it. Over.' }] },
  { lamp: 2 },
  { clicks: 'x x' },
  { wait: 900 },
  { say: [{ label: 'Get a bearing on him', text: '{cs}, go to channel one-six. Hold your button for ten seconds, then come back here. Over.' }] },
  { clicks: 'x x' },
  { tune: 16, hint: 'The finder listens on 16. Go there with him.' },
  { carrier: 3800, df: 84 },
  { note: ['carrier', 'DF ON 16', 'The finder listens on channel 16. A button held down with no words is enough for a bearing.'] },
  { tune: 72, hint: 'Back to 72.' },
  { clicks: 'x x' },
  { chart: { lines: [{ from: 'dune', brg: 84 }], intro: 'Only your mast heard him. ' } },
  { note: ['line', 'ONE LINE', 'One bearing tells you which way, not how far. He is somewhere along it.'] },
  { morse: 'STARS', count: 1, unit: 100 },
  {
    say: [
      { if: { cs: 'Little Bear' }, label: 'Find the Little Bear', text: 'Look for the Little Bear. That is you up there. The last star of its tail is the North Star. Over.' },
      { if: { cs: 'Sparrow' }, label: 'Find the Little Bear', text: 'Look for the Little Bear, {cs}. The last star of its tail is the North Star. Over.' },
      { if: { cs: 'Captain' }, label: 'Find the Little Bear', text: 'Look for the Little Bear, {cs}. The last star of its tail is the North Star. Every captain knows it. Over.' },
    ],
  },
  { note: ['polaris', 'NORTH STAR', "The end of the Little Bear's tail. Only about the 48th brightest star, but the sky turns around it, and its height above the horizon is about your latitude."] },
  { clicks: 'x x' },
  { morse: 'BAT LOW', count: 0, unit: 95 },
  { say: [{ label: 'Same time tomorrow', text: 'Then off you go. Same time tomorrow, {cs}? Over.' }] },
  { clicks: 'x x' },
  { wait: 2400 },
  { clock: '06:50' },
  { wait: 1600 },
  { scene: 'drive', s: { night: 3, p: 0 }, ambience: 'drive', music: 'home' },
  { tween: ['p', 1, 10000] },
  { scene: 'home', s: { night: 3 }, ambience: 'home' },
  { wait: 1600 },
  { paper: 'Storm tonight, they say. The lights might go.\nAll the batteries from the drawer are gone.\nCan you buy some on the way?\n\nMom' },
];

const n4 = [
  { label: 'n4', save: true },
  { card: 'Night four' },
  { scene: 'room', s: { mood: 'storm', clock: '01:20', lamp: 1, town: 1, kid: 0, deer: 2 }, ambience: 'storm', music: 'storm', channel: 16 },
  { wait: 2200 },
  {
    to: 'all',
    prompt: 'A gale warning came in. Nobody is in trouble yet. Announce it on 16, then read it on 67.',
    say: [
      { label: 'Sécurité', text: 'Sécurité, sécurité, sécurité. All stations, this is Dune Radio. Gale warning. Listen on channel six seven. Out.' },
      {
        label: 'Pan-pan',
        text: 'Pan-pan, pan-pan, pan-pan. All stations, this is Dune Radio. Gale warning. Out.',
        retry: true,
        then: [{ rx: 'cape', text: 'Dune, Cape. Still a sécurité. Nobody is in trouble yet. Over.' }],
      },
    ],
  },
  { tune: 67, hint: 'Now read it on 67.' },
  { to: 'all', say: [{ label: 'Read the warning', text: 'Sécurité. This is Dune Radio. Gale warning, issued two three zero zero UTC. Westerly gale force eight, increasing severe gale nine later. Out.' }] },
  { tune: 16, hint: 'Back to 16.' },
  { wait: 1600 },
  { tween: ['town', 0, 7000] },
  { phone: 'cape', text: 'Dune, it is Cape. Power is out over the whole town. I am on the generator.' },
  { call: [{ label: 'Same here', text: 'Same here. The generator is holding. Long night.' }] },
  { phone: 'cape', text: 'Long night. Call if you need me.' },
  { wait: 2400 },
  { clock: '02:40' },
  { tune: 72, hint: 'Nearly time. Channel 72.' },
  { wait: 3200 },
  { hint: 'Nothing on 72.' },
  { wait: 3600 },
  { clock: '03:02' },
  { hint: '' },
  { alert: true },
  { tune: 16, hint: 'Something on 16.' },
  { morse: 'SOS', count: 0, unit: 105 },
  { note: ['sos', 'SOS', 'Sent as one sign with no gaps: three short, three long, three short. The letters stand for nothing; it was picked because it is hard to mistake.'] },
  { say: [{ label: 'Is that you?', text: 'Station sending SOS, this is Dune Radio. {cs}, is that you? Over.' }] },
  { clicks: 'x x' },
  {
    ask: {
      until: 3,
      qs: [
        { id: 'hurt', label: 'Are you hurt?', text: 'Are you hurt? Over.', a: 'x' },
        { id: 'scared', label: 'Are you scared?', text: 'Are you scared? Over.', a: 'x x' },
        { id: 'dark', label: 'Lights out?', text: 'Are your lights out? Over.', a: 'x x' },
        { id: 'grown', label: 'A grown-up awake?', text: 'Is a grown-up awake there? Over.', a: 'x' },
      ],
    },
  },
  { hint: 'His signal is breaking up.' },
  {
    prompt: 'His signal is breaking up.',
    say: [
      {
        label: 'Check the antenna',
        text: 'You are breaking up. Is your antenna screwed on tight? Twist it. Over.',
        retry: true,
        then: [{ clicks: 'x x' }, { hint: 'Tighter, but still weak.' }],
      },
      { label: 'Go higher', text: '{cs}, go up. The highest window you can get to, the one that faces the bay. Over.' },
      {
        label: 'Press harder',
        text: 'Press the button harder, {cs}. Over.',
        retry: true,
        then: [{ clicks: 'x' }, { hint: 'Pressing harder does nothing.' }],
      },
    ],
  },
  { hint: '' },
  { wait: 3000 },
  { clicks: 'x x' },
  { phone: 'cape', text: 'Dune, it is Cape. Someone just came up on one-six. Weak, but now I hear him too.' },
  { note: ['height', 'WEAK SIGNAL?', 'Check the settings, then the radio and its antenna, then move: higher, by a window. Height beats power.'] },
  { morse: 'BAT', count: 1, unit: 110 },
  { say: [{ label: 'Warm the battery', text: 'Take the battery out. Hold it under your shirt, on your belly, and count to sixty. Then put it back. Over.' }] },
  { note: ['cold', 'COLD BATTERY', 'A cold battery gives less. Warmed against your body, it gives some back for a while.'] },
  { wait: 5000 },
  { clicks: 'x x' },
  { say: [{ label: 'Hold your button', text: '{cs}, hold your button down and count to ten. Over.' }] },
  { carrier: 3800, df: 84 },
  { call: [{ label: 'Call Cape and the pilots', text: 'Cape, pilots: your bearings on that carrier on one-six, please.' }] },
  { phone: 'cape', text: 'One six eight degrees from Cape.' },
  { phone: 'pilot', text: 'Zero four three degrees from the pilot station.' },
  { chart: { keep: [{ from: 'dune', brg: 84 }], lines: [{ from: 'cape', brg: 168 }, { from: 'pilot', brg: 43 }], mark: true, zoom: 'town', intro: "Last night's line is still on the chart. " } },
  { music: 'reveal' },
  { note: ['hat', 'COCKED HAT', 'Three bearings almost never meet in one point. The small triangle between them is the triangle of error, the cocked hat. The truth is usually inside.'], ms: 4200 },
  { morse: 'DAD', count: 3, unit: 150 },
  { wait: 1400 },
  {
    say: [
      { label: 'I am coming', text: 'I am coming home. Stay where you are. Over.' },
      { label: 'Stay on the radio', text: 'Stay on the radio, {cs}. I am on my way. Over.' },
    ],
  },
  { clicks: 'x x' },
  { call: [{ label: 'Tell Cape', text: 'Cape, that fix is not at sea. It is my house. I am leaving the desk.' }] },
  { phone: 'cape', text: 'Go. I have your masts. I am sending a car to the house too.' },
  { wait: 1800 },
  { scene: 'drive', s: { night: 4, p: 0 }, ambience: 'drive', music: 'reveal' },
  { tween: ['p', 1, 9000] },
  { scene: 'stairs', s: { p: 0 }, ambience: 'stairs' },
  { wait: 1400 },
  { music: 'ending' },
  { tween: ['p', 1, 5200] },
  { tap: true },
];

const kitchen = [
  { label: 'kitchen', save: true },
  { scene: 'kitchen', s: { hand: 0 }, ambience: 'home', music: 'ending' },
  { wait: 2600 },
  { line: 'He keeps his eyes on the radio.', tap: true },
  { hold: 'Say again. Over.', hint: 'Hold the old radio\'s button' },
  { wait: 1400 },
  { line: 'I knew it was you. The first night.', who: 'kid' },
  { line: 'You say "over" at dinner.', who: 'kid' },
  { if: { n1end: 'out' }, line: 'You said "out". I stayed on anyway.', who: 'kid' },
  { if: { n1end: 'over' }, line: 'You said "over". So I came back.', who: 'kid' },
  {
    until: 2,
    pick: [
      { label: 'Why only clicks?', text: 'Why only clicks? Why not talk?', then: [{ line: 'You would know it was me. Then you would say go to sleep.', who: 'kid' }] },
      { label: "Grandpa's radio", text: "You found Grandpa's radio.", then: [{ line: 'I broke the antenna. I fixed it with tape.', who: 'kid' }] },
      { label: 'You were scared', text: 'You were scared last night.', then: [{ line: 'Every night.', who: 'kid' }] },
      { if: { saw_fawn: true }, label: 'The deer by the mast', text: 'There is a deer on the dune by the mast at night. She has a little one now.', then: [{ line: 'Can I come and see them?', who: 'kid' }] },
      { if: { saw_deer: true, saw_fawn: undefined }, label: 'The deer by the mast', text: 'A deer comes up the dune by the mast at night. Every night.', then: [{ line: 'Can I come and see her?', who: 'kid' }] },
    ],
  },
  { line: "I can't sleep when you're not here.", who: 'kid' },
  { hold: '', hint: 'Hold to reach for his hand', hand: true },
  { wait: 1200 },
  {
    pick: [
      { label: 'Every night at nine', text: 'Every night at nine. Channel seven-two. Before my shift. You talk, I listen. Over.' },
      { label: 'Then we talk', text: 'Then we talk. Out loud. Every night before I go.' },
    ],
  },
  { line: 'Roger.', who: 'kid' },
];

const epilogue = [
  { label: 'epilogue', save: true },
  { scene: 'room', s: { mood: 'evening', clock: '20:59', lamp: 1, town: 1, kid: 0.6, deer: 2 }, ambience: 'evening', music: 'n3', channel: 72 },
  { wait: 2600 },
  { clock: '21:00' },
  { wait: 900 },
  { rx: 'kid', voice: 'kid', text: 'Dune Radio, Dune Radio, this is {cs}. Radio check. Over.' },
  { say: [{ label: 'Answer him', text: '{cs}, this is Dune Radio. Loud and clear. Over.' }] },
  { morse: '88', count: 2, unit: 120 },
  { note: ['88', '73 and 88', 'Radio amateurs sign off with numbers: 73 is best regards, 88 is love and kisses.'] },
  { key: '88', keyHint: 'Send it back: tap for a dot, hold for a dash.' },
  { music: 'ending' },
  { wait: 2600 },
  { end: true },
];

export const SCRIPT = [...n1, ...n2, ...n3, ...n4, ...kitchen, ...epilogue];
