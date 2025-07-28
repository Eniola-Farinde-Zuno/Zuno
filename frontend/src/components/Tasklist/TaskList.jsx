import { React, useEffect, useState } from "react";
import "./TaskList.css";
import Sidebar from "../Sidebar/Sidebar";
import utils from "../../utils/utils";
import { task } from "../../utils/api";
import Modal from "../Modal/Modal";
import { TaskTree } from "./TaskTree";

const TaskList = () => {
    const { greeting, firstName } = utils();
    const [tasks, setTasks] = useState([]);
    const [edit, setEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "", priority: "", status: "", size: "" });
    const [dependencies, setDependencies] = useState(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const IN_PROGRESS = "IN_PROGRESS";
    const COMPLETED = "COMPLETED";
    const LOADING_TIME = 500;

    const fetchTasks = async () => {
        setIsLoading(true);
        const [data] = await Promise.all([
            task.all(),
            new Promise(resolve => setTimeout(resolve, LOADING_TIME))
        ]);
        setTasks(data.sort((a, b) => b.priorityScore - a.priorityScore));
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTasks();
        const handleRefreshTasks = () => {
            fetchTasks();
        };
        window.addEventListener('refresh-tasks', handleRefreshTasks);
        return () => {
            window.removeEventListener('refresh-tasks', handleRefreshTasks);
        };
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
        setNewTask({ title: "", description: "", deadline: "", priority: "", status: "", size: "" });
        setDependencies([]);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEdit(false);
        setNewTask({ title: "", description: "", deadline: "", priority: "", status: "", size: "" });
        setDependencies([]);
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
            status: newTask.status || IN_PROGRESS,
            size: newTask.size,
            dependencies: dependencies
        };
        await task.add(taskData);
        await fetchTasks();
        closeModal();
    };
    const startEdit = (task) => {
        setEdit(true);
        setIsModalOpen(true);
        setNewTask({ ...task, deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "", priority: task.priority, status: task.status, size: task.size });
        setDependencies(task.dependencies || []);
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
            size: newTask.size,
            dependencies: dependencies
        };
        await task.update(newTask.id, taskData)
        await fetchTasks();
        closeModal();
    };
    const deleteTask = async (id) => {
        await task.delete(id)
        await fetchTasks();
    };
    const filteredTasks = tasks.filter(task => showCompleted ? task.status === COMPLETED : task.status !== COMPLETED);
    const toggleCheckbox = async (checkedTask) => {
        if (checkedTask.status !== COMPLETED) {
            await task.complete(checkedTask.id);
        } else {
            const updatedData = {
                title: checkedTask.title,
                description: checkedTask.description || "",
                priority: checkedTask.priority,
                status: IN_PROGRESS,
                deadline: checkedTask.deadline,
                size: checkedTask.size || "NONE",
                dependencies: checkedTask.dependencies || []
            };
            await task.update(checkedTask.id, updatedData);
        }
        await fetchTasks();
    }
    const handleDependency = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setDependencies(selectedValues);
    }

    return (
        <div className="task-list">
            <Sidebar />
            <div className="task-header">
                <h1> {greeting} {firstName}</h1>
            </div>
            <div className="task-controls">
                <h1>{showCompleted ? 'Completed Tasks' : 'Task List'}</h1>
                <button onClick={() => setShowCompleted(!showCompleted)}>{showCompleted ? 'Show active tasks' : 'Show completed tasks'}</button>
            </div>
            {isLoading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading tasks...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                    <p>{showCompleted ? 'No completed tasks yet' : 'No tasks yet. Add a new task to get started!'}</p>
                </div>
            ) : (
                <TaskTree
                    tasks={filteredTasks}
                    onToggleCheckbox={toggleCheckbox}
                    onEditTask={startEdit}
                    onDeleteTask={deleteTask}
                />
            )}
            <button onClick={openModal} className="add-task"> + Add Task</button>
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                edit={edit}
                newTask={newTask}
                handleInput={handleInput}
                handleDependency={handleDependency}
                dependencies={dependencies}
                tasks={tasks}
                onSubmit={edit ? updateTask : addTask}
            />
        </div>
    )
}

export default TaskList;
