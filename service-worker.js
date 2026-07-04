const CACHE_VERSION = 'v2.0';
const STATIC_CACHE = `magnate-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `magnate-images-${CACHE_VERSION}`;
const RUNTIME_CACHE = `magnate-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/Magnate/',
  '/Magnate/manifest.json',
  '/Magnate/index.html',
  '/Magnate/Goals%20%26%20Categories.html',
  '/Magnate/Track%20Transactions.html',
  '/Magnate/Analytics.html',
  '/Magnate/Calculator.html',
  '/Magnate/Money%20Tips.html',
  '/Magnate/Settings.html',
  '/Magnate/css/styles.css',
  '/Magnate/css/index.css',
  '/Magnate/css/goals-categories.css',
  '/Magnate/css/track-transactions.css',
  '/Magnate/css/analytics.css',
  '/Magnate/css/calculator.css',
  '/Magnate/css/money-tips.css',
  '/Magnate/css/settings.css',
  '/Magnate/js/index.js',
  '/Magnate/js/goals-categories.js',
  '/Magnate/js/track-transactions.js',
  '/Magnate/js/analytics.js',
  '/Magnate/js/csv-handler.js',
  '/Magnate/js/calculator.js',
  '/Magnate/js/money-tips.js',
  '/Magnate/js/tips-data.js',
  '/Magnate/js/navigation.js',
  '/Magnate/js/utils.js',
  '/Magnate/js/dialogs.js',
  '/Magnate/js/data-manager.js',
  '/Magnate/js/settings.js',
  '/Magnate/icon.svg',
  '/Magnate/icon-maskable.svg',
  '/Magnate/favicon.ico',
  '/Magnate/apple-touch-icon.png',
  '/Magnate/apple-touch-icon-120x120.png',
  '/Magnate/apple-touch-icon-152x152.png',
  '/Magnate/apple-touch-icon-167x167.png',
  '/Magnate/android-chrome-192x192.png',
  '/Magnate/android-chrome-512x512.png',
  '/Magnate/android-chrome-maskable-192x192.png',
  '/Magnate/android-chrome-maskable-512x512.png',
  '/Magnate/images/undraw_calculator.png',
  '/Magnate/images/undraw_online-calendar.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          fetch(url, { credentials: 'same-origin' }).then(response => {
            if (response.ok) return cache.put(url, response);
            console.warn(`SW: failed to cache ${url}`);
          }).catch(() => {
            console.warn(`SW: failed to fetch ${url}`);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      await clients.claim();
      const validCaches = [STATIC_CACHE, IMAGE_CACHE, RUNTIME_CACHE];
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (!validCaches.includes(key)) return caches.delete(key);
        })
      );
    })()
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (request.headers.get('range')) return;

  const path = url.pathname;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (/\.(css|js)$/i.test(path)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  if (/\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/i.test(path)) {
    event.respondWith(cacheFirstWithUpdate(request, IMAGE_CACHE));
    return;
  }

  event.respondWith(cacheFirstWithUpdate(request, RUNTIME_CACHE));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match('/Magnate/index.html');
    return fallback || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || networkPromise;
}

async function cacheFirstWithUpdate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  if (cached) {
    networkPromise;
    return cached;
  }
  return networkPromise;
}