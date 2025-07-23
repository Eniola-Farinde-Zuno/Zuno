importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
const DB_NAME = 'zuno-notification-db';
const DB_VERSION = 1;
const STORE_NAME = 'received-notifications';
//function to open IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                objectStore.createIndex('read', 'read', { unique: false });
            }
        };
        request.onsuccess = event => {
            resolve(event.target.result);
        };
    });
}

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

    //function to store notification in IndexedDB and show notification
    const storeAndShowNotification = async () => {
        let notificationId;
        const dbInstance = await openIndexedDB();
            const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const notificationRecord = {
                title: notificationTitle,
                body: notificationOptions.body,
                icon: notificationOptions.icon,
                data: notificationOptions.data,
                actions: notificationOptions.actions,
                timestamp: Date.now(),
                read: false
            };

            const addRequest = store.add(notificationRecord);
            await new Promise((resolve, reject) => {
                addRequest.onsuccess = (e) => {
                    notificationId = e.target.result;
                    resolve();
                };
                addRequest.onerror = (e) => reject(e.target.error);
            });
            await tx.done;
            const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            clients.forEach(client => {
                client.postMessage({
                    type: 'NEW_NOTIFICATION_RECEIVED',
                    notification: { ...notificationRecord, id: notificationId }
                });
            });
        return self.registration.showNotification(notificationTitle, notificationOptions);
    };
    return storeAndShowNotification();
});

//logic to handle action buttons in notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); //close notification when buttion is clicked
    if (event.action === 'undo') { // If the 'undo' button is clicked, send an 'UNDO_TASK' message to App.jsx where the listener is defined
        // which will then trigger an API call to the backend's taskController to undo the task.
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
    else if (event.notification.data?.type === 'pomodoro_completion') { //if the notification is pomodoro completion
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
    }
});
