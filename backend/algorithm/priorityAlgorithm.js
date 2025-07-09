const priorityScore = (task) => {
    ONE_DAY_IN_SECONDS = 1000 * 60 * 60 * 24;
    WI = 0.3;
    WD = 0.4;
    WA = 0.2;
    WS = 0.1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const HIGH_SCORE = 5;
    const MEDIUM_SCORE = 3;
    const SMALL_SCORE = 2;
    const LOW_SCORE = 1;
    const SEVEN_DAYS = 7
    const ONE_DAY = 1

    const importance = {
        'HIGH': HIGH_SCORE,
        'MEDIUM': MEDIUM_SCORE,
        'LOW': LOW_SCORE
    }[task.priority];

    let urgency;
    if (task.deadline) {
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        const daysUntilDue = Math.ceil((deadline - today) / ONE_DAY_IN_SECONDS);
        if (daysUntilDue < ONE_DAY) {
            urgency = HIGH_SCORE;
        }
        else if (daysUntilDue < SEVEN_DAYS) {
            urgency = MEDIUM_SCORE;
        }
        else {
            urgency = LOW_SCORE;
        }
    }
    let age;
    if (task.createdAt) {
        const createdDate = new Date(task.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        const daysOld = Math.floor((today - createdDate) / ONE_DAY_IN_SECONDS);
        if (daysOld >= SEVEN_DAYS) {
            age = HIGH_SCORE;
        }
        else if (daysOld >= ONE_DAY) {
            age = MEDIUM_SCORE;
        }
        else {
            age = LOW_SCORE;
        }
    }

    const size = {
        'EXTRA_SMALL': LOW_SCORE,
        'SMALL': SMALL_SCORE,
        'MEDIUM': MEDIUM_SCORE,
        'LARGE': HIGH_SCORE,
    }[task.size];

    const priority = (WI * importance + WD * urgency + WA * age + WS * size)
    return parseFloat(priority.toFixed(2));
    
};

module.exports = { priorityScore };
