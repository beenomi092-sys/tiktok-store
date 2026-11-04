const CACHE_NAME = 'tiktok-store-v2';
const STATIC_ASSETS = [
    '/',
    '/app.html',
    '/service.html',
    'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('🗑️ Removing old cache:', key);
                        return caches.delete(key);
                    })
            );
        })
        .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|svg)$/)) {
        event.respondWith(
            caches.match(event.request)
                .then(cached => {
                    if (cached) return cached;
                    return fetch(event.request)
                        .then(response => {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, clone));
                            return response;
                        });
                })
        );
        return;
    }
    
    if (url.hostname === 'firebasestorage.googleapis.com') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }
    
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('/'))
        );
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});

// ==========================================
// 📬 PUSH NOTIFICATION HANDLER
// ==========================================
self.addEventListener('push', (event) => {
    console.log('📬 Push received');
    
    let data = {
        title: 'TikTok Support',
        body: 'New message received',
        icon: 'https://img.icons8.com/color/48/tiktok.png',
        url: '/service'
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || 'https://img.icons8.com/color/48/tiktok.png',
        badge: 'https://img.icons8.com/color/48/tiktok.png',
        vibrate: [500, 200, 500, 200, 500],
        tag: 'support-message-' + Date.now(),
        renotify: true,
        requireInteraction: true,
        silent: false,
        data: data.url || '/service'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ==========================================
// 👆 NOTIFICATION CLICK HANDLER
// ==========================================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked');
    event.notification.close();
    
    const urlToOpen = event.notification.data || '/service';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // ✅ Agar service page already open hai toh focus karo
                for (const client of clientList) {
                    if ((client.url.includes('/service') || client.url.includes('service.html')) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // ✅ Warna naya window kholo
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

console.log('✅ TikTok Store Service Worker Loaded!');