const express = require('express');
const router = express.Router();
const pomodoroController = require('../pomodoro/pomodoroController');
const authenticateToken = require('../validation/authMiddleware');
const { sendWeeklyNotifications } = require('../pomodoro/weeklyPomodoroNotification');

router.post('/', authenticateToken, pomodoroController.createPomodoro);

router.get('/all', authenticateToken, pomodoroController.getAllPomodoros);

router.get('/weekly', authenticateToken, pomodoroController.getWeeklyPomodoros);

router.post('/send-weekly-summary', authenticateToken, async (req, res) => {
    await sendWeeklyNotifications();
    res.status(200).json();
});

module.exports = router;
