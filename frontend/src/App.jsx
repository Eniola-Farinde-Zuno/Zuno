import React from 'react';
import {useState, useEffect} from 'react';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Pomodoro from './components/Pomodoro';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { requestNotificationPermission, registerServiceWorker, foregroundMessageHandler } from './notifications/notificationService';

const PrivateRouter = ({ isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token") ? true : false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    const initializeNotifications = async () => {
      registerServiceWorker();
      if (isLoggedIn) {
        await requestNotificationPermission();
        foregroundMessageHandler((notification) => {
          console.log('Notification received:', notification);
        });
      }
    };
    initializeNotifications();
  }, [isLoggedIn]);
  return (
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
  )

}

export default App;
