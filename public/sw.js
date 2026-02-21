// Advanced Service Worker for Real-Time Updates
const CACHE_NAME = 'pooja-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force the waiting service worker to become the active one
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); // Take control of all clients immediately
});

self.addEventListener('fetch', (event) => {
    // Always try the network first, fall back to cache if offline
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
