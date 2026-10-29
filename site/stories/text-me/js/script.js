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

  // Morning: 0 to 9.
  { chapter: 'Morning', save: true },
  { lines: { scene: 'linesDawn', music: 'morning', to: 3, events: [
    { at: 0, join: 'me', from: 'fade', say: "You don't remember any of this." },
    { at: 0.3, say: 'They do.' },
  ] } },
  { scene: 'dawnHouse', push: 1.05, save: true },
  { say: 'Your first word was no.' },
  { say: 'Dad said you got that from Mom.' },
  { say: "Mom didn't say anything. Which was also a no." },
  { lines: { scene: 'linesMorning', to: 5.2, events: [
    { at: 5, join: 'dog', label: 'dog', x: 0.58, from: 'fade' },
  ] } },
  { scene: 'puppy', push: 1.04, save: true },
  { say: 'Dad came home with a box that was moving.' },
  { say: 'Mom said absolutely not.' },
  { say: 'He slept on your bed that night, and every night after.' },
  { say: 'He stole one shoe from every pair in the house.' },
  { lines: { scene: 'linesMorning', to: 6, events: [] } },
  { scene: 'garden', push: 1.04, save: true },
  { say: "Grandma's house smelled of dill and floor polish." },
  { scene: 'jarHands', ms: 900 },
  { say: 'Every time you left, she gave you a jar of jam.' },
  { say: 'And every time she said the same thing.' },
  { say: 'Come visit more.', by: 'grandma' },
  { say: 'You were six. You said okay.' },
  { lines: { scene: 'linesMorning', to: 7.4, events: [
    { at: 7, join: 'friend', label: 'best friend', x: 0.68, from: 'right', say: 'First day of school.' },
    { at: 7.1, move: 'dad', x: 0.8 },
    { at: 7.2, say: 'The other chair at the desk was broken, so somebody sat next to you.' },
    { at: 7.3, say: 'By lunch you were best friends.' },
  ] } },
  { scene: 'bike', music: 'morning', save: true },
  { say: "I've got you. I've got you.", by: 'dad' },
  { hold: { hint: 'hold to pedal', ms: 4500 } },
  { say: "He didn't have you. He hadn't for a while." },
  { say: 'You rode straight into a bush.' },
  { say: "You were fine. The bush wasn't." },
  ...frame('21:19', 'Seven minutes.'),

  // Noon: 9 to 17.
  { chapter: 'Noon', save: true },
  { lines: { scene: 'linesNoon', music: 'noon', to: 11, events: [] } },
  { scene: 'lake', push: 1.04, save: true },
  { say: 'Summers were the lake.' },
  { say: 'The two of you jumped off that pier a thousand times.' },
  { say: 'Maybe forty. It felt like a thousand.' },
  { phone: { with: 'best friend', time: 'Sat 10:02', steps: [
    { them: 'u coming to the lake' },
    { them: 'u coming' },
    { them: '????' },
    { pick: ['yes', 'YES'] },
  ] } },
  { phone: { with: 'dad', time: 'Sat 10:04', steps: [
    { them: 'Text me when you get there.' },
    { pick: ['ok'] },
  ] } },
  { say: "You didn't text him when you got there." },
  { say: 'He never brought it up. He just asked again the next time.' },
  { scene: 'dogGate', push: 1.03 },
  { say: 'Every day after school he was at the gate before you came round the corner.' },
  { say: "Nobody told him what time you'd be home. He just knew." },
  { lines: { scene: 'linesNoon', to: 14, events: [
    { at: 12, end: 'grandpa', say: 'Grandpa was the first one.' },
    { at: 12.2, say: "You didn't really get it yet. You got it later, a bit at a time." },
  ] } },
  { lines: { scene: 'linesNoon', to: 16, events: [
    { at: 14.3, leave: 'friend', side: 'left', slow: true },
  ] } },
  { scene: 'dogOld', music: 'evening', push: 1.04 },
  { say: "One day he wasn't at the gate." },
  { say: "You found him asleep by the door. He hadn't heard you." },
  { say: 'After that you were the one who checked on him.' },
  { scene: 'bonfire', music: 'noon', push: 1.04, save: true },
  { say: 'A fire in the woods. Somebody brought a speaker.' },
  { phone: { with: 'mom', time: 'Fri 23:47', steps: [
    { them: 'Text me when you get home.\nMom' },
    { pick: ['ok', { text: 'leave it on read', silent: true }], set: 'teen' },
  ] } },
  { say: "You wrote ok. You didn't text when you got home.", if: { teen: 'ok' } },
  { say: 'You left it on read.', if: { teen: 'leave it on read' } },
  { say: 'Why did she sign them?' },
  { say: 'As if somebody else was asking you to text when you got home.' },
  { scene: 'kitchenNight', music: 'frame', push: 1.05 },
  { say: 'You got home at two.' },
  { say: 'The kitchen light was on.' },
  { say: "I couldn't sleep.", by: 'mom' },
  { say: 'She said that a lot. You believed her for years.' },
  { lines: { scene: 'linesNoon', music: 'noon', to: 16.6, events: [
    { at: 16.5, end: 'dog', say: 'We had to let him go today.', by: 'dad' },
    { at: 16.52, say: "He wasn't scared. I was holding him.", by: 'dad' },
  ] } },
  { scene: 'gateEmpty', music: 'grief' },
  { say: 'The next day nobody was at the gate.' },
  { say: 'You stood there a bit anyway.' },
  { lines: { scene: 'linesNoon', music: 'noon', to: 17.2, events: [
    { at: 17, say: "Somewhere in there the best friend wasn't next to you anymore." },
    { at: 17.1, say: 'There was no fight.' },
  ] } },
  { phone: { with: 'best friend', time: '', history: [
    { stamp: 'Jun 3' }, { them: 'lake?' }, { me: 'yes' },
    { stamp: 'Oct 19' }, { them: 'u out tonight' }, { me: 'cant' },
    { stamp: 'Feb 8' }, { them: 'u alive lol' },
  ], steps: [{ wait: 1800 }] } },
  { say: 'They always wrote first.' },
  { say: 'You got used to it.' },
  { say: "Then one day they didn't, and you didn't either." },

  // Evening: 18 to 24.
  { chapter: 'Evening', save: true },
  { scene: 'busStop', music: 'evening', push: 1.04 },
  { say: 'Eighteen. One bag, one bus.' },
  { say: 'Dad put the bag on the bus, took it off, and put it on again.' },
  { say: 'Text me when you get there.', by: 'mom' },
  { lines: { scene: 'linesDusk', to: 19, events: [
    { at: 18, move: 'mom', x: 0.2 },
    { at: 18, move: 'dad', x: 0.82 },
    { at: 18.4, say: "By the time you leave home, most of the days you'll ever spend with your parents are already behind you." },
    { at: 18.5, say: "Nobody tells you that. Or they do, and you're eighteen." },
  ] } },
  { scene: 'cityNight', music: 'lonely', save: true },
  { say: 'The city was big and nobody in it knew your name.' },
  { say: 'At first that was the best part.' },
  { hold: { hint: 'hold to walk home', ms: 4200 } },
  { phone: { with: null, time: 'Thu 01:06', steps: [{ type: 'home', unsendable: true }, { wait: 900 }, { erase: true }] } },
  { say: 'You got home and stood in the dark for a bit.' },
  { say: 'Nobody needed to know you got home.' },
  { say: 'Nobody was lying awake about it.' },
  ...frame('21:31', 'Nineteen minutes. Nothing yet.'),
  { scene: 'room', music: 'goose', save: true },
  { say: 'You met goose on a forum about a game neither of you was any good at.' },
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
  { say: 'goose never saw your face.' },
  { say: "Maybe that's why it was easy to tell them things." },
  { say: 'And goose never made any of it weird.' },
  { lines: { scene: 'linesNight', to: 24, events: [
    { at: 19.2, join: 'goose', label: 'goose', x: 0.9, from: 'fade', dashed: true },
    { at: 23.4, leave: 'goose', side: 'fade' },
    { at: 23.6, say: 'goose logged on less and less, and then not at all.' },
    { at: 23.65, say: "You'd told goose things you never said out loud. You were glad of that.", if: { goose: 'kind of' } },
    { at: 23.65, say: 'You never did tell goose much. Some nights you wish you had.', if: { goose: 'im fine' } },
    { at: 23.7, say: 'Some people are there for one chapter. It still counts.' },
  ] } },

  // Dawn: 24 to 35.
  { chapter: 'Dawn', save: true },
  { scene: 'hillDawn', music: 'dawn', push: 1.05 },
  { say: 'One Sunday you got up early for no reason and walked up the hill behind the flats.' },
  { say: "Two years living there and you'd never been up." },
  { say: 'You sat until the sun came up. Nothing happened.' },
  { say: 'It was the best morning in a long time.' },
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
  { say: "Same weekend: Grandma asked if you were coming, and the lake trip you'd all planned since spring.", save: true },
  { say: "Either way you'd miss something. You got to pick what." },
  { choose: 'weekend', options: [{ text: "Go to Grandma's", value: 'grandma' }, { text: 'Go to the lake', value: 'lake' }] },
  { scene: 'grandmaEvening', music: 'afternoon', push: 1.04, if: { weekend: 'grandma' } },
  { say: 'She made too much food. She always made too much food.', if: { weekend: 'grandma' } },
  { say: 'You left with two jars this time.', if: { weekend: 'grandma' } },
  { say: 'Your friends posted the lake all weekend. It looked like the best weekend.', if: { weekend: 'grandma' } },
  { scene: 'lakeFriends', music: 'noon', push: 1.04, if: { weekend: 'lake' } },
  { say: 'It was the best weekend.', if: { weekend: 'lake' } },
  { say: 'Grandma said on the phone it was fine. She said come next time.', if: { weekend: 'lake' } },
  { lines: { scene: 'linesSunrise', music: 'dawn', to: 28.6, events: [
    { at: 28, join: 'partner', label: 'partner', x: 0.38, from: 'left', say: 'Then somebody sat down next to you and stayed.' },
    { at: 28.1, move: 'mom', x: 0.12 },
    { at: 28.3, say: 'No broken chair this time.' },
  ] } },
  { scene: 'bench', push: 1.04 },
  { say: 'You were bad at saying how you felt.' },
  { say: 'They were patient about it.' },
  { lines: { scene: 'linesSunrise', to: 30, events: [
    { at: 29.5, end: 'grandma' },
  ] } },
  { scene: 'snow', music: 'grief', save: true },
  { say: 'Grandma died in January.' },
  { say: "Next time didn't come.", if: { weekend: 'lake' } },
  { say: 'You were glad you went. You still think about the lake sometimes.', if: { weekend: 'grandma' } },
  { say: 'There was one jar of her jam left in your fridge.' },
  { say: "You didn't open it for a long time." },
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
  { say: 'You said yes.' },
  { say: 'Your kid waved at it the whole way home.' },
  { lines: { scene: 'linesAfternoon', to: 44, events: [
    { at: 38, move: 'kid', x: 0.46 },
    { at: 41, move: 'mom', x: 0.2 },
    { at: 41, move: 'dad', x: 0.78 },
  ] } },
  { say: 'You found the old chat while looking for something else.', save: true },
  { phone: { with: 'best friend', time: '', history: [{ stamp: 'Feb 8' }, { them: 'u alive lol' }], steps: [
    { stamp: 'Today 22:10' },
    { type: 'hey', ask: ['Send', 'Delete'], set: 'reconnect' },
    { status: 'Read', if: { reconnect: 'Send' } },
    { wait: 1400, typing: true, if: { reconnect: 'Send' } },
    { wait: 1600, if: { reconnect: 'Send' } },
    { wait: 1200, typing: true, if: { reconnect: 'Send' } },
    { them: 'HEY', if: { reconnect: 'Send' } },
    { them: 'man. i was going to write you like a hundred times', if: { reconnect: 'Send' } },
    { them: 'lake this summer?', if: { reconnect: 'Send' } },
  ] } },
  { say: "You'd write tomorrow.", if: { reconnect: 'Delete' } },
  { if: { reconnect: 'Send' }, lines: { scene: 'linesAfternoon', to: 45, events: [
    { at: 44.2, back: 'friend', x: 0.6, say: 'The door was open the whole time.' },
  ] } },
  { scene: 'pierAutumn', push: 1.04, if: { reconnect: 'Send' } },
  { say: 'Same pier. Neither of you jumped.', if: { reconnect: 'Send' } },
  { say: 'You both thought about it.', if: { reconnect: 'Send' } },
  { phone: { with: 'mom', time: 'Mon 09:12', save: true, steps: [
    { them: 'how do i make the letters bigger\nMom' },
    { photo: 'thumb', from: 'them' },
    { photo: 'thumb', from: 'them' },
    { photo: 'thumb', from: 'them' },
    { pick: ["Mom that's your thumb"] },
    { them: 'I know\nMom' },
  ] } },
  { scene: 'dadGarden', music: 'afternoon', push: 1.04 },
  { say: 'Dad called to ask how to turn off the capital letters.' },
  { say: 'HE WAS VERY UPSET ABOUT IT.' },
  { say: 'You showed him. He held the phone like you used to hold the handlebars.' },
  { say: "You let go. He didn't notice." },
  { say: "I've got it. I've got it.", by: 'dad' },
  { scene: 'momTaxi', push: 1.04 },
  { say: 'Mom came for the weekend. She brought jam.' },
  { say: 'Text me when you get home.', by: 'you' },
  { phone: { with: 'mom', time: 'Sun 19:40', steps: [{ wait: 1600 }, { them: 'Home.\nMom' }] } },
  { say: "She texted before you'd even shut the door." },
  { lines: { scene: 'linesAfternoon', to: 66, save: true, events: [
    { at: 52, move: 'kid', x: 0.6 },
    { at: 58, end: 'dad', music: 'silence', phone: { with: 'dad', time: '', history: [{ stamp: 'Mon 18:02' }, { me: 'home' }, { them: 'ok.' }], steps: [{ wait: 2600 }] } },
    { at: 58.3, music: 'afternoon' },
    { at: 61, cross: ['a nurse', 'the bus driver', 'someone on the worst day of their life', 'a kid who sat alone'] },
    { at: 61.4, say: 'Most lines cross yours once and keep going.' },
    { at: 61.5, say: 'You never knew what kind of day it was in theirs.' },
    { at: 66, end: 'mom', music: 'silence', say: "Mom's last text was about the weather." },
    { at: 66, say: 'She signed it.' },
  ] } },

  // Late: 66 to 78, and back to the frame.
  { chapter: 'Late', save: true },
  { lines: { scene: 'linesEnd', music: 'end', to: 78, events: [
    { at: 70, move: 'kid', x: 0.66 },
    { at: 71, say: 'The people you kept close got old with you.' },
    { at: 71.1, say: 'The one who makes you laugh still calls on Sundays.', if: { picks: 'funny' } },
    { at: 71.2, say: 'The one who asks how you are still asks, and still waits for the real answer.', if: { picks: 'asks' } },
    { at: 71.3, say: 'The one who tells you the truth told you to call your kid more. You did.', if: { picks: 'truth' } },
    { at: 71.4, say: 'The one who is always late was late to your seventieth. They came.', if: { picks: 'late' } },
    { at: 71.5, say: 'The one who only called when they needed something stopped calling when you stopped picking up.', if: { picks: 'user' } },
    { at: 71.6, say: "You kept the one who made you feel small for too long. Then one day you didn't.", if: { picks: 'small' } },
    { at: 73, say: 'On Saturdays you and your best friend still go to the lake. Neither of you jumps.', if: { reconnect: 'Send' } },
    { at: 73, say: 'You still think about writing to your best friend.', if: { reconnect: 'Delete' } },
    { at: 77.6, say: 'Your kid came for dinner on Sunday.' },
    { at: 77.7, say: 'They brought too much food.' },
    { at: 77.75, say: 'At the door you told them to come visit more.' },
    { at: 77.8, say: 'You heard your grandma in it.', if: { weekend: 'lake' } },
    { at: 77.8, say: 'They said they would. They mostly do.', if: { weekend: 'grandma' } },
  ] } },
  { scene: 'porchLate', music: 'frame', push: 1.05, save: true },
  { say: "You put the kettle on. You don't want tea." },
  { say: 'You check the phone. You check it again.' },
  { say: 'Once you told your mom ok and never texted. She waited up anyway.', if: { teen: 'ok' } },
  { say: 'Once you left your mom on read. She waited up anyway.', if: { teen: 'leave it on read' } },
  { phone: { with: '', time: 'Sun 21:12', history: [{ me: SENT }], final: true, steps: [
    { status: 'Delivered' },
    { wait: 3200 },
    { status: 'Read' },
    { wait: 2400, typing: true },
    { wait: 1400 },
    { wait: 2000, typing: true },
    { them: 'home.', music: 'home' },
    { them: 'love you' },
    { pick: ['ok.', 'ok. love you too'], set: 'last' },
    { them: 'you sound like grandpa', if: { last: 'ok.' } },
    { them: 'love you. go to sleep', if: { last: 'ok. love you too' } },
  ] } },
  { say: 'You turn off the kitchen light.' },
  { scene: 'porchDark', ms: 2600 },
  { say: 'You sleep fine.' },
  { end: true },
];
