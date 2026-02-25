const CACHE_NAME = 'sodev-v1.0.9';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
    );
});

self.addEventListener('fetch', (event) => {
    // Zero interception for debugging
    return;
});
