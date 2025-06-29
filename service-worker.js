const CACHE_NAME = 'infinity-x-v1';
const urlsToCache = [ '/', 'index.html', 'transactions.html', 'reports.html', 'budgets.html', 'settings.html', 'developer.html', 'style.css', 'main.js', 'ui.js', 'manifest.json', 'logo.svg', 'vector_lecture_design.png', 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css', 'https://cdn.jsdelivr.net/npm/chart.js' ];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
self.addEventListener('activate', e => { const w = [CACHE_NAME]; e.waitUntil(caches.keys().then(n => Promise.all(n.map(name => { if (w.indexOf(name) === -1) return caches.delete(name); })))); });