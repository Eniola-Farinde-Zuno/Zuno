import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { notifications as apiNotifications } from '../utils/api';
import './NotificationsPage.css';
import { formatDistanceToNow } from 'date-fns';
import { faList, faClock, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAllStoredNotifications, markNotificationAsRead, openIndexedDBClient } from './indexedDB';

const NotificationsPage = () => {
    const [notificationsList, setNotificationsList] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoadingLocal, setIsLoadingLocal] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const STORE_NAME = 'received-notifications';

    const normalizeApiNotification = (apiNotif) => ({
        id: apiNotif.id,
        title: apiNotif.title,
        body: apiNotif.body,
        icon: apiNotif.icon || '/zuno-logo.png',
        data: apiNotif.data || {},
        actions: apiNotif.actions,
        timestamp: new Date(apiNotif.createdAt).getTime(),
        read: apiNotif.isRead
    });

    const fetchNotifications = useCallback(async () => {
        setIsLoadingLocal(true);
        setError(null);
        const localData = await getAllStoredNotifications();
        localData.sort((a, b) => b.timestamp - a.timestamp);
        setNotificationsList(localData);
        setIsLoadingLocal(false);
        if (navigator.onLine) { //if online, sync with API
            setIsSyncing(true);
            const apiData = await apiNotifications.getAll();
            if (apiData && apiData.length > 0) {
                const normalizedApiData = apiData.map(normalizeApiNotification);
                const db = await openIndexedDBClient();
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                for (const apiNotif of normalizedApiData) {
                    await new Promise((resolve, reject) => {
                        const request = store.put(apiNotif);
                        request.onsuccess = () => resolve();
                    });
                }
                await tx.done;
                const updatedLocalData = await getAllStoredNotifications();
                updatedLocalData.sort((a, b) => b.timestamp - a.timestamp);
                setNotificationsList(updatedLocalData);
                setIsSyncing(false);
            }
        }
    }, [isOnline]);

    useEffect(() => {
        fetchNotifications();
        const handleServiceWorkerMessage = (event) => { //listen for service worker messages
            if (event.data && event.data.type === 'NEW_NOTIFICATION_RECEIVED') {
                fetchNotifications();
            }
        };
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        //online/offline event listeners
        const handleOnline = () => {
            setIsOnline(true);
            setError(null);
            fetchNotifications();
        };
        const handleOffline = () => {
            setIsOnline(false);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [fetchNotifications]);

    const handleMarkAsReadAndSync = async (notificationId) => {
        setNotificationsList(prevList =>
            prevList.map(notification =>
                notification.id === notificationId ? { ...notification, read: true } : notification
            )
        );
        await markNotificationAsRead(notificationId);
        if (navigator.onLine) {
            await apiNotifications.markAsRead(notificationId);
        } else {
            queueOfflineOperation('markAsRead', { notificationId });
        }
    };

    const handleMarkAllAsReadAndSync = async () => {
        setNotificationsList(prevList =>
            prevList.map(notification => ({ ...notification, read: true }))
        );
        const db = await openIndexedDBClient();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const allLocalNotifications = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
        for (const notif of allLocalNotifications) {
            if (!notif.read) {
                notif.read = true;
                store.put(notif);
            }
        }
        await tx.done;
        if (navigator.onLine) {
            await apiNotifications.markAllAsRead();
        } else {
            queueOfflineOperation('markAllAsRead', {});
        }
    };

    const queueOfflineOperation = async (operationType, data) => {
        const db = await openIndexedDBClient();
        const tx = db.transaction('offline-operations', 'readwrite');
        const store = tx.objectStore('offline-operations');
        const operation = {
            type: operationType,
            data: data,
            timestamp: Date.now()
        };
        await store.add(operation);
    };

    const formatTime = (dateNum) => {
        return formatDistanceToNow(new Date(dateNum), { addSuffix: true });
    };

    const handleToggleReadStatus = async (notification) => {
        if (!notification.read) {
            await handleMarkAsReadAndSync(notification.id);
        }
    };

    const filteredNotifications = notificationsList.filter(notification => {
        if (filter === 'unread') {
            return !notification.read;
        }
        return true;
    });

    const isReadyToDisplay = !isLoadingLocal || filteredNotifications.length > 0;

    return (
        <div className="notifications-page">
            <Sidebar />
            <div className="notification-container">
                <div className="notifications-content">
                    <div className="notifications-header">
                        <h1>Notifications</h1>
                        <div className="header-actions">
                            {isReadyToDisplay && filteredNotifications.some(n => !n.read) && (
                                <button className="mark-all-read-btn" onClick={handleMarkAllAsReadAndSync}>Mark all as read</button>
                            )}
                            {!isOnline && (
                                <span className="offline-indicator">Offline Mode</span>
                            )}
                            {isSyncing && (
                                <span className="sync-status">
                                    <FontAwesomeIcon icon={faSyncAlt} spin /> Syncing...
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="notifications-tabs">
                        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}> All </button>
                        <button className={`tab-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}> Unread </button>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {isLoadingLocal && notificationsList.length === 0 && !error ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="empty-state">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {filteredNotifications.map(notification => (
                                <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`} onClick={() => handleToggleReadStatus(notification)}>
                                    <div className="notification-icon">
                                        <FontAwesomeIcon icon={notification.data?.type === 'pomodoro_completion' ? faClock : faList} />
                                    </div>
                                    <div className="notification-content">
                                        <h3 className="notification-title">{notification.title}</h3>
                                        <p className="notification-body">{notification.body}</p>
                                        <span className="notification-time">{formatTime(notification.timestamp)}</span>
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
