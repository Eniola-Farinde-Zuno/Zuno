const express = require('express');
const classController = require('../recommendation/classController');
const authenticateToken = require('../validation/authMiddleware');
const router = express.Router();

router.get('/all', authenticateToken, classController.getAllClasses);

router.post('/add', authenticateToken, classController.createClass);

router.put('/:id/update', authenticateToken, classController.updateClass);

router.delete('/:id/delete', authenticateToken, classController.deleteClass);

module.exports = router;
