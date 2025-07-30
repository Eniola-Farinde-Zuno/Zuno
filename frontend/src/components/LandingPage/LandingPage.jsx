import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import task from '../../assets/task.png';
import schedule from '../../assets/schedule.png';
import pomodoro from '../../assets/pomodoro.png';
import logo from '../../assets/zuno-logo.png';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Zuno Logo" />
          <span>Zuno</span>
        </div>
        <div className="auth-buttons">
          <Link to="/signin">
            <button className="login-btn">Login</button>
          </Link>
          <Link to="/signup">
            <button className="signup-btn1">Sign Up</button>
          </Link>
        </div>
      </header>
      <section className="hero-section">
        <h1>Welcome to Zuno</h1>
        <p>Your all-in-one study app — plan smarter, stay focused, and get things done.</p>
        <Link to="/signup">
          <button className="signup-btn">Get Started</button>
        </Link>
      </section>
      <section className="section section-blue">
        <div className="text-block">
          <h2>Visualize Your Semester</h2>
          <p>
            Easily map out your weekly class schedule with our drag-and-drop calendar.
            Avoid time clashes, manage recurring lectures, and stay on top of your
            commitments without stress.
          </p>
        </div>
        <img src={schedule} alt="Class Schedule" className="mockup-img" />
      </section>
      <section className="section section-pink">
        <img src={task} alt="Task List" className="mockup-img" />
        <div className="text-block">
          <h2>Master Your To-Do List</h2>
          <p>
            Sort tasks by urgency and importance with color-coded priorities.
            Whether it's an assignment, group project, or daily reminder —
            Zuno helps you focus on what truly matters and keeps distractions at bay.
          </p>
        </div>
      </section>
      <section className="section section-white">
        <div className="text-block">
          <h2>Stay Focused, Work Smarter</h2>
          <p>
            Break down your study time into focused sprints with Pomodoro sessions.
            Keep track of how long you’ve worked, when to take breaks, and build
            a healthy productivity rhythm backed by cognitive science.
          </p>
        </div>
        <img src={pomodoro} alt="Pomodoro Timer" className="mockup-img" />
      </section>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Zuno.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
