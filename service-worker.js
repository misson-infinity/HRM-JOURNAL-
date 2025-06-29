const CACHE_NAME = 'infinity-tracker-pro-v4'; // ভার্সন আপডেট করা হয়েছে
const urlsToCache = [
  '/',
  'index.html',
  'transactions.html',
  'reports.html',
  'budgets.html',
  'settings.html',
  'developer.html',
  'style.css',
  'main.js',
  'ui.js',
  'manifest.json',
  'logo.svg',
  'vector_lecture_design.png',
  
  // External Libraries for Offline Access
  'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, caching essential files...');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).catch(() => {
          // যদি নেটওয়ার্কও ফেল করে, একটি ফলব্যাক পেজ দেখানো যেতে পারে (ঐচ্ছিক)
          console.log('Fetch failed; returning offline page (if available).');
        });
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});