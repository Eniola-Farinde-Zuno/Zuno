import React, { useState, useEffect } from 'react';
import './Notification.css';
import { task } from '../utils/api';

const Notification = ({ title, body, onClose, data }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleAction = async (action) => {
        if (action === 'undo' && data?.taskId) {
            await task.undoComplete(data.taskId);
            setVisible(false);
            setTimeout(onClose, 300);
            if (window.location.pathname.includes('tasklist')) {
                window.dispatchEvent(new CustomEvent('refresh-tasks'));
            }
        } else if (data?.type === 'pomodoro_completion') {
            switch (action) {
                case 'restart_focus':
                case 'start_focus':
                    window.dispatchEvent(new CustomEvent('pomodoro-action', {
                        detail: { action: 'start_focus' }
                    }));
                    break;
                case 'start_break':
                    window.dispatchEvent(new CustomEvent('pomodoro-action', {
                        detail: { action: 'start_break' }
                    }));
                    break;
                case 'extend_break':
                    window.dispatchEvent(new CustomEvent('pomodoro-action', {
                        detail: { action: 'extend_break' }
                    }));
                    break;
                default:
                    break;
            }
            if (!window.location.pathname.includes('pomodoro')) {
                window.location.href = '/pomodoro';
            }
            setVisible(false);
            setTimeout(onClose, 300);
        }
    };
    const actions = data?.actions ? JSON.parse(data.actions) : [];

    return (
        <div className={`notification ${visible ? 'visible' : 'hidden'}`}>
            <div className="notification-header">
                <h3>{title}</h3>
                <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>×</button>
            </div>
            <div className="notification-body">
                <p>{body}</p>
                {actions.length > 0 && (
                    <div className="notification-actions">
                        {actions.map((action, index) => (
                            <button key={index} className="action-button" onClick={() => handleAction(action.action)}>
                                {action.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notification;
