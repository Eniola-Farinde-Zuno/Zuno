const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const router = express.Router();


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id)
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        firstName: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
