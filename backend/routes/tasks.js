const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { validateTask } = require('../routes/validation');
const authenticateToken = require('../validation/authMiddleware');
const  MESSAGES = require('../messages/messages');

router.post('/task/add', authenticateToken, validateTask, async (req, res) => {
    const userId = req.user.id;
    const { title, description, priority, deadline, status } = req.body;
    const task = await prisma.task.create({
        data: {
            title: title,
            description: description ? description : "",
            priority: priority,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            status: status,
            user: {
                connect: {
                    id: userId
                }
            }
        }
    })
    res.json(task)
})

router.delete('/task/:id', authenticateToken,async (req, res) => {
    const { id } = req.params;
    await prisma.task.delete({
        where: {
            id: parseInt(id),
        }
    })
    res.json({ message: MESSAGES.TASK_DELETED })
})

router.put('/task/:id', authenticateToken,validateTask, async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, deadline, status } = req.body;
    const updatedTask = await prisma.task.update({
        where: {
            id: parseInt(id),
        },
        data: {
            title: title,
            description: description ? description : "",
            priority: priority,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            status: status,
        }
    })
    res.json({ updatedTask, message: MESSAGES.TASK_UPDATED })
})

router.get('/task/all', async (req, res) => {
    const tasks = await prisma.task.findMany();
    res.json(tasks)
})

module.exports = router
