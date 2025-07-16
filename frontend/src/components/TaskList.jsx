import { React, useEffect, useState } from "react";
import "./TaskList.css";
import Sidebar from "./Sidebar";
import utils from "../utils/utils";
import { task } from "../utils/api";
import Modal from "./Modal";
import {TaskTree} from "./TaskTree";

const TaskList = () => {
    const { greeting, firstName } = utils();
    const [tasks, setTasks] = useState([]);
    const [edit, setEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "", priority: "", status: "", size: "" });
    const [dependencies, setDependencies] = useState(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const IN_PROGRESS = "IN_PROGRESS";
    const COMPLETED = "COMPLETED";

    const fetchTasks = async () => {
        const data = await task.all();
        setTasks(data.sort((a, b) => b.priorityScore - a.priorityScore));
    };

    useEffect(() => {
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
        setDependencies([]);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEdit(false);
        setNewTask({ title: "", description: "", deadline: "", priority: "", status: "", size: ""});
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
    const toggleCheckbox =  async (checkedTask) => {
        const newStatus = checkedTask.status === COMPLETED ? IN_PROGRESS : COMPLETED;
        const updatedData = { ...checkedTask, status: newStatus, deadline: checkedTask.deadline, dependencies: checkedTask.dependencies };
        await task.update(checkedTask.id, updatedData);
        if (newStatus === COMPLETED) {
            const dependentTasks = tasks.filter(t =>
                t.dependencies?.includes(checkedTask.id)
            );

            for (const dependentTask of dependentTasks) {
                const newDependencies = dependentTask.dependencies.filter(
                    depId => depId !== checkedTask.id
                );
                await task.update(dependentTask.id, {
                    ...dependentTask,
                    dependencies: newDependencies
                });
            }
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
            {filteredTasks.length === 0 ? (
                <p>No tasks yet. Add a new task to get started!</p>
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
