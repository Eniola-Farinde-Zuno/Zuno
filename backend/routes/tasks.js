const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { validateTask } = require('../routes/validation');
const { MESSAGES } = require('../messages/messages');

router.post('/task', validateTask, async (req, res) => {
    const { title, description, priority, deadline, status } = req.body;
    const task = await prisma.task.create({
        data: {
            title: title,
            description: description ? description : "",
            priority: priority,
            deadline: deadline,
            status: status,
        }
    })
    res.json(task)
})

router.delete('/task/:id', async (req, res) => {
    const { id } = req.body;
    await prisma.task.delete({
        where: {
            id: id
        }
    })
    res.json({ message: MESSAGES.TASK_DELETED })
})

router.put('/task/:id', validateTask, async (req, res) => {
    const { id, title, description, priority, deadline } = req.body;
    await prisma.task.update({
        where: {
            id: id,
            title: title,
            description: description ? description : "",
            priority: priority,
            deadline: deadline,
        }
    })
    res.json({ message: MESSAGES.TASK_UPDATED })
})

router.get('/tasks', async (req, res) => {
    const tasks = await prisma.task.findMany();
    res.json(tasks)
})

module.exports = router
