import React, { useState } from "react";
import { Link, Navigate} from "react-router-dom";
import logo from "../assets/zuno-sidebar-logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faHouse, faClockRotateLeft, faArrowRightFromBracket, faBell } from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);

    const toggle = () => {
        if (isOpen) {
            setIsMinimized(true);
            setIsOpen(false);
        } else {
            setIsMinimized(false);
            setIsOpen(true);
        }
    };
    const closeSidebar = () => {
        setIsMinimized(false);
        setIsOpen(false);
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Navigate('/signin');
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
            <div className="sidebar-content">
                <button className="sidebar-toggle-button" onClick={toggle}><FontAwesomeIcon icon={isOpen ? faTimes : faBars} /></button>
                {isOpen && (
                    <div className="sidebar-expanded-content">
                        <div className="sidebar-logo">
                            <img src={logo} alt="logo" width={75} />
                            <h2>Zuno</h2>
                        </div>
                        <div className="sidebar-nav">
                            <ul>
                                <li>
                                    <Link to="/tasklist" className="sidebar-nav-item" onClick={closeSidebar}>
                                        <h1><FontAwesomeIcon icon={faHouse} /> Home</h1>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pomodoro" className="sidebar-nav-item" onClick={closeSidebar}>
                                        <h1><FontAwesomeIcon icon={faClockRotateLeft} /> Pomodoro</h1>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/notifications" className="sidebar-nav-item" onClick={closeSidebar}>
                                        <h1><FontAwesomeIcon icon={faBell} /> Notifications</h1>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/signin" className="sidebar-nav-item-logout" onClick={logout}>
                                        <h1><FontAwesomeIcon icon={faArrowRightFromBracket} /> Log Out</h1>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
                {isMinimized && (
                    <div className="sidebar-minimized-content">
                        <ul>
                            <li>
                                <Link to="/tasklist" className="sidebar-nav-item" onClick={closeSidebar}>
                                    <FontAwesomeIcon icon={faHouse} />
                                </Link>
                            </li>
                            <li>
                                <Link to="/pomodoro" className="sidebar-nav-item" onClick={closeSidebar}>
                                    <FontAwesomeIcon icon={faClockRotateLeft} />
                                </Link>
                            </li>
                            <li>
                                <Link to="/notifications" className="sidebar-nav-item" onClick={closeSidebar}>
                                    <FontAwesomeIcon icon={faBell} />
                                </Link>
                            </li>
                            <li>
                                <Link to="/signin" className="sidebar-nav-item-logout" onClick={logout}>
                                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
