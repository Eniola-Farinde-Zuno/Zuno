const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/tasks');
const notificationRoutes  = require('./routes/notifications');
const pomodoroRoutes = require('./routes/pomodoro');
const { scheduleWeeklyNotifications } = require('./pomodoro/weeklyPomodoroNotification');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', taskRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/pomodoro', pomodoroRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
    scheduleWeeklyNotifications();
});
