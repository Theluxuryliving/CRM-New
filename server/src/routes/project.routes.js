// server/src/routes/project.routes.js
const express = require("express");
const router = express.Router();

// ✅ Correct Prisma import
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });
    res.json(projects);
  } catch (err) {
    console.error("❌ Failed to fetch projects:", err);
    res.status(500).json({ message: "Failed to load projects" });
  }
});

module.exports = router;
