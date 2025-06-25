import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/zuno-logo.png';
import '../components/SignUp.css'

const SignIn = () => {
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
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });
        const data = await response.json();
        if (response.ok) {
            setMessage(data.message || `Welcome Back, ${data.user.firstName}!`);
            setSuccess(true);
            localStorage.setItem('token', data.token);
            setForm({ email: '', password: '' });
            navigate('/sidebar');

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
