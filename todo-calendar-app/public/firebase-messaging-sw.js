// Service Worker for Firebase Cloud Messaging
// This file must be in the public directory

importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');

// Firebase configuration - update this with your actual config
// You can also load this from firebase-config.js if needed
const firebaseConfig = {
  apiKey: "AIzaSyAolx499A8daQL61ek81ayoSjrSsYHHSFM",
  authDomain: "todo-calendar-app-babc9.firebaseapp.com",
  projectId: "todo-calendar-app-babc9",
  storageBucket: "todo-calendar-app-babc9.firebasestorage.app",
  messagingSenderId: "510741694478",
  appId: "1:510741694478:web:12f4619e35647de542945f",
  measurementId: "G-6P0J7G8R9G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: payload.data,
    requireInteraction: true,
    tag: payload.data?.examId || 'default',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

