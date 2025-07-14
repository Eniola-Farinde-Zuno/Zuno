import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./TaskList.css";

export const TaskTree = ({ tasks, onToggleCheckbox, onEditTask, onDeleteTask }) => {
    const groupTasksByDependency = (tasks) => {
        const taskMap = {};
        const rootTasks = [];
        //creating a map of all tasks
        tasks.forEach(task => {
            taskMap[task.id] = {
                ...task,
                children: []
            };
        });
        //building the hierarchy
        tasks.forEach(task => {
            if (task.dependencies && task.dependencies.length > 0) {
                task.dependencies.forEach(depId => {
                    if (taskMap[depId]) {
                        taskMap[depId].children.push(taskMap[task.id]);
                    }
                });
            } else {
                rootTasks.push(taskMap[task.id]);
            }
        });

        //sorting root tasks by priority score
        rootTasks.sort((a, b) => b.priorityScore - a.priorityScore);

        //sorting children of each task
        Object.values(taskMap).forEach(task => {
            task.children.sort((a, b) => b.priorityScore - a.priorityScore);
        });
        return rootTasks;
    };

    const renderTaskWithChildren = (task, level = 0) => {
        const isBlocked = !task.canStart && task.dependencies && task.dependencies.length > 0;

        return (
            <>
                <li
                    key={`task-${task.id}`}
                    className={`task-item ${task.status === 'COMPLETED' ? 'completed-task' : ''} ${isBlocked ? 'blocked-task' : ''}`}
                    style={{
                        marginLeft: `${level * 50}px`,
                        borderLeft: level > 0 ? '3px solid #e0e0e0' : 'none'
                    }}
                >
                    <input
                        type="checkbox"
                        checked={task.status === 'COMPLETED'}
                        onChange={() => onToggleCheckbox(task)}
                        className="task-checkbox"
                        disabled={isBlocked}
                    />
                    <div className="task-content">
                        <span className="task-title">
                            {task.title}
                            {isBlocked && <span className="blocked-badge">BLOCKED</span>}
                        </span>
                        {task.description && (
                            <span className="task-description">{task.description}</span>
                        )}
                        <div className="task-details">
                            {task.deadline && (
                                <span className="task-detail"> Due: {new Date(task.deadline).toLocaleDateString()}</span>
                            )}
                            <span className="task-detail">Priority: {task.priority}</span>
                            <span className="task-detail">Status: {task.status}</span>
                            {isBlocked && (
                                <span className="task-detail blocked-dependencies">
                                    Blocked by: {task.dependencies.map(depId => tasks.find(t => t.id === depId) ?.title).join(', ')}
                                </span>
                            )}
                            <span className="task-detail"> Priority Score: {task.priorityScore}</span>
                        </div>
                    </div>
                    <div className="task-actions">
                        <button className="edit-btn" onClick={() => onEditTask(task)}> <FontAwesomeIcon icon={faEdit}/></button>
                        <button className="delete-btn" onClick={() => onDeleteTask(task.id)}> <FontAwesomeIcon icon={faTrash}/></button>
                    </div>
                </li>
                {task.children.map(child => renderTaskWithChildren(child, level + 1))}
            </>
        );
    };
    const groupedTasks = groupTasksByDependency(tasks);

    return (
        <ul className="tasks-ul">
            {groupedTasks.map(task => renderTaskWithChildren(task))}
        </ul>
    );
};
