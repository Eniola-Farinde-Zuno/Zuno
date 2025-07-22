const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const getAllClasses = async (req, res) => {
    const userId = req.user.id;
    const classes = await prisma.class.findMany({
      where: { userId },
    });
    res.status(200).json(classes);
};
const createClass = async (req, res) => {
    const userId = req.user.id;
    const { name, days, startTime, endTime, topics, difficulty } = req.body;
    const newClass = await prisma.class.create({
      data: { name, days, startTime, endTime, topics, difficulty, userId},
    });
    res.status(201).json(newClass);
};
const updateClass = async (req, res) => {
    const { id } = req.params;
    const { name, days, startTime, endTime, topics, difficulty } = req.body;
    await prisma.class.findUnique({
      where: { id: parseInt(id) },
    });
    const updatedClass = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { name, days, startTime, endTime, topics, difficulty},
    });

    res.status(200).json(updatedClass);
};
const deleteClass = async (req, res) => {
    const { id } = req.params;
    await prisma.class.findUnique({
      where: { id: parseInt(id) },
    });
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json();
};

module.exports = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass,
}
