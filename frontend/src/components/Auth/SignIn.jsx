import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/zuno-logo.png';
import './SignUp.css';
import { auth, task } from "../../utils/api"

const SignIn = ({setIsLoggedIn}) => {
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const signin = async (e) => {
        e.preventDefault();
        setMessage('');
        setSuccess(false);
        if (!form.email || !form.password) {
            setMessage('Email and password are required.');
            return;
        }
        const data = await auth.login(form.email, form.password)
        if (data.token) {
            setMessage(`Welcome Back, ${data.user.firstName}!`);
            setSuccess(true);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsLoggedIn(true);
            setForm({ email: '', password: '' });
            setTimeout(async () => {
                const overdueData = await task.getOverdue();
                if (overdueData && overdueData.count > 0) {
                    const title = "Overdue Tasks Alert";
                    const body = `You have ${overdueData.count} overdue task${overdueData.count > 1 ? 's' : ''} that need${overdueData.count === 1 ? 's' : ''} attention.`;
                    const notificationData = {
                        id: Date.now(),
                        title: title,
                        body: body,
                        data: {
                            type: 'overdue_tasks',
                            count: overdueData.count,
                            tasks: overdueData.tasks.map(t => t.id)
                        },
                        timestamp: Date.now(),
                        read: false
                    };
                    if ('indexedDB' in window) {
                        const { addNotification } = await import('../../notifications/indexedDB');
                        await addNotification(notificationData);
                    }
                    window.dispatchEvent(new CustomEvent('new-notification', {
                        detail: notificationData
                    }));
                    if ('Notification' in window) {
                        if (Notification.permission === 'granted') {
                            new Notification(title, {
                                body: body,
                                icon: '/zuno-logo.png',
                                data: notificationData.data
                            });
                        } else if (Notification.permission !== 'denied') {
                            const permission = await Notification.requestPermission();
                            if (permission === 'granted') {
                                new Notification(title, {
                                    body: body,
                                    icon: '/zuno-logo.png',
                                    data: notificationData.data
                                });
                            }
                        }
                    }
                }
            }, 1000);
            navigate('/dashboard');
        } else {
            setMessage(data.message);
        }
    }

  return (
    <div>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" width={75}/>
          <p>Zuno</p>
        </header>
        <div className="welcome-message">
            <h1>Welcome Back!</h1>
        </div>
        <div className="sign-up-container">
            <div className="sign-up">
                {message && ( <p className={`status-message ${success ? 'success' : 'error'}`}> {message}</p>)}
                <h1>Log In</h1>
                <form onSubmit={signin}>
                    <label> Email <input type="email" name="email" onChange={handleChange}/> </label>
                    <label> Password <input type="password" name="password" onChange={handleChange}/></label>
                    <button type="submit" className="signup-btn">Log In</button>
                </form>
                <p className="login-link"> Don't have an account? <Link to="/">Create an Account</Link></p>
            </div>
        </div>
    </div>

  )

}

export default SignIn;
