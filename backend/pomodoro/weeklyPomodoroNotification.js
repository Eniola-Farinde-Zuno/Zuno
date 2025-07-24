const cron = require('node-cron');
const { PrismaClient } = require('../generated/prisma');
const { sendNotificationToUser } = require('../notification/notification');
const { startOfWeek, endOfWeek, format } = require('date-fns');
const prisma = new PrismaClient();

async function generateWeeklySummary(userId) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekStartFormatted = format(weekStart, 'MMM d');
  const weekEndFormatted = format(weekEnd, 'MMM d, yyyy');

  const pomodoros = await prisma.pomodoro.findMany({
    where: {
      userId: userId,
      createdAt: {
        gte: weekStart,
        lte: weekEnd
      }
    }
  });

  const totalCycles = pomodoros.length;
  const totalFocusMinutes = pomodoros.reduce((sum, cycle) => sum + cycle.focusCycle, 0);

  let title = "Your Weekly Pomodoro Summary";
  let body;
  let data = {
    type: "weekly_summary",
    weekStart: weekStartFormatted,
    weekEnd: weekEndFormatted,
    totalCycles,
    totalFocusMinutes
  };

  if (totalCycles > 0) {
    body = `This week (${weekStartFormatted} - ${weekEndFormatted}), you completed ${totalCycles} Pomodoro cycles with a total of ${totalFocusMinutes} minutes of focused work!`;
  } else {
    body = `You haven't completed any Pomodoro cycles this week (${weekStartFormatted} - ${weekEndFormatted}). Start focusing to boost your productivity!`;
  }
  return { title, body, data };
}

async function sendWeeklyNotifications() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true
    }
  });
  for (const user of users) {
    const summary = await generateWeeklySummary(user.id);

    if (summary) {
      const personalizedBody = `Hi ${user.firstName}! ${summary.body}`;
      await sendNotificationToUser(
        user.id,
        summary.title,
        personalizedBody,
        summary.data
      );
    }
  }

}

const scheduleWeeklyNotifications = () => {
  cron.schedule('0 6 * * 0', () => {
    sendWeeklyNotifications();
  }, {
    timezone: "America/Los_Angeles"
  });
};

module.exports = {
  scheduleWeeklyNotifications,
  sendWeeklyNotifications
};
