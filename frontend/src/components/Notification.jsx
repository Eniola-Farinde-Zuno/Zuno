import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ title, body, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification ${visible ? 'visible' : 'hidden'}`}>
            <div className="notification-header">
                <h3>{title}</h3>
                <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>×</button>
            </div>
            <div className="notification-body">
                <p>{body}</p>
            </div>
        </div>
    );
};

export default Notification;
