// 📁 server/src/controllers/followup.controller.js
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

    // Log creation for audit with default status 'PENDING'
    await prisma.followUpLog.create({
      data: {
        followupId: followup.id,
        status: 'PENDING',
        updatedById: userId
      }
    });

    res.status(201).json(followup);
  } catch (err) {
    console.error("❌ Follow-up creation failed:", err);
    res.status(500).json({ message: "Failed to create follow-up" });
  }
};