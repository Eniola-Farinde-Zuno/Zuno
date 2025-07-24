const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { recommendation, TASK_SIZE_TO_DURATION } = require('./recommendationAlgorithm');

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
  if (!name || !days || days.length === 0 || !startTime || !endTime || !difficulty) {
    return res.status(400).json();
  }
  if (startTime >= endTime) {
    return res.status(400).json();
  }
  const newClass = await prisma.class.create({
    data: { name, days, startTime, endTime, topics, difficulty, userId },
  });
  res.status(201).json(newClass);
};

const updateClass = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, days, startTime, endTime, topics, difficulty } = req.body;
  if (!name || !days || days.length === 0 || !startTime || !endTime || !difficulty) {
    return res.status(400).json();
  }
  if (startTime >= endTime) {
    return res.status(400).json();
  }
  const updatedClass = await prisma.class.update({
    where: { id: parseInt(id) },
    data: { name, days, startTime, endTime, topics, difficulty },
  });

  res.status(200).json(updatedClass);
};

const deleteClass = async (req, res) => {
  const { id } = req.params;
  await prisma.class.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).json();
};

const getRecommendation = async (req, res) => {
  const userId = req.user.id;

  const userClasses = await prisma.class.findMany({
    where: { userId },
  });
  const userTasks = await prisma.task.findMany({
    where: { userId },
  });

  const currentTime = new Date();
  const displayRecommendation = recommendation(userClasses, userTasks, currentTime);
  if (displayRecommendation && displayRecommendation.type === 'task' && displayRecommendation.task) {
    displayRecommendation.task.actualDuration = TASK_SIZE_TO_DURATION[displayRecommendation.task.size.toUpperCase()];
  }
  res.status(200).json(displayRecommendation);
};

module.exports = {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getRecommendation,
};
