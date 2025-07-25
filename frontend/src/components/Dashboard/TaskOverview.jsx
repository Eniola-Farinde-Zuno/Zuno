import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const TaskOverviewSection = ({ tasksDue, overdueTasks }) => {
    const navigate = useNavigate();
    const formatDeadline = (deadline) => {
        if (!deadline) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(deadline).toLocaleDateString(undefined, options);
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'priority-high';
            case 'MEDIUM': return 'priority-medium';
            case 'LOW': return 'priority-low';
            default: return 'priority-none';
        }
    };
    const handleTaskClick = () => {
        navigate('/tasklist');
    };

    return (
        <section className='task-section'>
            <h2>Tasks Overview </h2>
            <div className="task-category">
                <h3><FontAwesomeIcon icon={faTasks} /> Due Today ({tasksDue.length})</h3>
                {tasksDue.length > 0 ? (
                    <ul className="task-list">
                        {tasksDue.map(task => (
                            <li key={task.id} className="task-items clickable" onClick={() => handleTaskClick(task.id)}>
                                <h4>{task.title}</h4>
                                {task.description && <p className="task-description">{task.description}</p>}
                                <div className="task-details-footer">
                                    <span className={`task-priority ${getPriorityColor(task.priority)}`}> Priority: {task.priority}</span>
                                    <span className="task-size">{task.size}</span>
                                    <span className='task-status'>{task.status}</span>
                                    <span className="task-deadline"> Due: {formatDeadline(task.deadline)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-tasks">No tasks due today</p>
                )}
            </div>
            <div className="task-category">
                <h3><FontAwesomeIcon icon={faExclamationTriangle} /> Overdue ({overdueTasks.length})</h3>
                {overdueTasks.length > 0 ? (
                    <ul className="task-list">
                        {overdueTasks.map(task => (
                            <li key={task.id} className="task-items overdue clickable" onClick={() => handleTaskClick(task.id)}>
                                <h4>{task.title}</h4>
                                {task.description && <p className="task-description">{task.description}</p>}
                                <div className="task-details-footer">
                                    <span className={`task-priority ${getPriorityColor(task.priority)}`}> Priority: {task.priority}</span>
                                    <span className="task-size">{task.size}</span>
                                    <span className='task-status'>
                                        {task.status}
                                    </span>
                                    <span className="task-deadline">
                                        Was due: {formatDeadline(task.deadline)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-tasks">No overdue tasks</p>
                )}
            </div>
        </section>
    );
};

export default TaskOverviewSection;
