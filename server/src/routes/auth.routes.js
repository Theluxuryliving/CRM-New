// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  // getUsers,
  // changeRole
} = require('../controllers/auth.controller');

// const { protect, allowRoles } = require('../middlewares/auth.middleware');

// ✅ Only public routes for now
router.post('/signup', signup);
router.post('/login', (req, res, next) => {
  console.log("🔥 Login route hit");
  next();
}, login);
// ❌ Temporarily comment out these
// router.get('/users', protect, allowRoles("ADMIN", "DIRECTOR"), getUsers);
// router.put('/users/:id/role', protect, allowRoles("ADMIN"), changeRole);

module.exports = router;
