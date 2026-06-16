const CACHE_NAME = 'magnate-v3.0';
const urlsToCache = [
  '/Magnate/',
  '/Magnate/manifest.json',
  '/Magnate/index.html',
  '/Magnate/Goals%20%26%20Categories.html',
  '/Magnate/Track%20Transactions.html',
  '/Magnate/Analytics.html',
  '/Magnate/Calculator.html',
  '/Magnate/Money%20Tips.html',
  '/Magnate/css/styles.css',
  '/Magnate/css/index.css',
  '/Magnate/css/goals-categories.css',
  '/Magnate/css/track-transactions.css',
  '/Magnate/css/analytics.css',
  '/Magnate/css/calculator.css',
  '/Magnate/css/money-tips.css',
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
  '/Magnate/favicon.ico',
  '/Magnate/apple-touch-icon.png',
  '/Magnate/android-chrome-192x192.png',
  '/Magnate/android-chrome-512x512.png',
  '/Magnate/images/undraw_calculator.png',
  '/Magnate/images/undraw_online-calendar.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.5.1',
  'https://cdn.jsdelivr.net/npm/easymde@2.21.0/dist/easymde.min.css',
  'https://cdn.jsdelivr.net/npm/easymde@2.21.0/dist/easymde.min.js',
  'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to pre-cache assets — install will retry:', err);
        throw err;
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();

            return caches.open(CACHE_NAME)
              .then(cache => {
                return cache.put(event.request, responseToCache);
              })
              .then(() => response);
          }
        ).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(event.request).then(cachedResponse => {
              return cachedResponse || caches.match('/Magnate/index.html');
            });
          }
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});