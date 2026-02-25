// Premium Service Worker for Offline Devotional Experience
const CACHE_NAME = 'pooja-v4';
const ASSET_CACHE = 'pooja-assets-v4';

// Assets to pre-cache for immediate offline use
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
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
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Strategy: Cache-First for Audio and Images to ensure offline playback
    if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.m4a') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.includes('/assets/')) {
        event.respondWith(
            caches.open(ASSET_CACHE).then((cache) => {
                return cache.match(request).then((response) => {
                    return response || fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // Strategy: Network-First for everything else
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
