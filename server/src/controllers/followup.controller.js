// 📁 server/src/controllers/followup.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ➕ Create new follow-up
exports.createFollowup = async (req, res) => {
  const { leadId, message, nextFollowupDate, status = 'PENDING' } = req.body;
  const userId = req.user?.userId;

  try {
    const followup = await prisma.followUp.create({
      data: {
        leadId: parseInt(leadId),
        message,
        status,
        nextFollowupDate: new Date(nextFollowupDate),
        createdById: userId
      }
    });

    // Log creation for audit
    await prisma.followUpLog.create({
      data: {
        followUpId: followup.id,
        action: `Created follow-up`,
        userId
      }
    });

    res.status(201).json(followup);
  } catch (err) {
    console.error("❌ Follow-up creation failed:", err);
    res.status(500).json({ message: "Failed to create follow-up" });
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
        lead: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(followups);
  } catch (err) {
    console.error("❌ Failed to fetch follow-ups:", err);
    res.status(500).json({ message: "Failed to get follow-ups" });
  }
};

// 📄 List all follow-ups (for dashboard or page)
exports.getAllFollowups = async (req, res) => {
  const { role, userId } = req.user;
  const { status = '', from = '', to = '', agentId = '' } = req.query;

  let where = {};
  if (status) where.status = status;
  if (from || to) {
    where.nextFollowupDate = {};
    if (from) where.nextFollowupDate.gte = new Date(from);
    if (to) where.nextFollowupDate.lte = new Date(to);
  }

  if (role === 'AGENT') {
    where.createdById = userId;
  } else if (role === 'MANAGER') {
    where.createdBy = { managerId: userId };
  } else if (role === 'SR_MANAGER') {
    where.createdBy = { srManagerId: userId };
  } else if (role === 'DIRECTOR') {
    where.createdBy = { directorId: userId };
  }

  if (agentId) {
    where.createdById = parseInt(agentId);
  }

  try {
    const followups = await prisma.followUp.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { nextFollowupDate: 'asc' }
    });

    const today = new Date();
    const enriched = followups.map(f => ({
      ...f,
      statusBadge: f.status === 'DONE' ? '✅ Done'
        : new Date(f.nextFollowupDate) < today ? '⚠️ Overdue'
        : '🕒 Upcoming'
    }));

    res.json(enriched);
  } catch (err) {
    console.error("❌ Failed to fetch follow-ups:", err);
    res.status(500).json({ message: "Failed to get follow-ups" });
  }
};

// 🔄 Toggle status between PENDING and DONE
exports.toggleFollowupStatus = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user?.userId;
  try {
    const existing = await prisma.followUp.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Follow-up not found" });

    const newStatus = existing.status === "DONE" ? "PENDING" : "DONE";
    const updated = await prisma.followUp.update({
      where: { id },
      data: { status: newStatus }
    });

    await prisma.followUpLog.create({
      data: {
        followUpId: id,
        action: `Status changed to ${newStatus}`,
        userId
      }
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to toggle follow-up status:", err);
    res.status(500).json({ message: "Toggle failed" });
  }
};

// ✏️ Update follow-up
exports.updateFollowup = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user?.userId;
  try {
    const updated = await prisma.followUp.update({
      where: { id },
      data: req.body
    });

    await prisma.followUpLog.create({
      data: {
        followUpId: id,
        action: `Updated follow-up`,
        userId
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
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("❌ Failed to delete follow-up:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
