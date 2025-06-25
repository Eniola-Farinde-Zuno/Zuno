import React, {useState} from "react";
import {Link} from "react-router-dom";
import logo from "../assets/zuno-logo.png";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar__logo">
                <img src= {logo} alt="logo" />
            </div>
            <div>
                <Link to="/"><h1>Home</h1></Link>
                <Link to="/pomodoro"><h1>Pomodoro</h1></Link>
            </div>

        </div>
    )
}
export default Sidebar;
