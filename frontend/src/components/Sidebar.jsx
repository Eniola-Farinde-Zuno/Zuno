import React, {useState} from "react";
import {Link} from "react-router-dom";
import logo from "../assets/zuno-sidebar-logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import "./Sidebar.css"

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-content">
                <button className="sidebar-toggle-button"> <FontAwesomeIcon icon={faBars} /></button>
                <div className="sidebar-logo">
                    <img src= {logo} alt="logo" width={75} />
                    <h2>Zuno</h2>
                </div>
                <div className="sidebar-nav">
                <ul>
                    <li><Link to="/" className="sidebar-nav-item"><h1>Home</h1></Link></li>
                    <li><Link to="/pomodoro" className="sidebar-nav-item"><h1>Pomodoro</h1></Link></li>
                </ul>

            </div>
            </div>


        </div>
    )
}
export default Sidebar;
