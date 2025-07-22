const express = require('express');
const router = express.Router();
const authenticateToken = require('../validation/authMiddleware');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { sendNotificationToUser } = require('../notification/notification');
const MESSAGES = require('../messages/messages');

router.post('/token', authenticateToken, async (req, res) => {
    const { token } = req.body;
    const userIdFromAuth = req.user.id;
    await prisma.fcmToken.upsert({
        where: { token },
        update: { userId: userIdFromAuth },
        create: { userId: userIdFromAuth, token }
    });
    return res.status(200).json({ message: MESSAGES.TOKEN_SAVED });

});

router.post('/send', authenticateToken, async (req, res) => {
    const { targetUserId, title, body, data } = req.body;
    const result = await sendNotificationToUser(targetUserId, title, body, data);
    res.status(200).json({
        message: MESSAGES.NOTIFICATION_SENT,
        ...result
    });
});

router.get('/all', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    const formattedNotifications = notifications.map(notification => ({
        ...notification,
        data: notification.data ? JSON.parse(notification.data) : null
    }));
    res.status(200).json(formattedNotifications);
});

router.put('/:id/read', authenticateToken, async (req, res) => {
    const { id } = req.params;
    await prisma.notification.findUnique({
        where: { id: parseInt(id) }
    });
    const updatedNotification = await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true }
    });
    res.status(200).json(updatedNotification);
});

router.put('/read-all', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false
        },
        data: { isRead: true }
    });
    res.status(200).json({
        count: result.count
    });
});

module.exports = router;
