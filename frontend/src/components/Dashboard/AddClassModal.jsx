import React from 'react';

const AddClassModal = ({
    isOpen,
    onClose,
    newClassName,
    setNewClassName,
    newClassDays,
    setNewClassDays,
    newClassStartTime,
    setNewClassStartTime,
    newClassEndTime,
    setNewClassEndTime,
    handleAddClassSubmit,
    formMessage,
    ALL_DAYS_OF_WEEK
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add New Class</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </div>
                {formMessage.text && (
                    <div className={`form-message ${formMessage.type}`}>
                        {formMessage.text}
                    </div>
                )}
                <form onSubmit={handleAddClassSubmit} className="add-class-form">
                    <div className="form-group">
                        <label htmlFor="className">Class Name:</label>
                        <input
                            type="text"
                            id="className"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Days:</label>
                        <div className="days-checkbox-group">
                            {ALL_DAYS_OF_WEEK.map(day => (
                                <label key={day}>
                                    <input
                                        type="checkbox"
                                        value={day}
                                        checked={newClassDays.includes(day)}
                                        onChange={() => setNewClassDays(day)}
                                    />
                                    {day}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Time:</label>
                        <div className="time-inputs">
                            <div>
                                <label htmlFor="startTime">Start Time:</label>
                                <input
                                    type="time"
                                    id="startTime"
                                    value={newClassStartTime}
                                    onChange={(e) => setNewClassStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="endTime">End Time:</label>
                                <input
                                    type="time"
                                    id="endTime"
                                    value={newClassEndTime}
                                    onChange={(e) => setNewClassEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit">Add Class</button>
                </form>
            </div>
        </div>
    );
};

export default AddClassModal;
