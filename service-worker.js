const CACHE_NAME = 'i-expanse-tracker-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'config.js',
  'state.js',
  'main.js',
  'ui.js',
  'manifest.json',
  'image (4).png',
  'Picsart_24-12-22_22-58-18-749.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
self.addEventListener('activate', e => { const w = [CACHE_NAME]; e.waitUntil(caches.keys().then(n => Promise.all(n.map(name => { if (w.indexOf(name) === -1) return caches.delete(name); })))); });