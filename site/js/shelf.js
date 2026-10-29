// shelf.js: builds the row of story cards and the dots under it.
//
// The row scrolls sideways and snaps one card to the middle; the cards beside it are drawn
// a little smaller and dimmer so the middle one reads as the one you are on. Touch swipes
// scroll it natively; on a computer the mouse wheel and the arrow keys move one card at a time.

import { drawCover } from './covers.js';

/**
 * Renders `stories` into the `list` element and the `dots` nav.
 * `onLockedTap(story)` runs when the middle card of a story that is not out yet is tapped.
 */
export function renderShelf(list, dots, stories, { onLockedTap }) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  const cards = stories.map((story, i) => {
    const item = document.createElement('li');
    item.style.setProperty('--i', i);

    const card = story.status === 'out' ? outCard(story) : lockedCard(story);
    item.append(card);
    list.append(item);

    const cover = card.querySelector('.cover');
    if (cover.tagName === 'CANVAS') drawCover(cover, story.cover, i + 1);

    card.addEventListener('click', (event) => {
      // A card at the side is brought to the middle first; the tap does nothing else.
      if (i !== current && isScrollable()) {
        event.preventDefault();
        scrollToCard(i);
        return;
      }
      if (story.status !== 'out') {
        shake(card.querySelector('.card-face'));
        onLockedTap(story);
      }
    });
    return card;
  });

  const dotButtons = stories.map((story, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Story ${story.number}`);
    dot.addEventListener('click', () => scrollToCard(i));
    dots.append(dot);
    return dot;
  });

  function isScrollable() {
    return list.scrollWidth > list.clientWidth + 1;
  }

  function scrollToCard(i) {
    cards[i].scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  // Scales and dims each card by its distance from the middle of the row. Transform and
  // opacity are set on each card directly (not through a shared CSS variable) so the
  // browser only restyles the cards that change.
  function updateFocus() {
    const box = list.getBoundingClientRect();
    const middle = box.left + box.width / 2;
    const scrollable = isScrollable();
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const distance = r.left + r.width / 2 - middle;
      const t = scrollable ? Math.min(1, Math.abs(distance) / r.width) : 0;
      card.style.transform = t ? `scale(${1 - 0.08 * t})` : '';
      card.style.opacity = t ? String(1 - 0.45 * t) : '';
      if (Math.abs(distance) < nearestDistance) {
        nearestDistance = Math.abs(distance);
        nearest = i;
      }
    });

    current = nearest;
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
  }

  let frame = 0;
  const scheduleFocus = () => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; updateFocus(); });
  };
  list.addEventListener('scroll', scheduleFocus, { passive: true });
  window.addEventListener('resize', scheduleFocus);
  updateFocus();

  // A wheel turned up or down moves one card; a short pause stops one wheel turn from
  // skipping several cards. Sideways trackpad swipes are left to scroll natively.
  let wheelPause = 0;
  list.addEventListener('wheel', (event) => {
    if (!isScrollable() || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    if (wheelPause || Math.abs(event.deltaY) < 4) return;
    step(Math.sign(event.deltaY));
    wheelPause = setTimeout(() => { wheelPause = 0; }, 450);
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    if (list.inert) return; // the menu is not open yet
    if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'ArrowLeft') step(-1);
  });

  function step(direction) {
    scrollToCard(Math.min(cards.length - 1, Math.max(0, current + direction)));
  }

  // A short sideways shake: the card heard the tap, the story just is not out yet.
  // Played with the Web Animations API, so a second tap restarts it cleanly.
  function shake(face) {
    if (reduceMotion.matches) {
      face.animate([{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }], { duration: 240, easing: 'ease' });
      return;
    }
    face.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-7px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 380, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    );
  }
}

function lockedCard(story) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card is-locked';
  card.setAttribute('aria-disabled', 'true');
  card.setAttribute('aria-label', `Story ${story.number}, coming soon`);
  card.innerHTML = `
    <span class="card-face">
      ${coverMarkup(story)}
      <span class="card-meta" aria-hidden="true">
        <span class="card-no">${story.number}</span>
        <span class="card-name">Coming soon</span>
      </span>
    </span>`;
  return card;
}

function outCard(story) {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = `stories/${story.id}/`;
  card.innerHTML = `
    <span class="card-face">
      ${coverMarkup(story)}
      <span class="card-meta">
        <span class="card-no">${story.number}</span>
        <span class="card-name">${story.title}</span>
      </span>
    </span>`;
  return card;
}

function coverMarkup(story) {
  if (story.image) return `<img class="cover" src="${story.image}" alt="">`;
  return `<canvas class="cover cover-${story.cover}" aria-hidden="true"></canvas>`;
}
