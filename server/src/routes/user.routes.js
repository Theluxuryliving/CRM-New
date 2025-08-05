const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middlewares/auth.middleware');
const prisma = require('../prisma'); // adjust if needed

router.use(protect);

// ✅ Get all users, optionally filtered by role
router.get('/', async (req, res) => {
  try {
    const role = req.query.role;
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: { id: true, name: true, email: true }
    });
    res.json(users);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ✅ NEW: Get only agents (GET /api/users/agents)
router.get('/agents', async (req, res) => {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: { id: true, name: true, email: true }
    });
    res.json(agents);
  } catch (err) {
    console.error('❌ Failed to fetch agents:', err);
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

module.exports = router;
