// server/src/routes/lead.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  getLeads,
  getLeadById,      // ✅ NEW
  createLead,
  importLeads,
  updateLead,
  deleteLead,
  reassignLead,
} = require('../controllers/lead.controller');

const { protect, allowRoles } = require('../middlewares/auth.middleware');

// 🔐 Protect all routes
router.use(protect);

// 📋 Get all leads
router.get('/', getLeads);

// 👁️ Get single lead
router.get('/:id', getLeadById); // ✅ NEW

// ➕ Add new lead
router.post(
  '/',
  allowRoles('AGENT', 'MANAGER', 'SR_MANAGER', 'DIRECTOR', 'CCO', 'ADMIN'),
  createLead
);

// 📥 Bulk import leads
router.post(
  '/import',
  upload.single('file'),
  allowRoles('MANAGER', 'SR_MANAGER', 'DIRECTOR', 'CCO', 'ADMIN'),
  importLeads
);

// ✏️ Update lead
router.put(
  '/:id',
  allowRoles('MANAGER', 'SR_MANAGER', 'DIRECTOR', 'CCO', 'ADMIN'),
  updateLead
);

// ❌ Delete lead
router.delete(
  '/:id',
  allowRoles('DIRECTOR', 'CCO', 'ADMIN'),
  deleteLead
);

// 🔁 Reassign lead
router.patch(
  '/:id/reassign',
  allowRoles('DIRECTOR', 'CCO', 'ADMIN'),
  reassignLead
);

module.exports = router;
