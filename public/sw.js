self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active one
  console.log('✅ Service Worker installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Become available to all pages immediately
  console.log('✅ Service Worker activated');
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New Message', body: 'You have a new invite!' };
  const options = {
    body: data.body,
    icon: '/favicon/icon-192.png',
    badge: '/favicon/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/settings?tab=history'));
});
