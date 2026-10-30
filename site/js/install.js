// install.js: keeping What I Meant on the home screen, and keeping it up to date there.
//
// registerWorker() starts sw.js, which fetches every file fresh when there is a connection
// (so a home screen copy is always the latest version) and falls back to the saved copy
// offline. offerInstall() shows a small sheet soon after the page opens, unless the page is
// already running from the home screen:
// - Inside another app's browser (a link opened from Instagram, Facebook, TikTok...), the
//   page cannot go on the home screen at all, and those apps block every way for a page to
//   open Safari by itself. The sheet says how to get to the real browser (••• at the top,
//   then Open in browser), and offers to copy the link. On Android it can open Chrome.
// - Chrome, Edge and Android browsers allow a real one-tap install (beforeinstallprompt).
// - iPhone and iPad Safari do not let any page install itself, so the sheet shows where
//   Add to Home Screen is: behind the ••• button since Safari 26, under Share before it.
// Turning the home screen offer down keeps it away for two weeks; the in-app one comes back
// each time, since without it the story cannot be kept at all.

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

/**
 * `root` as for registerWorker(). `still` says whether the moment to offer is still on:
 * a story offers it only on its start screen, never over the story itself.
 */
export function offerInstall(root = '', still = () => true) {
  if (standalone()) return;
  const app = inAppBrowser();
  if (!app && recentlyDismissed()) return;
  // Give Chrome a moment to fire beforeinstallprompt after the page settles.
  setTimeout(() => {
    if (!still()) return;
    if (app) sheet('in-app', root, app);
    else if (deferred) sheet('one-tap', root);
    else if (isAppleTouch()) sheet('apple', root);
  }, 1200);
}

/** Takes the sheet away, without counting it as turned down (a story has started). */
export function closeInstall() {
  document.querySelector('.install')?.dispatchEvent(new Event('wim:close'));
}

function standalone() {
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function isAppleTouch() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

/** The app whose built-in browser this is, by the name it puts in the user agent, or null. */
function inAppBrowser() {
  const ua = navigator.userAgent;
  const apps = [
    [/Instagram/, 'Instagram'],
    [/FBAN|FBAV|FB_IAB|FBIOS/, 'Facebook'],
    [/musical_ly|TikTok|BytedanceWebview/, 'TikTok'],
    [/Snapchat/, 'Snapchat'],
    [/LinkedInApp/, 'LinkedIn'],
    [/\bLine\//, 'LINE'],
  ];
  return apps.find(([pattern]) => pattern.test(ua))?.[1] ?? null;
}

/** Safari's own version (Safari 26 moved Share behind the ••• next to the address bar). */
function safariMajor() {
  return Number(navigator.userAgent.match(/Version\/(\d+)/)?.[1] ?? 0);
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at && Date.now() - at < ASK_AGAIN_DAYS * 864e5;
  } catch {
    return false;
  }
}

const SHARE_ICON = '<svg class="install-share" viewBox="0 0 16 18" aria-hidden="true"><path d="M8 11V1.5M4.5 5 8 1.5 11.5 5M5 7.5H3.5v9h9v-9H11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const DOTS = '<b class="install-dots" aria-label="the three dots button">•••</b>';

/** The words and buttons for each kind of sheet. */
function content(kind, app) {
  if (kind === 'in-app') {
    const android = /Android/.test(navigator.userAgent);
    return {
      title: android ? 'Open it in Chrome' : 'Open it in Safari',
      sub: `${app}'s own browser can't keep it on your home screen. Tap ${DOTS} at the top, then <b>Open in browser</b>.`,
      actions: `${android ? '<button class="install-add install-chrome" type="button">Open in Chrome</button>' : '<button class="install-add install-copy" type="button">Copy link</button>'}
        <button class="install-later" type="button">Not now</button>`,
    };
  }
  if (kind === 'apple') {
    const newSafari = safariMajor() >= 26 && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
    return {
      title: 'Keep it on your home screen',
      sub: newSafari
        ? `Tap ${DOTS} next to the address, then ${SHARE_ICON} <b>Share</b>, then <b>Add to Home Screen</b>.`
        : `Tap ${SHARE_ICON} <b>Share</b>, then <b>Add to Home Screen</b>.`,
      actions: '<button class="install-later" type="button">Got it</button>',
    };
  }
  return {
    title: 'Keep it on your home screen',
    sub: 'Opens full screen, like an app.',
    actions: '<button class="install-add install-one-tap" type="button">Add</button><button class="install-later" type="button">Not now</button>',
  };
}

function sheet(kind, root, app) {
  const { title, sub, actions } = content(kind, app);
  const el = document.createElement('aside');
  el.className = `install is-${kind}`;
  el.setAttribute('aria-label', title);
  el.innerHTML = `
    <img class="install-icon" src="${root}assets/icon-180.png" alt="" width="44" height="44">
    <div class="install-text">
      <p class="install-title">${title}</p>
      <p class="install-sub">${sub}</p>
    </div>
    <div class="install-actions">${actions}</div>`;
  document.body.append(el);
  // Lifts the start screen's own words and buttons above the sheet (the page's css).
  document.body.style.setProperty('--sheet-h', `${el.offsetHeight}px`);
  document.body.classList.add('has-install');
  requestAnimationFrame(() => el.classList.add('is-in'));

  const close = () => {
    el.classList.remove('is-in');
    document.body.classList.remove('has-install');
    setTimeout(() => el.remove(), 400);
  };
  el.addEventListener('wim:close', close);
  el.querySelector('.install-later').addEventListener('click', () => {
    if (kind !== 'in-app') {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // It will just ask again next time.
      }
    }
    close();
  });
  el.querySelector('.install-one-tap')?.addEventListener('click', async () => {
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    close();
  });
  // The link to paste into Safari, for when the ••• menu is hard to find.
  el.querySelector('.install-copy')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(location.href);
      button.textContent = 'Copied. Paste it in Safari';
    } catch {
      button.textContent = location.host + location.pathname;
    }
  });
  // Android lets a page hand itself over to Chrome.
  el.querySelector('.install-chrome')?.addEventListener('click', () => {
    location.href = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=com.android.chrome;end`;
  });
}
