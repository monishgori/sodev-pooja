const CACHE_NAME = 'sodev-pooja-v1.0.4';

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch Event - Network First Strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // 🚨 iOS FIX: Do not intercept or cache media files (mp3, mp4, etc.)
    // Safari requires 'Range' requests which Service Workers break unless handled specifically.
    const url = event.request.url.toLowerCase();
    if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.mp4') || url.includes('/assets/audio/')) {
        return; // Fallback to browser's native network handler
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
