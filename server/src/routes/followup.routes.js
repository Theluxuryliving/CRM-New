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

router.use(protect);

// ➕ Create
router.post("/", allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"), createFollowup);

// 📋 Get by lead
router.get("/lead/:leadId", getFollowupsForLead);

// 📄 Get all (role filtered)
router.get("/", allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"), getAllFollowups);

// 🔁 Toggle follow-up status
router.patch("/:id/status", allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"), toggleFollowupStatus);

// ✏️ Update
router.put("/:id", allowRoles("AGENT", "MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"), updateFollowup);

// ❌ Delete
router.delete("/:id", allowRoles("MANAGER", "SR_MANAGER", "DIRECTOR", "CCO", "ADMIN"), deleteFollowup);

module.exports = router;
