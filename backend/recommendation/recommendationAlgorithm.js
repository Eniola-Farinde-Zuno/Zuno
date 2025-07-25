const TASK_SIZE_TO_DURATION = {
    'EXTRA_SMALL': 15,
    'SMALL': 30,
    'MEDIUM': 60,
    'LARGE': 120,
};

const timeToMinutes = (timeString) => {
    const [hour, minute] = timeString.split(':').map(Number);
    return hour * 60 + minute;
};
const minutesToTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const findFreeBlock = (schedule, day, nowMins, studyStartMins, studyEndMins) => {
    const todayClasses = schedule.filter(i => i.days.includes(day))
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    let blockStartCand = Math.max(nowMins, studyStartMins); 
    let nextClassTime = null;
    for (const i of todayClasses) {
        const classStart = timeToMinutes(i.startTime);
        const classEnd = timeToMinutes(i.endTime);
        if (nowMins >= classStart && nowMins < classEnd) {
            blockStartCand = Math.max(blockStartCand, classEnd);
            continue;
        }
        if (nowMins >= classEnd && blockStartCand < classEnd) {
            blockStartCand = Math.max(blockStartCand, classEnd);
            continue;
        }
        if (classStart > blockStartCand) {
            const blockEnd = Math.min(classStart, studyEndMins);
            const duration = blockEnd - blockStartCand;
            if (duration > 0) {
                return {
                    start: minutesToTime(blockStartCand),
                    end: minutesToTime(blockEnd),
                    duration: duration,
                    nextClass: minutesToTime(classStart)
                };
            }
        }
        blockStartCand = Math.max(blockStartCand, classEnd);
    }
    if (studyEndMins > blockStartCand) {
        const duration = studyEndMins - blockStartCand;
        if (duration > 0) {
            return {
                start: minutesToTime(blockStartCand),
                end: minutesToTime(studyEndMins),
                duration: duration,
                nextClass: null
            };
        }
    }
    return null;
};


const recommendation = (classSchedule, taskList, currentTime = new Date()) => {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const nowInMinutes = currentHour * 60 + currentMinute;
    const startStudyDayInMinutes = 8 * 60;
    const endStudyDayInMinutes = 22 * 60;
    const availableBlock = findFreeBlock( classSchedule, currentDay, nowInMinutes, startStudyDayInMinutes, endStudyDayInMinutes);

    if (!availableBlock || availableBlock.duration <= 0) { //if no free time block found
        return {
            type: 'no_block',
        };
    }
    //checking for uncompleted tasks
    const uncompletedTasks = taskList.filter(task => task.status !== 'COMPLETED');
    if (uncompletedTasks.length === 0) {
        return {
            type: 'no_tasks',
            suggestedTimeBlock: availableBlock,
            nextClassTime: availableBlock.nextClass
        };
    }
    uncompletedTasks.sort((a, b) => {
        const sizeA = TASK_SIZE_TO_DURATION[a.size.toUpperCase()] || 0;
        const sizeB = TASK_SIZE_TO_DURATION[b.size.toUpperCase()] || 0;
        const sizeComparison = sizeB - sizeA;

        if (sizeComparison !== 0) {
            return sizeComparison;
        }

        //if sizes are the same, prioritize by priorityScore
        return (b.priorityScore || 0) - (a.priorityScore || 0);
    });

    //find the largest task that fits into the available block
    let recommendedTask = null;
    for (const task of uncompletedTasks) {
        const taskDuration = TASK_SIZE_TO_DURATION[task.size.toUpperCase()];
        if (taskDuration && availableBlock.duration >= taskDuration) {
            recommendedTask = task;
            break;
        }
    }
    if (recommendedTask) { //if a task fits into the available block
        return {
            type: 'task',
            task: recommendedTask,
            suggestedTimeBlock: availableBlock,
            nextClassTime: availableBlock.nextClass
        };
    } else {
        return { //if no task fits into the available block
            type: 'free_time_no_fit_task',
            suggestedTimeBlock: availableBlock,
            nextClassTime: availableBlock.nextClass
        };
    }
};

module.exports = {
    recommendation,
    TASK_SIZE_TO_DURATION,
    timeToMinutes,
    minutesToTime,
    findFreeBlock
};
