import { React, useEffect, useState } from "react";
import "./TaskList.css";
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import utils from "../utils/utils";
import { task } from "../utils/api";

const TaskList = () => {
    const { greeting, firstName } = utils();
    const [tasks, setTasks] = useState([]);
    const [edit, setEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "", priority: "", status: "", size: "" });

    useEffect(() => {
        const fetchTasks = async () => {
            const data = await task.all();
            setTasks(data);
        };
        fetchTasks();
    }, []);
    const handleInput = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const openModal = () => {
        setIsModalOpen(true);
        setEdit(false);
        setNewTask({ title: "", description: "", deadline: "", priority: "", status: "", size: ""});
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEdit(false);
        setNewTask({ title: "", description: "", deadline: "", priority: "", status: "", size: ""});
    };
    const addTask = async (e) => {
        e.preventDefault();
        let formattedDeadline = null;
        if (newTask.deadline) {
            formattedDeadline = new Date(`${newTask.deadline}T00:00:00.000Z`).toISOString();
        }
        const taskData = {
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            deadline: formattedDeadline,
            status: newTask.status || "IN_PROGRESS",
            size: newTask.size
        };
        const addedTask = await task.add(taskData);
        setTasks(prevTasks => {
            const updated = [...prevTasks, addedTask];
            return updated.sort((a, b) => b.priorityScore - a.priorityScore);
        });
        closeModal();
    };
    const startEdit = (task) => {
        setEdit(true);
        setIsModalOpen(true);
        setNewTask({ ...task, deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "", priority: task.priority, status: task.status, size: task.size });
    };
    const updateTask = async (e) => {
        e.preventDefault();
        let formattedDeadline = null;
        if (newTask.deadline) {
            formattedDeadline = new Date(`${newTask.deadline}T00:00:00.000Z`).toISOString();
        }
        const taskData = {
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            deadline: formattedDeadline,
            status: newTask.status,
            size: newTask.size
        };
        const response = await task.update(newTask.id, taskData)
        const taskUpdated = response.updatedTask;
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskUpdated.id ? taskUpdated : task
            )
        );
        closeModal();
    };
    const deleteTask = async (id) => {
        const response = await task.delete(id)
        await response.json;
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    };
    const toggleCheckbox =  async (checkedTask) => {
        const newStatus = checkedTask.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
        const updatedData = { ...checkedTask, status: newStatus, deadline: checkedTask.deadline};
        const responseData = await task.update(checkedTask.id, updatedData);
        const taskUpdated = responseData.updatedTask;
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskUpdated.id ? taskUpdated : task
            )
        );
    }

    return (
        <div className="task-list">
            <Sidebar />
            <div className="task-header">
                <h1> {greeting} {firstName}</h1>
                <h1>Welcome to your Tasks</h1>
            </div>
            <h1>Task List</h1>
            {tasks.length === 0 ? (
                <p>No tasks yet. Add a new task to get started!</p>
            ) : (
                <ul className="tasks-ul">
                    {tasks.map((task) => (
                        <li key={`task-${task.id}`} className={`task-item ${task.status === 'COMPLETED' ? 'completed-task' : ''}`}>
                            <input type="checkbox" checked={task.status === 'COMPLETED'} onChange={() => toggleCheckbox(task)} className="task-checkbox"/>
                            <div className="task-content">
                                <span className="task-title">{task.title}</span>
                                {task.description && <span className="task-description">{task.description}</span>}
                                <div className="task-details">
                                    {task.deadline && (
                                        <span className="task-detail">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                    )}
                                    <span className="task-detail">Priority: {task.priority}</span>
                                    <span className="task-detail">Status: {task.status}</span>
                                    <span className="task-detail">Size: {task.size}</span>
                                    <span className="task-detail">Priority Score: {task.priorityScore}</span>
                                </div>

                            </div>
                            <div className="task-actions">
                                <button className="edit-btn" onClick={() => startEdit(task)}><FontAwesomeIcon icon={faEdit} /></button>
                                <button className="delete-btn" onClick={() => deleteTask(task.id)}><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={openModal}> Add Task</button>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{edit ? "Edit Task" : "Add New Task"}</h2>
                        <form onSubmit={edit? updateTask : addTask}>
                            <label>
                                Title:
                                <input type="text" name="title" value={newTask.title} onChange={handleInput} required/>
                            </label>
                            <label>
                                Description:
                                <textarea name="description" value={newTask.description} onChange={handleInput}></textarea>
                            </label>
                            <label>
                                Due Date:
                                <input type="date" name="deadline" value={newTask.deadline} onChange={handleInput}/>
                            </label>
                            <label>
                                Priority:
                                <select name="priority" value={newTask.priority} onChange={handleInput}>
                                    <option value="">Select Priority</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </label>
                            <label>
                                Status:
                                <select name="status" value={newTask.status} onChange={handleInput}>
                                    <option value="">Select Status</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="CLOSED">Closed</option>
                                    <option value="BLOCKED">Blocked</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </label>
                            <label>
                                Size:
                                <select name="size" value={newTask.size} onChange={handleInput}>
                                    <option value="NONE">Select Size</option>
                                    <option value="EXTRA_SMALL">XS</option>
                                    <option value="SMALL">S</option>
                                    <option value="MEDIUM">M</option>
                                    <option value="LARGE">L</option>
                                </select>
                            </label>
                            <button type="submit">{edit ? "Update Task" : "Add Task"}</button>
                            <button type="button" onClick={closeModal}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TaskList;
