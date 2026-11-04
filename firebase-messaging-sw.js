importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBMepMwQhCpiCtkfaUkcS-g6ZfQXEsG6l0",
    authDomain: "tiktokstore-playstore.firebaseapp.com",
    projectId: "tiktokstore-playstore",
    storageBucket: "tiktokstore-playstore.firebasestorage.app",
    messagingSenderId: "48937691714",
    appId: "1:48937691714:web:aa03b06d2417cacb581bdb"
});

const messaging = firebase.messaging();

// ✅ BACKGROUND MESSAGE HANDLER
messaging.onBackgroundMessage((payload) => {
    console.log('📬 Background message:', payload);
    
    const title = payload.notification?.title || 'New Message';
    const body = payload.notification?.body || '';
    
    self.registration.showNotification(title, {
        body: body,
        icon: 'https://img.icons8.com/color/192/tiktok.png',
        badge: 'https://img.icons8.com/color/96/tiktok.png',
        vibrate: [500, 200, 500, 200, 500],
        requireInteraction: true,
        tag: 'chat-' + Date.now(),
        data: { url: '/service.html' }
    });
});

// ✅ NOTIFICATION CLICK HANDLER
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/service.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
            // Agar service page already open hai toh focus karo
            for (let c of list) {
                if (c.url.includes('service') && 'focus' in c) {
                    return c.focus();
                }
            }
            // Nahi toh naya window kholo
            return clients.openWindow(urlToOpen);
        })
    );
});

console.log('✅ Firebase Messaging SW loaded!');