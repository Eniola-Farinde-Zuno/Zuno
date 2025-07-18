import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { notifications } from '../utils/api';
import './NotificationsPage.css';
import { formatDistanceToNow } from 'date-fns';
import { faList, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NotificationsPage = () => {
    const [notificationsList, setNotificationsList] = useState([]);
    const [filter, setFilter] = useState('all');

    const fetchNotifications = async () => {
        const data = await notifications.getAll();
        setNotificationsList(data || []);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        await notifications.markAsRead(notificationId);
        setNotificationsList(prevList =>
            prevList.map(notification =>
                notification.id === notificationId ? { ...notification, isRead: true } : notification
            )
        );
    };

    const handleMarkAllAsRead = async () => {
        await notifications.markAllAsRead();
        setNotificationsList(prevList =>
            prevList.map(notification => ({ ...notification, isRead: true }))
        );
    };

    const formatTime = (dateString) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    const handleToggleReadStatus = async (notification) => {
        if (notification.isRead) {
            setNotificationsList(prevList =>
                prevList.map(n =>
                    n.id === notification.id ? { ...n, isRead: false } : n
                )
            );
        } else {
            await handleMarkAsRead(notification.id);
        }
    };

    const filteredNotifications = notificationsList.filter(notification => {
        if (filter === 'unread') {
            return !notification.isRead;
        }
        return true;
    });

    return (
        <div className="notifications-page">
            <Sidebar />
            <div className="notification-container">
                <div className="notifications-content">
                    <div className="notifications-header">
                        <h1>Notifications</h1>
                        {notificationsList.some(n => !n.isRead) && (
                            <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}> Mark all as read </button>
                        )}
                    </div>
                    <div className="notifications-tabs">
                        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}> All </button>
                        <button className={`tab-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}> Unread </button>
                    </div>
                    {filteredNotifications.length == 0 ? (
                        <div className='empty-state'>
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {filteredNotifications.map(notification => (
                                <div key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`} onClick={() => handleToggleReadStatus(notification)}>
                                    <div className="notification-icon">
                                        <FontAwesomeIcon icon={ notification.data?.type === 'pomodoro_completion' ? faClock : faList} />
                                    </div>
                                    <div className="notification-content">
                                        <h3 className="notification-title">{notification.title}</h3>
                                        <p className="notification-body">{notification.body}</p>
                                        <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
