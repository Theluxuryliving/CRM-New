// ✅ server/src/controllers/followup.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ➕ Create new follow-up
exports.createFollowup = async (req, res) => {
  const { leadId, message, nextFollowupDate } = req.body;
  const userId = req.user?.userId;

  try {
    const followup = await prisma.followUp.create({
      data: {
        leadId: parseInt(leadId),
        message,
        nextFollowupDate: new Date(nextFollowupDate),
        createdById: userId
      }
    });

    // Log creation with default status PENDING
    await prisma.followUpLog.create({
      data: {
        followupId: followup.id,
        status: "PENDING",
        updatedById: userId
      }
    });

    res.status(201).json(followup);
  } catch (err) {
    console.error("❌ Failed to create follow-up:", err);
    res.status(500).json({ message: "Follow-up creation failed" });
  }
};

// 📋 Get follow-ups for a specific lead
exports.getFollowupsForLead = async (req, res) => {
  const leadId = parseInt(req.params.leadId);
  try {
    const followups = await prisma.followUp.findMany({
      where: { leadId },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        logs: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(followups);
  } catch (err) {
    console.error("❌ Failed to fetch follow-ups:", err);
    res.status(500).json({ message: "Failed to get follow-ups" });
  }
};

// 📄 List all follow-ups (filtered by role)
exports.getAllFollowups = async (req, res) => {
  const { role, userId } = req.user;
  const { status = '', from = '', to = '', agentId = '' } = req.query;

  let where = {};
  if (status) where.logs = { some: { status } };
  if (from || to) {
    where.nextFollowupDate = {};
    if (from) where.nextFollowupDate.gte = new Date(from);
    if (to) where.nextFollowupDate.lte = new Date(to);
  }
  if (agentId) where.createdById = parseInt(agentId);

  if (role === 'AGENT') where.createdById = userId;
  else if (role === 'MANAGER') where.createdBy = { managerId: userId };
  else if (role === 'SR_MANAGER') where.createdBy = { srManagerId: userId };
  else if (role === 'DIRECTOR') where.createdBy = { directorId: userId };

  try {
    const followups = await prisma.followUp.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        logs: true
      },
      orderBy: { nextFollowupDate: "asc" }
    });
    res.json(followups);
  } catch (err) {
    console.error("❌ Failed to get all follow-ups:", err);
    res.status(500).json({ message: "Get all follow-ups failed" });
  }
};

// 🔄 Toggle follow-up status
exports.toggleFollowupStatus = async (req, res) => {
  const followupId = parseInt(req.params.id);
  const userId = req.user?.userId;

  try {
    const lastLog = await prisma.followUpLog.findFirst({
      where: { followupId },
      orderBy: { updatedAt: "desc" }
    });

    const newStatus = lastLog?.status === "DONE" ? "PENDING" : "DONE";

    const log = await prisma.followUpLog.create({
      data: {
        followupId,
        status: newStatus,
        updatedById: userId
      }
    });

    res.json(log);
  } catch (err) {
    console.error("❌ Failed to toggle follow-up status:", err);
    res.status(500).json({ message: "Toggle failed" });
  }
};

// ✏️ Update follow-up
exports.updateFollowup = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user?.userId;
  const { message, nextFollowupDate } = req.body;

  try {
    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        message,
        nextFollowupDate: new Date(nextFollowupDate)
      }
    });

    await prisma.followUpLog.create({
      data: {
        followupId: id,
        status: "RESCHEDULED",
        updatedById: userId
      }
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to update follow-up:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

// ❌ Delete follow-up
exports.deleteFollowup = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.followUp.delete({ where: { id } });
    res.json({ message: "Follow-up deleted" });
  } catch (err) {
    console.error("❌ Failed to delete follow-up:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
