const CACHE = 'londres-v3';

self.addEventListener('install', e => {
  // Pre-cache the app shell
  e.waitUntil(
    caches.open(CACHE).then(c => c.add('./index.html'))
  );
  // Take control immediately — don't wait for old SW to die
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches (any name that isn't current)
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // Claim all open tabs immediately
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first: always try to get fresh content
  // Falls back to cache only when offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
