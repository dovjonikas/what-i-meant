// names.js: what each person is called on screen. As a scene comes in, each person you know
// gets this name above them for a few seconds (fx.js); Mom's album writes the dog's (closeups.js).
// The dog is 'puppy' until the player names him (setName).

export const NAMES = { me: 'you', mom: 'mom', dad: 'dad', grandma: 'grandma', grandpa: 'grandpa', friend: 'best friend', partner: 'partner', kid: 'your kid', dog: 'puppy' };

/** Changes the name shown over a person, once the player has chosen it. */
export function setName(id, name) {
  NAMES[id] = name;
}
