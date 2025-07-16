const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { priorityScore } = require('./priorityAlgorithm');
const MESSAGES = require('../messages/messages');
const { canStart, circularDependency, updateCanStart } = require('./dependency');
const { getCacheKey, setCache, getCache, invalidateUserCache } = require('../utils/cache');

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
    const { title, description, priority, deadline, status, size, dependencies } = req.body;
    const existingTask = await prisma.task.findUnique({
        where: { id: parseInt(id) }
    });
    const combinedTaskData = {
        ...existingTask,
        ...req.body,
        createdAt: existingTask.createdAt,
        dependencies: dependencies || existingTask.dependencies,
    }
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
    const isCircular = await circularDependency(combinedTaskData, allExistingTasks);
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
        task.id === parseInt(id) ? { ...task, ...combinedTaskData } : task
    );
    const newPriorityScore = priorityScore(combinedTaskData, tasksForPriorityCalculation);
    const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
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
        await updateCanStart(prisma);
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
            id: parseInt(id)
        }
    });
    await updateCanStart(prisma);
    //invalidate cache after deleting task
    invalidateUserCache(userId);
    res.json({ message: MESSAGES.TASK_DELETED});
};

module.exports = {
    getSortedTasks,
    addTask,
    updateTask,
    deleteTask,
};
