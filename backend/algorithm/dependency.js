const BLOCKED = 'BLOCKED';
const COMPLETED = 'COMPLETED';
const IN_PROGRESS = 'IN_PROGRESS';
const canStart = (task, tasks) => {
    if (!task.dependencies || task.dependencies.length === 0) {
        return true;
    }
    for (const depId of task.dependencies) {
        const dependentTask = tasks.find(t => t.id === depId);
        if (!dependentTask || dependentTask.status !== COMPLETED) {
            return false;
        }
    }
    return true;
};

// detecting cycle in a directed graph
//refractored to not traverse the whole graph and only traverse the nodes that are in the dependency list
const circularDependency = async (taskData, existingTasks) => {
    const graph = new Map();
    const allTasksForGraph = existingTasks
        .filter(t => t.id !== taskData.id)
        .map(t => ({ id: t.id, dependencies: t.dependencies }));

    allTasksForGraph.push({ id: taskData.id, dependencies: taskData.dependencies });
    for (const task of allTasksForGraph) {
        graph.set(task.id, task.dependencies || []);
    }
    // detect cycle in the graph
    const visited = new Set();
    const recursionStack = new Set();
    const hasCycle = (taskId) => {
        if (recursionStack.has(taskId)) {
            return true;
        }
        if (visited.has(taskId)) {
            return false;
        }
        visited.add(taskId);
        recursionStack.add(taskId);
        for (const depId of graph.get(taskId) || []) {
            if (hasCycle(depId)) {
                return true;
            }
        }
        recursionStack.delete(taskId);
        return false;
    }
    for (const taskId of graph.keys()) {
        if (hasCycle(taskId)) {
            return true; // exiting as soon as cycle is found
        }
    }
    return false;
};
// updating canStart and status fields
const updateCanStart = async (prisma, userId) => {
    const tasks = await prisma.task.findMany({
        where: { userId: userId }
    });
    const updates = [];
    for (const task of tasks) {
        const currentCanStart = canStart(task, tasks);
        let newStatus = task.status;
        if (task.status === BLOCKED && currentCanStart) {
            newStatus = IN_PROGRESS;
        }
        else if (task.status !== BLOCKED && task.status !== COMPLETED && task.dependencies.length > 0 && !currentCanStart) {
            newStatus = BLOCKED;
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
