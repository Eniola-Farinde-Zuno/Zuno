const express = require('express');
const router = express.Router();
const authenticateToken = require('../validation/authMiddleware');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { sendNotificationToUser } = require('../notification/notification');
const MESSAGES = require('../constants/messages');

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

module.exports = router;
