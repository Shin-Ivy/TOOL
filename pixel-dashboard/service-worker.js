/**
 * PIXEL.TOOLS — Service Worker
 * Bump CACHE_NAME on each deployment to refresh precached shell assets.
 */
const CACHE_NAME = 'pixel-tools-v5';
const PWA_BUILD = 'v=2';

/** Clean URL → canonical HTML file (serve static root) */
const HTML_ALIASES = {
  '/': '/index.html',
  '/index': '/index.html',
  '/index.html': '/index.html',
  '/dashboard': '/dashboard.html',
  '/dashboard.html': '/dashboard.html',
};

/**
 * App shell URLs — both /dashboard and /dashboard.html are listed;
 * only real files are fetched at install; /dashboard is stored as an alias clone.
 */
const urlsToCache = [
  '/index.html',
  '/dashboard.html',
  '/dashboard',
  `/manifest.json?${PWA_BUILD}`,
  '/css/pixel.css',
  `/img/icon-180.png?${PWA_BUILD}`,
  `/img/icon-192.png?${PWA_BUILD}`,
  `/img/icon-512.png?${PWA_BUILD}`,
  `/js/pwa-register.js?${PWA_BUILD}`,
  '/js/theme-bootstrap.js',
  '/js/notifications.js',
  '/js/pixel-theme.js',
  '/js/lang_unified.js',
  '/js/i18n-dashboard.js',
  '/js/login-ui.js',
  '/js/config.example.js',
  '/js/auth.js',
  '/js/audio.js',
  '/js/store.js',
  '/js/dashboard.js',
  '/js/supabase-config.js',
  '/js/components/retro-file-input.js',
  '/js/tools/ipgeo.js',
  '/js/tools/subnet.js',
  '/js/tools/ping.js',
  '/js/tools/base64.js',
  '/js/tools/palette.js',
  '/js/tools/texttools.js',
  '/js/tools/todo.js',
  '/js/tools/pomodoro.js',
  '/js/tools/json-formatter.js',
  '/js/tools/ai-ctx.js',
  '/js/tools/micro-digest.js',
  '/js/tools/content-wiz.js',
  '/js/tools/hd-format.js',
  '/js/tools/stem-sep.js',
  '/js/tools/loudness.js',
  '/js/tools/windows-debloater.js',
];

/** Paths that exist on disk (no clean-URL aliases). */
const PRECACHE_FILES = urlsToCache.filter(
  (url) => url !== '/dashboard' && url !== '/'
);

function bareAssetPath(urlOrPath) {
  const path = urlOrPath.includes('://')
    ? new URL(urlOrPath).pathname
    : String(urlOrPath).split('?')[0];
  return path;
}

function isPrecachedRequest(url) {
  const path = url.pathname;
  const full = path + (url.search || '');
  return PRECACHE_FILES.some(
    (entry) => entry === full || bareAssetPath(entry) === path
  );
}

const FONT_CACHE = 'pixel-tools-fonts-v1';
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

const DASHBOARD_KEYS = ['/dashboard.html', '/dashboard'];

function canonicalHtmlPath(pathname) {
  const base = pathname.replace(/\/$/, '') || '/';
  if (HTML_ALIASES[base]) return HTML_ALIASES[base];
  if (base.endsWith('/dashboard.html')) return '/dashboard.html';
  if (base.endsWith('/dashboard')) return '/dashboard.html';
  return pathname;
}

function isDashboardRoute(pathname) {
  const base = pathname.replace(/\/$/, '') || '/';
  return base === '/dashboard' || base === '/dashboard.html' || base.endsWith('/dashboard');
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isFontRequest(url) {
  return FONT_ORIGINS.some((origin) => url.href.startsWith(origin));
}

function isApiOrAuthRequest(url) {
  if (!url.protocol.startsWith('http')) return true;
  const path = url.pathname;
  return (
    url.hostname.includes('supabase.co') ||
    (url.hostname.includes('googleapis.com') && path.includes('/oauth')) ||
    url.hostname === 'accounts.google.com'
  );
}

function isNavigationRequest(request) {
  if (request.mode === 'navigate') return true;
  const accept = request.headers.get('accept') || '';
  return request.destination === 'document' && accept.includes('text/html');
}

/** Absolute safety net — never leave respondWith without a Response. */
async function networkFallback(request) {
  try {
    return await fetch(request);
  } catch (err) {
    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/** Try several cache keys (exact URL, canonical HTML path, dashboard aliases). */
async function matchFromCache(cache, request) {
  const url = new URL(request.url);
  const candidates = [
    request,
    url.pathname + url.search,
    url.pathname,
    canonicalHtmlPath(url.pathname),
    canonicalHtmlPath(url.pathname) + url.search,
  ];

  if (isDashboardRoute(url.pathname)) {
    for (const key of DASHBOARD_KEYS) {
      candidates.push(key, key + url.search);
    }
  }

  const seen = new Set();
  for (const key of candidates) {
    const id = typeof key === 'string' ? key : key.url;
    if (seen.has(id)) continue;
    seen.add(id);
    try {
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch (e) { /* ignore bad match keys */ }
  }
  return undefined;
}

/**
 * Cache First with mandatory network fallback.
 * Never rejects — returns fetch() on cache miss or network error.
 */
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await matchFromCache(cache, request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      try {
        await cache.put(request, response.clone());
      } catch (e) { /* quota / opaque — ignore */ }
    }
    return response;
  } catch (err) {
    return networkFallback(request);
  }
}

/**
 * Stale-While-Revalidate for fonts only.
 */
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await matchFromCache(cache, request);

    const networkPromise = fetch(request)
      .then((response) => {
        if (response && response.ok) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => null);

    if (cached) {
      networkPromise.catch(() => {});
      return cached;
    }

    const network = await networkPromise;
    if (network) return network;

    return networkFallback(request);
  } catch (err) {
    return networkFallback(request);
  }
}

/**
 * Network-first for HTML navigations with cache + clean-URL aliases.
 * /dashboard and /dashboard.html always resolve to the same cached shell.
 */
async function handleNavigation(request) {
  try {
    const url = new URL(request.url);
    const canonical = canonicalHtmlPath(url.pathname);
    const cache = await caches.open(CACHE_NAME);

    const tryNetwork = async (req) => {
      try {
        const response = await fetch(req);
        if (response && response.ok) {
          try {
            await cache.put(req, response.clone());
            if (canonical === '/dashboard.html') {
              await cache.put('/dashboard.html', response.clone());
              await cache.put('/dashboard', response.clone());
            } else if (canonical !== url.pathname) {
              await cache.put(canonical, response.clone());
            }
          } catch (e) { /* ignore */ }
          return response;
        }
        return response;
      } catch (e) {
        return null;
      }
    };

    let response = await tryNetwork(request);

    if ((!response || !response.ok) && canonical === '/dashboard.html') {
      const altPaths = ['/dashboard.html', '/dashboard'];
      for (const altPath of altPaths) {
        if (altPath === url.pathname) continue;
        const altRequest = new Request(url.origin + altPath + url.search, {
          method: 'GET',
          headers: request.headers,
          mode: 'same-origin',
        });
        response = await tryNetwork(altRequest);
        if (response && response.ok) return response;
      }
    } else if ((!response || !response.ok) && canonical !== url.pathname) {
      const altRequest = new Request(
        url.origin + canonical + url.search,
        { method: 'GET', headers: request.headers, mode: 'same-origin' }
      );
      response = await tryNetwork(altRequest);
      if (response && response.ok) return response;
    }

    if (response && response.ok) return response;

    const cached = await matchFromCache(cache, request);
    if (cached) return cached;

    for (const key of DASHBOARD_KEYS) {
      if (!isDashboardRoute(url.pathname)) break;
      const hit =
        (await cache.match(key + url.search)) ||
        (await cache.match(key));
      if (hit) return hit;
    }

    const cachedCanonical =
      (await cache.match(canonical + url.search)) ||
      (await cache.match(canonical));
    if (cachedCanonical) return cachedCanonical;

    return networkFallback(request);
  } catch (err) {
    return networkFallback(request);
  }
}

/** Optional config.js — cache separately so install does not fail */
async function precacheOptional(cache, url) {
  try {
    const res = await fetch(url);
    if (res.ok) await cache.put(url, res);
  } catch (e) { /* dev may not have config.js */ }
}

async function precacheShell(cache) {
  await Promise.allSettled(
    PRECACHE_FILES.map((url) =>
      cache.add(url).catch(() =>
        fetch(url).then((r) => (r.ok ? cache.put(url, r) : undefined))
      )
    )
  );

  await precacheOptional(cache, '/js/config.js');
  await precacheOptional(cache, '/js/supabase-secrets.js');

  const dash = await cache.match('/dashboard.html');
  if (dash) {
    await cache.put('/dashboard.html', dash.clone());
    await cache.put('/dashboard', dash.clone());
  }

  const index = await cache.match('/index.html');
  if (index) {
    await cache.put('/', index.clone());
    await cache.put('/index.html', index.clone());
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => precacheShell(cache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== FONT_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isApiOrAuthRequest(url)) return;

  const safeRespond = (handler) => {
    event.respondWith(
      (async () => {
        try {
          const result = await handler();
          if (result instanceof Response) return result;
          return networkFallback(request);
        } catch (err) {
          return networkFallback(request);
        }
      })()
    );
  };

  if (isFontRequest(url)) {
    safeRespond(() => staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  if (!isSameOrigin(url)) return;

  if (isNavigationRequest(request)) {
    safeRespond(() => handleNavigation(request));
    return;
  }

  const path = url.pathname;
  const precached =
    isPrecachedRequest(url) ||
    path === '/dashboard' ||
    path === '/dashboard.html' ||
    path === '/js/config.js' ||
    path === '/js/supabase-secrets.js';

  if (precached) {
    safeRespond(() => cacheFirst(request, CACHE_NAME));
    return;
  }

  /* Uncached paths: browser default network — do not intercept */
});

/**
 * Notification click — focus app and open To-Do (or data.tool from payload).
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const tool = (event.notification.data && event.notification.data.tool) || 'todo';
  const targetUrl = new URL('/dashboard.html', self.location.origin);
  targetUrl.searchParams.set('tool', tool);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const onDashboard =
          clientUrl.pathname.endsWith('dashboard.html') ||
          clientUrl.pathname.endsWith('/dashboard') ||
          clientUrl.pathname.endsWith('/');
        if (onDashboard) {
          client.postMessage({ type: 'PIXEL_NAVIGATE', tool: tool });
          if ('focus' in client) return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl.href);
    })
  );
});
