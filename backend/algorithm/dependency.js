const BLOCKED = 'BLOCKED';
const COMPLETED = 'COMPLETED';
const IN_PROGRESS = 'IN_PROGRESS';
const canStart = (task, tasks) => {
    if (!task.dependencies || task.dependencies.length === 0) {
        return true;
    }
    for (const depId of task.dependencies) {
        const dependentTask = tasks.find(t => t.id === depId);
        if (!dependentTask) {
            return false;
        }
        if (dependentTask.status !== COMPLETED) {
            return false;
        }
    }
    return true;
};
const circularDependency = async (taskData, existingTasks) => {
    const graph = new Map();
    const inDegrees = new Map();
    const allTasksForGraph = existingTasks
        .filter(t => t.id !== taskData.id)
        .map(t => ({ id: t.id, dependencies: t.dependencies }));

    allTasksForGraph.push({ id: taskData.id, dependencies: taskData.dependencies });
    for (const task of allTasksForGraph) {
        graph.set(task.id, new Set());
        inDegrees.set(task.id, 0);
    }
    for (const task of allTasksForGraph) {
        if (task.dependencies && Array.isArray(task.dependencies)) {
            for (const Id of task.dependencies) {
                if (graph.has(Id)) {
                    graph.get(Id).add(task.id);
                    inDegrees.set(task.id, (inDegrees.get(task.id) || 0) + 1);
                }
            }
        }
    }
    const q = [];
    for (const [taskId, degree] of inDegrees.entries()) {
        if (degree === 0) {
            q.push(taskId);
        }
    }
    let nodesCount = 0;
    while (q.length > 0) {
        const u = q.shift();
        nodesCount++;
        for (const v of graph.get(u)) {
            inDegrees.set(v, inDegrees.get(v) - 1);
            if (inDegrees.get(v) === 0) {
                q.push(v);
            }
        }
    }
    return nodesCount !== allTasksForGraph.length;
};

const updateCanStart = async (prisma) => {
    const tasks = await prisma.task.findMany();
    const updates = [];
    for (const task of tasks) {
        const currentCanStart = await canStart(task, tasks);
        let newStatus = task.status;
        if (task.status === BLOCKED && currentCanStart) {
            newStatus = IN_PROGRESS;
        }
        else if (task.status !== BLOCKED && task.dependencies.length > 0) {
            if (task.status !== COMPLETED) {
                newStatus = BLOCKED;
            }
        }
        if (task.canStart !== currentCanStart || task.status !== newStatus) {
            updates.push(prisma.task.update({
                where: { id: task.id },
                data: {
                    canStart: currentCanStart,
                    status: newStatus
                }
            }));
        }
    }
    if (updates.length > 0) {
        await prisma.$transaction(updates);
    }
};

module.exports = {
    canStart,
    circularDependency,
    updateCanStart,
};
