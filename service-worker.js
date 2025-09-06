// Service Worker for Magnate PWA (Static Site)

const CACHE_NAME = 'magnate-v1.0.0';
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
  '/Magnate/Images/undraw_calculator.png',
  '/Magnate/Images/undraw_online-calendar.png'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache assets', err);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/Magnate/index.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
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
    })
  );

  // Claim clients to ensure that the SW takes control immediately
  return self.clients.claim();
});