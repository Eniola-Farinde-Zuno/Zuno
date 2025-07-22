import React, { useState, useEffect } from 'react';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Pomodoro from './components/Pomodoro';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Notification from './components/Notification';
import { requestNotificationPermission, registerServiceWorker, foregroundMessageHandler, getFCMToken } from './notifications/notificationService';
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
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    const initializeNotifications = async () => {
      await registerServiceWorker();
      if (isLoggedIn) {
        await requestNotificationPermission();
      }
      if (localStorage.getItem('token')) {
        const permissionGranted = await requestNotificationPermission();
        if (permissionGranted) {
          const fcmToken = await getFCMToken();
          if (fcmToken) {
            await api.notifications.registerToken(fcmToken);
          }
        }
      };
    };

    let unsubscribeOnMessage;
    const setupMessageHandler = () => {
      unsubscribeOnMessage = foregroundMessageHandler((payload) => {
        setNotificationsList(prev => [
          {
            id: Date.now(),
            title: payload.notification?.title || 'New Notification',
            body: payload.notification?.body || '',
            data: payload.data || {}
          }
          , ...prev
        ]);
      });
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
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    initializeNotifications().then(() => {
      setupMessageHandler();
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
      clearTimeout(urlCheckTimeout);
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
          <Route element={<PrivateRouter isLoggedIn={isLoggedIn} />}>
            <Route path="/sidebar" element={<Sidebar />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/tasklist" element={<TaskList setIsLoggedIn={setIsLoggedIn} />} />
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
            onClose={() => setNotificationsList(prev =>
              prev.filter(n => n.id !== notification.id)
            )}
          />
        ))}
      </div>
    </>
  );
}

export default App;
