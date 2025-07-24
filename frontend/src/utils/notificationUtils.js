import { notifications as apiNotifications } from './api';
import { openIndexedDBClient } from '../notifications/indexedDB';
export const shouldDisplayNotificationPopups = async () => {
    const notificationsDisabledInLocalStorage = localStorage.getItem('notifications_disabled') === 'true';
    if (notificationsDisabledInLocalStorage) {
        return false;
    }
    const db = await openIndexedDBClient();
    const tx = db.transaction('notification-settings', 'readonly');
    const store = tx.objectStore('notification-settings');
    const request = store.get('notification-preference');
    const preference = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });

    if (preference) {
        if (!preference.isEnabled) {
            localStorage.setItem('notifications_disabled', 'true');
        } else {
            localStorage.removeItem('notifications_disabled');
        }
        return preference.isEnabled;
    }


};


export const focusCompletion = async (duration) => {
    const title = "Focus Session Complete! 🎉";
    const body = `Great job! You've completed a ${Math.floor(duration / 60)}-minute focus session.`;
    const actions = [
        {
            action: 'restart_focus',
            title: 'Start Another Focus'
        },
        {
            action: 'start_break',
            title: 'Take a Break'
        }
    ];
    const displayPopup = await shouldDisplayNotificationPopups();
    if (Notification.permission === "granted" && displayPopup) {
        new Notification(title, {
            body: body,
            icon: '/zuno-logo.png'
        });
    }
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
    if (userId) {
        await apiNotifications.send({
            targetUserId: userId,
            title: title,
            body: body,
            data: {
                type: "pomodoro_completion",
                mode: "focus",
                actions: JSON.stringify(actions)
            }
        });
    }

};

export const breakCompletion = async (duration) => {
    const title = "Break Time Over";
    const body = `Your ${Math.floor(duration / 60)}-minute break has ended. Ready to focus again?`;
    const actions = [
        {
            action: 'start_focus',
            title: 'Start Focus Session'
        },
        {
            action: 'extend_break',
            title: 'Add 5 Minutes'
        }
    ];
    const displayPopup = await shouldDisplayNotificationPopups();
    if (Notification.permission === "granted" && displayPopup) {
        new Notification(title, {
            body: body,
        });
    }
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
    if (userId) {
        await apiNotifications.send({
            targetUserId: userId,
            title: title,
            body: body,
            data: {
                type: "pomodoro_completion",
                mode: "break",
                actions: JSON.stringify(actions)
            }
        });
    }
};

export const pomodoroAction = (action, options) => {
    const { setFocusTime, setBreakTime, setMode, setIsTimer, focusTime, breakTime, mode, SECS_IN_MIN } = options;

    switch (action) {
        case 'start_focus':
        case 'restart_focus':
            if (focusTime === 0) {
                setFocusTime(25 * SECS_IN_MIN);
            }
            setMode('focus');
            setIsTimer(true);
            break;

        case 'start_break':
            if (breakTime === 0) {
                setBreakTime(5 * SECS_IN_MIN);
            }
            setMode('break');
            setIsTimer(true);
            break;

        case 'extend_break':
            setBreakTime(prevTime => prevTime + 5 * SECS_IN_MIN);
            if (mode !== 'break') {
                setMode('break');
            }
            setIsTimer(true);
            break;

        default:
            break;
    }
};
