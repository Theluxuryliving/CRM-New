const express = require('express');
const router = express.Router();

// Dummy route
router.get('/pdf', (req, res) => {
  res.send('🧾 PDF export endpoint coming soon!');
});

module.exports = router;
