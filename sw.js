// Service Worker for FitGymPro PWA

const CACHE_NAME = 'fitgympro-v2'; // Increment version to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // The browser will resolve this to the compiled JS
  '/manifest.json',
  '/en.json',
  '/fa.json',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker and remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response from cache
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't cache calls to the genai API itself
                if (!event.request.url.includes('generativelanguage')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        );
      })
  );
});