import React, { useState, useMemo, useCallback } from 'react';
import AddClassModal from './AddClassModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { classes } from '../../utils/api';

const ClassScheduleSection = ({ classSchedule, fetchDashboardData }) => {
    const [newClassName, setNewClassName] = useState('');
    const [newClassDays, setNewClassDays] = useState([]);
    const [newClassStartTime, setNewClassStartTime] = useState('');
    const [newClassEndTime, setNewClassEndTime] = useState('');
    const [newClassTopics, setNewClassTopics] = useState('');
    const [newClassDifficulty, setNewClassDifficulty] = useState('MEDIUM');
    const [formMessage, setFormMessage] = useState({ text: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const ALL_DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const TIME_SLOT_INTERVAL_MINUTES = 60; //an hour time slot
    const CALENDAR_START_HOUR = 8;  // 8am
    const CALENDAR_END_HOUR = 17; // 5pm

    const generateTimeSlots = (startHour, endHour, intervalMinutes) => {
        const slots = [];
        let currentHour = startHour;
        let currentMinute = 0;
        while (currentHour <= endHour) {
            const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            slots.push(timeString);
            currentMinute += intervalMinutes;
            if (currentMinute >= 60) {
                currentMinute -= 60;
                currentHour++;
            }
        }
        return slots;
    };
    const CALENDAR_TIME_SLOTS = useMemo(() => generateTimeSlots(CALENDAR_START_HOUR, CALENDAR_END_HOUR, TIME_SLOT_INTERVAL_MINUTES), []);
    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString([], options);
    };
    const handleDayChange = (day) => {
        setNewClassDays(prevDays =>
            prevDays.includes(day)
                ? prevDays.filter(d => d !== day)
                : [...prevDays, day].sort((a, b) => ALL_DAYS_OF_WEEK.indexOf(a) - ALL_DAYS_OF_WEEK.indexOf(b))
        );
    };

    const handleAddClassSubmit = async (e) => {
        e.preventDefault();
        setFormMessage({ text: '', type: '' });
        if (!newClassName || newClassDays.length === 0 || !newClassStartTime || !newClassEndTime) {
            return;
        }
        if (newClassStartTime >= newClassEndTime) {
            return;
        }

        const classData = {
            name: newClassName,
            days: newClassDays,
            startTime: newClassStartTime,
            endTime: newClassEndTime,
            topics: newClassTopics.split(',').map(topic => topic.trim()).filter(topic => topic !== ''),
            difficulty: newClassDifficulty,
        };
        await classes.add(classData);
        setFormMessage({ text: 'Class added successfully!', type: 'success' });
        setNewClassName('');
        setNewClassDays([]);
        setNewClassStartTime('');
        setNewClassEndTime('');
        setNewClassTopics('');
        setNewClassDifficulty('MEDIUM');
        fetchDashboardData();
        setIsModalOpen(false);

    };

    const buildCalendarGrid = useCallback(() => {
        const grid = CALENDAR_TIME_SLOTS.map(() => Array(ALL_DAYS_OF_WEEK.length).fill(null));
        classSchedule.forEach(cls => {
            const [classStartHour, classStartMinute] = cls.startTime.split(':').map(Number);
            const [classEndHour, classEndMinute] = cls.endTime.split(':').map(Number);
            const classDurationMinutes = (classEndHour * 60 + classEndMinute) - (classStartHour * 60 + classStartMinute);
            const rowSpan = Math.ceil(classDurationMinutes / TIME_SLOT_INTERVAL_MINUTES);

            cls.days.forEach(dayName => {
                const dayIndex = ALL_DAYS_OF_WEEK.indexOf(dayName);
                if (dayIndex === -1) return;
                let startIndex = CALENDAR_TIME_SLOTS.findIndex(slot => {
                    const [slotHour, slotMinute] = slot.split(':').map(Number);
                    const classStartTimeInMins = classStartHour * 60 + classStartMinute;
                    const slotStartInMins = slotHour * 60 + slotMinute;
                    const slotEndInMins = slotStartInMins + TIME_SLOT_INTERVAL_MINUTES;
                    return classStartTimeInMins >= slotStartInMins && classStartTimeInMins < slotEndInMins;
                });
                //if there is class time conflict
                if (grid[startIndex] && grid[startIndex][dayIndex] && grid[startIndex][dayIndex].isStart) {
                    setFormMessage({ text: 'Class time conflict!', type: 'error' });
                    return;
                }

                if (grid[startIndex]) {
                    grid[startIndex][dayIndex] = {
                        class: cls,
                        rowSpan: Math.max(1, rowSpan),
                        isStart: true
                    };

                    for (let i = 1; i < rowSpan; i++) {
                        if (startIndex + i < CALENDAR_TIME_SLOTS.length) {
                            if (!grid[startIndex + i][dayIndex] || !grid[startIndex + i][dayIndex].isStart) {
                                grid[startIndex + i][dayIndex] = { isCovered: true };
                            }
                        }
                    }
                }
            });
        });
        return grid;
    }, [classSchedule, CALENDAR_TIME_SLOTS, ALL_DAYS_OF_WEEK]);

    const calendarGrid = useMemo(() => buildCalendarGrid(), [buildCalendarGrid]);

    return (
        <section className='schedule'>
            <h2><FontAwesomeIcon icon={faCalendarAlt} /> Your Class Schedule </h2>
            {classSchedule.length > 0 ? (
                <div className="calendar-container">
                    <table className="class-calendar-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                {ALL_DAYS_OF_WEEK.map(day => (
                                    <th key={day}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {CALENDAR_TIME_SLOTS.map((timeSlot, timeIndex) => (
                                <tr key={timeSlot}>
                                    <td className="time-label">{formatTime(timeSlot)}</td>
                                    {ALL_DAYS_OF_WEEK.map((day, dayIndex) => {
                                        const cellContent = calendarGrid[timeIndex][dayIndex];

                                        if (cellContent && cellContent.isCovered) {
                                            return null;
                                        } else if (cellContent && cellContent.isStart) {
                                            const cls = cellContent.class;
                                            return (
                                                <td
                                                    key={`${timeSlot}-${day}`}
                                                    rowSpan={cellContent.rowSpan}
                                                    className="class-cell"
                                                >
                                                    <strong>{cls.name}</strong>
                                                    <br />
                                                    <small>{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</small>
                                                    <br />
                                                </td>
                                            );
                                        } else {
                                            return (
                                                <td key={`${timeSlot}-${day}`} className="empty-cell"></td>
                                            );
                                        }
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="no-classes">No classes added yet. Click the button below to add your schedule!</p>
            )}

            <hr className="section-divider" />

            <div className="add-class-button-wrapper">
                <button onClick={() => setIsModalOpen(true)} className="open-modal-button">Add New Class</button>
            </div>

            <AddClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                newClassName={newClassName}
                setNewClassName={setNewClassName}
                newClassDays={newClassDays}
                setNewClassDays={handleDayChange}
                newClassStartTime={newClassStartTime}
                setNewClassStartTime={setNewClassStartTime}
                newClassEndTime={newClassEndTime}
                setNewClassEndTime={setNewClassEndTime}
                newClassTopics={newClassTopics}
                setNewClassTopics={setNewClassTopics}
                newClassDifficulty={newClassDifficulty}
                setNewClassDifficulty={setNewClassDifficulty}
                handleAddClassSubmit={handleAddClassSubmit}
                formMessage={formMessage}
                ALL_DAYS_OF_WEEK={ALL_DAYS_OF_WEEK}
            />
        </section>
    );
};

export default ClassScheduleSection;
