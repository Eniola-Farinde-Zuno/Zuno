const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { priorityScore } = require('./priorityAlgorithm');
const  MESSAGES = require('../messages/messages');

const getSortedTasks = async (req, res) => {
    const tasks = await prisma.task.findMany();
    const tasksWithPriority = tasks.map(task => ({
        ...task,
        priorityScore: priorityScore(task)
    }));
    const sortedTasks = tasksWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);
    res.json(sortedTasks);
};

const addTask = async (req, res) => {
    const userId = req.user.id;
    const { title, description, priority, deadline, status, size } = req.body;
    const taskData = {
        title: title,
        description: description ? description : "",
        priority: priority,
        deadline: deadline,
        status: status,
        size: size,
        createdAt: new Date(),
        user: {
            connect: {
                id: userId
            }
        }
    };
    const newTask = await prisma.task.create({
        data: {
            ...taskData,
            priorityScore: priorityScore(taskData)
        }
    });
    res.json(newTask);
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, deadline, status, size } = req.body;
    const existingTask = await prisma.task.findUnique({
        where: { id: parseInt(id) }
    });
    const combinedTaskData = {
        ...existingTask,
        ...req.body,
        createdAt: existingTask.createdAt
    }
    const newPriorityScore = priorityScore(combinedTaskData);
    const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
            title: title,
            description: description ? description : "",
            priority: priority,
            deadline: deadline,
            status: status,
            size: size,
            priorityScore: newPriorityScore
        }
    });
    res.json({ updatedTask, message: MESSAGES.TASK_UPDATED })
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    await prisma.task.delete({
        where: {
            id: parseInt(id)
        }
    });
    res.json({ message: MESSAGES.TASK_DELETED});
};

module.exports = {
    getSortedTasks,
    addTask,
    updateTask,
    deleteTask,
};
