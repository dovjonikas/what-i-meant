// script.js: the story, beat by beat. js/player.js plays it from top to bottom.
//
// DRAFT: every line a player reads in this file is the agent's draft, written on the
// author's request so the story can be played from start to end. The author rewrites
// them; until then none of it counts as the author's text.
//
// Beat types (one key decides the type):
//   { chapter: 'Morning' }            a full-screen chapter card, tap to go on
//   { title: true }                   the story's title card
//   { scene: 'id', music, push }      change the picture (scenes.js); `music` changes the
//                                     score (score.js); `push` slowly moves the camera in
//   { say: 'line', by }               one line, tap to go on; `by` makes it spoken
//   { phone: {...} }                  a chat on the phone (phone.js has the step types)
//   { lines: {...} }                  the life lines: years run up to `to` (lines.js)
//   { choose: 'flag', options }       a choice; the picked value is kept under that flag
//   { hold: {...} }                   hold to do something (pedal, walk) until it is done
//   { now: {...} }                    back to the porch in the present: the lock screen
//                                     with the time and the sent text (ui.js)
//   { wait: ms }                      a pause with nothing to tap
//   { save: true }                    a point the story resumes from
//   { end: true }                     the end card
// Any beat, and any event in the life lines, can carry `if: { flag: value }`; it plays only
// when the flag has that value (or, for a list such as `picks`, contains it). The choices
// come back later this way: what you told Mom at sixteen, who you kept close, the weekend,
// whether you wrote to your best friend, and your last reply.

// Everyone who appears in the life lines. x is where they stand, 0 to 1 across the column.
export const CAST = {
  grandma: { label: 'grandma', x: 0.1, since: -60 },
  mom: { label: 'mom', x: 0.32, since: -28 },
  me: { label: 'me', x: 0.5, me: true },
  dad: { label: 'dad', x: 0.68, since: -30 },
  grandpa: { label: 'grandpa', x: 0.9, since: -62 },
};

// The text sent at the very start, and the kid's phone in the frame scenes.
const SENT = 'Text me when you get home.';

// Back to now, between the parts of the life: the porch, and the phone's lock screen with
// the time and the text you sent, still only Delivered.
const frame = (time, line) => [{ now: { time, sent: SENT, status: 'Delivered', say: line } }];

export const SCRIPT = [
  // The frame: the end of the story, shown first.
  { scene: 'porch', music: 'frame', instant: true },
  { wait: 1600 },
  { say: 'Drive safe.', by: 'you' },
  { say: 'The red lights go down the hill and around the bend.' },
  { say: 'You stay in the doorway a bit longer than you need to.' },
  { phone: { with: '', time: 'Sun 21:12', steps: [{ draft: SENT }, { status: 'Delivered' }, { wait: 1400 }] } },
  { say: 'Forty minutes to their place.' },
  { say: 'You know, because you timed it once.' },
  { say: 'Forty minutes is a long time.' },
  { title: true },

  // Morning: 0 to 9. Memories are told in the present, as if happening now.
  { chapter: 'Morning', save: true },
  { lines: { scene: 'linesDawn', music: 'morning', to: 3, events: [
    { at: 0, join: 'me', from: 'fade', say: "You won't remember any of this." },
    { at: 0.3, say: 'They will.' },
  ] } },
  { scene: 'dawnHouse', push: 1.05, save: true },
  { say: 'The kitchen smells of pancakes and wet boots.' },
  { say: 'Your first word is no.' },
  { say: 'Dad says you get that from Mom.' },
  { say: "Mom doesn't say anything. Which is also a no." },
  { lines: { scene: 'linesMorning', to: 5.2, events: [
    { at: 5, join: 'dog', label: 'dog', x: 0.58, from: 'fade' },
  ] } },
  { scene: 'puppy', push: 1.04, save: true },
  { say: 'Dad comes home with a box that is moving.' },
  { say: 'Mom says absolutely not.' },
  { say: 'He smells of milk and grass and he sleeps on your bed that night, and every night after.' },
  { say: 'He steals one shoe from every pair in the house.' },
  { lines: { scene: 'linesMorning', to: 6, events: [] } },
  { scene: 'garden', push: 1.04, save: true },
  { say: "Grandma's house smells of dill and floor polish." },
  { scene: 'jarHands', ms: 900 },
  { say: 'Every time you leave, she gives you a jar of jam.' },
  { say: 'And every time she says the same thing.' },
  { say: 'Come visit more.', by: 'grandma' },
  { say: "You're six. You say okay." },
  { lines: { scene: 'linesMorning', to: 7.4, events: [
    { at: 7, join: 'friend', label: 'best friend', x: 0.68, from: 'right', say: 'First day of school.' },
    { at: 7.1, move: 'dad', x: 0.8 },
    { at: 7.2, say: 'The other chair at your desk is broken, so somebody sits next to you.' },
    { at: 7.3, say: "By lunch you're best friends." },
  ] } },
  { scene: 'bike', music: 'morning', save: true },
  { say: 'The road smells of hot dust and cut grass.' },
  { say: "I've got you. I've got you.", by: 'dad' },
  { hold: { hint: 'hold to pedal', ms: 4500 } },
  { say: "He doesn't have you. He hasn't for a while." },
  { say: 'You ride straight into a bush.' },
  { say: "You're fine. The bush isn't." },
  ...frame('21:19', 'Seven minutes.'),

  // Noon: 9 to 17.
  { chapter: 'Noon', save: true },
  { lines: { scene: 'linesNoon', music: 'noon', to: 11, events: [] } },
  { scene: 'lake', push: 1.04, save: true },
  { say: 'Summers smell of sunscreen and lake water.' },
  { say: 'The two of you jump off that pier a thousand times.' },
  { say: 'Maybe forty. It feels like a thousand.' },
  { phone: { with: 'best friend', time: 'Sat 10:02', steps: [
    { them: 'u coming to the lake' },
    { them: 'u coming' },
    { them: '????' },
    { pick: ['YES'] },
  ] } },
  { phone: { with: 'dad', time: 'Sat 10:04', steps: [
    { them: 'Text me when you get there.' },
    { pick: ['ok'] },
  ] } },
  { say: "You don't text him when you get there." },
  { say: 'He never brings it up. He just asks again the next time.' },
  { scene: 'dogGate', push: 1.03 },
  { say: "Every day after school he's at the gate before you come round the corner." },
  { say: "Nobody tells him what time you'll be home. He just knows." },
  { lines: { scene: 'linesNoon', to: 14, events: [
    { at: 12, end: 'grandpa', say: 'Grandpa is the first one.' },
    { at: 12.2, say: "You don't really get it yet. You get it later, a bit at a time." },
  ] } },
  { lines: { scene: 'linesNoon', to: 15.5, events: [
    { at: 14.3, leave: 'friend', side: 'left', slow: true },
  ] } },
  { scene: 'dogOld', music: 'evening', push: 1.04 },
  { say: "One day he isn't at the gate." },
  { say: "You find him asleep by the door. He didn't hear you." },
  { say: "After that you're the one who checks on him." },
  { scene: 'bonfire', music: 'noon', push: 1.04, save: true },
  { say: 'A fire in the woods. Your hair will smell of smoke for two days.' },
  { phone: { with: 'mom', time: 'Fri 23:47', steps: [
    { them: 'Text me when you get home.\nMom' },
    { pick: ['ok', { text: 'leave it on read', silent: true }], set: 'teen' },
  ] } },
  { say: 'You write ok.', if: { teen: 'ok' } },
  { say: 'You leave it on read.', if: { teen: 'leave it on read' } },
  { say: 'Why does she sign them?' },
  { say: 'As if somebody else is asking you to text when you get home.' },
  { scene: 'kitchenNight', music: 'frame', push: 1.05 },
  { say: 'You get home at two.' },
  { say: 'The kitchen light is on.' },
  { say: "I couldn't sleep.", by: 'mom' },
  { say: 'She says that a lot. You believe her for years.' },
  // The dog's last evening, known while it happens: you walk him to the gate yourself.
  { lines: { scene: 'linesNoon', music: 'noon', to: 16.4, events: [] } },
  { scene: 'lastWalk', music: 'grief', save: true },
  { say: "The vet's coming in the morning.", by: 'dad' },
  { say: 'After dinner you take him out to the gate one more time.' },
  { hold: { hint: 'hold to walk with him', ms: 6500 } },
  { say: 'He sits down where he always sat.' },
  { say: 'You stay out there until it gets dark.' },
  { lines: { scene: 'linesNoon', music: 'noon', to: 16.6, events: [
    { at: 16.5, end: 'dog', say: 'We let him go this morning.', by: 'dad' },
    { at: 16.52, say: "He wasn't scared. I was holding him.", by: 'dad' },
  ] } },
  { scene: 'gateEmpty', music: 'grief' },
  { say: "The next day nobody's at the gate." },
  { say: 'You stand there a bit anyway.' },
  { lines: { scene: 'linesNoon', music: 'noon', to: 17.2, events: [
    { at: 17, say: "Somewhere in there the best friend isn't next to you anymore." },
    { at: 17.1, say: "There's no fight." },
  ] } },
  { phone: { with: 'best friend', time: '', history: [
    { stamp: 'Jun 3' }, { them: 'lake?' }, { me: 'yes' },
    { stamp: 'Oct 19' }, { them: 'u out tonight' }, { me: 'cant' },
    { stamp: 'Feb 8' }, { them: 'u alive lol' },
  ], steps: [{ wait: 1800 }] } },
  { say: 'They always write first.' },
  { say: 'You get used to it.' },
  { say: "Then one day they don't, and you don't either." },

  // Evening: 18 to 24.
  { chapter: 'Evening', save: true },
  { scene: 'busStop', music: 'evening', push: 1.04 },
  { say: 'Eighteen. One bag, one bus.' },
  { say: 'Dad puts the bag on the bus, takes it off, and puts it on again.' },
  { say: 'Text me when you get there.', by: 'mom' },
  { lines: { scene: 'linesDusk', to: 19, events: [
    { at: 18, move: 'mom', x: 0.2 },
    { at: 18, move: 'dad', x: 0.82 },
    { at: 18.4, say: "From here on, you're the one who visits." },
  ] } },
  { scene: 'cityNight', music: 'lonely', save: true },
  { say: 'The city smells of rain and bus brakes. Nobody in it knows your name.' },
  { say: 'At first that is the best part.' },
  { hold: { hint: 'hold to walk home', ms: 4200 } },
  { phone: { with: null, time: 'Thu 01:06', steps: [{ type: 'home', unsendable: true, byHand: true }, { wait: 1200 }, { erase: true }] } },
  { say: 'You get home and stand in the dark for a bit.' },
  { say: 'Nobody needs to know you got home.' },
  { say: 'Nobody is lying awake about it.' },
  ...frame('21:31', 'Nineteen minutes. Nothing yet.'),
  { scene: 'room', music: 'goose', save: true },
  { say: 'You meet goose on a forum about a game neither of you is any good at.' },
  { phone: { with: 'goose', time: 'Tue 02:41', steps: [
    { photo: 'moon', from: 'them' },
    { them: 'moon check' },
    { pick: ['moon check'] },
    { photo: 'moon', from: 'me' },
    { them: 'u type like ur sad' },
    { pick: ['im fine', 'kind of'], set: 'goose' },
    { them: 'ok', if: { goose: 'im fine' } },
    { them: 'if that changes im here. its 3am here too', if: { goose: 'im fine' } },
    { them: 'ok. tell me', if: { goose: 'kind of' } },
    { pick: ['i dont know what im doing'] },
    { them: 'nobody does' },
    { them: 'some people just say it louder' },
  ] } },
  { say: 'goose never sees your face.' },
  { say: "Maybe that's why it's easy to tell them things." },
  { say: 'And goose never makes any of it weird.' },
  { lines: { scene: 'linesNight', to: 24, events: [
    { at: 19.2, join: 'goose', label: 'goose', x: 0.9, from: 'fade', dashed: true },
    { at: 23.4, leave: 'goose', side: 'fade' },
    { at: 23.6, say: 'goose logs on less and less, and then not at all.' },
    { at: 23.65, say: "You told goose things you'd never said out loud. You still know the username by heart.", if: { goose: 'kind of' } },
    { at: 23.65, say: 'You never told goose much. Some nights you open the old chat anyway.', if: { goose: 'im fine' } },
    { at: 23.7, say: 'Some people are there for one chapter. It still counts.' },
  ] } },

  // Dawn: 24 to 35.
  { chapter: 'Dawn', save: true },
  { scene: 'hillDawn', music: 'dawn', push: 1.05 },
  { say: 'One Sunday you get up early for no reason and walk up the hill behind the flats.' },
  { say: "Two years living there and you've never been up." },
  { say: 'You sit until the sun comes up. Nothing happens.' },
  { say: 'You go back the next Sunday, and the one after.' },
  { lines: { scene: 'linesSunrise', to: 26, events: [
    { at: 25, say: 'You start to sound like the people you spend your time with.' },
    { at: 25.1, say: 'So you get to choose a bit.' },
    { at: 25.2, pick: { max: 3, hint: 'tap who you want close', options: [
      { id: 'asks', label: 'asks how you are' },
      { id: 'late', label: 'always late, always comes' },
      { id: 'user', label: 'only calls when they need something' },
      { id: 'funny', label: 'makes you laugh' },
      { id: 'small', label: 'makes you feel small' },
      { id: 'truth', label: 'tells you the truth' },
    ] } },
  ] } },
  { say: "Same weekend: Grandma asks if you're coming, and the lake trip you've all planned since spring.", save: true },
  { say: "Either way you'll miss something. You get to pick what." },
  { choose: 'weekend', options: [{ text: "Go to Grandma's", value: 'grandma' }, { text: 'Go to the lake', value: 'lake' }] },
  { scene: 'grandmaEvening', music: 'afternoon', push: 1.04, if: { weekend: 'grandma' } },
  { say: 'She makes too much food. She always makes too much food.', if: { weekend: 'grandma' } },
  { say: 'You leave with two jars this time.', if: { weekend: 'grandma' } },
  { say: 'Your friends post the lake all weekend. You look at every photo.', if: { weekend: 'grandma' } },
  { scene: 'lakeFriends', music: 'noon', push: 1.04, if: { weekend: 'lake' } },
  { say: 'You stay up until the fire goes out.', if: { weekend: 'lake' } },
  { say: "Grandma says on the phone it's fine. She says come next time.", if: { weekend: 'lake' } },
  { lines: { scene: 'linesSunrise', music: 'dawn', to: 28.6, events: [
    { at: 28, join: 'partner', label: 'partner', x: 0.38, from: 'left', say: 'Then somebody sits down next to you and stays.' },
    { at: 28.1, move: 'mom', x: 0.12 },
    { at: 28.3, say: 'No broken chair this time.' },
  ] } },
  { scene: 'bench', push: 1.04 },
  { say: "You're bad at saying how you feel." },
  { say: "They're patient about it." },
  { lines: { scene: 'linesSunrise', to: 30, events: [
    { at: 29.5, end: 'grandma', say: 'Grandma dies in January.' },
  ] } },
  { scene: 'snow', music: 'grief', save: true },
  { say: "You'd meant to go at Easter.", if: { weekend: 'lake' } },
  { say: 'You still think about the lake sometimes.', if: { weekend: 'grandma' } },
  { say: "There's one jar of her jam left in your fridge." },
  { say: "You don't open it for a long time." },
  { lines: { scene: 'linesSunrise', music: 'dawn', to: 31.6, events: [
    { at: 31, join: 'kid', label: 'kid', x: 0.44, from: 'birth' },
  ] } },
  { scene: 'babyHand', music: 'morning', ms: 1400 },
  { say: "Your kid won't remember any of this." },
  { say: 'You will.' },
  { phone: { with: 'dad', time: 'Wed 04:12', steps: [
    { photo: 'baby', from: 'me' },
    { wait: 1500 },
    { them: 'ok.' },
    { wait: 2200, typing: true },
    { them: 'proud of you.' },
  ] } },
  ...frame('21:44', 'Thirty-two minutes.'),

  // Afternoon: 34 to 66.
  { chapter: 'Afternoon', save: true },
  { scene: 'carMoon', music: 'afternoon', push: 1.04 },
  { say: 'Is the moon following us?', by: 'kid' },
  { say: 'You say yes.' },
  { say: 'Your kid waves at it the whole way home.' },
  { lines: { scene: 'linesAfternoon', to: 44, events: [
    { at: 38, move: 'kid', x: 0.46 },
    { at: 41, move: 'mom', x: 0.2 },
    { at: 41, move: 'dad', x: 0.78 },
  ] } },
  { say: 'You find the old chat while looking for something else.', save: true },
  { phone: { with: 'best friend', time: '', history: [{ stamp: 'Feb 8' }, { them: 'u alive lol' }], steps: [
    { stamp: 'Today 22:10' },
    { type: 'hey', byHand: true, ask: ['Send', 'Delete'], set: 'reconnect' },
    { status: 'Read', if: { reconnect: 'Send' } },
    { wait: 1400, typing: true, if: { reconnect: 'Send' } },
    { wait: 1600, if: { reconnect: 'Send' } },
    { wait: 1200, typing: true, if: { reconnect: 'Send' } },
    { them: 'HEY', if: { reconnect: 'Send' } },
    { them: 'man. i was going to write you like a hundred times', if: { reconnect: 'Send' } },
    { them: 'lake this summer?', if: { reconnect: 'Send' } },
  ] } },
  { say: "You'll write tomorrow.", if: { reconnect: 'Delete' } },
  { if: { reconnect: 'Send' }, lines: { scene: 'linesAfternoon', to: 45, events: [
    { at: 44.2, back: 'friend', x: 0.6, say: 'The door was open the whole time.' },
  ] } },
  { scene: 'pierAutumn', push: 1.04, if: { reconnect: 'Send' } },
  { say: 'Same pier. Neither of you jumps.', if: { reconnect: 'Send' } },
  { say: 'You both think about it.', if: { reconnect: 'Send' } },
  { phone: { with: 'mom', time: 'Mon 09:12', save: true, steps: [
    { them: 'how do i make the letters bigger\nMom' },
    { photo: 'thumb', from: 'them' },
    { photo: 'thumb', from: 'them' },
    { photo: 'thumb', from: 'them' },
    { pick: ["Mom that's your thumb"] },
    { them: 'I know\nMom' },
  ] } },
  { scene: 'dadGarden', music: 'afternoon', push: 1.04 },
  { say: 'Dad calls to ask how to turn off the capital letters.' },
  { say: 'HE IS VERY UPSET ABOUT IT.' },
  { say: 'You show him. He holds the phone like you used to hold the handlebars.' },
  { say: "You let go. He doesn't notice." },
  { say: "I've got it. I've got it.", by: 'dad' },
  { scene: 'momTaxi', push: 1.04 },
  { say: 'Mom comes for the weekend. She brings jam.' },
  { say: 'Text me when you get home.', by: 'you' },
  { phone: { with: 'mom', time: 'Sun 19:40', steps: [{ wait: 1600 }, { them: 'Home.\nMom' }] } },
  { say: "She texts before you've even shut the door." },
  { lines: { scene: 'linesAfternoon', to: 66, save: true, events: [
    { at: 52, move: 'kid', x: 0.6 },
    // Dad's chat: years of your "home" and his "ok.", "proud of you." among them, and a
    // last "home" that nobody answers.
    { at: 58, end: 'dad', music: 'silence', phone: { with: 'dad', time: '', history: [
      { stamp: 'Fri 22:40' }, { me: 'home' }, { them: 'ok.' },
      { stamp: 'Sun 19:15' }, { me: 'home' }, { them: 'ok.' },
      { stamp: 'Wed 04:12' }, { photo: 'baby', from: 'me' }, { them: 'ok.' }, { them: 'proud of you.' },
      { stamp: 'Tue 21:03' }, { me: 'home' }, { them: 'ok.' },
      { stamp: 'Mon 18:02' }, { me: 'home' },
    ], steps: [{ status: 'Delivered' }, { wait: 3600 }] } },
    { at: 58.3, music: 'afternoon' },
    { at: 61, cross: ['a nurse', 'the bus driver', 'someone on the worst day of their life', 'a kid who sat alone'] },
    { at: 61.4, say: 'Most lines cross yours once and keep going.' },
    { at: 61.5, say: 'You never know what kind of day it is in theirs.' },
    // Mom's last text, shown and not told: about the weather, signed as always.
    { at: 66, end: 'mom', music: 'silence', phone: { with: 'mom', time: '', history: [
      { stamp: 'Thu 08:31' }, { them: 'Rain tomorrow. Take a jacket.\nMom' },
    ], steps: [{ wait: 3400 }] } },
  ] } },
  ...frame('21:52', 'Forty minutes.'),

  // Late: 66 to 78, and back to the frame.
  { chapter: 'Late', save: true },
  { lines: { scene: 'linesEnd', music: 'end', to: 78, events: [
    { at: 70, move: 'kid', x: 0.66 },
    { at: 71, say: 'The people you kept close get old with you.' },
    { at: 71.1, say: 'The one who makes you laugh still calls on Sundays.', if: { picks: 'funny' } },
    { at: 71.2, say: 'The one who asks how you are still asks, and still waits for the real answer.', if: { picks: 'asks' } },
    { at: 71.3, say: 'The one who tells you the truth tells you to call your kid more. You do.', if: { picks: 'truth' } },
    { at: 71.4, say: 'The one who is always late is late to your seventieth. They come.', if: { picks: 'late' } },
    { at: 71.5, say: 'The one who only calls when they need something stops calling when you stop picking up.', if: { picks: 'user' } },
    { at: 71.6, say: "You keep the one who makes you feel small for too long. Then one day you don't.", if: { picks: 'small' } },
    { at: 73, say: 'On Saturdays you and your best friend still go to the lake. Neither of you jumps.', if: { reconnect: 'Send' } },
    { at: 73, say: 'You still think about writing to your best friend.', if: { reconnect: 'Delete' } },
    { at: 77.6, say: 'Your kid comes for dinner on Sunday.' },
    { at: 77.7, say: 'They bring too much food.' },
    { at: 77.75, say: 'At the door you tell them to come visit more.' },
    { at: 77.8, say: 'You hear your grandma in it.', if: { weekend: 'lake' } },
    { at: 77.8, say: 'They say they will. They mostly do.', if: { weekend: 'grandma' } },
  ] } },
  { scene: 'porchLate', music: 'frame', push: 1.05, save: true },
  { say: "You put the kettle on. You don't want tea." },
  { say: 'You check the phone. You check it again.' },
  // The last wait: Delivered, then Read and the longest silence (where Mom's "Read" comes
  // back), then typing that stops once and starts again, then home. No tap hurries it.
  { phone: { with: '', time: 'Sun 21:12', history: [{ me: SENT }], final: true, steps: [
    { status: 'Delivered' },
    { wait: 2600 },
    { status: 'Read' },
    { note: 'Once you left your mom on read. She waited up anyway.', if: { teen: 'leave it on read' } },
    { note: 'Every Friday the same text from your mom. She waited up anyway.', if: { teen: 'ok' } },
    { wait: 2200, typing: true },
    { wait: 1500 },
    { wait: 1800, typing: true },
    { them: 'home.', music: 'home' },
    { them: 'love you' },
    { pick: ['ok', 'ok. love you too'], set: 'last', byHand: true },
    { them: 'you sound like grandpa', if: { last: 'ok' } },
    { them: 'love you. go to sleep', if: { last: 'ok. love you too' } },
  ] } },
  { say: 'You turn off the kitchen light.' },
  { scene: 'porchDark', ms: 2600 },
  { say: 'You sleep fine.' },
  { end: true },
];
