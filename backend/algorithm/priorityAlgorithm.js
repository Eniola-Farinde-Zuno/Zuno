const priorityScore = (task) => {
    ONE_DAY = 1000 * 60 * 60 * 24;
    WI = 0.3;
    WD = 0.4;
    WA = 0.2;
    WS = 0.1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const importance = {
        'HIGH': 5,
        'MEDIUM': 3,
        'LOW': 1
    }[task.priority];

    let urgency = 1;
    if (task.deadline) {
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        const daysUntilDue = Math.ceil((deadline - today) / ONE_DAY);
        if (daysUntilDue < 1) {
            urgency = 5;
        }
        else if (daysUntilDue < 7) {
            urgency = 3;
        }
    }

    let age = 1;
    if (task.createdAt) {
        const createdDate = new Date(task.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        const daysOld = Math.floor((today - createdDate) / ONE_DAY);
        if (daysOld >= 7) {
            age = 5;
        }
        else if (daysOld >= 1) {
            age = 3;
        }
    }

    const size = {
        'EXTRA_SMALL': 1,
        'SMALL': 2,
        'MEDIUM': 3,
        'LARGE': 5
    }[task.size];

    const priority = (WI * importance + WD * urgency + WA * age + WS * size)
    return parseFloat(priority.toFixed(2));
};

module.exports = { priorityScore };
