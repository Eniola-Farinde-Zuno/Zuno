import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const AUTH_DOMAIN = import.meta.env.VITE_AUTH_DOMAIN;
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID;
const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET;
const MESSAGING_SENDER_ID = import.meta.env.VITE_MESSAGING_SENDER_ID;
const APP_ID = import.meta.env.VITE_APP_ID;
const MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENT_ID;


const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register('/firebase-messaging-sw.js')
  }
}

export const  getFCMToken = async () => {
  const currentToken = await getToken(messaging, {
    vapidKey: VAPID_KEY,
  })
  return currentToken || null;
}

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await getFCMToken();
  }
}

export const foregroundMessageHandler = (callback) => {
  return onMessage(messaging, (payload) => {
    if (callback && typeof callback === 'function') {
      callback(payload);
    } else {
      const notificationTitle = payload.notification?.title || 'New notification';
      const notificationOptions = {
        body: payload.notification?.body || '',
      };
      new Notification(notificationTitle, notificationOptions);
    }
  });
}
