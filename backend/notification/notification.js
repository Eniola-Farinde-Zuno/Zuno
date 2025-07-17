const admin = require('firebase-admin');
const serviceAccount = require('./zuno-5b834-firebase-adminsdk-fbsvc-82871f9cc6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendNotificationToUser(userId, title, body, data = {}) {
  const fcmTokens = await prisma.fcmToken.findMany({
    where: { userId },
    select: { token: true }
  });

  const tokensToSend = fcmTokens.map(record => record.token);

  if (tokensToSend.length === 0) {
    return { successCount: 0, failureCount: 0, message: 'No tokens found.' };
  }

  const message = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    ),
    tokens: tokensToSend
  };
  const response = await admin.messaging().sendEachForMulticast(message);

  if (response.failureCount > 0) {
    const invalidTokens = response.responses
      .filter((resp, idx) => !resp.success && [
        'messaging/invalid-registration-token',
        'messaging/registration-token-not-registered',
        'messaging/mismatched-sender-id'
      ].includes(resp.error.code))
      .map((_, idx) => tokensToSend[idx]);

    if (invalidTokens.length > 0) {
      await prisma.fcmToken.deleteMany({
        where: { token: { in: invalidTokens } }
      });
    }
  }

  return {
    successCount: response.successCount,
    failureCount: response.failureCount
  };
}


module.exports = { admin, sendNotificationToUser };
