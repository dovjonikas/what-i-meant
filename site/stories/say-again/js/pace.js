// pace.js: the story's clock. Every wait and every typing speed goes through `pace.k`,
// so a second time through can run faster without touching a single beat.

export const pace = { k: 1 };

/** A pause of `ms` at normal pace; shorter when the pace is up. */
export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms / pace.k));
}
