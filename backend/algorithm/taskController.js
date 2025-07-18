const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { priorityScore } = require('./priorityAlgorithm');
const MESSAGES = require('../messages/messages');
const { canStart, circularDependency, updateCanStart } = require('./dependency');
const { getCacheKey, setCache, getCache, invalidateUserCache } = require('../utils/cache');
const { sendNotificationToUser } = require('../notification/notification');

const BLOCKED = 'BLOCKED';
const IN_PROGRESS = 'IN_PROGRESS';
const COMPLETED = 'COMPLETED';
const getSortedTasks = async (req, res) => {
    const userId = req.user.id;
    const cacheKey = getCacheKey(userId, 'sortedTasks');

    //check cache first
    const cachedTasks = getCache(cacheKey);
    if (cachedTasks) {
        return res.json(cachedTasks);
    }
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId
        }
    });
    const tasksWithPriority = tasks.map(task => ({
        ...task,
        priorityScore: priorityScore(task, tasks)
    }));
    const sortedTasks = tasksWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);
    //caching the result
    setCache(cacheKey, sortedTasks);
    res.json(sortedTasks);
};

const addTask = async (req, res) => {
    const userId = req.user.id;
    const { title, description, priority, deadline, status, size, dependencies } = req.body;
    const parsedDependencies = dependencies ? dependencies.map(Number) : [];
    const taskData = {
        title: title,
        description: description ? description : "",
        priority: priority,
        deadline: deadline,
        status: status,
        size: size,
        createdAt: new Date(),
        dependencies: parsedDependencies,
        user: {
            connect: {
                id: userId
            }
        }
    };

    const allExistingTasks = await prisma.task.findMany({
        where: {
            userId: req.user.id
        },
        select: {
            id: true,
            dependencies: true,
            status: true
        }
    });
    const isCircular = await circularDependency(taskData, allExistingTasks);
    if (isCircular) {
        return res.status(400).json({ message: MESSAGES.CIRCULAR_DEPENDENCY });
    }
    const initialCanStart = canStart(taskData, allExistingTasks);
    let finalStatus = status;
    if (!initialCanStart && taskData.dependencies.length > 0) {
        finalStatus = BLOCKED;
    } else if (finalStatus === BLOCKED) {
        finalStatus = IN_PROGRESS;
    } else if (!finalStatus) {
        finalStatus = IN_PROGRESS;
    }
    taskData.status = finalStatus;
    taskData.canStart = initialCanStart;
    taskData.dependencies = parsedDependencies;
    const newTask = await prisma.task.create({
        data: {
            ...taskData,
            priorityScore: priorityScore(taskData, [...allExistingTasks, taskData])
        }
    });
    //invalidate cache after adding task
    invalidateUserCache(userId);

    res.json(newTask);
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, priority, deadline, size, dependencies } = req.body;
    const existingTask = await prisma.task.findUnique({
        where: { id: parseInt(id) }
    });
    const combinedTaskData = {
        ...existingTask,
        ...req.body,
        createdAt: existingTask.createdAt,
        dependencies: dependencies !== undefined ? dependencies.map(Number) : existingTask.dependencies,
    }
    const allExistingTasks = await prisma.task.findMany({
        where: {
            userId: userId
        },
        select: {
            id: true,
            dependencies: true,
            status: true
        }
    });
    const isCircular = circularDependency(combinedTaskData, allExistingTasks);
    if (isCircular) {
        return res.status(400).json({ message: MESSAGES.CIRCULAR_DEPENDENCY });
    }
    const currentCanStart = canStart(combinedTaskData, allExistingTasks);
    let finalStatus = combinedTaskData.status;
    if (!currentCanStart && combinedTaskData.dependencies.length > 0) {
        finalStatus = BLOCKED;
    } else if (currentCanStart && finalStatus === BLOCKED) {
        finalStatus = IN_PROGRESS;
    }
    const tasksForPriorityCalculation = allExistingTasks.map(task =>
        task.id === parseInt(id) ? { ...task, ...combinedTaskData, status: finalStatus } : task
    );
    const newPriorityScore = priorityScore(combinedTaskData, tasksForPriorityCalculation);
    const updatedTask = await prisma.task.update({
        where: { id: parseInt(id), userId: userId },
        data: {
            title: title,
            description: description ? description : "",
            priority: priority,
            deadline: deadline,
            status: finalStatus,
            size: size,
            priorityScore: newPriorityScore,
            canStart: currentCanStart,
            dependencies: dependencies || existingTask.dependencies,
        }
    });
    const dependenciesModified = dependencies !== undefined && JSON.stringify(dependencies) !== JSON.stringify(existingTask.dependencies);
    if (updatedTask.status === COMPLETED || dependenciesModified) {
        await updateCanStart(prisma, userId);
    }
    //invalidate cache after updating task
    invalidateUserCache(userId);
    res.json({ updatedTask, message: MESSAGES.TASK_UPDATED })
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const dependentTasks = await prisma.task.findMany({
        where: {
            userId: userId,
            dependencies: {
                has: parseInt(id)
            }
        },
        select: { id: true, title: true }
    })
    if (dependentTasks.length > 0) {
        return res.status(400).json({
            dependentTasks: dependentTasks
        });
    }
    await prisma.task.delete({
        where: {
            id: parseInt(id),
            userId: userId
        }
    });
    await updateCanStart(prisma, userId);
    //invalidate cache after deleting task
    invalidateUserCache(userId);
    res.json({ message: MESSAGES.TASK_DELETED});
};
const completeTask = async (req, res) => {
    const userId = req.user.id;
    const { taskId } = req.params;
    await prisma.task.findUnique({
        where: { id: parseInt(taskId), userId: userId }
    });
    const updatedTask = await prisma.task.update({
        where: { id: parseInt(taskId), userId: userId },
        data: {
            status: COMPLETED,
        }
    });
    await updateCanStart(prisma, userId);
    invalidateUserCache(userId);
    //send notification for task completion
    const title = "Task Completed! 🎉";
    const body = `You've successfully finished ${updatedTask.title}. Great work!`;
    const data = {
        type: "task_completion",
        taskId: updatedTask.id.toString(),
        taskTitle: updatedTask.title || 'N/A',
        actions: JSON.stringify([
            {
                action: 'undo',
                title: 'Undo',
                icon: '/undo-icon.png'
            }
        ])
    };
    await sendNotificationToUser(userId, title, body, data);
    return res.status(200).json({ task: updatedTask });
};

const undoCompleteTask = async (req, res) => {
    const userId = req.user.id;
    const { taskId } = req.params;
    await prisma.task.findUnique({
        where: { id: parseInt(taskId), userId: userId }
    });
    const updatedTask = await prisma.task.update({
        where: { id: parseInt(taskId), userId: userId },
        data: {
            status: IN_PROGRESS,
        }
    });

    await updateCanStart(prisma, userId);
    invalidateUserCache(userId);
    return res.status(200).json({ task: updatedTask });
};

module.exports = {
    getSortedTasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    undoCompleteTask,
};
