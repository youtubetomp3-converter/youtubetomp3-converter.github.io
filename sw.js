// Service Worker for YouTube to MP3 Converter

const CACHE_NAME = 'youtube-to-mp3-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './offline.html',
  './styles.css',
  './script.js',
  './cors-helper.js',
  './storage-access.js',
  './manifest.json',
  './error-logger.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Function to check if caches are accessible
const checkCacheAccess = async () => {
  try {
    const testCache = await caches.open('cache-access-test');
    await testCache.put(new Request('/cache-test'), new Response('test'));
    await caches.delete('cache-access-test');
    return true;
  } catch (err) {
    console.warn('Cache storage is blocked by privacy settings:', err);
    return false;
  }
};

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    checkCacheAccess().then(hasAccess => {
      if (hasAccess) {
        return caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
          });
      } else {
        console.log('Skipping cache - storage access is blocked');
        return Promise.resolve();
      }
    })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and API calls
  if (event.request.url.includes('youtube-mp36.p.rapidapi.com') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    checkCacheAccess().then(hasAccess => {
      if (!hasAccess) {
        // If cache access is blocked, fall back to network
        return fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return fetch('./offline.html');
          }
          return new Response('Network error occurred', { 
            status: 408, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        });
      }
      
      // Normal cache then network strategy
      return caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
        .catch(() => {
          // If both cache and network fail, serve offline page if it's a document request
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
          // Otherwise just fail gracefully
          return new Response('Network error occurred', { 
            status: 408, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        });
    })
  );
});

// Update service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    checkCacheAccess().then(hasAccess => {
      if (hasAccess) {
        return caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheWhitelist.indexOf(cacheName) === -1) {
                return caches.delete(cacheName);
              }
            })
          );
        });
      }
      return Promise.resolve();
    })
  );
});
