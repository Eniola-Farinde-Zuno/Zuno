import React from "react";
import logo from '../assets/zuno-logo.png';
import '../components/SignUp.css'

const SignIn = () => {
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
                <h1>Log In</h1>
                <form>
                    <label> Email <input type="email" name="email"/> </label>
                    <label> Password <input type="password" name="password"/></label>
                    <button type="submit" className="signup-btn">Log In</button>
                </form>
                <p className="login-link"> Don't have an account? <a href="/">Create an Account</a>
                </p>
                <div className="divider">or</div>
                <button className="google-btn">
                    Continue with Google
                </button>
            </div>
        </div>
    </div>

  )

}

export default SignIn;
