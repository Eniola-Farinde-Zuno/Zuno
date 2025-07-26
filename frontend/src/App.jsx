import { useState, useEffect } from 'react';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Pomodoro from './components/Pomodoro';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import NotificationsPage from './notifications/NotificationsPage';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Notification from './notifications/Notification';
import Dashboard from './components/Dashboard/Dashboard';
import { requestNotificationPermission, registerServiceWorker, foregroundMessageHandler, getFCMToken } from './notifications/notificationService';
import { addNotification, processOfflineOperations } from './notifications/indexedDB';
import * as api from './utils/api';

const PrivateRouter = ({ isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token") ? true : false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    const initializeNotifications = async () => {
      await registerServiceWorker();
      if (isLoggedIn && Notification.permission === 'granted') {
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          await api.notifications.registerToken(fcmToken);
        }
      }
    };

    //process any pending offline operations when the app comes online
    const syncOfflineOperations = async () => {
      if (navigator.onLine && isLoggedIn) {
        await processOfflineOperations(api.notifications);
      }
    };

    let unsubscribeOnMessage;
    const setupMessageHandler = () => {
      unsubscribeOnMessage = foregroundMessageHandler((payload) => {
        //create notification object
        const notification = {
          id: payload.data?.id || Date.now(),
          title: payload.notification?.title || 'New Notification',
          body: payload.notification?.body || '',
          data: payload.data || {},
          timestamp: Date.now(),
          read: false
        };
        setNotificationsList(prev => [notification, ...prev]);
        //store in IndexedDB for offline access
        if ('indexedDB' in window) {
          addNotification(notification)
        }
      });
    };
    const handleNewLocalNotification = (event) => {
      const notificationData = event.detail;
      setNotificationsList(prev => {
        if (!prev.some(n => n.id === notificationData.id)) {
          return [notificationData, ...prev];
        }
        return prev;
      });
    };
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };
    // listener to handle messages received from the service worker
    const handleServiceWorkerMessage = async (event) => {
      if (event.data && event.data.type === 'UNDO_TASK') { // if message is of type 'UNDO_TASK' then send a request to the server to undo the task
        const taskId = event.data.taskId;
        if (taskId) {
          await api.task.undoComplete(taskId);
          window.dispatchEvent(new CustomEvent('refresh-tasks'));
        }
      }
    };
    //add online/offline event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('new-notification', handleNewLocalNotification);
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    //initialize notifications and process any pending offline operations
    initializeNotifications().then(() => {
      setupMessageHandler();
      if (navigator.onLine) {
        syncOfflineOperations();
      }
    });
    const checkUrlForUndoAction = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const undoTaskId = urlParams.get('undo');
      if (undoTaskId) {
        window.history.replaceState({}, document.title, window.location.pathname);
        api.task.undoComplete(undoTaskId)
      }
    };
    const urlCheckTimeout = setTimeout(checkUrlForUndoAction, 1000);
    return () => {
      if (unsubscribeOnMessage) {
        unsubscribeOnMessage();
      }
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('new-notification', handleNewLocalNotification);
      clearTimeout(urlCheckTimeout);
    };
  }, [isLoggedIn]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
          <Route element={<PrivateRouter isLoggedIn={isLoggedIn} />}>
            <Route path="/sidebar" element={<Sidebar />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasklist" element={<TaskList setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to={isLoggedIn ? "/sidebar" : "/signin"} />} />
        </Routes>
      </Router>

      <div className="notifications-container">
        {notificationsList.map(notification => (
          <Notification
            key={notification.id}
            title={notification.title}
            body={notification.body}
            data={notification.data}
            onClose={() => setNotificationsList(prev =>
              prev.filter(n => n.id !== notification.id)
            )}
          />
        ))}
      </div>
      {!isOnline && (
        <div className='offline-msg'>You are offline.</div>
      )}
    </>
  );
}

export default App;
