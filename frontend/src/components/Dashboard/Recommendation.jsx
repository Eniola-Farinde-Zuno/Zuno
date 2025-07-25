import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInMinutes, format } from 'date-fns';
import { classes } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTasks, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

const Recommendation = ({ onRecommendationFetched, setRecommendationErrorProp, recommendationErrorProp }) => {
    const navigate = useNavigate();
    const [studyRecommendation, setStudyRecommendation] = useState(null);
    const [loadingRecommendation, setLoadingRecommendation] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const countdownIntervalRef = useRef(null);
    const formatTimeRemaining = (minutes) => {
        if (minutes <= 0) return "0 minutes";
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        let parts = [];
        if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (remainingMinutes > 0) parts.push(`${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`);
        return parts.join(' and ');
    };

    const formatDeadline = (deadline) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(deadline).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString([], options);
    };
    //function to fetch study recommendation from backend
    const fetchStudyRecommendation = useCallback(async () => {
        setLoadingRecommendation(true);
        setStudyRecommendation(null);
        setRecommendationErrorProp(null);
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        try {
            const data = await classes.getRecommendation();
            setStudyRecommendation(data);
            if (onRecommendationFetched) {
                onRecommendationFetched(data);
            }
            if (data && data.suggestedTimeBlock) {
                const blockEndTime = data.suggestedTimeBlock.end;
                const [endHour, endMinute] = blockEndTime.split(':').map(Number);
                const now = new Date();
                const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0);
                const blockStartTime = data.suggestedTimeBlock.start;
                const [startHour, startMinute] = blockStartTime.split(':').map(Number);
                const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
                let initialTimeLeftMinutes;
                if (now < startDateTime) {
                    initialTimeLeftMinutes = differenceInMinutes(endDateTime, startDateTime);
                } else {
                    initialTimeLeftMinutes = differenceInMinutes(endDateTime, now);
                }
                setTimeLeft(Math.max(0, initialTimeLeftMinutes));
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
                countdownIntervalRef.current = setInterval(() => { //minute interval
                    const nowForCountdown = new Date();
                    let remainingMinutes;

                    if (nowForCountdown < startDateTime) {
                        remainingMinutes = differenceInMinutes(endDateTime, startDateTime);
                    } else {
                        remainingMinutes = differenceInMinutes(endDateTime, nowForCountdown);
                    }
                    setTimeLeft(prev => {
                        const newTimeLeft = Math.max(0, remainingMinutes);
                        if (newTimeLeft === 0 && prev > 0) {
                            clearInterval(countdownIntervalRef.current);
                            countdownIntervalRef.current = null;
                            fetchStudyRecommendation();
                        }
                        return newTimeLeft;
                    });
                }, 60 * 1000);//update every minute
            } else {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
                setTimeLeft(0);
            }
        } catch (error) {
            console.error('Error fetching study recommendation:', error);
            setRecommendationErrorProp(error.message);
            setStudyRecommendation(null);
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        } finally {
            setLoadingRecommendation(false);
        }
    }, [onRecommendationFetched, setRecommendationErrorProp]);

    useEffect(() => {
        fetchStudyRecommendation();
        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [fetchStudyRecommendation]);

    const displayCountdown = useMemo(() => {
        if (!studyRecommendation || !studyRecommendation.suggestedTimeBlock) return null;
        const now = new Date();
        const [startHour, startMinute] = studyRecommendation.suggestedTimeBlock.start.split(':').map(Number);
        const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
        if (now < startDateTime) {
            const minutesUntilStart = differenceInMinutes(startDateTime, now);
            if (minutesUntilStart <= 0) {
                return `You have ${formatTimeRemaining(timeLeft)} free on your schedule.`;
            }
            return `Free in ${formatTimeRemaining(minutesUntilStart)}.`;
        } else if (timeLeft > 0) {
            return `You have ${formatTimeRemaining(timeLeft)} free on your schedule.`;
        }
        return null;
    }, [studyRecommendation, timeLeft]);

    const handleAddToTasks = () => {
        navigate('/tasklist');
    };

    const handleStartFocus = () => {
        navigate('/pomodoro');
    };

    return (
        <section className="dashboard-section recommendation-section">
            <h2>Recommendation</h2>
            {loadingRecommendation && <p className="loading-message"> Loading...</p>}
            {recommendationErrorProp && (
                <p className="error-message"> Error: {recommendationErrorProp}</p>
            )}

            {!loadingRecommendation && !recommendationErrorProp && studyRecommendation && (
                <div className="recommendation-card">
                    {studyRecommendation.type === 'task' && (
                        <>
                            <h3><FontAwesomeIcon icon={faTasks} /> Time to Tackle: {studyRecommendation.task.title}</h3>
                            {studyRecommendation.task.description && (
                                <p className="task-description-rec">
                                    {studyRecommendation.task.description}
                                </p>
                            )}
                            <div className="task-details-rec">
                                <p>
                                    <strong>Size:</strong> <span className="task-size-rec">{studyRecommendation.task.size}</span>
                                    (Estimated {studyRecommendation.task.actualDuration} minutes)
                                </p>
                                <p>
                                    <strong>Priority:</strong> <span className={'task-priority-rec'}>{studyRecommendation.task.priority}</span>
                                </p>
                                {studyRecommendation.task.deadline && (
                                    <p> <strong>Due By:</strong> {formatDeadline(studyRecommendation.task.deadline)}</p>
                                )}
                            </div>

                            {studyRecommendation.suggestedTimeBlock && (
                                <p className="time-block-info">
                                    <FontAwesomeIcon icon={faClock} /> Available from {formatTime(studyRecommendation.suggestedTimeBlock.start)} to {formatTime(studyRecommendation.suggestedTimeBlock.end)}.
                                </p>
                            )}
                            {displayCountdown && <p className="countdown-text">{displayCountdown}</p>}
                            {studyRecommendation.nextClass && (
                                <p className="next-class-info">
                                    <FontAwesomeIcon icon={faCalendarCheck} /> Your free block ends, and your next class starts at {formatTime(studyRecommendation.nextClass)}.
                                </p>
                            )}
                            <div className="recommendation-actions">
                                <button
                                    className="action-button view-task"
                                    onClick={() => handleAddToTasks(studyRecommendation.task)}>
                                    View Task
                                </button>
                                <button
                                    className="action-button start-focus"
                                    onClick={() => handleStartFocus(studyRecommendation.task)}>
                                    Start Focus
                                </button>
                            </div>
                        </>
                    )}

                    {(studyRecommendation.type === 'no_tasks' || studyRecommendation.type === 'free_time_no_fit_task') && (
                        <>
                            <h3><FontAwesomeIcon icon={faCalendarCheck} /> Free Time Available!</h3>
                            <p>{studyRecommendation.message}</p>
                            {studyRecommendation.suggestedTimeBlock && (
                                <p className="time-block-info">
                                    <FontAwesomeIcon icon={faClock} /> Your free block is from {formatTime(studyRecommendation.suggestedTimeBlock.start)} to {formatTime(studyRecommendation.suggestedTimeBlock.end)} ({formatTimeRemaining(timeLeft)}).
                                </p>
                            )}
                            {displayCountdown && <p className="countdown-text">{displayCountdown}</p>}
                            {studyRecommendation.nextClass && (
                                <p className="next-class-info">
                                    <FontAwesomeIcon icon={faCalendarCheck} /> Your next class starts at {formatTime(studyRecommendation.nextClass)}.
                                </p>
                            )}
                        </>
                    )}

                    {studyRecommendation.type === 'no_block' && (
                        <>
                            <h3><FontAwesomeIcon icon={faClock} /> Today's Schedule is Packed!</h3>
                            {studyRecommendation.nextClass && (
                                <p className="next-class-info">
                                    <FontAwesomeIcon icon={faCalendarCheck} /> Your next class starts at {formatTime(studyRecommendation.nextClass)}.
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

export default Recommendation;
