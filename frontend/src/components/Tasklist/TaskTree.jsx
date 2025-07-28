import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faInfoCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
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
        return rootTasks;
    };

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(deadline);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    const renderTaskWithChildren = (task, level = 0) => {
        const isBlocked = !task.canStart && task.dependencies && task.dependencies.length > 0;
        const overdue = isOverdue(task.deadline);

        return (
            <>
                <li
                    key={`task-${task.id}`}
                    className={`task-item ${task.status === 'COMPLETED' ? 'completed-task' : ''} ${isBlocked ? 'blocked-task' : ''} ${overdue ? 'overdue-task' : ''}`}
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
                            {task.status !== 'COMPLETED' && isBlocked && <span className="blocked-badge">BLOCKED</span>}
                            {task.status !== 'COMPLETED' && overdue && (
                                <span className="overdue-badge"> <FontAwesomeIcon icon={faExclamationCircle} className="overdue-icon" />
                                    OVERDUE
                                </span>
                            )}
                        </span>
                        {task.description && (
                            <span className="task-description">{task.description}</span>
                        )}
                        <div className="task-details">
                            {task.deadline && (
                                <span className={`task-detail due-date ${overdue ? 'overdue' : ''}`}>  Due: {new Date(task.deadline).toLocaleDateString()}</span>
                            )}
                            <span className={`task-detail priority-${task.priority.toLowerCase()}`}> Priority: {task.priority}</span>
                            <span className={`task-detail status-${task.status.toLowerCase()}`}> Status: {task.status}</span>
                            {task.size && (
                                <span className={`task-detail size-${task.size.toLowerCase().replace('_', '-')}`}>
                                    Size: {task.size}
                                </span>
                            )}
                            {task.status !== 'COMPLETED' && isBlocked && (
                                <span className="task-detail blocked-dependencies">
                                    Blocked by: {task.dependencies.map(depId =>
                                        tasks.find(t => t.id === depId)?.title
                                    ).join(', ')}
                                </span>
                            )}
                            <span className="task-detail priority-score-info">
                                Priority Score: {task.priorityScore}
                                <div className="info-icon-container">
                                    <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
                                    <div className="tooltip">
                                        Calculated based on a weighted sum of priority, size, and proximity to deadline. Higher score means higher urgency.
                                    </div>
                                </div>
                            </span>
                            {task.status !== 'COMPLETED' && overdue && (
                                <div className="overdue-warning">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="warning-icon" />
                                    <span>You need to do this task now, it is overdue</span>
                                </div>
                            )}
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
