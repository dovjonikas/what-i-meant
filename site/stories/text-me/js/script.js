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
//   { lines: {...} }                  the life lines: hold to let the years run (lines.js)
//   { choose: 'flag', options }       a choice; the picked value is kept under that flag
//   { hold: {...} }                   hold to do something (pedal, walk) until it is done
//   { wait: ms }                      a pause with nothing to tap
//   { save: true }                    a point the story resumes from
//   { end: true }                     the end card
// Any beat can carry `if: { flag: value }`; it plays only when the flag has that value.

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

const frame = (time) => [
  { scene: 'porch', music: 'frame', ms: 1400 },
  { phone: { with: '', time, history: [{ me: SENT }], steps: [{ status: 'Delivered' }, { wait: 2200 }] } },
];

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
  { lines: { scene: 'linesDawn', music: 'morning', to: 3, hint: 'hold to grow up', events: [
    { at: 0, join: 'me', from: 'fade', say: 'You don’t remember any of this.' },
    { at: 0.3, say: 'They do.' },
  ] } },
  { scene: 'dawnHouse', push: 1.05, save: true },
  { say: 'Your first word was no.' },
  { say: 'Dad said you got that from Mom.' },
  { say: 'Mom didn’t say anything. Which was also a no.' },
  { lines: { scene: 'linesMorning', to: 6, events: [] } },
  { scene: 'garden', push: 1.04, save: true },
  { say: 'Grandma’s house smelled of dill and floor polish.' },
  { scene: 'jarHands', ms: 900 },
  { say: 'Every time you left, she gave you a jar of jam.' },
  { say: 'And every time she said the same thing.' },
  { say: 'Come visit more.', by: 'grandma' },
  { say: 'You were six. You said okay.' },
  { lines: { scene: 'linesMorning', to: 7.4, events: [
    { at: 7, join: 'friend', label: 'best friend', x: 0.62, from: 'right', say: 'First day of school.' },
    { at: 7.1, move: 'dad', x: 0.78 },
    { at: 7.2, say: 'The other chair at the desk was broken, so somebody sat next to you.' },
    { at: 7.3, say: 'By lunch you were best friends.' },
  ] } },
  { scene: 'bike', music: 'morning', save: true },
  { say: 'I’ve got you. I’ve got you.', by: 'dad' },
  { hold: { hint: 'hold to pedal', ms: 2600, scene: 'bikeAlone' } },
  { say: 'He didn’t have you. He hadn’t for a while.' },
  { say: 'You rode straight into a bush.' },
  { say: 'You were fine. The bush wasn’t.' },
  ...frame('Sun 21:19'),

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
  { say: 'You didn’t text him when you got there.' },
  { say: 'He never brought it up. He just asked again the next time.' },
  { lines: { scene: 'linesNoon', to: 14, events: [
    { at: 12, end: 'grandpa', say: 'Grandpa was the first one.' },
    { at: 12.2, say: 'You didn’t really get it yet. You got it later, a bit at a time.' },
  ] } },
  { lines: { scene: 'linesNoon', to: 16, events: [
    { at: 14, join: 'team', label: 'the team', x: 0.86, from: 'right' },
    { at: 14.3, leave: 'friend', side: 'left', slow: true },
    { at: 14.6, join: 'crush', label: 'the crush', x: 0.74, from: 'right' },
    { at: 15.2, join: 'group', label: 'the group chat', x: 0.95, from: 'right' },
  ] } },
  { scene: 'bonfire', push: 1.04, save: true },
  { say: 'A fire in the woods. Somebody brought a speaker.' },
  { phone: { with: 'mom', time: 'Fri 23:47', steps: [
    { them: 'Text me when you get home.\nMom' },
    { pick: ['ok', 'leave it on read'], set: 'teen' },
  ] } },
  { say: 'You wrote ok. You didn’t text when you got home.', if: { teen: 'ok' } },
  { say: 'You left it on read.', if: { teen: 'leave it on read' } },
  { say: 'Why did she sign them?' },
  { say: 'As if somebody else was asking you to text when you got home.' },
  { scene: 'kitchenNight', music: 'frame', push: 1.05 },
  { say: 'You got home at two.' },
  { say: 'The kitchen light was on.' },
  { say: 'I couldn’t sleep.', by: 'mom' },
  { say: 'She said that a lot. You believed her for years.' },
  { lines: { scene: 'linesNoon', music: 'noon', to: 17.2, events: [
    { at: 17, say: 'Somewhere in there the best friend wasn’t next to you anymore.' },
    { at: 17.1, say: 'There was no fight.' },
  ] } },
  { phone: { with: 'best friend', time: '', history: [
    { stamp: 'Jun 3' }, { them: 'lake?' }, { me: 'yes' },
    { stamp: 'Oct 19' }, { them: 'u out tonight' }, { me: 'cant' },
    { stamp: 'Feb 8' }, { them: 'u alive lol' },
  ], steps: [{ wait: 1800 }] } },
  { say: 'They always wrote first.' },
  { say: 'You got used to it.' },
  { say: 'Then one day they didn’t, and you didn’t either.' },

  // Evening: 18 to 24.
  { chapter: 'Evening', save: true },
  { scene: 'busStop', music: 'evening', push: 1.04 },
  { say: 'Eighteen. One bag, one bus.' },
  { say: 'Dad put the bag on the bus, took it off, and put it on again.' },
  { say: 'Text me when you get there.', by: 'mom' },
  { lines: { scene: 'linesDusk', to: 19, events: [
    { at: 18, move: 'mom', x: 0.2 },
    { at: 18, move: 'dad', x: 0.82 },
    { at: 18.1, leave: 'team', side: 'right' },
    { at: 18.2, leave: 'group', side: 'right', slow: true },
    { at: 18.3, leave: 'crush', side: 'right' },
    { at: 18.4, say: 'By the time you leave home, most of the days you’ll ever spend with your parents are already behind you.' },
    { at: 18.5, say: 'Nobody tells you that. Or they do, and you’re eighteen.' },
  ] } },
  { scene: 'cityNight', music: 'lonely', save: true },
  { say: 'The city was big and nobody in it knew your name.' },
  { say: 'At first that was the best part.' },
  { hold: { hint: 'hold to walk home', ms: 3200 } },
  { phone: { with: null, time: 'Thu 01:06', steps: [{ type: 'home', unsendable: true }, { wait: 900 }, { erase: true }] } },
  { say: 'You got home and stood in the dark for a bit.' },
  { say: 'Nobody needed to know you got home.' },
  { say: 'Nobody was lying awake about it.' },
  ...frame('Sun 21:31'),
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
  { say: 'Maybe that’s why it was easy to tell them things.' },
  { say: 'And goose never made any of it weird.' },
  { lines: { scene: 'linesNight', to: 24, events: [
    { at: 19.2, join: 'goose', label: 'goose', x: 0.9, from: 'fade', dashed: true },
    { at: 23.4, leave: 'goose', side: 'fade' },
    { at: 23.6, say: 'goose logged on less and less, and then not at all.' },
    { at: 23.7, say: 'Some people are there for one chapter. It still counts.' },
  ] } },

  // Dawn: 24 to 35.
  { chapter: 'Dawn', save: true },
  { scene: 'hillDawn', music: 'dawn', push: 1.05 },
  { say: 'One Sunday you got up early for no reason and walked up the hill behind the flats.' },
  { say: 'Two years living there and you’d never been up.' },
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
  { say: 'Same weekend: Grandma asked if you were coming, and the lake trip you’d all planned since spring.', save: true },
  { say: 'Either way you’d miss something. You got to pick what.' },
  { choose: 'weekend', options: [{ text: 'Go to Grandma’s', value: 'grandma' }, { text: 'Go to the lake', value: 'lake' }] },
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
  { say: 'Next time didn’t come.', if: { weekend: 'lake' } },
  { say: 'You were glad you went. You still think about the lake sometimes.', if: { weekend: 'grandma' } },
  { say: 'There was one jar of her jam left in your fridge.' },
  { say: 'You didn’t open it for a long time.' },
  { lines: { scene: 'linesSunrise', music: 'dawn', to: 31.6, events: [
    { at: 31, join: 'kid', label: 'kid', x: 0.44, from: 'birth' },
  ] } },
  { scene: 'babyHand', music: 'morning', ms: 1400 },
  { say: 'Your kid won’t remember any of this.' },
  { say: 'You will.' },
  { phone: { with: 'dad', time: 'Wed 04:12', steps: [
    { photo: 'baby', from: 'me' },
    { wait: 1500 },
    { them: 'ok.' },
    { wait: 2200, typing: true },
    { them: 'proud of you.' },
  ] } },
  ...frame('Sun 21:44'),

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
  { say: 'You’d write tomorrow.', if: { reconnect: 'Delete' } },
  { lines: { scene: 'linesAfternoon', to: 45, if: { reconnect: 'Send' }, events: [
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
    { pick: ['Mom that’s your thumb'] },
    { them: 'I know\nMom' },
  ] } },
  { scene: 'dadGarden', music: 'afternoon', push: 1.04 },
  { say: 'Dad called to ask how to turn off the capital letters.' },
  { say: 'HE WAS VERY UPSET ABOUT IT.' },
  { say: 'You showed him. He held the phone like you used to hold the handlebars.' },
  { say: 'You let go. He didn’t notice.' },
  { say: 'I’ve got it. I’ve got it.', by: 'dad' },
  { scene: 'momTaxi', push: 1.04 },
  { say: 'Mom came for the weekend. She brought jam.' },
  { say: 'Text me when you get home.', by: 'you' },
  { phone: { with: 'mom', time: 'Sun 19:40', steps: [{ wait: 1600 }, { them: 'Home.\nMom' }] } },
  { say: 'She texted before you’d even shut the door.' },
  { lines: { scene: 'linesAfternoon', to: 66, save: true, events: [
    { at: 52, move: 'kid', x: 0.6 },
    { at: 58, end: 'dad', music: 'silence', phone: { with: 'dad', time: '', history: [{ stamp: 'Mon 18:02' }, { me: 'home' }, { them: 'ok.' }], steps: [{ wait: 2600 }] } },
    { at: 58.3, music: 'afternoon' },
    { at: 61, cross: ['a nurse', 'the bus driver', 'someone on the worst day of their life', 'a kid who sat alone'] },
    { at: 61.4, say: 'Most lines cross yours once and keep going.' },
    { at: 61.5, say: 'You never knew what kind of day it was in theirs.' },
    { at: 66, end: 'mom', say: 'Mom’s last text was about the weather.' },
    { at: 66, say: 'She signed it.' },
  ] } },

  // Late: 66 to 78, and back to the frame.
  { chapter: 'Late', save: true },
  { lines: { scene: 'linesEnd', music: 'end', to: 78, events: [
    { at: 70, move: 'kid', x: 0.66 },
    { at: 77.6, say: 'Your kid came for dinner on Sunday.' },
    { at: 77.7, say: 'They brought too much food.' },
  ] } },
  { scene: 'porchLate', music: 'frame', push: 1.05, save: true },
  { say: 'You put the kettle on. You don’t want tea.' },
  { say: 'You check the phone. You check it again.' },
  { phone: { with: '', time: 'Sun 21:12', history: [{ me: SENT }], final: true, steps: [
    { status: 'Delivered' },
    { wait: 3200 },
    { status: 'Read' },
    { wait: 2400, typing: true },
    { wait: 1400 },
    { wait: 2000, typing: true },
    { them: 'home.', music: 'home' },
    { them: 'love you' },
    { pick: ['ok.', 'ok. love you too'] },
  ] } },
  { say: 'You turn off the kitchen light.' },
  { say: 'You sleep fine.' },
  { end: true },
];
