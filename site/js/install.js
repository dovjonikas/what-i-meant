// install.js: keeping What I Meant on the home screen, and keeping it up to date there.
//
// registerWorker() starts sw.js, which fetches every file fresh when there is a connection
// (so a home screen copy is always the latest version) and falls back to the saved copy
// offline. offerInstall() shows a small sheet once the menu is open, unless the page is
// already running from the home screen or the offer was turned down recently:
// - Chrome, Edge and Android browsers allow a real one-tap install (beforeinstallprompt).
// - iPhone and iPad Safari do not let any page install itself, so the sheet shows where
//   Add to Home Screen is instead.

const DISMISS_KEY = 'wim.install.later';
const ASK_AGAIN_DAYS = 14;

let deferred = null;
addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferred = event;
});

/** `root` is the path from the current page to the site root, such as '' or '../../'. */
export function registerWorker(root = '') {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register(`${root}sw.js`, { scope: root || './', updateViaCache: 'none' }).catch(() => {
    // No worker (private mode, old browser): the site works as an ordinary page.
  });
}

export function offerInstall() {
  if (standalone() || recentlyDismissed()) return;
  // Give Chrome a moment to fire beforeinstallprompt after the page settles.
  setTimeout(() => {
    if (deferred) sheet('one-tap');
    else if (isAppleTouch()) sheet('apple');
  }, 1200);
}

function standalone() {
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function isAppleTouch() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at && Date.now() - at < ASK_AGAIN_DAYS * 864e5;
  } catch {
    return false;
  }
}

function sheet(kind) {
  const el = document.createElement('aside');
  el.className = 'install';
  el.setAttribute('aria-label', 'Add to Home Screen');
  el.innerHTML = `
    <img class="install-icon" src="assets/icon-180.png" alt="" width="44" height="44">
    <div class="install-text">
      <p class="install-title">Keep it on your home screen</p>
      <p class="install-sub">${kind === 'apple'
        ? 'Tap <svg class="install-share" viewBox="0 0 16 18" aria-hidden="true"><path d="M8 11V1.5M4.5 5 8 1.5 11.5 5M5 7.5H3.5v9h9v-9H11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Share, then <b>Add to Home Screen</b>.'
        : 'Opens full screen, like an app.'}</p>
    </div>
    <div class="install-actions">
      ${kind === 'apple' ? '' : '<button class="install-add" type="button">Add</button>'}
      <button class="install-later" type="button">Not now</button>
    </div>`;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('is-in'));

  const close = () => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 400);
  };
  el.querySelector('.install-later').addEventListener('click', () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // It will just ask again next time.
    }
    close();
  });
  el.querySelector('.install-add')?.addEventListener('click', async () => {
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    close();
  });
}
