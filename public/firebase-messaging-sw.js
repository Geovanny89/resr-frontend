importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuración de Firebase (estos valores son públicos y seguros)
const firebaseConfig = { 
  apiKey: "AIzaSyDvfjZXD_N6s5P07AQ_wXBFwWv_w3S_VmU", 
  authDomain: "reservas-kdice.firebaseapp.com", 
  projectId: "reservas-kdice", 
  storageBucket: "reservas-kdice.firebasestorage.app", 
  messagingSenderId: "399450737686", 
  appId: "1:399450737686:web:2ffdb70e29217f1f267937"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejador de mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[sw] Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/kdice-launcher.png',
    badge: '/kdice-launcher.png',
    data: payload.data,
    tag: payload.data?.appointmentId || 'default'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
