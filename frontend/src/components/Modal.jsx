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
                <form onSubmit={onSubmit}>
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
                        <select name="priority" value={newTask.priority} onChange={handleInput} required>
                            <option value="">Select Priority</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </label>
                    <label>
                        Status:
                        <select name="status" value={newTask.status} onChange={handleInput} required>
                            <option value="NONE">Select Status</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="CLOSED">Closed</option>
                            <option value="BLOCKED">Blocked</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </label>
                    <label>
                        Size:
                        <select name="size" value={newTask.size} onChange={handleInput} required>
                            <option value="NONE">Select Size</option>
                            <option value="EXTRA_SMALL">XS</option>
                            <option value="SMALL">S</option>
                            <option value="MEDIUM">M</option>
                            <option value="LARGE">L</option>
                        </select>
                    </label>
                    <label>
                        Dependent on Tasks:
                        <select name="dependencies" value={dependencies.map(String)} onChange={handleDependency} className="dependency-select">
                            <option value="">Select Tasks</option>
                            {tasks
                                .filter(t => t.id !== newTask.id && t.status !== 'COMPLETED')
                                .map((taskOption) => (
                                    <option key={`dep-option-${taskOption.id}`} value={taskOption.id}>
                                        {taskOption.title}
                                    </option>
                                ))}
                        </select>
                    </label>
                    <button type="submit">{edit ? "Update Task" : "Add Task"}</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default Modal;
