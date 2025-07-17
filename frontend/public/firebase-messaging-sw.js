importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCy6TRqBVhNElax84m7q7ZjJuTMVLpIPc8",
    authDomain: "zuno-5b834.firebaseapp.com",
    projectId: "zuno-5b834",
    storageBucket: "zuno-5b834.appspot.com",
    messagingSenderId: "173301867198",
    appId: "1:173301867198:web:93da0ca6bfa673b5ae74ef",
    measurementId: "G-6XQX3JZLZV",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/zuno-logo.png',
        data: payload.data || {},
        tag: payload.data?.taskId || 'default'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
