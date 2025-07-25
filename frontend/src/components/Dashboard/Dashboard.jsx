import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { task, classes } from '../../utils/api';
import Sidebar from '../Sidebar';
import utils from '../../utils/utils';
import Recommendation from './Recommendation';
import TaskOverviewSection from './TaskOverview';
import ClassScheduleSection from './ClassSchedule';

const Dashboard = () => {
    const navigate = useNavigate();
    const [tasksDue, setTasksDue] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [classSchedule, setClassSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const { greeting, firstName } = utils();
    const COMPLETED = 'COMPLETED';
    const BLOCKED = 'BLOCKED';
    const [recommendationError, setRecommendationError] = useState(null);
    const LOADING_TIME = 500;

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
            setUserId(user.id);
        }
    }, []);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const [tasksData, classesData] = await Promise.all([
                task.all(),
                classes.getAll(),
                new Promise(resolve => setTimeout(resolve, LOADING_TIME))
            ]);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueToday = tasksData.filter(taskItem => {
                if (taskItem.status === COMPLETED || taskItem.status === BLOCKED) {
                    return false;
                }
                const taskDeadline = new Date(taskItem.deadline);
                taskDeadline.setHours(0, 0, 0, 0);
                const isDueToday = taskDeadline.getTime() === today.getTime();
                return isDueToday;
            });

            const overdue = tasksData.filter(taskItem => {
                if (taskItem.status === COMPLETED || taskItem.status === BLOCKED) {
                    return false;
                }
                const taskDeadline = new Date(taskItem.deadline);
                taskDeadline.setHours(0, 0, 0, 0);
                const isOverdue = taskDeadline.getTime() < today.getTime();
                return isOverdue;
            });
            setTasksDue(dueToday);
            setOverdueTasks(overdue);
            setClassSchedule(classesData || []);

        } catch (error) {
            setRecommendationError(error.message);
        } finally {
            setLoading(false);
        }
    }, [userId, COMPLETED, BLOCKED, LOADING_TIME]);

    useEffect(() => {
        if (userId) {
            fetchDashboardData();
        }
    }, [userId, fetchDashboardData]);

    return (
        <div className="dashboard-page">
            <Sidebar />
            {loading ? (
                <div className='loading-state'>
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="dashboard-main-content">
                    <header className="dashboard-header">
                        <h1> {greeting} {firstName}</h1>
                        <p>Here's what's happening with your tasks and classes today.</p>
                    </header>
                    <div className="dashboard-grid">
                        <ClassScheduleSection
                            classSchedule={classSchedule}
                            fetchDashboardData={fetchDashboardData}
                        />

                        <div className="right-column-container">
                            <Recommendation
                                onRecommendationFetched={(data) => { data }}
                                recommendationErrorProp={recommendationError}
                                setRecommendationErrorProp={setRecommendationError}
                            />

                            <TaskOverviewSection
                            tasksDue={tasksDue}
                            overdueTasks={overdueTasks}
                        />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard;
