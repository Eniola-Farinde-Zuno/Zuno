import { React, useState } from "react";
import "./TaskList.css";
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import utils from "../utils/utils";

const TaskList = () => {
    const { greeting, firstName } = utils();

    return (
        <div className="task-list">
            <Sidebar />
            <div className="task-header">
                <h1> {greeting} {firstName}</h1>
                <h1>Welcome to your Tasks</h1>
            </div>
            <h1>Task List</h1>
            <ul>
                <li><input type="text" />
                    <button><FontAwesomeIcon icon={faEdit} /></button> <button><FontAwesomeIcon icon={faTrash}/></button>
                </li>
            </ul>
            <button> Add Task</button>
        </div>
    )
}

export default TaskList;
