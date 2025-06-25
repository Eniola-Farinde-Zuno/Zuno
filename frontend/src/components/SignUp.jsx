import React, { useState } from "react";
import logo from '../assets/zuno-logo.png';
import '../components/SignUp.css'
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [form , setForm] = useState({ firstName: '', lastName: '', email: '', password: ''});
    const [message, setMessage] = useState('')
    const navigate = useNavigate();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const signup = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });
        const data = await response.json();
        if (response.ok) {
            setMessage(`Welcome, ${data.user.firstName}!`);
            navigate("/signin");
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
            <h1>Welcome to Zuno</h1>
            <h2>Let's get Started!</h2>
        </div>
        <div className="sign-up-container">
            <div className="sign-up">
            {message && <p className="welcome">{message}</p>}
                <h1>Create An Account</h1>
                <form onSubmit={signup}>
                    <label> First Name <input type="text" name="firstName" onChange={handleChange}/> </label>
                    <label> Last Name <input type="text" name="lastName" onChange={handleChange}/> </label>
                    <label> Email <input type="email" name="email" onChange={handleChange}/> </label>
                    <label> Password <input type="password" name="password" onChange={handleChange}/></label>
                    <button type="submit" className="signup-btn">Create Account</button>
                </form>
                <p className="login-link"> Already have an account? <Link to="/signin">Log In</Link></p>

            </div>
        </div>
    </div>

  )

}

export default SignUp;
