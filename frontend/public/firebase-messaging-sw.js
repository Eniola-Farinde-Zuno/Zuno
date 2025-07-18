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
    if (payload.data?.actions) {
        notificationOptions.actions = JSON.parse(payload.data.actions);
    }

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'undo') {
        const taskId = event.notification.data?.taskId;
        if (!taskId) return;
        event.waitUntil(
            (async () => {
                const clients = await self.clients.matchAll({
                    type: 'window',
                    includeUncontrolled: true
                });
                const tasklistClient = clients.find(c =>
                    c.url.includes('/tasklist') && 'focus' in c
                );
                if (tasklistClient) {
                    tasklistClient.focus();
                    tasklistClient.postMessage({
                        type: 'UNDO_TASK',
                        taskId: taskId
                    });
                }
            })()
        );
    }
    else if (event.notification.data?.type === 'pomodoro_completion') {
        const pomodoroAction = event.action;
        event.waitUntil(
            (async () => {
                const clients = await self.clients.matchAll({
                    type: 'window',
                    includeUncontrolled: true
                });
                const pomodoroClient = clients.find(c =>
                    c.url.includes('/pomodoro') && 'focus' in c
                );
                if (pomodoroClient) {
                    pomodoroClient.focus();
                    pomodoroClient.postMessage({
                        type: 'POMODORO_ACTION',
                        action: pomodoroAction
                    });
                } else {
                    const newWindow = await self.clients.openWindow(`/pomodoro?action=${pomodoroAction}`);
                    if (newWindow) newWindow.focus();
                }
            })()
        );
    } else {
        event.waitUntil(
            self.clients.openWindow('/tasklist')
        );
    }
});
