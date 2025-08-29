// Service Worker for Financier PWA (Static Site)

const CACHE_NAME = 'financier-v1.0.0';
const urlsToCache = [
  '/Financier/',
  '/Financier/manifest.json',
  '/Financier/index.html',
  '/Financier/Goals%20%26%20Categories.html',
  '/Financier/Track%20Transactions.html',
  '/Financier/Analytics.html',
  '/Financier/Calculator.html',
  '/Financier/Money%20Tips.html',
  '/Financier/css/styles.css',
  '/Financier/css/index.css',
  '/Financier/css/goals-categories.css',
  '/Financier/css/track-transactions.css',
  '/Financier/css/analytics.css',
  '/Financier/css/calculator.css',
  '/Financier/css/money-tips.css',
  '/Financier/js/index.js',
  '/Financier/js/goals-categories.js',
  '/Financier/js/track-transactions.js',
  '/Financier/js/analytics.js',
  '/Financier/js/csv-handler.js',
  '/Financier/js/calculator.js',
  '/Financier/js/money-tips.js',
  '/Financier/js/navigation.js',
  '/Financier/favicon.ico',
  '/Financier/PWA%20icon.png',
  '/Financier/Images/undraw_calculator.png',
  '/Financier/Images/undraw_online-calendar.png'
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
  // For static sites, we can use a simpler cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // For navigation requests, return index.html as fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/Financier/index.html');
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