const CACHE_NAME = 'sodev-pooja-v1.0.6';

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

// Fetch Event
self.addEventListener('fetch', (event) => {
    // 1. Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // 2. ALWAYS fetch HTML (navigation) from network to ensure latest version
    if (event.request.mode === 'navigate') {
        event.respondWith(fetch(event.request));
        return;
    }

    // 🚨 iOS FIX: Do not intercept or cache media files (mp3, mp4, etc.)
    // Safari requires 'Range' requests which Service Workers break unless handled specifically.
    const url = new URL(event.request.url);
    const path = url.pathname.toLowerCase();

    if (path.endsWith('.mp3') ||
        path.endsWith('.wav') ||
        path.endsWith('.mp4') ||
        path.includes('/assets/audio/') ||
        event.request.destination === 'audio' ||
        event.request.destination === 'video') {
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
