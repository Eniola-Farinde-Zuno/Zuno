const express = require('express');
const router = express.Router();
const { validateTask } = require('../routes/validation');
const authenticateToken = require('../validation/authMiddleware');
const taskController = require('../algorithm/taskController');


router.post('/task/add', authenticateToken, validateTask, taskController.addTask);

router.delete('/task/:id', authenticateToken, taskController.deleteTask);

router.put('/task/:id', authenticateToken, validateTask, taskController.updateTask);

router.get('/task/all', authenticateToken, taskController.getSortedTasks);

router.post('/task/:taskId/complete', authenticateToken, taskController.completeTask);

router.post('/task/:taskId/undo-complete', authenticateToken, taskController.undoCompleteTask);

module.exports = router
