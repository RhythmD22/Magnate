// Service Worker for Magnate PWA (Static Site)
const CACHE_NAME = 'magnate-v1.0'; // Updated version to force refresh
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
  '/Magnate/js/navigation.js',
  '/Magnate/js/utils.js',
  '/Magnate/js/data-manager.js',
  '/Magnate/favicon.ico',
  '/Magnate/apple-touch-icon.png',
  '/Magnate/android-chrome-192x192.png',
  '/Magnate/android-chrome-512x512.png',
  '/Magnate/images/undraw_calculator.png',
  '/Magnate/images/undraw_online-calendar.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caches opened');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache assets', err);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response to store in cache
            const responseToCache = response.clone();

            return caches.open(CACHE_NAME)
              .then(cache => {
                return cache.put(event.request, responseToCache);
              })
              .then(() => response);
          }
        ).catch(() => {
          // Serve cached index.html for navigation requests when offline
          if (event.request.mode === 'navigate') {
            return caches.match('/Magnate/index.html');
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});