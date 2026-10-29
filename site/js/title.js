// title.js: splits the page title into letters so each one can change its font axes on its own.
//
// The font (Recursive) has axes from strict mono to loose casual. Before the start tap the
// letters use the typed form (mono); after it they ease into the said form (casual, heavy).
// While the music plays, a note now and then nudges one letter (heavier, slanted) and lets
// it settle back. The forms themselves are set in menu.css (--typed, --said, .is-nudged).

/**
 * Replaces the text of `el` with one span per letter, grouped by word so a word never
 * breaks across lines. Screen readers keep reading the heading's aria-label.
 * Returns the letter spans.
 */
export function splitTitle(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.textContent = '';

  const letters = [];
  words.forEach((word, w) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const letter = document.createElement('span');
      letter.className = 'ch';
      letter.textContent = ch;
      // --i staggers the typed-to-said change, one letter after another (see menu.css).
      letter.style.setProperty('--i', letters.length);
      wordEl.append(letter);
      letters.push(letter);
    }
    el.append(wordEl);
    if (w < words.length - 1) el.append(' ');
  });
  return letters;
}

/** Briefly nudges one random letter. Called on music notes once the menu is live. */
export function nudgeLetter(letters) {
  const letter = letters[Math.floor(Math.random() * letters.length)];
  letter.classList.add('is-nudged');
  // The quick change in comes from .is-nudged; the slow settle back comes from the
  // base rule's longer transition once the class is gone.
  setTimeout(() => letter.classList.remove('is-nudged'), 320);
}
