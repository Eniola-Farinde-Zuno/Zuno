import { React, useState } from 'react';
import './Modal.css'

const Modal = ({
    isOpen,
    onClose,
    edit,
    newTask,
    handleInput,
    handleDependency,
    dependencies,
    tasks,
    onSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>{edit ? "Edit Task" : "Add New Task"}</h2>
                <form onSubmit={onSubmit} className="task-form">
                    <input type="text" name="title" value={newTask.title} onChange={handleInput} className="task-name" placeholder= "Task Name" required/>
                    <textarea name="description" value={newTask.description} onChange={handleInput} className="description" placeholder= "Description"></textarea>
                    <div className="modal-options">
                        <div className="date">
                            <span>Due Date</span>
                            <input type="date" name="deadline" value={newTask.deadline} onChange={handleInput} className="date-input"/>
                        </div>
                        <div className="custom-select">
                            <select name="priority" value={newTask.priority} onChange={handleInput} className="modal-select" required>
                                <option value="">Select Priority</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                            <span className="custom-select-arrow"></span>
                        </div>
                        <div className="custom-select">
                            <select name="status" value={newTask.status} onChange={handleInput} className="modal-select" required>
                                <option value="NONE">Select Status</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="CLOSED">Closed</option>
                                <option value="BLOCKED">Blocked</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                            <span className="custom-select-arrow"></span>
                        </div>
                        <div className="custom-select">
                            <select name="size" value={newTask.size} onChange={handleInput} className="modal-select" required>
                                <option value="NONE">Select Size</option>
                                <option value="EXTRA_SMALL">XS</option>
                                <option value="SMALL">S</option>
                                <option value="MEDIUM">M</option>
                                <option value="LARGE">L</option>
                            </select>
                            <span className="custom-select-arrow"></span>
                        </div>
                        <div className="custom-select">
                            <select name="dependencies" value={dependencies.map(String)} onChange={handleDependency} className="modal-select">
                                <option value="">Dependent On:</option>
                                {tasks
                                    .filter(t => t.id !== newTask.id && t.status !== "COMPLETED")
                                    .map((taskOption) => (
                                        <option key={`dep-option-${taskOption.id}`} value={taskOption.id}>
                                            {taskOption.title}
                                        </option>
                                    ))}
                            </select>
                            <span className="custom-select-arrow"></span>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="add-task-button">
                                {edit ? "Update Task" : "Add Task"}
                            </button>
                            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
