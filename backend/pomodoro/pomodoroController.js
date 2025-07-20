const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { startOfWeek } = require('date-fns');

const createPomodoro = async (req, res) => {
    const userId = req.user.id;
    const { focusCycle, breakCycle } = req.body;
    const pomodoro = await prisma.pomodoro.create({
        data: {
            focusCycle,
            breakCycle,
            user: {
                connect: {
                    id: userId,
                },
            },
        }
    })
    res.status(201).json(pomodoro);
}

const getAllPomodoros = async (req, res) => {
    const userId = req.user.id;
    const pomodoros = await prisma.pomodoro.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.status(200).json(pomodoros);
}

const getWeeklyPomodoros = async (req, res) => {
    const userId = req.user.id;
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const pomodoros = await prisma.pomodoro.findMany({
        where: {
            userId: userId,
            createdAt: {
                gte: startOfCurrentWeek
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.status(200).json(pomodoros);
}

module.exports = {
    createPomodoro,
    getAllPomodoros,
    getWeeklyPomodoros
}
