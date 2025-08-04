// 📁 server/src/routes/followup.routes.js
const express = require("express");
const router = express.Router();

const {
  createFollowup,
  getFollowupsForLead,
  getAllFollowups,
  updateFollowup,
  deleteFollowup,
  toggleFollowupStatus
} = require("../controllers/followup.controller");

const { protect, allowRoles } = require("../middlewares/auth.middleware");

// ✅ Middleware to protect all follow-up routes
router.use(protect);

// ➕ Add a follow-up
router.post(
  "/",
  allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"),
  createFollowup
);

// 📋 Get all follow-ups for a lead
router.get("/lead/:leadId", getFollowupsForLead);

// 📄 Get all follow-ups with filters
router.get(
  "/",
  allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"),
  getAllFollowups
);

// 🔄 Toggle status
router.patch(
  "/:id/status",
  allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"),
  toggleFollowupStatus
);

// ✏️ Update follow-up
router.put(
  "/:id",
  allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"),
  updateFollowup
);

// ❌ Delete follow-up
router.delete(
  "/:id",
  allowRoles("MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"),
  deleteFollowup
);

module.exports = router;
