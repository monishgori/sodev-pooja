// Premium Service Worker for Offline Devotional Experience
const CACHE_NAME = 'pooja-v2'; // Bump version
const ASSET_CACHE = 'pooja-assets-v2';

// Assets to pre-cache for immediate offline use
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/images/1.png',
    '/assets/audio/bell.mp3',
    '/assets/audio/shankh.mp3'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME && name !== ASSET_CACHE) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Strategy for Media / Static Assets: Cache-First
    if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') || url.pathname.includes('/assets/') ||
        url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {

        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(request).then((networkResponse) => {
                    // Cache if it's a valid response or a CORS font request
                    const isFont = url.hostname.includes('fonts');
                    const isBasic = networkResponse.type === 'basic' && networkResponse.status === 200;
                    const isCors = networkResponse.type === 'cors' && networkResponse.status === 200;

                    if (isBasic || isCors || isFont) {
                        const responseToCache = networkResponse.clone();
                        caches.open(ASSET_CACHE).then((cache) => cache.put(request, responseToCache));
                    }
                    return networkResponse;
                }).catch(() => null);
            })
        );
        return;
    }

    // Strategy for App Shell (HTML/JS/CSS): Network-First, but always cache successful hits
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                }
                return response;
            })
            .catch(() => {
                // If network fails, serve from cache
                return caches.match(request);
            })
    );
});
