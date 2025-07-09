const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { validateTask } = require('../routes/validation');
const authenticateToken = require('../validation/authMiddleware');
const taskController = require('../algorithm/taskController');


router.post('/task/add', authenticateToken, validateTask, taskController.addTask);

router.delete('/task/:id', authenticateToken, taskController.deleteTask);

router.put('/task/:id', authenticateToken, validateTask, taskController.updateTask);

router.get('/task/all', authenticateToken, taskController.getSortedTasks);

module.exports = router
